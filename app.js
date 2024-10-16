const canvas = document.querySelector("#tetris");
const context = canvas.getContext("2d");
context.scale(20,20);

const draw = () => {
    context.fillStyle = "#000";
    context.fillRect(0,0, canvas.width, canvas.height);
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

drawMatrix(createPiece('T'), { x: 5, y: 5 });
