"""Dev Fleet's in-gateway routes as ``backend.hooks.routes``.

The built-in installed its two in-gateway route families on the gateway's own
``aiohttp`` router through the package ``register_routes(app)`` that Kiro Crew's
built-in boot loop calls. An installed app reaches the gateway through the App Kit
``hooks.routes`` contract instead: a callable that takes the app context and returns
route records, served by the gateway's ``RouteRegistry`` under ``/api/apps/dev-fleet/``.

The route tables themselves are not restated here. ``agent_pod_api.register_routes``
and ``gateway_routes.register_routes`` are the built-in's, unchanged; they are run
against a recorder that has the ``app.router.add_*`` shape, and every route they add
is handed to the registry with its path made relative to the app's namespace. So the
paths, methods and handlers are the built-in's one for one, and each handler still
runs its own gates (enabled state, owner-only, Dev Fleet's own app token, loopback
plus internal auth).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Awaitable, Callable

#: The namespace the gateway serves an app's hook routes under.
_PREFIX = "/api/apps/dev-fleet"


@dataclass(frozen=True)
class Route:
    """One route record, in the shape ``RouteRegistry`` accepts."""

    method: str
    path: str
    handler: Callable[..., Awaitable[Any]]


class _RouterRecorder:
    """Stands in for ``web.Application.router``: records each ``add_*`` call."""

    def __init__(self) -> None:
        self.added: list[tuple[str, str, Callable[..., Awaitable[Any]]]] = []

    def _add(self, method: str, path: str, handler: Callable[..., Awaitable[Any]]) -> None:
        self.added.append((method, path, handler))

    def add_get(self, path: str, handler: Callable[..., Awaitable[Any]], **_kw: Any) -> None:
        self._add("GET", path, handler)

    def add_post(self, path: str, handler: Callable[..., Awaitable[Any]], **_kw: Any) -> None:
        self._add("POST", path, handler)

    def add_put(self, path: str, handler: Callable[..., Awaitable[Any]], **_kw: Any) -> None:
        self._add("PUT", path, handler)

    def add_delete(self, path: str, handler: Callable[..., Awaitable[Any]], **_kw: Any) -> None:
        self._add("DELETE", path, handler)

    def add_patch(self, path: str, handler: Callable[..., Awaitable[Any]], **_kw: Any) -> None:
        self._add("PATCH", path, handler)


class _AppRecorder:
    """The ``app`` argument the built-in route modules expect."""

    def __init__(self) -> None:
        self.router = _RouterRecorder()


def _relative(path: str) -> str:
    if not (path == _PREFIX or path.startswith(_PREFIX + "/")):
        # A route outside the app's own namespace cannot be served by the registry,
        # and must never be: refuse loudly rather than drop it silently.
        raise ValueError(f"Dev Fleet route {path!r} is outside {_PREFIX}/")
    return path[len(_PREFIX) :] or "/"


def _adapt(handler: Callable[..., Awaitable[Any]]) -> Callable[..., Awaitable[Any]]:
    async def _handler(request: Any, _ctx: Any) -> Any:
        return await handler(request)

    _handler.__name__ = getattr(handler, "__name__", "_handler")
    _handler.__qualname__ = getattr(handler, "__qualname__", _handler.__name__)
    _handler.__wrapped__ = handler  # type: ignore[attr-defined]
    return _handler


def collect_routes() -> list[tuple[str, str, Callable[..., Awaitable[Any]]]]:
    """Every in-gateway route the built-in installed, as ``(method, path, handler)``.

    The last is the one route the manifest's ``agentTools`` are served on
    (``agent_tools.py``), which the built-in registers through its own route hook.
    """
    from . import agent_pod_api, agent_tools, gateway_routes

    recorder = _AppRecorder()
    agent_pod_api.register_routes(recorder)  # type: ignore[arg-type]
    gateway_routes.register_routes(recorder)  # type: ignore[arg-type]
    recorder.router.add_post(_PREFIX + agent_tools.TOOL_ROUTE, agent_tools.handle_agent_tool)
    return list(recorder.router.added)


def register_routes(ctx: Any) -> list[Route]:
    """``backend.hooks.routes``: the built-in's in-gateway routes, made relative."""
    return [Route(method, _relative(path), _adapt(handler)) for method, path, handler in collect_routes()]
