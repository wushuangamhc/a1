--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local ____config = require("shared.config")
local DUO_KILL_TARGET = ____config.DUO_KILL_TARGET
local FFA_KILL_TARGET = ____config.FFA_KILL_TARGET
local FAST_RESPAWN_SECONDS = ____config.FAST_RESPAWN_SECONDS
local GAME_LENGTH_SECONDS = ____config.GAME_LENGTH_SECONDS
local ____time = require("game.lib.time")
local now = ____time.now
____exports.RuntimeState = __TS__Class()
local RuntimeState = ____exports.RuntimeState
RuntimeState.name = "RuntimeState"
function RuntimeState.prototype.____constructor(self)
    self.players = __TS__New(Map)
    self.teamKills = __TS__New(Map)
    self.brokenObjects = __TS__New(Set)
    self.matchMode = "ffa"
    self.phase = "warmup"
    self.startedAt = 0
end
function RuntimeState.prototype.ensurePlayer(self, playerId, teamId)
    local existing = self.players:get(playerId)
    if existing then
        return existing
    end
    local created = {
        playerId = playerId,
        heroId = "striker",
        blessingId = "none",
        activeRuneId = "none",
        kills = 0,
        deaths = 0,
        isAlive = true,
        hasShield = false,
        moveSpeedBonusPct = 0,
        multishotCount = 1,
        fireCooldownEndsAt = 0,
        runeExpiresAt = 0,
        respawnAt = 0,
        teamId = teamId,
        inBush = false
    }
    self.players:set(playerId, created)
    return created
end
function RuntimeState.prototype.start(self, mode)
    self.matchMode = mode
    self.phase = "in_progress"
    self.startedAt = now(nil)
    self.winnerTeamId = nil
    self.teamKills:clear()
end
function RuntimeState.prototype.resetRespawn(self, playerId)
    local player = self.players:get(playerId)
    if not player then
        return
    end
    player.isAlive = false
    player.respawnAt = now(nil) + FAST_RESPAWN_SECONDS
end
function RuntimeState.prototype.snapshot(self)
    local killTarget = self.matchMode == "ffa" and FFA_KILL_TARGET or DUO_KILL_TARGET
    local elapsed = self.startedAt > 0 and now(nil) - self.startedAt or 0
    local timeRemaining = math.max(0, GAME_LENGTH_SECONDS - elapsed)
    return {
        phase = self.phase,
        mode = self.matchMode,
        timeRemaining = timeRemaining,
        killTarget = killTarget,
        winnerTeamId = self.winnerTeamId
    }
end
return ____exports
