#!/usr/bin/env python3
"""Build the fictional checkout the README's pictures show.

Dev Fleet manages the git worktrees of a Kiro Crew source checkout, so a capture
needs one. This writes a small, invented one: a primary checkout with the three markers the app tests for
(``.git``, ``src/kiro_crew/``, ``pyproject.toml``), four feature worktrees with
made-up branch names, one of them already merged into ``main`` (with no pull
request, so Prune still keeps it) and one holding an untracked scratch file. It lives under the system temp directory
(``kca-dev-fleet-fixture``), outside this repository, so installing the app from
this checkout does not copy it; ``scenes.json`` names it as ``{{fixture_root}}``.
No remote, so no pull-request state is shown. Every name and every author is
fictional (``example.invalid``).

    python capture/make_fixture.py          # then: python capture/capture.py ...

Standard library and ``git`` only. Rebuilds the fixture from scratch each run.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(tempfile.gettempdir()) / "kca-dev-fleet-fixture"
MAIN = ROOT / "kiro-crew"
WORKTREES = ROOT / "worktrees"

_ENV = {
    **{k: v for k, v in os.environ.items() if not k.startswith("GIT_")},
    "GIT_CONFIG_GLOBAL": os.devnull,
    "GIT_CONFIG_NOSYSTEM": "1",
    "GIT_AUTHOR_NAME": "Ada Example",
    "GIT_AUTHOR_EMAIL": "ada@example.invalid",
    "GIT_COMMITTER_NAME": "Ada Example",
    "GIT_COMMITTER_EMAIL": "ada@example.invalid",
}


def git(cwd: Path, *args: str, when: str | None = None) -> None:
    env = dict(_ENV)
    if when:
        env["GIT_AUTHOR_DATE"] = env["GIT_COMMITTER_DATE"] = when
    subprocess.run(["git", "-c", "maintenance.auto=false", *args], cwd=cwd, env=env, check=True,
                   stdout=subprocess.DEVNULL)


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8", newline="\n") as fh:
        fh.write(text)


def worktree(branch: str, name: str, commits: int) -> Path:
    path = WORKTREES / name
    git(MAIN, "worktree", "add", "-q", "-b", branch, str(path), "main")
    for i in range(1, commits + 1):
        write(path / "notes" / f"{name}.md", f"{name}: step {i}\n")
        git(path, "add", "-A")
        git(path, "commit", "-q", "-m", f"feat: {name} step {i}")
    return path


def main() -> None:
    shutil.rmtree(ROOT, ignore_errors=True)
    MAIN.mkdir(parents=True)
    git(MAIN, "init", "-q", "-b", "main")
    write(MAIN / "src" / "kiro_crew" / "__init__.py", '__version__ = "0.0.0"\n')
    write(MAIN / "pyproject.toml", '[project]\nname = "kirocrew-demo"\nversion = "0.0.0"\n')
    write(MAIN / "README.md", "# Demo checkout\n\nA fictional checkout for the Dev Fleet README.\n")
    git(MAIN, "add", "-A")
    git(MAIN, "commit", "-q", "-m", "chore: start the demo checkout", when="2026-10-20T10:00:00Z")
    for day in (21, 22, 23):
        write(MAIN / "README.md", f"Note {day}.\n")
        git(MAIN, "commit", "-q", "-am", f"docs: note {day}", when=f"2026-10-{day}T10:00:00Z")

    worktree("feat/calendar-sync", "calendar-sync", 3)
    worktree("fix/login-timeout", "login-timeout", 1)
    charts = worktree("feat/dark-charts", "dark-charts", 5)
    write(charts / "scratch.txt", "an untracked scratch file\n")
    shipped = worktree("docs/release-notes", "release-notes", 2)
    # Merged: main fast-forwards onto it, so Prune merged offers it.
    git(MAIN, "merge", "-q", "--ff-only", "docs/release-notes")
    del shipped
    print(MAIN)


if __name__ == "__main__":
    main()
