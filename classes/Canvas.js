export class Canvas {
    constructor(canvasId, blockSize, row, col) {
      this.canvas = document.getElementById(canvasId);
      this.context = this.canvas.getContext("2d");
      this.blockSize = blockSize;
      this.row = row;
      this.col = col;
      this.initCanvas();
      this.arena = this.createArena(this.row, this.col);
    }
      canvasHeight() { // キャンバスの高さを返す
        return this.blockSize * this.row;
      }
      canvasWidth() { // キャンバスの横幅を返す
        return this.blockSize * this.col;
      }
      initCanvas() { // キャンバスの初期化を行う
        this.canvas.height = this.canvasHeight();
        this.canvas.width = this.canvasWidth();
      }
      scale(num) { // キャンバスのスケールを設定する
        this.context.scale(num, num);
      }
      createArena(row, col) { // 2次元配列を作成
        return Array.from({ length: row }, () => Array(col).fill(0));
      }
  }