--- @param kv CScriptKeyValues
function Spawn(kv)
	local type = kv:GetValue("skin") == "1" and 1 or 0
	thisEntity:AddNewModifier(thisEntity, nil, "modifier_custom_portal", { type = type })
end