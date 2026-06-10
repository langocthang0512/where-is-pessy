import dialogues from "./dialogues.json";

export class DialogueDatabase {
  static getDialogue(sceneId) {
    return Array.isArray(dialogues[sceneId]) ? dialogues[sceneId] : [];
  }

  static hasDialogue(sceneId) {
    return Array.isArray(dialogues[sceneId]);
  }
}
