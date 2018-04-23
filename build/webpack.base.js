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
    path: path.resolve(__dirname, '../dist/js'),
    filename: '[name]-[chunkhash:7].js',
    chunkFilename: '[id]-[chunkhash:7].js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        /**
         * loader配置的几种写法: https://www.bilibili.com/bangumi/play/ss12432
         * 单个：loader + options或use: 字符串
         * 多个：use/loaders: [string|[]单个]
         */
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
      {
        test: /\.(png|jpg|jpeg|gif|svg)(\?.*)?$/, // 末尾\?.*匹配带?资源路径，css字体配置中可能带版本信息
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(mp4|mp3|wav|webm|ogg|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[hash:7].[ext]',
        }
      },
      {
        test: /\.(woff2|woff|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]',
        }
      }
    ]
  }
}