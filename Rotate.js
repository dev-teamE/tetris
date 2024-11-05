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
  play_sounds(rotate_sound)
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
function clockwisSrs(player, mainCanvas) { 
  const rotatedTetro = rotate(player.matrix)// 回転後のテトリミノの2次元配列
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
      afterRotate(player, rotatedTetro);
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
      afterRotate(player, rotatedTetro);
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
      afterRotate(player, rotatedTetro);
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
      afterRotate(player, rotatedTetro);
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
      afterRotate(player, rotatedTetro);
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
      afterRotate(player, rotatedTetro);
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
      afterRotate(player, rotatedTetro);
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
      afterRotate(player, rotatedTetro);
    }
  }
}
/**
 * playerインスタンスのmaxLastYpos、matrix、tSpinプロパティを更新する(テトロミノの回転動作後の処理をする)
 * @param {Player} player - 更新するPlayerクラスのインスタンス
 * @param {number[][]} tetroMatrix- テトロミノの２次元配列（回転後の2次元配列を想定）
 * @requires lastYPos - 現在の描画位置から、渡されたテトロミノを描画した場合に、一番下に位置するブロックの行番号を返す内部関数
 * @requires ghostTetrimono - ゴーストの表示位置を更新する外部関数
 * @requires updateRotationAxis - playerインスタンスのrotationプロバティを更新する内部関数
 * @requires moveReset - 外部関数
 */
function afterRotate(player, tetroMatrix) {
  player.maxLastYpos = Math.max(player.maxLastYpos, player.currentLastYPos, lastYPos(player, tetroMatrix)); // 回転前の一番下だった時のy座標と回転後のy座標で大きい方を保持する
  player.matrix = tetroMatrix;
  ghostTetrimono(); 
  updateRotationAxis();
  if (player.tetroType === "T") {
    player.tSpin = true;
  }
  if (player.isTouchingGround) {
    moveReset();
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
function lastYPos(player, matrix) { // 表示しているテトロミノブロックの一番下の行番号を返す
  for (let y = matrix.length - 1; y >= 0; y--) {
    if (matrix[y].some(value => value !== 0)) {
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
function playerRotate(player, mainCanvas) {
  let newTetro = rotate(player.matrix)// 回転後のテトリミノの描画情報new_tetro
  // 回転後のテトリミノの描画位置が他のミノの衝突しない場合のみ、現在のテトロミノの描画を変更する
  if (collisionOnRotate(player.pos.x, player.pos.y, newTetro, mainCanvas)) {
    afterRotate(player, newTetro);
  } else { // 通常の動作で回転できない時SRSで判定する
    clockwisSrs(player, mainCanvas);
  }
}