const SUITS = ["Hearts", "Diamonds", "Clubs", "Spades"];
const TEN_VALUE_RANKS = ["10", "J", "Q", "K"];

const ROUND_SCRIPTS = {
  BLACKJACK_ROUND_1: {
    dealer: ["8", "7"],
    player: ["6", "7"],
    draws: ["8"]
  },
  BLACKJACK_ROUND_2: {
    dealer: ["9", "6"],
    player: ["3", "7"],
    draws: ["A", "A", "A", "A"]
  },
  BLACKJACK_ROUND_3: {
    dealer: ["10", "5"],
    player: ["10", "7"],
    draws: ["4"]
  },
  BJ_04: {
    dealer: ["8", "7"],
    player: ["A", "10"],
    draws: []
  },
  BJ_05: {
    dealer: ["9", "6"],
    player: ["A", "J"],
    draws: []
  },
  BJ_06: {
    dealer: ["10", "5"],
    player: ["A", "Q"],
    draws: []
  },
  BJ_07: {
    dealer: ["8", "6"],
    player: ["A", "K"],
    draws: []
  },
  BJ_08: {
    dealer: ["7", "7"],
    player: ["A", "10"],
    draws: []
  },
  BJ_09: {
    dealer: ["9", "5"],
    player: ["A", "J"],
    draws: []
  },
  BJ_10: {
    dealer: ["10", "4"],
    player: ["A", "K"],
    draws: []
  }
};

const DRAGON_NAMES = {
  A: "Fire",
  2: "Plant",
  3: "Earth",
  4: "Water",
  5: "Energy",
  6: "Metal",
  7: "Void",
  8: "Light",
  9: "Shadow",
  10: "Wind",
  J: "Legend",
  Q: "Crystal",
  K: "Apocalypse"
};

export class ScriptedDeckManager {
  constructor(flowId) {
    this.flowId = flowId;
    this.script = ROUND_SCRIPTS[flowId] ?? ROUND_SCRIPTS.BLACKJACK_ROUND_1;
    this.suitIndex = this.getScriptIndex(flowId);
    this.drawIndex = 0;
  }

  getStartingHands() {
    return {
      dealer: this.script.dealer.map((rank) => this.createCard(rank)),
      player: this.script.player.map((rank) => this.createCard(rank))
    };
  }

  drawPlayerCard() {
    const rank = this.script.draws[this.drawIndex];

    if (!rank) {
      return null;
    }

    this.drawIndex += 1;
    return this.createCard(rank);
  }

  hasDrawCard() {
    return this.drawIndex < this.script.draws.length;
  }

  createCard(rank) {
    const suit = SUITS[this.suitIndex % SUITS.length];
    this.suitIndex += 1;

    return {
      rank,
      suit,
      dragonName: DRAGON_NAMES[rank],
      fileName: `${rank}_${suit}_${DRAGON_NAMES[rank]}.png`
    };
  }

  createFullDeckManifest() {
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", ...TEN_VALUE_RANKS.slice(1)];

    return ranks.flatMap((rank) => SUITS.map((suit) => ({
      rank,
      suit,
      dragonName: DRAGON_NAMES[rank],
      fileName: `${rank}_${suit}_${DRAGON_NAMES[rank]}.png`
    })));
  }

  getScriptIndex(flowId) {
    const keys = Object.keys(ROUND_SCRIPTS);
    return Math.max(keys.indexOf(flowId), 0);
  }
}

export const BLACKJACK_FLOW_IDS = Object.keys(ROUND_SCRIPTS);
