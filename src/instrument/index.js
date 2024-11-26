import { BaseNode, ctx } from '../base';
import { output as outputs, instrument } from '../resources';

import { Zone } from './zone';
import { Group } from './group';

export class Instrument extends BaseNode {
  constructor(outputId = 0) {
    super(ctx.createGain(), ctx.createGain());
    this.group = [];
    instrument.push(this);
    this.setOutput(outputId);
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

  xFade(value, time) {
    for (const group of this.group) group.xFade(value, time);
  }

  playNote(note, velocity = 95, time = 0, duration = 0) {
    if (time === 0) time = ctx.currentTime;
    for (const group of this.group) {
      if (group.enabled) group.playNote(note, velocity, time, duration);
    }
  }
  releaseNote(note) {
    for (const group of this.group) {
      if (group.enabled) group.releaseNote(note);
    }
  }

  static Zone = Zone;
  static Group = Group;
}