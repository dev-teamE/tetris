import { Player } from './Player.js';
import { Tetrominoes } from './Tetrominoes.js';
import { Canvas } from './Canvas.js';
import { SoundManager } from './SoundManager.js';

export class Game {
    constructor() {
        this.player = new Player(this);
        this.tetrominoes = new Tetrominoes();
        this.canvas = new Canvas(this);
        this.soundManager = new SoundManager();

        this.lastTime = 0;
        this.currentTime = 0;
        this.dropInterval = 1000;
        this.gameActive = false;
        this.animationId = null;
        this.pauseStartTime = null;

        this._keydownHandler = null;
        this.loading();
    }

    async loading() {
        try {
            // イベントリスナーの設定
            this.setupEventListeners();

            // 画像の読み込み
            await this.canvas.load_image('./assets/Board/Board.png')
                .then(img => this.canvas.screen = img);

            const promises = this.canvas.imgs.map(async (_, i) => {
                if (i === 0) return;
                const path = `./assets/Single Blocks/${
                    ['Purple', 'Yellow', 'Orange', 'Blue', 'LightBlue', 'Green', 'Red'][i - 1]
                }.png`;
                const img = await this.canvas.load_image(path);
                this.canvas.imgs[i] = img;
            });

            await Promise.all(promises); // 画像のロードが完了するまで待つ
            await this.soundManager.loadSounds(); // サウンドのロードが完了するまで待つ

            // 初期表示の設定
            this.canvas.updateScore(this.player);
            this.canvas.updateLevel(this.player);
            this.canvas.drawNextPieces(this.tetrominoes.nextPieces);

            // ゲーム開始
            this.gameStart();
        } catch (error) {
            console.error("Error during loading:", error);
        }
    }

    showPlayScreen() {
        document.getElementById("startScreen").style.display = "none";
        document.getElementById("playScreen").style.display = "flex";
        this.gameStart();
    }

    showStartScreen() {
        document.getElementById("startScreen").style.display = "flex";
        document.getElementById("playScreen").style.display = "none";
        this.restartGame();
    }

    setupEventListeners() {
        document.getElementById('pauseButton')
            .addEventListener('click', () => this.pauseGame());
            
        document.getElementById('restartButton')
            .addEventListener('click', () => this.restartGame());

        document.getElementById('homeButton')
            .addEventListener('click', () => this.showStartScreen());

        document.getElementById('start')
            .addEventListener('click', () => this.showPlayScreen());
    }

    bindControls() {
        this.unbindControls();

        this._keydownHandler = (event) => {
            if (!this.gameActive) return;
            
            // デフォルトのスクロール動作を防ぐ
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) {
                event.preventDefault();
            }
            
            switch (event.code) {
                case 'ArrowLeft':
                    this.player.playerMove(-1);
                    break;
                case 'ArrowRight':
                    this.player.playerMove(1);
                    break;
                case 'ArrowDown':
                    this.player.playerDrop();
                    break;
                case 'ArrowUp':
                    this.player.playerHardDrop();
                    break;
                case 'Space':
                    this.player.playerRotate();
                    break;
                case 'ShiftLeft':
                    this.player.player_reset_after_hold();
                    break;
                case 'ShiftRight':
                    this.player.player_reset_after_hold();
                    break;
                case 'Escape':
                    this.pauseGame();
                    break;
            }
        };

        document.addEventListener('keydown', this._keydownHandler);
    }

    unbindControls() {
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
            this._keydownHandler = null;
        }
    }

    gameStart() {
        this.unbindControls();

        this.gameActive = true;
        this.canvas.arena.forEach(row => row.fill(0));
        this.player.score = 0;
        this.player.totalLines = 0;
        this.player.level = 1;
        this.player.combo = 0;
        this.player.maxCombo = 0;
        this.player.lastClearWasTetris = false;
        this.player.backToBackActive = false;
        this.player.startTime = Date.now();
        this.player.highScore = this.canvas.getTopScore();
        this.player.isHighScore = false;
        this.dropInterval = this.player.calculateDropInterval(this.player.level);
        this.player.hold_tetro_type = null;
        this.canvas.draw_hold_field(null);
        this.canvas.updateScore(this.player);
        this.canvas.updateLevel(this.player);
        this.tetrominoes.nextPieces = this.tetrominoes.generateSevenBag();
        this.player.playerReset();
        this.lastTime = 0;
        this.player.startTime = Date.now();

        this.canvas.updatePlayTime(this.player.playTime);
        this.bindControls(); // bindControlsを呼び出す

        // ボタンの表示状態をリセット
        document.getElementById("pauseButton").innerText = "⏸";
        document.getElementById('restartButton').style.display = 'none';
        document.getElementById('pauseButton').style.display = 'block'; // pauseButtonを表示

        this.soundManager.play_bgm(this.soundManager.bgm_sound);
        this.update();
    }

    pauseGame() {
        if (this.gameActive) {
            this.gameActive = false;
            cancelAnimationFrame(this.animationId);
            document.getElementById("pauseButton").innerText = "▷";
            this.soundManager.pause_bgm(this.soundManager.bgm_sound);
            this.pauseStartTime = Date.now(); // pauseStartTimeを設定
        } else {
            this.gameActive = true;
            const pauseDuration = Date.now() - this.pauseStartTime; // pauseStartTimeを使用して一時停止時間を計算
            this.player.startTime += pauseDuration;
            this.update();
            document.getElementById("pauseButton").innerText = "⏸";
            this.soundManager.play_bgm(this.soundManager.bgm_sound);
        }
    }

    restartGame() {
        this.unbindControls();
    
        // プレイヤーを作り直す
        const currentHighScore = this.player.highScore;
        this.player = new Player(this);
        this.player.highScore = currentHighScore;
        
        // フィールドをクリア
        this.canvas.arena.forEach(row => row.fill(0));
        
        // ゲーム状態の初期化
        this.lastTime = 0;
        this.currentTime = 0;
        this.dropInterval = 1000;
        this.gameActive = true;
        this.animationId = null;
        this.pauseStartTime = null;
    
        // テトロミノの初期化
        this.tetrominoes.nextPieces = this.tetrominoes.generateSevenBag();
        
        // キャンバスの更新
        this.canvas.clearCanvas();
        this.canvas.draw_hold_field(null);
        this.canvas.drawNextPieces(this.tetrominoes.nextPieces);
        this.canvas.updateScore(this.player);
        this.canvas.updateLevel(this.player);
    
        // UI更新
        document.getElementById("pauseButton").innerText = "⏸";
        document.getElementById('restartButton').style.display = 'none';
        document.getElementById('pauseButton').style.display = 'block';
    
        // サウンド
        this.soundManager.play_bgm(this.soundManager.bgm_sound);
    
        // コントロール再バインドとゲーム開始
        this.bindControls();
        
        // 最初のミノを生成
        this.player.playerReset();
        
        this.update();
    }

    gameOver() {
        const finalPlayTime = this.player.getPlayTimeInSeconds();
    
        this.gameActive = false;
        cancelAnimationFrame(this.animationId);
        
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
            this._keydownHandler = null;
        }
        
        document.getElementById('pauseButton').style.display = 'none';
        document.getElementById('restartButton').style.display = 'block';
    
        if (this.player.score > this.player.highScore) {
            this.canvas.saveHighScores(
                this.player.score,
                this.player.playTime,
                this.player.level,
                this.player.totalLines
            );
            this.player.isHighScore = true;
        }
    
        this.canvas.drawGameOver(finalPlayTime);
    }

    update() {
        if (this.gameActive) {
            this.currentTime = performance.now();

            if (!(this.player.pos.x == this.player.ghost.pos.x && this.player.pos.y == this.player.ghost.pos.y)) {
                if (this.currentTime - this.lastTime >= this.dropInterval) {
                    this.player.playerDrop();
                    if (this.canvas.collide(this.player)) {
                        return;
                    }
                    this.lastTime = this.currentTime;
                }
            } else {
                if (this.currentTime - this.lastTime > Math.floor(this.dropInterval / 2)) {
                    this.player.playerDrop();

                    if (this.canvas.collide(this.player)) {
                        return;
                    }
                    this.lastTime = this.currentTime;
                }
            }

            this.canvas.updatePlayTime(this.player.getPlayTimeInSeconds());

            this.canvas.draw(this.canvas.arena, this.player);
        }

        this.animationId = requestAnimationFrame(() => this.update());
    }
}