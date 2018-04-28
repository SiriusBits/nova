const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: './src/javascript/app.js',
  },
  output: {},
  module: {
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', '.css', '.html'],
  },
  plugins: [
    new CopyWebpackPlugin(
      [
        // Copy directory contents to {output}/to/directory/
        { from: './src/javascript/vendor', to: './vendor' },
      ],
      {
        ignore: [
          // Doesn't copy any files with a txt extension
          '*.txt',
        ],

        // By default, we only copy modified files during
        // a watch or webpack-dev-server build. Setting this
        // to `true` copies all files.
        copyUnmodified: true,
      }
    ),
  ],
};
