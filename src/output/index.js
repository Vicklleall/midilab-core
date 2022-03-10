import { BaseNode, ctx, mainOutput } from '../base';
import { output } from '../resources';

export class Output extends BaseNode {
  constructor() {
    super(new AudioWorkletNode(ctx, 'deliver'), ctx.createGain());
    this.connect(mainOutput);
    output.push(this);

    this.effects = [];
  }

  set gain(value) {
    this.out.gain.value = value;
  }
  get gain() {
    return this.out.gain.value;
  }

  addEffect(eff) {
    if (this.effects.length) {
      const prevNode = this.effects[this.effects.length - 1];
      prevNode.disconnect(this.out);
      prevNode.connect(eff);
      eff.connect(this.out);
      this.effects.push(eff);
    } else {
      this.in.disconnect(this.out);
      eff._connect(this.in);
      eff.connect(this.out);
    }
  }
}
