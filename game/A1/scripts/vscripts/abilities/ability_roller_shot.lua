--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
local function __TS__Class(self)
    local c = {prototype = {}}
    c.prototype.__index = c.prototype
    c.prototype.constructor = c
    return c
end

local function __TS__ClassExtends(target, base)
    target.____super = base
    local staticMetatable = setmetatable({__index = base}, base)
    setmetatable(target, staticMetatable)
    local baseMetatable = getmetatable(base)
    if baseMetatable then
        if type(baseMetatable.__index) == "function" then
            staticMetatable.__index = baseMetatable.__index
        end
        if type(baseMetatable.__newindex) == "function" then
            staticMetatable.__newindex = baseMetatable.__newindex
        end
    end
    setmetatable(target.prototype, base.prototype)
    if type(base.prototype.__index) == "function" then
        target.prototype.__index = base.prototype.__index
    end
    if type(base.prototype.__newindex) == "function" then
        target.prototype.__newindex = base.prototype.__newindex
    end
    if type(base.prototype.__tostring) == "function" then
        target.prototype.__tostring = base.prototype.__tostring
    end
end
-- End of Lua Library inline imports
local ____exports = {}
local ____base_ability = require("abilities.base_ability")
local AbilityBase = ____base_ability.AbilityBase
____exports.ability_roller_shot = __TS__Class()
local ability_roller_shot = ____exports.ability_roller_shot
ability_roller_shot.name = "ability_roller_shot"
__TS__ClassExtends(ability_roller_shot, AbilityBase)
function ability_roller_shot.prototype.OnSpellStart(self)
    local ____self = self
    local caster = ____self:GetCaster()
    local playerId = caster:GetPlayerOwnerID()
    if playerId == nil or playerId < 0 then
        return
    end
    local target = ____self:GetCursorPosition()
    local payload = {targetX = target.x, targetY = target.y, targetZ = target.z, chargePct = 0}
    local gameMode = GameRules.OneShotGameMode
    gameMode.combat:handleFire(playerId, payload)
end
function ability_roller_shot.prototype.GetCastRange(self, location, target)
    return 1000
end
return ____exports
