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
local ____module = require("framework.module")
local CModule = ____module.CModule
require("framework.timer")
require("systems.bullet")
local function Activate(self)
    print("[A1] Activate() called by Dota engine")
    if not GameRules.OneShotGameMode then
        GameRules.OneShotGameMode = __TS__New(OneShotGameMode)
        print("[A1] OneShotGameMode instance created")
    end
    CModule:initialize()
    print("[A1] CModule.initialize() finished")
    GameRules.OneShotGameMode:init()
    print("[A1] OneShotGameMode.init() finished")
end
_G.Activate = Activate
print("[A1] addon_game_mode.lua loaded, _G.Activate registered")
return ____exports
