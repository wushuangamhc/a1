--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local function Spawn(kv)
    local skin = kv:GetValue("skin")
    local ____type = skin == "1" and 1 or 0
    thisEntity:AddNewModifier(thisEntity, nil, "modifier_custom_portal", {type = ____type})
end
_G.Spawn = Spawn
return ____exports
