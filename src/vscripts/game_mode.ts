import { EVENT_NAMES, FAST_RESPAWN_SECONDS, GAME_LENGTH_SECONDS, MAP_ENTITY_PREFIX } from "@shared/config";
import { HeroId, MatchMode } from "@shared/types";
import { HERO_DEFINITIONS } from "@game/hero_definitions";
import { syncPlayerState, syncScoreboard } from "@game/net_tables";
import { RuntimeState } from "@game/state";
import { now, repeatEvery, schedule } from "@game/lib/time";
import { PickupSystem } from "@game/systems/pickup_system";
import { CombatSystem } from "@game/systems/combat_system";
import { MapSystem } from "@game/systems/map_system";

export class OneShotGameMode {
  public readonly state = new RuntimeState();
  private readonly pickups = new PickupSystem(this.state);
  public readonly combat = new CombatSystem(this.state, this.pickups);
  private readonly map = new MapSystem(this.state);
  private readonly defaultMode: MatchMode = "ffa";
  private readonly confirmedHeroSelection = new Set<PlayerID>();
  private gameStarted = false;

  private readonly HERO_OVERRIDES: Record<HeroId, string> = {
    windrunner: "npc_dota_hero_windrunner",
    sniper: "npc_dota_hero_sniper",
  };

  init(): void {
    GameRules.SetHeroRespawnEnabled(false);
    GameRules.SetPreGameTime(0);
    GameRules.SetCustomGameSetupTimeout(0);
    GameRules.SetUseUniversalShopMode(false);
    GameRules.SetSameHeroSelectionEnabled(true);
    GameRules.GetGameModeEntity().SetBuybackEnabled(false);
    GameRules.GetGameModeEntity().SetPauseEnabled(false);
    GameRules.GetGameModeEntity().SetDaynightCycleDisabled(true);
    GameRules.SetTreeRegrowTime(999999);
    GameRules.GetGameModeEntity().SetExecuteOrderFilter((event) => this.filterOrders(event), this);

    ListenToGameEvent("game_rules_state_change", () => this.onRulesStateChange(), undefined);
    ListenToGameEvent("npc_spawned", (event) => this.onNpcSpawned(event), undefined);
    ListenToGameEvent("entity_killed", (event) => this.onEntityKilled(event), undefined);

    CustomGameEventManager.RegisterListener(EVENT_NAMES.selectHero, (_, payload) => this.onHeroSelected(payload));
    CustomGameEventManager.RegisterListener(EVENT_NAMES.interactPickup, (_, payload) => {
      const playerId = payload.PlayerID as PlayerID;
      this.pickups.handleInteract(playerId, payload);
    });
    CustomGameEventManager.RegisterListener(EVENT_NAMES.teleportUsed, (_, payload) => {
      const playerId = payload.PlayerID as PlayerID;
      if (payload.sourceId !== undefined && payload.sourceId !== "") {
        this.map.useTeleport(playerId, payload.sourceId);
      }
    });

    this.map.initialize();
    this.state.phase = "warmup";
    syncScoreboard(this.state);

    repeatEvery(0.1, () => this.tick());
  }

  private tick(): void {
    this.pickups.tick();
    this.map.tick();
    this.processRespawns();
    this.checkAllHeroesSelected();
    this.checkMatchEnd();
    syncScoreboard(this.state);
  }

  private onRulesStateChange(): void {
    const state = GameRules.State_Get();
    if (state === GameState.PRE_GAME) {
      this.state.phase = "pregame";
      syncScoreboard(this.state);
      return;
    }

    if (state === GameState.GAME_IN_PROGRESS && !this.gameStarted) {
      // Wait for hero selections before actually starting
      this.checkAllHeroesSelected();
    }
  }

  private checkAllHeroesSelected(): void {
    if (this.gameStarted || this.state.phase === "post_game") {
      return;
    }

    const playerCount = PlayerResource.GetPlayerCountForTeam(DotaTeam.GOODGUYS) +
      PlayerResource.GetPlayerCountForTeam(DotaTeam.BADGUYS);
    if (playerCount === 0) {
      return;
    }

    let connectedPlayers = 0;
    for (let i = 0; i < playerCount; i++) {
      if (PlayerResource.GetPlayer(i as PlayerID) !== undefined) {
        connectedPlayers++;
      }
    }

    if (connectedPlayers > 0 && this.confirmedHeroSelection.size >= connectedPlayers) {
      this.gameStarted = true;
      this.state.start(this.defaultMode);
      syncScoreboard(this.state);
    }
  }

  private onNpcSpawned(event: NpcSpawnedEvent): void {
    const unit = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC | undefined;
    if (!unit || !unit.IsRealHero()) {
      return;
    }

    const playerId = unit.GetPlayerOwnerID();
    if (playerId === undefined || playerId < 0) {
      return;
    }

    const playerState = this.state.ensurePlayer(playerId, unit.GetTeam());
    this.applyHeroPrototype(unit, playerState.heroId);

    // Camera auto-follow: lock camera to local hero (Dota engine handles map borders)
    PlayerResource.SetCameraTarget(playerId, unit);

    unit.SetBaseMaxHealth(1);
    unit.SetMaxHealth(1);
    unit.SetHealth(1);
    unit.SetDeathXP(0);
    unit.SetMinimumGoldBounty(0);
    unit.SetMaximumGoldBounty(0);
    unit.SetBaseMoveSpeed(300 + playerState.moveSpeedBonusPct);
    syncPlayerState(this.state, playerId);
  }

  private onEntityKilled(event: EntityKilledEvent): void {
    const killedUnit = EntIndexToHScript(event.entindex_killed) as CDOTA_BaseNPC | undefined;
    if (!killedUnit || !killedUnit.IsRealHero()) {
      return;
    }

    const playerId = killedUnit.GetPlayerOwnerID();
    if (playerId === undefined || playerId < 0) {
      return;
    }

    const playerState = this.state.players.get(playerId);
    if (!playerState) {
      return;
    }

    playerState.isAlive = false;
    playerState.respawnAt = now() + FAST_RESPAWN_SECONDS;
    syncPlayerState(this.state, playerId);
  }

  private onHeroSelected(payload: { PlayerID?: PlayerID; heroId?: HeroId }): void {
    if (payload.PlayerID === undefined || !payload.heroId) {
      return;
    }

    const playerId = payload.PlayerID;
    const heroId = payload.heroId;
    const team = PlayerResource.GetTeam(playerId);
    const playerState = this.state.ensurePlayer(playerId, team);
    playerState.heroId = heroId;
    this.confirmedHeroSelection.add(playerId);
    syncPlayerState(this.state, playerId);

    // Replace hero with override hero that has native KV abilities
    const overrideName = this.HERO_OVERRIDES[heroId];
    if (overrideName !== undefined && overrideName !== "") {
      PlayerResource.ReplaceHeroWith(playerId, overrideName, 0, 0);
    }
  }

  private applyHeroPrototype(hero: CDOTA_BaseNPC_Hero, heroId: HeroId): void {
    const definition = HERO_DEFINITIONS[heroId];
    hero.SetCustomDeathXP(0);
    hero.SetAbilityPoints(0);
    hero.SetAttackCapability(UnitAttackCapability.NO_ATTACK);
    hero.SetAcquisitionRange(0);
    hero.SetBaseMoveSpeed(300);
    hero.SetModelScale(0.98);
  }

  private processRespawns(): void {
    for (const [playerId, playerState] of this.state.players) {
      if (playerState.isAlive || playerState.respawnAt > now()) {
        continue;
      }

      const hero = PlayerResource.GetSelectedHeroEntity(playerId);
      if (!hero) {
        continue;
      }

      playerState.isAlive = true;
      playerState.respawnAt = 0;
      hero.RespawnHero(false, false);
      hero.SetHealth(1);
      FindClearSpaceForUnit(hero, this.findSpawnPoint(playerId), true);
      syncPlayerState(this.state, playerId);
    }
  }

  private checkMatchEnd(): void {
    if (this.state.phase !== "in_progress") {
      return;
    }

    if (now() - this.state.startedAt >= GAME_LENGTH_SECONDS) {
      this.finishMatchByScore();
      return;
    }

    for (const playerState of this.state.players.values()) {
      if (playerState.kills >= 15) {
        this.state.phase = "post_game";
        this.state.winnerTeamId = playerState.teamId;
        CustomGameEventManager.Send_ServerToAllClients(EVENT_NAMES.matchEnded, this.state.snapshot());
      }
    }
  }

  private finishMatchByScore(): void {
    let bestKills = -1;
    let winningTeam: DOTATeam_t | undefined;
    for (const playerState of this.state.players.values()) {
      if (playerState.kills > bestKills) {
        bestKills = playerState.kills;
        winningTeam = playerState.teamId;
      }
    }

    this.state.phase = "post_game";
    this.state.winnerTeamId = winningTeam;
    CustomGameEventManager.Send_ServerToAllClients(EVENT_NAMES.matchEnded, this.state.snapshot());
  }

  private findSpawnPoint(playerId: PlayerID): Vector {
    const modePrefix = this.state.matchMode === "duo" ? MAP_ENTITY_PREFIX.spawnDuo : MAP_ENTITY_PREFIX.spawnFfa;
    const entity = Entities.FindByName(undefined, `${modePrefix}${playerId + 1}`);
    if (entity) {
      return entity.GetAbsOrigin();
    }
    const fallback = Vector(0, 0, 256 as never);
    return fallback + RandomVector(RandomInt(80, 280)) as Vector;
  }

  private filterOrders(event: ExecuteOrderFilterEvent): boolean {
    if (event.order_type === UnitOrder.ATTACK_MOVE || event.order_type === UnitOrder.ATTACK_TARGET) {
      return false;
    }
    return true;
  }
}
