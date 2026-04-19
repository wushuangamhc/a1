--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
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
