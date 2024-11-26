import { getContext } from './base';
import { Output } from './output';

export { BaseNode, ctx, mainOutput } from './base';

export * as midi from './midi/index';
export * as res from './resources';
export * as utils from './utils';
export * as effects from './effects/index';

export { Output } from './output';
export { Instrument } from './instrument/index';

export * from './constants';

export async function init() {
  getContext();
  new Output();
}