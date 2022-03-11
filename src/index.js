import { ctx, getCtx } from './base';
import { Output } from './output';

export { BaseNode, ctx, mainOutput } from './base';

export * as res from './resources';
export * as utils from './utils';
export * as effects from './effects/index';

export { Output } from './output';
export { Instrument } from './instrument/index';

export async function init() {
  getCtx();
  await ctx.audioWorklet.addModule(URL.createObjectURL(
    new Blob([__INCLUDE__['processor.js']], {type: 'text/javascript'})
  ));
  new Output();
}