--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local function Spawn(kv)
    local ability = thisEntity:AddAbility("custom_point_portal")
    if ability ~= nil then
        ability:SetLevel(1)
    end
end
_G.Spawn = Spawn
return ____exports
