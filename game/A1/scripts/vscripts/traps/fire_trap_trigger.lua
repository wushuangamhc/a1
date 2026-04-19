
--[[ fire_trap_trigger.lua ]]

--按钮式火焰陷阱

--踩陷阱后会延迟x秒发射火焰

local triggerActive = true
local n=0
function OnStartTouch(trigger)
    local triggerName = thisEntity:GetName()
    local model = triggerName .. "_model"
    -- local npc = Entities:FindByName( nil, triggerName .. "_npc" )
    local npc = Entities:FindByNameWithin(nil, triggerName .. "_npc", thisEntity:GetAbsOrigin(), 4000)
    if not npc then
        return
    end
    if npc.fNextAttackTime and npc.fNextAttackTime>=GameRules:GetGameTime() then
        return
    end
    -- local target = Entities:FindByName( nil, triggerName .. "_target" )
    local target = Entities:FindByNameWithin(nil, triggerName .. "_target", thisEntity:GetAbsOrigin(), 4000)
    local fireTrap = npc:FindAbilityByName("breathe_fire")

    local fire_delay = 0.03
    local reset_time = 1
    
    local activator = trigger.activator

    
    npc:GameTimer(fire_delay, function()
        DoEntFire( model, "SetAnimation", "bark_attack", .4, self, self )
        npc:GameTimer(0.3, function()
            fireTrap.activator = activator
            npc:CastAbilityOnPosition(target:GetOrigin(), fireTrap, -1 )
        end)
    end)
    
    -- npc:CastAbilityOnPosition(target:GetOrigin(), fireTrap, -1 )
    -- npc:SetContextThink( "ResetButtonModel", function() ResetButtonModel() end, 0 )
    
    local heroIndex = trigger.activator:GetEntityIndex()
    local heroHandle = EntIndexToHScript(heroIndex)


    print("Trap Button Trigger Entered",heroHandle:GetUnitName())

    npc.KillerToCredit = heroHandle
    triggerActive = false
    npc.fRefireTime = 1.8
    npc.fQuickRefireTime = reset_time
    npc.bNextAttackIsNormal = false

    npc.nQuickRefires = 0
    npc.fNextAttackTime = GameRules:GetGameTime() + npc.fQuickRefireTime
end

function OnEndTouch(trigger)
   
end

