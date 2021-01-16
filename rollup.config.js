// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import buble from '@rollup/plugin-buble';
import { terser } from "rollup-plugin-terser";
import jst from 'rollup-plugin-jst';

const plugins = [
    jst({
      extensions: ['.html'],
      include: 'src/embed/**.html'
    }),
    commonjs(),
    nodeResolve(),
    buble(),
    terser()
];

export default [{
    input: 'src/embed/index.js',
    output: {
        file: 'build/embed.js',
        format: 'iife'
    },
    plugins
}, {
    input: 'src/embed/client.js',
    output: {
        file: 'build/client.js',
        format: 'umd',
        name: 'Schnack'
    },
    plugins
}];
