import * as React from "react";
import { HERO_IDS, HeroId, MatchStateSnapshot, PlayerCombatState } from "@shared/types";
import { getLocalPlayerId, getMatchSnapshot, getPlayerState, interactPickup, selectHero, sendFireRequest, useTeleport } from "@panorama/utils/net";

function useNetTableState<T>(reader: () => T | undefined, initial: T): T {
  const [value, setValue] = React.useState<T>(initial);

  React.useEffect(() => {
    let cancelled = false;
    const poll = (): void => {
      if (cancelled) {
        return;
      }
      const next = reader();
      if (next) {
        setValue(next);
      }
      $.Schedule(0.1, poll);
    };
    $.Schedule(0.1, poll);

    return () => {
      cancelled = true;
    };
  }, []);

  return value;
}

function getAimPoint(): { x: number; y: number; z: number } {
  const cursor = GameUI.GetCursorPosition();
  const worldPosition = GameUI.GetScreenWorldPosition(cursor);
  if (worldPosition) {
    return {
      x: worldPosition[0],
      y: worldPosition[1],
      z: worldPosition[2]
    };
  }

  const portraitUnit = Players.GetPlayerHeroEntityIndex(getLocalPlayerId());
  const origin = Entities.GetAbsOrigin(portraitUnit);
  const forward = Entities.GetForward(portraitUnit);
  return {
    x: origin[0] + forward[0] * 700,
    y: origin[1] + forward[1] * 700,
    z: origin[2]
  };
}

function App(): React.ReactElement {
  const playerId = getLocalPlayerId();
  const playerState = useNetTableState<PlayerCombatState | undefined>(() => getPlayerState(playerId), undefined);
  const snapshot = useNetTableState<MatchStateSnapshot | undefined>(() => getMatchSnapshot(), undefined);

  const onFire = (chargePct = 0): void => {
    const target = getAimPoint();
    sendFireRequest({
      targetX: target.x,
      targetY: target.y,
      targetZ: target.z,
      chargePct
    });
  };

  const heroButtons = HERO_IDS.map((heroId: HeroId) => (
    <TextButton
      key={heroId}
      className={`HeroButton ${playerState?.heroId === heroId ? "HeroButton--active" : ""}`}
      onactivate={() => selectHero(heroId)}
      text={heroId}
    />
  ));

  return (
    <Panel id="HudShell">
      <Panel id="TopBar">
        <Label className="HudTitle" text="One Shot One Kill Alpha" />
        <Label
          className="HudTimer"
          text={`Time ${Math.ceil(snapshot?.timeRemaining ?? 0)}s`}
        />
      </Panel>

      <Panel id="StatusCard">
        <Label className="CardHeading" text="Combat State" />
        <Label text={`Hero: ${playerState?.heroId ?? "striker"}`} />
        <Label text={`Blessing: ${playerState?.blessingId ?? "none"}`} />
        <Label text={`Rune: ${playerState?.activeRuneId ?? "none"}`} />
        <Label text={`Kills / Deaths: ${playerState?.kills ?? 0} / ${playerState?.deaths ?? 0}`} />
        <Label text={`Shield: ${playerState?.hasShield ? "ready" : "none"}`} />
      </Panel>

      <Panel id="HeroSelectCard">
        <Label className="CardHeading" text="Hero Select" />
        <Panel className="ButtonRow">{heroButtons}</Panel>
      </Panel>

      <Panel id="ActionCard">
        <Label className="CardHeading" text="Debug Actions" />
        <Panel className="ButtonRow">
          <TextButton className="ActionButton" onactivate={() => onFire(0)} text="Fire" />
          <TextButton className="ActionButton" onactivate={() => onFire(1)} text="Charged Shot" />
          <TextButton className="ActionButton" onactivate={() => interactPickup("oss_blessing_shrine_shield")} text="Shield Blessing" />
          <TextButton className="ActionButton" onactivate={() => interactPickup("oss_rune_spawn_haste")} text="Haste Rune" />
          <TextButton className="ActionButton" onactivate={() => useTeleport("oss_teleport_1")} text="Teleport 1" />
        </Panel>
      </Panel>

      <Panel id="HintCard">
        <Label className="CardHeading" text="Alpha Notes" />
        <Label text="Small-room and FFA testing use the same HUD. Fire toward cursor when possible." />
        <Label text="Map authors should place named entities described in README to activate pickups, bushes, and teleports." />
      </Panel>
    </Panel>
  );
}

$.RegisterForUnhandledEvent("DOTAHudReady", () => {
  const root = $("#HudRoot");
  if (!root) {
    return;
  }

  React.render(<App />, root);
});
