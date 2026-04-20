import { OneShotGameMode } from "@game/game_mode";
import { CModule } from "@game/framework/module";
import "@game/framework/timer";
import "@game/systems/bullet";

declare global {
  interface CDOTAGameRules {
    OneShotGameMode?: OneShotGameMode;
  }
}

function Activate() {
  print("[A1] Activate() called by Dota engine");
  if (!GameRules.OneShotGameMode) {
    GameRules.OneShotGameMode = new OneShotGameMode();
    print("[A1] OneShotGameMode instance created");
  }
  // 初始化所有注册的框架模块（Timer、Bullet 等）
  CModule.initialize();
  print("[A1] CModule.initialize() finished");
  GameRules.OneShotGameMode.init();
  print("[A1] OneShotGameMode.init() finished");
}

// Dota 2 engine requires Activate to be a global function in addon_game_mode.lua
(_G as any).Activate = Activate;
print("[A1] addon_game_mode.lua loaded, _G.Activate registered");
