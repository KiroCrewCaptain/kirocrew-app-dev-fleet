"""The redact-before-bound AST scan Kiro Crew's suite shares between its tests."""

from __future__ import annotations

import ast
from pathlib import Path


def _find_slice_before_redact_offenders(path: Path) -> list[str]:
    """AST scan: bounded char slices over DIRECT stderr/stdout expressions.

    A ``Subscript`` slice whose value expression mentions stderr/stdout is an
    offender unless the sliced value IS a redact call. Deliberate limits: a
    slice of a renamed local assigned from such an expression, or of a
    string-keyed subscript (``out["stderr"]``), is beyond this scan — the
    behavioral straddle tests carry those shapes. Numeric bounds under 10
    are ignored to keep the legitimate line-list idiom (``splitlines()[-1:]``)
    out of scope: a whole-line cut severs no secret, it is the CHAR slice that
    does. Copied from Kiro Crew's ``test/test_theme_clone_stderr_redact_before_bound.py``.
    """
    offenders: list[str] = []
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    for node in ast.walk(tree):
        if not isinstance(node, ast.Subscript) or not isinstance(node.slice, ast.Slice):
            continue
        bound = None
        for edge in (node.slice.lower, node.slice.upper):
            if isinstance(edge, ast.Constant) and isinstance(edge.value, int):
                bound = edge.value
            elif (
                isinstance(edge, ast.UnaryOp)
                and isinstance(edge.op, ast.USub)
                and isinstance(edge.operand, ast.Constant)
                and isinstance(edge.operand.value, int)
            ):
                bound = edge.operand.value
        if bound is None or bound < 10:
            continue
        mentioned = {n.id for n in ast.walk(node.value) if isinstance(n, ast.Name)}
        mentioned |= {a.attr for a in ast.walk(node.value) if isinstance(a, ast.Attribute)}
        if not any("stderr" in name or "stdout" in name for name in mentioned):
            continue
        value = node.value
        sanctioned = isinstance(value, ast.Call) and (
            (isinstance(value.func, ast.Name) and "redact" in value.func.id)
            or (isinstance(value.func, ast.Attribute) and "redact" in value.func.attr)
        )
        if not sanctioned:
            offenders.append(f"{path.name}:{node.lineno}")
    return offenders
