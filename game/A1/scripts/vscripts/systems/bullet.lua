--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
local function __TS__Class(self)
    local c = {prototype = {}}
    c.prototype.__index = c.prototype
    c.prototype.constructor = c
    return c
end

local function __TS__ClassExtends(target, base)
    target.____super = base
    local staticMetatable = setmetatable({__index = base}, base)
    setmetatable(target, staticMetatable)
    local baseMetatable = getmetatable(base)
    if baseMetatable then
        if type(baseMetatable.__index) == "function" then
            staticMetatable.__index = baseMetatable.__index
        end
        if type(baseMetatable.__newindex) == "function" then
            staticMetatable.__newindex = baseMetatable.__newindex
        end
    end
    setmetatable(target.prototype, base.prototype)
    if type(base.prototype.__index) == "function" then
        target.prototype.__index = base.prototype.__index
    end
    if type(base.prototype.__newindex) == "function" then
        target.prototype.__newindex = base.prototype.__newindex
    end
    if type(base.prototype.__tostring) == "function" then
        target.prototype.__tostring = base.prototype.__tostring
    end
end

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

local function __TS__ArrayIsArray(value)
    return type(value) == "table" and (value[1] ~= nil or next(value) == nil)
end

local function __TS__ArrayConcat(self, ...)
    local items = {...}
    local result = {}
    local len = 0
    for i = 1, #self do
        len = len + 1
        result[len] = self[i]
    end
    for i = 1, #items do
        local item = items[i]
        if __TS__ArrayIsArray(item) then
            for j = 1, #item do
                len = len + 1
                result[len] = item[j]
            end
        else
            len = len + 1
            result[len] = item
        end
    end
    return result
end

local function __TS__ArrayFilter(self, callbackfn, thisArg)
    local result = {}
    local len = 0
    for i = 1, #self do
        if callbackfn(thisArg, self[i], i - 1, self) then
            len = len + 1
            result[len] = self[i]
        end
    end
    return result
end

local function __TS__ObjectGetOwnPropertyDescriptor(object, key)
    local metatable = getmetatable(object)
    if not metatable then
        return
    end
    if not rawget(metatable, "_descriptors") then
        return
    end
    return rawget(metatable, "_descriptors")[key]
end

local function __TS__CloneDescriptor(____bindingPattern0)
    local value
    local writable
    local set
    local get
    local configurable
    local enumerable
    enumerable = ____bindingPattern0.enumerable
    configurable = ____bindingPattern0.configurable
    get = ____bindingPattern0.get
    set = ____bindingPattern0.set
    writable = ____bindingPattern0.writable
    value = ____bindingPattern0.value
    local descriptor = {enumerable = enumerable == true, configurable = configurable == true}
    local hasGetterOrSetter = get ~= nil or set ~= nil
    local hasValueOrWritableAttribute = writable ~= nil or value ~= nil
    if hasGetterOrSetter and hasValueOrWritableAttribute then
        error("Invalid property descriptor. Cannot both specify accessors and a value or writable attribute.", 0)
    end
    if get or set then
        descriptor.get = get
        descriptor.set = set
    else
        descriptor.value = value
        descriptor.writable = writable == true
    end
    return descriptor
end

local __TS__DescriptorGet
do
    local getmetatable = _G.getmetatable
    local ____rawget = _G.rawget
    function __TS__DescriptorGet(self, metatable, key)
        while metatable do
            local rawResult = ____rawget(metatable, key)
            if rawResult ~= nil then
                return rawResult
            end
            local descriptors = ____rawget(metatable, "_descriptors")
            if descriptors then
                local descriptor = descriptors[key]
                if descriptor ~= nil then
                    if descriptor.get then
                        return descriptor.get(self)
                    end
                    return descriptor.value
                end
            end
            metatable = getmetatable(metatable)
        end
    end
end

local __TS__DescriptorSet
do
    local getmetatable = _G.getmetatable
    local ____rawget = _G.rawget
    local rawset = _G.rawset
    function __TS__DescriptorSet(self, metatable, key, value)
        while metatable do
            local descriptors = ____rawget(metatable, "_descriptors")
            if descriptors then
                local descriptor = descriptors[key]
                if descriptor ~= nil then
                    if descriptor.set then
                        descriptor.set(self, value)
                    else
                        if descriptor.writable == false then
                            error(
                                ((("Cannot assign to read only property '" .. key) .. "' of object '") .. tostring(self)) .. "'",
                                0
                            )
                        end
                        descriptor.value = value
                    end
                    return
                end
            end
            metatable = getmetatable(metatable)
        end
        rawset(self, key, value)
    end
end

local __TS__SetDescriptor
do
    local getmetatable = _G.getmetatable
    local function descriptorIndex(self, key)
        return __TS__DescriptorGet(
            self,
            getmetatable(self),
            key
        )
    end
    local function descriptorNewIndex(self, key, value)
        return __TS__DescriptorSet(
            self,
            getmetatable(self),
            key,
            value
        )
    end
    function __TS__SetDescriptor(target, key, desc, isPrototype)
        if isPrototype == nil then
            isPrototype = false
        end
        local ____isPrototype_0
        if isPrototype then
            ____isPrototype_0 = target
        else
            ____isPrototype_0 = getmetatable(target)
        end
        local metatable = ____isPrototype_0
        if not metatable then
            metatable = {}
            setmetatable(target, metatable)
        end
        local value = rawget(target, key)
        if value ~= nil then
            rawset(target, key, nil)
        end
        if not rawget(metatable, "_descriptors") then
            metatable._descriptors = {}
        end
        metatable._descriptors[key] = __TS__CloneDescriptor(desc)
        metatable.__index = descriptorIndex
        metatable.__newindex = descriptorNewIndex
    end
end

local function __TS__DecorateLegacy(decorators, target, key, desc)
    local result = target
    do
        local i = #decorators
        while i >= 0 do
            local decorator = decorators[i + 1]
            if decorator ~= nil then
                local oldResult = result
                if key == nil then
                    result = decorator(nil, result)
                elseif desc == true then
                    local value = rawget(target, key)
                    local descriptor = __TS__ObjectGetOwnPropertyDescriptor(target, key) or ({configurable = true, writable = true, value = value})
                    local desc = decorator(nil, target, key, descriptor) or descriptor
                    local isSimpleValue = desc.configurable == true and desc.writable == true and not desc.get and not desc.set
                    if isSimpleValue then
                        rawset(target, key, desc.value)
                    else
                        __TS__SetDescriptor(
                            target,
                            key,
                            __TS__ObjectAssign({}, descriptor, desc)
                        )
                    end
                elseif desc == false then
                    result = decorator(nil, target, key, desc)
                else
                    result = decorator(nil, target, key)
                end
                result = result or oldResult
            end
            i = i - 1
        end
    end
    return result
end

local function __TS__New(target, ...)
    local instance = setmetatable({}, target.prototype)
    instance:____constructor(...)
    return instance
end
-- End of Lua Library inline imports
local ____exports = {}
local ____module = require("framework.module")
local CModule = ____module.CModule
local ____reloadable = require("framework.reloadable")
local reloadable = ____reloadable.reloadable
local ____bullet_enums = require("framework.bullet_enums")
local BULLET_TYPE = ____bullet_enums.BULLET_TYPE
local TEMPORARY_BLOCK_TYPE = ____bullet_enums.TEMPORARY_BLOCK_TYPE
require("framework.helpers")
require("framework.timer")
--- 弹道
local CBullet = __TS__Class()
CBullet.name = "CBullet"
__TS__ClassExtends(CBullet, CModule)
function CBullet.prototype.____constructor(self, ...)
    CModule.prototype.____constructor(self, ...)
    self.defaultLifetime = 10
    self.slowFactor = 1
    self.bulletCount = 0
    self.pendingRemoval = {}
    self.GRID_SIZE = 1024
    self.spatialGrid = {}
    self.bulletPool = {
        [BULLET_TYPE.LINEAR] = {},
        [BULLET_TYPE.TRACKING] = {},
        [BULLET_TYPE.GUIDED] = {},
        [BULLET_TYPE.RING] = {},
        [BULLET_TYPE.SURROUND] = {},
        [BULLET_TYPE.CUSTOM] = {}
    }
    self.POOL_MAX_SIZE = 50
    self.bulletsByType = {
        [BULLET_TYPE.LINEAR] = {},
        [BULLET_TYPE.TRACKING] = {},
        [BULLET_TYPE.GUIDED] = {},
        [BULLET_TYPE.RING] = {},
        [BULLET_TYPE.SURROUND] = {},
        [BULLET_TYPE.CUSTOM] = {}
    }
    self.temporaryBlockIndex = 0
    self.temporaryBlocks = {}
    self.TICK_DISTANCE = 10
    self.BLOCK_TICK_DISTANCE = 1
    self.CIRCLE_ACCURACY = 8
    self.CIRCLE_RADIUS = 10
end
function CBullet.prototype.init(self, bReload)
    if not bReload then
        self.bulletList = {}
        self.bulletIndex = 1
        self.surroundGroup = {}
        self.bulletCount = 0
        self.pendingRemoval = {}
        self.spatialGrid = {}
        self.bulletsByType = {
            [BULLET_TYPE.LINEAR] = {},
            [BULLET_TYPE.TRACKING] = {},
            [BULLET_TYPE.GUIDED] = {},
            [BULLET_TYPE.RING] = {},
            [BULLET_TYPE.SURROUND] = {},
            [BULLET_TYPE.CUSTOM] = {}
        }
    end
    self.debug = false
    for index, projInfo in pairs(self.bulletList) do
        self:DestroyBullet(projInfo)
    end
    self.bulletList = {}
    self.bulletCount = 0
    self.spatialGrid = {}
    if self.mainTimer ~= nil then
        Timer:StopTimer(self.mainTimer)
        self.mainTimer = nil
    end
    self.mainTimer = Timer:GameTimer(
        FrameTime(),
        function()
            if self.bulletCount > 500 then
                local currentTime = GameRules:GetGameTime()
                local deleteCount = self.bulletCount - 400
                local deleted = 0
                for index, projInfo in pairs(self.bulletList) do
                    if deleted >= deleteCount then
                        break
                    end
                    local bulletAge = currentTime - (projInfo.__createdTime or currentTime)
                    if bulletAge > 1 and (projInfo.__projType == BULLET_TYPE.LINEAR or projInfo.__projType == BULLET_TYPE.TRACKING or projInfo.__projType == BULLET_TYPE.GUIDED) then
                        local casterName = IsValid(nil, projInfo.caster) and projInfo.caster:GetUnitName() or "invalidUnit"
                        local abilityName = IsValid(nil, projInfo.ability) and projInfo.ability:GetAbilityName() or "invalidAbility"
                        local effectName = projInfo.effectName or "invalidEffect"
                        table.insert(self.pendingRemoval, projInfo.__projIndex)
                        deleted = deleted + 1
                    end
                end
            end
            self:BatchUpdateLinearBullets()
            self:BatchUpdateTrackingBullets()
            self:BatchUpdateGuidedBullets()
            self:BatchUpdateRingBullets()
            self:BatchUpdateCustomBullets()
            for groupName, groupInfo in pairs(self.surroundGroup) do
                local success, errorMessage = xpcall(
                    function() return self:OnSurroundGroupThink(groupInfo) end,
                    function(err) return traceback(err) end
                )
                if not success then
                    self:SafePrint((("Surround group think failed: " .. tostring(groupName)) .. " => ") .. tostring(errorMessage))
                end
            end
            if #self.pendingRemoval > 0 then
                for _, index in ipairs(self.pendingRemoval) do
                    local bulletData = self.bulletList[index]
                    if bulletData ~= nil then
                        self:DestroyBullet(bulletData)
                    end
                end
                self.pendingRemoval = {}
            end
            return FrameTime()
        end
    )
end
function CBullet.prototype.CreateLinearBullet(self, params)
    if params.caster ~= nil and not IsValid(nil, params.caster) then
        return
    end
    if params.ability ~= nil and not IsValid(nil, params.ability) then
        return
    end
    local ____opt_0 = params.caster
    if (____opt_0 and ____opt_0:GetTeamNumber()) == DOTA_TEAM_BADGUYS then
        params.moveSpeed = params.moveSpeed * self.slowFactor
    end
    local ____params_spawnOrigin_4 = params.spawnOrigin
    local ____temp_5 = params.direction:Normalized() * params.moveSpeed
    local ____temp_6 = params.distance / params.moveSpeed
    local ____temp_7 = params.distance / params.moveSpeed
    local ____BULLET_TYPE_LINEAR_8 = BULLET_TYPE.LINEAR
    local ____self_bulletIndex_9 = self.bulletIndex
    local ____temp_10 = params.interval ~= nil and GameRules:GetGameTime() + params.interval or nil
    local ____temp_11 = {}
    local ____opt_2 = params.caster
    local bulletData = __TS__ObjectAssign(
        {
            __position = ____params_spawnOrigin_4,
            __velocity = ____temp_5,
            __lifeTime = ____temp_6,
            __lifeTimeRemaining = ____temp_7,
            __projType = ____BULLET_TYPE_LINEAR_8,
            __projIndex = ____self_bulletIndex_9,
            __nextThink = ____temp_10,
            __hitRecord = ____temp_11,
            __teamNumber = ____opt_2 and ____opt_2:GetTeamNumber() or DOTA_TEAM_GOODGUYS,
            __thinker = params.thinker and SpawnEntityFromTableSynchronous("prop_dynamic", {origin = params.spawnOrigin, model = "models/development/invisiblebox.vmdl"}) or nil,
            teamFilter = params.ability ~= nil and params.ability:GetAbilityTargetTeam() or DOTA_UNIT_TARGET_TEAM_NONE,
            typeFilter = params.ability ~= nil and params.ability:GetAbilityTargetType() or DOTA_UNIT_TARGET_NONE,
            flagFilter = params.ability ~= nil and params.ability:GetAbilityTargetFlags() or DOTA_UNIT_TARGET_FLAG_NONE
        },
        params
    )
    if params.ParticleCreator ~= nil then
        bulletData.__particleID = params.ParticleCreator(bulletData)
    elseif params.effectName then
        local particleID = ParticleManager:CreateParticle(params.effectName, PATTACH_CUSTOMORIGIN, params.caster)
        ParticleManager:SetParticleControlTransformForward(
            particleID,
            0,
            params.spawnOrigin,
            bulletData.__velocity:Normalized()
        )
        ParticleManager:SetParticleControl(particleID, 1, bulletData.__velocity)
        bulletData.__particleID = particleID
    end
    return self:InitBullet(bulletData)
end
function CBullet.prototype.CreateTrackingBullet(self, params)
    if params.caster ~= nil and not IsValid(nil, params.caster) then
        return
    end
    if params.target ~= nil and not IsValid(nil, params.target) then
        return
    end
    if params.ability ~= nil and not IsValid(nil, params.ability) then
        return
    end
    local ____opt_12 = params.caster
    if (____opt_12 and ____opt_12:GetTeamNumber()) == DOTA_TEAM_BADGUYS then
        params.moveSpeed = params.moveSpeed * self.slowFactor
    end
    local ____params_spawnOrigin_16 = params.spawnOrigin
    local ____temp_17 = params.target:GetAbsOrigin()
    local ____temp_18 = (params.target:GetAbsOrigin() - params.spawnOrigin):Normalized() * params.moveSpeed
    local ____BULLET_TYPE_TRACKING_19 = BULLET_TYPE.TRACKING
    local ____self_bulletIndex_20 = self.bulletIndex
    local ____temp_21 = params.interval ~= nil and GameRules:GetGameTime() + params.interval or nil
    local ____temp_22 = {params.target}
    local ____opt_14 = params.caster
    local bulletData = __TS__ObjectAssign(
        {
            __position = ____params_spawnOrigin_16,
            __target = ____temp_17,
            __velocity = ____temp_18,
            __projType = ____BULLET_TYPE_TRACKING_19,
            __projIndex = ____self_bulletIndex_20,
            __nextThink = ____temp_21,
            __hitRecord = ____temp_22,
            __teamNumber = ____opt_14 and ____opt_14:GetTeamNumber() or DOTA_TEAM_GOODGUYS,
            teamFilter = params.ability ~= nil and params.ability:GetAbilityTargetTeam() or DOTA_UNIT_TARGET_TEAM_NONE,
            typeFilter = params.ability ~= nil and params.ability:GetAbilityTargetType() or DOTA_UNIT_TARGET_NONE,
            flagFilter = params.ability ~= nil and params.ability:GetAbilityTargetFlags() or DOTA_UNIT_TARGET_FLAG_NONE
        },
        params
    )
    if params.ParticleCreator ~= nil then
        bulletData.__particleID = params.ParticleCreator(bulletData)
    elseif params.effectName then
        local particleID = ParticleManager:CreateParticle(params.effectName, PATTACH_CUSTOMORIGIN, params.caster)
        ParticleManager:SetParticleControlTransformForward(
            particleID,
            0,
            params.spawnOrigin,
            bulletData.__velocity:Normalized()
        )
        ParticleManager:SetParticleControlEnt(
            particleID,
            1,
            bulletData.target,
            PATTACH_POINT_FOLLOW,
            "attach_hitloc",
            bulletData.target:GetAbsOrigin(),
            false
        )
        ParticleManager:SetParticleControl(
            particleID,
            2,
            Vector(bulletData.moveSpeed, 0, 0)
        )
        bulletData.__particleID = particleID
    end
    return self:InitBullet(bulletData)
end
function CBullet.prototype.CreateGroupSurroundBullet(self, count, params)
    if params.caster ~= nil and not IsValid(nil, params.caster) then
        return {}
    end
    if params.ability ~= nil and not IsValid(nil, params.ability) then
        return {}
    end
    local ____self_surroundGroup_index_32 = self.surroundGroup[params.group or "default"]
    if ____self_surroundGroup_index_32 == nil then
        local ____self_CreateSurroundGroup_31 = self.CreateSurroundGroup
        local ____params_caster_25 = params.caster
        local ____temp_26 = params.group or "default"
        local ____temp_27 = params.angle or RandomInt(0, 360)
        local ____params_circleRadius_28 = params.circleRadius
        local ____params_angularVelocity_29 = params.angularVelocity
        local ____temp_30 = {}
        local ____opt_23 = params.caster
        ____self_surroundGroup_index_32 = ____self_CreateSurroundGroup_31(
            self,
            {
                caster = ____params_caster_25,
                group = ____temp_26,
                angle = ____temp_27,
                circleRadius = ____params_circleRadius_28,
                angularVelocity = ____params_angularVelocity_29,
                bulletList = ____temp_30,
                __position = ____opt_23 and ____opt_23:GetAbsOrigin()
            }
        )
    end
    local surroundGroup = ____self_surroundGroup_index_32
    local bulletList = {}
    do
        local i = 0
        while i < count do
            local copyParams = shallowcopy(nil, params)
            if #surroundGroup.bulletList == 0 then
                copyParams.angle = surroundGroup.angle + 360 / count * i
            else
                copyParams.angle = surroundGroup.angle + 360 / #surroundGroup.bulletList * (#surroundGroup.bulletList + i)
            end
            local projIndex = self:CreateSurroundBullet(copyParams)
            if projIndex ~= nil then
                bulletList[#bulletList + 1] = projIndex
            end
            i = i + 1
        end
    end
    surroundGroup.bulletList = __TS__ArrayConcat(surroundGroup.bulletList, bulletList)
    return bulletList
end
function CBullet.prototype.CreateSurroundBullet(self, params)
    if params.caster ~= nil and not IsValid(nil, params.caster) then
        return
    end
    if params.ability ~= nil and not IsValid(nil, params.ability) then
        return
    end
    local ____self_surroundGroup_index_42 = self.surroundGroup[params.group or "default"]
    if ____self_surroundGroup_index_42 == nil then
        local ____self_CreateSurroundGroup_41 = self.CreateSurroundGroup
        local ____params_caster_35 = params.caster
        local ____temp_36 = params.group or "default"
        local ____temp_37 = params.angle or RandomInt(0, 360)
        local ____params_circleRadius_38 = params.circleRadius
        local ____params_angularVelocity_39 = params.angularVelocity
        local ____temp_40 = {}
        local ____opt_33 = params.caster
        ____self_surroundGroup_index_42 = ____self_CreateSurroundGroup_41(
            self,
            {
                caster = ____params_caster_35,
                group = ____temp_36,
                angle = ____temp_37,
                circleRadius = ____params_circleRadius_38,
                angularVelocity = ____params_angularVelocity_39,
                bulletList = ____temp_40,
                __position = ____opt_33 and ____opt_33:GetAbsOrigin()
            }
        )
    end
    local surroundGroup = ____self_surroundGroup_index_42
    local ____temp_46 = params.spawnOrigin or surroundGroup.__position + AnglesToVector(QAngle(0, params.angle, 0)) * params.circleRadius
    local ____BULLET_TYPE_SURROUND_47 = BULLET_TYPE.SURROUND
    local ____self_bulletIndex_48 = self.bulletIndex
    local ____temp_49 = params.interval ~= nil and GameRules:GetGameTime() + params.interval or nil
    local ____temp_50 = {}
    local ____opt_43 = params.caster
    local ____temp_51 = ____opt_43 and ____opt_43:GetTeamNumber() or DOTA_TEAM_GOODGUYS
    local ____params_lifeTime_52 = params.lifeTime
    local ____params_lifeTime_53 = params.lifeTime
    local ____SpawnEntityFromTableSynchronous_result_54 = SpawnEntityFromTableSynchronous("prop_dynamic", {origin = params.spawnOrigin, model = "models/development/invisiblebox.vmdl"})
    local ____temp_55 = params.group or "default"
    local ____temp_56 = params.angle or RandomInt(0, 360)
    local ____params_track_45 = params.track
    if ____params_track_45 == nil then
        ____params_track_45 = true
    end
    local bulletData = __TS__ObjectAssign(
        {
            __position = ____temp_46,
            __projType = ____BULLET_TYPE_SURROUND_47,
            __projIndex = ____self_bulletIndex_48,
            __nextThink = ____temp_49,
            __hitRecord = ____temp_50,
            __teamNumber = ____temp_51,
            __lifeTime = ____params_lifeTime_52,
            __lifeTimeRemaining = ____params_lifeTime_53,
            __thinker = ____SpawnEntityFromTableSynchronous_result_54,
            group = ____temp_55,
            angle = ____temp_56,
            track = ____params_track_45,
            offset = params.offset or 0,
            teamFilter = params.ability ~= nil and params.ability:GetAbilityTargetTeam() or DOTA_UNIT_TARGET_TEAM_NONE,
            typeFilter = params.ability ~= nil and params.ability:GetAbilityTargetType() or DOTA_UNIT_TARGET_NONE,
            flagFilter = params.ability ~= nil and params.ability:GetAbilityTargetFlags() or DOTA_UNIT_TARGET_FLAG_NONE
        },
        params
    )
    if params.ParticleCreator ~= nil then
        bulletData.__particleID = params.ParticleCreator(bulletData)
    elseif params.effectName then
        local particleID = ParticleManager:CreateParticle(params.effectName, PATTACH_ABSORIGIN_FOLLOW, bulletData.__thinker)
        ParticleManager:SetParticleControlEnt(
            particleID,
            3,
            bulletData.__thinker,
            PATTACH_ABSORIGIN_FOLLOW,
            nil,
            bulletData.__thinker:GetAbsOrigin(),
            false
        )
        bulletData.__particleID = particleID
    end
    return self:InitBullet(bulletData)
end
function CBullet.prototype.CreateGuidedBullet(self, params)
    if params.caster ~= nil and not IsValid(nil, params.caster) then
        return
    end
    if params.target ~= nil and not IsValid(nil, params.target) then
        return
    end
    if params.ability ~= nil and not IsValid(nil, params.ability) then
        return
    end
    local ____opt_57 = params.caster
    if (____opt_57 and ____opt_57:GetTeamNumber()) == DOTA_TEAM_BADGUYS then
        params.moveSpeed = params.moveSpeed * self.slowFactor
    end
    local direction = params.direction or (params.target and (params.target:GetAbsOrigin() - params.spawnOrigin):Normalized() or RandomVector(1))
    local targetPos = params.target and params.target:GetAbsOrigin() or params.spawnOrigin + direction * params.moveSpeed * FrameTime()
    local angles = VectorToAngles(direction:Normalized())
    local thinkerPos = params.spawnOrigin + direction * params.moveSpeed * FrameTime()
    local ____params_spawnOrigin_63 = params.spawnOrigin
    local ____temp_64 = params.lifeTime or self.defaultLifetime
    local ____temp_65 = params.lifeTime or self.defaultLifetime
    local ____temp_66 = direction * params.moveSpeed
    local ____BULLET_TYPE_GUIDED_67 = BULLET_TYPE.GUIDED
    local ____self_bulletIndex_68 = self.bulletIndex
    local ____temp_69 = params.interval ~= nil and GameRules:GetGameTime() + params.interval or nil
    local ____temp_70 = {}
    local ____opt_59 = params.caster
    local ____temp_71 = ____opt_59 and ____opt_59:GetTeamNumber() or DOTA_TEAM_GOODGUYS
    local ____SpawnEntityFromTableSynchronous_result_72 = SpawnEntityFromTableSynchronous(
        "prop_dynamic",
        {
            origin = thinkerPos,
            angles = (((tostring(angles.x) .. " ") .. tostring(angles.y)) .. " ") .. tostring(angles.z),
            model = "models/development/invisiblebox.vmdl"
        }
    )
    local ____opt_61 = params.caster
    local bulletData = __TS__ObjectAssign(
        {
            __position = ____params_spawnOrigin_63,
            __target = targetPos,
            __lifeTime = ____temp_64,
            __lifeTimeRemaining = ____temp_65,
            __velocity = ____temp_66,
            __projType = ____BULLET_TYPE_GUIDED_67,
            __projIndex = ____self_bulletIndex_68,
            __nextThink = ____temp_69,
            __hitRecord = ____temp_70,
            __teamNumber = ____temp_71,
            __thinker = ____SpawnEntityFromTableSynchronous_result_72,
            teamNumber = ____opt_61 and ____opt_61:GetTeamNumber(),
            teamFilter = params.ability ~= nil and params.ability:GetAbilityTargetTeam() or DOTA_UNIT_TARGET_TEAM_NONE,
            typeFilter = params.ability ~= nil and params.ability:GetAbilityTargetType() or DOTA_UNIT_TARGET_NONE,
            flagFilter = params.ability ~= nil and params.ability:GetAbilityTargetFlags() or DOTA_UNIT_TARGET_FLAG_NONE
        },
        params
    )
    if params.ParticleCreator ~= nil then
        bulletData.__particleID = params.ParticleCreator(bulletData)
    elseif params.effectName then
        local particleID = ParticleManager:CreateParticle(params.effectName, PATTACH_CUSTOMORIGIN, params.caster)
        ParticleManager:SetParticleControlTransformForward(
            particleID,
            0,
            params.spawnOrigin,
            bulletData.__velocity:Normalized()
        )
        ParticleManager:SetParticleControlEnt(
            particleID,
            1,
            bulletData.__thinker,
            PATTACH_ABSORIGIN_FOLLOW,
            nil,
            bulletData.__thinker:GetAbsOrigin(),
            false
        )
        ParticleManager:SetParticleControl(
            particleID,
            2,
            Vector(bulletData.moveSpeed, 0, 0)
        )
        bulletData.__particleID = particleID
    end
    return self:InitBullet(bulletData)
end
function CBullet.prototype.CreateRingBullet(self, params)
    params.startRadius = params.startRadius or 0
    params.endRadius = params.endRadius or params.radius or 0
    local ____params_spawnOrigin_75 = params.spawnOrigin
    local ____params_lifeTime_76 = params.lifeTime
    local ____params_lifeTime_77 = params.lifeTime
    local ____BULLET_TYPE_RING_78 = BULLET_TYPE.RING
    local ____self_bulletIndex_79 = self.bulletIndex
    local ____temp_80 = params.interval ~= nil and GameRules:GetGameTime() + params.interval or nil
    local ____temp_81 = {}
    local ____opt_73 = params.caster
    local bulletData = __TS__ObjectAssign(
        {
            __position = ____params_spawnOrigin_75,
            __lifeTime = ____params_lifeTime_76,
            __lifeTimeRemaining = ____params_lifeTime_77,
            __radius = 0,
            __projType = ____BULLET_TYPE_RING_78,
            __projIndex = ____self_bulletIndex_79,
            __nextThink = ____temp_80,
            __hitRecord = ____temp_81,
            __teamNumber = ____opt_73 and ____opt_73:GetTeamNumber() or DOTA_TEAM_GOODGUYS,
            teamFilter = params.ability ~= nil and params.ability:GetAbilityTargetTeam() or DOTA_UNIT_TARGET_TEAM_NONE,
            typeFilter = params.ability ~= nil and params.ability:GetAbilityTargetType() or DOTA_UNIT_TARGET_NONE,
            flagFilter = params.ability ~= nil and params.ability:GetAbilityTargetFlags() or DOTA_UNIT_TARGET_FLAG_NONE
        },
        params
    )
    if params.ParticleCreator ~= nil then
        bulletData.__particleID = params.ParticleCreator(bulletData)
    elseif params.effectName then
        local particleID = ParticleManager:CreateParticle(params.effectName, PATTACH_CUSTOMORIGIN, params.caster)
        if params.followEntity == nil then
            ParticleManager:SetParticleControl(particleID, 0, params.spawnOrigin)
        else
            ParticleManager:SetParticleControlEnt(
                particleID,
                0,
                params.followEntity,
                PATTACH_ABSORIGIN_FOLLOW,
                nil,
                params.followEntity:GetAbsOrigin(),
                false
            )
        end
        ParticleManager:SetParticleControl(
            particleID,
            1,
            Vector(params.endRadius, params.endRadius, params.endRadius)
        )
        bulletData.__particleID = particleID
    end
    return self:InitBullet(bulletData)
end
function CBullet.prototype.CreateCustomBullet(self, params)
    if params.caster ~= nil and not IsValid(nil, params.caster) then
        return
    end
    if params.ability ~= nil and not IsValid(nil, params.ability) then
        return
    end
    params.direction = params.direction or vec3_zero
    params.moveSpeed = params.moveSpeed or 0
    local ____params_spawnOrigin_84 = params.spawnOrigin
    local ____temp_85 = params.direction:Normalized() * params.moveSpeed
    local ____params_lifeTime_86 = params.lifeTime
    local ____params_lifeTime_87 = params.lifeTime
    local ____BULLET_TYPE_CUSTOM_88 = BULLET_TYPE.CUSTOM
    local ____self_bulletIndex_89 = self.bulletIndex
    local ____temp_90 = params.interval ~= nil and GameRules:GetGameTime() + params.interval or nil
    local ____temp_91 = {}
    local ____opt_82 = params.caster
    local bulletData = __TS__ObjectAssign(
        {
            __position = ____params_spawnOrigin_84,
            __velocity = ____temp_85,
            __lifeTime = ____params_lifeTime_86,
            __lifeTimeRemaining = ____params_lifeTime_87,
            __projType = ____BULLET_TYPE_CUSTOM_88,
            __projIndex = ____self_bulletIndex_89,
            __nextThink = ____temp_90,
            __hitRecord = ____temp_91,
            __teamNumber = ____opt_82 and ____opt_82:GetTeamNumber() or DOTA_TEAM_GOODGUYS,
            __thinker = params.hasThinker and SpawnEntityFromTableSynchronous("prop_dynamic", {origin = params.spawnOrigin, model = "models/development/invisiblebox.vmdl"}) or nil
        },
        params
    )
    if params.ParticleCreator ~= nil then
        bulletData.__particleID = params.ParticleCreator(bulletData)
    end
    return self:InitBullet(bulletData)
end
function CBullet.prototype.SplitAction(self, direction, splitCount, angleInterval, callback)
    local angle = (splitCount - 1) * angleInterval
    local directionList = {}
    do
        local i = 1
        while i <= splitCount do
            table.insert(
                directionList,
                RotatePosition(
                    Vector(0, 0, 0),
                    QAngle(0, -angle * 0.5 + (i - 1) * angleInterval, 0),
                    direction
                )
            )
            i = i + 1
        end
    end
    for i, direction in ipairs(directionList) do
        callback(nil, direction, i)
    end
end
function CBullet.prototype.BulletDodge(self, unit)
    ProjectileManager:ProjectileDodge(unit)
    for k, v in pairs(self.bulletList) do
        if v.__projType == BULLET_TYPE.TRACKING and v.target == unit then
            v.target = nil
        end
    end
end
function CBullet.prototype.SaveData(self, id, key, value)
    if self.bulletList == nil then
        return
    end
    if self.bulletList[id] == nil then
        return
    end
    self.bulletList[id][key] = value
end
function CBullet.prototype.GetData(self, id, key, defaultValue)
    local ____opt_94 = self.bulletList
    local ____opt_92 = ____opt_94 and ____opt_94[id]
    local ____temp_96 = ____opt_92 and ____opt_92[key]
    if ____temp_96 == nil then
        ____temp_96 = defaultValue
    end
    return ____temp_96
end
function CBullet.prototype.GetBulletData(self, id)
    return self.bulletList[id]
end
function CBullet.prototype.DestroyBullet(self, bulletData)
    if bulletData.__particleID ~= nil then
        ParticleManager:DestroyParticle(bulletData.__particleID, false)
    end
    if bulletData.__thinker ~= nil and IsValid(nil, bulletData.__thinker) then
        UTIL_Remove(bulletData.__thinker)
    end
    if bulletData.OnBulletDestroy then
        xpcall(
            bulletData.OnBulletDestroy,
            function(err) return traceback(err) end,
            bulletData
        )
    end
    if bulletData.__projType == BULLET_TYPE.SURROUND then
        local surroundGroup = self.surroundGroup[bulletData.group]
        if surroundGroup ~= nil then
            ArrayRemove(nil, surroundGroup.bulletList, bulletData.__projIndex)
            if #surroundGroup.bulletList == 0 then
                self.surroundGroup[bulletData.group] = nil
            end
        end
    end
    local ____type = bulletData.__projType
    if self.bulletsByType[____type] then
        ArrayRemove(nil, self.bulletsByType[____type], bulletData.__projIndex)
    end
    self:RemoveFromSpatialGrid(bulletData)
    self:ReturnToPool(bulletData)
    self.bulletCount = math.max(0, self.bulletCount - 1)
    self.bulletList[bulletData.__projIndex] = nil
end
function CBullet.prototype.DestroyBulletByID(self, id)
    local bulletData = self.bulletList[id]
    if bulletData == nil then
        return
    end
    self:DestroyBullet(bulletData)
end
function CBullet.prototype._DebugDrawCircle(self, vPosition, vColor, flAlpha, flRadius, bZTest, flDuration)
    if self.debug then
        DebugDrawCircle(
            vPosition,
            vColor,
            flAlpha,
            flRadius,
            bZTest,
            flDuration
        )
    end
end
function CBullet.prototype.SafePrint(self, message)
    print("[Bullet] " .. message)
end
function CBullet.prototype.SafeUpdateBullet(self, bulletData, updateFn, label)
    local success, errorMessage = xpcall(
        function() return updateFn(nil, bulletData) end,
        function(err) return traceback(err) end
    )
    if not success then
        self:SafePrint((((((label .. " failed: proj=") .. tostring(bulletData.__projIndex)) .. " type=") .. tostring(bulletData.__projType)) .. " error=") .. tostring(errorMessage))
        if self.bulletList[bulletData.__projIndex] ~= nil then
            self:DestroyBullet(bulletData)
        end
    end
end
function CBullet.prototype.SafeUnitFilter(self, bulletData, unit)
    if bulletData.FuncUnitFilter == nil then
        return true
    end
    local success, passed = xpcall(
        bulletData.FuncUnitFilter,
        function(err) return traceback(err) end,
        unit
    )
    if not success then
        self:SafePrint((((("FuncUnitFilter failed: proj=" .. tostring(bulletData.__projIndex)) .. " unit=") .. unit:GetUnitName()) .. " error=") .. tostring(passed))
        if self.bulletList[bulletData.__projIndex] ~= nil then
            self:DestroyBullet(bulletData)
        end
        return false
    end
    return passed == true
end
function CBullet.prototype.GetGridKey(self, position)
    local gridX = math.floor(position.x / self.GRID_SIZE)
    local gridY = math.floor(position.y / self.GRID_SIZE)
    return (tostring(gridX) .. "_") .. tostring(gridY)
end
function CBullet.prototype.AddToSpatialGrid(self, bulletData)
    local gridKey = self:GetGridKey(bulletData.__position)
    if self.spatialGrid[gridKey] == nil then
        self.spatialGrid[gridKey] = {}
    end
    local ____self_spatialGrid_gridKey_97 = self.spatialGrid[gridKey]
    ____self_spatialGrid_gridKey_97[#____self_spatialGrid_gridKey_97 + 1] = bulletData.__projIndex
    bulletData.__gridKey = gridKey
end
function CBullet.prototype.RemoveFromSpatialGrid(self, bulletData)
    if bulletData.__gridKey ~= nil then
        local grid = self.spatialGrid[bulletData.__gridKey]
        if grid ~= nil then
            ArrayRemove(nil, grid, bulletData.__projIndex)
            if #grid == 0 then
                self.spatialGrid[bulletData.__gridKey] = nil
            end
        end
    end
end
function CBullet.prototype.UpdateSpatialGrid(self, bulletData)
    local newGridKey = self:GetGridKey(bulletData.__position)
    if bulletData.__gridKey ~= newGridKey then
        self:RemoveFromSpatialGrid(bulletData)
        local gridKey = newGridKey
        if self.spatialGrid[gridKey] == nil then
            self.spatialGrid[gridKey] = {}
        end
        local ____self_spatialGrid_gridKey_98 = self.spatialGrid[gridKey]
        ____self_spatialGrid_gridKey_98[#____self_spatialGrid_gridKey_98 + 1] = bulletData.__projIndex
        bulletData.__gridKey = gridKey
    end
end
function CBullet.prototype.GetNearbyBullets(self, position, radius)
    local gridRadius = math.ceil(radius / self.GRID_SIZE)
    local centerGridX = math.floor(position.x / self.GRID_SIZE)
    local centerGridY = math.floor(position.y / self.GRID_SIZE)
    local nearbyBullets = {}
    do
        local dx = -gridRadius
        while dx <= gridRadius do
            do
                local dy = -gridRadius
                while dy <= gridRadius do
                    local gridKey = (tostring(centerGridX + dx) .. "_") .. tostring(centerGridY + dy)
                    local grid = self.spatialGrid[gridKey]
                    if grid ~= nil then
                        nearbyBullets = __TS__ArrayConcat(nearbyBullets, grid)
                    end
                    dy = dy + 1
                end
            end
            dx = dx + 1
        end
    end
    return nearbyBullets
end
function CBullet.prototype.GetBulletInRadius(self, center, radius)
    local nearbyIndexes = self:GetNearbyBullets(center, radius)
    local result = {}
    local radiusSq = radius * radius
    do
        local i = 0
        while i < #nearbyIndexes do
            local bulletData = self.bulletList[nearbyIndexes[i + 1]]
            if bulletData ~= nil then
                local distSq = (bulletData.__position.x - center.x) ^ 2 + (bulletData.__position.y - center.y) ^ 2
                if distSq <= radiusSq then
                    result[#result + 1] = bulletData
                end
            end
            i = i + 1
        end
    end
    return result
end
function CBullet.prototype.GetBulletInPolygon(self, polygon)
    if #polygon < 3 then
        return {}
    end
    local minX = polygon[1].x
    local maxX = polygon[1].x
    local minY = polygon[1].y
    local maxY = polygon[1].y
    do
        local i = 1
        while i < #polygon do
            if polygon[i + 1].x < minX then
                minX = polygon[i + 1].x
            end
            if polygon[i + 1].x > maxX then
                maxX = polygon[i + 1].x
            end
            if polygon[i + 1].y < minY then
                minY = polygon[i + 1].y
            end
            if polygon[i + 1].y > maxY then
                maxY = polygon[i + 1].y
            end
            i = i + 1
        end
    end
    local centerX = (minX + maxX) / 2
    local centerY = (minY + maxY) / 2
    local center = Vector(centerX, centerY, 0)
    local radius = math.sqrt((maxX - minX) ^ 2 + (maxY - minY) ^ 2) / 2
    local nearbyIndexes = self:GetNearbyBullets(center, radius)
    local result = {}
    do
        local i = 0
        while i < #nearbyIndexes do
            local bulletData = self.bulletList[nearbyIndexes[i + 1]]
            if bulletData ~= nil then
                if self:IsPointInPolygon(bulletData.__position, polygon) then
                    result[#result + 1] = bulletData
                end
            end
            i = i + 1
        end
    end
    return result
end
function CBullet.prototype.GetBulletInLine(self, start, ____end, width)
    local minX = math.min(start.x, ____end.x) - width
    local maxX = math.max(start.x, ____end.x) + width
    local minY = math.min(start.y, ____end.y) - width
    local maxY = math.max(start.y, ____end.y) + width
    local centerX = (minX + maxX) / 2
    local centerY = (minY + maxY) / 2
    local center = Vector(centerX, centerY, 0)
    local radius = math.sqrt((maxX - minX) ^ 2 + (maxY - minY) ^ 2) / 2
    local nearbyIndexes = self:GetNearbyBullets(center, radius)
    local result = {}
    local lineLengthSq = (____end.x - start.x) ^ 2 + (____end.y - start.y) ^ 2
    do
        local i = 0
        while i < #nearbyIndexes do
            local bulletData = self.bulletList[nearbyIndexes[i + 1]]
            if bulletData ~= nil then
                local pos = bulletData.__position
                local t = ((pos.x - start.x) * (____end.x - start.x) + (pos.y - start.y) * (____end.y - start.y)) / lineLengthSq
                t = math.max(
                    0,
                    math.min(1, t)
                )
                local closestX = start.x + t * (____end.x - start.x)
                local closestY = start.y + t * (____end.y - start.y)
                local distSq = (pos.x - closestX) ^ 2 + (pos.y - closestY) ^ 2
                if distSq <= width * width then
                    result[#result + 1] = bulletData
                end
            end
            i = i + 1
        end
    end
    return result
end
function CBullet.prototype.GetRingBulletCount(self, caster)
    local count = 0
    for groupName, groupData in pairs(self.surroundGroup) do
        if groupData.caster == caster then
            count = count + #groupData.bulletList
        end
    end
    return count
end
function CBullet.prototype.IsLinearBullet(self, bulletData)
    return bulletData.__projType == BULLET_TYPE.LINEAR
end
function CBullet.prototype.IsTrackingBullet(self, bulletData)
    return bulletData.__projType == BULLET_TYPE.TRACKING
end
function CBullet.prototype.IsGuidedBullet(self, bulletData)
    return bulletData.__projType == BULLET_TYPE.GUIDED
end
function CBullet.prototype.IsRingBullet(self, bulletData)
    return bulletData.__projType == BULLET_TYPE.RING
end
function CBullet.prototype.IsSurroundBullet(self, bulletData)
    return bulletData.__projType == BULLET_TYPE.SURROUND
end
function CBullet.prototype.IsCustomBullet(self, bulletData)
    return bulletData.__projType == BULLET_TYPE.CUSTOM
end
function CBullet.prototype.IsReflectable(self, bulletData)
    local ____bulletData_reflectable_99 = bulletData.reflectable
    if ____bulletData_reflectable_99 == nil then
        ____bulletData_reflectable_99 = false
    end
    return ____bulletData_reflectable_99
end
function CBullet.prototype.IsPointInPolygon(self, point, polygon)
    local inside = false
    local n = #polygon
    do
        local i = 0
        while i < n do
            local j = (i + 1) % n
            local xi = polygon[i + 1].x
            local yi = polygon[i + 1].y
            local xj = polygon[j + 1].x
            local yj = polygon[j + 1].y
            local intersect = yi > point.y ~= (yj > point.y) and point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi
            if intersect then
                inside = not inside
            end
            i = i + 1
        end
    end
    return inside
end
function CBullet.prototype.GetFromPool(self, ____type)
    local pool = self.bulletPool[____type]
    if #pool > 0 then
        return table.remove(pool)
    end
    return nil
end
function CBullet.prototype.ReturnToPool(self, bulletData)
    local ____type = bulletData.__projType
    local pool = self.bulletPool[____type]
    if pool and #pool < self.POOL_MAX_SIZE then
        bulletData.caster = nil
        bulletData.ability = nil
        bulletData.target = nil
        bulletData.__thinker = nil
        bulletData.OnBulletCreated = nil
        bulletData.OnBulletThink = nil
        bulletData.OnBulletHit = nil
        bulletData.OnBulletDestroy = nil
        bulletData.OnIntervalThink = nil
        bulletData.FuncUnitFinder = nil
        bulletData.FuncUnitFilter = nil
        bulletData.ParticleCreator = nil
        bulletData.PathFunction = nil
        bulletData.__hitRecord = {}
        pool[#pool + 1] = bulletData
    end
end
function CBullet.prototype.BatchUpdateLinearBullets(self)
    local bullets = self.bulletsByType[BULLET_TYPE.LINEAR]
    for _, index in ipairs(bullets) do
        local bulletData = self.bulletList[index]
        if bulletData ~= nil then
            self:SafeUpdateBullet(
                bulletData,
                function(____, currentBullet) return self:OnLinearBulletThink(currentBullet) end,
                "Linear bullet update"
            )
        end
    end
end
function CBullet.prototype.BatchUpdateTrackingBullets(self)
    local bullets = self.bulletsByType[BULLET_TYPE.TRACKING]
    for _, index in ipairs(bullets) do
        local bulletData = self.bulletList[index]
        if bulletData ~= nil then
            self:SafeUpdateBullet(
                bulletData,
                function(____, currentBullet) return self:OnTrackingBulletThink(currentBullet) end,
                "Tracking bullet update"
            )
        end
    end
end
function CBullet.prototype.BatchUpdateGuidedBullets(self)
    local bullets = self.bulletsByType[BULLET_TYPE.GUIDED]
    for _, index in ipairs(bullets) do
        local bulletData = self.bulletList[index]
        if bulletData ~= nil then
            self:SafeUpdateBullet(
                bulletData,
                function(____, currentBullet) return self:OnGuidedBulletThink(currentBullet) end,
                "Guided bullet update"
            )
        end
    end
end
function CBullet.prototype.BatchUpdateRingBullets(self)
    local bullets = self.bulletsByType[BULLET_TYPE.RING]
    for _, index in ipairs(bullets) do
        local bulletData = self.bulletList[index]
        if bulletData ~= nil then
            self:SafeUpdateBullet(
                bulletData,
                function(____, currentBullet) return self:OnRingBulletThink(currentBullet) end,
                "Ring bullet update"
            )
        end
    end
end
function CBullet.prototype.BatchUpdateCustomBullets(self)
    local bullets = self.bulletsByType[BULLET_TYPE.CUSTOM]
    for _, index in ipairs(bullets) do
        local bulletData = self.bulletList[index]
        if bulletData ~= nil then
            self:SafeUpdateBullet(
                bulletData,
                function(____, currentBullet) return self:OnCustomBulletThink(currentBullet) end,
                "Custom bullet update"
            )
        end
    end
end
function CBullet.prototype.CreateTemporaryBlock(self, blockData, duration)
    local index = self.temporaryBlockIndex
    self.temporaryBlocks[index] = blockData
    if duration ~= nil then
        Timer:GameTimer(
            duration,
            function()
                self.temporaryBlocks[index] = nil
            end
        )
    end
    self.temporaryBlockIndex = self.temporaryBlockIndex + 1
    return index
end
function CBullet.prototype.RemoveTemporaryBlock(self, index)
    self.temporaryBlocks[index] = nil
end
function CBullet.prototype.IsValidPosition(self, position)
    if self:IsPositionInTemporaryBlock(position) then
        return false
    end
    if not GridNav:IsTraversable(position) or GridNav:IsBlocked(position) then
        local startVector = GetGroundPosition(position, nil) + Vector(0, 0, -5000)
        local traceTable = {
            startpos = startVector,
            endpos = startVector + Vector(0, 0, 3000),
            mask = 33570827
        }
        if TraceLine(traceTable) then
            if traceTable.hit then
                return true
            else
                return false
            end
        end
    end
    return true
end
function CBullet.prototype.IsPositionInTemporaryBlock(self, position)
    for _, blockData in pairs(self.temporaryBlocks) do
        if blockData.type == TEMPORARY_BLOCK_TYPE.CIRCLE and blockData.center and blockData.radius then
            if (blockData.center - position):Length2D() <= blockData.radius then
                return true
            end
        elseif blockData.type == TEMPORARY_BLOCK_TYPE.POLYGON and blockData.points then
            if self:IsPointInPolygon(position, blockData.points) then
                return true
            end
        end
    end
    return false
end
function CBullet.prototype.GetTemporaryBlocksInPosition(self, position)
    local blocks = {}
    for _, blockData in pairs(self.temporaryBlocks) do
        if blockData.type == TEMPORARY_BLOCK_TYPE.CIRCLE and blockData.center and blockData.radius then
            if (blockData.center - position):Length2D() <= blockData.radius then
                table.insert(blocks, blockData)
            end
        elseif blockData.type == TEMPORARY_BLOCK_TYPE.POLYGON and blockData.points then
            if self:IsPointInPolygon(position, blockData.points) then
                table.insert(blocks, blockData)
            end
        end
    end
    return blocks
end
function CBullet.prototype.IsBlockInLine(self, bulletData)
    local hasBlock = false
    local ____bulletData___previous_100 = bulletData.__previous
    if ____bulletData___previous_100 == nil then
        ____bulletData___previous_100 = bulletData.__position
    end
    local blockPosition = ____bulletData___previous_100
    local direction = bulletData.__velocity:Normalized()
    while (blockPosition - bulletData.__position):Length2D() > self.TICK_DISTANCE do
        blockPosition = blockPosition + direction * self.TICK_DISTANCE
        if not self:IsValidPosition(blockPosition) then
            hasBlock = true
            break
        end
    end
    return hasBlock, blockPosition
end
function CBullet.prototype.GetBlockPosition(self, bulletData)
    local blockPosition = bulletData.__position
    local direction = bulletData.__velocity:Normalized()
    while true do
        local ____blockPosition_102 = blockPosition
        local ____bulletData___previous_101 = bulletData.__previous
        if ____bulletData___previous_101 == nil then
            ____bulletData___previous_101 = bulletData.__position
        end
        if not ((____blockPosition_102 - ____bulletData___previous_101):Length2D() > self.BLOCK_TICK_DISTANCE) then
            break
        end
        blockPosition = blockPosition - direction * self.BLOCK_TICK_DISTANCE
        if self:IsValidPosition(blockPosition) then
            break
        end
    end
    return blockPosition
end
function CBullet.prototype.GetNormal(self, blockPosition)
    local normal = vec3_zero
    do
        local i = 1
        while i <= self.CIRCLE_ACCURACY do
            local angle = 360 / self.CIRCLE_ACCURACY * i
            local circlePoint = blockPosition + RotatePosition(
                vec3_zero,
                QAngle(0, angle, 0),
                Vector(0, self.CIRCLE_RADIUS, 0)
            )
            if not self:IsValidPosition(circlePoint) then
                self:_DebugDrawCircle(
                    circlePoint,
                    Vector(255, 0, 0),
                    50,
                    5,
                    true,
                    1
                )
            else
                normal = normal + RotatePosition(
                    vec3_zero,
                    QAngle(0, angle, 0),
                    Vector(0, self.CIRCLE_RADIUS, 0)
                )
                self:_DebugDrawCircle(
                    circlePoint,
                    Vector(0, 255, 0),
                    50,
                    5,
                    true,
                    1
                )
            end
            i = i + 1
        end
    end
    return normal:Normalized()
end
function CBullet.prototype.GetReflection(self, blockPosition, direction)
    local normal = self:GetNormal(blockPosition)
    local dotProduct = direction:Dot(normal:Normalized() * -1)
    local reflection = direction - normal:Normalized() * -1 * (2 * dotProduct)
    return reflection:Normalized()
end
function CBullet.prototype.HandleBounce(self, bulletData, blockPosition)
    local blocks = self:GetTemporaryBlocksInPosition(bulletData.__position)
    for _, block in ipairs(blocks) do
        if block.callback then
            xpcall(
                block.callback,
                function(err) return traceback(err) end,
                bulletData
            )
        end
    end
    self:_DebugDrawCircle(
        blockPosition,
        Vector(255, 255, 0),
        0,
        10,
        true,
        1
    )
    if bulletData.bounce ~= nil and bulletData.bounce > 0 then
        if bulletData.OnBulletBounceStart then
            xpcall(bulletData.OnBulletBounceStart, traceback, bulletData)
        end
        bulletData.bounce = bulletData.bounce - 1
        local direction = bulletData.__velocity:Normalized()
        local reflection = self:GetReflection(blockPosition, direction)
        local moveSpeed = bulletData.__velocity:Length()
        bulletData.__velocity = reflection * moveSpeed
        local ____temp_105 = moveSpeed * FrameTime()
        local ____blockPosition_104 = blockPosition
        local ____bulletData___previous_103 = bulletData.__previous
        if ____bulletData___previous_103 == nil then
            ____bulletData___previous_103 = bulletData.__position
        end
        local remainingDistance = ____temp_105 - (____blockPosition_104 - ____bulletData___previous_103):Length2D()
        bulletData.__position = blockPosition + reflection * remainingDistance
        self:_DebugDrawCircle(
            bulletData.__position,
            Vector(0, 255, 255),
            50,
            10,
            true,
            1
        )
        bulletData.__hitRecord = {}
        if bulletData.OnBulletBounceEnd then
            xpcall(bulletData.OnBulletBounceEnd, traceback, bulletData)
        end
        return true
    else
        if bulletData.destroyOnBounce == nil or bulletData.destroyOnBounce == true then
            self:DestroyBullet(bulletData)
            return false
        else
            if not VectorIsZero(nil, bulletData.__velocity) then
                bulletData.__velocity = vec3_zero
                bulletData.__position = blockPosition
                if bulletData.__particleID ~= nil then
                    ParticleManager:DestroyParticle(bulletData.__particleID, false)
                    bulletData.__particleID = nil
                end
            end
            return true
        end
    end
end
function CBullet.prototype.InitBullet(self, bulletData)
    self.bulletList[bulletData.__projIndex] = bulletData
    self.bulletIndex = self.bulletIndex + 1
    self.bulletCount = self.bulletCount + 1
    bulletData.__createdTime = GameRules:GetGameTime()
    self:AddToSpatialGrid(bulletData)
    local ____type = bulletData.__projType
    local ____self_bulletsByType_____type_106 = self.bulletsByType[____type]
    ____self_bulletsByType_____type_106[#____self_bulletsByType_____type_106 + 1] = bulletData.__projIndex
    if bulletData.OnBulletCreated ~= nil then
        xpcall(bulletData.OnBulletCreated, traceback, bulletData)
    end
    return bulletData.__projIndex
end
function CBullet.prototype.OnLinearBulletThink(self, bulletData)
    if bulletData.__nextThink ~= nil and bulletData.interval ~= nil and bulletData.OnIntervalThink ~= nil and GameRules:GetGameTime() >= bulletData.__nextThink then
        local success, result = xpcall(bulletData.OnIntervalThink, traceback, bulletData)
        if success then
            if result ~= nil then
                local ____bulletData_108 = bulletData
                local ____temp_107
                if result < 0 then
                    ____temp_107 = nil
                else
                    ____temp_107 = result
                end
                ____bulletData_108.interval = ____temp_107
                local ____bulletData_110 = bulletData
                local ____temp_109
                if result < 0 then
                    ____temp_109 = nil
                else
                    ____temp_109 = GameRules:GetGameTime() + result
                end
                ____bulletData_110.__nextThink = ____temp_109
            else
                bulletData.__nextThink = GameRules:GetGameTime() + bulletData.interval
            end
        end
    end
    bulletData.__lifeTimeRemaining = bulletData.__lifeTimeRemaining - FrameTime()
    local privious = bulletData.__previous or bulletData.__position
    local frameTime = FrameTime()
    if bulletData.ignoreBlock ~= true then
        local hasBlock, blockPosition = self:IsBlockInLine(bulletData)
        if not self:IsValidPosition(bulletData.__position) or hasBlock then
            self:_DebugDrawCircle(
                bulletData.__position,
                Vector(255, 0, 0),
                0,
                10,
                true,
                1
            )
            local finalBlockPosition = hasBlock and blockPosition or self:GetBlockPosition(bulletData)
            if not self:HandleBounce(bulletData, finalBlockPosition) then
                return
            end
        else
            self:_DebugDrawCircle(
                bulletData.__position,
                Vector(0, 255, 0),
                0,
                10,
                true,
                1
            )
        end
    end
    self:UpdateSpatialGrid(bulletData)
    if bulletData.__particleID == nil and bulletData.effectName then
        local particleID = ParticleManager:CreateParticle(bulletData.effectName, PATTACH_CUSTOMORIGIN, bulletData.caster)
        ParticleManager:SetParticleControlTransformForward(
            particleID,
            0,
            bulletData.__position,
            bulletData.__velocity:Normalized()
        )
        ParticleManager:SetParticleControl(particleID, 1, bulletData.__velocity)
        bulletData.__particleID = particleID
    end
    if bulletData.__thinker ~= nil then
        bulletData.__thinker:SetLocalOrigin(bulletData.__position)
    end
    if bulletData.OnBulletThink ~= nil then
        xpcall(bulletData.OnBulletThink, traceback, bulletData.__position, bulletData)
    end
    if bulletData.caster ~= nil and bulletData.OnBulletHit ~= nil then
        local lifeProgress = (bulletData.__lifeTime - bulletData.__lifeTimeRemaining - frameTime) / bulletData.__lifeTime
        local startRadius = bulletData.radius or RemapValClamped(
            nil,
            lifeProgress,
            0,
            1,
            bulletData.startRadius or 0,
            bulletData.endRadius or 0
        )
        local endRadius = bulletData.radius or RemapValClamped(
            nil,
            (bulletData.__lifeTime - bulletData.__lifeTimeRemaining) / bulletData.__lifeTime,
            0,
            1,
            bulletData.startRadius or 0,
            bulletData.endRadius or 0
        )
        local targets = {}
        if bulletData.FuncUnitFinder ~= nil then
            local a, b = xpcall(
                bulletData.FuncUnitFinder,
                traceback,
                privious,
                bulletData.__position,
                startRadius,
                endRadius,
                bulletData
            )
            if a == true then
                targets = b
            end
        else
            if bulletData.debug then
                local direction = (privious - bulletData.__position):Normalized()
                local points = {
                    privious + RotatePosition(
                        vec3_zero,
                        QAngle(0, 90, 0),
                        direction
                    ) * startRadius,
                    privious - RotatePosition(
                        vec3_zero,
                        QAngle(0, 90, 0),
                        direction
                    ) * startRadius,
                    bulletData.__position - RotatePosition(
                        vec3_zero,
                        QAngle(0, 90, 0),
                        direction
                    ) * endRadius,
                    bulletData.__position + RotatePosition(
                        vec3_zero,
                        QAngle(0, 90, 0),
                        direction
                    ) * endRadius
                }
                DebugDrawCircle(
                    privious,
                    Vector(255, 0, 0),
                    0,
                    startRadius,
                    true,
                    0.2
                )
                DebugDrawCircle(
                    bulletData.__position,
                    Vector(255, 0, 0),
                    0,
                    endRadius,
                    true,
                    0.2
                )
                DebugDrawLine(
                    points[1],
                    points[2],
                    255,
                    0,
                    0,
                    true,
                    0.2
                )
                DebugDrawLine(
                    points[2],
                    points[3],
                    255,
                    0,
                    0,
                    true,
                    0.2
                )
                DebugDrawLine(
                    points[3],
                    points[4],
                    255,
                    0,
                    0,
                    true,
                    0.2
                )
                DebugDrawLine(
                    points[4],
                    points[1],
                    255,
                    0,
                    0,
                    true,
                    0.2
                )
            end
            targets = self:FindUnitInLine(
                bulletData.__teamNumber,
                privious,
                bulletData.__position,
                startRadius,
                endRadius,
                bulletData.teamFilter,
                bulletData.typeFilter,
                bulletData.flagFilter
            )
        end
        if bulletData.repeatHit == true then
            for _, unit in ipairs(targets) do
                if TableFindKey(nil, bulletData.__hitRecord, unit) == nil then
                    if self:SafeUnitFilter(bulletData, unit) then
                        local success, result = xpcall(
                            bulletData.OnBulletHit,
                            traceback,
                            unit,
                            bulletData.__position,
                            bulletData
                        )
                        if success == true and result == true then
                            self:DestroyBullet(bulletData)
                            break
                        end
                    end
                end
            end
            bulletData.__hitRecord = targets
        else
            for _, unit in ipairs(targets) do
                if TableFindKey(nil, bulletData.__hitRecord, unit) == nil then
                    if self:SafeUnitFilter(bulletData, unit) then
                        local success, result = xpcall(
                            bulletData.OnBulletHit,
                            traceback,
                            unit,
                            bulletData.__position,
                            bulletData
                        )
                        table.insert(bulletData.__hitRecord, unit)
                        if success == true and result == true then
                            self:DestroyBullet(bulletData)
                            break
                        end
                    end
                end
            end
        end
    end
    if bulletData.__lifeTimeRemaining <= 0 then
        self:DestroyBullet(bulletData)
    end
    if self.bulletList[bulletData.__projIndex] ~= nil then
        bulletData.__previous = bulletData.__position
        local velocityDelta = bulletData.__velocity * frameTime
        bulletData.__position = bulletData.__position + velocityDelta
    end
end
function CBullet.prototype.OnTrackingBulletThink(self, bulletData)
    if bulletData.__nextThink ~= nil and bulletData.interval ~= nil and bulletData.OnIntervalThink ~= nil and GameRules:GetGameTime() >= bulletData.__nextThink then
        local success, result = xpcall(bulletData.OnIntervalThink, traceback, bulletData)
        if success then
            if result ~= nil then
                local ____bulletData_112 = bulletData
                local ____temp_111
                if result < 0 then
                    ____temp_111 = nil
                else
                    ____temp_111 = result
                end
                ____bulletData_112.interval = ____temp_111
                local ____bulletData_114 = bulletData
                local ____temp_113
                if result < 0 then
                    ____temp_113 = nil
                else
                    ____temp_113 = GameRules:GetGameTime() + result
                end
                ____bulletData_114.__nextThink = ____temp_113
            else
                bulletData.__nextThink = GameRules:GetGameTime() + bulletData.interval
            end
        end
    end
    local privious = bulletData.__previous or bulletData.__position
    if bulletData.ignoreBlock ~= true then
        local hasBlock, blockPosition = self:IsBlockInLine(bulletData)
        if not self:IsValidPosition(bulletData.__position) or hasBlock then
            self:_DebugDrawCircle(
                bulletData.__position,
                Vector(255, 0, 0),
                0,
                10,
                true,
                1
            )
            local finalBlockPosition = hasBlock and blockPosition or self:GetBlockPosition(bulletData)
            if not self:HandleBounce(bulletData, finalBlockPosition) then
                return
            end
            bulletData.__target = bulletData.__position + bulletData.__velocity:Normalized() * (bulletData.__position - privious):Length2D()
            if bulletData.effectName then
                local particleID = ParticleManager:CreateParticle(bulletData.effectName, PATTACH_CUSTOMORIGIN, bulletData.caster)
                ParticleManager:SetParticleControlTransformForward(
                    particleID,
                    0,
                    bulletData.__position,
                    bulletData.__velocity:Normalized()
                )
                ParticleManager:SetParticleControl(particleID, 1, bulletData.__target)
                ParticleManager:SetParticleControl(
                    particleID,
                    2,
                    Vector(bulletData.moveSpeed, 0, 0)
                )
                bulletData.__particleID = particleID
            end
        else
            self:_DebugDrawCircle(
                bulletData.__position,
                Vector(0, 255, 0),
                0,
                10,
                true,
                1
            )
        end
    end
    self:UpdateSpatialGrid(bulletData)
    if bulletData.OnBulletThink ~= nil then
        xpcall(bulletData.OnBulletThink, traceback, bulletData.__position, bulletData)
    end
    if bulletData.caster ~= nil and bulletData.radius ~= nil and bulletData.radius > 0 and bulletData.OnBulletHit ~= nil then
        local startRadius = bulletData.radius or 0
        local endRadius = bulletData.radius or 0
        local targets = {}
        if bulletData.FuncUnitFinder ~= nil then
            local a, b = xpcall(
                bulletData.FuncUnitFinder,
                traceback,
                privious,
                bulletData.__position,
                startRadius,
                endRadius,
                bulletData
            )
            if a == true then
                targets = b
            end
        else
            if bulletData.debug then
                local direction = (privious - bulletData.__position):Normalized()
                local points = {
                    privious + RotatePosition(
                        vec3_zero,
                        QAngle(0, 90, 0),
                        direction
                    ) * startRadius,
                    privious - RotatePosition(
                        vec3_zero,
                        QAngle(0, 90, 0),
                        direction
                    ) * startRadius,
                    bulletData.__position - RotatePosition(
                        vec3_zero,
                        QAngle(0, 90, 0),
                        direction
                    ) * endRadius,
                    bulletData.__position + RotatePosition(
                        vec3_zero,
                        QAngle(0, 90, 0),
                        direction
                    ) * endRadius
                }
                DebugDrawCircle(
                    privious,
                    Vector(255, 0, 0),
                    0,
                    startRadius,
                    true,
                    0.2
                )
                DebugDrawCircle(
                    bulletData.__position,
                    Vector(255, 0, 0),
                    0,
                    endRadius,
                    true,
                    0.2
                )
                DebugDrawLine(
                    points[1],
                    points[2],
                    255,
                    0,
                    0,
                    true,
                    0.2
                )
                DebugDrawLine(
                    points[2],
                    points[3],
                    255,
                    0,
                    0,
                    true,
                    0.2
                )
                DebugDrawLine(
                    points[3],
                    points[4],
                    255,
                    0,
                    0,
                    true,
                    0.2
                )
                DebugDrawLine(
                    points[4],
                    points[1],
                    255,
                    0,
                    0,
                    true,
                    0.2
                )
            end
            targets = self:FindUnitInLine(
                bulletData.__teamNumber,
                privious,
                bulletData.__position,
                startRadius,
                endRadius,
                bulletData.teamFilter,
                bulletData.typeFilter,
                bulletData.flagFilter
            )
        end
        for _, unit in ipairs(targets) do
            if TableFindKey(nil, bulletData.__hitRecord, unit) == nil then
                if self:SafeUnitFilter(bulletData, unit) then
                    local success, result = xpcall(
                        bulletData.OnBulletHit,
                        traceback,
                        unit,
                        bulletData.__position,
                        bulletData
                    )
                    table.insert(bulletData.__hitRecord, unit)
                    if success == true and result == true then
                        self:DestroyBullet(bulletData)
                        break
                    end
                end
            end
        end
    end
    if bulletData.__target == bulletData.__position then
        local success
        local result
        if bulletData.OnBulletHit ~= nil and IsValid(nil, bulletData.target) then
            success, result = xpcall(
                bulletData.OnBulletHit,
                traceback,
                bulletData.target,
                bulletData.__position,
                bulletData
            )
        end
        if result == nil or result == true then
            self:DestroyBullet(bulletData)
        end
    end
    if self.bulletList[bulletData.__projIndex] ~= nil then
        bulletData.__previous = bulletData.__position
        if IsValid(nil, bulletData.target) then
            bulletData.__target = bulletData.target:GetAbsOrigin()
        end
        local direction = (bulletData.__target - bulletData.__position):Normalized()
        bulletData.__velocity = direction
        local frameTime = FrameTime()
        local moveDistance = bulletData.moveSpeed * frameTime
        local moveDelta = direction * moveDistance
        bulletData.__position = bulletData.__position + moveDelta
        if (bulletData.__target - bulletData.__position):Length2D() < moveDistance then
            bulletData.__position = bulletData.__target
        end
    end
end
function CBullet.prototype.OnGuidedBulletThink(self, bulletData)
    if bulletData.__nextThink ~= nil and bulletData.interval ~= nil and bulletData.OnIntervalThink ~= nil and GameRules:GetGameTime() >= bulletData.__nextThink then
        local success, result = xpcall(bulletData.OnIntervalThink, traceback, bulletData)
        if success then
            if result ~= nil then
                local ____bulletData_116 = bulletData
                local ____temp_115
                if result < 0 then
                    ____temp_115 = nil
                else
                    ____temp_115 = result
                end
                ____bulletData_116.interval = ____temp_115
                local ____bulletData_118 = bulletData
                local ____temp_117
                if result < 0 then
                    ____temp_117 = nil
                else
                    ____temp_117 = GameRules:GetGameTime() + result
                end
                ____bulletData_118.__nextThink = ____temp_117
            else
                bulletData.__nextThink = GameRules:GetGameTime() + bulletData.interval
            end
        end
    end
    if bulletData.__lifeTimeRemaining ~= -1 then
        bulletData.__lifeTimeRemaining = bulletData.__lifeTimeRemaining - FrameTime()
    end
    local privious = bulletData.__previous or bulletData.__position
    if bulletData.ignoreBlock ~= true then
        local hasBlock, blockPosition = self:IsBlockInLine(bulletData)
        if not self:IsValidPosition(bulletData.__position) or hasBlock then
            self:_DebugDrawCircle(
                bulletData.__position,
                Vector(255, 0, 0),
                0,
                10,
                true,
                1
            )
            local finalBlockPosition = hasBlock and blockPosition or self:GetBlockPosition(bulletData)
            if not self:HandleBounce(bulletData, finalBlockPosition) then
                return
            end
            if bulletData.__thinker ~= nil and IsValid(nil, bulletData.__thinker) then
                bulletData.__thinker:SetLocalOrigin(bulletData.__position)
                bulletData.__thinker:SetForwardVector(bulletData.__velocity:Normalized())
            elseif bulletData.__thinker ~= nil then
                self:DestroyBullet(bulletData)
                return
            end
        else
            self:_DebugDrawCircle(
                bulletData.__position,
                Vector(0, 255, 0),
                0,
                10,
                true,
                1
            )
        end
    end
    if bulletData.OnBulletThink ~= nil then
        xpcall(bulletData.OnBulletThink, traceback, bulletData.__position, bulletData)
    end
    if bulletData.caster ~= nil and bulletData.radius ~= nil and bulletData.radius > 0 and bulletData.OnBulletHit ~= nil then
        local startRadius = bulletData.radius or 0
        local endRadius = bulletData.radius or 0
        local targets = {}
        if bulletData.FuncUnitFinder ~= nil then
            local a, b = xpcall(
                bulletData.FuncUnitFinder,
                traceback,
                privious,
                bulletData.__position,
                startRadius,
                endRadius,
                bulletData
            )
            if a == true then
                targets = b
            end
        else
            if bulletData.debug then
                local direction = (privious - bulletData.__position):Normalized()
                local points = {
                    privious + RotatePosition(
                        vec3_zero,
                        QAngle(0, 90, 0),
                        direction
                    ) * startRadius,
                    privious - RotatePosition(
                        vec3_zero,
                        QAngle(0, 90, 0),
                        direction
                    ) * startRadius,
                    bulletData.__position - RotatePosition(
                        vec3_zero,
                        QAngle(0, 90, 0),
                        direction
                    ) * endRadius,
                    bulletData.__position + RotatePosition(
                        vec3_zero,
                        QAngle(0, 90, 0),
                        direction
                    ) * endRadius
                }
                DebugDrawCircle(
                    privious,
                    Vector(255, 0, 0),
                    0,
                    startRadius,
                    true,
                    0.2
                )
                DebugDrawCircle(
                    bulletData.__position,
                    Vector(255, 0, 0),
                    0,
                    endRadius,
                    true,
                    0.2
                )
                DebugDrawLine(
                    points[1],
                    points[2],
                    255,
                    0,
                    0,
                    true,
                    0.2
                )
                DebugDrawLine(
                    points[2],
                    points[3],
                    255,
                    0,
                    0,
                    true,
                    0.2
                )
                DebugDrawLine(
                    points[3],
                    points[4],
                    255,
                    0,
                    0,
                    true,
                    0.2
                )
                DebugDrawLine(
                    points[4],
                    points[1],
                    255,
                    0,
                    0,
                    true,
                    0.2
                )
            end
            targets = self:FindUnitInLine(
                bulletData.__teamNumber,
                privious,
                bulletData.__position,
                startRadius,
                endRadius,
                bulletData.teamFilter,
                bulletData.typeFilter,
                bulletData.flagFilter
            )
        end
        for _, unit in ipairs(targets) do
            if TableFindKey(nil, bulletData.__hitRecord, unit) == nil then
                if self:SafeUnitFilter(bulletData, unit) then
                    local success, result = xpcall(
                        bulletData.OnBulletHit,
                        traceback,
                        unit,
                        bulletData.__position,
                        bulletData
                    )
                    if success == true and result == true then
                        self:DestroyBullet(bulletData)
                        break
                    end
                end
            end
        end
        bulletData.__hitRecord = targets
    end
    if bulletData.__lifeTimeRemaining <= 0 and bulletData.__lifeTimeRemaining ~= -1 then
        if IsValid(nil, bulletData.__thinker) then
            bulletData.__thinker:SetLocalOrigin(bulletData.__position)
        end
        self:DestroyBullet(bulletData)
    end
    if self.bulletList[bulletData.__projIndex] ~= nil then
        bulletData.__previous = bulletData.__position
        if bulletData.PathFunction ~= nil then
            local success, result = xpcall(bulletData.PathFunction, traceback, bulletData.__position, bulletData)
            if not success then
                self:DestroyBullet(bulletData)
                return
            end
            if type(result) == "userdata" then
                bulletData.__position = result
            end
        else
            if not IsValid(nil, bulletData.__thinker) then
                self:DestroyBullet(bulletData)
                return
            end
            if IsValid(nil, bulletData.target) then
                bulletData.__target = bulletData.target:GetAbsOrigin()
                local direction = bulletData.__velocity:Normalized()
                local cross = (bulletData.__thinker:GetAbsOrigin() - privious):Normalized():Cross((bulletData.__target - privious):Normalized())
                local flAngle = (bulletData.angularVelocity or 0) * FrameTime()
                local flAngleDiff = math.abs(AngleDiff(
                    nil,
                    VectorToAngles((bulletData.__target - privious):Normalized()).y,
                    VectorToAngles(direction).y
                ))
                if flAngleDiff < flAngle then
                    flAngle = flAngleDiff
                end
                if cross.z > 0 then
                    bulletData.__thinker:SetLocalOrigin(privious + RotatePosition(
                        vec3_zero,
                        QAngle(0, flAngle, 0),
                        bulletData.__velocity:Normalized()
                    ) * bulletData.moveSpeed * FrameTime() * 4)
                else
                    bulletData.__thinker:SetLocalOrigin(privious + RotatePosition(
                        vec3_zero,
                        QAngle(0, -flAngle, 0),
                        bulletData.__velocity:Normalized()
                    ) * bulletData.moveSpeed * FrameTime() * 4)
                end
                bulletData.__velocity = (bulletData.__thinker:GetAbsOrigin() - privious):Normalized() * bulletData.moveSpeed
                bulletData.__thinker:SetForwardVector(bulletData.__velocity:Normalized())
            else
                bulletData.__thinker:SetLocalOrigin(bulletData.__position + bulletData.__velocity * (FrameTime() * 4))
            end
            bulletData.__position = bulletData.__position + bulletData.__velocity * FrameTime()
        end
    end
end
function CBullet.prototype.OnRingBulletThink(self, bulletData)
    if bulletData.__nextThink ~= nil and bulletData.interval ~= nil and bulletData.OnIntervalThink ~= nil and GameRules:GetGameTime() >= bulletData.__nextThink then
        local success, result = xpcall(bulletData.OnIntervalThink, traceback, bulletData)
        if success then
            if result ~= nil then
                local ____bulletData_120 = bulletData
                local ____temp_119
                if result < 0 then
                    ____temp_119 = nil
                else
                    ____temp_119 = result
                end
                ____bulletData_120.interval = ____temp_119
                local ____bulletData_122 = bulletData
                local ____temp_121
                if result < 0 then
                    ____temp_121 = nil
                else
                    ____temp_121 = GameRules:GetGameTime() + result
                end
                ____bulletData_122.__nextThink = ____temp_121
            else
                bulletData.__nextThink = GameRules:GetGameTime() + bulletData.interval
            end
        end
    end
    bulletData.__lifeTimeRemaining = bulletData.__lifeTimeRemaining - FrameTime()
    if bulletData.followEntity ~= nil then
        if not IsValid(nil, bulletData.followEntity) then
            self:DestroyBullet(bulletData)
            return
        end
        bulletData.__position = bulletData.followEntity:GetAbsOrigin()
    end
    if bulletData.OnBulletThink ~= nil then
        xpcall(bulletData.OnBulletThink, traceback, bulletData.__position, bulletData)
    end
    if bulletData.caster ~= nil and bulletData.OnBulletHit ~= nil then
        local startRadius = bulletData.__radius
        local endRadius = bulletData.__radius + bulletData.width
        local targets = {}
        if bulletData.FuncUnitFinder ~= nil then
            local a, b = xpcall(
                bulletData.FuncUnitFinder,
                traceback,
                bulletData.__position,
                bulletData.__position,
                startRadius,
                endRadius,
                bulletData
            )
            if a == true then
                targets = b
            end
        else
            targets = FindUnitsInRadius(
                bulletData.__teamNumber,
                bulletData.__position,
                nil,
                endRadius,
                bulletData.teamFilter,
                bulletData.typeFilter,
                bulletData.flagFilter,
                FIND_ANY_ORDER,
                false
            )
            targets = __TS__ArrayFilter(
                targets,
                function(____, v) return (v:GetAbsOrigin() - bulletData.__position):Length2D() >= startRadius and not v:HasState(StateEnum.DODGE_BULLET) end
            )
        end
        if bulletData.debug then
            DebugDrawCircle(
                bulletData.__position,
                Vector(255, 0, 0),
                0,
                endRadius,
                true,
                0.1
            )
        end
        for _, unit in ipairs(targets) do
            if TableFindKey(nil, bulletData.__hitRecord, unit) == nil then
                if self:SafeUnitFilter(bulletData, unit) then
                    local success, result = xpcall(
                        bulletData.OnBulletHit,
                        traceback,
                        unit,
                        bulletData.__position,
                        bulletData
                    )
                    table.insert(bulletData.__hitRecord, unit)
                    if success == true and result == true then
                        break
                    end
                end
            end
        end
    end
    bulletData.__radius = bulletData.__radius + bulletData.moveSpeed * FrameTime()
    if bulletData.__lifeTimeRemaining <= 0 then
        self:DestroyBullet(bulletData)
    end
end
function CBullet.prototype.CreateSurroundGroup(self, params)
    if self.surroundGroup[params.group] == nil then
        self.surroundGroup[params.group] = params
    end
    return self.surroundGroup[params.group]
end
function CBullet.prototype.OnSurroundGroupThink(self, groupData)
    if not IsValid(nil, groupData.caster) then
        groupData.caster = nil
    end
    groupData.__position = groupData.caster ~= nil and groupData.caster:GetAbsOrigin() or groupData.__position
    groupData.angle = groupData.angle + groupData.angularVelocity * FrameTime()
    groupData.angle = groupData.angle % 360
    local projIndexList = shallowcopy(nil, groupData.bulletList)
    for i, projIndex in ipairs(projIndexList) do
        self:OnSurroundBulletThink(projIndex, i - 1, groupData)
    end
end
function CBullet.prototype.OnSurroundBulletThink(self, projIndex, groupIndex, groupData)
    local bulletData = self.bulletList[projIndex]
    if bulletData == nil then
        return
    end
    if bulletData.__nextThink ~= nil and bulletData.interval ~= nil and bulletData.OnIntervalThink ~= nil and GameRules:GetGameTime() >= bulletData.__nextThink then
        local success, result = xpcall(bulletData.OnIntervalThink, traceback, bulletData)
        if success then
            if result ~= nil then
                local ____bulletData_124 = bulletData
                local ____temp_123
                if result < 0 then
                    ____temp_123 = nil
                else
                    ____temp_123 = result
                end
                ____bulletData_124.interval = ____temp_123
                local ____bulletData_126 = bulletData
                local ____temp_125
                if result < 0 then
                    ____temp_125 = nil
                else
                    ____temp_125 = GameRules:GetGameTime() + result
                end
                ____bulletData_126.__nextThink = ____temp_125
            else
                bulletData.__nextThink = GameRules:GetGameTime() + bulletData.interval
            end
        end
    end
    local bulletCount = #groupData.bulletList
    local angleInterval = 360 / bulletCount
    local targetAngle = groupData.angle + angleInterval * groupIndex
    local angleDiff = Round(
        nil,
        AngleDiff(nil, targetAngle, bulletData.angle),
        2
    )
    bulletData.angle = bulletData.angle + (groupData.angularVelocity + angleDiff) * FrameTime()
    bulletData.angle = bulletData.angle % 360
    local trackFix = 0
    if bulletData.caster ~= nil and bulletData.track then
        local trackRadius = GetRingTrackRadius(nil, bulletData.caster)
        if trackRadius > 0 then
            local targets = FindUnitsInRadius(
                bulletData.caster:GetTeamNumber(),
                groupData.__position,
                nil,
                groupData.circleRadius + trackRadius,
                DOTA_UNIT_TARGET_TEAM_ENEMY,
                DOTA_UNIT_TARGET_HEROES_AND_CREEPS,
                DOTA_UNIT_TARGET_FLAG_NONE,
                FIND_ANY_ORDER,
                false
            )
            for i, unit in ipairs(targets) do
                local c = (unit:GetAbsOrigin() - groupData.__position):Length2D() - groupData.circleRadius
                local a = -1 / 900 * c
                local b = (900 * a + c) / 30
                local x = math.min(
                    math.abs(AngleDiff(
                        nil,
                        VectorToAngles(CalcDirection2D(
                            nil,
                            unit:GetAbsOrigin(),
                            groupData.__position
                        )).y,
                        bulletData.angle
                    )),
                    30
                )
                trackFix = trackFix + a * x * x + b * x + c
            end
            trackFix = math.min(trackFix, trackRadius)
        end
    end
    local circleRadius = bulletData.circleRadius + trackFix
    local privious = bulletData.__position
    bulletData.__position = groupData.__position + AnglesToVector(QAngle(0, bulletData.angle, 0)) * circleRadius + Vector(0, 0, bulletData.offset)
    if bulletData.debug then
        DebugDrawCircle(
            bulletData.__position,
            Vector(0, 255, 0),
            0,
            10,
            true,
            1
        )
    end
    if IsValid(nil, bulletData.__thinker) then
        bulletData.__thinker:SetLocalOrigin(bulletData.__position)
    end
    if bulletData.OnBulletThink ~= nil then
        xpcall(bulletData.OnBulletThink, traceback, bulletData.__position, bulletData)
    end
    if bulletData.caster ~= nil and bulletData.OnBulletHit ~= nil then
        local startRadius = bulletData.radius or 0
        local endRadius = bulletData.radius or 0
        local targets = {}
        if bulletData.FuncUnitFinder ~= nil then
            local a, b = xpcall(
                bulletData.FuncUnitFinder,
                traceback,
                privious,
                bulletData.__position,
                startRadius,
                endRadius,
                bulletData
            )
            if a == true then
                targets = b
            end
        else
            targets = self:FindUnitInLine(
                bulletData.__teamNumber,
                privious,
                bulletData.__position,
                startRadius,
                endRadius,
                bulletData.teamFilter,
                bulletData.typeFilter,
                bulletData.flagFilter
            )
        end
        for _, unit in ipairs(targets) do
            if TableFindKey(nil, bulletData.__hitRecord, unit) == nil then
                if self:SafeUnitFilter(bulletData, unit) then
                    local success, result = xpcall(
                        bulletData.OnBulletHit,
                        traceback,
                        unit,
                        bulletData.__position,
                        bulletData
                    )
                    if success == true and result == true then
                        self:DestroyBullet(bulletData)
                        break
                    end
                end
            end
        end
        bulletData.__hitRecord = targets
    end
    if bulletData.__lifeTimeRemaining ~= nil then
        bulletData.__lifeTimeRemaining = bulletData.__lifeTimeRemaining - FrameTime()
        if bulletData.__lifeTimeRemaining <= 0 then
            self:DestroyBullet(bulletData)
        end
    end
end
function CBullet.prototype.OnCustomBulletThink(self, bulletData)
    if bulletData.__nextThink ~= nil and bulletData.interval ~= nil and bulletData.OnIntervalThink ~= nil and GameRules:GetGameTime() >= bulletData.__nextThink then
        local success, result = xpcall(bulletData.OnIntervalThink, traceback, bulletData)
        if success then
            if result ~= nil then
                local ____bulletData_128 = bulletData
                local ____temp_127
                if result < 0 then
                    ____temp_127 = nil
                else
                    ____temp_127 = result
                end
                ____bulletData_128.interval = ____temp_127
                local ____bulletData_130 = bulletData
                local ____temp_129
                if result < 0 then
                    ____temp_129 = nil
                else
                    ____temp_129 = GameRules:GetGameTime() + result
                end
                ____bulletData_130.__nextThink = ____temp_129
            else
                bulletData.__nextThink = GameRules:GetGameTime() + bulletData.interval
            end
        end
    end
    if bulletData.__lifeTimeRemaining ~= nil then
        bulletData.__lifeTimeRemaining = bulletData.__lifeTimeRemaining - FrameTime()
    end
    local privious = bulletData.__previous or bulletData.__position
    if bulletData.debug then
        DebugDrawCircle(
            bulletData.__position,
            Vector(0, 255, 0),
            0,
            10,
            true,
            1
        )
    end
    if IsValid(nil, bulletData.__thinker) then
        bulletData.__thinker:SetLocalOrigin(bulletData.__position)
    end
    if bulletData.OnBulletThink ~= nil then
        xpcall(bulletData.OnBulletThink, traceback, bulletData.__position, bulletData)
    end
    if bulletData.caster ~= nil and bulletData.OnBulletHit ~= nil then
        local targets = {}
        if bulletData.FuncUnitFinder ~= nil then
            local a, b = xpcall(
                bulletData.FuncUnitFinder,
                traceback,
                privious,
                bulletData.__position,
                bulletData.radius or 0,
                bulletData
            )
            if a == true then
                targets = b
            end
        end
        for _, unit in ipairs(targets) do
            if TableFindKey(nil, bulletData.__hitRecord, unit) == nil then
                if self:SafeUnitFilter(bulletData, unit) then
                    local success, result = xpcall(
                        bulletData.OnBulletHit,
                        traceback,
                        unit,
                        bulletData.__position,
                        bulletData
                    )
                    table.insert(bulletData.__hitRecord, unit)
                    if success == true and result == true then
                        self:DestroyBullet(bulletData)
                        break
                    end
                end
            end
        end
    end
    if bulletData.__lifeTimeRemaining ~= nil then
        if bulletData.__lifeTimeRemaining <= 0 then
            self:DestroyBullet(bulletData)
        end
    end
    if self.bulletList[bulletData.__projIndex] ~= nil then
        if bulletData.PathFunction ~= nil then
            local success, result = xpcall(bulletData.PathFunction, traceback, bulletData.__position, bulletData)
            if success == true then
                bulletData.__previous = bulletData.__position
                bulletData.__position = result
            else
                self:DestroyBullet(bulletData)
            end
        end
    end
end
function CBullet.prototype.FindUnitInLine(self, teamNumber, start, ____end, startRadius, endRadius, targetTeam, targetType, targetFlags)
    if targetTeam == nil then
        targetTeam = DOTA_UNIT_TARGET_TEAM_ENEMY
    end
    if targetType == nil then
        targetType = DOTA_UNIT_TARGET_BASIC + DOTA_UNIT_TARGET_HERO
    end
    if targetFlags == nil then
        targetFlags = DOTA_UNIT_TARGET_FLAG_NONE
    end
    local direction = (start - ____end):Normalized()
    local lineLength = (start - ____end):Length2D()
    local radius = lineLength + startRadius + endRadius
    local center = VectorLerp(nil, 0.5, start + direction * startRadius, ____end - direction * endRadius)
    local perpendicular = RotatePosition(
        vec3_zero,
        QAngle(0, 90, 0),
        direction
    )
    local points = {start + perpendicular * startRadius, start - perpendicular * startRadius, ____end - perpendicular * endRadius, ____end + perpendicular * endRadius}
    self:_DebugDrawCircle(
        start,
        Vector(255, 0, 0),
        0,
        startRadius,
        true,
        0.2
    )
    self:_DebugDrawCircle(
        ____end,
        Vector(255, 0, 0),
        0,
        endRadius,
        true,
        0.2
    )
    local targetInLine = {}
    local targets = FindUnitsInRadius(
        teamNumber,
        center,
        nil,
        radius,
        targetTeam,
        targetType,
        targetFlags,
        FIND_ANY_ORDER,
        false
    )
    for _, unit in ipairs(targets) do
        local unitPosition = unit:GetAbsOrigin()
        local distToEnd = (unitPosition - ____end):Length2D()
        local hit = false
        if distToEnd < endRadius and direction:Dot((unitPosition - start):Normalized()) < 0 then
            hit = true
        elseif self:IsPointInPolygon(unitPosition, points) then
            hit = true
        end
        if hit == false then
            local segInfo = self:_CalcDistanceSegmentToEntityOBB2D(unit, start, ____end)
            local t = segInfo.t
            local radiusAtT = startRadius + (endRadius - startRadius) * t
            if segInfo.distance <= radiusAtT then
                hit = true
            end
        end
        if hit == true then
            if not unit:HasState(StateEnum.DODGE_BULLET) then
                targetInLine[#targetInLine + 1] = unit
            else
                Event:Fire("avoid_damage", {unit = unit})
            end
        end
    end
    return targetInLine
end
function CBullet.prototype._ProjectPointToSegmentT2D(self, point, start, ____end)
    local seg = ____end - start
    local segLen = seg:Length2D()
    if segLen <= 0.001 then
        return 0
    end
    local denom = segLen * segLen
    local t = (point - start):Dot(seg) / denom
    if t < 0 then
        t = 0
    end
    if t > 1 then
        t = 1
    end
    return t
end
function CBullet.prototype._CalcDistancePointToEntityOBB2D(self, entity, point)
    local closest = CalcClosestPointOnEntityOBB(entity, point)
    return (point - closest):Length2D()
end
function CBullet.prototype._CalcDistanceSegmentToEntityOBB2D(self, entity, start, ____end)
    local seg = ____end - start
    local segLen = seg:Length2D()
    if segLen <= 0.001 then
        return {
            distance = self:_CalcDistancePointToEntityOBB2D(entity, start),
            t = 0
        }
    end
    local t = self:_ProjectPointToSegmentT2D(
        entity:GetAbsOrigin(),
        start,
        ____end
    )
    local probe = start + seg * t
    do
        local i = 0
        while i < 2 do
            local closest = CalcClosestPointOnEntityOBB(entity, probe)
            t = self:_ProjectPointToSegmentT2D(closest, start, ____end)
            probe = start + seg * t
            i = i + 1
        end
    end
    local closestFinal = CalcClosestPointOnEntityOBB(entity, probe)
    local distance = (probe - closestFinal):Length2D()
    return {distance = distance, t = t}
end
CBullet = __TS__DecorateLegacy({reloadable}, CBullet)
if Bullet == nil then
    Bullet = __TS__New(CBullet)
end
return ____exports
