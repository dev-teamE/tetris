export class SoundManager {
    constructor() {
        this.sounds = {
            bgm: null,
            drop: null,
            hold: null,
            clear: null,
            move: null,
            rotate: null,
        };

        this.loadSounds();
    }

    async loadSounds() {
        this.sounds.bgm = await this.load_sounds("bgm");
        this.sounds.drop = await this.load_sounds("drop");
        this.sounds.hold = await this.load_sounds("hold");
        this.sounds.clear = await this.load_sounds("clear");
        this.sounds.move = await this.load_sounds("move");
        this.sounds.rotate = await this.load_sounds("rotate");


        this.bgm_sound = this.sounds.bgm;
        this.drop_sound = this.sounds.drop;
        this.hold_sound = this.sounds.hold;
        this.clear_sound = this.sounds.clear;
        this.move_sound = this.sounds.move;
        this.rotate_sound = this.sounds.rotate;
    }

    async load_sounds(key) {
        const t_sound = new Audio(this.soundsPath[key]);
        t_sound.volume = 1;
        return new Promise((resolve) => {
            t_sound.addEventListener("loadeddata", () => {
                resolve(t_sound);
            });
        });
    }

    play_sounds(sound) {
        sound.currentTime = 0;
        sound.play();
    }

    play_bgm(bgm) {
        if (bgm) {
            bgm.loop = true;
            bgm.currentTime = 0;
            bgm.play();
        }
    }

    pause_bgm(bgm) {
        bgm.pause();
    }

    soundsPath = {
        "bgm": "./assets/Sound Effects/bgm.mp3",
        "drop": "./assets/Sound Effects/drop.mp3",
        "hold": "./assets/Sound Effects/hold.mp3",
        "clear": "./assets/Sound Effects/clear.mp3",
        "move": "./assets/Sound Effects/move.mp3",
        "rotate": "./assets/Sound Effects/rotate.mp3",
    };
}