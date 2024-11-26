export class BaseNode {
  constructor(inNode, outNode, connect = true) {
    this.in = inNode;
    this.out = outNode || inNode;
    if (connect && this.in !== this.out) this.in.connect(this.out);
  }

  connect(node) {
    this.out.connect(node.in);
  }
  disconnect(node) {
    this.out.disconnect(node);
  }

  setEffects(...effects) {
    this.effects = effects;
    this.in.disconnect();
    this.in.connect(effects[0].in);
    for (let i = 1; i < effects.length; i++) {
      effects[i - 1].disconnect();
      effects[i - 1].connect(effects[i]);
    }
    effects[effects.length - 1].disconnect();
    effects[effects.length - 1].out.connect(this.out);
  }
}

export let ctx = null;
export let mainOutput = null;

export const getContext = () => {
  ctx = new AudioContext();
  mainOutput = new BaseNode(ctx.createGain(), ctx.destination);
};
