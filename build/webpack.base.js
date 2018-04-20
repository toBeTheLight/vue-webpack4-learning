const path = require('path')
const vueLoaderConfig = require('./vue-loader')
const utils = require('./utils')

module.exports = {
  /**
   * 1. __dirname 为node全局对象，是当前文件所在目录
   * 2. context为 entry和部分插件的前置路径
   */
  context: path.resolve(__dirname, '../'),
  entry: {
    app: './src/main.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: "[name]-[hash:7].js"
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      ...utils.styleLoaders({
        sourceMap: true,
        extract: true,
        usePostCSS: true
      }),
    ]
  }
}