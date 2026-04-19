--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
local function __TS__New(target, ...)
    local instance = setmetatable({}, target.prototype)
    instance:____constructor(...)
    return instance
end
-- End of Lua Library inline imports
local ____exports = {}
local ____game_mode = require("game_mode")
local OneShotGameMode = ____game_mode.OneShotGameMode
if not GameRules.OneShotGameMode then
    GameRules.OneShotGameMode = __TS__New(OneShotGameMode)
end
GameRules.OneShotGameMode:init()
return ____exports
