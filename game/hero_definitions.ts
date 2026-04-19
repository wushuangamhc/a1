import { HeroId, ProjectileType } from "@shared/types";

export interface HeroDefinition {
  id: HeroId;
  displayName: string;
  projectileType: ProjectileType;
  maxRange: number;
  projectileWidth: number;
  cooldown: number;
  maxChargeTime?: number;
  chargeRangeBonusPct?: number;
  returnWidthMultiplier?: number;
}

export const HERO_DEFINITIONS: Record<HeroId, HeroDefinition> = {
  striker: {
    id: "striker",
    displayName: "Striker",
    projectileType: "instant_line",
    maxRange: 1100,
    projectileWidth: 96,
    cooldown: 0.75
  },
  deadeye: {
    id: "deadeye",
    displayName: "Deadeye",
    projectileType: "charged_line",
    maxRange: 1350,
    projectileWidth: 84,
    cooldown: 1.2,
    maxChargeTime: 0.5,
    chargeRangeBonusPct: 0.5
  },
  boomerang: {
    id: "boomerang",
    displayName: "Boomerang",
    projectileType: "returning_line",
    maxRange: 900,
    projectileWidth: 128,
    cooldown: 1.0,
    returnWidthMultiplier: 1.2
  }
};
