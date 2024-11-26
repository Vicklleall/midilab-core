import { BaseNode, ctx, mainOutput } from './base';
import { output } from './resources';

export class Output extends BaseNode {
  constructor() {
    super(ctx.createGain(), ctx.createGain());
    this.connect(mainOutput);
    output.push(this);
  }

  set gain(value) {
    this.out.gain.value = value;
  }
  get gain() {
    return this.out.gain.value;
  }
}
