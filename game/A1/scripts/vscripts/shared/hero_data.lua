--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
____exports.HERO_DEFINITIONS = {
    striker = {
        id = "striker",
        displayName = "Striker",
        displayNameCn = "虞姬",
        description = "直线瞬发弩箭，命中首个敌人即秒杀。会被障碍物阻挡。",
        difficulty = "low",
        projectileType = "instant_line",
        maxRange = 1100,
        projectileWidth = 96,
        cooldown = 0.75
    },
    deadeye = {
        id = "deadeye",
        displayName = "Deadeye",
        displayNameCn = "百里守约",
        description = "可蓄力射击，射程+50%，子弹超远。",
        difficulty = "high",
        projectileType = "charged_line",
        maxRange = 1350,
        projectileWidth = 84,
        cooldown = 1.2,
        maxChargeTime = 0.5,
        chargeRangeBonusPct = 0.5
    },
    boomerang = {
        id = "boomerang",
        displayName = "Boomerang",
        displayNameCn = "李元芳",
        description = "飞镖发射后会收回，触碰面积较粗。",
        difficulty = "low",
        projectileType = "returning_line",
        maxRange = 900,
        projectileWidth = 128,
        cooldown = 1,
        returnWidthMultiplier = 1.2
    },
    arc_mage = {
        id = "arc_mage",
        displayName = "Arc Mage",
        displayNameCn = "干将莫邪",
        description = "弧线双剑，从两侧汇聚到交汇点判定范围伤害。",
        difficulty = "high",
        projectileType = "converging_arc",
        maxRange = 1200,
        projectileWidth = 150,
        cooldown = 1.1,
        convergeRadius = 150
    },
    roller = {
        id = "roller",
        displayName = "Roller",
        displayNameCn = "孙尚香",
        description = "向鼠标方向翻滚后发射直线子弹。",
        difficulty = "medium",
        projectileType = "roll_shot",
        maxRange = 1000,
        projectileWidth = 96,
        cooldown = 0.9
    }
}
return ____exports
