export class Game {

  dropInterval;
  currentTime;
  animationId;

  constructor(bgm_sound, drop_sound, hold_sound, clear_sound, move_sound, rotate_sound) {
    this.lastTime = 0;
    this.gameActive = true;
    this.pauseStartTime = null;
    this.baseSpeed = 1000;
  }
}

