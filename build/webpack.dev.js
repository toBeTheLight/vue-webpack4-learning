'use strict'
const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = merge(baseWebpackConfig, {
  /**
   * development模式下默认启用这些插件
   * NamedChunksPlugin  
   * NamedModulesPlugin // 显示模块的相对路径
   */
  mode: 'development',
  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: 'localhost',
    port: '8080',
    open: true,
    publicPath: '/',
    quiet: true, // necessary for FriendlyErrorsPlugin
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name]-[contenthash].css",
      chunkFilename: "[id]-[contenthash].css"
    }),
    new webpack.HotModuleReplacementPlugin(),
    /**
     * 对应production下HashedModuleIdsPlugin插件
     * 使用路径做模块标识
     */
    // new webpack.NamedModulesPlugin()
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, '../dist/index.html'),// 文件写入路径
      template: path.join(__dirname, '../src/index.html'),// 模板文件路径
      inject: true
    }),
  ]
})
