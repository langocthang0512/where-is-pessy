import { COLORS, FONT_FAMILY } from "../utils/constants.js";

export class DialogueBox {
  constructor(scene, onAdvance = null) {
    this.scene = scene;
    this.onAdvance = onAdvance;
    this.typewriterEvent = null;
    this.fullText = "";
    this.visibleCharacterCount = 0;
    const { width, height } = scene.scale;

    this.container = scene.add.container(width / 2, height - 165);
    this.container.setDepth(90);
    this.shadow = scene.add.rectangle(10, 12, width - 180, 270, 0x000000, 0.38);
    this.background = scene.add.rectangle(0, 0, width - 180, 270, COLORS.panel, 0.96);
    this.background.setStrokeStyle(4, 0xf6d77a, 1);
    this.background.setInteractive({ useHandCursor: true });
    this.background.on("pointerdown", () => this.onAdvance?.());

    this.nameplateShadow = scene.add.rectangle(-610, -163, 350, 78, 0x000000, 0.4);
    this.nameplate = scene.add.rectangle(-620, -171, 350, 78, COLORS.panelDark, 1);
    this.nameplate.setStrokeStyle(4, COLORS.accent, 1);
    this.speakerText = scene.add.text(-620, -171, "", {
      fontFamily: FONT_FAMILY,
      fontSize: "46px",
      color: "#f8d568"
    }).setOrigin(0.5);

    this.dialogueText = scene.add.text(-((width - 180) / 2) + 54, -82, "", {
      fontFamily: FONT_FAMILY,
      fontSize: "50px",
      color: COLORS.text,
      lineSpacing: 10,
      wordWrap: { width: width - 310 }
    });

    this.container.add([
      this.shadow,
      this.background,
      this.nameplateShadow,
      this.nameplate,
      this.speakerText,
      this.dialogueText
    ]);
  }

  setLine(line = {}) {
    const speaker = line.speaker === "Dealer" ? "The Dealer" : (line.speaker ?? "");
    const isCameldo = line.speaker === "Cameldo";
    const plateX = isCameldo ? -620 : 620;

    this.nameplate.setX(plateX);
    this.nameplateShadow.setX(plateX + (isCameldo ? 10 : -10));
    this.speakerText.setX(plateX);
    this.speakerText.setText(speaker);
    this.startTypewriter(line.text ?? "");
  }

  startTypewriter(text) {
    this.typewriterEvent?.remove(false);
    this.fullText = text;
    this.visibleCharacterCount = 0;
    this.dialogueText.setText("");

    if (!text) {
      this.typewriterEvent = null;
      return;
    }

    this.typewriterEvent = this.scene.time.addEvent({
      delay: 18,
      repeat: text.length - 1,
      callback: () => {
        this.visibleCharacterCount += 1;
        this.dialogueText.setText(this.fullText.slice(0, this.visibleCharacterCount));

        if (this.visibleCharacterCount >= this.fullText.length) {
          this.typewriterEvent = null;
        }
      }
    });
  }

  isTyping() {
    return this.visibleCharacterCount < this.fullText.length;
  }

  revealAll() {
    if (!this.isTyping()) {
      return false;
    }

    this.typewriterEvent?.remove(false);
    this.typewriterEvent = null;
    this.visibleCharacterCount = this.fullText.length;
    this.dialogueText.setText(this.fullText);
    return true;
  }

  setVisible(isVisible) {
    this.container.setVisible(isVisible);
  }

  destroy() {
    this.typewriterEvent?.remove(false);
    this.container.destroy();
  }
}
