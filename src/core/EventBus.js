import Phaser from "phaser";

class EventBus extends Phaser.Events.EventEmitter {
  emitEvent(eventName, payload = {}) {
    this.emit(eventName, payload);
  }
}

export default new EventBus();
