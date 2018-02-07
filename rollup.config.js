// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
import jst from 'rollup-plugin-jst';

export default {
    input: 'src/embed/index.js',
    output: {
        file: 'build/embed.js',
        format: 'iife'
    },
    plugins: [
        jst({
          extensions: ['.html'],
          include: 'src/embed/**.html'
        }),
        commonjs(),
        resolve(),
        buble(),
        uglify()
    ]
};
