import Phaser from "phaser";
import AudioManager from "../core/AudioManager.js";
import SceneManager from "../core/SceneManager.js";
import { UIButton } from "../ui/UIButton.js";
import { FONT_FAMILY, SCENE_KEYS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

const CREDITS_SECTIONS = [
  { text: "THE END", size: 112, color: "#f8d568", gap: 100 },
  { text: "TEAM IV", size: 74, color: "#ffffff", gap: 86 },
  { text: "Publisher", size: 38, color: "#f8d568", gap: 18 },
  { text: "AIGenerator", size: 54, color: "#ffffff", gap: 64 },
  { text: "Production", size: 38, color: "#f8d568", gap: 18 },
  { text: "Team IV Production", size: 54, color: "#ffffff", gap: 64 },
  { text: "Game Title", size: 38, color: "#f8d568", gap: 18 },
  { text: "Where is Pessy", size: 58, color: "#ffffff", gap: 88 },
  { text: "MAIN CAST", size: 56, color: "#f8d568", gap: 36 },
  { text: "Cameldo - Penaldo\nPessy - Missy\nThe Dealer - The Orange Man\nDragon King - Star Stripe Dragon\nRoronoa Zoro - Roronoa Zoro", size: 46, color: "#ffffff", gap: 92 },
  { text: "Screenwriter", size: 38, color: "#f8d568", gap: 16 },
  { text: "Dragon King", size: 50, color: "#ffffff", gap: 52 },
  { text: "Director / Producer", size: 38, color: "#f8d568", gap: 16 },
  { text: "Dragon King", size: 50, color: "#ffffff", gap: 52 },
  { text: "Game Designer", size: 38, color: "#f8d568", gap: 16 },
  { text: "Penaldo", size: 50, color: "#ffffff", gap: 82 },
  { text: "DEVELOPERS", size: 56, color: "#f8d568", gap: 30 },
  { text: "Codex\nAntigravity\nGitHub\nVibeCode Master", size: 46, color: "#ffffff", gap: 84 },
  { text: "AUDIO", size: 56, color: "#f8d568", gap: 30 },
  { text: "I don't want to be here in the credits", size: 46, color: "#ffffff", gap: 84 },
  { text: "QA", size: 56, color: "#f8d568", gap: 30 },
  { text: "Ngoc Thang\nPhu Hoang\nThanh Thuy\nLong So\nDuy Linh\nHoang 9", size: 46, color: "#ffffff", gap: 84 },
  { text: "SPECIAL THANKS", size: 56, color: "#f8d568", gap: 34 },
  { text: "QA Challenge 2026\n\nQA Leads Team", size: 50, color: "#ffffff", gap: 120 }
];

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
      const startY = height * 0.22;
      this.creditsText = this.createCreditsRoll(width / 2, startY);
      const contentHeight = this.creditsText.getBounds().height;
      const travelDistance = startY + contentHeight + 120;

      this.tweens.add({
        targets: this.creditsText,
        y: -contentHeight - 120,
        duration: travelDistance * 14,
        ease: "Linear",
        onComplete: () => this.showReturnButton()
      });

      this.input.keyboard.on("keydown-SPACE", () => this.skipCredits());
      this.input.keyboard.on("keydown-ESC", () => this.skipCredits());
    } catch (error) {
      Logger.error("Credits scene failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }

  createCreditsRoll(x, y) {
    const container = this.add.container(x, y);
    let cursorY = 0;

    CREDITS_SECTIONS.forEach((section) => {
      const text = this.add.text(0, cursorY, section.text, {
        fontFamily: FONT_FAMILY,
        fontSize: `${section.size}px`,
        color: section.color,
        align: "center",
        lineSpacing: 15,
        wordWrap: { width: 1180 }
      }).setOrigin(0.5, 0);
      container.add(text);
      cursorY += text.height + section.gap;
    });

    this.add.rectangle(this.scale.width / 2, 55, this.scale.width, 110, 0x000000, 0.88).setDepth(20);
    this.add.rectangle(this.scale.width / 2, this.scale.height - 55, this.scale.width, 110, 0x000000, 0.88).setDepth(20);
    return container;
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
