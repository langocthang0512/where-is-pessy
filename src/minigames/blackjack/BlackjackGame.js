import GameManager from "../../core/GameManager.js";
import SaveManager from "../../core/SaveManager.js";
import { MinigameBase } from "../MinigameBase.js";
import { MINIGAME_KEYS } from "../../utils/constants.js";
import { ScriptedDeckManager } from "./ScriptedDeckManager.js";

export class BlackjackGame extends MinigameBase {
  constructor(scene, flowId) {
    super(scene, MINIGAME_KEYS.BLACKJACK);
    this.flowId = flowId;
    this.deck = new ScriptedDeckManager(flowId);
    this.dealerCards = [];
    this.playerCards = [];
    this.isRoundComplete = false;
  }

  start() {
    super.start();
    const hands = this.deck.getStartingHands();
    this.dealerCards = hands.dealer;
    this.playerCards = hands.player;

    GameManager.update({
      currentMinigame: MINIGAME_KEYS.BLACKJACK,
      currentFlowId: this.flowId
    });
    SaveManager.save();

    if (this.getPlayerScore() === 21) {
      this.isRoundComplete = true;
    }

    return this.getSnapshot();
  }

  draw() {
    if (this.isRoundComplete) {
      return this.getSnapshot();
    }

    const card = this.deck.drawPlayerCard();

    if (card) {
      this.playerCards.push(card);
    }

    if (this.getPlayerScore() === 21) {
      this.isRoundComplete = true;
    }

    return this.getSnapshot();
  }

  getResult() {
    return {
      success: true
    };
  }

  getSnapshot() {
    return {
      dealerCards: [...this.dealerCards],
      dealerScore: this.getDealerScore(),
      playerCards: [...this.playerCards],
      playerScore: this.getPlayerScore(),
      isRoundComplete: this.isRoundComplete,
      canDraw: !this.isRoundComplete && this.deck.hasDrawCard()
    };
  }

  getDealerScore() {
    return Math.min(this.calculateScore(this.dealerCards), 15);
  }

  getPlayerScore() {
    return this.calculateScore(this.playerCards);
  }

  calculateScore(cards) {
    let total = 0;
    let aces = 0;

    cards.forEach((card) => {
      if (card.rank === "A") {
        aces += 1;
        total += 11;
        return;
      }

      if (["J", "Q", "K"].includes(card.rank)) {
        total += 10;
        return;
      }

      total += Number(card.rank);
    });

    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }

    return total;
  }
}
