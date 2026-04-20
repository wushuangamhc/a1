--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
local function __TS__Class(self)
    local c = {prototype = {}}
    c.prototype.__index = c.prototype
    c.prototype.constructor = c
    return c
end

local function __TS__New(target, ...)
    local instance = setmetatable({}, target.prototype)
    instance:____constructor(...)
    return instance
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

local Set
do
    Set = __TS__Class()
    Set.name = "Set"
    function Set.prototype.____constructor(self, values)
        self[Symbol.toStringTag] = "Set"
        self.size = 0
        self.nextKey = {}
        self.previousKey = {}
        if values == nil then
            return
        end
        local iterable = values
        if iterable[Symbol.iterator] then
            local iterator = iterable[Symbol.iterator](iterable)
            while true do
                local result = iterator:next()
                if result.done then
                    break
                end
                self:add(result.value)
            end
        else
            local array = values
            for ____, value in ipairs(array) do
                self:add(value)
            end
        end
    end
    function Set.prototype.add(self, value)
        local isNewValue = not self:has(value)
        if isNewValue then
            self.size = self.size + 1
        end
        if self.firstKey == nil then
            self.firstKey = value
            self.lastKey = value
        elseif isNewValue then
            self.nextKey[self.lastKey] = value
            self.previousKey[value] = self.lastKey
            self.lastKey = value
        end
        return self
    end
    function Set.prototype.clear(self)
        self.nextKey = {}
        self.previousKey = {}
        self.firstKey = nil
        self.lastKey = nil
        self.size = 0
    end
    function Set.prototype.delete(self, value)
        local contains = self:has(value)
        if contains then
            self.size = self.size - 1
            local next = self.nextKey[value]
            local previous = self.previousKey[value]
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
            self.nextKey[value] = nil
            self.previousKey[value] = nil
        end
        return contains
    end
    function Set.prototype.forEach(self, callback)
        for ____, key in __TS__Iterator(self:keys()) do
            callback(nil, key, key, self)
        end
    end
    function Set.prototype.has(self, value)
        return self.nextKey[value] ~= nil or self.lastKey == value
    end
    Set.prototype[Symbol.iterator] = function(self)
        return self:values()
    end
    function Set.prototype.entries(self)
        local nextKey = self.nextKey
        local key = self.firstKey
        return {
            [Symbol.iterator] = function(self)
                return self
            end,
            next = function(self)
                local result = {done = not key, value = {key, key}}
                key = nextKey[key]
                return result
            end
        }
    end
    function Set.prototype.keys(self)
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
    function Set.prototype.values(self)
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
    function Set.prototype.union(self, other)
        local result = __TS__New(Set, self)
        for ____, item in __TS__Iterator(other) do
            result:add(item)
        end
        return result
    end
    function Set.prototype.intersection(self, other)
        local result = __TS__New(Set)
        for ____, item in __TS__Iterator(self) do
            if other:has(item) then
                result:add(item)
            end
        end
        return result
    end
    function Set.prototype.difference(self, other)
        local result = __TS__New(Set, self)
        for ____, item in __TS__Iterator(other) do
            result:delete(item)
        end
        return result
    end
    function Set.prototype.symmetricDifference(self, other)
        local result = __TS__New(Set, self)
        for ____, item in __TS__Iterator(other) do
            if self:has(item) then
                result:delete(item)
            else
                result:add(item)
            end
        end
        return result
    end
    function Set.prototype.isSubsetOf(self, other)
        for ____, item in __TS__Iterator(self) do
            if not other:has(item) then
                return false
            end
        end
        return true
    end
    function Set.prototype.isSupersetOf(self, other)
        for ____, item in __TS__Iterator(other) do
            if not self:has(item) then
                return false
            end
        end
        return true
    end
    function Set.prototype.isDisjointFrom(self, other)
        for ____, item in __TS__Iterator(self) do
            if other:has(item) then
                return false
            end
        end
        return true
    end
    Set[Symbol.species] = Set
end
-- End of Lua Library inline imports
local ____exports = {}
local ____config = require("shared.config")
local EVENT_NAMES = ____config.EVENT_NAMES
local FAST_RESPAWN_SECONDS = ____config.FAST_RESPAWN_SECONDS
local GAME_LENGTH_SECONDS = ____config.GAME_LENGTH_SECONDS
local MAP_ENTITY_PREFIX = ____config.MAP_ENTITY_PREFIX
local ____hero_definitions = require("hero_definitions")
local HERO_DEFINITIONS = ____hero_definitions.HERO_DEFINITIONS
local ____net_tables = require("net_tables")
local syncPlayerState = ____net_tables.syncPlayerState
local syncScoreboard = ____net_tables.syncScoreboard
local ____state = require("state")
local RuntimeState = ____state.RuntimeState
local ____time = require("lib.time")
local now = ____time.now
local repeatEvery = ____time.repeatEvery
local ____pickup_system = require("systems.pickup_system")
local PickupSystem = ____pickup_system.PickupSystem
local ____combat_system = require("systems.combat_system")
local CombatSystem = ____combat_system.CombatSystem
local ____map_system = require("systems.map_system")
local MapSystem = ____map_system.MapSystem
____exports.OneShotGameMode = __TS__Class()
local OneShotGameMode = ____exports.OneShotGameMode
OneShotGameMode.name = "OneShotGameMode"
function OneShotGameMode.prototype.____constructor(self)
    self.state = __TS__New(RuntimeState)
    self.pickups = __TS__New(PickupSystem, self.state)
    self.combat = __TS__New(CombatSystem, self.state, self.pickups)
    self.map = __TS__New(MapSystem, self.state)
    self.defaultMode = "ffa"
    self.confirmedHeroSelection = __TS__New(Set)
    self.gameStarted = false
    self.HERO_OVERRIDES = {windrunner = "npc_dota_hero_windrunner", sniper = "npc_dota_hero_sniper"}
end
function OneShotGameMode.prototype.init(self)
    GameRules:SetHeroRespawnEnabled(false)
    GameRules:SetPreGameTime(0)
    GameRules:SetCustomGameSetupTimeout(0)
    GameRules:SetUseUniversalShopMode(false)
    GameRules:SetSameHeroSelectionEnabled(true)
    GameRules:GetGameModeEntity():SetBuybackEnabled(false)
    GameRules:GetGameModeEntity():SetPauseEnabled(false)
    GameRules:GetGameModeEntity():SetDaynightCycleDisabled(true)
    GameRules:SetTreeRegrowTime(999999)
    GameRules:GetGameModeEntity():SetExecuteOrderFilter(
        function(____, event) return self:filterOrders(event) end,
        self
    )
    ListenToGameEvent(
        "game_rules_state_change",
        function() return self:onRulesStateChange() end,
        nil
    )
    ListenToGameEvent(
        "npc_spawned",
        function(event) return self:onNpcSpawned(event) end,
        nil
    )
    ListenToGameEvent(
        "entity_killed",
        function(event) return self:onEntityKilled(event) end,
        nil
    )
    CustomGameEventManager:RegisterListener(
        EVENT_NAMES.selectHero,
        function(_, payload) return self:onHeroSelected(payload) end
    )
    CustomGameEventManager:RegisterListener(
        EVENT_NAMES.interactPickup,
        function(_, payload)
            local playerId = payload.PlayerID
            self.pickups:handleInteract(playerId, payload)
        end
    )
    CustomGameEventManager:RegisterListener(
        EVENT_NAMES.teleportUsed,
        function(_, payload)
            local playerId = payload.PlayerID
            if payload.sourceId ~= nil and payload.sourceId ~= "" then
                self.map:useTeleport(playerId, payload.sourceId)
            end
        end
    )
    self.map:initialize()
    self.state.phase = "warmup"
    syncScoreboard(nil, self.state)
    repeatEvery(
        nil,
        0.1,
        function() return self:tick() end
    )
end
function OneShotGameMode.prototype.tick(self)
    self.pickups:tick()
    self.map:tick()
    self:processRespawns()
    self:checkAllHeroesSelected()
    self:checkMatchEnd()
    syncScoreboard(nil, self.state)
end
function OneShotGameMode.prototype.onRulesStateChange(self)
    local state = GameRules:State_Get()
    if state == DOTA_GAMERULES_STATE_PRE_GAME then
        self.state.phase = "pregame"
        syncScoreboard(nil, self.state)
        return
    end
    if state == DOTA_GAMERULES_STATE_GAME_IN_PROGRESS and not self.gameStarted then
        self:checkAllHeroesSelected()
    end
end
function OneShotGameMode.prototype.checkAllHeroesSelected(self)
    if self.gameStarted or self.state.phase == "post_game" then
        return
    end
    local playerCount = PlayerResource:GetPlayerCountForTeam(DOTA_TEAM_GOODGUYS) + PlayerResource:GetPlayerCountForTeam(DOTA_TEAM_BADGUYS)
    if playerCount == 0 then
        return
    end
    local connectedPlayers = 0
    do
        local i = 0
        while i < playerCount do
            if PlayerResource:GetPlayer(i) ~= nil then
                connectedPlayers = connectedPlayers + 1
            end
            i = i + 1
        end
    end
    if connectedPlayers > 0 and self.confirmedHeroSelection.size >= connectedPlayers then
        self.gameStarted = true
        self.state:start(self.defaultMode)
        syncScoreboard(nil, self.state)
    end
end
function OneShotGameMode.prototype.onNpcSpawned(self, event)
    local unit = EntIndexToHScript(event.entindex)
    if not unit or not unit:IsRealHero() then
        return
    end
    local playerId = unit:GetPlayerOwnerID()
    if playerId == nil or playerId < 0 then
        return
    end
    local playerState = self.state:ensurePlayer(
        playerId,
        unit:GetTeam()
    )
    self:applyHeroPrototype(unit, playerState.heroId)
    unit:SetBaseMaxHealth(1)
    unit:SetMaxHealth(1)
    unit:SetHealth(1)
    unit:SetDeathXP(0)
    unit:SetMinimumGoldBounty(0)
    unit:SetMaximumGoldBounty(0)
    unit:SetBaseMoveSpeed(300 + playerState.moveSpeedBonusPct)
    syncPlayerState(nil, self.state, playerId)
end
function OneShotGameMode.prototype.onEntityKilled(self, event)
    local killedUnit = EntIndexToHScript(event.entindex_killed)
    if not killedUnit or not killedUnit:IsRealHero() then
        return
    end
    local playerId = killedUnit:GetPlayerOwnerID()
    if playerId == nil or playerId < 0 then
        return
    end
    local playerState = self.state.players:get(playerId)
    if not playerState then
        return
    end
    playerState.isAlive = false
    playerState.respawnAt = now(nil) + FAST_RESPAWN_SECONDS
    syncPlayerState(nil, self.state, playerId)
end
function OneShotGameMode.prototype.onHeroSelected(self, payload)
    if payload.PlayerID == nil or not payload.heroId then
        return
    end
    local playerId = payload.PlayerID
    local heroId = payload.heroId
    local team = PlayerResource:GetTeam(playerId)
    local playerState = self.state:ensurePlayer(playerId, team)
    playerState.heroId = heroId
    self.confirmedHeroSelection:add(playerId)
    syncPlayerState(nil, self.state, playerId)
    local overrideName = self.HERO_OVERRIDES[heroId]
    if overrideName ~= nil and overrideName ~= "" then
        PlayerResource:ReplaceHeroWith(playerId, overrideName, 0, 0)
    end
end
function OneShotGameMode.prototype.applyHeroPrototype(self, hero, heroId)
    local definition = HERO_DEFINITIONS[heroId]
    hero:SetCustomDeathXP(0)
    hero:SetAbilityPoints(0)
    hero:SetAttackCapability(DOTA_UNIT_CAP_NO_ATTACK)
    hero:SetAcquisitionRange(0)
    hero:SetBaseMoveSpeed(300)
    hero:SetModelScale(0.98)
end
function OneShotGameMode.prototype.processRespawns(self)
    for ____, ____value in __TS__Iterator(self.state.players) do
        local playerId = ____value[1]
        local playerState = ____value[2]
        do
            local __continue36
            repeat
                if playerState.isAlive or playerState.respawnAt > now(nil) then
                    __continue36 = true
                    break
                end
                local hero = PlayerResource:GetSelectedHeroEntity(playerId)
                if not hero then
                    __continue36 = true
                    break
                end
                playerState.isAlive = true
                playerState.respawnAt = 0
                hero:RespawnHero(false, false)
                hero:SetHealth(1)
                FindClearSpaceForUnit(
                    hero,
                    self:findSpawnPoint(playerId),
                    true
                )
                syncPlayerState(nil, self.state, playerId)
                __continue36 = true
            until true
            if not __continue36 then
                break
            end
        end
    end
end
function OneShotGameMode.prototype.checkMatchEnd(self)
    if self.state.phase ~= "in_progress" then
        return
    end
    if now(nil) - self.state.startedAt >= GAME_LENGTH_SECONDS then
        self:finishMatchByScore()
        return
    end
    for ____, playerState in __TS__Iterator(self.state.players:values()) do
        if playerState.kills >= 15 then
            self.state.phase = "post_game"
            self.state.winnerTeamId = playerState.teamId
            CustomGameEventManager:Send_ServerToAllClients(
                EVENT_NAMES.matchEnded,
                self.state:snapshot()
            )
        end
    end
end
function OneShotGameMode.prototype.finishMatchByScore(self)
    local bestKills = -1
    local winningTeam
    for ____, playerState in __TS__Iterator(self.state.players:values()) do
        if playerState.kills > bestKills then
            bestKills = playerState.kills
            winningTeam = playerState.teamId
        end
    end
    self.state.phase = "post_game"
    self.state.winnerTeamId = winningTeam
    CustomGameEventManager:Send_ServerToAllClients(
        EVENT_NAMES.matchEnded,
        self.state:snapshot()
    )
end
function OneShotGameMode.prototype.findSpawnPoint(self, playerId)
    local modePrefix = self.state.matchMode == "duo" and MAP_ENTITY_PREFIX.spawnDuo or MAP_ENTITY_PREFIX.spawnFfa
    local entity = Entities:FindByName(
        nil,
        modePrefix .. tostring(playerId + 1)
    )
    if entity then
        return entity:GetAbsOrigin()
    end
    local fallback = Vector(0, 0, 256)
    return fallback + RandomVector(RandomInt(80, 280))
end
function OneShotGameMode.prototype.filterOrders(self, event)
    if event.order_type == DOTA_UNIT_ORDER_ATTACK_MOVE or event.order_type == DOTA_UNIT_ORDER_ATTACK_TARGET then
        return false
    end
    return true
end
return ____exports
