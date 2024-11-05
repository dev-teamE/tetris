
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
