--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
local function __TS__ObjectAssign(target, ...)
    local sources = {...}
    for i = 1, #sources do
        local source = sources[i]
        for key in pairs(source) do
            target[key] = source[key]
        end
    end
    return target
end
-- End of Lua Library inline imports
local ____exports = {}
--- 重载装饰器
-- 从 c1 项目迁移：用于在脚本重载时复用同一个原型对象，保留运行时引用。
local reloadGlobal = _G
if reloadGlobal.reloadCache == nil then
    reloadGlobal.reloadCache = {}
end
function ____exports.reloadable(self, constructor)
    local className = constructor.name
    if reloadGlobal.reloadCache[className] == nil then
        reloadGlobal.reloadCache[className] = constructor
    end
    __TS__ObjectAssign(reloadGlobal.reloadCache[className].prototype, constructor.prototype)
    return reloadGlobal.reloadCache[className]
end
return ____exports
