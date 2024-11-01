const Sounds = {
  "bgm": "./assets/Sound Effects/bgm.mp3",
  "drop": "./assets/Sound Effects/drop.mp3",
  "hold": "./assets/Sound Effects/hold.mp3",
  "clear": "./assets/Sound Effects/clear.mp3",
  "move": "./assets/Sound Effects/move.mp3",
  "rotate": "./assets/Sound Effects/rotate.mp3",
};

export async function load_sounds(key) {
  const t_sound = new Audio(Sounds[key]);
  t_sound.volume = 1;

  return new Promise((resolve) => {
    t_sound.addEventListener("loadeddata", () => {
      resolve(t_sound);
    });
  });
}

// サウンドをかける
export function play_sounds(sound) {
  sound.currentTime = 0;
  sound.play();
}

// BGMをかける
export function play_bgm(bgm) {
  bgm.loop = true;
  bgm.currentTime = 0;
  bgm.play()
}

// BGMを止める
export function pause_bgm(bgm) {
  bgm.pause();
}