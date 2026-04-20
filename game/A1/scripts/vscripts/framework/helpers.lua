--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
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
-- End of Lua Library inline imports
local ____exports = {}
do
    local g = _G
    if g.vec3_zero == nil then
        g.vec3_zero = Vector(0, 0, 0)
    end
    if type(g.IsValid) ~= "function" then
        g.IsValid = function(____, h) return h ~= nil and h ~= nil and type(h.IsNull) == "function" and not h:IsNull() end
    end
    if type(g.traceback) ~= "function" then
        g.traceback = function(____, message)
            print("[Error]: " .. tostring(message))
            return message
        end
    end
    if type(g.shallowcopy) ~= "function" then
        g.shallowcopy = function(____, t)
            if type(t) ~= "table" or t == nil then
                return t
            end
            local copy = {}
            for k, v in pairs(t) do
                copy[k] = v
            end
            return copy
        end
    end
    if type(g.VectorIsZero) ~= "function" then
        g.VectorIsZero = function(____, v) return v.x == 0 and v.y == 0 and v.z == 0 end
    end
    if type(g.VectorLerp) ~= "function" then
        g.VectorLerp = function(____, t, a, b) return Vector(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t) end
    end
    if type(g.RemapValClamped) ~= "function" then
        g.RemapValClamped = function(____, val, a, b, c, d)
            if a == b then
                return val >= b and d or c
            end
            local t = (val - a) / (b - a)
            if t < 0 then
                t = 0
            end
            if t > 1 then
                t = 1
            end
            return c + (d - c) * t
        end
    end
    if type(g.ArrayRemove) ~= "function" then
        g.ArrayRemove = function(____, arr, value)
            if arr == nil then
                return
            end
            local idx = __TS__ArrayIndexOf(arr, value)
            if idx >= 0 then
                __TS__ArraySplice(arr, idx, 1)
            end
        end
    end
    if type(g.TableFindKey) ~= "function" then
        g.TableFindKey = function(____, arr, value)
            if arr == nil then
                return nil
            end
            for k, v in pairs(arr) do
                if v == value then
                    return k
                end
            end
            return nil
        end
    end
    if type(g.Round) ~= "function" then
        g.Round = function(____, value, decimals)
            local factor = 10 ^ (decimals or 0)
            return math.floor(value * factor + 0.5) / factor
        end
    end
    if type(g.CalcDirection2D) ~= "function" then
        g.CalcDirection2D = function(____, from, to)
            local dx = to.x - from.x
            local dy = to.y - from.y
            local len = math.sqrt(dx * dx + dy * dy)
            if len < 0.0001 then
                return Vector(0, 0, 0)
            end
            return Vector(dx / len, dy / len, 0)
        end
    end
    if type(g.AngleDiff) ~= "function" then
        g.AngleDiff = function(____, a, b)
            local diff = a - b
            while diff > 180 do
                diff = diff - 360
            end
            while diff < -180 do
                diff = diff + 360
            end
            return diff
        end
    end
    if type(g.GetRingTrackRadius) ~= "function" then
        g.GetRingTrackRadius = function(____, _caster) return 0 end
    end
    if g.StateEnum == nil then
        g.StateEnum = {DODGE_BULLET = "dodge_bullet"}
    end
    if g.Event == nil then
        g.Event = {Fire = function(____, _eventName, _data)
        end}
    end
end
do
    local ____opt_result_2
    if CDOTA_BaseNPC ~= nil then
        ____opt_result_2 = CDOTA_BaseNPC.prototype
    end
    local baseNpcProto = ____opt_result_2
    if baseNpcProto ~= nil and type(baseNpcProto.HasState) ~= "function" then
        baseNpcProto.HasState = function(self, _state)
            return false
        end
    end
end
return ____exports
