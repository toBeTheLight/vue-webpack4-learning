'use strict'
const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = merge(baseWebpackConfig, {
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
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new webpack.HotModuleReplacementPlugin(),
    // new webpack.NamedModulesPlugin(), mode:development下自动启用
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, '../dist/index.html'),// 文件写入路径
      template: path.join(__dirname, '../src/index.html'),// 模板文件路径
      inject: true
    }),
    // copy custom static assets
  ]
})

