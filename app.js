/*
インポートと定数の定義
----------------------------------------*/

import { Sound, load_sounds, pause_bgm, play_bgm, play_sounds } from "./classes/Sound.js";
import { MainCanvas, SubCanvas } from "./classes/Canvas.js";
import { Game } from "./classes/Game.js";
import { Player } from "./classes/Player.js";
import { Tetro } from "./classes/Tetro.js";

// インスタンス化
const game = new Game();
const sound = new Sound();
const player = new Player();
const tetro = new Tetro();
const mainCanvas = MainCanvas("mainCanvas", 25, 20, 10);
const holdCanvas = SubCanvas("holdCanvas", 20, 5, 5);
const nextCanvas = SubCanvas("nextCanvas", 20, 5, 5);
const followingCanvas = SubCanvas("followingCanvas", 20, 14, 5);

// 表示用の開始位置を計算する関数（NEXTとHOLD用）
function calculateDisplayPosition(tetroType, canvasWidth, canvasHeight, blockSize) {
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

function draw_hold_field(tetro_type) {
  holdCanvas.clearCanvas();
  if (tetro_type) {
    holdCanvas.drawTetro(tetro_type);
  }
}

function drawNextPieces(pieces) {
  nextCanvas.clearCanvas();
  followingCanvas.clearCanvas();

  // メインの次のピースを描画
  if (pieces.length > 0) {
    nextCanvas.drawTetro(pieces[0], 1);
  }

  // 後続のピースを描画（サイズを0.7倍に縮小）
  for (let i = 1; i < Math.min(6, pieces.length); i++) {
    const verticalSpacing = followingCanvas.blockSize * 2.65;
    const yOffset = (i - 1) * verticalSpacing;
    const matrix = createPiece(pieces[i]);

    const tetroSize = followingCanvas.getTetroSize(matrix);
    const scaledSize = tetroSize * 0.7;

    // 中央配置のための調整
    const xOffset = (followingCanvas.canvasWidth() - scaledSize) / (2 * this.following.blockSize);
    let yAdjust = 0;
    if (pieces[i] === 'I') {
      yAdjust = -followingCanvas.blockSize * 0.25; // Iミノの場合、少し上に調整
    }

    followingCanvas.drawMatrix(
      matrix,
      {
        x: xOffset,
        y: (yOffset + followingCanvas.blockSize) / followingCanvas.blockSize + yAdjust / followingCanvas.blockSize
      },
      0.7,
      tetroSize
    );
  }
}

// Fisher-Yatesアルゴリズムを使用した配列のシャッフル関数
function shuffle(array) {
  // 配列の末尾から順に処理を行う
  for (let i = array.length - 1; i > 0; i--) {
    // ランダムな位置jを選ぶ（i＋1未満のランダムな少数を作り、少数以下を切り捨てる）
    const j = Math.floor(Math.random() * (i + 1));
    // 現在の位置iの要素と交換する（分割代入を使う）
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// セブンバッグを生成する関数
function generateSevenBag() {
  // 7つのテトロミノをコピーしてシャッフルする関数
  return shuffle([...tetro.types]);
}

// 次のテトロミノを取得する関数（ゲーム開始時とミノがロックされた時に呼び出す）
function getNextTetromino() {
  if (player.nextPieces.length <= 7) {
    player.nextPieces = player.nextPieces.concat(generateSevenBag());
  }
  return player.nextPieces.shift();
}

/*
スコアとレベル管理
----------------------------------------*/

function checkPerfectClear() {
  // フィールド全体をチェック
  for (let y = 0; y < mainCanvas.arena.length; y++) {
    for (let x = 0; x < mainCanvas.arena[y].length; x++) {
      if (mainCanvas.arena[y][x] !== 0) {
        return false;  // ブロックが残っている場合
      }
    }
  }
  return true;  // 全てのマスが空の場合
}

function updateBackToBack(linesCleared) {
  if (linesCleared === 4) {
    if (!player.lastClearWasTetris) {
      player.lastClearWasTetris = true;
      player.backToBackActive = false;
    } else {
      player.backToBackActive = true;
    }
  } else {
    player.lastClearWasTetris = false;
    player.backToBackActive = false;
  }
}

// フィールド内の完成した行を削除し、スコアを更新する関数
function arenaSweep() {
  let linesCleared = 0;

  // 行を消すループ
  outer: for (let y = mainCanvas.arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < mainCanvas.arena[y].length; ++x) {
      if (mainCanvas.arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = mainCanvas.arena.splice(y, 1)[0].fill(0);
    mainCanvas.arena.unshift(row);
    ++y;
    ++linesCleared;
    // ここでのコンボ増加は削除
  }

  if (linesCleared > 0) {
    const perfectClear = checkPerfectClear();

    // 基本スコア計算
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

    updateBackToBack(linesCleared);

    // スコア計算
    let lineScore;
    if (perfectClear) {
      lineScore = perfectClearScores[linesCleared];
      if (linesCleared === 4 && player.backToBackActive) {
        lineScore = Math.floor(lineScore * 1.5);
      }
    } else {
      lineScore = baseScores[linesCleared];
      if (linesCleared === 4 && player.backToBackActive) {
        lineScore = Math.floor(lineScore * 1.5);
      }
    }

    // コンボボーナスを計算
    let comboBonus = 0;
    if (player.combo > 0) {
      comboBonus = 50 * player.combo;
    }

    player.combo++;

    // 最終スコア加算
    player.score += lineScore + comboBonus;

    // 統計の更新
    player.totalLines += linesCleared;
    player.maxCombo = Math.max(player.maxCombo || 0, player.combo);

    // レベルとUI更新
    checkLevelUp();
    updateScore();
    play_sounds(clear_sound);
  } else {
    // playerDropでarenaSweepが呼ばれた際、消去できる行がなければコンボリセット
    player.combo = 0;
  }
}

// スコアを保存する関数
function saveHighScores(newScore) {
  let highScores = localStorage.getItem('tetrisHighScores');

  // localStorageは配列が保存できないので、JSON.stringifyで文字列に変換して保存。parseで配列に戻す
  if (!highScores) {
    highScores = [];
  } else {
    highScores = JSON.parse(highScores);
  }

  // スコアを保存する関数
  highScores.push({
    score: newScore,
    date: new Date().toLocaleDateString(),
    level: player.level,
    lines: player.totalLines,
    playTime: player.playTime
  });

  // スコアで降順ソート
  highScores.sort((a, b) => b.score - a.score);

  // 上位10件のみ保持
  highScores = highScores.slice(0, 10);

  // 保存
  localStorage.setItem('tetrisHighScores', JSON.stringify(highScores));
}

// 1位のスコアのみを取得する関数
function getTopScore() {
  const scores = getAllHighScores();
  return scores.length > 0 ? scores[0].score : 0;
}

// 全てのハイスコアを取得する関数（スコアボード実装時のため）
function getAllHighScores() {
  const highScores = localStorage.getItem('tetrisHighScores');
  return highScores ? JSON.parse(highScores) : [];
}

// レベルアップの条件をチェックし、必要に応じてレベルアップする関数
function checkLevelUp() {
  const newLevel = Math.floor(player.totalLines / 10) + 1;
  if (newLevel > player.level) {
    player.level = newLevel;
    // 新しいレベルに基づいて落下間隔を更新
    dropInterval = calculateDropInterval(player.level);
    // レベルアップ表示を更新
    updateLevel();
  }
}

function calculateDropInterval(level) {
  // レベルが1の場合は基準速度を返す
  if (level < 1) {
    return game.baseSpeed;
  }

  const base = 0.8 - ((level - 1) * 0.007);
  const power = level - 1;
  const speedMultiplier = Math.pow(base, power);

  // 最小速度（7ミリ秒）を下回らないようにする
  return Math.max(game.baseSpeed * speedMultiplier, 7);
}

/*
時間関連の関数
----------------------------------------*/

function getPlayTimeInSeconds() {
  if (!game.gameActive || !player.startTime) return 0;
  return Math.floor((Date.now() - player.startTime) / 1000);
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updatePlayTime() {
  document.querySelector('#playTime').innerText = formatTime(getPlayTimeInSeconds());
}

function displayBestTime() {
  const scores = getAllHighScores();
  if (scores.length === 0) return "No records";

  const bestTime = Math.min(...scores.map(s => s.playTime || 0));
  return formatTime(bestTime);
}
