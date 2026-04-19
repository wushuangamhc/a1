--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
local function __TS__Class(self)
    local c = {prototype = {}}
    c.prototype.__index = c.prototype
    c.prototype.constructor = c
    return c
end
-- End of Lua Library inline imports
local ____exports = {}
local ____config = require("shared.config")
local EVENT_NAMES = ____config.EVENT_NAMES
local ____hero_definitions = require("hero_definitions")
local HERO_DEFINITIONS = ____hero_definitions.HERO_DEFINITIONS
local ____net_tables = require("net_tables")
local syncPlayerState = ____net_tables.syncPlayerState
local syncScoreboard = ____net_tables.syncScoreboard
local ____time = require("lib.time")
local now = ____time.now
____exports.CombatSystem = __TS__Class()
local CombatSystem = ____exports.CombatSystem
CombatSystem.name = "CombatSystem"
function CombatSystem.prototype.____constructor(self, state, pickups)
    self.state = state
    self.pickups = pickups
end
function CombatSystem.prototype.handleFire(self, playerId, payload)
    local player = self.state.players:get(playerId)
    local hero = PlayerResource:GetSelectedHeroEntity(playerId)
    if not player or not hero or not player.isAlive then
        return
    end
    local currentTime = now(nil)
    if currentTime < player.fireCooldownEndsAt then
        return
    end
    local heroDefinition = HERO_DEFINITIONS[player.heroId]
    local origin = hero:GetAbsOrigin()
    local baseDirection = Vector(payload.targetX - origin.x, payload.targetY - origin.y, 0)
    local direction = baseDirection:Normalized()
    local chargePct = math.max(
        0,
        math.min(payload.chargePct or 0, 1)
    )
    local rangeBonusPct = heroDefinition.chargeRangeBonusPct or 0
    local range = heroDefinition.maxRange * (1 + rangeBonusPct * chargePct)
    local cooldownScale = player.activeRuneId == "frenzy" and 0.6 or 1
    player.fireCooldownEndsAt = currentTime + heroDefinition.cooldown * cooldownScale
    syncPlayerState(nil, self.state, playerId)
    local firedEvent = {
        shooterId = playerId,
        heroId = player.heroId,
        projectileType = heroDefinition.projectileType,
        origin = {x = origin.x, y = origin.y, z = origin.z},
        target = {x = payload.targetX, y = payload.targetY, z = payload.targetZ}
    }
    CustomGameEventManager:Send_ServerToAllClients(EVENT_NAMES.projectileFired, firedEvent)
    local shots = player.multishotCount
    do
        local shotIndex = 0
        while shotIndex < shots do
            local sideOffset = shots > 1 and (shotIndex == 0 and -48 or 48) or 0
            local adjustedOrigin = origin + Vector(-direction.y * sideOffset, direction.x * sideOffset, 0)
            self:resolveLineHit(
                playerId,
                adjustedOrigin,
                direction,
                range,
                heroDefinition.projectileWidth
            )
            shotIndex = shotIndex + 1
        end
    end
end
function CombatSystem.prototype.registerKill(self, attackerId, victimId, projectileType)
    local attacker = self.state.players:get(attackerId)
    local victim = self.state.players:get(victimId)
    local victimHero = PlayerResource:GetSelectedHeroEntity(victimId)
    if not attacker or not victim or not victimHero then
        return
    end
    if victim.hasShield then
        victim.hasShield = false
        victim.blessingId = "none"
        syncPlayerState(nil, self.state, victimId)
        local shieldEvent = {attackerId = attackerId, victimId = victimId, projectileType = projectileType, consumedShield = true}
        CustomGameEventManager:Send_ServerToAllClients(EVENT_NAMES.projectileHit, shieldEvent)
        return
    end
    victim.deaths = victim.deaths + 1
    victim.isAlive = false
    victimHero:Kill(
        nil,
        PlayerResource:GetSelectedHeroEntity(attackerId)
    )
    self.pickups:clearBlessing(victimId)
    self.state:resetRespawn(victimId)
    attacker.kills = attacker.kills + 1
    local currentTeamKills = self.state.teamKills:get(attacker.teamId) or 0
    self.state.teamKills:set(attacker.teamId, currentTeamKills + 1)
    syncPlayerState(nil, self.state, attackerId)
    syncPlayerState(nil, self.state, victimId)
    syncScoreboard(nil, self.state)
    local hitEvent = {attackerId = attackerId, victimId = victimId, projectileType = projectileType, consumedShield = false}
    CustomGameEventManager:Send_ServerToAllClients(EVENT_NAMES.projectileHit, hitEvent)
    CustomGameEventManager:Send_ServerToAllClients(EVENT_NAMES.killFeed, {attackerId = attackerId, victimId = victimId, heroId = attacker.heroId})
end
function CombatSystem.prototype.resolveLineHit(self, attackerId, origin, direction, range, width)
    local destination = origin + direction * range
    local attackerTeam = PlayerResource:GetTeam(attackerId)
    local enemies = FindUnitsInLine(
        attackerTeam,
        origin,
        destination,
        nil,
        width,
        2,
        1,
        128 + 256
    )
    local victim = enemies[1]
    if not victim then
        return
    end
    local victimId = victim:GetPlayerOwnerID()
    if victimId == nil or victimId < 0 then
        return
    end
    local player = self.state.players:get(attackerId)
    if not player then
        return
    end
    self:registerKill(attackerId, victimId, HERO_DEFINITIONS[player.heroId].projectileType)
end
return ____exports
