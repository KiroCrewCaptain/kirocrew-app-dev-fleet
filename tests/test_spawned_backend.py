"""The backend the way the gateway starts it: ``python -s backend/launch.py``.

The gateway runs an installed app's file entry point as a script with the app root
as its working directory (``apps/backend.py``, the plain-Python branch), not as the
``backend`` package the other tests import. This starts it that way, on a loopback
port, and checks that it serves the unsigned liveness probe and refuses an unsigned
fleet read, and that each module loaded once, as ``backend.<name>``.
"""

from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import pytest

import kiro_crew

APP_ROOT = Path(__file__).resolve().parents[1]


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        probe.bind(("127.0.0.1", 0))
        return probe.getsockname()[1]


def _get(port: int, path: str) -> tuple[int, dict]:
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}{path}", timeout=5) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as err:
        return err.code, json.loads(err.read().decode("utf-8") or "{}")


def test_the_launcher_serves_health_and_refuses_unsigned(tmp_path):
    port = _free_port()
    env = {k: v for k, v in os.environ.items() if not k.startswith(("KIROCREW_", "PYTHON"))}
    env.update(
        PORT=str(port),
        KIROCREW_HOME=str(tmp_path / "home"),
        KIROCREW_DEVFLEET_NO_BACKGROUND="1",
        # Where Kiro Crew is importable from: the gateway's own interpreter has it
        # installed; this suite may run it from a source tree instead.
        PYTHONPATH=str(Path(kiro_crew.__file__).resolve().parents[1]),
    )
    proc = subprocess.Popen(
        [sys.executable, "-s", str(APP_ROOT / "backend" / "launch.py")],
        cwd=str(APP_ROOT),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    try:
        deadline = time.monotonic() + 60
        health = None
        while time.monotonic() < deadline:
            if proc.poll() is not None:
                out = proc.stdout.read().decode("utf-8", "replace") if proc.stdout else ""
                pytest.fail(f"backend exited with {proc.returncode}: {out}")
            try:
                health = _get(port, "/health")
                break
            except (urllib.error.URLError, ConnectionError, OSError):
                time.sleep(0.1)  # flake-ok: polling a child process's listener
        assert health is not None, "the backend never answered /health"
        code, payload = health
        assert code == 200
        assert payload["status"] == "ok"
        code, _ = _get(port, "/api/fleet")
        assert code in (401, 403)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait(timeout=10)
        if proc.stdout:
            proc.stdout.close()


def test_the_launcher_imports_each_module_once_as_the_package():
    sys.path.insert(0, str(APP_ROOT / "backend"))
    try:
        import importlib

        launch = importlib.import_module("launch")
        path = launch._import_path([str(APP_ROOT / "backend"), "", "/x", str(APP_ROOT)])
    finally:
        sys.path.remove(str(APP_ROOT / "backend"))
        sys.modules.pop("launch", None)
    assert path[0] == str(APP_ROOT)
    assert str(APP_ROOT / "backend") not in path
    assert path.count(str(APP_ROOT)) == 1
    assert "/x" in path
