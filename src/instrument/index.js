import { BaseNode, ctx } from '../base';
import { output as outputs, instrument } from '../resources';

import { Zone } from './zone';
import { Group } from './group';

export class Instrument extends BaseNode {
  constructor(outputId = 0) {
    super(new AudioWorkletNode(ctx, 'deliver'), ctx.createGain());
    this.setOutput(outputId);
    this.group = [];
    this.dyn = 127;
    instrument.push(this);
  }

  setOutput(outputId) {
    const output = outputs[outputId];
    if (this.output) this.disconnect(this.output);
    this.connect(output);
    this.output = output;
  }

  createGroup() {
    const group = new Group();
    group.connect(this);
    this.group.push(group);
    return group;
  }

  xFade(v, time = 0) {
    this.dyn = v;
    for (const group of this.group) {
      if (group.enabled && group.xFadeEnable) group.xFade(v, time);
    }
  }

  playNote(note, time = 0, duration = 0, velocity = this.dyn) {
    for (const group of this.group) {
      if (group.enabled) group.playNote(note, time, duration, velocity);
    }
  }
  releaseNote(note, time = 0) {
    for (const group of this.group) {
      const src = group.on[note]
      if (src) {
        group.releaseNote(src, time);
        group.on[note] = null;
      }
    }
  }

  static Zone = Zone;
  static Group = Group;
}