#!/usr/bin/env python3
"""Evaluate Headroom simulation on allowlisted, sanitized tool-output samples."""

from __future__ import annotations

import argparse
import importlib.metadata
import json
import os
import platform
import sys
import tempfile
import time
from pathlib import Path
from typing import Any


DENIED_KINDS = {
    "approval_boundary",
    "contract",
    "diff",
    "exact_error",
    "hardware_evidence",
    "master_run",
    "mes_evidence",
    "production_evidence",
    "relay_capsule",
    "release_evidence",
    "security_evidence",
    "source_code",
}

ALLOWED_KINDS = {
    "build_log",
    "database_rows",
    "json_array",
    "rag_results",
    "search_results",
    "test_log",
    "verbose_text",
}

ISOLATED_ENV_KEYS = (
    "HEADROOM_CCR_BACKEND",
    "HEADROOM_CONFIG_DIR",
    "HEADROOM_STATELESS",
    "HEADROOM_WORKSPACE_DIR",
    "LITELLM_LOCAL_MODEL_COST_MAP",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run Headroom locally in simulation mode; never calls an LLM or changes Codex configuration."
    )
    parser.add_argument("input", type=Path, help="UTF-8 JSON evaluation specification")
    parser.add_argument("--output", type=Path, help="Optional UTF-8 JSON report path")
    return parser.parse_args()


def fail(message: str, exit_code: int = 2) -> int:
    print(json.dumps({"result": "BLOCKED", "error": message}, ensure_ascii=False, indent=2))
    return exit_code


def load_spec(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        spec = json.load(handle)
    if not isinstance(spec, dict):
        raise ValueError("top-level JSON value must be an object")
    cases = spec.get("cases")
    if not isinstance(cases, list) or not cases:
        raise ValueError("cases must be a non-empty array")
    return spec


def normalized_content(value: Any) -> str:
    if isinstance(value, str):
        return value
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def validate_case(case: Any, index: int) -> dict[str, Any]:
    if not isinstance(case, dict):
        raise ValueError(f"cases[{index}] must be an object")
    name = case.get("name")
    kind = case.get("kind")
    markers = case.get("critical_markers")
    if not isinstance(name, str) or not name.strip():
        raise ValueError(f"cases[{index}].name must be a non-empty string")
    if not isinstance(kind, str) or not kind.strip():
        raise ValueError(f"cases[{index}].kind must be a non-empty string")
    if kind in DENIED_KINDS:
        raise ValueError(f"case {name!r} uses denied kind {kind!r}")
    if kind not in ALLOWED_KINDS:
        raise ValueError(
            f"case {name!r} uses unknown kind {kind!r}; allowed kinds are {sorted(ALLOWED_KINDS)}"
        )
    if "content" not in case:
        raise ValueError(f"case {name!r} is missing content")
    if (
        not isinstance(markers, list)
        or not markers
        or any(not isinstance(item, str) or not item for item in markers)
    ):
        raise ValueError(
            f"case {name!r}.critical_markers must be a non-empty array of non-empty strings"
        )
    original_content = normalized_content(case["content"])
    missing_from_original = [marker for marker in markers if marker not in original_content]
    if missing_from_original:
        raise ValueError(
            f"case {name!r} declares markers absent from original content: {missing_from_original}"
        )
    return case


def build_messages(case: dict[str, Any], index: int) -> list[dict[str, Any]]:
    call_id = f"offline_eval_{index}"
    query = case.get("query", "Inspect this tool output and retain anomalies and critical facts.")
    if not isinstance(query, str) or not query:
        raise ValueError(f"case {case['name']!r}.query must be a non-empty string")
    return [
        {"role": "user", "content": query},
        {
            "role": "assistant",
            "content": "",
            "tool_calls": [
                {
                    "id": call_id,
                    "type": "function",
                    "function": {"name": "offline_sample", "arguments": "{}"},
                }
            ],
        },
        {"role": "tool", "tool_call_id": call_id, "content": normalized_content(case["content"])},
    ]


def tool_pairs_intact(messages: Any) -> bool:
    if not isinstance(messages, list):
        return False
    declared_ids: set[str] = set()
    completed_ids: set[str] = set()
    for message in messages:
        if not isinstance(message, dict):
            return False
        for tool_call in message.get("tool_calls", []) or []:
            if not isinstance(tool_call, dict) or not isinstance(tool_call.get("id"), str):
                return False
            call_id = tool_call["id"]
            if call_id in declared_ids:
                return False
            declared_ids.add(call_id)
        if message.get("role") == "tool":
            call_id = message.get("tool_call_id")
            if not isinstance(call_id, str):
                return False
            if call_id not in declared_ids or call_id in completed_ids:
                return False
            completed_ids.add(call_id)
    return bool(declared_ids) and completed_ids == declared_ids


def optimized_tool_content(messages: Any, call_id: str) -> str | None:
    if not isinstance(messages, list):
        return None
    matches = [
        message
        for message in messages
        if isinstance(message, dict)
        and message.get("role") == "tool"
        and message.get("tool_call_id") == call_id
    ]
    if len(matches) != 1 or "content" not in matches[0]:
        return None
    return normalized_content(matches[0]["content"])


def set_isolated_environment(temp_root: str) -> dict[str, str | None]:
    root = Path(temp_root)
    config_dir = root / "config"
    workspace_dir = root / "workspace"
    config_dir.mkdir(parents=True, exist_ok=True)
    workspace_dir.mkdir(parents=True, exist_ok=True)
    previous = {
        key: value for key, value in os.environ.items() if key.upper().startswith("HEADROOM_")
    }
    previous["LITELLM_LOCAL_MODEL_COST_MAP"] = os.environ.get(
        "LITELLM_LOCAL_MODEL_COST_MAP"
    )
    for key in list(os.environ):
        if key.upper().startswith("HEADROOM_"):
            os.environ.pop(key, None)
    os.environ["HEADROOM_CCR_BACKEND"] = "memory"
    os.environ["HEADROOM_CONFIG_DIR"] = str(config_dir)
    os.environ["HEADROOM_STATELESS"] = "1"
    os.environ["HEADROOM_WORKSPACE_DIR"] = str(workspace_dir)
    os.environ["LITELLM_LOCAL_MODEL_COST_MAP"] = "True"
    return previous


def restore_environment(previous: dict[str, str | None]) -> None:
    for key in list(os.environ):
        if key.upper().startswith("HEADROOM_"):
            os.environ.pop(key, None)
    for key, value in previous.items():
        if value is None:
            os.environ.pop(key, None)
        else:
            os.environ[key] = value


def main() -> int:
    args = parse_args()
    try:
        spec = load_spec(args.input)
        cases = [validate_case(case, index) for index, case in enumerate(spec["cases"])]
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        return fail(f"invalid evaluation specification: {exc}")

    minimum_savings = spec.get("minimum_weighted_savings_percent", 15.0)
    if (
        isinstance(minimum_savings, bool)
        or not isinstance(minimum_savings, (int, float))
        or not 0 <= minimum_savings <= 100
    ):
        return fail("minimum_weighted_savings_percent must be a number from 0 to 100")
    model = spec.get("model", "gpt-4o")
    if not isinstance(model, str) or not model:
        return fail("model must be a non-empty string")
    if sys.prefix == sys.base_prefix:
        return fail("an isolated virtual environment is required for Headroom simulation")

    reports: list[dict[str, Any]] = []
    total_before = 0
    total_after = 0
    total_marker_count = 0
    missing_marker_count = 0
    package_error_count = 0
    broken_pair_count = 0

    with tempfile.TemporaryDirectory(prefix="headroom-offline-eval-") as temp_root:
        previous_environment = set_isolated_environment(temp_root)
        try:
            try:
                from headroom import HeadroomClient, OpenAIProvider, SmartCrusher
            except ImportError as exc:
                return fail(
                    "Headroom compression preflight failed; install headroom-ai and its runtime "
                    f"dependencies in the isolated environment: {exc}"
                )
            try:
                SmartCrusher()
            except Exception as exc:
                return fail(
                    f"Headroom SmartCrusher preflight failed: {type(exc).__name__}: {exc}", 1
                )

            database_path = (Path(temp_root) / "metrics.db").as_posix()
            store_url = f"sqlite://{database_path}"
            try:
                client = HeadroomClient(
                    original_client=object(),
                    provider=OpenAIProvider(),
                    store_url=store_url,
                    default_mode="optimize",
                )
            except Exception as exc:
                return fail(
                    f"Headroom client initialization failed: {type(exc).__name__}: {exc}", 1
                )

            try:
                with client:
                    for index, case in enumerate(cases):
                        messages = build_messages(case, index)
                        call_id = f"offline_eval_{index}"
                        try:
                            started_at = time.perf_counter()
                            plan = client.chat.completions.simulate(model=model, messages=messages)
                            elapsed_ms = (time.perf_counter() - started_at) * 1000.0
                            tool_content = optimized_tool_content(plan.messages_optimized, call_id)
                            missing_markers = (
                                list(case["critical_markers"])
                                if tool_content is None
                                else [
                                    marker
                                    for marker in case["critical_markers"]
                                    if marker not in tool_content
                                ]
                            )
                            pairs_ok = tool_pairs_intact(plan.messages_optimized)
                            before = int(plan.tokens_before)
                            after = int(plan.tokens_after)
                            saved = int(plan.tokens_saved)
                            savings_percent = (saved / before * 100.0) if before else 0.0
                            total_before += before
                            total_after += after
                            total_marker_count += len(case["critical_markers"])
                            missing_marker_count += len(missing_markers)
                            broken_pair_count += 0 if pairs_ok else 1
                            reports.append(
                                {
                                    "name": case["name"],
                                    "kind": case["kind"],
                                    "tokens_before": before,
                                    "tokens_after": after,
                                    "tokens_saved": saved,
                                    "savings_percent": round(savings_percent, 2),
                                    "critical_markers": len(case["critical_markers"]),
                                    "missing_markers": missing_markers,
                                    "optimized_tool_output_found": tool_content is not None,
                                    "tool_pairs_intact": pairs_ok,
                                    "latency_ms": round(elapsed_ms, 2),
                                    "transforms": list(plan.transforms),
                                    "result": (
                                        "FAIL_MARKER_OR_TOOL_PAIR"
                                        if missing_markers or not pairs_ok
                                        else "PASS_INTEGRITY_NO_SAVINGS"
                                        if saved == 0
                                        else "PASS"
                                    ),
                                }
                            )
                        except Exception as exc:
                            package_error_count += 1
                            reports.append(
                                {
                                    "name": case["name"],
                                    "kind": case["kind"],
                                    "result": "ERROR",
                                    "error": f"{type(exc).__name__}: {exc}",
                                }
                            )
            except Exception as exc:
                return fail(f"Headroom client lifecycle failed: {type(exc).__name__}: {exc}", 1)
        finally:
            restore_environment(previous_environment)

    weighted_savings = ((total_before - total_after) / total_before * 100.0) if total_before else 0.0
    passed = (
        package_error_count == 0
        and missing_marker_count == 0
        and broken_pair_count == 0
        and total_before > 0
        and weighted_savings >= float(minimum_savings)
    )
    marker_recall = (
        (total_marker_count - missing_marker_count) / total_marker_count * 100.0
        if total_marker_count
        else 100.0
    )
    report = {
        "result": "PASS" if passed else "FAIL",
        "scope": "offline_simulation_only",
        "headroom_version": importlib.metadata.version("headroom-ai"),
        "python_version": platform.python_version(),
        "python_implementation": platform.python_implementation(),
        "operating_system": platform.system(),
        "machine": platform.machine(),
        "virtual_environment": sys.prefix != sys.base_prefix,
        "headroom_environment_policy": "clean_allowlist",
        "environment_isolation": list(ISOLATED_ENV_KEYS),
        "ccr_backend": "memory",
        "store_url_strategy": "explicit_windows_safe_sqlite_url",
        "model_for_tokenization": model,
        "minimum_weighted_savings_percent": float(minimum_savings),
        "weighted_savings_percent": round(weighted_savings, 2),
        "tokens_before": total_before,
        "tokens_after": total_after,
        "critical_marker_recall_percent": round(marker_recall, 2),
        "broken_tool_pairs": broken_pair_count,
        "package_errors": package_error_count,
        "cases": reports,
    }
    rendered = json.dumps(report, ensure_ascii=False, indent=2)
    print(rendered)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered + "\n", encoding="utf-8")
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
