const canvas = document.querySelector("#tetris");
const context = canvas.getContext("2d");
context.scale(20,20);

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
  // 一時的なものあとで動的なものに変更する
  matrix: createPiece('T'),
  score : 0,
};

function playerReset() {
　//あとで変える   
  player.matrix = randomMatrix;
  player.pos.y = 0;
  // 位置を真ん中にする
  player.pos.x = (arena[0].length/2 | 0 ) - (player.matrix[0].length /2 | 0)
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
    cancelAnimationFrame(animationId)
  }
}


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
    // ハードドロップと回転を入れる
    // case 'ArrowUp':
    //   movePiece();
    //   break;
  }
});
  

update()
