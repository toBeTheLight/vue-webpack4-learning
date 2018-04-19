const path = require('path')


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
  }
}