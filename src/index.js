import { ctx, mainOutput } from './base';

import * as res from './resources';
import * as utils from './utils';

import effects from './effects/index';

import { Output } from './output/index';
import { Instrument } from './instrument/index';

const Core = {
  ctx, mainOutput,
  res, utils, effects,
  Output, Instrument,
  async init() {
    await ctx.audioWorklet.addModule(URL.createObjectURL(
      new Blob([
        "registerProcessor('deliver',class extends AudioWorkletProcessor{process(i,o){for(let n=0;n<i.length;n++)for(let m=i[n].length;m--;)o[n][m].set(i[n][m]);return true}})"
      ], {type: 'text/javascript'})
    ));
    new Output();
  }
};

export default Core;