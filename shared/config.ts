export const GAME_LENGTH_SECONDS = 8 * 60;
export const FFA_KILL_TARGET = 15;
export const DUO_KILL_TARGET = 20;
export const FAST_RESPAWN_SECONDS = 2;
export const BLESSING_CHANNEL_SECONDS = 2;
export const TELEPORT_COOLDOWN_SECONDS = 6;
export const BUSH_FADEOUT_SECONDS = 0.5;

export const NET_TABLES = {
  playerState: "oss_player_state",
  matchState: "oss_match_state",
  mapState: "oss_map_state",
  pickupState: "oss_pickup_state",
  teamState: "oss_team_state"
} as const;

export const EVENT_NAMES = {
  selectHero: "oss_select_hero",
  interactPickup: "oss_interact_pickup",
  projectileFired: "oss_projectile_fired",
  projectileHit: "oss_projectile_hit",
  pickupStarted: "oss_pickup_started",
  pickupCompleted: "oss_pickup_completed",
  killFeed: "oss_kill_feed",
  matchEnded: "oss_match_ended",
  teleportUsed: "oss_teleport_used"
} as const;

export const MAP_ENTITY_PREFIX = {
  blessingShrine: "oss_blessing_shrine_",
  runeSpawn: "oss_rune_spawn_",
  bush: "oss_bush_",
  wall: "oss_wall_",
  breakable: "oss_breakable_",
  teleport: "oss_teleport_",
  spawnFfa: "oss_spawn_ffa_",
  spawnDuo: "oss_spawn_duo_"
} as const;
