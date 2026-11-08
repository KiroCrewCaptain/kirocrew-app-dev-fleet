"""What an existing user's copy of the built-in needs from this repository.

Kiro Crew adopts a user's built-in record onto this repository in place, at a
pinned commit, so the tree must be something it can take over unchanged:

- the same name, permissions, platform, ``defaultEnabled`` and skills as the
  built-in (``tests/fixtures/builtin-app.json`` is its manifest at the commit this
  was ported from), and a version never below its. Adoption refuses a manifest
  that would widen a grant;
- a FILE-style ``backend.entryPoint`` inside the tree: the built-in's module-style
  entry (``kiro_crew.apps.builtins.dev_fleet.server``) resolves only inside the
  Kiro Crew package;
- the in-gateway routes as ``backend.hooks.routes``, a ``module:callable`` inside
  the tree;
- the bundled skills byte for byte (``tests/fixtures/builtin-skills.sha256``), so
  an agent that uses ``pod-e2e`` or ``feature-demo-recording`` reads what it read;
- no symlinks or file names a Windows checkout cannot hold, and no hardcoded
  model id.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
from pathlib import Path

APP_ROOT = Path(__file__).resolve().parents[1]
FIXTURES = APP_ROOT / "tests" / "fixtures"

_UNTRACKED_DIRS = {".git", "node_modules", "__pycache__", ".pytest_cache", ".venv"}
_WINDOWS_RESERVED = re.compile(r"^(con|prn|aux|nul|com[1-9]|lpt[1-9])$", re.IGNORECASE)
_MODEL_ID = re.compile(r"\b(claude-|opus|sonnet|haiku|gpt-|fable)[\w.-]*", re.IGNORECASE)


def _manifest() -> dict:
    return json.loads((APP_ROOT / "app.json").read_text(encoding="utf-8"))


def _builtin() -> dict:
    return json.loads((FIXTURES / "builtin-app.json").read_text(encoding="utf-8"))


def _version(v: str) -> tuple[int, ...]:
    return tuple(int(p) for p in v.split("."))


def test_identity_and_grants_match_the_builtin():
    m, b = _manifest(), _builtin()
    assert m["name"] == b["name"] == "dev-fleet"
    assert _version(m["version"]) >= _version(b["version"])
    assert m["permissions"] == b["permissions"]
    assert m["platform"] == b["platform"]
    assert m["defaultEnabled"] == b["defaultEnabled"] is False
    assert m["skills"] == b["skills"]
    for key in ("displayName", "description", "author", "tags", "highlights", "useCases", "configuration"):
        assert m[key] == b[key], key


def test_backend_entry_and_hooks_resolve_inside_the_tree():
    backend = _manifest()["backend"]
    entry = APP_ROOT / backend["entryPoint"]
    assert entry.is_file() and entry.resolve().is_relative_to(APP_ROOT)
    assert backend["port"] == "auto" and backend["healthCheck"] == "/health"
    module, _, func = backend["hooks"]["routes"].partition(":")
    hook_file = APP_ROOT / (module.replace(".", "/") + ".py")
    assert hook_file.is_file()
    assert f"def {func}(" in hook_file.read_text(encoding="utf-8")


def test_minimum_host_is_declared():
    assert _version(_manifest()["minKiroCrewVersion"]) >= (0, 12, 0)


def test_art_is_repo_relative_and_present():
    m = _manifest()
    for key in ("iconPath", "heroImage", "heroImageDark", "heroImageDetail", "heroImageDetailDark"):
        assert (APP_ROOT / m[key]).is_file(), key
    for shot in m["screenshots"]:
        assert (APP_ROOT / shot).is_file(), shot


def test_bundled_skills_are_the_builtins_byte_for_byte():
    expected = {}
    for line in (FIXTURES / "builtin-skills.sha256").read_text(encoding="utf-8").splitlines():
        digest, name = line.split(maxsplit=1)
        expected[name.removeprefix("./")] = digest
    skills = APP_ROOT / "skills"
    # Compared with line endings normalized, so a Windows checkout with autocrlf passes.
    actual = {
        p.relative_to(skills).as_posix(): hashlib.sha256(p.read_bytes().replace(b"\r\n", b"\n")).hexdigest()
        for p in skills.rglob("*")
        if p.is_file() and "__pycache__" not in p.parts
    }
    assert actual == expected


def test_tree_is_cloneable_everywhere():
    for dirpath, dirnames, filenames in os.walk(APP_ROOT):
        dirnames[:] = [d for d in dirnames if d not in _UNTRACKED_DIRS]
        for name in dirnames + filenames:
            path = Path(dirpath) / name
            assert not path.is_symlink(), path
            assert not _WINDOWS_RESERVED.match(name.split(".")[0]), path
            assert not any(c in name for c in '<>:"|?*'), path


def test_no_hardcoded_model_id():
    for path in [APP_ROOT / "app.json", *(APP_ROOT / "skills").rglob("*.json")]:
        assert not _MODEL_ID.search(path.read_text(encoding="utf-8")), path


# --- the committed UI bundle -------------------------------------------------

BUNDLE = APP_ROOT / "ui" / "dist" / "index.mjs"

HOST_MODULES = {
    "react",
    "react-dom",
    "react/jsx-runtime",
    "lucide-react",
    "@tanstack/react-query",
    "@kirocrew/app-sdk",
    "@kirocrew/app-sdk/ui",
}

#: What a host BEFORE App Kit level 1 exports from each SDK module. A named import
#: outside this set fails the whole bundle at load on such a host.
LEVEL0_EXPORTS = {
    "@kirocrew/app-sdk": {
        "useAppApi", "useAppEvents", "useTheme", "useAppInfo", "useNavigate", "useNotify",
        "useNavBadge", "useChatLauncher", "AppApiProvider", "useImeGuard",
        "useLanguageGeneration", "activeLocale", "fmtNumber", "fmtDate", "fmtTime",
        "fmtDateTime", "fmtRelative", "compareText",
    },
    "@kirocrew/app-sdk/ui": {
        "Card", "CardTitle", "Btn", "SendBtn", "Input", "SearchInput", "Badge", "SourceBadge",
        "StatCard", "Skeleton", "ContentSkeleton", "EmptyState", "PageHeader", "Toggle",
        "InfoTip", "SegmentedControl", "MarkdownRenderer", "Clickable", "Modal",
        "ErrorNotice", "SettingsSection", "SettingsCard", "SettingsInput", "SettingsToggle",
        "SettingsSelect",
    },
}

_STATIC_IMPORT = re.compile(
    r"^import\s+(?:(?P<clause>[^'\"]+?)\s+from\s+)?[\"'](?P<spec>[^\"']+)[\"'];?\s*$",
    re.MULTILINE,
)


def _bundle_text() -> str:
    return BUNDLE.read_text(encoding="utf-8")


def _bundle_imports() -> list[tuple[str, str]]:
    return [(m["spec"], (m["clause"] or "").strip()) for m in _STATIC_IMPORT.finditer(_bundle_text())]


def _named(clause: str) -> set[str]:
    match = re.search(r"\{([^}]*)\}", clause)
    if not match:
        return set()
    return {part.split(" as ")[0].strip() for part in match.group(1).split(",") if part.strip()}


def test_the_entry_the_manifest_names_is_committed():
    assert _manifest()["ui"]["entry"] == "dist/index.mjs"
    assert BUNDLE.is_file(), "run `npm run build` in ui/"


def test_the_bundle_imports_only_what_the_host_provides():
    imports = _bundle_imports()
    assert imports, "no import statements found; the scan is broken"
    assert len(re.findall(r"^import\b", _bundle_text(), re.MULTILINE)) == len(imports)
    assert {spec for spec, _ in imports} <= HOST_MODULES
    assert not re.search(r"\bimport\s*\(", _bundle_text()), "a dynamic import would load a second file"
    for spec, clause in imports:
        if spec in LEVEL0_EXPORTS:
            assert _named(clause) <= LEVEL0_EXPORTS[spec], spec


def test_the_bundle_keeps_the_builtins_session_storage_key():
    """A dismissed Switch-back banner stays dismissed across the move."""
    assert '"kc-dev-fleet-undo-dismissed"' in _bundle_text()


def test_no_build_machine_path_is_baked_in():
    text = _bundle_text()
    assert str(APP_ROOT) not in text
    assert "node_modules/" not in text


def test_the_page_reaches_the_gateway_routes_outside_the_grant():
    """Pinned gap (PORTING.md): three page actions call the GATEWAY's routes.

    Make live, Restart gateway and Open (pod token) POST to ``/api/apps/dev-fleet/``,
    and the backend-down banner reads ``/api/apps``. The built-in's
    ``permissions.api`` covers only ``/apps/dev-fleet/api``, so the host's scoped
    client refuses all four. Declaring them would widen the grant, which adoption
    holds back. When the grant question is settled, this test changes with it.
    """
    declared = _manifest()["permissions"]["api"]
    for path in ("/api/apps/dev-fleet/make-live", "/api/apps/dev-fleet/restart-gateway",
                 "/api/apps/dev-fleet/pod-token", "/api/apps"):
        assert not any(path == d or path.startswith(d.rstrip("*").rstrip("/") + "/") for d in declared), path
    text = _bundle_text()
    assert '"/api/apps/dev-fleet"' in text
