/**
 * キーイベントのバインディングを初期化する関数。
 */
function initializeKeyBindings() {
    document.addEventListener('keydown', (event) => handleKeydown(event, player, game, mainCanvas));
}

/**
 * キーイベントの処理を行う関数。
 * @param {KeyboardEvent} event - キーボードイベントオブジェクト。
 * @requires playerMove - 外部関数
 * @requires playerDrop - 外部関数
 * @requires playerHardDrop - 外部関数
 * @requires rotate - 外部関数
 * @requires collisionOnRotate - 外部関数
 * @requires afterRotate - 外部関数
 * @requires clockwisSrs - 外部関数
 * @requires playerResetAfterHold - 外部関数
 */
function handleKeydown(event, player, game, mainCanvas) {
    if (!game.gameActive) return;
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
        playerRotate();
        break;
      case 'Shift': // Shiftを押した時の処理
        playerHold(player, mainCanvas);
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

  
