--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
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
