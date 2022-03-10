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
}

export const ctx = new AudioContext();

export const mainOutput = new BaseNode(ctx.createGain(), ctx.destination);
