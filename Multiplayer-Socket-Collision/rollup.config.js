import resolve from '@rollup/plugin-node-resolve';

export default {
  input: './app3.js',
  output: [
    {
      format: 'esm',
      file: './bundle.js'
    },
  ],
  plugins: [
    resolve(),
  ]
};