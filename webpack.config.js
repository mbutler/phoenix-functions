const path = require("path")

module.exports = {
  mode: 'production',
  entry: "./src/functions.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: '/dist/',
    filename: "phoenix-functions.js",
    library: 'phoenixFunctions',
    libraryTarget: 'umd',
    globalObject: 'typeof self !== \'undefined\' ? self : this'
  },
  externals: {
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["babel-preset-env"]
          }
        }
      }
    ]
  }
}