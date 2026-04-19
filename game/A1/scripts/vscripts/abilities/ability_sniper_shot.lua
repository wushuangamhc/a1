ability_sniper_shot = ability_sniper_shot or class({})

function ability_sniper_shot:OnSpellStart()
    local caster = self:GetCaster()
    local playerId = caster:GetPlayerOwnerID()
    if playerId == nil or playerId < 0 then
        return
    end

    local target = self:GetCursorPosition()
    local payload = {targetX = target.x, targetY = target.y, targetZ = target.z, chargePct = 1}
    local gameMode = GameRules.OneShotGameMode
    gameMode.combat:handleFire(playerId, payload)
end

function ability_sniper_shot:GetCastRange(location, target)
    return 1350
end
