export class Canvas {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('tetris');
        this.context = this.canvas.getContext('2d');
        this.blockSize = 25;
        this.context.scale(this.blockSize, this.blockSize);
        this.arena = Array.from({ length: 20 }, () => Array(10).fill(0));
        this.colors = [
            null,
            [210, 66, 255], // T
            [255, 229, 1], // O
            [255, 165, 63], // L
            [15, 75, 215], // J
            [112, 226, 254], // I
            [57, 231, 95], // S
            [220, 0, 0], // Z
        ];
        this.imgs = [];
        this.screen = null;

        this.canvasHold = this.createHoldCanvas();
        this.canvasNext = this.createNextCanvas();

        this.loadImages();
    }

    async loadImages() {
        this.screen = await this.load_image("./assets/Board/Board.png");
        const imagePaths = [
            "./assets/Single Blocks/Purple.png",
            "./assets/Single Blocks/Yellow.png",
            "./assets/Single Blocks/Orange.png",
            "./assets/Single Blocks/Blue.png",
            "./assets/Single Blocks/LightBlue.png",
            "./assets/Single Blocks/Green.png",
            "./assets/Single Blocks/Red.png"
        ];

        for (let i = 0; i < imagePaths.length; i++) {
            this.imgs[i + 1] = await this.load_image(imagePaths[i]);
        }
    }

    load_image(path) {
        const t_img = new Image();
        return new Promise(resolve => {
            t_img.onload = () => resolve(t_img);
            t_img.src = path;
        });
    }

    createHoldCanvas() {
        const canvas = document.getElementById("hold_canvas");
        const context = canvas.getContext("2d");
        return { canvas, context };
    }

    createNextCanvas() {
        const nextPieceCanvas = document.getElementById("nextPiece");
        const followingPiecesCanvas = document.getElementById("followingPieces");
        const nextPieceContext = nextPieceCanvas.getContext("2d");
        const followingPiecesContext = followingPiecesCanvas.getContext("2d");

        return {
            mainNext: { canvas: nextPieceCanvas, context: nextPieceContext },
            following: { canvas: followingPiecesCanvas, context: followingPiecesContext }
        };
    }

    calculateDisplayPosition(tetroType, canvasWidth, canvasHeight, blockSize) {
        let startX, startY;

        switch (tetroType) {
            case "I":
                startX = (canvasWidth - blockSize * 4) / 2;
                // Iミノの場合、より上方に配置
                startY = (canvasHeight - blockSize * 2.5) / 2;
                break;
            case "O":
                startX = (canvasWidth - blockSize * 2) / 2;
                startY = (canvasHeight - blockSize * 2) / 2;
                break;
            default:
                startX = (canvasWidth - blockSize * 3) / 2;
                startY = (canvasHeight - blockSize * 2) / 2;
        }

        return { x: startX, y: startY };
    }

    draw(arena, player) {
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawScreen(this.screen);
        this.drawMatrix(arena, { x: 0, y: 0 });
        this.drawMatrix(player.matrix, player.pos);
        this.drawGhostMatrix(player.ghost.matrix, player.ghost.pos);
    }

    drawScreen(screen) {
        this.context.drawImage(screen, 0, 0, 10, 20);
    }

    drawMatrix(matrix, offset) {
        this.context.lineWidth = 1 / 20;
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.drawImage(this.imgs[value], x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    drawGhostMatrix(matrix, offset) {
        this.context.lineWidth = 1 / 20;

        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.strokeStyle = "rgba(" + this.colors[value] + ", 0.3)";
                    this.context.strokeRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    draw_hold_field(tetro_type) {
        this.canvasHold.context.clearRect(0, 0, this.canvasHold.canvas.width, this.canvasHold.canvas.height);
        if (tetro_type) {
            this.drawTetro(tetro_type, this.canvasHold);
        }
    }

    drawTetro(tetroType, { canvas, context }, scale = 1) {
        const matrix = this.game.tetrominoes.createPiece(tetroType);
        const blockSize = 20;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;


        const pos = this.calculateDisplayPosition(tetroType, canvasWidth, canvasHeight, blockSize);

        const tetroSize = matrix.length * blockSize;
        const scaledSize = tetroSize * scale;

        const offset = {
            x: (canvasWidth - scaledSize) / (2 * blockSize),
            y: pos.y / blockSize
        };

        this.drawMatrixHoldNext(matrix, offset, scale, tetroSize, context, blockSize);
    }

    drawMatrixHoldNext(matrix, offset, scale, tetroSize, context, blockSize) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = tetroSize;
        tempCanvas.height = tetroSize;

        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    tempCtx.drawImage(
                        this.imgs[value],
                        x * blockSize,
                        y * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            });
        });

        const scaledSize = tetroSize * scale;
        context.drawImage(
            tempCanvas,
            offset.x * blockSize,
            offset.y * blockSize,
            scaledSize,
            scaledSize
        );
    }

    drawNextPieces(pieces) {
        this.clearNextCanvas();
        if (pieces.length > 0) {
            this.drawTetro(pieces[0], this.canvasNext.mainNext);
        }

        for (let i = 1; i < Math.min(6, pieces.length); i++) {
            const verticalSpacing = 20 * 2.65;
            const yOffset = (i - 1) * verticalSpacing;
            const matrix = this.game.tetrominoes.createPiece(pieces[i]);
            const blockSize = 20;

            const tetroSize = matrix.length * blockSize;
            const scaledSize = tetroSize * 0.7;
            const xOffset = (this.canvasNext.following.canvas.width - scaledSize) / (2 * blockSize);
            let yAdjust = 0;
            if (pieces[i] === 'I') {
                yAdjust = -blockSize * 0.25;
            }

            this.drawMatrixHoldNext(matrix, { x: xOffset, y: (yOffset + blockSize) / blockSize + yAdjust / blockSize }, 0.7, tetroSize, this.canvasNext.following.context, blockSize);
        }
    }

    clearNextCanvas() {
        this.canvasNext.mainNext.context.fillStyle = "#000";
        this.canvasNext.mainNext.context.fillRect(0, 0, this.canvasNext.mainNext.canvas.width, this.canvasNext.mainNext.canvas.height);
        this.canvasNext.following.context.fillStyle = "#000";
        this.canvasNext.following.context.fillRect(0, 0, this.canvasNext.following.canvas.width, this.canvasNext.following.canvas.height);
    }

    drawGameOver(finalPlayTime) {
        this.context.save();
        this.context.scale(1/this.blockSize, 1/this.blockSize);
        
        this.context.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        let message = "GAME OVER";
        if (this.game.player.isHighScore) {
            message = "New Record!!"
            this.context.fillStyle = '#00FF00';
        } else {
            this.context.fillStyle = '#FF0000';
        }

        this.context.font = 'bold 30px Arial';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'center';
        this.context.fillText(message, this.canvas.width / 2, this.canvas.height / 2);

        this.context.restore();
    }

    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    arenaSweep() {
        let linesCleared = 0;
        outer: for (let y = this.arena.length - 1; y >= 0; --y) {
            for (let x = 0; x < this.arena[y].length; ++x) {
                if (this.arena[y][x] === 0) {
                    continue outer;
                }
            }

            const row = this.arena.splice(y, 1)[0].fill(0);
            this.arena.unshift(row);
            ++y;
            ++linesCleared;
        }

        if (linesCleared > 0) {
            this.game.player.totalLines += linesCleared;
            this.game.player.score += this.calculateLineScore(linesCleared, this.game.player);

            if (this.checkPerfectClear()) {
                // PERFECT CLEAR時の処理
            }

            this.game.player.combo++;

            if (this.game.player.combo > this.game.player.maxCombo) {
                this.game.player.maxCombo = this.game.player.combo;
            }

            this.checkLevelUp(this.game.player);
            this.updateScore(this.game.player);

            this.game.soundManager.play_sounds(this.game.soundManager.clear_sound);
        } else {
            this.game.player.combo = 0;
        }

        return linesCleared;
    }

    calculateLineScore(linesCleared, player) {
        const baseScores = {
            1: 100,
            2: 300,
            3: 500,
            4: 800
        };

        const perfectClearScores = {
            1: 900,
            2: 1500,
            3: 2300,
            4: 2800
        };

        const baseScore = this.checkPerfectClear() ? perfectClearScores[linesCleared] : baseScores[linesCleared];

        const backToBackMultiplier = (linesCleared === 4 && player.backToBackActive) ? 1.5 : 1;

        const comboBonus = player.combo > 0 ? 50 * player.combo : 0;

        return Math.floor(baseScore * backToBackMultiplier) + comboBonus;
    }

    checkPerfectClear() {
        for (let y = 0; y < this.arena.length; y++) {
            for (let x = 0; x < this.arena[y].length; x++) {
                if (this.arena[y][x] !== 0) {
                    return false;
                }
            }
        }
        return true;
    }

    collide(player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; y++) {
            for (let x = 0; x < m[y].length; x++) {
                if (m[y][x] !== 0 && (this.arena[y + o.y] && this.arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    merge(player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
        this.game.soundManager.play_sounds(this.game.soundManager.drop_sound);
    }

    ghostTetrimino(player) {
        if (!player) {
            console.error('Player is undefined in ghostTetrimino');
            return;
        }

        try {
            // ghostの初期化チェック
            if (!player.ghost) {
                player.ghost = {
                    pos: { x: player.pos.x, y: player.pos.y },
                    matrix: player.matrix
                };
            }

            // ゴーストの位置を更新
            player.ghost.pos.x = player.pos.x;
            player.ghost.pos.y = player.pos.y;

            // ゴーストのマトリックスを更新
            player.ghost.matrix = player.matrix;

            // ゴーストを一番下まで落とす
            while (!this.collide(player.ghost)) {
                player.ghost.pos.y++;
            }

            // 一つ上に戻す（最後の有効な位置）
            if (player.ghost.pos.y > 0) {
                player.ghost.pos.y--;
            }

        } catch (error) {
            console.error('Error in ghostTetrimino:', error);
            console.error('Player state:', {
                pos: player.pos,
                ghost: player.ghost,
                matrix: player.matrix
            });
        }
    }

    saveHighScores(newScore, playTime, level, lines) {
        let highScores = localStorage.getItem('tetrisHighScores');
        if (!highScores) {
            highScores = [];
        } else {
            highScores = JSON.parse(highScores);
        }
        highScores.push({ score: newScore, playTime: playTime, date: new Date().toLocaleDateString(), level: level, lines: lines });
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 10);
        localStorage.setItem('tetrisHighScores', JSON.stringify(highScores));
    }

    getTopScore() {
        const scores = this.getAllHighScores();
        return scores.length > 0 ? scores[0].score : 0;
    }

    getAllHighScores() {
        const highScores = localStorage.getItem('tetrisHighScores');
        return highScores ? JSON.parse(highScores) : [];
    }

    updateScore(player) {
        document.querySelector('#score').innerText = player.score;
        document.querySelector('#lines').innerText = player.totalLines;
        document.querySelector('#highScore').innerText = player.highScore;
        if (player.score > player.highScore) {
            player.highScore = this.getTopScore();
        }
    }

    updateLevel(player) {
        document.querySelector('#level').innerText = player.level;
    }

    checkLevelUp(player) {
        const newLevel = Math.floor(player.totalLines / 10) + 1;
        if (newLevel > player.level) {
            player.level = newLevel;
            this.game.dropInterval = player.calculateDropInterval(player.level);
            this.updateLevel(player);
        }
    }

    calculateDropInterval(level) {
        if (level < 1) {
            return this.baseSpeed;
        }

        const base = 0.8 - ((level - 1) * 0.007);
        const power = level - 1;
        const speedMultiplier = Math.pow(base, power);

        return Math.max(this.baseSpeed * speedMultiplier, 7);
    }

    updatePlayTime(playTime) {
        document.querySelector('#playTime').innerText = this.formatTime(playTime);
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}