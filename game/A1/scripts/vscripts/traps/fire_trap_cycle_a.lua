--循环形火焰陷阱
--会在单次与连续3次喷射之间交替触发

-- 陷阱在一个时间点进行初始化 如果想错开时间点  可以在锤子中设置StartLogic的delay

function OnStartTouch(trigger)

end

function OnEndTouch(trigger)
   
end




function StartLogic( trigger )
    local triggerName = thisEntity:GetName()
    -- local npc = Entities:FindByName( nil, triggerName .. "_npc" )
	local npc = Entities:FindByNameWithin(nil, triggerName .. "_npc", thisEntity:GetAbsOrigin(), 4000)
    if not npc then
        return
    end
    -- local target = Entities:FindByName( nil, triggerName .. "_target" )
	local target = Entities:FindByNameWithin(nil, triggerName .. "_target", thisEntity:GetAbsOrigin(), 4000)
    if not target then
        return
    end

    thisEntity.bindNpc = npc
	thisEntity.hBreatheFireAbility = npc:FindAbilityByName( "breathe_fire" )
	if thisEntity.hBreatheFireAbility == nil then
		print( "ERROR: thisEntity.hBreatheFireAbility not found" )
		return
	end
    local model = triggerName .. "_model"

    thisEntity.modelName = model
	thisEntity.fRefireTime = 1.8
	thisEntity.fQuickRefireTime = 0.5
	thisEntity.bNextAttackIsNormal = false
    thisEntity.hTarget = target

	thisEntity.nQuickRefires = 0
	thisEntity.fNextAttackTime = GameRules:GetGameTime() + thisEntity.fQuickRefireTime

	thisEntity:SetContextThink( "FireTrapActivateAlternating", function() return FireTrapActivateAlternating() end, 0 )
end

---------------------------------------------------------------------------

function DisableTrap( trigger )
	thisEntity.bDisabled = true
end

---------------------------------------------------------------------------

function FireTrapActivateAlternating()
	if not IsServer() then
		return
	end

	if thisEntity.bDisabled then
		return -1
	end

	if GameRules:IsGamePaused() == true then
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

---------------------------------------------------------------------------

function QuickRefire()

    DoEntFire(  thisEntity.modelName, "SetAnimation", "bark_attack", .4, self, self )
	
    thisEntity:GameTimer(0.3, function()
        thisEntity.bindNpc:CastAbilityOnPosition(  thisEntity.hTarget:GetAbsOrigin(), thisEntity.hBreatheFireAbility, -1 )
    end)
	thisEntity.nQuickRefires = thisEntity.nQuickRefires + 1

	if thisEntity.nQuickRefires <= 2 then
		thisEntity.fNextAttackTime = GameRules:GetGameTime() + thisEntity.fQuickRefireTime
	else
		thisEntity.bNextAttackIsNormal = true
		thisEntity.fNextAttackTime = GameRules:GetGameTime() + thisEntity.fRefireTime
		thisEntity.nQuickRefires = 0 -- reset counter
	end

	return 0.25
end

---------------------------------------------------------------------------

function NormalRefire()

    DoEntFire(  thisEntity.modelName, "SetAnimation", "bark_attack", .4, self, self )
	-- thisEntity:CastAbilityOnPosition( thisEntity:GetTrapTarget(), thisEntity.hBreatheFireAbility, -1 )
    thisEntity:GameTimer(0.3, function()
        thisEntity.bindNpc:CastAbilityOnPosition( thisEntity.hTarget:GetAbsOrigin(), thisEntity.hBreatheFireAbility, -1 )
    end)

	thisEntity.fNextAttackTime = GameRules:GetGameTime() + thisEntity.fRefireTime
	thisEntity.bNextAttackIsNormal = false

	return 0.25
end

---------------------------------------------------------------------------

