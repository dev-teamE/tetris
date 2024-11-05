export class Tetro {
    constructor() {
        this.types = ['T', 'O', 'L', 'J', 'I', 'S', 'Z'];

        this.colors = [
            null,
            [210, 66, 255],
            [255, 229, 1],
            [255, 165, 63],
            [15, 75, 215],
            [112, 226, 254],
            [57, 231, 95],
            [220, 0, 0],
        ];

        this.imgs = [null];
        this.imgT = null;
        this.imgO = null;
        this.imgL = null;
        this.imgJ = null;
        this.imgI = null;
        this.imgS = null;
        this.imgZ = null;
    }
}