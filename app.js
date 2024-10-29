import { load_sounds, pause_bgm, play_bgm, play_sounds } from "./audio.js";

// グローバル変数の定義
let screen, imgJ, imgS, imgI, imgL, imgT, imgZ, imgO, imgs;
let bgm_sound, drop_sound, hold_sound, clear_sound, move_sound, rotate_sound;
let new_tetro,field_row,field_col,current_tetro_size, dropInterval



const canvas = document.querySelector("#tetris");
const context = canvas.getContext("2d");
context.scale(20,20);

// ホールドエリアのcanvasの値を定義するクラス
class CanvasHold {
  constructor(canvasId, blockSize, row, col) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    this.blockSize = blockSize;
    this.row = row;
    this.col = col;
    this.initCanvas();
  }
    canvasHeight() {
      return this.blockSize * this.row;
    }
    canvasWidth() {
      return this.blockSize * this.col;
    }
    initCanvas() {
      this.canvas.height = this.canvasHeight();
      this.canvas.width = this.canvasWidth();
    }

}

function draw_hold_field(tetro_type){ // ホールドフィールドを描画する関数
  clear_hold_field();
  draw_hold_tetro(tetro_type); // ホールドしたテトロミノを描画する
}
function clear_hold_field(){// 現在ホールドフィールドに表示されているテトロミノを削除する
    // 盤面を一度削除する
    for (let y = 0; y < canvasHold.row; y++){
      for (let x = 0; x < canvasHold.col; x++){
        // ブロックの背景色
        canvasHold.context.fillStyle = "#000";
        canvasHold.context.fillRect(x * canvasHold.blockSize,y * canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
        // 内側の格子線の色
        // canvasHold.context.strokeStyle = "rgba(255, 255, 255, 0.3)";
        // canvasHold.context.strokeRect(x * hold_block_size,y * hold_block_size, hold_block_size, hold_block_size);
      }
    }
}
function draw_hold_tetro(tetro_type){
  if (tetro_type === "T") {
    let start_x = (canvasHold.canvasWidth() - canvasHold.blockSize*3) / 2
    let start_y = (canvasHold.canvasHeight() - canvasHold.blockSize*2) / 2
    canvasHold.context.fillStyle = "rgb(" + colors[1] + ")";
    canvasHold.context.fillRect(start_x + canvasHold.blockSize, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize*2, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeStyle = '#000';
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize*2, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);

  } else if (tetro_type === "O") {
    let start_x = (canvasHold.canvasWidth() - canvasHold.blockSize*2) / 2
    let start_y = (canvasHold.canvasHeight() - canvasHold.blockSize*2) / 2
    canvasHold.context.fillStyle = "rgb(" + colors[2] + ")";
    canvasHold.context.fillRect(start_x, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeStyle = '#000'; 
    canvasHold.context.strokeRect(start_x, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);

  } else if (tetro_type === "L") {
    let start_x = (canvasHold.canvasWidth() - canvasHold.blockSize*3) / 2
    let start_y = (canvasHold.canvasHeight() - canvasHold.blockSize*2) / 2
    canvasHold.context.fillStyle = "rgb(" + colors[3] + ")";
    canvasHold.context.fillRect(start_x + canvasHold.blockSize*2, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize*2, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeStyle = '#000';
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize*2, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize*2, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);

  } else if (tetro_type === "J") {
    let start_x = (canvasHold.canvasWidth() - canvasHold.blockSize*3) / 2
    let start_y = (canvasHold.canvasHeight() - canvasHold.blockSize*2) / 2
    canvasHold.context.fillStyle = "rgb(" + colors[4] + ")";
    canvasHold.context.fillRect(start_x, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize*2, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeStyle = '#000';
    canvasHold.context.strokeRect(start_x, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize*2, start_y + canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);

  } else if (tetro_type === "I") {
    let start_x = (canvasHold.canvasWidth() - canvasHold.blockSize*4) / 2
    let start_y = (canvasHold.canvasHeight() - canvasHold.blockSize) / 2
    canvasHold.context.fillStyle = "rgb(" + colors[5] + ")";
    canvasHold.context.fillRect(start_x, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize*2, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize*3, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeStyle = '#000';
    canvasHold.context.strokeRect(start_x, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize*2, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize*3, start_y, canvasHold.blockSize, canvasHold.blockSize);

  } else if (tetro_type === "S") {
    let start_x = (canvasHold.canvasWidth() - canvasHold.blockSize*3) / 2
    let start_y = (canvasHold.canvasHeight() - canvasHold.blockSize*2) / 2
    canvasHold.context.fillStyle = "rgb(" + colors[6] + ")";
    canvasHold.context.fillRect(start_x + canvasHold.blockSize, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize*2, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x, start_y+canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize, start_y+canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeStyle = '#000';
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize*2, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x, start_y+canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize, start_y+canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);

  } else if (tetro_type === "Z") {
    let start_x = (canvasHold.canvasWidth() - canvasHold.blockSize*3) / 2
    let start_y = (canvasHold.canvasHeight() - canvasHold.blockSize*2) / 2
    canvasHold.context.fillStyle = "rgb(" + colors[7] + ")";
    canvasHold.context.fillRect(start_x, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize, start_y+canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.fillRect(start_x + canvasHold.blockSize*2, start_y+canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeStyle = '#000';
    canvasHold.context.strokeRect(start_x, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize, start_y, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize, start_y+canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
    canvasHold.context.strokeRect(start_x + canvasHold.blockSize*2, start_y+canvasHold.blockSize, canvasHold.blockSize, canvasHold.blockSize);
  }
}
function player_reset_after_hold() {
  if(player.hold_tetro_type != null){// 2回目以降のホールド時の処理
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
    player.pos.x = (arena[0].length/2 | 0 ) - (player.matrix[0].length /2 | 0)
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
  }else {// １回目のホールド時の処理
    player.hold_used = true;
    player.hold_tetro_type = player.current_tetro_type;
    playerReset();
    draw_hold_field(player.hold_tetro_type);
  }
  play_sounds(hold_sound)
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
      } else if (collision_on_rotate(xPos + 1, yPos, rotatedTetro)){
        player.pos.x = xPos + 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos - 2, yPos + 1, rotatedTetro)) {
        player.pos.x = xPos - 2
        player.pos.y = yPos + 1
      } else if (collision_on_rotate(xPos + 1, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos - 2
      } else {
        return ; // 全てFalseの場合は何も実行しない
      }
      afterRotate(rotatedTetro);
    } else if (player.rotation == 1) {
      if (collision_on_rotate(xPos - 1, yPos, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos + 2, yPos, rotatedTetro)){
        player.pos.x = xPos + 2
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos - 1, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos - 2
      } else if (collision_on_rotate(xPos + 2, yPos + 1, rotatedTetro)) {
        player.pos.x = xPos + 2
        player.pos.y = yPos + 1
      } else {
        return ; // 全てFalseの場合は何も実行しない
      }
      afterRotate(rotatedTetro);
    } else if (player.rotation == 2) {
      if (collision_on_rotate(xPos + 2, yPos, rotatedTetro)) {
        player.pos.x = xPos + 2
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos - 1, yPos, rotatedTetro)){
        player.pos.x = xPos - 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos + 2, yPos - 1, rotatedTetro)) {
        player.pos.x = xPos + 2
        player.pos.y = yPos - 1
      } else if (collision_on_rotate(xPos - 1, yPos + 2, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos + 2
      } else {
        return ; // 全てFalseの場合は何も実行しない
      }
      afterRotate(rotatedTetro);
    } else if (player.rotation == 3) {
      if (collision_on_rotate(xPos - 2, yPos, rotatedTetro)) {
        player.pos.x = xPos - 2
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos + 1, yPos, rotatedTetro)){
        player.pos.x = xPos + 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos + 1, yPos + 2, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos + 2
      } else if (collision_on_rotate(xPos - 2, yPos - 1, rotatedTetro)) {
        player.pos.x = xPos - 2
        player.pos.y = yPos - 1
      } else {
        return ; // 全てFalseの場合は何も実行しない
      }
      afterRotate(rotatedTetro);
    }
  } else {
    if (player.rotation == 0) {
      if (collision_on_rotate(xPos - 1, yPos, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos - 1, yPos - 1, rotatedTetro)){
        player.pos.x = xPos - 1
        player.pos.y = yPos - 1
      } else if (collision_on_rotate(xPos, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos
        player.pos.y = yPos - 2
      } else if (collision_on_rotate(xPos - 1, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos - 2
      } else {
        return ; // 全てFalseの場合は何も実行しない
      }
      afterRotate(rotatedTetro);
    } else if (player.rotation == 1) {
      if (collision_on_rotate(xPos + 1, yPos, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos + 1, yPos - 1, rotatedTetro)){
        player.pos.x = xPos + 1
        player.pos.y = yPos - 1
      } else if (collision_on_rotate(xPos, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos
        player.pos.y = yPos - 2
      } else if (collision_on_rotate(xPos + 1, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos - 2
      } else {
        return ;
      }
      afterRotate(rotatedTetro);
    } else if (player.rotation == 2) {
      if (collision_on_rotate(xPos + 1, yPos, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos + 1, yPos + 1, rotatedTetro)){
        player.pos.x = xPos + 1
        player.pos.y = yPos + 1
      } else if (collision_on_rotate(xPos, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos
        player.pos.y = yPos - 2
      } else if (collision_on_rotate(xPos + 1, yPos - 2, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos - 2
      } else {
        return ; // 全てFalseの場合は何も実行しない
      }
      afterRotate(rotatedTetro);
    } else if (player.rotation == 3) {
      if (collision_on_rotate(xPos - 1, yPos, rotatedTetro)) {
        player.pos.x = xPos - 1
        player.pos.y = yPos
      } else if (collision_on_rotate(xPos - 1, yPos - 1, rotatedTetro)){
        player.pos.x = xPos - 1
        player.pos.y = yPos - 1
      } else if (collision_on_rotate(xPos, yPos + 2, rotatedTetro)) {
        player.pos.x = xPos
        player.pos.y = yPos + 2
      } else if (collision_on_rotate(xPos + 1, yPos + 2, rotatedTetro)) {
        player.pos.x = xPos + 1
        player.pos.y = yPos + 2
      } else {
        return ; // 全てFalseの場合は何も実行しない
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
  if (player.isTouchingGround) {
    moveReset();
  }
}
function moveReset(){
  if (player.moveOrRotateCount > 15) { // 16回以上回転・移動した場合即ロックダウン
    if (player.pos.x == ghost.pos.x && player.pos.y == ghost.pos.y) {
      playerDrop();
    }
    return ;
  } else { // 16回未満の場合はロックダウンカウントをリセットする
    player.moveOrRotateCount ++;
    lastTime = currentTime;
    // console.log("moveOrRotateCount: " + player.moveOrRotateCount);
    return ;
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
// テトリミノの回転時の他ブロックとの衝突判定を行う関数
// true か　false を返す
// 以下引数について
// current_x: 現在の描画位置のx座標
// current_y: 現在の描画位置のy座標
// roteted_tetro: 回転後のテトリミノ描画(2次元配列)
function collision_on_rotate(current_x, current_y, rotated_tetro){
  let field_row = arena.length; // プレイフィールドの行数
  let field_col = arena[0].length; // プレイフィールドの列数
  let current_tetro_size = rotated_tetro.length; // テトロミノの描画サイズ
  for (let y=0; y<current_tetro_size; y++){
      for (let x=0; x<current_tetro_size; x++){
          if(rotated_tetro[y][x] !=0 ){
              // 回転後のテトリミノの現在地から描画位置
              let rotated_x = current_x + x;
              let rotated_y = current_y + y;

              // 回転後のテトリミノが一つでも描画できない位置にある場合falseを返す
              if( rotated_y < 0 || // 描画位置がフィールドの範囲外になる場合
                  rotated_x < 0 || // 描画位置がフィールドの範囲外になる場合
                  rotated_y >= field_row || // 描画位置がフィールドの範囲外になる場合
                  rotated_x >= field_col || // 描画位置がフィールドの範囲外になる場合
                  arena[rotated_y][rotated_x] != 0){ // 描画位置にすでにテトリミノが存在する場合
                  return false;
              }
          }
      }
  }
  // 回転後のテトリミノの全てが描画できる場合trueを返す
  return true;
}

//　現在のテトロミノの配列を90度時計回りに回転させた配列を返す関数
// 以下引数について
// current_tetro: 現在のテトロミノの２次元配列
function rotate(current_tetro){
  let new_tetro = [];     // 回転後の情報を格納する配列new_tetroを作成
  let current_tetro_size = current_tetro.length; // 現在のテトリミノの配列のサイズを取得する
  for (let y=0; y<current_tetro_size; y++){
      // ２次元配列にしたいので行ごとに配列を作成
      new_tetro[y] = [];
      for (let x=0; x<current_tetro_size; x++){
          // 時計回りに90度回転させる場合の転記
          new_tetro[y][x] = current_tetro[current_tetro_size-x-1][y];
      }
  }
  play_sounds(rotate_sound)
  return new_tetro;
}

const draw = () => {
  context.fillStyle = "#000";
  context.fillRect(0,0, canvas.width, canvas.height);

  // 変更した盤面を映す
  drawScreen(screen)
  drawMatrix(arena, {x: 0, y: 0},imgs)
  drawMatrix(player.matrix, player.pos, imgs)
  drawGhostMatrix(ghost.matrix, ghost.pos)
  
};


// ピースの構造を定義(数字は色のインデックス)
const createPiece = (type) => {
    if (type === 'T'){
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

// ピースの色を定義
const colors = [
    null,
    [210, 66, 255] ,
    [255, 229, 1] ,
    [255, 165, 63] ,
    [15, 75, 215] ,
    [112, 226, 254] ,
    [57, 231, 95] ,
    [220, 0, 0] ,
  ];

/**
 * @param {object} matrix - ピースの形状と配置を表す2次元配列
 * @param {object} offset - ピースの描画位置を指定するオブジェクト. xとyのプロパティを持つ
 */

//画像読込関数
async function load_image(path){
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


const drawScreen= (screen) => {
  context.drawImage(screen ,0 , 0, 10, 20);
};

const drawMatrix =  (matrix, offset, imgs) => {

    // 線の幅を設定（スケールの逆数）
    context.lineWidth = 1 / 20;

    // matrixを描画
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          // パターンを使用して塗りつぶし
          context.drawImage(imgs[value] ,x+offset.x, y+offset.y, 1, 1);
        }
      });
    });
  }

        
const drawGhostMatrix = (matrix, offset) => {

  // 線の幅を設定（スケールの逆数）
  context.lineWidth = 1 / 20;

  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0){
        // 線を描画
        context.strokeStyle = "rgba(" + colors[value] + ")";;
        context.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}


// ２次元配列でテトリスの場所を管理する(10*20)
const arena = Array.from({ length: 20 }, () => Array(10).fill(0));

const player = {
  pos: {x: 0, y: 0},
  current_tetro_type: null, // プレイヤー情報として現在のテトロミノの形の情報を持つように修正
  rotation: 0, // 現在のミノの回転状況
  hold_tetro_type: null,
  hold_used: false, // １回の落下中にホールド機能を利用したかどうかの状態
  matrix: null,
  score : 0,
  totalLines: 0,
  level: 1,
  combo: 0,
  maxCombo: 0,
  lastClearWasTetris: false,
  backToBackActive: false,
  isTouchingGround : false,
  moveOrRotateCount : 1,
  currentLastYPos: null,
  maxLastYpos: null,
  lockDelay: 500,
};

const ghost = {
  pos: {x:0, y:0},
  matrix: null,
}

function playerReset() {
  player.current_tetro_type = getNextTetromino(); 
  player.matrix = createPiece(player.current_tetro_type);
  player.rotation = 0; // ミノの回転軸を０に戻す
  player.moveOrRotateCount = 1; 
  player.isTouchingGround = false;
  player.pos.y = 0;
  player.pos.x = (arena[0].length/2 | 0 ) - (player.matrix[0].length /2 | 0);
  player.currentLastYPos = lastYPos(player, player.matrix);

  drawNextPieces();

  // // ゲームオーバー
  // 配置直後に衝突判定
  if (collide(arena, player) ) {
    gameOver();
    return false; // ゲームオーバーを示すfalseを返す
  }
  ghostTetrimono();
  return true; // 正常にリセットされたことを示すtrueを返す
}

/*
1. NEXTミノ
———————————–*/

// シャッフル関数（Fisher-Yatesアルゴリズム）でセブンバッグを作り、バッグが空になるまでランダムに取り出す

// テトロミノのリスト。7種類のテトロミノ（テトリスのピース）を配列で定義
const tetrominoes = ['T', 'O', 'L', 'J', 'I', 'S', 'Z'];

// 次に出現するピースを保持するための配列
let nextPieces = [];

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
  return shuffle([...tetrominoes]);
}

// 次のテトロミノを取得する関数（ゲーム開始時とミノがロックされた時に呼び出す）
function getNextTetromino() {
    // Player＋Next＋後続5つ、計7つ常に表示されている（ゲームスタート時、これで7-bagを使い切っている）
    // ミノがロックされnextPiecesの先頭がPlayerに渡されたら、新たに表示される後続5つ目用に新たに7-bagを作る必要がある

    // 残りのピースが7個以下になったら、新しい7-bagを生成して追加
    if (nextPieces.length <= 7) {
        // concatメソッドで、2つの配列を結合して新しい配列を作る（nextPiecesを上書き）
        nextPieces = nextPieces.concat(generateSevenBag());
    }

    // shiftメソッドで、配列の先頭からピースを1つ取り出して返す
    return nextPieces.shift();
}

// ゲーム開始時に次のピースを生成
nextPieces = generateSevenBag(); 

// 流れ
// nextPieces -> getNextTetromino{nextPieces.shiftをreturn} -> createPiece(getNextTetromino()) -> player.matrix


/*
NEXT表示システム
———————————–*/


// 次に来るピースを描画する関数
function drawNextPieces() {
  // キャンバスの取得
  const nextCanvas = document.getElementById('nextPiece');
  const ctx = nextCanvas.getContext('2d');
  const followingCanvas = document.getElementById('followingPieces');
  const flwCtx = followingCanvas.getContext('2d');
  
  // キャンバスを黒色でクリア
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

  // キャンバスを黒色でクリア
  flwCtx.fillStyle = '#000';
  flwCtx.fillRect(0, 0, followingCanvas.width, followingCanvas.height);
  
  // 次に来るピースを描画（大きく表示）
  const nextPiece = createPiece(nextPieces[0]); // 配列の最初のピースを取得
  drawPiece(ctx, nextPiece, 20, 8, 20); // x=20, y=8の位置に、サイズ20で描画
  
  // 残りのピースをまとめて描画（小さく表示）
  const remainingPieces = nextPieces.slice(1, 6); // 2番目から6番目までのピースを取得
  const startY = 5; // 残りのピース表示開始のY座標
  
  // 残りの各ピースを順番に描画
  remainingPieces.forEach((pieceType, index) => {
      const piece = createPiece(pieceType);
      // x=30, y=startY + index * 55の位置に、サイズ12で描画
      drawPiece(flwCtx, piece, 32, startY + index * 55, 12);
  });
}

// 次に来るピース群を描画するヘルパー関数
// パラメータの説明
// ctx: 描画コンテキスト
// piece: ピースの形状を表す2次元配列
// startX: 描画開始X座標
// startY: 描画開始Y座標
// blockSize: 1ブロックのサイズ（ピクセル）

function drawPiece(ctx, piece, startX, startY, blockSize) {
  piece.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = "rgb(" + colors[value] + ")";
        ctx.fillRect(startX + x * blockSize, startY + y * blockSize, blockSize, blockSize);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(startX + x * blockSize, startY + y * blockSize, blockSize, blockSize);
      }
    });
  });
}

function collide(arena, player){ // 現在表示しているミノとフィールドの衝突判定　衝突したらTrue　x座標の判定してる？
  const [m, o] = [player.matrix, player.pos]; // 分割代入
  for (let y = 0; y < m.length; y++){
    for (let x = 0; x < m[y].length; x++){
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0 ){ // 要確認
      return true
      }
    }
  }
  return false
}

function playerMove(dir) { // 左右に現在地を移動する
  let temp = player.pos.x 
  player.pos.x += dir;

  if(collide(arena, player)){
    player.pos.x -= dir
  }
  ghostTetrimono()
  if (player.isTouchingGround && temp != player.pos.x) { // ミノが床に接した後に移動が成功した場合に移動リセットを行う
    moveReset();
  }
  play_sounds(move_sound)
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0){
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
  play_sounds(drop_sound)
}

let currentTime;
let lastTime = 0;

// ゲームを停止するために使うアニメーションフレームID
let animationId;

function playerDrop(){
  player.pos.y++ 
  lastTime = currentTime;
  player.currentLastYPos = lastYPos(player, player.matrix);
  if (player.isTouchingGround) { 
    if (player.maxLastYpos < player.currentLastYPos){// 床に一度接した後横移動等でブロックと床の接触状態が変わる場合の処理
      player.isTouchingGround = false;
      player.moveOrRotateCount = 1;
    } 
    if (player.moveOrRotateCount > 15 && (player.pos.x == ghost.pos.x && player.pos.y == ghost.pos.y)){ // 16回以上リセットしていた場合１マス下げてロックダウン
      player.pos.y++;
    }
  }
  if (player.pos.x == ghost.pos.x && player.pos.y == ghost.pos.y) { // 接触判定を切り替える
    player.isTouchingGround = true;
    player.maxLastYpos = player.currentLastYPos;
  }
  if(collide(arena, player)){
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
}


function ghostTetrimono() { //ゴーストの表示位置を設定する
  ghost.matrix = player.matrix;
  ghost.pos.x = player.pos.x;
  ghost.pos.y = player.pos.y
  while (!collide(arena, ghost)) ghost.pos.y++;
  while (collide(arena,ghost)) ghost.pos.y--;
}

function playerHardDrop() {
  while (player.pos.y < ghost.pos.y) player.pos.y++
  merge(arena,player)
  draw()
  arenaSweep()
  if (!playerReset()) {
    // playerResetがfalseを返した場合（ゲームオーバー時）、ここで処理を終了
    return;
  }
  // arenaSweep()
  updateScore()
  player.hold_used = false;
  currentTime = 0
  
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
      if(collision_on_rotate(player.pos.x, player.pos.y, new_tetro)){
        afterRotate(new_tetro);
      } else { // 通常の動作で回転できない時SRSで判定する
        clockwisSrs(player.current_tetro_type); 
      }
      break;
    case 'Shift': // Shiftを押した時の処理
      if (gameActive) {
        if(!player.hold_used){
          player_reset_after_hold();
        }
      }
      break;
  }
});


/*
2. ライン消去とスコアシステム
———————————–*/

// フィールド内の完成した行を削除し、スコアを更新する関数
function arenaSweep() {
  // 消した行数をカウントする変数
  let linesCleared = 0;
  let perfectClear = true; 

  // 外側のループ（y軸方向）の設定：配列の一番下から上まで、1行ずつ確認
  outer: for (let y = arena.length - 1; y >= 0; --y) { // 内側のループを効率的に抜け出すため、ラベル付きループを使用
      // 内側のループ（x軸方向）の設定：0から最後のインデックスまで
      for (let x = 0; x < arena[y].length; ++x) {
          // マスの確認とスキップ処理
          if (arena[y][x] === 0) {
              continue outer; // 空白(0)があれば、その行をスキップして次の行へ
          }
      }

      // 行の削除と新しい行の追加
      // splice(開始位置, 削除する要素数)で行を削除、[index]で取り出し、fill(value)で埋める
      const row = arena.splice(y, 1)[0].fill(0); 
      arena.unshift(row); // 0で埋めた行rowを、unshiftで一番上（配列の先頭）に追加
      ++y; // 行を削除したことで落ちてきた分の行もチェックするため
      ++linesCleared; // スコア計算に使用するため、消した行数をカウントする
      ++player.combo;
  }

  if (linesCleared > 0) {
    // ライン消去後にパーフェクトクリア判定
    let perfectClear = true;
    // フィールド全体をチェック
    checkPerfect: for (let y = 0; y < arena.length; y++) {
        for (let x = 0; x < arena[y].length; x++) {
            if (arena[y][x] !== 0) {
                perfectClear = false;
                break checkPerfect;
            }
        }
    }

    // 基本スコア計算
    const baseScores = {
      1: 100,
      2: 300,
      3: 500,
      4: 800
    };

    // パーフェクトクリア時の特別スコア
    const perfectClearScores = {
      1: 900,
      2: 1500,
      3: 2300,
      4: 2800
    };

    // Back to Back状態の更新
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
    
    // コンボボーナス計算（連続でライン消しした場合）
    player.combo = (player.combo || 0) + 1;  // 連続クリア回数をカウント
    const comboBonus = player.combo > 1 ? Math.floor(50 * (player.combo - 1)) : 0;

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

// スコアを更新する関数
function updateScore() {
  // スコアをHTMLドキュメントの#score要素に反映
  /// querySelector('#score')でHTML内のid="score"の要素を取得
  /// innerTextでその要素のテキストを更新
  /// player.scoreの値を画面に反映させる
  document.querySelector('#score').innerText = player.score;
  document.querySelector('#lines').innerText = player.totalLines;
}

const baseSpeed = 1000; // 基準速度: 1秒 = 1000ミリ秒

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
      return baseSpeed;
  }
  
  const base = 0.8 - ((level - 1) * 0.007);
  const power = level - 1;
  const speedMultiplier = Math.pow(base, power);
  
  // 最小速度（7ミリ秒）を下回らないようにする
  return Math.max(baseSpeed * speedMultiplier, 7);
}

// レベル表示を更新する関数
function updateLevel() {
  document.querySelector('#level').innerText = player.level;
}

// arenaSweep()とupdateScore()は、ピースをロックする関数に組み込む
// 未実装：コンボ、ハードドロップによるボーナス

/*
// ゲーム開始時に次のピースを生成
nextPieces = generateSevenBag(); 
playerReset()
update()
*/


/*
3. Game Over
———————————–*/

// ゲーム状態の管理
let gameActive = true;    // ゲームの状態を管理するためのグローバル変数

// ゲームオーバー時の処理、アニメーションを停止し、リスタートボタンを表示
function gameOver() {
  gameActive = false; // ゲームの状態を非アクティブに設定
  cancelAnimationFrame(animationId); // ゲームループを停止
  document.getElementById('pauseButton').style.display = 'none'; // 一時停止、再開ボタンを非表示にする
  document.getElementById('restartButton').style.display = 'block'; // リスタートボタンを表示
  drawGameOver();  // ゲームオーバー表示を描画
}

function gameStart() {
  document.getElementById('startButton').style.display = 'block'; // スタートボタンを表示
  drawGameStart(); // ゲームオーバー表示を描画
  context.restore()
  play_sounds(bgm_sound)
}

// ミノがロックされ、新しいミノが表示された時点で呼び出して判定する。


// ゲームオーバー画面の描画
// canvasが二つに増えたため、グローバルのcanvas（Tetris）を指定。（将来的にはクラスで分けたい）
function drawGameOver() {
  context.save();  // 現在の描画状態を保存
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = 'rgba(0, 0, 0, 0.75)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#FF0000';
  context.font = 'bold 30px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);

  context.fillStyle = '#FFFFFF';
  context.font = '24px Arial';
  context.fillText(`Score: ${player.score}`, canvas.width / 2, canvas.height / 2 + 10);
  context.fillText(`Level: ${player.level}`, canvas.width / 2, canvas.height / 2 + 40);
  context.fillText(`Lines: ${player.totalLines}`, canvas.width / 2, canvas.height / 2 + 70);

  context.restore();  // 描画状態を元に戻す

}

// ゲームスタート画面の描画
// canvasが二つに増えたため、グローバルのcanvas（Tetris）を指定。（将来的にはクラスで分けたい）

function drawGameStart() {
  context.save();  // 現在の描画状態を保存
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = 'rgba(0, 0, 0, 0.75)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#00FF00';
  context.font = 'bold 36px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('TETRIS', canvas.width / 2, canvas.height / 2 - 30);

  context.fillStyle = '#FFFFFF';
  context.font = '18px Arial';
  context.fillText('Press Start to Play!', canvas.width / 2, canvas.height / 2 + 20);

  context.restore();
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
  // 落下速度をリセット
  dropInterval = calculateDropInterval(player.level);
  // ホールドしているテトロミノをリセット
  player.hold_tetro_type = null;
  clear_hold_field();
  // スコアとレベル表示を更新
  updateScore();
  updateLevel();
  // ピースをシャッフルし直す
  nextPieces = shuffle([...tetrominoes])
  // プレイヤーのピースをリセット
  playerReset();
  // アニメーションのタイマーをリセット
  currentTime = 0;
  // ゲームを再開
  update();
  // リスタートボタンを非表示にする
  document.getElementById('restartButton').style.display = 'none';
  document.getElementById('startButton').style.display = 'none';
  // 一時停止・再開ボタンを表示する
  document.getElementById('pauseButton').style.display = 'block';
  play_bgm(bgm_sound)
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
      draw() 
    } else {
      if (currentTime - lastTime > Math.floor(dropInterval/2)) { // ミノが床に接している時は通常速度の半分
        playerDrop();
  
        if (collide(arena, player)) {
          return;
        }
  
        lastTime = currentTime;
      }
      draw() 
    }
  }
  animationId = requestAnimationFrame(update)
}


// リスタートボタンがクリックされたときにrestartGame関数を実行
document.getElementById('restartButton').addEventListener('click', restartGame);
document.getElementById('startButton').addEventListener('click', restartGame);


// 一時停止・再開ボタン
document.getElementById("pauseButton").addEventListener("click", function(){
  pauseGame();
  document.getElementById("pauseButton").blur(); // ボタンからフォーカスを外す 
})
// 一時停止・再開の処理
function pauseGame(){
  if (gameActive) {
    // 一時停止処理
    gameActive = false;
    cancelAnimationFrame(animationId); // アニメーションフレームの停止
    document.getElementById("pauseButton").innerText = "Resume"; // ボタンのテキストを「Resume」に変更
    pause_bgm(bgm_sound);
  } else {
    // ゲームを再開
    gameActive = true;
    update(); // ゲーム更新を再開
    document.getElementById("pauseButton").innerText = "Pause"; //  ボタンのテキストをPauseに戻す
    play_bgm(bgm_sound);
  }
}


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
    gameStart();
  } catch (err){
    console.log(err);
  }
}

const canvasHold = new CanvasHold("hold_canvas", 20, 5, 5);
loading();

