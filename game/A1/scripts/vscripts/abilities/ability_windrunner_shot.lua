ability_windrunner_shot = ability_windrunner_shot or class({})

function ability_windrunner_shot:OnSpellStart()
    local caster = self:GetCaster()
    local playerId = caster:GetPlayerOwnerID()
    if playerId == nil or playerId < 0 then
        return
    end

    local target = self:GetCursorPosition()
    local payload = {targetX = target.x, targetY = target.y, targetZ = target.z, chargePct = 0}
    local gameMode = GameRules.OneShotGameMode
    gameMode.combat:handleFire(playerId, payload)
end

function ability_windrunner_shot:GetCastRange(location, target)
    return 1100
end
