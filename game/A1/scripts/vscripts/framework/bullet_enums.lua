--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
--- 弹道相关枚举 —— 从 c1 项目迁移
____exports.BULLET_TYPE = ____exports.BULLET_TYPE or ({})
____exports.BULLET_TYPE.CUSTOM = 0
____exports.BULLET_TYPE[____exports.BULLET_TYPE.CUSTOM] = "CUSTOM"
____exports.BULLET_TYPE.LINEAR = 1
____exports.BULLET_TYPE[____exports.BULLET_TYPE.LINEAR] = "LINEAR"
____exports.BULLET_TYPE.TRACKING = 2
____exports.BULLET_TYPE[____exports.BULLET_TYPE.TRACKING] = "TRACKING"
____exports.BULLET_TYPE.SURROUND = 3
____exports.BULLET_TYPE[____exports.BULLET_TYPE.SURROUND] = "SURROUND"
____exports.BULLET_TYPE.GUIDED = 4
____exports.BULLET_TYPE[____exports.BULLET_TYPE.GUIDED] = "GUIDED"
____exports.BULLET_TYPE.RING = 5
____exports.BULLET_TYPE[____exports.BULLET_TYPE.RING] = "RING"
--- 临时阻挡区域类型
____exports.TEMPORARY_BLOCK_TYPE = ____exports.TEMPORARY_BLOCK_TYPE or ({})
____exports.TEMPORARY_BLOCK_TYPE.CIRCLE = 1
____exports.TEMPORARY_BLOCK_TYPE[____exports.TEMPORARY_BLOCK_TYPE.CIRCLE] = "CIRCLE"
____exports.TEMPORARY_BLOCK_TYPE.POLYGON = 2
____exports.TEMPORARY_BLOCK_TYPE[____exports.TEMPORARY_BLOCK_TYPE.POLYGON] = "POLYGON"
return ____exports
