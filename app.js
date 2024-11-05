/*
インポートと定数の定義
----------------------------------------*/

import { Sound, load_sounds, pause_bgm, play_bgm, play_sounds} from "./classes/Sound.js";
import { Canvas } from "./classes/Player.js";
import { Game } from "./classes/Game.js";
import { Player } from "./classes/Player.js";
import { Tetoro } from "./classes/Player.js";

// インスタンス化
const game = new Game();
const sound = new Sound();
const player = new Player();
const tetoro = new Tetoro();
const mainCanvas = Canvas("mainCanvas", 20, 20, 10);
const holdCanvas = Canvas("holdCanvas", 20, 5, 5);
const nextCanvas = Canvas("nextCanvas", 20, 5, 5);
const followingCanvas = Canvas("followingCanvas", 20, 14, 5);


// 板垣担当関数
/**
 * プレイヤーの状態をテトロミノを初期位置に表示する状態にする
 * @param {Player} player  - 更新するPlayerクラスのインスタンス
 * @param {MainCanvas} mainCanvas - 更新するMainCanvasクラスのインスタンス
 * @returns {boolean} - 配置直後に衝突した場合False、そうでない場合Trueを返す
 * @requires getNextTetromino - 外部関数
 * @requires createPiece - 外部関数
 * @requires lastYPos - 外部関数
 * @requires drawNextPieces - 外部関数
 * @requires collide -外部関数
 * @requires gameOver - 外部関数
 * @requires ghostTetrimono - 外部関数
 */
function playerReset(player, mainCanvas) {
  player.currentTetroType = getNextTetromino();
  player.matrix = createPiece(player.currentTetroType);
  player.rotation = 0; // ミノの回転軸を０に戻す
  player.moveOrRotateCount = 1;
  player.isTouchingGround = false;
  player.pos.y = 0;
  player.pos.x = (mainCanvas.arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
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

/**
 * プレイヤーの状態をテトロミノを初期位置に表示する状態にする
 * @param {Player} player  - 更新するPlayerクラスのインスタンス
 * @param {MainCanvas} mainCanvas - 更新するMainCanvasクラスのインスタンス
 * @returns {boolean} - 配置直後に衝突した場合False、そうでない場合Trueを返す
 * @requires createPiece - 外部関数
 * @requires ghostTetrimono - 外部関数
 * @requires draw_hold_field - 外部関数
 * @requires drawNextPieces - 外部関数
 * @requires playerReset - 内部関数
 * @requires lastYPos - 外部関数
 * @requires drawNextPieces - 外部関数
 * @requires collide -外部関数
 * @requires gameOver - 外部関数
 * @requires play_sounds - 外部関数
 */
function playerHold(player, mainCanvas) {
    if (!player.holdUsed) {
        if (player.holdTetroType != null) {// 2回目以降のホールド時の処理
            player.holdUsed = true;
            let temp = player.currentTetroType;
            player.currentTetroType = player.holdTetroType;
            player.holdTetroType = temp;
            player.rotation = 0;
            player.matrix = createPiece(player.currentTetroType);
            player.moveOrRotateCount = 1;
            player.isTouchingGround = false;
            // 位置を真ん中にする
            player.pos.y = 0;
            player.pos.x = (mainCanvas.arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0)
            ghostTetrimono()
            draw_hold_field(player.holdTetroType);
            drawNextPieces();
            // // ゲームオーバー
            // 配置直後に衝突判定
            if (collide(mainCanvas, player)) {
              gameOver();
              return false; // ゲームオーバーを示すfalseを返す
            }
            return true; // 正常にリセットされたことを示すtrueを返す
          } else {// １回目のホールド時の処理
            player.holdUsed = true;
            player.holdTetroType = player.currentTetroType;
            playerReset(player, mainCanvas);
            draw_hold_field(player.holdTetroType);
          }
          play_sounds(hold_sound)
      }
}

/**
 * moveOrRotateCountによって以下の処理を実施する
 * - 16以上の場合、playerDropを実施する（即ロックダウン）
 * - 16未満の場合、moveOrRotateCountを１増加させ、ロックまでの時間をリセットする
 * @param {Player} player - 更新するPlayerクラスのインスタンス
 * @requires playerDrop - テトロミノを１つ下に移動する処理を行う外部関数
 * @returns 
 */
function moveReset(player, mainCanvas, game) {
  if (player.moveOrRotateCount > 15) { // 16回以上回転・移動した場合即ロックダウン
    if (player.pos.x == player.ghost.pos.x && player.pos.y == player.ghost.pos.y) {
      playerDrop(player, mainCanvas, game);
    }
    return;
  } else { // 16回未満の場合はロックダウンカウントをリセットする
    player.moveOrRotateCount++;
    game.lastTime = game.currentTime;
    return;
  }
}
/**
 *  x方向の値を受け取りplayerインスタンスのposを更新する。衝突した場合は更新しない。
 * @param {number} dir - x方向に移動する値 
 * @param {Player} player - 更新するPlayerクラスのインスタンス
 * @param {number[][]} arena - 衝突判定を行う2次元配列 
 * @requires collide - 衝突判定を行う外部関数
 * @requires ghostTetrimono - ゴーストの表示位置を更新する外部関数
 * @requires moveReset - 内部関数
 * @requires plar_sounds - 外部関数
 */
function playerMove(dir, player, mainCanvas) { // 左右に現在地を移動する
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

/**
 * PlayerクラスのmoveOrRootateCountプロパティによって以下処理を実施する
 * - 床に一度接した後、横移動や回転で接触状態が変わった場合の処理
 * - moveOrRotateCountが16回以上の場合、ブロックを1マス下げる処理
 * @param {Player} player - 更新するPlayerクラスのインスタンス
 */
function handleMoveOrTotateCount(player) {
    if (player.isTouchingGround) {
        if (player.maxLastYpos < player.currentLastYPos) {// 床に一度接した後横移動等でブロックと床の接触状態が変わる場合の処理
          player.isTouchingGround = false;
          player.moveOrRotateCount = 1;
        }
        if (player.moveOrRotateCount > 15 && (player.pos.x == player.ghost.pos.x && player.pos.y == player.ghost.pos.y)) { // 16回以上リセットしていた場合１マス下げてロックダウン
          player.pos.y++;
        }
      }
}
/**
 * PlayerクラスのisTouchingGroundプロパティを更新する
 * @param {Player} player 更新するPlayerクラスのインスタンス
 */

function activeTouchingGround(player) {
    if (player.pos.x == player.ghost.pos.x && player.pos.y == player.ghost.pos.y) { // 接触判定を切り替える
        player.isTouchingGround = true;
        player.maxLastYpos = player.currentLastYPos;
      }
}
/**
 * テトロミノを１つ下に移動させる処理を行う
 * @param {Player} player - 更新するPlayerクラスのインスタンス
 * @param {MainCanvas} mainCanvas - 更新するMainCanvasクラスのインスタンス
 * @param {Game} game - 更新するGameクラスのインスタンス
 * @requires lastYPos - 現在の描画位置から、渡されたテトロミノを描画した場合に、一番下に位置するブロックの行番号を返す外部関数
 * @requires handleMoveOrTotateCount - PlayerクラスのmoveOrRootateCountプロパティによって処理を実施する内部関数
 * @requires activeTouchingGround - PlayerクラスのisTouchingGroundプロパティを更新する内部関数 
 * @requires collide - 衝突判定を行う外部関数
 * @requires merge - テトロミノのロック処理を行う内部関数
 * @requires arenaSweep - テトロミノの削除、点数計算を行う外部関数
 * @requires playerReset - プレイヤー・テトロミノの状態をリセットする外部関数
 * @requires updateScore - 点数表示のUIを更新する外部関数
 */
function playerDrop(player, mainCanvas, game) {
  player.pos.y++
  game.lastTime = game.currentTime;
  player.currentLastYPos = lastYPos(player, player.matrix);
  handleMoveOrTotateCount(player);
  activeTouchingGround(player);
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player)
    arenaSweep()
    if (!playerReset(player, mainCanvas)) {
      // playerResetがfalseを返した場合（ゲームオーバー時）、ここで処理を終了
      return;
    }
    updateScore()
    player.holdUsed = false;
  }
  player.tSpin = false; // ロックできなかった場合は、tSpinの判定をfalseにする
}

/**
 * ハードドロップ処理を行う
 * @param {Player} player - 更新するPlayerクラスのインスタンス
 * @param {MainCanvas} mainCanvas - 更新するMainCanvasクラスのインスタンス
 * @param {Game} game - 更新するGameクラスのインスタンス
 * @requires merge - テトロミノのロック処理を行う内部関数
 * @requires draw - 外部関数
 * @requires arenaSweep - テトロミノの削除、点数計算を行う外部関数
 * @requires playerReset - プレイヤー・テトロミノの状態をリセットする外部関数
 * @requires updateScore - 点数表示のUIを更新する外部関数
 */
function playerHardDrop(player, mainCanvas, game) {
  while (player.pos.y < player.ghost.pos.y) player.pos.y++
  merge(mainCanvas.arena, player)
  draw()
  arenaSweep()
  if (!playerReset()) {
    // playerResetがfalseを返した場合（ゲームオーバー時）、ここで処理を終了
    return;
  }
  // arenaSweep()
  updateScore()
  player.holdUsed = false;
  game.currentTime = 0;
}
/**
 * テトロミノをロックする処理をする
 * @param {MainCanvas} mainCanvas - 更新するMainCanvasクラスのインスタンス  
 * @param {Player} player - Playerクラスのインスタンス
 * @requires play_sounds - 外部関数
 */
function merge(mainCanvas, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        mainCanvas.arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
  play_sounds(drop_sound)
}

/**
 * プレイヤーの状態をテトロミノを初期位置に表示する状態にする
 * @param {Player} player  - 更新するPlayerクラスのインスタンス
 * @param {MainCanvas} mainCanvas - 更新するMainCanvasクラスのインスタンス
 * @returns {boolean} - 配置直後に衝突した場合False、そうでない場合Trueを返す
 * @requires getNextTetromino - 外部関数
 * @requires createPiece - 外部関数
 * @requires lastYPos - 外部関数
 * @requires drawNextPieces - 外部関数
 * @requires collide -外部関数
 * @requires gameOver - 外部関数
 * @requires ghostTetrimono - 外部関数
 */
function playerReset(player, mainCanvas) {
  player.currentTetroType = getNextTetromino();
  player.matrix = createPiece(player.currentTetroType);
  player.rotation = 0; // ミノの回転軸を０に戻す
  player.moveOrRotateCount = 1;
  player.isTouchingGround = false;
  player.pos.y = 0;
  player.pos.x = (mainCanvas.arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
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

/**
 * プレイヤーの状態をテトロミノを初期位置に表示する状態にする
 * @param {Player} player  - 更新するPlayerクラスのインスタンス
 * @param {MainCanvas} mainCanvas - 更新するMainCanvasクラスのインスタンス
 * @returns {boolean} - 配置直後に衝突した場合False、そうでない場合Trueを返す
 * @requires createPiece - 外部関数
 * @requires ghostTetrimono - 外部関数
 * @requires draw_hold_field - 外部関数
 * @requires drawNextPieces - 外部関数
 * @requires playerReset - 内部関数
 * @requires lastYPos - 外部関数
 * @requires drawNextPieces - 外部関数
 * @requires collide -外部関数
 * @requires gameOver - 外部関数
 * @requires play_sounds - 外部関数
 */
function playerHold(player, mainCanvas) {
    if (!player.holdUsed) {
        if (player.holdTetroType != null) {// 2回目以降のホールド時の処理
            player.holdUsed = true;
            let temp = player.currentTetroType;
            player.currentTetroType = player.holdTetroType;
            player.holdTetroType = temp;
            player.rotation = 0;
            player.matrix = createPiece(player.currentTetroType);
            player.moveOrRotateCount = 1;
            player.isTouchingGround = false;
            // 位置を真ん中にする
            player.pos.y = 0;
            player.pos.x = (mainCanvas.arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0)
            ghostTetrimono()
            draw_hold_field(player.holdTetroType);
            drawNextPieces();
            // // ゲームオーバー
            // 配置直後に衝突判定
            if (collide(mainCanvas, player)) {
              gameOver();
              return false; // ゲームオーバーを示すfalseを返す
            }
            return true; // 正常にリセットされたことを示すtrueを返す
          } else {// １回目のホールド時の処理
            player.holdUsed = true;
            player.holdTetroType = player.currentTetroType;
            playerReset(player, mainCanvas);
            draw_hold_field(player.holdTetroType);
          }
          play_sounds(hold_sound)
      }
}

/**
 * moveOrRotateCountによって以下の処理を実施する
 * - 16以上の場合、playerDropを実施する（即ロックダウン）
 * - 16未満の場合、moveOrRotateCountを１増加させ、ロックまでの時間をリセットする
 * @param {Player} player - 更新するPlayerクラスのインスタンス
 * @requires playerDrop - テトロミノを１つ下に移動する処理を行う外部関数
 * @returns 
 */
function moveReset(player, mainCanvas, game) {
  if (player.moveOrRotateCount > 15) { // 16回以上回転・移動した場合即ロックダウン
    if (player.pos.x == player.ghost.pos.x && player.pos.y == player.ghost.pos.y) {
      playerDrop(player, mainCanvas, game);
    }
    return;
  } else { // 16回未満の場合はロックダウンカウントをリセットする
    player.moveOrRotateCount++;
    game.lastTime = game.currentTime;
    return;
  }
}

/**
 * キーイベントのバインディングを初期化する関数。
 */
function initializeKeyBindings() {
  document.addEventListener('keydown', (event) => handleKeydown(event, player, game, mainCanvas));
}

/**
* キーイベントの処理を行う関数。
* @param {KeyboardEvent} event - キーボードイベントオブジェクト。
* @requires playerMove - 外部関数
* @requires playerDrop - 外部関数
* @requires playerHardDrop - 外部関数
* @requires rotate - 外部関数
* @requires collisionOnRotate - 外部関数
* @requires afterRotate - 外部関数
* @requires clockwisSrs - 外部関数
* @requires playerResetAfterHold - 外部関数
*/
function handleKeydown(event, player, game, mainCanvas) {
  if (!game.gameActive) return;
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
      playerRotate();
      break;
    case 'Shift': // Shiftを押した時の処理
      playerHold(player, mainCanvas);
      break;
  }
}
/**
* UI要素のイベントリスナーを初期化する関数。
* @requires restartGame - 外部関数
* @requires gameStart - 外部関数
* @requires pauseGame - 外部関数
*/
function initializeUIBindings() {
  document.getElementById('restartButton').addEventListener('click', restartGame);
  document.getElementById('homeButton').addEventListener('click', restartGame);
  document.getElementById('start').addEventListener('click', gameStart);
  document.getElementById("pauseButton").addEventListener("click", function() {
      pauseGame();
      document.getElementById("pauseButton").blur(); // ボタンからフォーカスを外す 
  })
}




