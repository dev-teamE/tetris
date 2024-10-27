function collisionOnRotate(mainCanvas, currentX, currentY, rotatedTetro){
    let currentTetroSize = rotatedTetro.length; // テトロミノの描画サイズ
    for (let y=0; y<currentTetroSize; y++){
        for (let x=0; x<currentTetroSize; x++){
            if(rotatedTetro[y][x] !=0 ){
                // 回転後のテトリミノの現在地から描画位置
                let rotatedX = currentX + x;
                let rotatedY = currentY + y;
  
                // 回転後のテトリミノが一つでも描画できない位置にある場合falseを返す
                if( rotatedY < 0 || // 描画位置がフィールドの範囲外になる場合
                    rotatedX < 0 || // 描画位置がフィールドの範囲外になる場合
                    rotatedY >= mainCanvas.row || // 描画位置がフィールドの範囲外になる場合
                    rotatedX >= mainCanvas.col || // 描画位置がフィールドの範囲外になる場合
                    mainCanvas.arena[rotatedY][rotatedX] != 0){ // 描画位置にすでにテトリミノが存在する場合
                    return false;
                }
            }
        }
    }
    // 回転後のテトリミノの全てが描画できる場合trueを返す
    return true;
  }