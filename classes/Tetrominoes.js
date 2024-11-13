export class Tetrominoes {
    constructor() {
        this.tetrominoes = ['T', 'O', 'L', 'J', 'I', 'S', 'Z'];
        this.nextPieces = this.generateSevenBag();
    }
    createPiece(type) {
        if (type === 'T') {
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

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    generateSevenBag() {
        return this.shuffle([...this.tetrominoes]);
    }

    getNextTetromino() {
        if (this.nextPieces.length <= 7) {
            this.nextPieces = this.nextPieces.concat(this.generateSevenBag());
        }
        return this.nextPieces.shift();
    }

    resetPieces() {
        this.nextPieces = this.generateSevenBag();
    }

    rotate(current_tetro) {
        let new_tetro = [];
        let current_tetro_size = current_tetro.length;
        for (let y = 0; y < current_tetro_size; y++) {
            new_tetro[y] = [];
            for (let x = 0; x < current_tetro_size; x++) {
                new_tetro[y][x] = current_tetro[current_tetro_size - x - 1][y];
            }
        }
        return new_tetro;
    }

    clockwisSrs(tetroType, player, rotatedTetro, arena) {
        let xPos = player.pos.x
        let yPos = player.pos.y
        if (tetroType == "I") {
            if (player.rotation == 0) {
                if (this.collision_on_rotate(xPos - 2, yPos, rotatedTetro)) {
                    player.pos.x = xPos - 2
                    player.pos.y = yPos
                } else if (this.collision_on_rotate(xPos + 1, yPos, rotatedTetro)) {
                    player.pos.x = xPos + 1
                    player.pos.y = yPos
                } else if (this.collision_on_rotate(xPos - 2, yPos + 1, rotatedTetro)) {
                    player.pos.x = xPos - 2
                    player.pos.y = yPos + 1
                } else if (this.collision_on_rotate(xPos + 1, yPos - 2, rotatedTetro)) {
                    player.pos.x = xPos + 1
                    player.pos.y = yPos - 2
                } else {
                    return;
                }
                this.afterRotate(rotatedTetro);
            } else if (player.rotation == 1) {
                if (this.collision_on_rotate(xPos - 1, yPos, rotatedTetro)) {
                    player.pos.x = xPos - 1
                    player.pos.y = yPos
                } else if (this.collision_on_rotate(xPos + 2, yPos, rotatedTetro)) {
                    player.pos.x = xPos + 2
                    player.pos.y = yPos
                } else if (this.collision_on_rotate(xPos - 1, yPos - 2, rotatedTetro)) {
                    player.pos.x = xPos - 1
                    player.pos.y = yPos - 2
                } else if (this.collision_on_rotate(xPos + 2, yPos + 1, rotatedTetro)) {
                    player.pos.x = xPos + 2
                    player.pos.y = yPos + 1
                } else {
                    return;
                }
                this.afterRotate(rotatedTetro);
            } else if (player.rotation == 2) {
                if (this.collision_on_rotate(xPos + 2, yPos, rotatedTetro)) {
                    player.pos.x = xPos + 2
                    player.pos.y = yPos
                } else if (this.collision_on_rotate(xPos - 1, yPos, rotatedTetro)) {
                    player.pos.x = xPos - 1
                    player.pos.y = yPos
                } else if (this.collision_on_rotate(xPos + 2, yPos - 1, rotatedTetro)) {
                    player.pos.x = xPos + 2
                    player.pos.y = yPos - 1
                } else if (this.collision_on_rotate(xPos - 1, yPos + 2, rotatedTetro)) {
                    player.pos.x = xPos - 1
                    player.pos.y = yPos + 2
                } else {
                    return;
                }
                this.afterRotate(rotatedTetro);
            } else if (player.rotation == 3) {
                if (this.collision_on_rotate(xPos - 2, yPos, rotatedTetro)) {
                    player.pos.x = xPos - 2
                    player.pos.y = yPos
                } else if (this.collision_on_rotate(xPos + 1, yPos, rotatedTetro)) {
                    player.pos.x = xPos + 1
                    player.pos.y = yPos
                } else if (this.collision_on_rotate(xPos + 1, yPos + 2, rotatedTetro)) {
                    player.pos.x = xPos + 1
                    player.pos.y = yPos + 2
                } else if (this.collision_on_rotate(xPos - 2, yPos - 1, rotatedTetro)) {
                    player.pos.x = xPos - 2
                    player.pos.y = yPos - 1
                } else {
                    return;
                }
                this.afterRotate(rotatedTetro);
            }
        } else {
            if (player.rotation == 0) {
                if (this.collision_on_rotate(xPos - 1, yPos, rotatedTetro)) {
                    player.pos.x = xPos - 1
                    player.pos.y = yPos
                } else if (this.collision_on_rotate(xPos - 1, yPos - 1, rotatedTetro)) {
                    player.pos.x = xPos - 1
                    player.pos.y = yPos - 1
                } else if (this.collision_on_rotate(xPos, yPos - 2, rotatedTetro)) {
                    player.pos.x = xPos
                    player.pos.y = yPos - 2
                } else if (this.collision_on_rotate(xPos - 1, yPos - 2, rotatedTetro)) {
                    player.pos.x = xPos - 1
                    player.pos.y = yPos - 2
                } else {
                    return;
                }
                this.afterRotate(rotatedTetro);
            } else if (player.rotation == 1) {
                if (this.collision_on_rotate(xPos + 1, yPos, rotatedTetro)) {
                    player.pos.x = xPos + 1
                    player.pos.y = yPos
                } else if (this.collision_on_rotate(xPos + 1, yPos - 1, rotatedTetro)) {
                    player.pos.x = xPos + 1
                    player.pos.y = yPos - 1
                } else if (this.collision_on_rotate(xPos, yPos - 2, rotatedTetro)) {
                    player.pos.x = xPos
                    player.pos.y = yPos - 2
                } else if (this.collision_on_rotate(xPos + 1, yPos - 2, rotatedTetro)) {
                    player.pos.x = xPos + 1
                    player.pos.y = yPos - 2
                } else {
                    return;
                }
                this.afterRotate(rotatedTetro);
            } else if (player.rotation == 2) {
                if (this.collision_on_rotate(xPos + 1, yPos, rotatedTetro)) {
                    player.pos.x = xPos + 1
                    player.pos.y = yPos
                } else if (this.collision_on_rotate(xPos + 1, yPos + 1, rotatedTetro)) {
                    player.pos.x = xPos + 1
                    player.pos.y = yPos + 1
                } else if (this.collision_on_rotate(xPos, yPos - 2, rotatedTetro)) {
                    player.pos.x = xPos
                    player.pos.y = yPos - 2
                } else if (this.collision_on_rotate(xPos + 1, yPos - 2, rotatedTetro)) {
                    player.pos.x = xPos + 1
                    player.pos.y = yPos - 2
                } else {
                    return;
                }
                this.afterRotate(rotatedTetro);
            } else if (player.rotation == 3) {
                if (this.collision_on_rotate(xPos - 1, yPos, rotatedTetro)) {
                    player.pos.x = xPos - 1
                    player.pos.y = yPos
                } else if (this.collision_on_rotate(xPos - 1, yPos - 1, rotatedTetro)) {
                    player.pos.x = xPos - 1
                    player.pos.y = yPos - 1
                } else if (this.collision_on_rotate(xPos, yPos + 2, rotatedTetro)) {
                    player.pos.x = xPos
                    player.pos.y = yPos + 2
                } else if (this.collision_on_rotate(xPos + 1, yPos + 2, rotatedTetro)) {
                    player.pos.x = xPos + 1
                    player.pos.y = yPos + 2
                } else {
                    return;
                }
                this.afterRotate(rotatedTetro);
            }
        }
    }

    afterRotate(player, rotatedTetro) {
        if (!player || !rotatedTetro) {
            console.error('Invalid arguments in afterRotate');
            return false;
        }
        try {
            if (!player.ghost) {
                player.ghost = {
                    pos: { x: player.pos.x, y: player.pos.y },
                    matrix: player.matrix
                };
            }
            
            player.matrix = rotatedTetro;
            player.rotation = (player.rotation + 1) % 4;
            
            if (player.game && player.game.canvas &&
                typeof player.game.canvas.ghostTetrimino === 'function') {
                try {
                    player.game.canvas.ghostTetrimino(player);
                } catch (ghostError) {
                    console.error('Error updating ghost:', ghostError);
                }
            }
            
            if (player.current_tetro_type === "T") {
                player.tSpin = true;
            }
            
            if (player.isTouchingGround && typeof player.moveReset === 'function') {
                player.moveReset();
            }
            return true;
        } catch (error) {
            console.error('Error in afterRotate:', error);
            console.error('Player state:', {
                pos: player.pos,
                ghost: player.ghost,
                matrix: player.matrix,
                rotation: player.rotation
            });
            return false;
        }
    }

    updateRotationAxis() {
        if (player.rotation == 3) {
            player.rotation = 0;
        } else {
            player.rotation += 1;
        }
    }

    collision_on_rotate(current_x, current_y, rotated_tetro, arena) {
        let field_row = arena.length;
        let field_col = arena[0].length;
        let current_tetro_size = rotated_tetro.length;
        for (let y = 0; y < current_tetro_size; y++) {
            for (let x = 0; x < current_tetro_size; x++) {
                if (rotated_tetro[y][x] != 0) {
                    let rotated_x = current_x + x;
                    let rotated_y = current_y + y;
                    
                    if (rotated_y < 0 ||
                        rotated_x < 0 ||
                        rotated_y >= field_row ||
                        rotated_x >= field_col ||
                        arena[rotated_y][rotated_x] != 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}