export class Game {

  dropInterval;
  currentTime;
  animationId;

  constructor() {
    this.lastTime = 0;
    this.gameActive = true;
    this.pauseStartTime = null;
    this.baseSpeed = 1000;
  }
}

