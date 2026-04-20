ability_windrunner_shot = ability_windrunner_shot or class({})

local function ensureGameMode()
    local gameMode = GameRules.OneShotGameMode
    if gameMode ~= nil then
        return gameMode
    end
    -- Activate 可能因引擎初始化时序未跑过，这里兜底拉起一次
    if type(_G.Activate) == "function" then
        print("[ability_windrunner_shot] GameRules.OneShotGameMode missing, invoking _G.Activate() as fallback")
        local ok, err = pcall(_G.Activate)
        if not ok then
            print("[ability_windrunner_shot] fallback Activate() failed: " .. tostring(err))
        end
    end
    return GameRules.OneShotGameMode
end

function ability_windrunner_shot:OnSpellStart()
    local caster = self:GetCaster()
    local playerId = caster:GetPlayerOwnerID()
    if playerId == nil or playerId < 0 then
        return
    end

    local gameMode = ensureGameMode()
    if gameMode == nil or gameMode.combat == nil then
        print("[ability_windrunner_shot] OneShotGameMode unavailable, abort fire")
        return
    end

    local target = self:GetCursorPosition()
    local payload = {targetX = target.x, targetY = target.y, targetZ = target.z, chargePct = 0}
    gameMode.combat:handleFire(playerId, payload)
end

function ability_windrunner_shot:GetCastRange(location, target)
    return 1100
end
