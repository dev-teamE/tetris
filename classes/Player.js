export class Player {
    constructor() { // 引数にレベル、ゲームモードを渡して選択できると良いのでは？
        this.pos = { x: 0, 
                     y: 0
                    };
        this.currentTetroType = null,
        this.rotation = 0, // 現在のミノの回転状況
        this.holdTetroType = null,
        this.holdUsed = false, // １回の落下中にホールド機能を利用したかどうかの状態
        this.matrix = null,
        this.score = 0,
        this.totalLines = 0,
        this.level = 1,
        this.combo = 0,
        this.maxCombo = 0,
        this.lastClearWasTetris = false,
        this.backToBackActive = false
    }
}