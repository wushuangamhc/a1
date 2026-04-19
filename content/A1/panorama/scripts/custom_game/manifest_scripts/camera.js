/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!*************************************************!*\
  !*** ./src/panorama/manifest_scripts/camera.ts ***!
  \*************************************************/

var _a, _b, _c;
class CPanoramaScript_Camera {
    constructor() {
        this.lockCamera = true;
        this.cameraDistance = 1150;
        this.started = false;
        this.updateSequence = 0;
        this.hasLoggedHero = false;
    }
    Start() {
        $.Msg("[A1 Camera] camera manifest started");
        if (this.started) {
            return;
        }
        this.started = true;
        this.updateSequence += 1;
        this.Update(this.updateSequence);
    }
    Stop() {
        this.started = false;
        this.updateSequence += 1;
    }
    Update(updateSequence) {
        $.Schedule(0, () => {
            if (!this.started || this.updateSequence !== updateSequence) {
                return;
            }
            this.ApplyCamera();
            this.Update(updateSequence);
        });
    }
    ApplyCamera() {
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
    ApplyTargetPosition(targetEntIndex, heightOffset) {
        const targetPosition = this.GetEntityTargetPosition(targetEntIndex, heightOffset);
        GameUI.SetCameraTargetPosition(targetPosition, -1);
    }
    GetEntityTargetPosition(targetEntIndex, heightOffset) {
        if (!Entities.IsValidEntity(targetEntIndex)) {
            return [0, 0, 0];
        }
        const origin = Entities.GetAbsOrigin(targetEntIndex);
        return [origin[0], origin[1], origin[2] + heightOffset];
    }
    SetCameraDistance(distance) {
        this.cameraDistance = distance;
    }
}
const customUIConfig = GameUI.CustomUIConfig();
const camera = customUIConfig.Camera;
if (camera !== undefined) {
    Object.setPrototypeOf(camera, CPanoramaScript_Camera.prototype);
    (_a = camera.lockCamera) !== null && _a !== void 0 ? _a : (camera.lockCamera = true);
    (_b = camera.cameraDistance) !== null && _b !== void 0 ? _b : (camera.cameraDistance = 1150);
    (_c = camera.updateSequence) !== null && _c !== void 0 ? _c : (camera.updateSequence = 0);
    camera.started = false;
    camera.Start();
}
else {
    customUIConfig.Camera = new CPanoramaScript_Camera();
    customUIConfig.Camera.Start();
}

/******/ })()
;