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

/**
 * プレイヤーの状態をテトロミノを初期位置に表示する状態にする
 * @param {Player} player  - 更新するPlayerクラスのインスタンス
 * @param {MainCanvas} mainCanvas - 更新するMainCanvasクラスのインスタンス
 * @param {Game} game - Gameクラスのインスタンス
 * @returns {boolean} - 配置直後に衝突した場合False、そうでない場合Trueを返す
 * @requires getNextTetromino - 外部関数
 * @requires createPiece - 外部関数
 * @requires lastYPos - 外部関数
 * @requires drawNextPieces - 外部関数
 * @requires collide -外部関数
 * @requires gameOver - 外部関数
 * @requires ghostTetrimono - 外部関数
 */
function playerReset(player, mainCanvas, game) {
  player.currentTetroType = getNextTetromino(player);
  player.matrix = createPiece(player.currentTetroType);
  player.rotation = 0; // ミノの回転軸を０に戻す
  player.moveOrRotateCount = 1;
  player.isTouchingGround = false;
  player.pos.y = 0;
  player.pos.x = (mainCanvas.arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  player.currentLastYPos = lastYPos(player, player.matrix);

  drawNextPieces(player.nextPieces);

  // // ゲームオーバー
  // 配置直後に衝突判定
  if (collide(mainCanvas, player)) {
    gameOver(mainCanvas, player, game);
    return false; // ゲームオーバーを示すfalseを返す
  }
  ghostTetrimono(mainCanvas, player);
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
 * @requires collide -外部関数
 * @requires gameOver - 外部関数
 * @requires play_sounds - 外部関数
 */
function playerHold(player, mainCanvas, game, sound) {
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
            ghostTetrimono(mainCanvas, player)
            draw_hold_field(player.holdTetroType);
            drawNextPieces(player.nextPieces);
            // // ゲームオーバー
            // 配置直後に衝突判定
            if (collide(mainCanvas, player)) {
              gameOver(mainCanvas, player, game);
              return false; // ゲームオーバーを示すfalseを返す
            }
            return true; // 正常にリセットされたことを示すtrueを返す
          } else {// １回目のホールド時の処理
            player.holdUsed = true;
            player.holdTetroType = player.currentTetroType;
            playerReset(player, mainCanvas, game);
            draw_hold_field(player.holdTetroType);
          }
          play_sounds(sound.hold_sound)
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
function moveReset(player, mainCanvas, game, sound) {
  if (player.moveOrRotateCount > 15) { // 16回以上回転・移動した場合即ロックダウン
    if (player.pos.x == player.ghost.pos.x && player.pos.y == player.ghost.pos.y) {
      playerDrop(player, mainCanvas, game, sound);
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
function playerMove(dir, player, mainCanvas, game, sound) { // 左右に現在地を移動する
  let temp = player.pos.x
  player.pos.x += dir;

  if (collide(mainCanvas, player)) {
    player.pos.x -= dir
  }
  ghostTetrimono(mainCanvas, player)
  if (player.isTouchingGround && temp != player.pos.x) { // ミノが床に接した後に移動が成功した場合に移動リセットを行う
    moveReset(player, mainCanvas, game, sound);
  }
  play_sounds(sound.move_sound)
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
function playerDrop(player, mainCanvas, game, sound) {
  player.pos.y++
  game.lastTime = game.currentTime;
  player.currentLastYPos = lastYPos(player, player.matrix);
  handleMoveOrTotateCount(player);
  activeTouchingGround(player);
  if (collide(mainCanvas, player)) {
    player.pos.y--;
    merge(mainCanvas, player, sound)
    arenaSweep()
    if (!playerReset(player, mainCanvas, game)) {
      // playerResetがfalseを返した場合（ゲームオーバー時）、ここで処理を終了
      return;
    }
    updateScore(player)
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
function playerHardDrop(player, mainCanvas, game, sound) {
  while (player.pos.y < player.ghost.pos.y) player.pos.y++
  merge(mainCanvas, player, sound)
  draw(mainCanvas)
  arenaSweep()
  if (!playerReset(player, mainCanvas, game)) {
    // playerResetがfalseを返した場合（ゲームオーバー時）、ここで処理を終了
    return;
  }
  // arenaSweep()
  updateScore(player)
  player.holdUsed = false;
  game.currentTime = 0;
}
/**
 * テトロミノをロックする処理をする
 * @param {MainCanvas} mainCanvas - 更新するMainCanvasクラスのインスタンス  
 * @param {Player} player - Playerクラスのインスタンス
 * @requires play_sounds - 外部関数
 */
function merge(mainCanvas, player, sound) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        mainCanvas.arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
  play_sounds(sound.drop_sound)
}

/**
 * キーイベントのバインディングを初期化する関数。
 */
function initializeKeyBindings() {
  document.addEventListener('keydown', (event) => handleKeydown(event, player, game, mainCanvas, sound));
}

/**
* キーイベントの処理を行う関数。
* @param {KeyboardEvent} event - キーボードイベントオブジェクト。
* @requires playerMove - 外部関数
* @requires playerDrop - 外部関数
* @requires playerHardDrop - 外部関数
* @requires playerRotate - 外部関数
* @requires playerHold - 外部関数
*/
function handleKeydown(event, player, game, mainCanvas, sound) {
  if (!game.gameActive) return;
  switch (event.key) {
    case 'ArrowLeft':
      playerMove(-1, player, mainCanvas, game, sound);
      break;
    case 'ArrowRight':
      playerMove(1, player, mainCanvas, game, sound);
      break;
    case 'ArrowDown':
      playerDrop(player, mainCanvas, game, sound);
      break;
    // ハードドロップと回転を入れる
    case 'ArrowUp':
      playerHardDrop(player, mainCanvas, game, sound);
      break;
    case ' ': // スペースを押した時の処理
      playerRotate(player, mainCanvas, sound, game);
      break;
    case 'Shift': // Shiftを押した時の処理
      playerHold(player, mainCanvas, game, sound);
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
/**
 * テトロミノの２次元配列を時計回りに90度回転させた２次元配列を返す
 * @param {number[][]} tetroMatrix -  数値の２次元配列
 * @return {number[][]}  -  数値の２次元配列
 * @requires play_sounds - 外部関数
 */
function rotate(tetroMatrix) {
  let newTetro = []; // 回転後の情報を格納する配列
  let currentTetroSize = tetroMatrix.length; 
  for (let y = 0; y < currentTetroSize; y++) {
    newTetro[y] = [];
    for (let x = 0; x < currentTetroSize; x++) {
      newTetro[y][x] = tetroMatrix[currentTetroSize - x - 1][y];
    }
  }
  return newTetro;
}

/**
 * playerインスタンスの現在のrotationプロバティを更新する
 * @param {Player} player -  更新するPlayerクラスのインスタンス
 */
function updateRotationAxis(player) { 
  if (player.rotation == 3) {
    player.rotation = 0;
  } else {
    player.rotation += 1;
  }
}
/**
 * スーパーローテーションシステム(SRS)を使ってplayerインスタンスのposプロパティを更新する
 * @param {Player} player - 更新するPlayerクラスのインスタンス 
 * @param {MainCanvas} mainCanvas  - 衝突判定を行うMainCanvasクラスのインスタンス
 * @requires rotate - テトロミノの２次元配列を時計回りに90度回転させた２次元配列を返す内部関数
 * @requires collisionOnRotate - 座標と２次元配列を受け取り、その配列がCanvasインスタンスと衝突するかどうか判定する内部関数
 * @requires afterRotate - playerインスタンスのmaxLastYpos、matrix、tSpinプロパティを更新する(テトロミノの回転動作後の処理をする)内部関数
 * 
 */
function clockwisSrs(player, mainCanvas, sound, game) { 
  let rotatedTetro = rotate(player.matrix)// 回転後のテトリミノの2次元配列
  let xPos = player.pos.x
  let yPos = player.pos.y
  // SRSは現在の描画しているテトロミノが”I”と”I以外”で処理が異なる
  // テトロミノの回転軸によって処理が異なる
  if (player.currentTetroType == "I") {
    if (player.rotation == 0) {
      if (collisionOnRotate(xPos - 2, yPos, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos - 2
        player.pos.y = yPos
      } else if (collisionOnRotate(xPos + 1, yPos, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos
      } else if (collisionOnRotate(xPos - 2, yPos + 1, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos - 2
        player.pos.y = yPos + 1
      } else if (collisionOnRotate(xPos + 1, yPos - 2, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos - 2
      } else {
        return; 
      }
      afterRotate(player, tetroMatrix, sound, mainCanvas, game);
    } else if (player.rotation == 1) {
      if (collisionOnRotate(xPos - 1, yPos, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos
      } else if (collisionOnRotate(xPos + 2, yPos, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 2
        player.pos.y = yPos
      } else if (collisionOnRotate(xPos - 1, yPos - 2, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos - 2
      } else if (collisionOnRotate(xPos + 2, yPos + 1, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 2
        player.pos.y = yPos + 1
      } else {
        return; 
      }
      afterRotate(player, tetroMatrix, sound, mainCanvas, game);
    } else if (player.rotation == 2) {
      if (collisionOnRotate(xPos + 2, yPos, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 2
        player.pos.y = yPos
      } else if (collisionOnRotate(xPos - 1, yPos, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos
      } else if (collisionOnRotate(xPos + 2, yPos - 1, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 2
        player.pos.y = yPos - 1
      } else if (collisionOnRotate(xPos - 1, yPos + 2, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos + 2
      } else {
        return;
      }
      afterRotate(player, tetroMatrix, sound, mainCanvas, game);
    } else if (player.rotation == 3) {
      if (collisionOnRotate(xPos - 2, yPos, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos - 2
        player.pos.y = yPos
      } else if (collisionOnRotate(xPos + 1, yPos, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos
      } else if (collisionOnRotate(xPos + 1, yPos + 2, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos + 2
      } else if (collisionOnRotate(xPos - 2, yPos - 1, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos - 2
        player.pos.y = yPos - 1
      } else {
        return; 
      }
      afterRotate(player, tetroMatrix, sound, mainCanvas, game);
    }
  } else {
    if (player.rotation == 0) {
      if (collisionOnRotate(xPos - 1, yPos, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos
      } else if (collisionOnRotate(xPos - 1, yPos - 1, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos - 1
      } else if (collisionOnRotate(xPos, yPos - 2, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos
        player.pos.y = yPos - 2
      } else if (collisionOnRotate(xPos - 1, yPos - 2, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos - 2
      } else {
        return; 
      }
      afterRotate(player, tetroMatrix, sound, mainCanvas, game);
    } else if (player.rotation == 1) {
      if (collisionOnRotate(xPos + 1, yPos, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos
      } else if (collisionOnRotate(xPos + 1, yPos - 1, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos - 1
      } else if (collisionOnRotate(xPos, yPos - 2, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos
        player.pos.y = yPos - 2
      } else if (collisionOnRotate(xPos + 1, yPos - 2, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos - 2
      } else {
        return;
      }
      afterRotate(player, tetroMatrix, sound, mainCanvas, game);
    } else if (player.rotation == 2) {
      if (collisionOnRotate(xPos + 1, yPos, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos
      } else if (collisionOnRotate(xPos + 1, yPos + 1, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos + 1
      } else if (collisionOnRotate(xPos, yPos - 2, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos
        player.pos.y = yPos - 2
      } else if (collisionOnRotate(xPos + 1, yPos - 2, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos - 2
      } else {
        return; 
      }
      afterRotate(player, tetroMatrix, sound, mainCanvas, game);
    } else if (player.rotation == 3) {
      if (collisionOnRotate(xPos - 1, yPos, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos
      } else if (collisionOnRotate(xPos - 1, yPos - 1, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos - 1
      } else if (collisionOnRotate(xPos, yPos + 2, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos
        player.pos.y = yPos + 2
      } else if (collisionOnRotate(xPos + 1, yPos + 2, rotatedTetro, mainCanvas)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos + 2
      } else {
        return; 
      }
      afterRotate(player, tetroMatrix, sound, mainCanvas, game);
    }
  }
}
/**
 * playerインスタンスのmaxLastYpos、matrix、tSpinプロパティを更新する(テトロミノの回転動作後の処理をする)
 * @param {Player} player - 更新するPlayerクラスのインスタンス
 * @param {number[][]} tetroMatrix- テトロミノの２次元配列（回転後の2次元配列を想定）
 * @param {Sound} sound - 更新するPlayerクラスのインスタンス
 * @param {MainCanvas} mainCanvas - 更新するPlayerクラスのインスタンス
 * @param {Game} game - 更新するPlayerクラスのインスタンス
 * @requires lastYPos - 現在の描画位置から、渡されたテトロミノを描画した場合に、一番下に位置するブロックの行番号を返す内部関数
 * @requires play_sound - 外部関数
 * @requires ghostTetrimono - ゴーストの表示位置を更新する外部関数
 * @requires updateRotationAxis - playerインスタンスのrotationプロバティを更新する内部関数
 * @requires moveReset - 外部関数
 */
function afterRotate(player, tetroMatrix, sound, mainCanvas, game) {
  player.maxLastYpos = Math.max(player.maxLastYpos, player.currentLastYPos, lastYPos(player, tetroMatrix)); // 回転前の一番下だった時のy座標と回転後のy座標で大きい方を保持する
  player.matrix = tetroMatrix;
  play_sounds(sound.rotate_sound);
  ghostTetrimono(mainCanvas, player); 
  updateRotationAxis(player);
  if (player.tetroType === "T") {
    player.tSpin = true;
  }
  if (player.isTouchingGround) {
    moveReset(player, mainCanvas, game, sound);
  }
}

/**
 * xy座標と２次元配列を受け取り、その配列がCanvasインスタンスのarenaと衝突するかどうか判定する
 * @param {number} xPos - 衝突判定を行いたいx座標
 * @param {number} yPos - 衝突判定を行いたいy座標
 * @param {number[][]} tetroMatrix - テトロミノの２次元配列（回転後のテトロミノの2次元配列）
 * @param {Canvas} mainCanvas - 衝突判定を行う対象のMainCanvasクラスのインスタンス
 * @returns {boolean} 受け取ったテトロミノが衝突しない場合'true'、そうでなければ'false'を返す
 */
function collisionOnRotate(xPos, yPos, tetroMatrix, mainCanvas) {
  for (let y = 0; y < tetroMatrix.length; y++) {
    for (let x = 0; x < tetroMatrix.length; x++) {
      if (tetroMatrix[y][x] != 0) {
        let newXPos = xPos + x;
        let newYPos = yPos + y;
        if (newYPos < 0 || // 描画位置がフィールドの範囲外になる場合
            newXPos < 0 || // 描画位置がフィールドの範囲外になる場合
            newYPos >= mainCanvas.row || // 描画位置がフィールドの範囲外になる場合
            newXPos >= mainCanvas.col || // 描画位置がフィールドの範囲外になる場合
            mainCanvas.arena[newYPos][newXPos] != 0) { // 描画位置にすでにテトリミノが存在する場合
            return false;
        }
      }
    }
  }
  return true;
}

/**
 * 現在の描画位置から、渡されたテトロミノを描画した場合に、一番下に位置するブロックの行番号を返す
 * @param {Player} player -  更新するPlayerクラスのインスタンス
 * @param {number[][]} tetroMatrix - テトロミノの２次元配列
 * @returns {number|null} テトロミノブロックが描画される一番下の行番号と現在の表示位置を合計した値
 * ブロックがない場合はnullを返す
 */
function lastYPos(player, tetromatrix) { 
  for (let y = tetromatrix.length - 1; y >= 0; y--) {
    if (tetromatrix[y].some(value => value !== 0)) {
      return y + player.pos.y
    }
  }
  return null;
}

/**
 * テトロミノを回転させる処理
 * @param {*} player 
 * @param {*} mainCanvas 
 * @requires rotate - 内部関数
 * @requires collisionOnRotate - 内部関数
 * @requires afterRotate - 内部関数
 * @requires clockwisSrs - 内部関数
 */
function playerRotate(player, mainCanvas, sound, game) {
  let newTetro = rotate(player.matrix)// 回転後のテトリミノの描画情報new_tetro
  // 回転後のテトリミノの描画位置が他のミノの衝突しない場合のみ、現在のテトロミノの描画を変更する
  if (collisionOnRotate(player.pos.x, player.pos.y, newTetro, mainCanvas)) {
    afterRotate(player, newTetro, sound, mainCanvas, game);
  } else { // 通常の動作で回転できない時SRSで判定する
    clockwisSrs(player, mainCanvas, sound, game);
  }
}

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
function getNextTetromino(player) {
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

function draw(MainCanvas) {
  MainCanvas.context.fillStyle = "#000";
  MainCanvas.context.fillRect(0, 0, MainCanvas.canvasWidth(), MainCanvas.canvasHeight());

  // 変更した盤面を映す
  drawScreen(mainCanvas)
  drawMatrix(mainCanvas, mainCanvas.arena, {x: 0, y: 0}, tetro)
  drawMatrix(mainCanvas, player.matrix, player.pos, tetro)
  drawGhostMatrix(mainCanvas, player, tetro)
};

function drawScreen(MainCanvas) {
  MainCanvas.context.drawImage(MainCanvas.screen, 0, 0, 10 * MainCanvas.blockSize, 20 * MainCanvas.blockSize);
};

function drawMatrix (MainCanvas, matrix, offset, Tetro) {

  // matrixを描画
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        // パターンを使用して塗りつぶし
        MainCanvas.context.drawImage(Tetro.imgs[value], x + offset.x, y + offset.y, MainCanvas.blockSize, MainCanvas.blockSize);
      }
    });
  });
}

function drawGhostMatrix(MainCanvas,Player, Tetro) {

  Player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        // 線を描画
        MainCanvas.context.strokeStyle = "rgba(" + Tetro.colors[value] + ")";;
        MainCanvas.context.strokeRect(x + Player.ghost.pos.x, y + Player.ghost.pos.y, MainCanvas.blockSize, MainCanvas.blockSize);
      }
    });
  });
}

function drawGameOver(MainCanvas,Player) {
  MainCanvas.context.save();  // 現在の描画状態を保存
  MainCanvas.context.setTransform(1, 0, 0, 1, 0, 0);
  MainCanvas.context.fillStyle = 'rgba(0, 0, 0, 0.75)';
  MainCanvas.context.fillRect(0, 0, MainCanvas.canvasWidth(), MainCanvas.canvasHeight());


  if (Player.isHighScore) {
    MainCanvas.context.fillStyle = '#00FF00';
    MainCanvas.context.font = 'bold 30px Arial';
    MainCanvas.context.textAlign = 'center';
    MainCanvas.context.textBaseline = 'center';
    MainCanvas.context.fillText(`New Record!!`, MainCanvas.canvasWidth() / 2, MainCanvas.canvasHeight() / 2);
  } else {
    MainCanvas.context.fillStyle = '#FF0000';
    MainCanvas.context.font = 'bold 30px Arial';
    MainCanvas.context.textAlign = 'center';
    MainCanvas.context.textBaseline = 'center';
    MainCanvas.context.fillText('GAME OVER', MainCanvas.canvasWidth() / 2, MainCanvas.canvasHeight() / 2);
  }

  MainCanvas.context.restore();  // 描画状態を元に戻す
}

/*
テトロミノ操作関連の関数
----------------------------------------*/

// ピースの構造を定義(数字は色のインデックス)
function createPiece(type) {
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

// スコアを更新する関数
function updateScore(Player) {
  document.querySelector('#score').innerText = Player.score;
  document.querySelector('#lines').innerText = Player.totalLines;
  document.querySelector('#highScore').innerText = Player.highScore;

  // スコアがハイスコアを超えた場合
  if (Player.score > Player.highScore) {
    saveHighScores(Player.score);  // 保存
    Player.highScore = getTopScore();  // 1位のスコアを取得
    Player.isHighScore = true;
  }
}

// レベル表示を更新する関数
function updateLevel(Player) {
  document.querySelector('#level').innerText = Player.level;
}
/*
ゲーム状態管理の関数
----------------------------------------*/

function gameStart(MainCanvas, Player, Game, Sound) {
  restartGame(MainCanvas, Player, Game, Sound)
  MainCanvas.context.restore()
  play_sounds(Sound.bgm_sound)
}

function gameOver(Canvas, Player, Game) {
  // 追加要素？
  const finalPlayTime = getPlayTimeInSeconds(player, game);

  Game.gameActive = false; // ゲームの状態を非アクティブに設定
  cancelAnimationFrame(Game.animationId); // ゲームループを停止
  document.getElementById('pauseButton').style.display = 'none'; // 一時停止、再開ボタンを非表示にする
  document.getElementById('restartButton').style.display = 'block'; // リスタートボタンを表示
  drawGameOver(mainCanvas, player);

  if (Player.score > Player.highScore) {
    saveHighScores(Player.score);
  }
}



function restartGame(MainCanvas, Player, Game, Sound, Tetro) {
  // ゲームの状態をアクティブに設定
  Game.gameActive = true;
  // フィールドを全てゼロでリセット
  MainCanvas.arena.forEach(row => row.fill(0));
  // プレイヤーのスコアをリセット
  Player.score = 0;
  // ライン数をリセット
  Player.totalLines = 0;
  // レベルをリセット
  Player.level = 1;
  Player.combo = 0;
  Player.maxCombo = 0;
  Player.lastClearWasTetris = false;
  Player.backToBackActive = false;
  Player.startTime = Date.now();  // ゲーム開始時刻を記録
  Player.highScore = getTopScore();
  Player.isHighScore = false;

  // 落下速度をリセット
  Game.dropInterval = calculateDropInterval(Player.level);
  // ホールドしているテトロミノをリセット
  Player.hold_tetro_type = null;
  draw_hold_field(null);
  // スコアとレベル表示を更新
  updateScore(player);
  updateLevel(player);
  // ピースをシャッフルし直す
  Player.nextPieces = generateSevenBag();
  // プレイヤーのピースをリセット
  playerReset(Player, MainCanvas, Game);
  // アニメーションのタイマーをリセット
  Game.currentTime = 0;
  Game.lastTime = 0;  // lastTimeもリセット
  Player.startTime = Date.now();
  document.querySelector('#playTime').innerText = '0:00:00';
  document.getElementById("pauseButton").innerText = "⏸"; //  ボタンのテキストをPauseに戻す

  // ゲームを再開
  update(MainCanvas, Player, Game, Sound);

  // リスタートボタンを非表示にする
  document.getElementById("pauseButton").innerText = "⏸"; //  ボタンのテキストをPauseに戻す
  document.getElementById('restartButton').style.display = 'none';
  // document.getElementById('startButton').style.display = 'none';
  // 一時停止・再開ボタンを表示する
  document.getElementById('pauseButton').style.display = 'block';
  play_bgm(sound.bgm_sound);
}

function pauseGame(Player, Game) {
  if (Game.gameActive) {
    // 一時停止処理
    Game.gameActive = false;
    cancelAnimationFrame(Game.animationId); // アニメーションフレームの停止
    document.getElementById("pauseButton").innerText = "▷"; // ボタンのテキストを「Resume」に変更
    pause_bgm(sound.bgm_sound);
    Game.pauseStartTime = Date.now();
  } else {
    // ゲームを再開
    Game.gameActive = true;
    const pauseDuration = Date.now() - Game.pauseStartTime;
    Player.startTime += pauseDuration;  // 開始時刻を一時停止時間分ずらす
    update(MainCanvas, Player, Game, Sound); // ゲーム更新を再開
    document.getElementById("pauseButton").innerText = "⏸"; //  ボタンのテキストをPauseに戻す
    play_bgm(sound.bgm_sound);
  }
}

function update(MainCanvas, Player, Game, Sound) {
  if (Game.gameActive) { // ゲームが非アクティブな場合は更新を行わない

    Game.currentTime = performance.now()

    if (!(Player.pos.x == Player.ghost.pos.x && Player.pos.y == Player.ghost.pos.y)) { //ミノが床に接していない時(通常のドロップ)
      if (Game.currentTime - Game.lastTime >= Game.dropInterval) {
        playerDrop(Player, MainCanvas, Game, Sound));

        if (collide(mainCanvas, player)) {
          return;
        }

        Game.lastTime = Game.currentTime;
      }

      updatePlayTime();
      draw(mainCanvas)
    } else {
      if (Game.currentTime - Game.lastTime > Math.floor(Game.dropInterval / 2)) { // ミノが床に接している時は通常速度の半分
        playerDrop();

        if (collide(mainCanvas, player)) {
          return;
        }

        Game.lastTime = Game.currentTime;
      }

      updatePlayTime(Player, MainCanvas, Game, Sound);
      draw(mainCanvas)
    }
  }
  Game.animationId = requestAnimationFrame(update)
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

function collide(MainCanvas, Player) {
  const [m, o] = [Player.matrix, Player.pos];
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (m[y][x] !== 0 && (MainCanvas.arena[y + o.y] && MainCanvas.arena[y + o.y][x + o.x]) !== 0) { // 要確認
        return true
      }
    }
  }
  return false
}

function ghostTetrimono(Canvas, Player) { //ゴーストの表示位置を設定する
  Player.ghost.matrix = Player.matrix;
  Player.ghost.pos.x = Player.pos.x;
  Player.ghost.pos.y = Player.pos.y;
  while (!collide(Canvas, player)) Player.ghost.pos.y++;
  while (collide(Canvas, player)) Player.ghost.pos.y--;
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

async function loading(MainCanvas, Player, Tetro, Sound) {
  try {
    MainCanvas.screen = await load_image("./assets/Board/Board.png");
    Tetro.imgJ = await load_image("./assets/Single Blocks/Blue.png");
    Tetro.imgS = await load_image("./assets/Single Blocks/Green.png");
    Tetro.imgI = await load_image("./assets/Single Blocks/LightBlue.png");
    Tetro.imgL = await load_image("./assets/Single Blocks/Orange.png");
    Tetro.imgT = await load_image("./assets/Single Blocks/Purple.png");
    Tetro.imgZ = await load_image("./assets/Single Blocks/Red.png");
    Tetro.imgO = await load_image("./assets/Single Blocks/Yellow.png");
    Tetro.imgs = [
      null,
      Tetro.imgT,
      Tetro.imgO,
      Tetro.imgL,
      Tetro.imgJ,
      Tetro.imgI,
      Tetro.imgS,
      Tetro.imgZ
    ]
    Sound.bgm_sound = await load_sounds("bgm");
    Sound.drop_sound = await load_sounds("drop");
    Sound.hold_sound = await load_sounds("hold");
    Sound.clear_sound = await load_sounds("clear");
    Sound.move_sound = await load_sounds("move");
    Sound.rotate_sound = await load_sounds("rotate");

    // ハイスコアの初期読み込みと表示
    Player.highScore = getTopScore();
    document.querySelector('#highScore').innerText = Player.highScore;

    // 初期表示
    gameStart(MainCanvas, Player, Game, Sound);
    drawNextPieces(); // Next表示の初期化
    draw_hold_field(null); // Hold表示の初期化

  } catch (err) {
    console.log(err);
  }
}
