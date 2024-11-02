/*
インポートと定数の定義
----------------------------------------*/

import { Sound, load_sounds, pause_bgm, play_bgm, play_sounds} from "./classes/Sound.js";
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

/*
Canvas関連のクラス定義
----------------------------------------*/

class CanvasNext {
  constructor() {
    this.mainNext = new BaseCanvas("nextCanvas", 20, 5, 5);
    this.following = new BaseCanvas("followingCanvas", 20, 14, 5);
  }

  clearCanvas() {
    this.mainNext.clearCanvas();
    this.following.clearCanvas();
  }

  drawNextPieces(pieces) {
    this.clearCanvas();

    // メインの次のピースを描画
    if (pieces.length > 0) {
      this.mainNext.drawTetro(pieces[0], 1);
    }

    // 後続のピースを描画（サイズを0.7倍に縮小）
    for (let i = 1; i < Math.min(6, pieces.length); i++) {
      const verticalSpacing = this.following.blockSize * 2.65;
      const yOffset = (i - 1) * verticalSpacing;
      const matrix = createPiece(pieces[i]);

      const tetroSize = this.following.getTetroSize(matrix);
      const scaledSize = tetroSize * 0.7;

      // 中央配置のための調整
      const xOffset = (this.following.canvasWidth() - scaledSize) / (2 * this.following.blockSize);
      let yAdjust = 0;
      if (pieces[i] === 'I') {
        yAdjust = -this.following.blockSize * 0.25; // Iミノの場合、少し上に調整
      }

      this.following.drawMatrix(
        matrix,
        {
          x: xOffset,
          y: (yOffset + this.following.blockSize) / this.following.blockSize + yAdjust / this.following.blockSize
        },
        0.7,
        tetroSize
      );
    }
  }
}

/*
描画関連の関数
----------------------------------------*/

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

const draw = () => {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 変更した盤面を映す
  drawScreen(screen)
  drawMatrix(arena, { x: 0, y: 0 }, imgs)
  drawMatrix(player.matrix, player.pos, imgs)
  drawGhostMatrix(ghost.matrix, ghost.pos)
};

const drawScreen = (screen) => {
  context.drawImage(screen, 0, 0, 10, 20);
};

const drawMatrix = (matrix, offset, imgs) => {

  // 線の幅を設定（スケールの逆数）
  context.lineWidth = 1 / 20;

  // matrixを描画
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        // パターンを使用して塗りつぶし
        context.drawImage(imgs[value], x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

const drawGhostMatrix = (matrix, offset) => {

  // 線の幅を設定（スケールの逆数）
  context.lineWidth = 1 / 20;

  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        // 線を描画
        context.strokeStyle = "rgba(" + colors[value] + ")";;
        context.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw_hold_field(tetro_type) {
  canvasHold.clearCanvas();
  if (tetro_type) {
    canvasHold.drawTetro(tetro_type);
  }
}

function drawNextPieces() {
  canvasNext.drawNextPieces(nextPieces);
}

function drawGameOver(finalPlayTime) {
  context.save();  // 現在の描画状態を保存
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = 'rgba(0, 0, 0, 0.75)';
  context.fillRect(0, 0, canvas.width, canvas.height);


  if (player.isHighScore) {
    context.fillStyle = '#00FF00';
    context.font = 'bold 30px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'center';
    context.fillText(`New Record!!`, canvas.width / 2, canvas.height / 2);
  } else {
    context.fillStyle = '#FF0000';
    context.font = 'bold 30px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'center';
    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
  }

  context.restore();  // 描画状態を元に戻す
}

/*
テトロミノ操作関連の関数
----------------------------------------*/

// ピースの構造を定義(数字は色のインデックス)
const createPiece = (type) => {
  if (type === 'T') {
    return [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ];
  } else if (type === "O") {
    return [
      [2, 2],
      [2, 2],
    ];
  } else if (type === "L") {
    return [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0],
    ];
  } else if (type === "J") {
    return [
      [4, 0, 0],
      [4, 4, 4],
      [0, 0, 0],
    ];
  } else if (type === "I") {
    return [
      [0, 0, 0, 0],
      [5, 5, 5, 5],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
  } else if (type === 'S') {
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ];
  } else if (type === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ];
  }
}

// 現在のテトロミノの配列を90度時計回りに回転させた配列を返す関数
// 以下引数について
// current_tetro: 現在のテトロミノの２次元配列
function rotate(current_tetro) {
  let new_tetro = []; // 回転後の情報を格納する配列new_tetroを作成
  let current_tetro_size = current_tetro.length; // 現在のテトリミノの配列のサイズを取得する
  for (let y = 0; y < current_tetro_size; y++) {
    // ２次元配列にしたいので行ごとに配列を作成
    new_tetro[y] = [];
    for (let x = 0; x < current_tetro_size; x++) {
      // 時計回りに90度回転させる場合の転記
      new_tetro[y][x] = current_tetro[current_tetro_size - x - 1][y];
    }
  }
  play_sounds(rotate_sound)
  return new_tetro;
}

function updateRotationAxis() { // プレイヤーに保存している現在の表示しているテトロミノ回転軸を更新する
  if (player.rotation == 3) {
    player.rotation = 0;
  } else {
    player.rotation += 1;
  }
}

function clockwisSrs(tetroType) { // SRSの判定処理
  const rotatedTetro = rotate(player.matrix)// 回転後のテトリミノの描画情報
  let xPos = player.pos.x
  let yPos = player.pos.y
  // SRSは現在の描画しているテトロミノが”I”と”I以外”で処理が異なる
  // テトロミノの回転軸によって処理が異なる
  if (tetroType == "I") {
    if (player.rotation == 0) {
      if (collision_on_rotate(xPos - 2, yPos, rotatedTetro)) {
        player.pos.x = xPos - 2
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos + 1, yPos, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos - 2, yPos + 1, rotatedTetro)) {
        player.pos.x = xPos - 2
        player.pos.y = yPos + 1
      } else if (collision_on_rotate(xPos + 1, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos - 2
      } else {
        return; // 全てFalseの場合は何も実行しない
      }
      afterRotate(rotatedTetro);
    } else if (player.rotation == 1) {
      if (collision_on_rotate(xPos - 1, yPos, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos + 2, yPos, rotatedTetro)) {
        player.pos.x = xPos + 2
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos - 1, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos - 2
      } else if (collision_on_rotate(xPos + 2, yPos + 1, rotatedTetro)) {
        player.pos.x = xPos + 2
        player.pos.y = yPos + 1
      } else {
        return; // 全てFalseの場合は何も実行しない
      }
      afterRotate(rotatedTetro);
    } else if (player.rotation == 2) {
      if (collision_on_rotate(xPos + 2, yPos, rotatedTetro)) {
        player.pos.x = xPos + 2
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos - 1, yPos, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos + 2, yPos - 1, rotatedTetro)) {
        player.pos.x = xPos + 2
        player.pos.y = yPos - 1
      } else if (collision_on_rotate(xPos - 1, yPos + 2, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos + 2
      } else {
        return; // 全てFalseの場合は何も実行しない
      }
      afterRotate(rotatedTetro);
    } else if (player.rotation == 3) {
      if (collision_on_rotate(xPos - 2, yPos, rotatedTetro)) {
        player.pos.x = xPos - 2
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos + 1, yPos, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos + 1, yPos + 2, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos + 2
      } else if (collision_on_rotate(xPos - 2, yPos - 1, rotatedTetro)) {
        player.pos.x = xPos - 2
        player.pos.y = yPos - 1
      } else {
        return; // 全てFalseの場合は何も実行しない
      }
      afterRotate(rotatedTetro);
    }
  } else {
    if (player.rotation == 0) {
      if (collision_on_rotate(xPos - 1, yPos, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos - 1, yPos - 1, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos - 1
      } else if (collision_on_rotate(xPos, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos
        player.pos.y = yPos - 2
      } else if (collision_on_rotate(xPos - 1, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos - 2
      } else {
        return; // 全てFalseの場合は何も実行しない
      }
      afterRotate(rotatedTetro);
    } else if (player.rotation == 1) {
      if (collision_on_rotate(xPos + 1, yPos, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos + 1, yPos - 1, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos - 1
      } else if (collision_on_rotate(xPos, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos
        player.pos.y = yPos - 2
      } else if (collision_on_rotate(xPos + 1, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos - 2
      } else {
        return;
      }
      afterRotate(rotatedTetro);
    } else if (player.rotation == 2) {
      if (collision_on_rotate(xPos + 1, yPos, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos + 1, yPos + 1, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos + 1
      } else if (collision_on_rotate(xPos, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos
        player.pos.y = yPos - 2
      } else if (collision_on_rotate(xPos + 1, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos - 2
      } else {
        return; // 全てFalseの場合は何も実行しない
      }
      afterRotate(rotatedTetro);
    } else if (player.rotation == 3) {
      if (collision_on_rotate(xPos - 1, yPos, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos - 1, yPos - 1, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos - 1
      } else if (collision_on_rotate(xPos, yPos + 2, rotatedTetro)) {
        player.pos.x = xPos
        player.pos.y = yPos + 2
      } else if (collision_on_rotate(xPos + 1, yPos + 2, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos + 2
      } else {
        return; // 全てFalseの場合は何も実行しない
      }
      afterRotate(rotatedTetro);
    }
  }
}

function afterRotate(rotatedTetro) {
  player.maxLastYpos = Math.max(player.maxLastYpos, player.currentLastYPos, lastYPos(player, rotatedTetro)); // 回転前の一番下だった時のy座標と回転後のy座標で大きい方を保持する
  player.matrix = rotatedTetro;
  ghostTetrimono(); // ゴーストの位置を更新
  updateRotationAxis(); // 回転軸を更新
  if (player.tetroType === "T") {
    player.tSpin = true;
  }
  if (player.isTouchingGround) {
    moveReset();
  }
}

// テトリミノの回転時の他ブロックとの衝突判定を行う関数
// true か　false を返す
// 以下引数について
// current_x: 現在の描画位置のx座標
// current_y: 現在の描画位置のy座標
// roteted_tetro: 回転後のテトリミノ描画(2次元配列)
function collision_on_rotate(current_x, current_y, rotated_tetro) {
  let field_row = arena.length; // プレイフィールドの行数
  let field_col = arena[0].length; // プレイフィールドの列数
  let current_tetro_size = rotated_tetro.length; // テトロミノの描画サイズ
  for (let y = 0; y < current_tetro_size; y++) {
    for (let x = 0; x < current_tetro_size; x++) {
      if (rotated_tetro[y][x] != 0) {
        // 回転後のテトリミノの現在地から描画位置
        let rotated_x = current_x + x;
        let rotated_y = current_y + y;

        // 回転後のテトリミノが一つでも描画できない位置にある場合falseを返す
        if (rotated_y < 0 || // 描画位置がフィールドの範囲外になる場合
          rotated_x < 0 || // 描画位置がフィールドの範囲外になる場合
          rotated_y >= field_row || // 描画位置がフィールドの範囲外になる場合
          rotated_x >= field_col || // 描画位置がフィールドの範囲外になる場合
          arena[rotated_y][rotated_x] != 0) { // 描画位置にすでにテトリミノが存在する場合
          return false;
        }
      }
    }
  }
  // 回転後のテトリミノの全てが描画できる場合trueを返す
  return true;
}

/*
プレイヤーの動作関連の関数
----------------------------------------*/

function playerMove(dir) { // 左右に現在地を移動する
  let temp = player.pos.x
  player.pos.x += dir;

  if (collide(arena, player)) {
    player.pos.x -= dir
  }
  ghostTetrimono()
  if (player.isTouchingGround && temp != player.pos.x) { // ミノが床に接した後に移動が成功した場合に移動リセットを行う
    moveReset();
  }
  play_sounds(move_sound)
}

function playerDrop() {
  player.pos.y++
  lastTime = currentTime;
  player.currentLastYPos = lastYPos(player, player.matrix);
  if (player.isTouchingGround) {
    if (player.maxLastYpos < player.currentLastYPos) {// 床に一度接した後横移動等でブロックと床の接触状態が変わる場合の処理
      player.isTouchingGround = false;
      player.moveOrRotateCount = 1;
    }
    if (player.moveOrRotateCount > 15 && (player.pos.x == ghost.pos.x && player.pos.y == ghost.pos.y)) { // 16回以上リセットしていた場合１マス下げてロックダウン
      player.pos.y++;
    }
  }
  if (player.pos.x == ghost.pos.x && player.pos.y == ghost.pos.y) { // 接触判定を切り替える
    player.isTouchingGround = true;
    player.maxLastYpos = player.currentLastYPos;
  }
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player)
    arenaSweep()
    if (!playerReset()) {
      // playerResetがfalseを返した場合（ゲームオーバー時）、ここで処理を終了
      return;
    }
    updateScore()
    player.hold_used = false;
  }
  player.tSpin = false; // ロックできなかった場合は、tSpinの判定をfalseにする
  lastTime = currentTime
}

function playerHardDrop() {
  while (player.pos.y < ghost.pos.y) player.pos.y++
  merge(arena, player)
  draw()
  arenaSweep()
  if (!playerReset()) {
    // playerResetがfalseを返した場合（ゲームオーバー時）、ここで処理を終了
    return;
  }
  // arenaSweep()
  updateScore()
  player.hold_used = false;
  currentTime = 0;
}

function playerReset() {
  player.current_tetro_type = getNextTetromino();
  player.matrix = createPiece(player.current_tetro_type);
  player.rotation = 0; // ミノの回転軸を０に戻す
  player.moveOrRotateCount = 1;
  player.isTouchingGround = false;
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  player.currentLastYPos = lastYPos(player, player.matrix);

  drawNextPieces();

  // // ゲームオーバー
  // 配置直後に衝突判定
  if (collide(arena, player)) {
    gameOver();
    return false; // ゲームオーバーを示すfalseを返す
  }
  ghostTetrimono();
  return true; // 正常にリセットされたことを示すtrueを返す
}

function player_reset_after_hold() {
  if (player.hold_tetro_type != null) {// 2回目以降のホールド時の処理
    player.hold_used = true;
    let temp = player.current_tetro_type;
    player.current_tetro_type = player.hold_tetro_type;
    player.hold_tetro_type = temp;
    player.rotation = 0;
    player.matrix = createPiece(player.current_tetro_type);
    player.moveOrRotateCount = 1;
    player.isTouchingGround = false;
    // 位置を真ん中にする
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0)
    ghostTetrimono()
    draw_hold_field(player.hold_tetro_type);
    drawNextPieces();
    // // ゲームオーバー
    // 配置直後に衝突判定
    if (collide(arena, player)) {
      gameOver();
      return false; // ゲームオーバーを示すfalseを返す
    }
    return true; // 正常にリセットされたことを示すtrueを返す
  } else {// １回目のホールド時の処理
    player.hold_used = true;
    player.hold_tetro_type = player.current_tetro_type;
    playerReset();
    draw_hold_field(player.hold_tetro_type);
  }
  play_sounds(hold_sound)
}

function moveReset() {
  if (player.moveOrRotateCount > 15) { // 16回以上回転・移動した場合即ロックダウン
    if (player.pos.x == ghost.pos.x && player.pos.y == ghost.pos.y) {
      playerDrop();
    }
    return;
  } else { // 16回未満の場合はロックダウンカウントをリセットする
    player.moveOrRotateCount++;
    lastTime = currentTime;
    // console.log("moveOrRotateCount: " + player.moveOrRotateCount);
    return;
  }
}

function lastYPos(player, matrix) { // 表示しているテトロミノブロックの一番下の行番号を返す
  for (let y = matrix.length - 1; y >= 0; y--) {
    if (matrix[y].some(value => value !== 0)) {
      return y + player.pos.y
    }
  }
  return null;
}

/*
NEXTとHOLD関連の関数
----------------------------------------*/

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
  for (let y = 0; y < arena.length; y++) {
      for (let x = 0; x < arena[y].length; x++) {
          if (arena[y][x] !== 0) {
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
    let perfectClear = true;

    // 行を消すループ
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
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

// スコアを更新する関数
function updateScore() {
  document.querySelector('#score').innerText = player.score;
  document.querySelector('#lines').innerText = player.totalLines;

  document.querySelector('#highScore').innerText = player.highScore;

  // スコアがハイスコアを超えた場合
  if (player.score > player.highScore) {
    saveHighScores(player.score);  // 保存
    player.highScore = getTopScore();  // 1位のスコアを取得
    player.isHighScore = true;
  }
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

// レベル表示を更新する関数
function updateLevel() {
  document.querySelector('#level').innerText = player.level;
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

/*
ゲーム状態管理の関数
----------------------------------------*/

function gameStart() {
  restartGame()
  context.restore()
  play_sounds(bgm_sound)
}

function gameOver() {
  const finalPlayTime = getPlayTimeInSeconds();

  gameActive = false; // ゲームの状態を非アクティブに設定
  cancelAnimationFrame(animationId); // ゲームループを停止
  document.getElementById('pauseButton').style.display = 'none'; // 一時停止、再開ボタンを非表示にする
  document.getElementById('restartButton').style.display = 'block'; // リスタートボタンを表示
  drawGameOver(finalPlayTime);

  if (player.score > player.highScore) {
    saveHighScores(player.score);
  }
}



function restartGame() {
  // ゲームの状態をアクティブに設定
  gameActive = true;
  // フィールドを全てゼロでリセット
  arena.forEach(row => row.fill(0));
  // プレイヤーのスコアをリセット
  player.score = 0;
  // ライン数をリセット
  player.totalLines = 0;
  // レベルをリセット
  player.level = 1;
  player.combo = 0;
  player.maxCombo = 0;
  player.lastClearWasTetris = false;
  player.backToBackActive = false;
  player.startTime = Date.now();  // ゲーム開始時刻を記録
  player.highScore = getTopScore();
  player.isHighScore = false;

  // 落下速度をリセット
  dropInterval = calculateDropInterval(player.level);
  // ホールドしているテトロミノをリセット
  player.hold_tetro_type = null;
  draw_hold_field(null);
  // スコアとレベル表示を更新
  updateScore();
  updateLevel();
  // ピースをシャッフルし直す
  nextPieces = generateSevenBag();
  // プレイヤーのピースをリセット
  playerReset();
  // アニメーションのタイマーをリセット
  currentTime = 0;
  lastTime = 0;  // lastTimeもリセット
  player.startTime = Date.now();
  document.querySelector('#playTime').innerText = '0:00:00';
  document.getElementById("pauseButton").innerText = "⏸"; //  ボタンのテキストをPauseに戻す

  // ゲームを再開
  update();

  // リスタートボタンを非表示にする
  document.getElementById("pauseButton").innerText = "⏸"; //  ボタンのテキストをPauseに戻す
  document.getElementById('restartButton').style.display = 'none';
  // document.getElementById('startButton').style.display = 'none';
  // 一時停止・再開ボタンを表示する
  document.getElementById('pauseButton').style.display = 'block';
  play_bgm(bgm_sound);
}

function pauseGame() {
  if (gameActive) {
    // 一時停止処理
    gameActive = false;
    cancelAnimationFrame(animationId); // アニメーションフレームの停止
    document.getElementById("pauseButton").innerText = "▷"; // ボタンのテキストを「Resume」に変更
    pause_bgm(bgm_sound);
    pauseStartTime = Date.now();
  } else {
    // ゲームを再開
    gameActive = true;
    const pauseDuration = Date.now() - pauseStartTime;
    player.startTime += pauseDuration;  // 開始時刻を一時停止時間分ずらす
    update(); // ゲーム更新を再開
    document.getElementById("pauseButton").innerText = "⏸"; //  ボタンのテキストをPauseに戻す
    play_bgm(bgm_sound);
  }
}

function update() {
  if (gameActive) { // ゲームが非アクティブな場合は更新を行わない

    currentTime = performance.now()

    if (!(player.pos.x == ghost.pos.x && player.pos.y == ghost.pos.y)) { //ミノが床に接していない時(通常のドロップ)
      if (currentTime - lastTime >= dropInterval) {
        playerDrop();

        if (collide(arena, player)) {
          return;
        }

        lastTime = currentTime;
      }

      updatePlayTime();
      draw()
    } else {
      if (currentTime - lastTime > Math.floor(dropInterval / 2)) { // ミノが床に接している時は通常速度の半分
        playerDrop();

        if (collide(arena, player)) {
          return;
        }

        lastTime = currentTime;
      }

      updatePlayTime();
      draw()
    }
  }
  animationId = requestAnimationFrame(update)
}

function showPlayScreen() {
  document.getElementById("startScreen").style.display = "none"; // スタート画面非表示
  document.getElementById("playScreen").style.display = "flex"; // プレイ画面をflexで表示
}

function showStartScreen() {
  document.getElementById("startScreen").style.display = "flex"; // プレイ画面をflexで表示
  document.getElementById("playScreen").style.display = "none"; // スタート画面非表示
}

/*
衝突判定と位置計算
----------------------------------------*/

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) { // 要確認
        return true
      }
    }
  }
  return false
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
  play_sounds(drop_sound)
}

function ghostTetrimono() { //ゴーストの表示位置を設定する
  ghost.matrix = player.matrix;
  ghost.pos.x = player.pos.x;
  ghost.pos.y = player.pos.y
  while (!collide(arena, ghost)) ghost.pos.y++;
  while (collide(arena, ghost)) ghost.pos.y--;
}

/*
初期化とイベントリスナー
----------------------------------------*/

//画像読込
async function load_image(path) {
  const t_img = new Image();
  return new Promise(
    (resolve) => {
      t_img.onload = () => {
        resolve(t_img);
      }
      t_img.src = path;
    }
  )
};

const loading = async () => {
  try {
    screen = await load_image("./assets/Board/Board.png");
    imgJ = await load_image("./assets/Single Blocks/Blue.png");
    imgS = await load_image("./assets/Single Blocks/Green.png");
    imgI = await load_image("./assets/Single Blocks/LightBlue.png");
    imgL = await load_image("./assets/Single Blocks/Orange.png");
    imgT = await load_image("./assets/Single Blocks/Purple.png");
    imgZ = await load_image("./assets/Single Blocks/Red.png");
    imgO = await load_image("./assets/Single Blocks/Yellow.png");
    imgs = [
      null,
      imgT,
      imgO,
      imgL,
      imgJ,
      imgI,
      imgS,
      imgZ
    ]
    bgm_sound = await load_sounds("bgm");
    drop_sound = await load_sounds("drop");
    hold_sound = await load_sounds("hold");
    clear_sound = await load_sounds("clear");
    move_sound = await load_sounds("move");
    rotate_sound = await load_sounds("rotate");

    // Canvas初期化
    canvasHold = new CanvasHold();
    canvasNext = new CanvasNext();

    // ハイスコアの初期読み込みと表示
    player.highScore = getTopScore();
    document.querySelector('#highScore').innerText = player.highScore;

    // 初期表示
    gameStart();
    drawNextPieces(); // Next表示の初期化
    draw_hold_field(null); // Hold表示の初期化

  } catch (err) {
    console.log(err);
  }
}

document.addEventListener('keydown', (event) => {
  if (!gameActive) return;
  switch (event.key) {
    case 'ArrowLeft':
      playerMove(-1);
      break;
    case 'ArrowRight':
      playerMove(1);
      break;
    case 'ArrowDown':
      playerDrop();
      break;
    // ハードドロップと回転を入れる
    case 'ArrowUp':
      playerHardDrop();
      break;
    case ' ': // スペースを押した時の処理
      let new_tetro = rotate(player.matrix)// 回転後のテトリミノの描画情報new_tetro
      // 回転後のテトリミノの描画位置が他のミノの衝突しない場合のみ、現在のテトロミノの描画を変更する
      if (collision_on_rotate(player.pos.x, player.pos.y, new_tetro)) {
        afterRotate(new_tetro);
      } else { // 通常の動作で回転できない時SRSで判定する
        clockwisSrs(player.current_tetro_type);
      }
      break;
    case 'Shift': // Shiftを押した時の処理
      if (gameActive) {
        if (!player.hold_used) {
          player_reset_after_hold();
        }
      }
      break;
  }
});

document.getElementById('restartButton').addEventListener('click', restartGame);
document.getElementById('homeButton').addEventListener('click', restartGame);
document.getElementById('start').addEventListener('click', gameStart);
document.getElementById("pauseButton").addEventListener("click", function () {
  pauseGame();
  document.getElementById("pauseButton").blur(); // ボタンからフォーカスを外す 
})

/*
ゲーム開始
----------------------------------------*/

loading();
