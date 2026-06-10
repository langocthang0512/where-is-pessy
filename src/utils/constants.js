export const DEBUG_MODE = import.meta.env.DEV;

export const SAVE_KEY = "where_is_pessy_save";

export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;

export const FONT_FAMILY = "\"Patrick Hand\", \"Comic Sans MS\", cursive";

export const COLORS = {
  background: 0x171923,
  panel: 0x283044,
  panelDark: 0x1f2535,
  text: "#fff7df",
  textDark: "#171923",
  accent: 0xf2c14e,
  accentDark: 0xb98616,
  danger: 0xe45a4f,
  success: 0x5fbf77
};

export const SCENE_KEYS = {
  BOOT: "BootScene",
  PRELOAD: "PreloadScene",
  MAIN_MENU: "MainMenuScene",
  CREDITS: "CreditsScene",
  VN: "VNScene",
  BLACKJACK: "BlackjackScene",
  FIRST_FIGHT: "FirstFightScene",
  ROLL_DICE: "RollDiceScene",
  LAST_FIGHT: "LastFightScene",
  TRUE_ENDING: "TrueEndingScene",
  HIDDEN_ENDING: "HiddenEndingScene"
};

export const GAME_STATES = {
  MAIN_MENU: "MAIN_MENU",
  VN: "VN",
  BLACKJACK: "BLACKJACK",
  FIRST_FIGHT: "FIRST_FIGHT",
  ROLL_DICE: "ROLL_DICE",
  LAST_FIGHT: "LAST_FIGHT",
  ENDING: "ENDING",
  CREDITS: "CREDITS"
};

export const EVENTS = {
  SCENE_CHANGED: "EVENT_SCENE_CHANGED",
  SAVE_WRITTEN: "EVENT_SAVE_WRITTEN",
  SAVE_LOADED: "EVENT_SAVE_LOADED",
  LANGUAGE_CHANGED: "EVENT_LANGUAGE_CHANGED",
  AUTO_MODE_CHANGED: "EVENT_AUTO_MODE_CHANGED",
  DIALOGUE_FINISHED: "EVENT_DIALOGUE_FINISHED",
  MINIGAME_STARTED: "EVENT_MINIGAME_STARTED",
  MINIGAME_COMPLETED: "EVENT_MINIGAME_COMPLETED",
  MINIGAME_FAILED: "EVENT_MINIGAME_FAILED",
  BLACKJACK_WON: "EVENT_BLACKJACK_WON",
  DICE_FINISHED: "EVENT_DICE_FINISHED",
  ENDING_UNLOCKED: "EVENT_ENDING_UNLOCKED",
  ERROR_RECOVERED: "EVENT_ERROR_RECOVERED"
};

export const MINIGAME_KEYS = {
  BLACKJACK: "blackjack",
  FIRST_FIGHT: "firstFight",
  ROLL_DICE: "rollDice",
  LAST_FIGHT: "lastFight"
};

export const TRANSITIONS = {
  FADE: "fade",
  SLIDE_UP: "slideUp",
  NONE: "none"
};
