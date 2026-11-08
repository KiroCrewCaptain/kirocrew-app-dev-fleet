# Porting notes: built-in → external app

This repository was ported from Kiro Crew's built-in app at
`src/kiro_crew/apps/builtins/dev_fleet/` (KiroCrew `main` at
`6d07df11cfb64f4c3fda0466165c7a0ba3efe748`), its dashboard page at
`website/src/apps/dev-fleet/`, its store art at
`website/public/app-assets/dev-fleet/`, and its tests: the 41 Dev Fleet files under
Kiro Crew's `test/` (`test_dev_fleet_*.py`, `test_devfleet_*.py`,
`test_sandbox_dev_fleet_live_target.py` and the two helper modules) and the 13 test
files beside the page.

Line numbers below refer to that commit unless they name a file in this
repository. "Gap" means something the built-in gets from Kiro Crew that an
external app has no public way to get today. Each gap is a Kiro Crew change (or an
owner decision), not a change here.

**This copy is not ready to pin.** Until the Kiro Crew change in gap 1 lands, Kiro
Crew refuses any adoption pin for `dev-fleet`, whatever this tree holds.

## What carried over unchanged

- `app.json` `name` (`dev-fleet`), `version` (`1.0.0`), `permissions`
  (`api: ["/apps/dev-fleet/api", "/apps/dev-fleet/api/*"]`, `network`, `terminal`),
  `platform`, `defaultEnabled` (`false`), `skills`, and every display field.
  `tests/test_manifest_contract.py` compares them with the built-in's manifest
  (`tests/fixtures/builtin-app.json`).
- The two bundled skills, `skills/pod-e2e` and `skills/feature-demo-recording`,
  byte for byte (`tests/fixtures/builtin-skills.sha256`).
- The backend's process model: an aiohttp server the gateway spawns, sandboxes and
  reverse-proxies at `/apps/dev-fleet/api/*`, `port: "auto"`,
  `healthCheck: "/health"`, HMAC-verified on every proxied request. Every module of
  the backend is the built-in's, with only the changes in the next table.
- The in-gateway routes (`agent_pod_api.py`, `gateway_routes.py`): the same paths
  under `/api/apps/dev-fleet/`, the same methods, the same handlers and gates
  (enabled state, owner-only, Dev Fleet's own app token, loopback plus internal
  auth).
- The page's markup, class strings, behaviour and the session-storage key
  `kc-dev-fleet-undo-dismissed`.

## What changed, and why

| Built-in | Here | Why |
|---|---|---|
| `"backend": {"entryPoint": "kiro_crew.apps.builtins.dev_fleet.server"}` (`app.json:48`) | `"entryPoint": "backend/launch.py"` | A module-style entry resolves only inside the Kiro Crew package. The gateway runs a file entry as a script; `launch.py` puts the app root on `sys.path`, takes its own directory off it, and runs `backend.server` as the built-in's `python -m` did (`tests/test_spawned_backend.py`). |
| Package `register_routes(app)` picked up by the `BUILTIN_NAMES` loop (`dashboard/routes/system.py:271-301`) | `"backend": {"hooks": {"routes": "backend.gateway_hooks:register_routes"}}` | The App Kit form of in-gateway routes. `gateway_hooks.py` runs the built-in's own two `register_routes` against a recorder and hands every route to `RouteRegistry` with its path made relative, so the route tables are not restated. A disabled app's hook routes are deregistered (404); the handlers' own enabled check still runs. |
| `from kiro_crew.apps.builtins.dev_fleet import ...` | `from . import ...`, and the facade owner lists as `f"{__package__}.<owner>"` | The modules are one package wherever they load: `backend` in the spawned process, the gateway's synthetic package for the hook module. |
| `Path(__file__).parents[3]` as "the running install" (`fleet_state.py:719`), `Path(__file__)` walk (`repository.py:135`) | `Path(kiro_crew.__file__)` | Those files sat inside the `kiro_crew` package; these sit in the app's own directory, so the package is asked directly. |
| `logging.getLogger("kiro_crew.apps.builtins.dev_fleet.server")` (`runtime.py:33`) | `logging.getLogger(f"{__package__}.server")` | The logger is named after the package that loaded it. |
| `host_grants.py` | Not carried | Kiro Crew reads host grants only from packages in `BUILTIN_NAMES`; a copy here would be read by nothing. See gap 2. |
| `iconUrl` / `heroImage*` as absolute `/app-assets/...` SVGs | `iconPath` / `heroImage*` / `screenshots` as repo-relative PNGs under `assets/` | A registry app's art is repo-relative, and the catalog's publish step refuses SVG for a non-builtin source. The PNGs were rendered from the built-in SVGs with headless Chromium (the icon at 512x512 on the default theme's `--bg`, with `--ico-a` / `--ico-b` resolved to its `--muted` and `--accent`; heroes at 1200x675; detail banners at 1200x288). The SVGs are kept beside them. The store screenshot is the built-in's. |
| `ui.pages` `[{"route": "/dev-fleet", "icon": "Server"}]`, page compiled into the dashboard (`website/src/apps/builtinRegistry.ts:66`) | `ui.entry: "dist/index.mjs"` (a committed ESM bundle built from `ui/src/`), `ui.pages` `[{"route": "/apps/dev-fleet", "label": "Dev Fleet"}]`, no `icon` | An installed app ships its page as a bundle AppHost loads. The legacy `/dev-fleet` route and `Server` glyph of an adopted record come from Kiro Crew's adoption pin (`legacyNav`), never from this manifest. |
| No `minKiroCrewVersion`, no `license` | `"minKiroCrewVersion": "0.12.0"`, `"license": "Apache-2.0"` | The first Kiro Crew whose adoption can carry this record; the license is Kiro Crew's, which the code was released under. |

## Remaining gaps

1. **The pod tools move to this manifest (closed by the Kiro Crew change on branch
   `fix/adoption-devfleet-tools`, not yet in the pinned `tests/kirocrew-commit.txt`).**
   Kiro Crew refused every `dev-fleet` pin because its core MCP table (`TOOL_APPS`
   in `mcp_tools/apps.py`) owned `pod_up`, `pod_restart`, `pod_down`, `pod_status`
   and `pod_ls`. That change declares them in the wheel copy's `app.json` and
   removes the core rows, so `core_named_apps()` no longer names this app. This
   tree carries the same declaration (`agentTools`, namespace `pod`, so the names
   agents, skills and policies know are kept) and serves it the same way:
   `backend/agent_tools.py` runs each tool on the same `agent_pod_api` verb and
   renders the same text, and `gateway_hooks.py` registers its one route,
   `POST /api/apps/dev-fleet/agent-tools`, in the gateway (the backend is
   sandboxed, so a pod verb cannot run there). The keys `namespace`,
   `timeoutSeconds` and `result` are App Kit seam level 4, so a pin of this tree
   sets `minAppSdkLevel` to 4; a host below level 2 ignores the block, and a
   level-2 or level-3 host refuses it. The tests that need a host which reads those
   keys skip on an older pinned Kiro Crew. Still open for pinning: listing an
   adopted record's tools at all (`app_agent_tools` reads first-party built-in
   records only) is a separate Kiro Crew change.
2. **Host grants come from the wheel's package.** The built-in's
   `host_grants.py` asks the host for: the BUILD rlimit profile for its backend
   (`apps/backend.py:1358-1365`), forwarding `KIROCREW_DEVFLEET_REPO` and
   `KIROCREW_DEVFLEET_BIN_*` into the backend's environment, the `dev_fleet`
   config section (no unrecognized-key warning), the five
   `/api/apps/dev-fleet/pod/*` routes in the strict-internal tier (without it every
   `pod_*` tool call 403s), and the relay refusal of the two pod-token routes.
   `apps/builtin_host_grants.py:119-131` reads these only from `BUILTIN_NAMES`
   packages, by app name, so while the wheel still ships the built-in they apply to
   an adopted record too; the release that deletes the built-in loses all of them,
   including the relay refusal of a credential-minting route. That deletion needs a
   generic, app-agnostic way for a first-party app to carry them first.
   `tests/test_dev_fleet_pod_agent_api.py::test_every_route_is_named_in_the_strict_internal_table`
   reads the host's table and goes red the day they vanish.
3. **The page reaches four host routes outside its grant.** Make live, Restart
   gateway and Open (the pod token) POST to the gateway's own routes under
   `/api/apps/dev-fleet/` (`ui/src/devFleetApi.ts` `postGateway`), and the
   backend-down banner reads the app list at `/api/apps` (`backendStatus`). The
   built-in's compiled page called them as dashboard code; the bundle calls them
   through the host's scoped client, which refuses any path outside
   `permissions.api`, so those three actions fail with the host's refusal and the
   banner falls back to its generic text. Declaring the paths would widen the
   grant, which adoption holds back (E9). An owner decision, like Code Review Sage's
   `/api/source/pull-request`: whether an app's own `/api/apps/<app>/` namespace is
   implicitly in its grant, or this app declares it. Pinned by
   `tests/test_manifest_contract.py::test_the_page_reaches_the_gateway_routes_outside_the_grant`.
4. **No public backend seam for spawned app processes (open owner question).** The
   backend imports Kiro Crew's private modules directly, as the built-in did:
   `kiro_crew` (`_facade_mirror`, `dep_sync`, `executors`, `frontend`, `hooks`,
   `platform_compat`), `apps.host_exec_grants`, `apps.manager`, `apps.proxy_auth`,
   `atomic_write`, `cli_server_stop`, `config.loader`, `config.paths`,
   `dashboard.handlers._shared`, `dashboard.origin`, `env`, `executors`,
   `git_config_hooks`, `git_tmp_packs`, `instances`, `loop_lock`,
   `owner_only_files`, `platform`, `platform_compat`, `pod`, `pod.config`,
   `pod.launchd`, `sandbox`, `security`, `sel`, `service`, `service.common`,
   `service.macos`; the `feature-demo-recording` skill's scripts import
   `kiro_crew.security`, `kiro_crew.hooks` and `kiro_crew.deploy.engine`. A Kiro Crew
   release that moves one of these breaks the app (it fails to start; it never runs
   with a check skipped). Whether Kiro Crew publishes a backend SDK for spawned app
   processes is an open owner question, so this copy does not invent a bridge.
   The suite runs against a Kiro Crew source checkout at the port commit (`tests/kirocrew-commit.txt`; CI clones it and installs it editable), as it ran inside Kiro Crew.
5. **Execution trust.** A built-in's spawned backend and hook routes are admitted
   without a grant (`apps/backend.py:521`, `is_builtin_app`). This copy runs only
   when the operator trusts it; for an existing user, adoption writes that grant
   for this repository in the same transaction that moves the record.
6. **Core still names this app.** Besides gaps 1 and 2: `apps/builtins/__init__.py:12`
   (`BUILTIN_NAMES`), `apps/host_exec_grants.py:29` (its docstring names the pod
   gate here as the reader), `session_environment.py:275`, `cli_parser_admin.py`,
   `channel.py`, `validation_parts/app_schemas.py`,
   `validation_parts/server_registries.py`, `data/tips_curated.json:103`,
   `docs/apps.md:57`, `docs/system-specs/modules/dev-fleet.md`, comments in
   `frontend.py`, `dep_sync.py`, `doctor_checks/install.py`, `cli.py`,
   `cloud/aws.py`, `dashboard/stale_bundle_guard.py`; the dashboard's
   `website/src/apps/builtinRegistry.ts:66`, the `pages.devFleetPage.*` keys in
   every catalog and the three `website/src/i18n/devFleet*Plural.test.ts` files;
   and Kiro Crew's test floor (`test/conftest_resets.py:447`
   `_disable_dev_fleet_background_tasks`, `test/conftest_floor_seams.py:132`,
   `test/conftest_floor_services.py:230`) plus core tests that use this app's code
   (`test/test_core_dev_fleet_pptx_maker_decoupling.py`,
   `test/test_host_exec_grants.py`, `test/test_mcp_apps_tool_gate.py`,
   `test/campaign_facade_inventories/kiro_crew.apps.builtins.dev_fleet.*.json`,
   `test/test_worktree_ops_live_facades.py`). Each needs moving or rewording before
   the built-in can leave.
7. **README media come from a modified Kiro Crew tree.** The capture harness
   photographs whatever the throwaway home has installed, and an app named
   `dev-fleet` cannot be installed beside the built-in, so the media were captured
   on the port commit with only the built-in copy removed (`docs/media/media.json`,
   `kirocrew_tree_dirty`). `capture/capture.py` gained one setup variable,
   `{{fixture_root}}`, for the fictional checkout `capture/make_fixture.py` builds.
8. **Not in the catalog.** `KiroCrewApps` has no `git` row for this repository.
9. **Store listing localization.** No `l10n` block yet: the store row shows the
   English fields.
10. **The backend starts before its gateway routes exist.** The built-in's
    in-gateway routes were mounted at gateway startup, before any app backend was
    spawned. As `backend.hooks.routes` they are registered when the app's hooks are
    wired, after its backend may already have started, so the backend's first read
    of the live-target state answers 404 and the page shows **Live state
    unavailable** until the next read (the display cache holds it for 30 seconds;
    measured clearing within about 45 seconds of enable on an isolated gateway).
    Removal and Make Live read the state fresh, so no destructive action relies on
    the cached failure. Closing it needs Kiro Crew to wire an app's hook routes
    before spawning its backend.

## UI

The page is `ui/src/`, ported from `website/src/apps/dev-fleet/` with the same
markup, class strings and behaviour. `npm run build` in `ui/` writes the committed
`ui/dist/index.mjs`; CI rebuilds it and fails on a difference. Every SDK name the
bundle imports exists on a host before App Kit level 1
(`tests/test_manifest_contract.py` reads the built file).

| Built-in | Here |
|---|---|
| `fetch('/apps/dev-fleet/api/...')` + `api/client.toApiError` | `ui/src/devFleetApi.ts` over `useAppApi()`, the host's client scoped to `permissions.api`, bound by the root component. A refusal is a `DevFleetApiError` carrying the status, the raw body and the backend's own sentence; an HTML 502/503 reads "temporarily unavailable" and an HTML 401/403 names the access proxy, as the dashboard's client words them (the scoped client's error carries no content type, so the body alone decides) |
| `api.listApps()` for the backend-down banner, `postGateway` to `/api/apps/dev-fleet/*` | Through the same scoped client, which refuses them (gap 3) |
| `fetch('/apps/dev-fleet/api/health')` in the restart handshake | `rawHealth` through the scoped client; its 404 is the same "backend gone" reload |
| `dispatch(addNotification(...))` into the dashboard's notification store | The host's `useNotify()`; the page keeps its own toasts and in-page error notice |
| `dispatch(setPendingInput(prompt))` + `navigate('/chat?autoSend=1&newSession=1')` for QA + video | `useChatLauncher().openChat({ message, autoSend: true })` |
| `components/ui` (`Card`, `CardTitle`, `Btn`, `EmptyState`, `ContentSkeleton`, `PageHeader`, `SearchInput`, `Badge`, `StatCard`), `InfoTip`, `Modal`, `Clickable`, `ErrorNotice` | The same components from `@kirocrew/app-sdk/ui` (`ui/src/host/ui.tsx`) |
| `components/ui` `Checkbox` | Copied (`ui/src/host/ui.tsx`) |
| `components/SimpleSelect` (Radix) | A themed native `<select>` with the same props (`ui/src/host/ui.tsx`); its open list is drawn by the browser |
| `components/overlayRoot` (`OverlayPortal`, `useCloseWhenCrewHidden`) | `ui/src/host/overlay.tsx`: portals into `document.body`; the crew-overlay close signal has no bundle-side source, so it never fires |
| `hooks/useImeGuard` `useDocumentImeLatch`, `hooks/useMenuKeyboard` `handleMenuKeydown`, `hooks/useDialogFocusTrap` | Copied into `ui/src/host/keyboard.ts`, without the crew-overlay signal |
| `utils/backendStatus` | Copied into `ui/src/host/backendStatus.ts` |
| `i18n/format` `fmtNumber`, `fmtRelative`, `compareText` | The SDK's own |
| `i18n/format` `fmtUnit`, `fmtBytes`, `fmtPercent` | Rebuilt on the SDK's `fmtNumber` with the same rules (`ui/src/host/format.ts`) |
| `i18n/t.i18nT` with keys in the dashboard's catalogs | `i18nT` in `ui/src/i18n.ts` over the app's own catalogs, `ui/i18n/<locale>.json` for all 12 dashboard locales: the `pages.devFleetPage.*` and `apps.devFleet.*` subtrees copied from Kiro Crew (English from `en.json` plus `en.manual.json`), plus the two `apps.backend.restart_exhausted_*` strings and the two `api.client.*` refusal strings. `{{productName}}` renders "Kiro Crew"; an edition's renamed product is not visible to a bundle |

## Tests

| Built-in test | Here | Change |
|---|---|---|
| `test/test_dev_fleet_*.py`, `test/test_devfleet_*.py`, `test/test_sandbox_dev_fleet_live_target.py`, `test/dev_fleet_app_helpers.py`, `test/dev_fleet_server_coverage_helpers.py` | same names under `tests/` | Import path (`backend`). Paths to `app.json` and to the app root follow the new layout. `test_dev_fleet_gateway_routes.py` and `test_dev_fleet_pod_agent_api.py` assert the routes through `backend.hooks.routes` instead of the `BUILTIN_NAMES` loop. The private runtime-gate copy loads inside the `backend` package; the removal-lease subprocess gets this repository on its `PYTHONPATH`. |
| Kiro Crew's conftest floor | `tests/conftest.py`, `tests/host_service_floor.py`, `tests/git_maintenance_helpers.py`, `tests/redact_scan_helpers.py` | The parts these tests rely on: a throwaway `HOME` and data home, git maintenance off and a fixed identity, the host-service guard (no real `systemctl`/`launchctl`/`schtasks` mutation, no systemd user session for the test tree), `$XDG_CONFIG_HOME` and the launchd paths pinned, and the per-test resets these tests touch (re-exec environment, live config watcher, sandbox launch mark, background loops off, developer overrides), a temp root per pytest process, and the Dev Fleet rows of Kiro Crew's `windows-collect-ignore.txt` (`tests/windows-collect-ignore.txt`). Tests that read the serving package's or the checkout's location ask `kiro_crew.__file__` instead of their own path. |
| `mcp_tools/apps.py`'s pod tool cases in `test/test_dev_fleet_pod_agent_api.py` | the same file | The tools are this app's now (`backend/agent_tools.py`), so their reply, refusal, wait and bound cases test that module and the `agentTools` declaration; a call goes through the host's real `/api/app-tools/call` handler and route registry to the hook route. |
| (none) | `tests/test_manifest_contract.py`, `tests/test_spawned_backend.py` | The manifest's parity with the built-in, the skills, the bundle's imports, an adoptable tree, the pinned gap 3; the backend started the way the gateway starts it. |
| `website/src/apps/dev-fleet/*.test.ts(x)` | `ui/tests/` | Import paths. The SDK stand-ins (`ui/tests/stubs/`) route the scoped client through `fetch`, so the tests keep stubbing `fetch`; they do not apply the host's path fence (gap 3 is pinned on the Python side). Run under happy-dom, as in Kiro Crew. The QA + video case asserts the chat launcher call. The language cases switch the stand-in's locale. The boundary test now pins that `src/` imports only its own modules and the host's. The registry-row case stays with Kiro Crew. |

## Fixes since the port

None yet: this tree was cut from Kiro Crew `main` at
`6d07df11cfb64f4c3fda0466165c7a0ba3efe748`, the newest commit when it was made, so
the built-in has had no fix this copy lacks. A fix that lands on the built-in
after that commit is carried here with a patch-version bump.

## What Kiro Crew keeps doing

The built-in keeps running for every user until gap 1 is closed: adoption refuses
this app before it fetches anything. After that, the release that adds the pin
still ships the built-in, and a record that cannot move keeps running the
built-in copy, unchanged.

## Release handoff: one commit for both pins

The adoption pin and the catalog row must name the same commit, and that commit
must be the ported tree.

1. Call this repository's `main` head, a full 40-hex SHA, `C`.
2. In the Kiro Crew release PR that adds adoption, run
   `python3 scripts/adoption_pin.py compute <this URL> C` and add the row it
   prints (commit, `treeSha256`, `archiveSha256`, `legacyNav`
   `{"route": "/dev-fleet", "icon": "Server"}`) to
   `src/kiro_crew/apps/adoption-pins.json`; then `python3 scripts/adoption_pin.py verify`.
3. The KiroCrewApps row for `dev-fleet` switches to `"type": "git"`, this URL,
   `"ref": "C"`.
4. Check that both files name the same `C`, and that GitHub serves it.
5. The catalog PR stays a draft, labelled hold-for-release, until the Kiro Crew
   release that ships adoption is published.
