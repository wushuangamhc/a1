--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local ____config = require("shared.config")
local BLESSING_CHANNEL_SECONDS = ____config.BLESSING_CHANNEL_SECONDS
local EVENT_NAMES = ____config.EVENT_NAMES
local ____net_tables = require("net_tables")
local syncPlayerState = ____net_tables.syncPlayerState
local ____time = require("lib.time")
local now = ____time.now
local schedule = ____time.schedule
____exports.PickupSystem = __TS__Class()
local PickupSystem = ____exports.PickupSystem
PickupSystem.name = "PickupSystem"
function PickupSystem.prototype.____constructor(self, state)
    self.state = state
end
function PickupSystem.prototype.handleInteract(self, playerId, payload)
    if not payload.pickupId then
        return
    end
    local target = self:resolvePickup(payload.pickupId)
    if not target then
        return
    end
    if target.pickupType == "blessing" then
        local startEvent = {playerId = playerId, pickupId = target.id, pickupType = "blessing", channelSeconds = BLESSING_CHANNEL_SECONDS}
        CustomGameEventManager:Send_ServerToAllClients(EVENT_NAMES.pickupStarted, startEvent)
        schedule(
            nil,
            BLESSING_CHANNEL_SECONDS,
            function() return self:finishBlessingPickup(playerId, target) end
        )
        return
    end
    self:finishRunePickup(playerId, target)
end
function PickupSystem.prototype.tick(self)
    for ____, ____value in __TS__Iterator(self.state.players) do
        local playerId = ____value[1]
        local player = ____value[2]
        if player.activeRuneId ~= "none" and player.runeExpiresAt > 0 and player.runeExpiresAt <= now(nil) then
            player.activeRuneId = "none"
            player.runeExpiresAt = 0
            syncPlayerState(nil, self.state, playerId)
        end
    end
end
function PickupSystem.prototype.clearBlessing(self, playerId)
    local player = self.state.players:get(playerId)
    if not player then
        return
    end
    player.blessingId = "none"
    player.hasShield = false
    player.multishotCount = 1
    player.moveSpeedBonusPct = 0
    syncPlayerState(nil, self.state, playerId)
end
function PickupSystem.prototype.finishBlessingPickup(self, playerId, target)
    local player = self.state.players:get(playerId)
    if not player or not player.isAlive or target.pickupType ~= "blessing" or not target.blessingId then
        return
    end
    player.blessingId = target.blessingId
    player.hasShield = target.blessingId == "shield"
    player.multishotCount = target.blessingId == "multishot" and 2 or 1
    player.moveSpeedBonusPct = target.blessingId == "swiftness" and 18 or 0
    syncPlayerState(nil, self.state, playerId)
    local completedEvent = {playerId = playerId, pickupId = target.id, pickupType = "blessing", blessingId = target.blessingId}
    CustomGameEventManager:Send_ServerToAllClients(EVENT_NAMES.pickupCompleted, completedEvent)
end
function PickupSystem.prototype.finishRunePickup(self, playerId, target)
    local player = self.state.players:get(playerId)
    if not player or target.pickupType ~= "rune" or not target.runeId then
        return
    end
    player.activeRuneId = target.runeId
    player.runeExpiresAt = now(nil) + 5
    syncPlayerState(nil, self.state, playerId)
    local completedEvent = {playerId = playerId, pickupId = target.id, pickupType = "rune", runeId = target.runeId}
    CustomGameEventManager:Send_ServerToAllClients(EVENT_NAMES.pickupCompleted, completedEvent)
end
function PickupSystem.prototype.resolvePickup(self, pickupId)
    if __TS__StringIncludes(pickupId, "shield") then
        return {id = pickupId, pickupType = "blessing", blessingId = "shield"}
    end
    if __TS__StringIncludes(pickupId, "multishot") then
        return {id = pickupId, pickupType = "blessing", blessingId = "multishot"}
    end
    if __TS__StringIncludes(pickupId, "swiftness") then
        return {id = pickupId, pickupType = "blessing", blessingId = "swiftness"}
    end
    if __TS__StringIncludes(pickupId, "haste") then
        return {id = pickupId, pickupType = "rune", runeId = "haste"}
    end
    if __TS__StringIncludes(pickupId, "ambush") then
        return {id = pickupId, pickupType = "rune", runeId = "ambush"}
    end
    if __TS__StringIncludes(pickupId, "frenzy") then
        return {id = pickupId, pickupType = "rune", runeId = "frenzy"}
    end
    return nil
end
return ____exports
