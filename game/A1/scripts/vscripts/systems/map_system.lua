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

local Map
do
    Map = __TS__Class()
    Map.name = "Map"
    function Map.prototype.____constructor(self, entries)
        self[Symbol.toStringTag] = "Map"
        self.items = {}
        self.size = 0
        self.nextKey = {}
        self.previousKey = {}
        if entries == nil then
            return
        end
        local iterable = entries
        if iterable[Symbol.iterator] then
            local iterator = iterable[Symbol.iterator](iterable)
            while true do
                local result = iterator:next()
                if result.done then
                    break
                end
                local value = result.value
                self:set(value[1], value[2])
            end
        else
            local array = entries
            for ____, kvp in ipairs(array) do
                self:set(kvp[1], kvp[2])
            end
        end
    end
    function Map.prototype.clear(self)
        self.items = {}
        self.nextKey = {}
        self.previousKey = {}
        self.firstKey = nil
        self.lastKey = nil
        self.size = 0
    end
    function Map.prototype.delete(self, key)
        local contains = self:has(key)
        if contains then
            self.size = self.size - 1
            local next = self.nextKey[key]
            local previous = self.previousKey[key]
            if next ~= nil and previous ~= nil then
                self.nextKey[previous] = next
                self.previousKey[next] = previous
            elseif next ~= nil then
                self.firstKey = next
                self.previousKey[next] = nil
            elseif previous ~= nil then
                self.lastKey = previous
                self.nextKey[previous] = nil
            else
                self.firstKey = nil
                self.lastKey = nil
            end
            self.nextKey[key] = nil
            self.previousKey[key] = nil
        end
        self.items[key] = nil
        return contains
    end
    function Map.prototype.forEach(self, callback)
        for ____, key in __TS__Iterator(self:keys()) do
            callback(nil, self.items[key], key, self)
        end
    end
    function Map.prototype.get(self, key)
        return self.items[key]
    end
    function Map.prototype.has(self, key)
        return self.nextKey[key] ~= nil or self.lastKey == key
    end
    function Map.prototype.set(self, key, value)
        local isNewValue = not self:has(key)
        if isNewValue then
            self.size = self.size + 1
        end
        self.items[key] = value
        if self.firstKey == nil then
            self.firstKey = key
            self.lastKey = key
        elseif isNewValue then
            self.nextKey[self.lastKey] = key
            self.previousKey[key] = self.lastKey
            self.lastKey = key
        end
        return self
    end
    Map.prototype[Symbol.iterator] = function(self)
        return self:entries()
    end
    function Map.prototype.entries(self)
        local items = self.items
        local nextKey = self.nextKey
        local key = self.firstKey
        return {
            [Symbol.iterator] = function(self)
                return self
            end,
            next = function(self)
                local result = {done = not key, value = {key, items[key]}}
                key = nextKey[key]
                return result
            end
        }
    end
    function Map.prototype.keys(self)
        local nextKey = self.nextKey
        local key = self.firstKey
        return {
            [Symbol.iterator] = function(self)
                return self
            end,
            next = function(self)
                local result = {done = not key, value = key}
                key = nextKey[key]
                return result
            end
        }
    end
    function Map.prototype.values(self)
        local items = self.items
        local nextKey = self.nextKey
        local key = self.firstKey
        return {
            [Symbol.iterator] = function(self)
                return self
            end,
            next = function(self)
                local result = {done = not key, value = items[key]}
                key = nextKey[key]
                return result
            end
        }
    end
    Map[Symbol.species] = Map
end

local function __TS__New(target, ...)
    local instance = setmetatable({}, target.prototype)
    instance:____constructor(...)
    return instance
end
-- End of Lua Library inline imports
local ____exports = {}
local ____config = require("shared.config")
local BUSH_FADEOUT_SECONDS = ____config.BUSH_FADEOUT_SECONDS
local EVENT_NAMES = ____config.EVENT_NAMES
local MAP_ENTITY_PREFIX = ____config.MAP_ENTITY_PREFIX
local TELEPORT_COOLDOWN_SECONDS = ____config.TELEPORT_COOLDOWN_SECONDS
local ____net_tables = require("net_tables")
local syncMapObjects = ____net_tables.syncMapObjects
local syncPlayerState = ____net_tables.syncPlayerState
local ____time = require("lib.time")
local now = ____time.now
local schedule = ____time.schedule
____exports.MapSystem = __TS__Class()
local MapSystem = ____exports.MapSystem
MapSystem.name = "MapSystem"
function MapSystem.prototype.____constructor(self, state)
    self.state = state
    self.mapObjects = {}
    self.teleportNodes = __TS__New(Map)
    self.teleportCooldowns = __TS__New(Map)
end
function MapSystem.prototype.initialize(self)
    self:cacheTeleportNodes()
    self:cacheStaticMapObjects()
    syncMapObjects(nil, self.mapObjects)
end
function MapSystem.prototype.tick(self)
    self:syncBushStates()
end
function MapSystem.prototype.useTeleport(self, playerId, sourceId)
    local hero = PlayerResource:GetSelectedHeroEntity(playerId)
    local sourceNode = self.teleportNodes:get(sourceId)
    local currentTime = now(nil)
    local cooldown = self.teleportCooldowns:get(playerId) or 0
    if not hero or not (sourceNode and sourceNode.destination) or cooldown > currentTime then
        return
    end
    FindClearSpaceForUnit(hero, sourceNode.destination, true)
    hero:AddNewModifier(hero, nil, "modifier_invulnerable", {duration = 0.2})
    self.teleportCooldowns:set(playerId, currentTime + TELEPORT_COOLDOWN_SECONDS)
    local eventPayload = {playerId = playerId, sourceId = sourceId, destinationId = sourceId .. "_dest"}
    CustomGameEventManager:Send_ServerToAllClients(EVENT_NAMES.teleportUsed, eventPayload)
end
function MapSystem.prototype.cacheTeleportNodes(self)
    do
        local index = 1
        while index <= 8 do
            do
                local __continue9
                repeat
                    local trigger = Entities:FindByName(
                        nil,
                        MAP_ENTITY_PREFIX.teleport .. tostring(index)
                    )
                    local destinationMarker = Entities:FindByName(
                        nil,
                        (MAP_ENTITY_PREFIX.teleport .. tostring(index)) .. "_dest"
                    )
                    if not trigger or not destinationMarker then
                        __continue9 = true
                        break
                    end
                    self.teleportNodes:set(
                        MAP_ENTITY_PREFIX.teleport .. tostring(index),
                        {
                            id = MAP_ENTITY_PREFIX.teleport .. tostring(index),
                            trigger = trigger,
                            destination = destinationMarker:GetAbsOrigin()
                        }
                    )
                    __continue9 = true
                until true
                if not __continue9 then
                    break
                end
            end
            index = index + 1
        end
    end
end
function MapSystem.prototype.cacheStaticMapObjects(self)
    do
        local index = 1
        while index <= 12 do
            self:addIfExists(
                MAP_ENTITY_PREFIX.breakable .. tostring(index),
                "breakable"
            )
            self:addIfExists(
                MAP_ENTITY_PREFIX.bush .. tostring(index),
                "bush"
            )
            self:addIfExists(
                MAP_ENTITY_PREFIX.wall .. tostring(index),
                "wall"
            )
            self:addIfExists(
                MAP_ENTITY_PREFIX.blessingShrine .. tostring(index),
                "blessing"
            )
            self:addIfExists(
                MAP_ENTITY_PREFIX.runeSpawn .. tostring(index),
                "rune"
            )
            index = index + 1
        end
    end
    for ____, teleportId in __TS__Iterator(self.teleportNodes:keys()) do
        local ____self_mapObjects_2 = self.mapObjects
        ____self_mapObjects_2[#____self_mapObjects_2 + 1] = {id = teleportId, kind = "teleport", isActive = true, destinationId = teleportId .. "_dest"}
    end
end
function MapSystem.prototype.addIfExists(self, id, kind)
    if not Entities:FindByName(nil, id) then
        return
    end
    local ____self_mapObjects_3 = self.mapObjects
    ____self_mapObjects_3[#____self_mapObjects_3 + 1] = {id = id, kind = kind, isActive = true}
end
function MapSystem.prototype.syncBushStates(self)
    for ____, ____value in __TS__Iterator(self.state.players) do
        local playerId = ____value[1]
        local playerState = ____value[2]
        do
            local __continue19
            repeat
                local hero = PlayerResource:GetSelectedHeroEntity(playerId)
                if not hero or not playerState.isAlive then
                    __continue19 = true
                    break
                end
                local inBush = false
                do
                    local index = 1
                    while index <= 12 do
                        do
                            local __continue22
                            repeat
                                local bush = Entities:FindByName(
                                    nil,
                                    MAP_ENTITY_PREFIX.bush .. tostring(index)
                                )
                                if not bush then
                                    __continue22 = true
                                    break
                                end
                                if (hero:GetAbsOrigin() - bush:GetAbsOrigin()):Length2D() <= 280 then
                                    inBush = true
                                    break
                                end
                                __continue22 = true
                            until true
                            if not __continue22 then
                                break
                            end
                        end
                        index = index + 1
                    end
                end
                if inBush ~= playerState.inBush then
                    playerState.inBush = inBush
                    if inBush then
                        hero:AddNewModifier(hero, nil, "modifier_rune_invis", {duration = 0.1})
                    else
                        schedule(
                            nil,
                            BUSH_FADEOUT_SECONDS,
                            function()
                                if not playerState.inBush and hero:IsAlive() then
                                    hero:RemoveModifierByName("modifier_rune_invis")
                                end
                            end
                        )
                    end
                    syncPlayerState(nil, self.state, playerId)
                end
                __continue19 = true
            until true
            if not __continue19 then
                break
            end
        end
    end
end
return ____exports
