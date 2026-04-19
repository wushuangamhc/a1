--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local triggerActive = true
local n = 0
local function OnStartTouch(trigger)
    local triggerName = thisEntity:GetName()
    local model = triggerName .. "_model"
    local npc = Entities:FindByNameWithin(
        nil,
        triggerName .. "_npc",
        thisEntity:GetAbsOrigin(),
        6000
    )
    if not npc then
        return
    end
    if npc.fNextAttackTime and npc.fNextAttackTime >= GameRules:GetGameTime() then
        return
    end
    local target = Entities:FindByNameWithin(
        nil,
        triggerName .. "_target",
        thisEntity:GetAbsOrigin(),
        6000
    )
    local fireTrap = npc:FindAbilityByName("custom_pudge_hook_trap")
    local fire_delay = 0.03
    local reset_time = 3
    local activator = trigger.activator
    npc:SetContextThink(
        "pudge_hook_trap_anim",
        function()
            DoEntFire(
                model,
                "SetAnimation",
                "fang_attack",
                0.4,
                nil,
                nil
            )
            npc:SetContextThink(
                "pudge_hook_trap_cast",
                function()
                    fireTrap.activator = activator
                    local offset = Vector(
                        math.random(-500, 500),
                        math.random(-500, 500),
                        0
                    )
                    local targetPos = target:GetOrigin():__add(offset)
                    npc:CastAbilityOnPosition(targetPos, fireTrap, -1)
                    return nil
                end,
                0.3
            )
            return nil
        end,
        fire_delay
    )
    local heroIndex = trigger.activator:GetEntityIndex()
    local heroHandle = EntIndexToHScript(heroIndex)
    print(
        "Trap Button Trigger Entered",
        heroHandle:GetUnitName()
    )
    npc.KillerToCredit = heroHandle
    triggerActive = false
    npc.fRefireTime = 1.8
    npc.fQuickRefireTime = reset_time
    npc.bNextAttackIsNormal = false
    npc.nQuickRefires = 0
    npc.fNextAttackTime = GameRules:GetGameTime() + npc.fQuickRefireTime
end
local function OnEndTouch(trigger)
end
_G.OnStartTouch = OnStartTouch
_G.OnEndTouch = OnEndTouch
return ____exports
