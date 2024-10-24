const canvas = document.querySelector("#tetris");
const context = canvas.getContext("2d");
context.scale(20,20);

// 以下hold機能に関する変数、関数
let hold_canvas = document.getElementById('hold_canvas');
let hold_context = hold_canvas.getContext('2d');
let hold_block_size = 20;
let has_hold = false; // ホールドしているかどうかの判定
hold_context.scale(hold_block_size, hold_block_size);

// ホールドフィールドサイズ
let hold_field_col = 4;
hold_canvas.width = hold_field_col * hold_block_size;
let hold_field_row = 4;
hold_canvas.height = hold_field_col * hold_block_size;
let hold_field = [] // hold_fieldに表示するテトリミノ情報(２次元配列)
function hold_init(){// hold_fieldの初期化する関数
    for(let y=0; y<tetro_size; y++){
        hold_field[y] = [];
        for(let x=0; x<tetro_size; x++){
            hold_field[y].push(0);
        }
    }
}
function draw_hold_field(){ // ホールドフィールドを描画する関数
    for (let y=0; y<hold_field_row; y++){
        for (let x=0; x<hold_field_col; x++){
            if(hold_field[y][x]){
                draw_hold_block(x, y);
            }
        }
    }
}

//以下板垣追記
//現在表示しているテトロミノの２次元配列を受け取り、ホールドフィールドの情報を更新する関数
function update_hold_field(tetromino){ // ホールドフィールドに新しい２次元配列を格納する関数
  has_hold = true;
  tetro_size = tetromino.length;
  hold_init();
  for (let y=0; y<tetro_size; y++){
    hold_field[y] = [];
    for (let x=0; x<tetro_size; x++){
        if(tetromino[y][x]){
            hold_field[y][x] = tetromino[y][x];
        }
    }
  }
}
// ホールドしているテトロミノを表示する関数
// function get_hold(){
//   has_hold = false;
//   player.matrix = 
// }
function draw_hold_block(x, y){ //ホールドフィールドに1ブロックを描画する関数
    let print_x = x * hold_block_size; // 描画するブロックのx座標
    let print_y = y * hold_block_size; // 描画するブロックのy座標

    hold_context.fillStyle = "#FF8E0D" //描画する色
    hold_context.fillRect(print_x, print_y, hold_block_size, hold_block_size);
    hold_context.strokeStyle = 'black';
    hold_context.strokeRect(print_x, print_y, hold_block_size, hold_block_size);
}
// テトリミノの回転時の他ブロックとの衝突判定を行う関数
// true か　false を返す
// 以下引数について
// current_x: 現在の描画位置のx座標
// current_y: 現在の描画位置のy座標
// roteted_tetro: 回転後のテトリミノ描画(2次元配列)
function collision_on_rotate(current_x, current_y,rotated_tetro){
  field_row = arena.length; // プレイフィールドの行数
  field_col = arena[0].length; // プレイフィールドの列数
  current_tetro_size = rotated_tetro.length; // テトロミノの描画サイズ
  for (let y=0; y<current_tetro_size; y++){
      for (let x=0; x<current_tetro_size; x++){
          if(rotated_tetro[y][x] !=0 ){
              // 回転後のテトリミノの現在地から描画位置
              let rotated_x = player.pos.x + x;
              let rotated_y = player.pos.y + y;

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
  return new_tetro;
}

// 上まで板垣追記


const draw = () => {
    context.fillStyle = "#000";
    context.fillRect(0,0, canvas.width, canvas.height);

    // 変更した盤面を映す
    drawMatrix(arena, {x: 0, y: 0})
    drawMatrix(player.matrix, player.pos)
}

// ピースの構造を定義(数字は色のインデックス)
const createPiece = (type) => {
    if (type === 'T'){
        return [
          [0, 0, 0],
          [1, 1, 1],
          [0, 1, 0],      
        ];
    } else if (type === "0") {
        return [
          [2, 2],
          [2, 2],
        ];
    } else if (type === "L") {
        return [
          [0, 3, 0],
          [0, 3, 0],
          [0, 3, 3],
        ];
    } else if (type === "J") {
        return [
          [0, 4, 0],
          [0, 4, 0],
          [4, 4, 0],
        ];
    } else if (type === "I") {
        return [
          [0, 5, 0, 0],
          [0, 5, 0, 0],
          [0, 5, 0, 0],
          [0, 5, 0, 0],
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
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
  ];

/**
 * @param {object} matrix - ピースの形状と配置を表す2次元配列
 * @param {object} offset - ピースの描画位置を指定するオブジェクト. xとyのプロパティを持つ
 */

// ピースを描写する
const drawMatrix = (matrix, offset) => {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0){
                context.fillStyle = colors[value];
                context.fillRect(x+offset.x, y+offset.y, 1, 1);
            }
        });
    });
}

// ２次元配列でテトリスの場所を管理する(12*20)
const arena = Array.from({ length: 20 }, () => Array(12).fill(0));

const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score : 0,
};

function playerReset() {
  player.matrix = createPiece(getNextTetromino());
  player.pos.y = 0;
  // 位置を真ん中にする
  player.pos.x = (arena[0].length/2 | 0 ) - (player.matrix[0].length /2 | 0)
  // // ゲームオーバー
  // if (collide(arena, player))
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

// // ゲーム開始時に次のピースを生成
// nextPieces = generateSevenBag(); 

// 流れ
// nextPieces -> getNextTetromino{nextPieces.shiftをreturn} -> createPiece(getNextTetromino()) -> player.matrix

// 次に来るピースを描画する関数
function drawNextPieces() {
    // キャンバスの取得
    const nextCanvas = document.getElementById('nextPieces');
    const ctx = nextCanvas.getContext('2d');
    
    // キャンバスを黒色でクリア
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    // 次に来るピースを描画（大きく表示）
    const nextPiece = createPiece(nextPieces[0]); // 配列の最初のピースを取得
    drawPiece(ctx, nextPiece, 20, 8, 20); // x=20, y=8の位置に、サイズ20で描画
    
    // 次に来るピースを四角で囲む
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, 90, 90);
    
    // 残りのピースをまとめて描画（小さく表示）
    const remainingPieces = nextPieces.slice(1, 6); // 2番目から6番目までのピースを取得
    const startY = 120; // 残りのピース表示開始のY座標
    ctx.strokeRect(5, startY - 5, 90, 285);  // 残りのピースを囲む四角
    
    // 残りの各ピースを順番に描画
    remainingPieces.forEach((pieceType, index) => {
        const piece = createPiece(pieceType);
        // x=30, y=startY + index * 55の位置に、サイズ12で描画
        drawPiece(ctx, piece, 30, startY + index * 55, 12);
    });
}

function collide(arena, player){
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; y++){
    for (let x = 0; x < m[y].length; x++){
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0 ){
        if (y + o.y <= 0) return true
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
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0){
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
}


let lastTime = 0;
// あとで難易度によって変更する必要がありそう
let dropInterval = 1000;

function update() {

  let currentTime = performance.now()

  if (currentTime - lastTime >= dropInterval) {
    playerDrop();
    lastTime = currentTime;
  }

  draw()
  animationId = requestAnimationFrame(update)
}

function playerDrop(){

  player.pos.y++ 

  if(collide(arena, player)){
    player.pos.y--;
    merge(arena, player)
    playerReset()
    arenaSweep()
  }
}

// function playerHardDrop() {
//   while(!collide(arena,player)){
//     player.pos.y ++ 
//   }
// }


document.addEventListener('keydown', (event) => { 
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
    ハードドロップと回転を入れる
    case 'ArrowUp':
      playerHardDrop();
      break;
    // 板垣追記
    case ' ': // スペースを押した時の処理
      new_tetro = rotate(player.matrix)// 回転後のテトリミノの描画情報new_tetro
      // 回転後のテトリミノの描画位置が他のミノの衝突しない場合のみ、現在のテトロミノの描画を変更する
      if(collision_on_rotate(player.pos.x, player.pos.y, new_tetro)){
        player.matrix = new_tetro;
      }
      break;
    case 'Shift': // Shiftを押した時の処理
      if(hold_field)
        update_hold_field(player.matrix);
        draw_hold_field();
        // 新しいミノを表示する処理を追記する
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
  }
  
  // 消した行数に応じてスコアを加算
  if (linesCleared > 0) {
      const scores = [0, 100, 300, 500, 800];
      // linesClearedはインデックスとして機能
      player.score += scores[linesCleared];
  }
}

// スコアを更新する関数
function updateScore() {
  // スコアをHTMLドキュメントの#score要素に反映
  /// querySelector('#score')でHTML内のid="score"の要素を取得
  /// innerTextでその要素のテキストを更新
  /// player.scoreの値を画面に反映させる
  document.querySelector('#score').innerText = player.score;
}

// arenaSweep()とupdateScore()は、ピースをロックする関数に組み込む
// 未実装：コンボ、ハードドロップによるボーナス

// ゲーム開始時に次のピースを生成
nextPieces = generateSevenBag(); 
playerReset()
update()
