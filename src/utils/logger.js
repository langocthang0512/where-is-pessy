import { DEBUG_MODE } from "./constants.js";

export class Logger {
  static info(message, details = undefined) {
    if (DEBUG_MODE) {
      console.info(`[Where Is Pessy] ${message}`, details ?? "");
    }
  }

  static warn(message, details = undefined) {
    console.warn(`[Where Is Pessy] ${message}`, details ?? "");
  }

  static error(message, details = undefined) {
    console.error(`[Where Is Pessy] ${message}`, details ?? "");
  }
}
