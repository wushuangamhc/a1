--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
local function __TS__ObjectAssign(target, ...)
    local sources = {...}
    for i = 1, #sources do
        local source = sources[i]
        for key in pairs(source) do
            target[key] = source[key]
        end
    end
    return target
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
-- End of Lua Library inline imports
local ____exports = {}
local ____config = require("shared.config")
local NET_TABLES = ____config.NET_TABLES
function ____exports.syncPlayerState(self, state, playerId)
    local player = state.players:get(playerId)
    if not player then
        return
    end
    CustomNetTables:SetTableValue(
        NET_TABLES.playerState,
        tostring(playerId),
        __TS__ObjectAssign({}, player)
    )
end
function ____exports.syncScoreboard(self, state)
    local entries = {}
    for ____, ____value in __TS__Iterator(state.players) do
        local playerId = ____value[1]
        local player = ____value[2]
        local name = PlayerResource:GetPlayerName(playerId) or "Player " .. tostring(playerId)
        entries[tostring(playerId)] = {
            playerId = playerId,
            playerName = name,
            heroId = player.heroId,
            kills = player.kills,
            deaths = player.deaths,
            blessingId = player.blessingId,
            isAlive = player.isAlive,
            teamId = player.teamId
        }
    end
    CustomNetTables:SetTableValue(NET_TABLES.matchState, "scoreboard", entries)
    CustomNetTables:SetTableValue(
        NET_TABLES.matchState,
        "snapshot",
        state:snapshot()
    )
end
function ____exports.syncMapObjects(self, objects)
    for ____, objectState in ipairs(objects) do
        CustomNetTables:SetTableValue(NET_TABLES.mapState, objectState.id, objectState)
    end
end
return ____exports
