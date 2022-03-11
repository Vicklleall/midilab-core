export class BaseNode {
  constructor(inNode, outNode, connect = true) {
    this.in = inNode;
    this.out = outNode || inNode;
    if (connect) this.in.connect(this.out);
  }
  _connect(audioNode) {
    audioNode.connect(this.in);
  }
  _disconnect(audioNode) {
    audioNode.disconnect(this.in);
  }
  connect(node) {
    if (node._connect) {
      node._connect(this.out);
    } else {
      this.out.connect(node);
    }
  }
  disconnect(node) {
    if (node._disconnect) {
      node._disconnect(this.out);
    } else {
      this.out.disconnect(node);
    }
  }

  addEffect(eff) {
    this.effects ??= [];
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

export let ctx;
export let mainOutput;

export const init = () => {
  ctx = new AudioContext();
  mainOutput = new BaseNode(ctx.createGain(), ctx.destination);
};
