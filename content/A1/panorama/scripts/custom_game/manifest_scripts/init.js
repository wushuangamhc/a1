/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!***********************************************!*\
  !*** ./src/panorama/manifest_scripts/init.ts ***!
  \***********************************************/

// Match c1's manifest bootstrap enough to prevent default pregame/hero-selection UI
// from fighting our custom camera script during strategy and pregame.
GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_HERO_SELECTION_TEAMS, false);
GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_HERO_SELECTION_GAME_NAME, false);
GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_HERO_SELECTION_CLOCK, false);
GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_HERO_SELECTION_HEADER, false);
GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_PREGAME_STRATEGYUI, false);
$.Msg("[A1 Camera] init manifest loaded");

/******/ })()
;