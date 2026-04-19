class PanoramaCameraControllerImpl implements PanoramaCameraController {
  started = false;
  cameraDistance = 1150;
  private updateSequence = 0;
  private hasLoggedHero = false;
  private hasLoggedLocalPlayer = false;
  private hasLoggedMissingPlayer = false;
  private hasLoggedMissingHero = false;

  Start(): void {
    if (this.started) {
      $.Msg("[A1 Camera] Start ignored because controller is already running");
      return;
    }

    $.Msg("[A1 Camera] startCameraFollow");
    this.started = true;
    this.updateSequence += 1;
    this.update(this.updateSequence);
  }

  Stop(): void {
    this.started = false;
    this.updateSequence += 1;
  }

  SetCameraDistance(distance: number): void {
    this.cameraDistance = distance;
  }

  private update(sequence: number): void {
    $.Schedule(0, () => {
      if (!this.started || this.updateSequence !== sequence) {
        return;
      }

      this.applyCamera();
      this.update(sequence);
    });
  }

  private applyCamera(): void {
    const playerId = Players.GetLocalPlayer();
    if (playerId === -1) {
      if (!this.hasLoggedMissingPlayer) {
        $.Msg("[A1 Camera] local player is not ready yet");
        this.hasLoggedMissingPlayer = true;
      }
      return;
    }

    if (!this.hasLoggedLocalPlayer) {
      $.Msg("[A1 Camera] local player id", String(playerId));
      this.hasLoggedLocalPlayer = true;
    }

    const hero = Players.GetPlayerHeroEntityIndex(playerId);
    if (hero === -1 || !Entities.IsValidEntity(hero)) {
      if (!this.hasLoggedMissingHero) {
        $.Msg("[A1 Camera] hero entity is not ready yet for player", String(playerId), "hero=", String(hero));
        this.hasLoggedMissingHero = true;
      }
      return;
    }

    if (!this.hasLoggedHero) {
      $.Msg("[A1 Camera] following hero entity", String(hero));
      this.hasLoggedHero = true;
      this.hasLoggedMissingHero = false;
    }

    const origin = Entities.GetAbsOrigin(hero);
    GameUI.SetCameraTargetPosition([origin[0], origin[1], origin[2]], -1);
    GameUI.SetCameraDistance(this.cameraDistance);
  }
}

function getCameraController(): PanoramaCameraController {
  const config = GameUI.CustomUIConfig() as CustomUIConfig;
  if (!config.Camera) {
    $.Msg("[A1 Camera] creating camera controller");
    config.Camera = new PanoramaCameraControllerImpl();
  }

  return config.Camera;
}

export function startCameraFollow(distance?: number): void {
  const camera = getCameraController();
  if (distance !== undefined) {
    camera.SetCameraDistance(distance);
  }
  camera.Start();
}

export function stopCameraFollow(): void {
  getCameraController().Stop();
}

export function setCameraDistance(distance: number): void {
  getCameraController().SetCameraDistance(distance);
}
