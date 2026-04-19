--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
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
