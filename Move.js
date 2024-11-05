

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
