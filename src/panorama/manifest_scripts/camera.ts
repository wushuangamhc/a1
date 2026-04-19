class CPanoramaScript_Camera {
  lockCamera = true;
  cameraDistance = 1150;
  started = false;
  updateSequence = 0;
  private hasLoggedHero = false;

  Start(): void {
    $.Msg("[A1 Camera] camera manifest started");
    if (this.started) {
      return;
    }

    this.started = true;
    this.updateSequence += 1;
    this.Update(this.updateSequence);
  }

  Stop(): void {
    this.started = false;
    this.updateSequence += 1;
  }

  Update(updateSequence: number): void {
    $.Schedule(0, () => {
      if (!this.started || this.updateSequence !== updateSequence) {
        return;
      }

      this.ApplyCamera();
      this.Update(updateSequence);
    });
  }

  ApplyCamera(): void {
    const hero = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
    if (hero === -1 || !Entities.IsValidEntity(hero)) {
      return;
    }

    if (!this.hasLoggedHero) {
      $.Msg("[A1 Camera] following hero entity", String(hero));
      this.hasLoggedHero = true;
    }

    if (this.lockCamera) {
      this.ApplyTargetPosition(hero, 0);
    }
    GameUI.SetCameraDistance(this.cameraDistance);
  }

  ApplyTargetPosition(targetEntIndex: EntityIndex, heightOffset: number): void {
    const targetPosition = this.GetEntityTargetPosition(targetEntIndex, heightOffset);
    GameUI.SetCameraTargetPosition(targetPosition, -1);
  }

  GetEntityTargetPosition(targetEntIndex: EntityIndex, heightOffset: number): [number, number, number] {
    if (!Entities.IsValidEntity(targetEntIndex)) {
      return [0, 0, 0];
    }

    const origin = Entities.GetAbsOrigin(targetEntIndex);
    return [origin[0], origin[1], origin[2] + heightOffset];
  }

  SetCameraDistance(distance: number): void {
    this.cameraDistance = distance;
  }
}

const customUIConfig = GameUI.CustomUIConfig() as CustomUIConfig;
const camera = customUIConfig.Camera as unknown as CPanoramaScript_Camera | undefined;

if (camera !== undefined) {
  Object.setPrototypeOf(camera, CPanoramaScript_Camera.prototype);
  camera.lockCamera ??= true;
  camera.cameraDistance ??= 1150;
  camera.updateSequence ??= 0;
  camera.started = false;
  camera.Start();
} else {
  customUIConfig.Camera = new CPanoramaScript_Camera();
  customUIConfig.Camera.Start();
}
