--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
____exports.GAME_LENGTH_SECONDS = 8 * 60
____exports.FFA_KILL_TARGET = 15
____exports.DUO_KILL_TARGET = 20
____exports.FAST_RESPAWN_SECONDS = 2
____exports.BLESSING_CHANNEL_SECONDS = 2
____exports.TELEPORT_COOLDOWN_SECONDS = 6
____exports.BUSH_FADEOUT_SECONDS = 0.5
____exports.NET_TABLES = {
    playerState = "oss_player_state",
    matchState = "oss_match_state",
    mapState = "oss_map_state",
    pickupState = "oss_pickup_state",
    teamState = "oss_team_state"
}
____exports.EVENT_NAMES = {
    selectHero = "oss_select_hero",
    fireProjectile = "oss_fire_projectile",
    interactPickup = "oss_interact_pickup",
    projectileFired = "oss_projectile_fired",
    projectileHit = "oss_projectile_hit",
    pickupStarted = "oss_pickup_started",
    pickupCompleted = "oss_pickup_completed",
    killFeed = "oss_kill_feed",
    matchEnded = "oss_match_ended",
    teleportUsed = "oss_teleport_used"
}
____exports.MAP_ENTITY_PREFIX = {
    blessingShrine = "oss_blessing_shrine_",
    runeSpawn = "oss_rune_spawn_",
    bush = "oss_bush_",
    wall = "oss_wall_",
    breakable = "oss_breakable_",
    teleport = "oss_teleport_",
    spawnFfa = "oss_spawn_ffa_",
    spawnDuo = "oss_spawn_duo_"
}
return ____exports
