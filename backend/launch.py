"""The Dev Fleet backend process: ``backend.entryPoint``.

The gateway runs an installed app's file entry point as a script, so this file is
``__main__`` and has no package. The backend's modules import each other
relatively, as one package, so this launcher puts the app root (this file's parent
directory) on ``sys.path`` ahead of everything else, takes the script's own
directory OFF it (each sibling must load once, as ``backend.<name>``, never also as
a top-level module), and runs ``backend.server`` as the built-in's ``python -m``
entry ran it.
"""

from __future__ import annotations

import os
import runpy
import sys

_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
_APP_ROOT = os.path.dirname(_BACKEND_DIR)


def _import_path(path: list[str]) -> list[str]:
    kept = [p for p in path if os.path.abspath(p or os.curdir) != _BACKEND_DIR]
    return [_APP_ROOT, *[p for p in kept if os.path.abspath(p or os.curdir) != _APP_ROOT]]


if __name__ == "__main__":
    sys.path[:] = _import_path(sys.path)
    runpy.run_module("backend.server", run_name="__main__", alter_sys=True)
