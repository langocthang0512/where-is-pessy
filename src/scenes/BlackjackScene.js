import Phaser from "phaser";
import AssetManager from "../core/AssetManager.js";
import AudioManager from "../core/AudioManager.js";
import EventBus from "../core/EventBus.js";
import GameManager from "../core/GameManager.js";
import SaveManager from "../core/SaveManager.js";
import SceneManager from "../core/SceneManager.js";
import sceneFlow from "../data/sceneFlow.json";
import { FlowNodeDatabase } from "../data/SceneDatabase.js";
import { BlackjackGame } from "../minigames/blackjack/BlackjackGame.js";
import { BLACKJACK_FLOW_IDS } from "../minigames/blackjack/ScriptedDeckManager.js";
import { UIButton } from "../ui/UIButton.js";
import { COLORS, EVENTS, FONT_FAMILY, MINIGAME_KEYS, SCENE_KEYS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

export class BlackjackScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BLACKJACK);
    this.flowId = "BLACKJACK_ROUND_1";
    this.game = null;
    this.drawButton = null;
    this.continueButton = null;
    this.dealerCardViews = [];
    this.playerCardViews = [];
    this.dealerScoreText = null;
    this.playerScoreText = null;
    this.statusText = null;
  }

  preload() {
    this.load.audio("card_draw", new URL("../../assets/audio/sfx/card_draw.wav", import.meta.url).href);
    this.load.audio("card_flip", new URL("../../assets/audio/sfx/card_flip.wav", import.meta.url).href);
    this.load.audio("blackjack_victory", new URL("../../assets/audio/sfx/blackjack_victory.wav", import.meta.url).href);
  }

  init(data = {}) {
    const savedFlowId = GameManager.getState().currentFlowId;
    this.flowId = data.flowId || (BLACKJACK_FLOW_IDS.includes(savedFlowId) ? savedFlowId : "BLACKJACK_ROUND_1");
  }

  create() {
    try {
      this.dealerCardViews = [];
      this.playerCardViews = [];
      this.drawButton = null;
      this.continueButton = null;
      this.cameras.main.fadeIn(250, 23, 25, 35);
      this.cameras.main.setBackgroundColor(0x2a1710);
      AudioManager.setScene(this);
      AudioManager.playBgm("bgm_blackjack");
      this.game = new BlackjackGame(this, this.flowId);

      GameManager.update({
        currentScene: this.scene.key,
        currentFlowId: this.flowId,
        currentMinigame: MINIGAME_KEYS.BLACKJACK
      });
      SaveManager.save();

      this.drawTable();
      this.createStaticText();
      this.createControls();
      this.renderSnapshot(this.game.start(), true);
    } catch (error) {
      Logger.error("Blackjack scene failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }

  drawTable() {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, AssetManager.safeTexture(this, "background_blackjack_table"))
      .setDisplaySize(width, height)
      .setDepth(-100);
    this.add.rectangle(width / 2, height / 2, width, height, 0x171923, 0.16).setDepth(-90);
  }

  createStaticText() {
    const flowNode = FlowNodeDatabase[this.flowId];

    this.add.text(this.scale.width / 2, 64, flowNode?.title ?? "Blackjack", {
      fontFamily: FONT_FAMILY,
      fontSize: "58px",
      color: COLORS.text
    }).setOrigin(0.5);

    this.add.text(320, 170, "Dealer", {
      fontFamily: FONT_FAMILY,
      fontSize: "42px",
      color: COLORS.text
    });

    this.add.text(320, 720, "Cameldo", {
      fontFamily: FONT_FAMILY,
      fontSize: "42px",
      color: COLORS.text
    });

    this.dealerScoreText = this.add.text(320, 222, "Score: 0", {
      fontFamily: FONT_FAMILY,
      fontSize: "36px",
      color: "#f2c14e"
    });

    this.playerScoreText = this.add.text(320, 772, "Score: 0", {
      fontFamily: FONT_FAMILY,
      fontSize: "36px",
      color: "#f2c14e"
    });

    this.statusText = this.add.text(this.scale.width / 2, 540, "", {
      fontFamily: FONT_FAMILY,
      fontSize: "54px",
      color: COLORS.text,
      align: "center"
    }).setOrigin(0.5);
  }

  createControls() {
    this.drawButton = new UIButton(this, this.scale.width / 2, 950, 260, 76, "DRAW", () => {
      this.handleDraw();
    });

    this.continueButton = new UIButton(this, this.scale.width / 2, 950, 320, 76, "Continue", () => {
      this.finishRound();
    });
    this.continueButton.setVisible(false);
  }

  handleDraw() {
    const beforeCount = this.game.playerCards.length;
    const snapshot = this.game.draw();
    this.renderSnapshot(snapshot, false, this.game.playerCards.length > beforeCount);
  }

  renderSnapshot(snapshot, isInitialDeal = false, didDraw = false) {
    this.clearCards();
    this.dealerScoreText.setText(`Score: ${snapshot.dealerScore}`);
    this.playerScoreText.setText(`Score: ${snapshot.playerScore}`);

    this.dealerCardViews = this.renderCards(snapshot.dealerCards, 720, 230);
    this.playerCardViews = this.renderCards(snapshot.playerCards, 720, 708);

    if (isInitialDeal) {
      this.playDealAnimation([...this.dealerCardViews, ...this.playerCardViews]);
    }

    if (didDraw) {
      this.playFlipAnimation(this.playerCardViews[this.playerCardViews.length - 1]);
    }

    if (snapshot.isRoundComplete) {
      this.showVictory();
      return;
    }

    this.statusText.setText("Draw to reach 21.");
    this.drawButton.setVisible(snapshot.canDraw);
    this.continueButton.setVisible(false);
  }

  renderCards(cards, startX, y) {
    return cards.map((card, index) => this.createCardView(card, startX + index * 138, y));
  }

  createCardView(card, x, y) {
    const container = this.add.container(x, y);
    const shadow = this.add.rectangle(6, 8, 118, 164, 0x171923, 0.35);
    const cardImage = this.add.image(0, 0, AssetManager.safeTexture(this, AssetManager.cardTextureKey(card.fileName)));
    cardImage.setDisplaySize(112, 158);
    container.add([shadow, cardImage]);
    container.setData("fileName", card.fileName);
    return container;
  }

  playDealAnimation(cardViews) {
    AudioManager.playSfx("card_draw");

    cardViews.forEach((cardView, index) => {
      cardView.setAlpha(0);
      cardView.y -= 24;
      this.tweens.add({
        targets: cardView,
        alpha: 1,
        y: cardView.y + 24,
        delay: index * 40,
        duration: 180,
        ease: "Sine.easeOut"
      });
    });
  }

  playFlipAnimation(cardView) {
    if (!cardView) {
      return;
    }

    AudioManager.playSfx("card_flip");

    this.tweens.add({
      targets: cardView,
      scaleX: 0.08,
      duration: 110,
      yoyo: true,
      ease: "Sine.easeInOut"
    });
  }

  showVictory() {
    this.drawButton.setVisible(false);
    this.continueButton.setVisible(false);
    this.statusText.setText("21! Victory!");

    EventBus.emitEvent(EVENTS.MINIGAME_COMPLETED, this.game.getResult());
    GameManager.update({
      blackjackWins: GameManager.getState().blackjackWins + 1,
      currentMinigameResult: this.game.getResult()
    });
    SaveManager.save();

    AudioManager.playSfx("blackjack_victory");
    this.cameras.main.flash(220, 242, 193, 78);
    this.time.delayedCall(420, () => {
      this.continueButton.setVisible(true);
    });
  }

  finishRound() {
    this.game.cleanup();
    SceneManager.changeToNextFromFlow(this, sceneFlow, this.flowId, { autoSave: true });
  }

  clearCards() {
    this.dealerCardViews.forEach((cardView) => cardView.destroy());
    this.playerCardViews.forEach((cardView) => cardView.destroy());
    this.dealerCardViews = [];
    this.playerCardViews = [];
  }

}
