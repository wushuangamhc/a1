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
