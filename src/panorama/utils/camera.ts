/**
 * Camera auto-follow system (ported from c1 project).
 * Uses GameUI.SetCameraTargetPosition with lerp=-1 for instant lock.
 * This is the Dota 2 custom game standard for hero camera follow.
 */

let started = false;
let updateSequence = 0;
let cameraDistance = 1150;

function getEntityTargetPosition(targetEntIndex: EntityIndex, heightOffset: number): [number, number, number] {
  if (!Entities.IsValidEntity(targetEntIndex)) {
    return [0, 0, 0];
  }

  const origin = Entities.GetAbsOrigin(targetEntIndex);
  return [origin[0], origin[1], origin[2] + heightOffset];
}

function applyCamera(): void {
  const hero = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
  if (hero === -1 || !Entities.IsValidEntity(hero)) {
    return;
  }

  const targetPosition = getEntityTargetPosition(hero, 0);
  GameUI.SetCameraTargetPosition(targetPosition, -1);
  GameUI.SetCameraDistance(cameraDistance);
}

function update(sequence: number): void {
  $.Schedule(0, () => {
    if (!started || updateSequence !== sequence) {
      return;
    }

    applyCamera();
    update(sequence);
  });
}

export function startCameraFollow(distance?: number): void {
  if (distance !== undefined) {
    cameraDistance = distance;
  }

  if (started) return;
  started = true;
  updateSequence += 1;
  update(updateSequence);
}

export function stopCameraFollow(): void {
  started = false;
  updateSequence += 1;
}

export function setCameraDistance(distance: number): void {
  cameraDistance = distance;
}
