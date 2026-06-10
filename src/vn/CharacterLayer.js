import AssetManager from "../core/AssetManager.js";

export class CharacterLayer {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.characters = new Map();
  }

  showCharacter(characterId, textureKey, options = {}) {
    const existing = this.characters.get(characterId);
    const safeTexture = AssetManager.safeTexture(this.scene, textureKey);
    const x = options.x ?? this.scene.scale.width / 2;
    const y = options.y ?? this.scene.scale.height * 0.58;

    if (existing) {
      existing.setTexture(safeTexture);
      existing.setPosition(x, y);
      existing.setVisible(true);
      return existing;
    }

    const sprite = this.scene.add.image(x, y, safeTexture);
    sprite.setScale(options.scale ?? 1);
    sprite.setAlpha(options.alpha ?? 1);
    sprite.setDepth(options.depth ?? 10);
    this.container.add(sprite);
    this.characters.set(characterId, sprite);

    return sprite;
  }

  hideCharacter(characterId) {
    this.characters.get(characterId)?.setVisible(false);
  }

  moveCharacter(characterId, x, y, duration = 350) {
    const character = this.characters.get(characterId);

    if (!character) {
      return;
    }

    this.scene.tweens.add({
      targets: character,
      x,
      y,
      duration,
      ease: "Sine.easeInOut"
    });
  }

  changeExpression(characterId, textureKey) {
    const character = this.characters.get(characterId);

    if (!character) {
      return;
    }

    character.setTexture(AssetManager.safeTexture(this.scene, textureKey));
  }

  applyLineDirectives(line = {}) {
    if (line.background) {
      this.scene.setBackground(line.background);
    }

    if (line.showCharacter) {
      const character = line.showCharacter;
      this.showCharacter(character.id, character.texture, character);
    }

    if (line.hideCharacter) {
      this.hideCharacter(line.hideCharacter);
    }

    if (line.moveCharacter) {
      const move = line.moveCharacter;
      this.moveCharacter(move.id, move.x, move.y, move.duration);
    }

    if (line.expression) {
      this.changeExpression(line.expression.id, line.expression.texture);
    }
  }

  destroy() {
    this.characters.clear();
    this.container.destroy();
  }
}
