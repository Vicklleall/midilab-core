export class Zone {
  constructor(src, root, tune = 0, start = 0, duration = 0) {
    this.src = src;
    this.root = root;
    this.tune = tune;
    this.start = start;
    this.duration = duration;
    this.loop = false;
    this.loopStart = 0;
    this.loopEnd = 0;
  }
};