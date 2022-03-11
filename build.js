const pkg = require('./package.json');

const fs = require('fs/promises');
const path = require('path');

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

const filePromise = {};
const fileCode = {};
const preReplace = async code => {
  const wait = [];
  code.match(/__INCLUDE__\[[^\]]*\]/g)?.forEach(include => {
    const file = include.slice(13, -2);
    filePromise[file] ??= fs.readFile(path.join('src', file), {encoding: 'utf-8'})
      .then(code => minify(code , terserOptions))
      .then(({code}) => fileCode[file] = code);
    wait.push(filePromise[file]);
  });
  await Promise.all(wait);
  return code.replace(
    /__INCLUDE__\[[^\]]*\]/g,
    include => '`' + fileCode[include.slice(13, -2)] + '`'
  ).replaceAll('var ', 'const ');
};

const ext = {esm: 'mjs', cjs: 'cjs'};

(async function () {
  // npm module
  const bundle = await rollup({input: 'src/index'});
  ['esm', 'cjs'].forEach(async format => {
    const { output } = await bundle.generate({format});
    fs.writeFile(`lib/dist/midilab-core.${ext[format]}`, await preReplace(output[0].code));
  });
  // browser
  const { output } = await bundle.generate({format: 'iife', name: 'MidiLabCore'});
  const outputCode = await preReplace(output[0].code);
  fs.writeFile('lib/dist/midilab-core.js', outputCode);
  minify(outputCode, terserOptions).then(
    ({code}) => fs.writeFile('lib/dist/midilab-core.min.js', code)
  );
  // package
  delete pkg.scripts;
  delete pkg.devDependencies;
  pkg.main = 'dist/midilab-core.cjs';
  pkg.module = 'dist/midilab-core.mjs';
  pkg.browser = 'dist/midilab-core.min.js';
  pkg.exports = {
    import: "./dist/midilab-core.mjs",
    require: "./dist/midilab-core.cjs"
  };
  fs.writeFile('lib/package.json', JSON.stringify(pkg, null, 2));
  fs.copyFile('README.md', 'lib/README.md');
})();
