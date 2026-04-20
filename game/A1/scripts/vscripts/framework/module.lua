--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
local function __TS__Class(self)
    local c = {prototype = {}}
    c.prototype.__index = c.prototype
    c.prototype.constructor = c
    return c
end

local function __TS__ArrayIndexOf(self, searchElement, fromIndex)
    if fromIndex == nil then
        fromIndex = 0
    end
    local len = #self
    if len == 0 then
        return -1
    end
    if fromIndex >= len then
        return -1
    end
    if fromIndex < 0 then
        fromIndex = len + fromIndex
        if fromIndex < 0 then
            fromIndex = 0
        end
    end
    for i = fromIndex + 1, len do
        if self[i] == searchElement then
            return i - 1
        end
    end
    return -1
end

local function __TS__CountVarargs(...)
    return select("#", ...)
end

local function __TS__ArraySplice(self, ...)
    local args = {...}
    local len = #self
    local actualArgumentCount = __TS__CountVarargs(...)
    local start = args[1]
    local deleteCount = args[2]
    if start < 0 then
        start = len + start
        if start < 0 then
            start = 0
        end
    elseif start > len then
        start = len
    end
    local itemCount = actualArgumentCount - 2
    if itemCount < 0 then
        itemCount = 0
    end
    local actualDeleteCount
    if actualArgumentCount == 0 then
        actualDeleteCount = 0
    elseif actualArgumentCount == 1 then
        actualDeleteCount = len - start
    else
        actualDeleteCount = deleteCount or 0
        if actualDeleteCount < 0 then
            actualDeleteCount = 0
        end
        if actualDeleteCount > len - start then
            actualDeleteCount = len - start
        end
    end
    local out = {}
    for k = 1, actualDeleteCount do
        local from = start + k
        if self[from] ~= nil then
            out[k] = self[from]
        end
    end
    if itemCount < actualDeleteCount then
        for k = start + 1, len - actualDeleteCount do
            local from = k + actualDeleteCount
            local to = k + itemCount
            if self[from] then
                self[to] = self[from]
            else
                self[to] = nil
            end
        end
        for k = len - actualDeleteCount + itemCount + 1, len do
            self[k] = nil
        end
    elseif itemCount > actualDeleteCount then
        for k = len - actualDeleteCount, start + 1, -1 do
            local from = k + actualDeleteCount
            local to = k + itemCount
            if self[from] then
                self[to] = self[from]
            else
                self[to] = nil
            end
        end
    end
    local j = start + 1
    for i = 3, actualArgumentCount do
        self[j] = args[i]
        j = j + 1
    end
    for k = #self, len - actualDeleteCount + itemCount + 1, -1 do
        self[k] = nil
    end
    return out
end

local function __TS__ArraySort(self, compareFn)
    if compareFn ~= nil then
        table.sort(
            self,
            function(a, b) return compareFn(nil, a, b) < 0 end
        )
    else
        table.sort(self)
    end
    return self
end

local function __TS__ArrayForEach(self, callbackFn, thisArg)
    for i = 1, #self do
        callbackFn(thisArg, self[i], i - 1, self)
    end
end
-- End of Lua Library inline imports
local ____exports = {}
if _G.Modules == nil then
    _G.Modules = {}
end
____exports.CModule = __TS__Class()
local CModule = ____exports.CModule
CModule.name = "CModule"
function CModule.prototype.____constructor(self)
    self.isModule = true
    Modules[#Modules + 1] = self
end
function CModule.prototype.init(self, _reload)
end
function CModule.prototype.initPriority(self)
    return 0
end
function CModule.prototype.dispose(self)
    local idx = __TS__ArrayIndexOf(Modules, self)
    if idx >= 0 then
        __TS__ArraySplice(Modules, idx, 1)
    end
end
function CModule.initialize(self)
    __TS__ArrayForEach(
        __TS__ArraySort(
            Modules,
            function(____, a, b) return b:initPriority() - a:initPriority() end
        ),
        function(____, m) return m:init(false) end
    )
end
function CModule.reload(self)
    __TS__ArrayForEach(
        __TS__ArraySort(
            Modules,
            function(____, a, b) return b:initPriority() - a:initPriority() end
        ),
        function(____, m) return m:init(true) end
    )
end
function CModule.prototype.print(self, ...)
    print(
        (("[" .. tostring(self.constructor.name)) .. (IsClient() and " Client" or "")) .. "]: ",
        ...
    )
end
function CModule.prototype.error(self, ...)
    print(
        ((("[" .. tostring(self.constructor.name)) .. " ERROR") .. (IsClient() and " Client" or "")) .. "]: ",
        ...
    )
end
function CModule.prototype.reset(self)
end
function CModule.reset(self)
    __TS__ArrayForEach(
        Modules,
        function(____, m) return m:reset() end
    )
end
return ____exports
