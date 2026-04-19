--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
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
        EVENT_NAMES.fireProjectile,
        function(_, payload)
            local playerId = payload.PlayerID
            self.combat:handleFire(playerId, payload)
        end
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
    if state == 8 then
        self.state.phase = "pregame"
        syncScoreboard(nil, self.state)
        return
    end
    if state == 10 and not self.gameStarted then
        self:checkAllHeroesSelected()
    end
end
function OneShotGameMode.prototype.checkAllHeroesSelected(self)
    if self.gameStarted or self.state.phase == "post_game" then
        return
    end
    local playerCount = PlayerResource:GetPlayerCountForTeam(2) + PlayerResource:GetPlayerCountForTeam(3)
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
    local hero = PlayerResource:GetSelectedHeroEntity(playerId)
    local team = PlayerResource:GetTeam(playerId)
    local playerState = self.state:ensurePlayer(playerId, team)
    playerState.heroId = payload.heroId
    self.confirmedHeroSelection:add(playerId)
    syncPlayerState(nil, self.state, playerId)
    if hero then
        self:applyHeroPrototype(hero, payload.heroId)
    end
end
function OneShotGameMode.prototype.applyHeroPrototype(self, hero, heroId)
    local definition = HERO_DEFINITIONS[heroId]
    hero:SetCustomDeathXP(0)
    hero:SetAbilityPoints(0)
    hero:SetAttackCapability(0)
    hero:SetAcquisitionRange(0)
    hero:SetBaseMoveSpeed(300)
    hero:SetModelScale(0.98)
end
function OneShotGameMode.prototype.processRespawns(self)
    for ____, ____value in __TS__Iterator(self.state.players) do
        local playerId = ____value[1]
        local playerState = ____value[2]
        do
            local __continue37
            repeat
                if playerState.isAlive or playerState.respawnAt > now(nil) then
                    __continue37 = true
                    break
                end
                local hero = PlayerResource:GetSelectedHeroEntity(playerId)
                if not hero then
                    __continue37 = true
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
                __continue37 = true
            until true
            if not __continue37 then
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
    if event.order_type == 3 or event.order_type == 4 then
        return false
    end
    return true
end
return ____exports
