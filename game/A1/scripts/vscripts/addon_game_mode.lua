--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local ____game_mode = require("game_mode")
local OneShotGameMode = ____game_mode.OneShotGameMode
if not GameRules.OneShotGameMode then
    GameRules.OneShotGameMode = __TS__New(OneShotGameMode)
end
GameRules.OneShotGameMode:init()
return ____exports
