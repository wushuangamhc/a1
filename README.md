# One Shot One Kill Dota 2 Alpha

This workspace now contains a zero-to-one scaffold for a Dota 2 custom game implementation of the `One Shot One Kill` alpha. It is organized around the chosen stack:

- `game/`: TypeScript-to-Lua gameplay logic
- `content/panorama/`: React Panorama source, XML mount points, and Panorama CSS
- `shared/`: shared enums, payloads, and net table contracts
- `addon/`: generated output target for compiled scripts
- `docs/task-packs/`: Codex-to-Kimi execution packs

## Current implementation status

The repository now includes:

- core match bootstrap and scoreboard sync
- three prototype heroes: `striker`, `deadeye`, `boomerang`
- one-shot kill rules with shield blessing handling
- blessing and rune pickup state handling
- teleport and bush scaffolding
- minimal HUD, scoreboard, and endgame overlays
- shared event and net table contracts for server and UI

## What still needs Dota-side hookup

This scaffold assumes you will connect it to a real addon and map:

1. Install dependencies with `npm install`.
2. Wire the generated `addon/` output into your Dota 2 addon directory.
3. Build scripts with `npm run build`.
4. Create Hammer entities with the naming conventions below.
5. Add NPC/unit KV and addon KV files required by the addon runtime.
6. Replace placeholder art, sounds, particles, and debug HUD buttons over time.

## Hammer entity naming contract

Map mechanics activate only when the corresponding named entities exist:

- `oss_spawn_ffa_1..N`: free-for-all respawn points
- `oss_spawn_duo_1..N`: duo mode respawn points
- `oss_blessing_shrine_1..N`: blessing pickup anchors
- `oss_rune_spawn_1..N`: rune pickup anchors
- `oss_bush_1..N`: bush zones
- `oss_wall_1..N`: low wall blockers
- `oss_breakable_1..N`: destructible cover anchors
- `oss_teleport_1..N`: teleport triggers
- `oss_teleport_1..N_dest`: teleport landing markers

You can also trigger pickups from the debug HUD with ids like:

- `oss_blessing_shrine_shield`
- `oss_blessing_shrine_multishot`
- `oss_blessing_shrine_swiftness`
- `oss_rune_spawn_haste`
- `oss_rune_spawn_ambush`
- `oss_rune_spawn_frenzy`

## Suggested next steps

1. Add addon KV, hero/unit definitions, and a proper Dota addon manifest.
2. Connect the scaffold to a whitebox test map for the small-room phase.
3. Replace HUD debug buttons with production interaction flow.
4. Add line-of-sight blocking for walls and breakable cover restoration logic.
5. Extend from FFA into `2v2` after the FFA loop is stable.
