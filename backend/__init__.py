"""Dev Fleet, an app for Kiro Crew.

Two halves. The fleet backend (``server.py``, started by ``launch.py``) is a SPAWNED,
sandboxed process the gateway reverse-proxies at ``/apps/dev-fleet/api/``. Two route
families run in the GATEWAY process instead, both installed through
``backend.hooks.routes`` (``gateway_hooks.register_routes``):

* ``agent_pod_api.py`` -- the AGENT-facing pod lifecycle routes.
* ``gateway_routes.py`` -- the live-target cutover, restart, read broker and removal
  leases, which reach the bind-masked pointer and so cannot run in the backend (see
  that module for why).

This package ``__init__`` imports nothing: the gateway loads the hook module by file
path, and the backend process imports its modules by name.
"""
