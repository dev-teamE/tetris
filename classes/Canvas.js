import { player, tetro, calculateDisplayPosition, createPiece } from "../app.js";

class Canvas {
    constructor(canvasId, blockSize, row, col) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext("2d");
        this.blockSize = blockSize;
        this.row = row;
        this.col = col;
        this.initCanvas();
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

export class MainCanvas extends Canvas {
    constructor(canvasId, blockSize, row, col) {
        super(canvasId, blockSize, row, col);
        this.arena = this.createArena();
        this.screen = null;
    }

    createArena() {
        return Array.from({ length: this.row }, () => Array(this.col).fill(0));
    }
}

export class SubCanvas extends Canvas {
    constructor(canvasId, blockSize, row, col) {
        super(canvasId, blockSize, row, col);
    }

    getTetroSize(matrix) {
        const size = matrix.length * holdCanvas.blockSize;
        return size;
    }

    drawTetro(tetroType, scale = 1) {
        const matrix = createPiece(tetroType);
        const pos = calculateDisplayPosition(tetroType, this.canvasWidth(), this.canvasHeight(), this.blockSize);

        const tetroSize = this.getTetroSize(player.matrix);
        const scaledSize = tetroSize * scale;

        const offset = {
            x: (this.canvasWidth() - scaledSize) / (2 * this.blockSize),
            y: pos.y / this.blockSize
        };

        this.drawMatrix(matrix, offset, scale, tetroSize);
    }

    drawMatrix(matrix, offset, scale = 1, tetroSize) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = tetroSize;
        tempCanvas.height = tetroSize;

        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    tempCtx.drawImage(
                        tetro.imgs[value],
                        x * this.blockSize,
                        y * this.blockSize,
                        this.blockSize,
                        this.blockSize
                    );
                }
            });
        });

        const scaledSize = tetroSize * scale;
        this.context.drawImage(
            tempCanvas,
            offset.x * this.blockSize,
            offset.y * this.blockSize,
            scaledSize,
            scaledSize
        );
    }
}
