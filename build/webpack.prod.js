const webpackBaseConfig = require('./webpack.base')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = merge(webpackBaseConfig, {
  plugins: [
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, '../dist/index.html'),// 文件写入路径
      template: path.join(__dirname, '../src/index.html'),// 模板文件路径
      inject: true // 插入位置
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ],
  /**
   * 暂时不知道具体配置信息
   */
  optimization: {
    splitChunks: {
      chunks: "all",
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
    },
    runtimeChunk: true
  }
})