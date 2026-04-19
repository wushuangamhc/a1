import { HeroDefinition, HeroId, ProjectileType } from "./types";

export const HERO_DEFINITIONS: Record<HeroId, HeroDefinition> = {
  windrunner: {
    id: "windrunner",
    displayName: "Windranger",
    displayNameCn: "风行者",
    description: "直线瞬发弩箭，命中首个敌人即秒杀。会被障碍物阻挡。",
    difficulty: "low",
    projectileType: "instant_line" as ProjectileType,
    maxRange: 1100,
    projectileWidth: 96,
    cooldown: 0.75
  },
  sniper: {
    id: "sniper",
    displayName: "Sniper",
    displayNameCn: "火枪手",
    description: "可蓄力射击，射程+50%，子弹超远。",
    difficulty: "high",
    projectileType: "charged_line" as ProjectileType,
    maxRange: 1350,
    projectileWidth: 84,
    cooldown: 1.2,
    maxChargeTime: 0.5,
    chargeRangeBonusPct: 0.5
  },
};
