import { SCENE_KEYS } from "../utils/constants.js";

export const BACKGROUNDS = {
  FOOTBALL_FIELD: "footballField",
  OPEN_SKY: "openSky",
  HARBOR: "harbor",
  CASINO: "casino",
  BLACKJACK_TABLE: "blackjackTable",
  FREEDUMB_LAND: "freedumbLand",
  FIRST_FIGHT: "firstFight",
  DICE: "dice",
  LAST_FIGHT: "lastFight"
};

export const CHARACTER_TEXTURES = {
  CAMELDO: "character_cameldo",
  PESSY: "character_pessy",
  DEALER: "character_dealer",
  DRAGON_KING: "dragon_king"
};

export const SceneDatabase = {
  VN_01: {
    id: "VN_01",
    background: BACKGROUNDS.FOOTBALL_FIELD,
    characters: [
      { id: "Cameldo", texture: CHARACTER_TEXTURES.CAMELDO, x: 650, y: 565, scale: 1.15 },
      { id: "Pessy", texture: CHARACTER_TEXTURES.PESSY, x: 1260, y: 590, scale: 0.96 }
    ]
  },
  VN_02: {
    id: "VN_02",
    background: BACKGROUNDS.OPEN_SKY,
    characters: [
      { id: "Dragon King", texture: CHARACTER_TEXTURES.DRAGON_KING, x: 1040, y: 300, scale: 1.12 },
      { id: "Pessy", texture: CHARACTER_TEXTURES.PESSY, x: 1145, y: 415, scale: 0.62 },
      { id: "Cameldo", texture: CHARACTER_TEXTURES.CAMELDO, x: 680, y: 680, scale: 1.05 }
    ]
  },
  VN_03: {
    id: "VN_03",
    background: BACKGROUNDS.HARBOR,
    characters: [
      { id: "Cameldo", texture: CHARACTER_TEXTURES.CAMELDO, x: 680, y: 590, scale: 1.08 },
      { id: "Dealer", texture: CHARACTER_TEXTURES.DEALER, x: 1240, y: 590, scale: 1.08 }
    ]
  },
  VN_04: {
    id: "VN_04",
    background: BACKGROUNDS.CASINO,
    characters: [
      { id: "Cameldo", texture: CHARACTER_TEXTURES.CAMELDO, x: 700, y: 595, scale: 1.05 },
      { id: "Dealer", texture: CHARACTER_TEXTURES.DEALER, x: 1220, y: 595, scale: 1.05 }
    ]
  },
  VN_05: {
    id: "VN_05",
    background: BACKGROUNDS.BLACKJACK_TABLE,
    characters: [
      { id: "Cameldo", texture: CHARACTER_TEXTURES.CAMELDO, x: 700, y: 590, scale: 1.05 },
      { id: "Dealer", texture: CHARACTER_TEXTURES.DEALER, x: 1220, y: 590, scale: 1.05 }
    ]
  },
  VN_06: {
    id: "VN_06",
    background: BACKGROUNDS.BLACKJACK_TABLE,
    characters: [
      { id: "Cameldo", texture: CHARACTER_TEXTURES.CAMELDO, x: 700, y: 590, scale: 1.05 },
      { id: "Dealer", texture: CHARACTER_TEXTURES.DEALER, x: 1220, y: 590, scale: 1.05 }
    ],
    choice: {
      choices: [
        { label: "CONTINUE", flowKey: "CHOICE_CONTINUE" },
        { label: "KEEP PLAYING", flowKey: "CHOICE_KEEP_PLAYING" }
      ]
    }
  },
  VN_07A: {
    id: "VN_07A",
    background: BACKGROUNDS.BLACKJACK_TABLE,
    characters: [
      { id: "Cameldo", texture: CHARACTER_TEXTURES.CAMELDO, x: 700, y: 590, scale: 1.05 },
      { id: "Dealer", texture: CHARACTER_TEXTURES.DEALER, x: 1220, y: 590, scale: 1.05 }
    ]
  },
  VN_07: {
    id: "VN_07",
    background: BACKGROUNDS.FREEDUMB_LAND,
    characters: [
      { id: "Cameldo", texture: CHARACTER_TEXTURES.CAMELDO, x: 650, y: 610, scale: 1.05 },
      { id: "Dragon King", texture: CHARACTER_TEXTURES.DRAGON_KING, x: 1240, y: 520, scale: 1.16 }
    ]
  },
  VN_08: {
    id: "VN_08",
    background: BACKGROUNDS.FIRST_FIGHT,
    characters: [
      { id: "Cameldo", texture: CHARACTER_TEXTURES.CAMELDO, x: 650, y: 610, scale: 1.05 },
      { id: "Dragon King", texture: CHARACTER_TEXTURES.DRAGON_KING, x: 1240, y: 520, scale: 1.16 }
    ]
  },
  VN_09: {
    id: "VN_09",
    background: BACKGROUNDS.FIRST_FIGHT,
    characters: [
      { id: "Cameldo", texture: CHARACTER_TEXTURES.CAMELDO, x: 650, y: 610, scale: 1.05 },
      { id: "Dragon King", texture: CHARACTER_TEXTURES.DRAGON_KING, x: 1240, y: 520, scale: 1.16 }
    ]
  },
  VN_10: {
    id: "VN_10",
    background: BACKGROUNDS.DICE,
    characters: [
      { id: "Cameldo", texture: CHARACTER_TEXTURES.CAMELDO, x: 720, y: 610, scale: 1.05 }
    ]
  },
  VN_11: {
    id: "VN_11",
    background: BACKGROUNDS.DICE,
    characters: [
      { id: "Cameldo", texture: CHARACTER_TEXTURES.CAMELDO, x: 650, y: 610, scale: 1.05 },
      { id: "Dragon King", texture: CHARACTER_TEXTURES.DRAGON_KING, x: 1240, y: 520, scale: 1.16 }
    ]
  },
  VN_12: {
    id: "VN_12",
    background: BACKGROUNDS.LAST_FIGHT,
    characters: [
      { id: "Dragon King", texture: CHARACTER_TEXTURES.DRAGON_KING, x: 1040, y: 520, scale: 1.2 }
    ]
  },
  VN_13: {
    id: "VN_13",
    background: BACKGROUNDS.LAST_FIGHT,
    characters: [
      { id: "Dragon King", texture: CHARACTER_TEXTURES.DRAGON_KING, x: 1040, y: 520, scale: 1.2 }
    ]
  },
  VN_14: {
    id: "VN_14",
    background: BACKGROUNDS.LAST_FIGHT,
    characters: [
      { id: "Cameldo", texture: CHARACTER_TEXTURES.CAMELDO, x: 650, y: 610, scale: 1.05 },
      { id: "Dragon King", texture: CHARACTER_TEXTURES.DRAGON_KING, x: 1240, y: 520, scale: 1.16 }
    ]
  }
};

export const FlowNodeDatabase = {
  BLACKJACK_ROUND_1: { id: "BLACKJACK_ROUND_1", scene: SCENE_KEYS.BLACKJACK, title: "Blackjack Round 1" },
  BLACKJACK_ROUND_2: { id: "BLACKJACK_ROUND_2", scene: SCENE_KEYS.BLACKJACK, title: "Blackjack Round 2" },
  BLACKJACK_ROUND_3: { id: "BLACKJACK_ROUND_3", scene: SCENE_KEYS.BLACKJACK, title: "Blackjack Round 3" },
  BJ_04: { id: "BJ_04", scene: SCENE_KEYS.BLACKJACK, title: "Keep Playing Round 4" },
  BJ_05: { id: "BJ_05", scene: SCENE_KEYS.BLACKJACK, title: "Keep Playing Round 5" },
  BJ_06: { id: "BJ_06", scene: SCENE_KEYS.BLACKJACK, title: "Keep Playing Round 6" },
  BJ_07: { id: "BJ_07", scene: SCENE_KEYS.BLACKJACK, title: "Keep Playing Round 7" },
  BJ_08: { id: "BJ_08", scene: SCENE_KEYS.BLACKJACK, title: "Keep Playing Round 8" },
  BJ_09: { id: "BJ_09", scene: SCENE_KEYS.BLACKJACK, title: "Keep Playing Round 9" },
  BJ_10: { id: "BJ_10", scene: SCENE_KEYS.BLACKJACK, title: "Keep Playing Round 10" },
  FIRST_FIGHT_TURN_1: { id: "FIRST_FIGHT_TURN_1", scene: SCENE_KEYS.FIRST_FIGHT, title: "First Fight Turn 1" },
  FIRST_FIGHT_TURN_2: { id: "FIRST_FIGHT_TURN_2", scene: SCENE_KEYS.FIRST_FIGHT, title: "First Fight Turn 2" },
  ROLL_DICE_1: { id: "ROLL_DICE_1", scene: SCENE_KEYS.ROLL_DICE, title: "Roll Dice 1" },
  ROLL_DICE_2: { id: "ROLL_DICE_2", scene: SCENE_KEYS.ROLL_DICE, title: "Roll Dice 2" },
  LAST_FIGHT_ROUND_1: { id: "LAST_FIGHT_ROUND_1", scene: SCENE_KEYS.LAST_FIGHT, title: "Last Fight Round 1" },
  LAST_FIGHT_ROUND_2: { id: "LAST_FIGHT_ROUND_2", scene: SCENE_KEYS.LAST_FIGHT, title: "Last Fight Round 2" },
  LAST_FIGHT_ROUND_3: { id: "LAST_FIGHT_ROUND_3", scene: SCENE_KEYS.LAST_FIGHT, title: "Last Fight Round 3" }
};
