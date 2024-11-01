export class Canvas {
    constructor(canvasId, blockSize, row, col) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext("2d");
        this.blockSize = blockSize;
        this.row = row;
        this.col = col;
        this.initCanvas();
        this.screen = null;
    }

    canvasHeight() {
        return this.blockSize * this.row;
    }

    canvasWidth() {
        return this.blockSize * this.col;
    }

    initCanvas() {
        this.canvas.height = this.canvasHeight();
        this.canvas.width = this.canvasWidth();
    }

    clearCanvas() {
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.canvasWidth(), this.canvasHeight());
    }
}