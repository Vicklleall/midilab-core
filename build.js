const fs = require('fs/promises');

const { rollup } = require('rollup');
const { minify } = require('terser');

const dist = 'dist';

const rollupInputOptions = {
  input: 'src/index'
};
const rollupOutputOptions = {
  file: 'midilab-core',
  format: 'iife',
  name: 'MidiLabCore'
};
const ECMA = 2021;
const terserOptions = {
  compress: {
    passes: 2,
    unsafe_arrows: ECMA >= 2015,
    unsafe_methods: ECMA >= 2015,
    keep_infinity: true
  },
  mangle: true,
  format: {
    wrap_func_args: false,
    keep_quoted_props: true
  },
  ecma: ECMA
};

const preReplace = code => code.replaceAll('var ', 'const ');

(async function () {
  const bundle = await rollup(rollupInputOptions);
  const { output } = await bundle.generate(rollupOutputOptions);
  for (const {fileName, code} of output) {
    const outputCode = preReplace(code);
    fs.writeFile(`${dist}/${fileName}.js`, outputCode);
    minify(outputCode, terserOptions).then(
      ({code}) => fs.writeFile(`${dist}/${fileName}.min.js`, code)
    );
  }
})();
