////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2023.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
const resolve = require('path').resolve;
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { merge } = require('webpack-merge');

const commonConfig = {
  entry: resolve(__dirname, 'main.js'),
  output: {
    filename: 'common-geometry.min.js',
    library: {
      name: 'common-geometry',
      type: 'umd',
    },
    globalObject: 'this',
  },
  devtool: 'source-map',
  mode: 'production',
  stats: 'summary',
  target: ['web', 'es5'],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_debugger: true,
            drop_console: true,
            // pure_funcs: ['console.log'],
          },
        },
      }),
    ],
  },
  module: {
    rules: [{
      test: /\.js$/,
      include: [
        resolve(__dirname, 'main.js'),
        resolve(__dirname, 'src'),
      ],
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
        babelrc: false,         // replace .babelrc with babel.config.json
        rootMode: 'upward',
      },
    }],
  },
};

const analyzerConfig = {
  plugins: [
    new BundleAnalyzerPlugin(),
  ],
};

module.exports = (process.env.USE_ANALYZER ? merge(commonConfig, analyzerConfig) : commonConfig);
