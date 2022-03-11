const pkg = require('./package.json');

const fs = require('fs/promises');

const { rollup } = require('rollup');
const { minify } = require('terser');

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
  // npm module
  const bundle = await rollup({input: 'src/index'});
  ['esm', 'cjs'].forEach(format => bundle.write({
    file: `lib/dist/${format}.js`,
    format, exports: 'default'
  }));
  // browser
  const { output } = await bundle.generate({format: 'iife', name: 'MidiLabCore'});
  const outputCode = preReplace(output[0].code);
  fs.writeFile('lib/dist/midilab-core.js', outputCode);
  minify(outputCode, terserOptions).then(
    ({code}) => fs.writeFile('lib/dist/midilab-core.min.js', code)
  );
  // package
  delete pkg.scripts;
  delete pkg.devDependencies;
  pkg.type = 'moudle';
  pkg.main = 'dist/cjs.js';
  pkg.module = 'dist/esm.js';
  pkg.browser = 'dist/midilab-core.min.js';
  fs.writeFile('lib/package.json', JSON.stringify(pkg, null, 2));
  fs.copyFile('README.md', 'lib/README.md');
})();
