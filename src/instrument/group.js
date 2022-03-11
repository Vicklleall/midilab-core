import { BaseNode, ctx } from '../base';
import { buffer as bufferPool } from '../resources';

export class Group extends BaseNode {
  constructor() {
    super(new AudioWorkletNode(ctx, 'deliver'), ctx.createGain());
    this.enabled = true;
    this.map = [];
    this.on = [];
    this._gain = 1;
    this.envelope = [];
    this.release = 0.2;
    this.dyn = [0, 127, 128];
    this.xFadeEnable = false;
  }

  set gain(value) {
    if (!this.xFadeEnable) this.out.gain.value = value;
    this._gain = value;
  }
  get gain() {
    return this._gain;
  }

  setDyn(L, M, R) {
    this.dyn[0] = L;
    this.dyn[1] = M;
    this.dyn[2] = R;
  }
  getDyn(v) {
    if (v <= this.dyn[0] || v >= this.dyn[2]) return 0;
    if (v <= this.dyn[1]) return (v - this.dyn[0]) / (this.dyn[1] - this.dyn[0]);
    return (v - this.dyn[1]) / (this.dyn[2] - this.dyn[1]);
  }
  enableXFade() {
    this.xFadeEnable = true;
  }
  disableXFade() {
    this.xFadeEnable = false;
    this.out.gain.value = this._gain;
    this.out.gain.cancelScheduledValues(ctx.currentTime);
  }
  xFade(v, time = 0) {
    if (!time) time = ctx.currentTime;
    this.out.gain.setValueAtTime(this.getDyn(v) * this._gain, time);
  }

  addZone(zone, from, to) {
    for (let i = from; i <= to; i++) this.map[i] = zone;
  }

  playNote(note, time = 0, duration = 0, velocity = 95) {
    const zone = this.map[note];
    if (zone) {
      if (!bufferPool[zone.src]) return;
      let vol = this.xFadeEnable ? 1 : this.getDyn(velocity);
      if (vol <= 0) return;
      const tune = note - zone.root + zone.tune;
      const src = ctx.createBufferSource();
      const envelope = ctx.createGain();
      src.buffer = bufferPool[zone.src];
      src.envelope = envelope;
      if (tune) src.playbackRate.value = 2 ** (tune / 12);
      src.connect(envelope);
      envelope.connect(this.in);
      if (!time) time = ctx.currentTime;
      if (this.envelope.length) {
        envelope.gain.setValueAtTime(0, time);
        for (const point of this.envelope) {
          switch (point.type) {
            case 0:
              envelope.gain.linearRampToValueAtTime(
                point.value * vol, time + point.time
              );
              break;
            case 1:
              envelope.gain.exponentialRampToValueAtTime(
                point.value * vol, time + point.time
              );
              break;
          }
        }
      } else if (vol < 1) {
        envelope.gain.value = vol;
      }
      if (zone.loop) {
        src.loop = true;
        src.loopStart = zone.loopStart;
        src.loopEnd = zone.loopEnd;
      }
      src.start(time, zone.start, zone.duration);
      if (duration) {
        this.releaseNote(src, time + duration);
      } else {
        if (this.on[note]) this.releaseNote(this.on[note], 0);
        this.on[note] = src;
      }
    }
  }
  releaseNote(src, time = 0) {
    if (!time) time = ctx.currentTime;
    src.envelope.gain.cancelScheduledValues(time);
    src.envelope.gain.setTargetAtTime(0, time, this.release / 4);
    src.stop(time + this.release);
  }
}