registerProcessor(
  'deliver',
  class extends AudioWorkletProcessor {
    process(inputs, ouputs) {
      for(let n = 0; n < inputs.length; n++) {
        for (let m = inputs[n].length; m--;) {
          ouputs[n][m].set(inputs[n][m]);
        }
      }
      return true;
    }
  }
);