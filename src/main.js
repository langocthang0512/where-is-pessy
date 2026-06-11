import Phaser from "phaser";
import DebugManager from "./core/DebugManager.js";
import { GAME_HEIGHT, GAME_WIDTH } from "./utils/constants.js";
import { BootScene } from "./scenes/BootScene.js";
import { PreloadScene } from "./scenes/PreloadScene.js";
import { MainMenuScene } from "./scenes/MainMenuScene.js";
import { CreditsScene } from "./scenes/CreditsScene.js";
import { VNScene } from "./scenes/VNScene.js";
import { BlackjackScene } from "./scenes/BlackjackScene.js";
import { FirstFightScene } from "./scenes/FirstFightScene.js";
import { RollDiceScene } from "./scenes/RollDiceScene.js";
import { LastFightScene } from "./scenes/LastFightScene.js";
import { TrueEndingScene } from "./scenes/TrueEndingScene.js";
import { HiddenEndingScene } from "./scenes/HiddenEndingScene.js";

const config = {
  type: Phaser.AUTO,
  parent: "game-root",
  backgroundColor: "#171923",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    min: {
      width: 1280,
      height: 720
    }
  },
  render: {
    pixelArt: false,
    antialias: true
  },
  audio: {
    disableWebAudio: false
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    CreditsScene,
    VNScene,
    BlackjackScene,
    FirstFightScene,
    RollDiceScene,
    LastFightScene,
    TrueEndingScene,
    HiddenEndingScene
  ]
};

const game = new Phaser.Game(config);
DebugManager.install(game);
