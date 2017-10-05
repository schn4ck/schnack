// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';
import string from 'rollup-plugin-string';
import uglify from 'rollup-plugin-uglify';

export default {
  input: 'src/embed.js',
  output: {
    file: 'build/embed.js',
    format: 'iife'
  },
  plugins: [
    string({include: 'src/*.html'}),
    commonjs(),
    resolve(),
    buble(),
    uglify()
  ]
};