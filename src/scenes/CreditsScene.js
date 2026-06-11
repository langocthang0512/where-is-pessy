import Phaser from "phaser";
import AudioManager from "../core/AudioManager.js";
import SceneManager from "../core/SceneManager.js";
import { UIButton } from "../ui/UIButton.js";
import { FONT_FAMILY, SCENE_KEYS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

const CREDITS_TEXT = `THE END

TEAM IV

Publisher: AIGenerator

Production: Team IV Production

Game Title: Where is Pessy

Main Cast:

Cameldo – Penaldo

Pessy – Missy

The Dealer – The Orange Man

Dragon King – Star Stripe Dragon

Roronoa Zoro – Roronoa Zoro

Screenwriter: Dragon King

Director / Producer: Dragon King

Game Designer: Penaldo

Developers:
Codex
Antigravity
GitHub
VibeCode Master

Audio:
I don’t want to be here in the credits

QA:
Ngoc Thang
Phu Hoang
Thanh Thuy
Long So
Duy Linh
Hoang 9

Special Thanks:

QA Challenge 2026

QA Leads Team`;

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.CREDITS);
    this.creditsText = null;
  }

  create() {
    try {
      this.cameras.main.fadeIn(350, 23, 25, 35);
      this.cameras.main.setBackgroundColor(0x000000);
      AudioManager.setScene(this);
      AudioManager.playBgm("bgm_ending");

      const { width, height } = this.scale;
      this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 1);

      this.creditsText = this.add.text(width / 2, height + 80, CREDITS_TEXT, {
        fontFamily: FONT_FAMILY,
        fontSize: "44px",
        color: "#ffffff",
        align: "center",
        lineSpacing: 12,
        wordWrap: { width: 980 }
      }).setOrigin(0.5, 0);

      const travelDistance = height + this.creditsText.height + 180;
      this.tweens.add({
        targets: this.creditsText,
        y: -this.creditsText.height - 100,
        duration: travelDistance * 42,
        ease: "Linear",
        onComplete: () => {
          this.showReturnButton();
        }
      });

      this.input.keyboard.on("keydown-SPACE", () => this.skipCredits());
      this.input.keyboard.on("keydown-ESC", () => this.skipCredits());
    } catch (error) {
      Logger.error("Credits scene failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }

  skipCredits() {
    SceneManager.changeScene(this, SCENE_KEYS.MAIN_MENU);
  }

  showReturnButton() {
    new UIButton(this, this.scale.width / 2, this.scale.height - 120, 420, 74, "RETURN TO TITLE", () => {
      SceneManager.changeScene(this, SCENE_KEYS.MAIN_MENU);
    });
  }
}
