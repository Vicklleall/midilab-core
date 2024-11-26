import { BaseNode, ctx } from '../base';
import { buffer as bufferPool } from '../resources';
import { EXPONENTIAL, EVENT_CHECK_XFADE } from '../constants';
import { scheduleCheckEvent } from '../scheduler';

export class Group extends BaseNode {
  constructor() {
    super(ctx.createGain(), ctx.createGain());
    this.enabled = true;
    this.map = [];
    this.envelope = [];
    this.release = 0.2;
    this.dynamics = [0, 127, 128];
    this.xFadeEnabled = false;
    this.xFadeNote = new Set();
    this.onNote = [];
    this._pedal = false;
    this.pedalNote = new Set();
  }

  set gain(value) {
    this.out.gain.value = value;
  }
  get gain() {
    return this.out.gain.value;
  }

  set pedalOn(value) {
    this._pedal = value;
    if (!value && this.pedalNote.size) {
      for (const src of this.pedalNote) {
        if (src.dynamics) this.xFadeNote.delete(src);
        this.noteOff(src);
      }
    }
  }
  get pedalOn() {
    return this._pedal;
  }

  setDynamics(L, M, R) {
    this.dynamics[0] = L;
    this.dynamics[1] = M;
    this.dynamics[2] = R;
  }
  getDynamics(v) {
    if (v <= this.dynamics[0] || v >= this.dynamics[2]) return 0;
    if (v <= this.dynamics[1]) return (v - this.dynamics[0]) / (this.dynamics[1] - this.dynamics[0]);
    return 1 - (v - this.dynamics[1]) / (this.dynamics[2] - this.dynamics[1]);
  }

  addZone(zone, from, to) {
    for (let i = from; i <= to; i++) this.map[i] = zone;
  }

  xFade(value, time) {
    if (this.xFadeEnabled) {
      let vol = this.getDynamics(value);
      for (const src of this.xFadeNote) {
        if (time < src.stopTime) {
          src.dynamics.gain.setValueAtTime(vol, time);
        }
      }
    }
  }

  setXFadeCheck(time) {
    if (this.xFadeEnabled) {
      scheduleCheckEvent(this, EVENT_CHECK_XFADE, time);
    }
  }
  checkXFade() {
    const time = ctx.currentTime;
    for (const src of this.xFadeNote) {
      if (time >= src.stopTime) this.xFadeNote.delete(src);
    }
  }

  playNote(note, velocity, time, duration) {
    const zone = this.map[note];
    if (zone) {
      if (!bufferPool[zone.src]) return;
      let vol = this.xFadeEnabled ? 1 : this.getDynamics(velocity);
      if (vol <= 0) return;
      const tune = note - zone.root + zone.tune;
      const src = ctx.createBufferSource();
      const envelope = ctx.createGain();
      src.buffer = bufferPool[zone.src];
      src.envelope = envelope;
      src.connect(envelope);
      if (this.xFadeEnabled) {
        const dynamics = ctx.createGain();
        src.dynamics = dynamics;
        envelope.connect(dynamics);
        dynamics.connect(this.in);
        this.xFadeNote.add(src);
      } else {
        envelope.connect(this.in);
      }
      if (tune) src.playbackRate.value = 2 ** (tune / 12);
      if (this.envelope.length) {
        envelope.gain.setValueAtTime(0, time);
        for (const point of this.envelope) {
          if (point.type === EXPONENTIAL) {
            envelope.gain.exponentialRampToValueAtTime(point.value * vol, time + point.time);
          } else {
            envelope.gain.linearRampToValueAtTime(point.value * vol, time + point.time);
          }
        }
      } else {
        envelope.gain.value = vol;
      }
      if (zone.loop) {
        src.loop = true;
        src.loopStart = zone.loopStart;
        src.loopEnd = zone.loopEnd;
      }
      src.start(time, zone.start, zone.duration);
      if (duration) {
        this.noteOff(src, time + duration);
        this.setXFadeCheck(time + duration);
      } else {
        src.stopTime = Infinity;
        this.releaseNote(note);
        this.onNote[note] = src;
      }
    }
  }
  noteOff(src, time = ctx.currentTime) {
    src.stopTime = time;
    src.dynamics?.gain.cancelAndHoldAtTime(time);
    src.envelope.gain.cancelAndHoldAtTime(time);
    src.envelope.gain.setTargetAtTime(0, time, this.release / 4);
    src.stop(time + this.release);
  }
  releaseNote(note) {
    const src = this.onNote[note];
    if (src) {
      if (this.pedalOn) {
        this.pedalNote.add(src);
      } else {
        if (src.dynamics) this.xFadeNote.delete(src);
        this.noteOff(src);
      }
      this.onNote[note] = null;
    }
  }
}