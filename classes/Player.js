export class Player {
    constructor(game) {
        this.game = game;
        this.pos = { x: 0, y: 0 };
        this.current_tetro_type = null;
        this.rotation = 0;
        this.hold_tetro_type = null;
        this.hold_used = false;
        this.matrix = null;
        this.score = 0;
        this.totalLines = 0;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.lastClearWasTetris = false;
        this.backToBackActive = false;
        this.isTouchingGround = false;
        this.moveOrRotateCount = 1;
        this.currentLastYPos = null;
        this.maxLastYpos = null;
        this.lockDelay = 500;
        this.tSpin = false;
        this.highScore = this.getHighScore();
        this.isHighScore = false;
        this.playTime = 0;
        this.startTime = null;
        this.baseSpeed = 1000;
        this.ghost = {
            pos: { x: 0, y: 0 },
            matrix: null
        };
    }

    playerReset() {
        this.current_tetro_type = this.game.tetro.getNextTetromino();
        this.matrix = this.game.tetro.createPiece(this.current_tetro_type);
        this.rotation = 0;
        this.moveOrRotateCount = 1;
        this.isTouchingGround = false;
        
        this.pos.x = (this.game.canvas.arena[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0);
        this.pos.y = 0;
        
        this.ghost = {
            pos: { x: this.pos.x, y: this.pos.y },
            matrix: this.matrix
        };
        
        this.currentLastYPos = this.lastYPos(this.matrix);
    
        this.game.canvas.drawNextPieces(this.game.tetro.nextPieces);
    
        if (this.game.canvas.collide(this)) {
            this.game.gameOver();
            return false;
        }
    
        this.game.canvas.ghostTetrimino(this);
        return true;
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

    playerMove(dir) {
        let temp = this.pos.x
        this.pos.x += dir;

        if (this.game.canvas.collide(this)) {
            this.pos.x -= dir
        }

        this.game.canvas.ghostTetrimino(this);
        if (this.isTouchingGround && temp != this.pos.x) {
            this.moveReset();
        }
        this.game.sound.play_sounds(this.game.sound.move_sound);
    }

    playerDrop() {
        this.pos.y++
        this.game.lastTime = this.game.currentTime;
        this.currentLastYPos = this.lastYPos(this.matrix);

        if (this.isTouchingGround) {
            if (this.maxLastYpos < this.currentLastYPos) {
                this.isTouchingGround = false;
                this.moveOrRotateCount = 1;
            }

            if (this.moveOrRotateCount > 15 && (this.pos.x == this.ghost.pos.x && this.pos.y == this.ghost.pos.y)) {
                this.pos.y++;
            }
        }

        if (this.pos.x == this.ghost.pos.x && this.pos.y == this.ghost.pos.y) {
            this.isTouchingGround = true;
            this.maxLastYpos = this.currentLastYPos;
        }

        if (this.game.canvas.collide(this)) {
            this.pos.y--;
            this.game.canvas.merge(this);
            this.game.canvas.arenaSweep();

            // スコア関連の更新処理
            const clearedLines = this.game.canvas.arenaSweep(); // arenaSweepがクリアした行数を返すように変更
            this.game.canvas.updateScore(this);
            this.game.canvas.checkLevelUp(this);

            if (!this.playerReset()) {
                return;
            }

            this.hold_used = false;
        }

        this.tSpin = false;
        this.game.lastTime = this.game.currentTime
    }

    playerHardDrop() {
        while (this.pos.y < this.ghost.pos.y) this.pos.y++
        this.game.canvas.merge(this);
        this.game.canvas.draw(this.game.canvas.arena, this);
        this.game.canvas.arenaSweep();
        if (!this.playerReset()) {
            return;
        }

        this.game.canvas.updateScore(this);

        this.hold_used = false;
        this.game.currentTime = 0;
    }

    player_reset_after_hold() {
        if (!this.hold_used) {
            this.game.sound.play_sounds(this.game.sound.hold_sound);
            if (this.hold_tetro_type != null) {
                this.hold_used = true;
                let temp = this.current_tetro_type;
                this.current_tetro_type = this.hold_tetro_type;
                this.hold_tetro_type = temp;
                this.rotation = 0;
                this.matrix = this.game.tetro.createPiece(this.current_tetro_type);
                this.moveOrRotateCount = 1;
                this.isTouchingGround = false;
                this.pos.y = 0;
                this.pos.x = (this.game.canvas.arena[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0)
                this.game.canvas.ghostTetrimino(this);
                this.game.canvas.draw_hold_field(this.hold_tetro_type);
                this.game.canvas.drawNextPieces(this.game.tetro.nextPieces);
                if (this.game.canvas.collide(this)) {
                    this.game.gameOver();
                    return false;
                }
                return true;
            } else {
                this.hold_used = true;
                this.hold_tetro_type = this.current_tetro_type;
                this.playerReset();
                this.game.canvas.draw_hold_field(this.hold_tetro_type);
            }
        }
    }

    moveReset() {
        if (this.moveOrRotateCount > 15) {
            if (this.pos.x == this.ghost.pos.x && this.pos.y == this.ghost.pos.y) {
                this.playerDrop();
            }
            return;
        } else {
            this.moveOrRotateCount++;
            this.game.lastTime = this.game.currentTime;
            return;
        }
    }

    lastYPos(matrix) {
        for (let y = matrix.length - 1; y >= 0; y--) {
            if (matrix[y].some(value => value !== 0)) {
                return y + this.pos.y
            }
        }
        return null;
    }

    getPlayTimeInSeconds() {
        if (!this.game.gameActive || !this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    getHighScore() {
        const highScores = localStorage.getItem('tetrisHighScores');
        if (!highScores) return 0;
        const scores = JSON.parse(highScores);
        return scores.length > 0 ? scores[0].score : 0;
    }

    playerRotate() {
        if (!this.ghost) {
            this.ghost = {
                pos: { x: this.pos.x, y: this.pos.y },
                matrix: this.matrix
            };
        }
    
        try {
            const rotatedTetro = this.game.tetro.rotate(this.matrix);
            let rotationSuccess = false;
    
            // 通常の回転を試みる
            if (this.game.tetro.collision_on_rotate(
                this.pos.x,
                this.pos.y,
                rotatedTetro,
                this.game.canvas.arena
            )) {
                rotationSuccess = this.game.tetro.afterRotate(this, rotatedTetro);
            } else {
                // SRSによる回転を試みる
                this.game.tetro.clockwisSrs(
                    this.current_tetro_type,
                    this,
                    rotatedTetro,
                    this.game.canvas.arena
                );
                rotationSuccess = (this.matrix === rotatedTetro);
            }
    
            if (rotationSuccess && this.game.sound && 
                this.game.sound.rotate_sound) {
                this.game.sound.play_sounds(this.game.sound.rotate_sound);
            }
    
            if (this.game && this.game.canvas && 
                typeof this.game.canvas.ghostTetrimino === 'function') {
                this.game.canvas.ghostTetrimino(this);
            }

            if (this.isTouchingGround && typeof this.moveReset === 'function') {
                this.moveReset();
            }
    
        } catch (error) {
            console.error('Rotation error:', error);
            console.error('Player state:', {
                pos: this.pos,
                ghost: this.ghost,
                matrix: this.matrix,
                rotation: this.rotation
            });
        }
    }
}
