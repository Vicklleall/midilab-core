import { ctx } from '../base';
import { onBufferLoad } from '../resources';

export class Convolver {
  constructor(src, dry = 1, wet = 1) {
    this.conv = ctx.createConvolver();
    this.dry = ctx.createGain();
    this.dry.gain.value = dry;
    this.wet = ctx.createGain();
    this.wet.gain.value = wet;
    this.conv.connect(this.wet);
    onBufferLoad(src, buffer => {
      this.conv.buffer = buffer;
    });
  }
  _connect(audioNode) {
    audioNode.connect(this.conv);
    audioNode.connect(this.dry);
  }
  _disconnect(audioNode) {
    audioNode.disconnect(this.conv);
    audioNode.disconnect(this.dry);
  }
  connect(node) {
    if (node._connect) {
      node._connect(this.dry);
      node._connect(this.wet);
    } else {
      this.dry.connect(node);
      this.wet.connect(node);
    }
  }
  disconnect(node) {
    if (node._disconnect) {
      node._disconnect(this.dry);
      node._disconnect(this.wet);
    } else {
      this.dry.disconnect(node);
      this.wet.disconnect(node);
    }
  }
}