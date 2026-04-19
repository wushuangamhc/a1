--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
local function __TS__Class(self)
    local c = {prototype = {}}
    c.prototype.__index = c.prototype
    c.prototype.constructor = c
    return c
end

local __TS__Symbol, Symbol
do
    local symbolMetatable = {__tostring = function(self)
        return ("Symbol(" .. (self.description or "")) .. ")"
    end}
    function __TS__Symbol(description)
        return setmetatable({description = description}, symbolMetatable)
    end
    Symbol = {
        asyncDispose = __TS__Symbol("Symbol.asyncDispose"),
        dispose = __TS__Symbol("Symbol.dispose"),
        iterator = __TS__Symbol("Symbol.iterator"),
        hasInstance = __TS__Symbol("Symbol.hasInstance"),
        species = __TS__Symbol("Symbol.species"),
        toStringTag = __TS__Symbol("Symbol.toStringTag")
    }
end

local __TS__Iterator
do
    local function iteratorGeneratorStep(self)
        local co = self.____coroutine
        local status, value = coroutine.resume(co)
        if not status then
            error(value, 0)
        end
        if coroutine.status(co) == "dead" then
            return
        end
        return true, value
    end
    local function iteratorIteratorStep(self)
        local result = self:next()
        if result.done then
            return
        end
        return true, result.value
    end
    local function iteratorStringStep(self, index)
        index = index + 1
        if index > #self then
            return
        end
        return index, string.sub(self, index, index)
    end
    function __TS__Iterator(iterable)
        if type(iterable) == "string" then
            return iteratorStringStep, iterable, 0
        elseif iterable.____coroutine ~= nil then
            return iteratorGeneratorStep, iterable
        elseif iterable[Symbol.iterator] then
            local iterator = iterable[Symbol.iterator](iterable)
            return iteratorIteratorStep, iterator
        else
            return ipairs(iterable)
        end
    end
end

local function __TS__StringIncludes(self, searchString, position)
    if not position then
        position = 1
    else
        position = position + 1
    end
    local index = string.find(self, searchString, position, true)
    return index ~= nil
end
-- End of Lua Library inline imports
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
