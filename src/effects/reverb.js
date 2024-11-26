import { BaseNode, ctx } from '../base';
import { onBufferLoad } from '../resources';

export class Convolver extends BaseNode {
  constructor(src, dry = 1, wet = 1) {
    super(ctx.createGain(), ctx.createGain(), false);
    this.conv = ctx.createConvolver();
    this.dryGain = ctx.createGain();
    this.wetGain = ctx.createGain();
    this.in.connect(this.conv);
    this.in.connect(this.dryGain);
    this.conv.connect(this.wetGain);
    this.dryGain.connect(this.out);
    this.wetGain.connect(this.out);
    this.dry = dry;
    this.wet = wet;
    onBufferLoad(src, buffer => {
      this.conv.buffer = buffer;
    });
  }
  set dry(v) {
    this.dryGain.gain.value = v;
  }
  set wet(v) {
    this.wetGain.gain.value = v;
  }
  get dry() {
    return this.dryGain.gain.value;
  }
  get wet() {
    return this.wetGain.gain.value;
  }
}