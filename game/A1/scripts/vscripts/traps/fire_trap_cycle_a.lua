--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local FireTrapActivateAlternating, QuickRefire, NormalRefire
function FireTrapActivateAlternating()
    if not IsServer() then
        return nil
    end
    if thisEntity.bDisabled then
        return -1
    end
    if GameRules:IsGamePaused() then
        return 0.5
    end
    if GameRules:GetGameTime() >= thisEntity.fNextAttackTime then
        if thisEntity.bNextAttackIsNormal == false then
            return QuickRefire()
        else
            return NormalRefire()
        end
    end
    return 0.25
end
function QuickRefire()
    DoEntFire(
        thisEntity.modelName,
        "SetAnimation",
        "bark_attack",
        0.4,
        nil,
        nil
    )
    thisEntity.bindNpc:SetContextThink(
        "QuickRefireCast",
        function()
            thisEntity.bindNpc:CastAbilityOnPosition(
                thisEntity.hTarget:GetAbsOrigin(),
                thisEntity.hBreatheFireAbility,
                -1
            )
            return nil
        end,
        0.3
    )
    thisEntity.nQuickRefires = thisEntity.nQuickRefires + 1
    if thisEntity.nQuickRefires <= 2 then
        thisEntity.fNextAttackTime = GameRules:GetGameTime() + thisEntity.fQuickRefireTime
    else
        thisEntity.bNextAttackIsNormal = true
        thisEntity.fNextAttackTime = GameRules:GetGameTime() + thisEntity.fRefireTime
        thisEntity.nQuickRefires = 0
    end
    return 0.25
end
function NormalRefire()
    DoEntFire(
        thisEntity.modelName,
        "SetAnimation",
        "bark_attack",
        0.4,
        nil,
        nil
    )
    thisEntity.bindNpc:SetContextThink(
        "NormalRefireCast",
        function()
            thisEntity.bindNpc:CastAbilityOnPosition(
                thisEntity.hTarget:GetAbsOrigin(),
                thisEntity.hBreatheFireAbility,
                -1
            )
            return nil
        end,
        0.3
    )
    thisEntity.fNextAttackTime = GameRules:GetGameTime() + thisEntity.fRefireTime
    thisEntity.bNextAttackIsNormal = false
    return 0.25
end
local function OnStartTouch(trigger)
end
local function OnEndTouch(trigger)
end
local function StartLogic(trigger)
    local triggerName = thisEntity:GetName()
    local npc = Entities:FindByNameWithin(
        nil,
        triggerName .. "_npc",
        thisEntity:GetAbsOrigin(),
        4000
    )
    if not npc then
        return
    end
    local target = Entities:FindByNameWithin(
        nil,
        triggerName .. "_target",
        thisEntity:GetAbsOrigin(),
        4000
    )
    if not target then
        return
    end
    thisEntity.bindNpc = npc
    local breatheFire = npc:FindAbilityByName("breathe_fire")
    if not breatheFire then
        print("ERROR: thisEntity.hBreatheFireAbility not found")
        return
    end
    thisEntity.hBreatheFireAbility = breatheFire
    local model = triggerName .. "_model"
    thisEntity.modelName = model
    thisEntity.fRefireTime = 1.8
    thisEntity.fQuickRefireTime = 0.5
    thisEntity.bNextAttackIsNormal = false
    thisEntity.hTarget = target
    thisEntity.nQuickRefires = 0
    thisEntity.fNextAttackTime = GameRules:GetGameTime() + thisEntity.fQuickRefireTime
    thisEntity:SetContextThink(
        "FireTrapActivateAlternating",
        function() return FireTrapActivateAlternating() end,
        0
    )
end
local function DisableTrap(trigger)
    thisEntity.bDisabled = true
end
_G.OnStartTouch = OnStartTouch
_G.OnEndTouch = OnEndTouch
_G.StartLogic = StartLogic
_G.DisableTrap = DisableTrap
_G.FireTrapActivateAlternating = FireTrapActivateAlternating
_G.QuickRefire = QuickRefire
_G.NormalRefire = NormalRefire
return ____exports
