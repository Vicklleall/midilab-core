import { BaseNode, ctx } from '../base';

export class Filter extends BaseNode {
  constructor(type, freq, Q) {
    super(ctx.createBiquadFilter());
    this.filter = this.in;
    this.filter.type = type;
    if (freq !== undefined) this.filter.frequency.value = freq;
    if (Q !== undefined) this.filter.Q.value = Q;
  }

  set freq(value) {
    this.filter.frequency.value = value;
  }
  set Q(value) {
    this.filter.Q.value = value;
  }
  get freq() {
    return this.filter.frequency.value;
  }
  get Q() {
    return this.filter.Q.value;
  }
}