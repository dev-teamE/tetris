export class Player {
    constructor() {
        this.pos = {
            x: 0,
            y: 0
        };
        this.currentTetroType = null,
        this.rotation = 0,
        this.holdTetroType = null,
        this.holdUsed = false,
        this.matrix = null,
        this.score = 0,
        this.totalLines = 0,
        this.level = 1,
        this.combo = 0,
        this.maxCombo = 0,
        this.lastClearWasTetris = false,
        this.backToBackActive = false,
        this.isTouchingGround = false,
        this.moveOrRotateCount = 1,
        this.currentLastYPos = null,
        this.maxLastYpos = null,
        this.lockDelay = 500,
        this.tSpin = false,
        this.highScore = 0,
        this.isHighScore = false,
        this.playTime = 0,
        this.startTime = null
        this.ghost = {
            pos: { x: 0, y: 0 },
            matrix: null
        },
        this.nextPieces = [];
    }
}
