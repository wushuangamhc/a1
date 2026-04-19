import * as React from "react";
import { render } from "react-panorama";
import { HeroId, HERO_IDS, MatchStateSnapshot, PlayerCombatState } from "@shared/types";
import { HERO_DEFINITIONS } from "@panorama/utils/hero_data";
import {
  getLocalPlayerId,
  getMatchSnapshot,
  getPlayerState,
  interactPickup,
  selectHero,
  useTeleport
} from "@panorama/utils/net";
function useNetTableState<T>(reader: () => T | undefined, initial: T): T {
  const [value, setValue] = React.useState<T>(initial);

  React.useEffect(() => {
    let cancelled = false;
    const poll = (): void => {
      if (cancelled) return;
      const next = reader();
      if (next !== undefined) {
        setValue(next);
      }
      $.Schedule(0.1, poll);
    };
    $.Schedule(0.1, poll);
    return () => { cancelled = true; };
  }, []);

  return value;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  low: "入门",
  medium: "普通",
  high: "困难",
  extreme: "极难"
};

const DIFFICULTY_COLORS: Record<string, string> = {
  low: "#4ade80",
  medium: "#facc15",
  high: "#fb923c",
  extreme: "#f87171"
};

function HeroSelectOverlay(props: {
  snapshot: MatchStateSnapshot | undefined;
  onSelect: (heroId: HeroId) => void;
  selectedHero: HeroId | undefined;
  confirmed: boolean;
  onConfirm: () => void;
}): React.ReactElement {
  const { snapshot, onSelect, selectedHero, confirmed, onConfirm } = props;
  const isVisible = (snapshot?.phase === "warmup" || snapshot?.phase === "pregame") && !confirmed;

  if (!isVisible) {
    return <Panel id="HeroSelectOverlay" style={{ visibility: "collapse" }} />;
  }

  return (
    <Panel id="HeroSelectOverlay">
      <Panel id="HeroSelectPanel">
        <Label id="HeroSelectTitle" text="选择你的射手" />
        <Label id="HeroSelectSubtitle" text="每位英雄的投射手感各不相同" />

        <Panel id="HeroGrid">
          {HERO_IDS.map((heroId) => {
            const def = HERO_DEFINITIONS[heroId];
            const isSelected = selectedHero === heroId;
            return (
              <Panel
                key={heroId}
                className={`HeroCard ${isSelected ? "HeroCard--selected" : ""}`}
                onactivate={() => onSelect(heroId)}
              >
                <Label className="HeroCardName" text={def.displayNameCn} />
                <Label className="HeroCardNameEn" text={def.displayName} />
                <Label
                  className="HeroCardDifficulty"
                  text={`难度: ${DIFFICULTY_LABELS[def.difficulty]}`}
                  style={{ color: DIFFICULTY_COLORS[def.difficulty] }}
                />
                <Label className="HeroCardDesc" text={def.description} />
              </Panel>
            );
          })}
        </Panel>

        <TextButton
          id="HeroConfirmButton"
          className={selectedHero ? "" : "HeroConfirmButton--disabled"}
          text={selectedHero ? "确认选择" : "请先选择英雄"}
          onactivate={onConfirm}
        />
      </Panel>
    </Panel>
  );
}

function KillFeedEntry(props: {
  attackerName: string;
  victimName: string;
  heroName: string;
}): React.ReactElement {
  const { attackerName, victimName, heroName } = props;
  return (
    <Panel className="KillFeedEntry">
      <Label className="KillFeedAttacker" text={attackerName} />
      <Label className="KillFeedAction" text=" 击杀了 " />
      <Label className="KillFeedVictim" text={victimName} />
      <Label className="KillFeedHero" text={` [${heroName}]`} />
    </Panel>
  );
}

function App(): React.ReactElement {
  const playerId = getLocalPlayerId();
  const playerState = useNetTableState<PlayerCombatState | undefined>(() => getPlayerState(playerId), undefined);
  const snapshot = useNetTableState<MatchStateSnapshot | undefined>(() => getMatchSnapshot(), undefined);

  const [selectedHero, setSelectedHero] = React.useState<HeroId | undefined>(undefined);
  const [confirmed, setConfirmed] = React.useState(false);
  const [killFeed, setKillFeed] = React.useState<Array<{ attackerName: string; victimName: string; heroName: string }>>([]);

  const handleSelectHero = (heroId: HeroId): void => {
    setSelectedHero(heroId);
    setConfirmed(false);
  };

  const handleConfirmHero = (): void => {
    if (!selectedHero) return;
    setConfirmed(true);
    selectHero(selectedHero);
  };

  React.useEffect(() => {
    $.Msg("[A1 HUD] mount");
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_HERO_SELECTION_TEAMS, false);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_HERO_SELECTION_GAME_NAME, false);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_HERO_SELECTION_CLOCK, false);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_HERO_SELECTION_HEADER, false);
    GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_PREGAME_STRATEGYUI, false);
  }, []);

  // Listen for projectile fired events (client-side visual effect)
  React.useEffect(() => {
    const listener = GameEvents.Subscribe("oss_projectile_fired", (event: any) => {
      const origin = [event.origin_x, event.origin_y, event.origin_z];
      const target = [event.target_x, event.target_y, event.target_z];

      // Create a simple particle line effect
      const particleId = Particles.CreateParticle(
        "particles/ui_mouseactions/range_finder_cone.vpcf",
        ParticleAttachment_t.PATTACH_WORLDORIGIN,
        undefined as any
      );
      Particles.SetParticleControl(particleId, 0, origin as [number, number, number]);
      Particles.SetParticleControl(particleId, 1, target as [number, number, number]);
      Particles.SetParticleControl(particleId, 2, [255, 200, 100]);

      // Destroy after a short duration
      $.Schedule(0.15, () => {
        Particles.DestroyParticleEffect(particleId, true);
      });
    });

    return () => {
      if (listener !== undefined) {
        GameEvents.Unsubscribe(listener);
      }
    };
  }, []);

  // Listen for kill feed events
  React.useEffect(() => {
    let cancelled = false;

    const listener = GameEvents.Subscribe("oss_kill_feed", (event: any) => {
      if (cancelled) return;
      const attackerName = Players.GetPlayerName(event.attacker_id as never) || `Player ${event.attacker_id}`;
      const victimName = Players.GetPlayerName(event.victim_id as never) || `Player ${event.victim_id}`;
      const heroDef = HERO_DEFINITIONS[event.hero_id as HeroId];
      const heroName = heroDef ? heroDef.displayNameCn : event.hero_id;

      const entry = { attackerName, victimName, heroName };
      setKillFeed(prev => {
        const next = [entry, ...prev];
        return next.slice(0, 5);
      });

      // Auto remove after 4 seconds
      $.Schedule(4, () => {
        if (cancelled) return;
        setKillFeed(prev => prev.filter(e => e !== entry));
      });
    });

    return () => {
      cancelled = true;
      if (listener !== undefined) {
        GameEvents.Unsubscribe(listener);
      }
    };
  }, []);

  return (
    <Panel id="HudShell">
      {/* Hero Select Overlay */}
      <HeroSelectOverlay
        snapshot={snapshot}
        onSelect={handleSelectHero}
        selectedHero={selectedHero}
        confirmed={confirmed}
        onConfirm={handleConfirmHero}
      />

      {/* Kill Feed */}
      <Panel id="KillFeed">
        {killFeed.map((entry, index) => (
          <KillFeedEntry key={index} attackerName={entry.attackerName} victimName={entry.victimName} heroName={entry.heroName} />
        ))}
      </Panel>

      {/* Top Bar */}
      <Panel id="TopBar">
        <Label className="HudTitle" text="一击必杀" />
        <Label className="HudTimer" text={`${Math.ceil(snapshot?.timeRemaining ?? 0)}s`} />
        <Label className="HudMode" text={snapshot?.mode === "ffa" ? "自由混战" : "组队模式"} />
      </Panel>

      {/* Status Card */}
      <Panel id="StatusCard">
        <Label className="CardHeading" text="战斗状态" />
        <Label text={`英雄: ${playerState?.heroId ? HERO_DEFINITIONS[playerState.heroId]?.displayNameCn ?? playerState.heroId : "未选择"}`} />
        <Label text={`祝福: ${playerState?.blessingId ?? "none"}`} />
        <Label text={`神符: ${playerState?.activeRuneId ?? "none"}`} />
        <Label text={`击杀 / 死亡: ${playerState?.kills ?? 0} / ${playerState?.deaths ?? 0}`} />
        <Label text={`护盾: ${playerState?.hasShield ? "就绪" : "无"}`} />
      </Panel>

      {/* Action Card */}
      <Panel id="ActionCard">
        <Label className="CardHeading" text="操作" />
        <Panel className="ButtonRow">
          <TextButton className="ActionButton" onactivate={() => interactPickup("oss_blessing_shrine_shield")} text="护盾祝福" />
          <TextButton className="ActionButton" onactivate={() => interactPickup("oss_rune_spawn_haste")} text="极速神符" />
          <TextButton className="ActionButton" onactivate={() => useTeleport("oss_teleport_1")} text="传送门" />
        </Panel>
      </Panel>
    </Panel>
  );
}

let hasMountedHud = false;

function mountHud(): void {
  $.Msg("[A1 HUD] mount attempt");

  if (hasMountedHud) {
    $.Msg("[A1 HUD] mount skipped because HUD is already mounted");
    return;
  }

  const root = $("#HudRoot");
  if (!root) {
    $.Msg("[A1 HUD] mount waiting for #HudRoot");
    return;
  }

  hasMountedHud = true;
  $.Msg("[A1 HUD] mount success, rendering app");
  render(<App />, root);
}

$.Schedule(0, mountHud);
$.RegisterForUnhandledEvent("DOTAHudReady", mountHud);
