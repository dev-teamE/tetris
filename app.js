import { load_sounds, pause_bgm, play_bgm, play_sounds } from "./audio.js";

// グローバル変数の定義
let screen, imgJ, imgS, imgI, imgL, imgT, imgZ, imgO, imgs;
let bgm_sound, drop_sound, hold_sound, clear_sound, move_sound, rotate_sound;
let new_tetro,field_row,field_col,current_tetro_size, dropInterval

let canvasHold, canvasNext;


const canvas = document.querySelector("#tetris");
const context = canvas.getContext("2d");
context.scale(25,25);

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

// Canvasクラスの基底クラス
class BaseCanvas {
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

  clearCanvas() {
    this.context.fillStyle = "#000";
    this.context.fillRect(0, 0, this.canvasWidth(), this.canvasHeight());
  }

  getTetroSize(matrix) {
    const size = matrix.length * this.blockSize;
    return size;
  }

  drawTetro(tetroType, scale = 1) {
    const matrix = createPiece(tetroType);
    const pos = calculateDisplayPosition(tetroType, this.canvasWidth(), this.canvasHeight(), this.blockSize);
    
    const tetroSize = this.getTetroSize(matrix);
    const scaledSize = tetroSize * scale;
    
    // ネクストミノズのスケーリングのための調整
    const offset = {
      x: (this.canvasWidth() - scaledSize) / (2 * this.blockSize),
      y: pos.y / this.blockSize
    };

    this.drawMatrix(matrix, offset, scale, tetroSize);
  }

  drawMatrix(matrix, offset, scale = 1, tetroSize) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = tetroSize;
    tempCanvas.height = tetroSize;

    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          tempCtx.drawImage(
            imgs[value],
            x * this.blockSize,
            y * this.blockSize,
            this.blockSize,
            this.blockSize
          );
        }
      });
    });

    const scaledSize = tetroSize * scale;
    this.context.drawImage(
      tempCanvas,
      offset.x * this.blockSize,
      offset.y * this.blockSize,
      scaledSize,
      scaledSize
    );
  }
}

// ホールド用のCanvasクラス
class CanvasHold extends BaseCanvas {
  constructor() {
    super("hold_canvas", 20, 5, 5);
  }
}

// Next表示用のCanvasクラス
class CanvasNext {
  constructor() {
    this.mainNext = new BaseCanvas("nextPiece", 20, 5, 5);
    this.following = new BaseCanvas("followingPieces", 20, 14, 5);
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
      const verticalSpacing = this.following.blockSize * 2.75;
      const yOffset = (i - 1) * verticalSpacing;
      const matrix = createPiece(pieces[i]);
      
      const tetroSize = this.following.getTetroSize(matrix);
      const scaledSize = tetroSize * 0.7;
      
      // 中央配置のための調整（Iミノの場合は特別な位置調整）
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

function draw_hold_field(tetro_type) {
  canvasHold.clearCanvas();
  if (tetro_type) {
    canvasHold.drawTetro(tetro_type);
  }
}

function drawNextPieces() {
  canvasNext.drawNextPieces(nextPieces);
}

function player_reset_after_hold() {
  if(player.hold_tetro_type != null){// 2回目以降のホールド時の処理
    player.hold_used = true;
    let temp = player.current_tetro_type;
    player.current_tetro_type = player.hold_tetro_type;
    player.hold_tetro_type = temp;
    player.rotation = 0;
    player.matrix = createPiece(player.current_tetro_type);
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
      player.matrix = rotatedTetro; // 判定がTrueの場合テトロミノを回転させる
      updateRotationAxis(); // 回転軸を更新する
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
      player.matrix = rotatedTetro; // 判定がTrueの場合テトロミノを回転させる
      updateRotationAxis(); // 回転軸を更新する
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
      player.matrix = rotatedTetro; // 判定がTrueの場合テトロミノを回転させる
      updateRotationAxis(); // 回転軸を更新する
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
      player.matrix = rotatedTetro; // 判定がTrueの場合テトロミノを回転させる
      updateRotationAxis(); // 回転軸を更新する
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
      player.matrix = rotatedTetro; // 判定がTrueの場合テトロミノを回転させる
      updateRotationAxis(); // 回転軸を更新する
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
      player.matrix = rotatedTetro; // 判定がTrueの場合テトロミノを回転させる
      updateRotationAxis(); // 回転軸を更新する
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
      player.matrix = rotatedTetro; // 判定がTrueの場合テトロミノを回転させる
      updateRotationAxis(); // 回転軸を更新する
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
      player.matrix = rotatedTetro; // 判定がTrueの場合テトロミノを回転させる
      updateRotationAxis(); // 回転軸を更新する
    }
  }
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
  highScore: 0,
  isHighScore: false,
  playTime: 0,
  startTime: null // ゲーム開始時刻
};

const ghost = {
  pos: {x:0, y:0},
  matrix: null,
}

function playerReset() {
  player.current_tetro_type = getNextTetromino(); 
  player.matrix = createPiece(player.current_tetro_type);
  player.rotation = 0; // ミノの回転軸を０に戻す
  player.pos.y = 0;
  player.pos.x = (arena[0].length/2 | 0 ) - (player.matrix[0].length /2 | 0);

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


function collide(arena, player){
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; y++){
    for (let x = 0; x < m[y].length; x++){
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0 ){
      return true
      }
    }
  }
  return false
}

function playerMove(dir) {
  
  player.pos.x += dir;

  if(collide(arena, player)){
    player.pos.x -= dir
  }
  ghostTetrimono()
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

  if(collide(arena, player)){
    player.pos.y--;

    arenaSweep()
    merge(arena, player)
    if (!playerReset()) {
      // playerResetがfalseを返した場合（ゲームオーバー時）、ここで処理を終了
      return;
    }
    updateScore()
    player.hold_used = false;
  }
  lastTime = currentTime
}

function ghostTetrimono() {
  ghost.matrix = player.matrix;
  ghost.pos.x = player.pos.x;
  ghost.pos.y = player.pos.y
  while (!collide(arena, ghost)) ghost.pos.y++;
  while (collide(arena,ghost)) ghost.pos.y--
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
        player.matrix = new_tetro;
        updateRotationAxis();
      } else { // 通常の動作で回転できない時SRSで判定する
        clockwisSrs(player.current_tetro_type); 
      }
      ghostTetrimono()
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
    const comboBonus = player.combo > 1 ? Math.floor(50 * (player.combo - 1)) : 0;
    player.combo = (player.combo || 0) + 1;  // 連続クリア回数をカウント

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

// プレイ時間を計算（秒単位）
function getPlayTimeInSeconds() {
  if (!gameActive || !player.startTime) return 0;
  return Math.floor((Date.now() - player.startTime) / 1000);
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
      playTime: playTimeInSeconds
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
  // スコアをHTMLドキュメントの#score要素に反映
  /// querySelector('#score')でHTML内のid="score"の要素を取得
  /// innerTextでその要素のテキストを更新
  /// player.scoreの値を画面に反映させる
  document.querySelector('#score').innerText = player.score;
  document.querySelector('#lines').innerText = player.totalLines;

  // スコアがハイスコアを超えた場合
  if (player.score > player.highScore) {
    saveHighScores(player.score);  // 保存
    player.highScore = getTopScore();  // 1位のスコアを取得
    player.isHighScore = true;
  }

  /*
  // ハイスコア表示を更新
  document.querySelector('#highScore').innerText = player.highScore;
  */
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

// プレイ時間の表示を更新する関数
function updatePlayTime() {
  document.querySelector('#playTime').innerText = formatTime(getPlayTimeInSeconds());
}

// 最短クリア時間の表示（マラソンモードの実装用）
function displayBestTime() {
  const scores = getAllHighScores();
  if (scores.length === 0) return "No records";
  
  const bestTime = Math.min(...scores.map(s => s.playTime));
  return formatTime(bestTime);
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

function gameStart() {
  document.getElementById('startButton').style.display = 'block'; // スタートボタンを表示
  drawGameStart(); // ゲームスタート表示を描画
  context.restore()
  play_sounds(bgm_sound)
}

// ミノがロックされ、新しいミノが表示された時点で呼び出して判定する。


// ゲームオーバー画面の描画
// canvasが二つに増えたため、グローバルのcanvas（Tetris）を指定。（将来的にはクラスで分けたい）
function drawGameOver(finalPlayTime) {
  context.save();  // 現在の描画状態を保存
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = 'rgba(0, 0, 0, 0.75)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#FF0000';
  context.font = 'bold 30px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'bottom';
  context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);

  const timeString = formatTime(finalPlayTime);
  
  context.fillStyle = '#FFFFFF';
  context.font = '24px Arial';
  context.fillText(`Score: ${player.score}`, canvas.width / 2, canvas.height / 2 + 10);
  
  if (player.isHighScore) {
    context.fillStyle = '#00FF00';
    context.fillText(`NEW!!`, canvas.width / 2, canvas.height / 2 + 40);
  } else {
    context.fillStyle = '#FFFFFF';
    context.fillText(`Best: ${player.highScore}`, canvas.width / 2, canvas.height / 2 + 40);
  }

  context.fillStyle = '#FFFFFF';
  context.fillText(`Level: ${player.level}`, canvas.width / 2, canvas.height / 2 + 70);
  context.fillText(`Lines: ${player.totalLines}`, canvas.width / 2, canvas.height / 2 + 100);

  /*
  context.fillText(`Time: ${timeString}`, canvas.width / 2, canvas.height / 2 + 130);
  */
 
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

  // ゲームを再開
  update();

  // リスタートボタンを非表示にする
  document.getElementById('restartButton').style.display = 'none';
  document.getElementById('startButton').style.display = 'none';
  // 一時停止・再開ボタンを表示する
  document.getElementById('pauseButton').style.display = 'block';
  play_bgm(bgm_sound);
}

function update() {
  if (gameActive) { // ゲームが非アクティブな場合は更新を行わない

    currentTime = performance.now()

    if (currentTime - lastTime >= dropInterval) {
      playerDrop();

      if (collide(arena, player)) {
        return;
      }

      lastTime = currentTime;
    }
    updatePlayTime();
    draw() 
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

let pauseStartTime = null;

// 一時停止・再開の処理
function pauseGame(){
  if (gameActive) {
    // 一時停止処理
    gameActive = false;
    cancelAnimationFrame(animationId); // アニメーションフレームの停止
    document.getElementById("pauseButton").innerText = "Resume"; // ボタンのテキストを「Resume」に変更
    pause_bgm(bgm_sound);
    pauseStartTime = Date.now();
  } else {
    // ゲームを再開
    gameActive = true;
    const pauseDuration = Date.now() - pauseStartTime;
    player.startTime += pauseDuration;  // 開始時刻を一時停止時間分ずらす
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

    // Canvas初期化
    canvasHold = new CanvasHold();
    canvasNext = new CanvasNext();
    
    // ハイスコアの初期読み込みと表示
    player.highScore = getTopScore();
    /*
    document.querySelector('#highScore').innerText = player.highScore;
    */

    // 初期表示
    gameStart();
    drawNextPieces(); // Next表示の初期化
    draw_hold_field(null); // Hold表示の初期化

  } catch (err){
    console.log(err);
  }
}

loading();

