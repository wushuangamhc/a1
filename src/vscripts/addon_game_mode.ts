import { OneShotGameMode } from "@game/game_mode";

declare global {
  interface CDOTAGameRules {
    OneShotGameMode?: OneShotGameMode;
  }
}

function Activate() {
  if (!GameRules.OneShotGameMode) {
    GameRules.OneShotGameMode = new OneShotGameMode();
  }
  GameRules.OneShotGameMode.init();
}

// Dota 2 engine requires Activate to be a global function in addon_game_mode.lua
(_G as any).Activate = Activate;
