--- @param kv CScriptKeyValues
function Spawn(kv)
	-- local type = kv:GetValue("skin") == "1" and 1 or 0
	-- thisEntity:SetContextThink("delay_add", function()
	-- 	local ability = thisEntity:AddAbility("custom_point_portal")
	-- 	if ability then
	-- 		ability:SetLevel(1)
	-- 	end
	-- 	print("addddddddddddddddddd")
	-- 	return true
	-- end, 5)
	local ability = thisEntity:AddAbility("custom_point_portal")
	if ability then
		ability:SetLevel(1)
	end

	
end