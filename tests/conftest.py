"""Test-suite floor for the Dev Fleet app.

The suite is Kiro Crew's own Dev Fleet tests, moved here with the app. In Kiro
Crew they ran under that repository's conftest floor; this file restates the part
of that floor they rely on:

* **Data home and HOME.** Kiro Crew (a pinned test dependency, see
  ``tests/requirements.txt``) resolves its data home from ``KIROCREW_HOME`` and
  per-user paths from ``HOME``. Both are pointed at a throwaway directory BEFORE
  anything imports Kiro Crew, so no test reads or writes the operator's real
  ``~/.kiro/crew`` or home.
* **Git.** Git's auto maintenance is turned off for every git a test starts, and
  a fixed identity is set through the environment, so a commit works on a runner
  with no account identity (``git_maintenance_helpers.py``).
* **Imports.** The helper modules beside the tests are imported by name, and the
  app's ``backend`` package from the repository root, as the gateway's backend
  launcher (``backend/launch.py``) imports it.
"""

from __future__ import annotations

import os
import shutil
import sys
import tempfile
from collections.abc import Iterator
from pathlib import Path

import pytest

TESTS = Path(__file__).resolve().parent
ROOT = TESTS.parent
for _p in (str(TESTS), str(ROOT)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

_SESSION_HOME = Path(tempfile.mkdtemp(prefix="kca-dev-fleet-home-"))
(_SESSION_HOME / "home").mkdir()
os.environ["HOME"] = str(_SESSION_HOME / "home")
os.environ["USERPROFILE"] = str(_SESSION_HOME / "home")
os.environ["KIROCREW_HOME"] = str(_SESSION_HOME / "crew")
# Repository discovery must not find the checkout this suite happens to run in.
os.environ.pop("KIROCREW_DEVFLEET_REPO", None)
os.environ.pop("KIROCREW_PROJECT_DIR", None)

from git_maintenance_helpers import git_global_config_text  # noqa: E402

_GIT_GLOBAL = _SESSION_HOME / "gitconfig"
_GIT_GLOBAL.write_text(git_global_config_text(), encoding="utf-8")
os.environ["GIT_CONFIG_GLOBAL"] = str(_GIT_GLOBAL)
os.environ["GIT_CONFIG_NOSYSTEM"] = "1"
for _k, _v in (
    ("GIT_AUTHOR_NAME", "Dev Fleet Tests"),
    ("GIT_AUTHOR_EMAIL", "dev-fleet-tests@example.invalid"),
    ("GIT_COMMITTER_NAME", "Dev Fleet Tests"),
    ("GIT_COMMITTER_EMAIL", "dev-fleet-tests@example.invalid"),
):
    os.environ[_k] = _v

# Kiro Crew's test tree exposes this helper from its conftest; the moved tests
# import it from there by name.
from kiro_crew.testing.links import make_dir_link  # noqa: E402,F401

# The host-service floor (no real systemctl/launchctl/schtasks mutation, no
# systemd user session for the test process tree), as Kiro Crew's suite has it.
from host_service_floor import (  # noqa: E402,F401
    _block_host_service_mutation,
    _fail_on_refused_real_reclaim_write,
    _no_real_cgroup_reclaim_write,
    _no_systemd_user_session,
    real_user_session,
)


def pytest_unconfigure(config: pytest.Config) -> None:
    shutil.rmtree(_SESSION_HOME, ignore_errors=True)


@pytest.fixture(autouse=True, scope="session")
def _per_run_temp_base(tmp_path_factory: pytest.TempPathFactory) -> Iterator[Path]:
    """Give each pytest process (each xdist worker) its own temp root.

    Kiro Crew's rootdir conftest does the same. The sync tests stage snapshots
    under the temp root and ``_sweep_staged_sync_tempdirs`` removes the ones a
    test left behind; with one shared root a worker's sweep deletes another
    worker's staging mid-write. pytest's ``basetemp`` is resolved first so it
    stays outside this root, which is removed at the end.
    """
    tmp_path_factory.getbasetemp()
    previous_tempdir = tempfile.tempdir
    names = ("TMPDIR", "TEMP", "TMP")
    previous_env = {name: os.environ.get(name) for name in names}
    base = Path(tempfile.mkdtemp(prefix=f"kc-df-{os.getpid()}-"))
    tempfile.tempdir = str(base)
    for name in names:
        os.environ[name] = str(base)
    try:
        yield base
    finally:
        tempfile.tempdir = previous_tempdir
        for name, value in previous_env.items():
            if value is None:
                os.environ.pop(name, None)
            else:
                os.environ[name] = value
        shutil.rmtree(base, ignore_errors=True)


@pytest.fixture
def _floor_monkeypatch() -> Iterator[pytest.MonkeyPatch]:
    """The floor's OWN ``MonkeyPatch``, never the shared ``monkeypatch``.

    As in Kiro Crew's rootdir conftest: a test that calls ``monkeypatch.undo()``
    mid-way must not also drop the floor's data-home pin, so the floor patches
    through an instance of its own, undone after the test's.
    """
    mp = pytest.MonkeyPatch()
    yield mp
    mp.undo()


@pytest.fixture(scope="session")
def _xdg_config_root(tmp_path_factory: pytest.TempPathFactory) -> Path:
    return tmp_path_factory.mktemp("xdg")


@pytest.fixture(autouse=True)
def _isolate_xdg_and_launchd(_xdg_config_root: Path, _floor_monkeypatch: pytest.MonkeyPatch) -> None:
    """No test writes a real systemd drop-in or launchd agent.

    Kiro Crew's ``test/conftest_floor_seams.py``: the Make Live drop-in resolves
    under ``$XDG_CONFIG_HOME`` (falling back to ``~/.config``), and the launchd
    paths are module globals bound from ``Path.home()`` at import, so both are
    pinned under a session temp directory, the backend's own copies included.
    """
    import importlib

    _floor_monkeypatch.setenv("XDG_CONFIG_HOME", str(_xdg_config_root))
    root = _xdg_config_root / "launchd"
    launcher = root / "live-gateway"
    plist_dir = root / "LaunchAgents"
    plist_path = plist_dir / "dev.kirocrew.gateway.plist"
    log_dir = root / "Logs"
    eager: dict[str, dict[str, object]] = {
        "kiro_crew.service.macos": {
            "PLIST_DIR": plist_dir,
            "PLIST_PATH": plist_path,
            "LOG_DIR": log_dir,
            "STDOUT_LOG": log_dir / "gateway.log",
            "STDERR_LOG": log_dir / "gateway.err",
            "LIVE_PROGRAM": launcher,
        },
        "kiro_crew.service.common": {"launchd_live_program": lambda: launcher},
    }
    for name, attrs in eager.items():
        try:
            module = importlib.import_module(name)
        except Exception:  # noqa: BLE001 - a missing module must not break collection
            continue
        for attr, value in attrs.items():
            _floor_monkeypatch.setattr(module, attr, value, raising=False)
    gateway_service = sys.modules.get("backend.gateway_service")
    if gateway_service is not None:
        _floor_monkeypatch.setattr(gateway_service, "PLIST_PATH", plist_path, raising=False)
        _floor_monkeypatch.setattr(
            gateway_service, "launchd_live_program", lambda: launcher, raising=False
        )


@pytest.fixture(autouse=True)
def _isolated_data_home(tmp_path: Path, _floor_monkeypatch: pytest.MonkeyPatch) -> None:
    """A fresh data home per test, so no test sees another's app records."""
    home = tmp_path / "_crew_home"
    home.mkdir()
    _floor_monkeypatch.setenv("KIROCREW_HOME", str(home))


@pytest.fixture
def nonbundled_python_without_user_site(monkeypatch: pytest.MonkeyPatch) -> None:
    """Model a non-bundled venv whose user site is already unavailable."""
    import site

    from kiro_crew import platform_compat

    monkeypatch.setattr(site, "ENABLE_USER_SITE", False)
    monkeypatch.setattr(platform_compat, "is_bundled_interpreter", lambda: False)


# Per-test resets of process-global Kiro Crew state the moved tests drive. Each is
# Kiro Crew's own floor fixture (``test/conftest_resets.py``), restated here.


@pytest.fixture(autouse=True)
def _fresh_reexec_environment(_floor_monkeypatch: pytest.MonkeyPatch) -> None:
    """Start every test with nothing kept for an exec successor.

    Consuming the managed-service launch marker keeps it for the gateway's own exec
    restart, and ``launched_as_managed_service`` reads it there; a value one test
    consumed must not make a later test's gateway read as service-launched.
    """
    from kiro_crew import platform_compat, platform_compat_runtime

    fresh: dict[str, str] = {}
    _floor_monkeypatch.setattr(platform_compat, "_KEPT_FOR_REEXEC", fresh)
    _floor_monkeypatch.setattr(platform_compat_runtime, "_KEPT_FOR_REEXEC", fresh)


@pytest.fixture(autouse=True)
def _drop_live_config_snapshot() -> Iterator[None]:
    """Give every test an unstarted config watcher, and leave none behind."""
    from kiro_crew.config import live

    live.reset_for_tests()
    yield
    live.reset_for_tests()


@pytest.fixture(autouse=True)
def _forget_sandbox_launch_mark() -> Iterator[None]:
    """Forget that an entry point saw the sandbox marker."""
    from kiro_crew import sandbox_launch_mark

    sandbox_launch_mark._launched_in_sandbox = False
    yield
    sandbox_launch_mark._launched_in_sandbox = False


@pytest.fixture(autouse=True)
def _disable_dev_fleet_background_tasks(_floor_monkeypatch: pytest.MonkeyPatch) -> None:
    """Stop the backend's app-startup hook from starting its background loops.

    A test that boots the real app via ``server.create_app()`` otherwise starts
    ``_status_refresher``, a genuine network ``git fetch``, as a fire-and-forget
    task that can outlive the test. A test that wants the real refresher overrides
    ``worktree_ops._background_tasks_disabled`` itself.
    """
    _floor_monkeypatch.setenv("KIROCREW_DEVFLEET_NO_BACKGROUND", "1")


@pytest.fixture(autouse=True)
def _no_developer_overrides(_floor_monkeypatch: pytest.MonkeyPatch) -> None:
    """Keep a developer's restart timeout, proxy and managed-venv variables out."""
    from kiro_crew.apps.registry_pipeline.subprocess_env import _GIT_PROXY_ENV_KEYS

    for key in (
        "KIROCREW_RESTART_READY_TIMEOUT",
        "KIROCREW_VENV",
        *_GIT_PROXY_ENV_KEYS,
        "NO_PROXY",
        "no_proxy",
    ):
        _floor_monkeypatch.delenv(key, raising=False)


_WINDOWS_IGNORED = frozenset(
    name
    for name in (
        line.split("#", 1)[0].strip()
        for line in (TESTS / "windows-collect-ignore.txt").read_text(encoding="utf-8").splitlines()
    )
    if name
)


def pytest_ignore_collect(collection_path: Path, config: pytest.Config) -> bool | None:
    """On Windows, skip the files ``windows-collect-ignore.txt`` lists, as Kiro Crew does."""
    if sys.platform == "win32" and collection_path.name in _WINDOWS_IGNORED:
        return True
    return None
