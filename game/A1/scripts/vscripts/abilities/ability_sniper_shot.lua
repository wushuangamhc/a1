ability_sniper_shot = ability_sniper_shot or class({})

local function ensureGameMode()
    local gameMode = GameRules.OneShotGameMode
    if gameMode ~= nil then
        return gameMode
    end
    if type(_G.Activate) == "function" then
        print("[ability_sniper_shot] GameRules.OneShotGameMode missing, invoking _G.Activate() as fallback")
        local ok, err = pcall(_G.Activate)
        if not ok then
            print("[ability_sniper_shot] fallback Activate() failed: " .. tostring(err))
        end
    end
    return GameRules.OneShotGameMode
end

function ability_sniper_shot:OnSpellStart()
    local caster = self:GetCaster()
    local playerId = caster:GetPlayerOwnerID()
    if playerId == nil or playerId < 0 then
        return
    end

    local gameMode = ensureGameMode()
    if gameMode == nil or gameMode.combat == nil then
        print("[ability_sniper_shot] OneShotGameMode unavailable, abort fire")
        return
    end

    local target = self:GetCursorPosition()
    local payload = {targetX = target.x, targetY = target.y, targetZ = target.z, chargePct = 1}
    gameMode.combat:handleFire(playerId, payload)
end

function ability_sniper_shot:GetCastRange(location, target)
    return 1350
end
