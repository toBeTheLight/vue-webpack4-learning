const path = require('path')
const vueLoaderConfig = require('./vue-loader')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const utils = require('./utils')

module.exports = {
  /**
   * 1. __dirname 为node全局对象，是当前文件所在目录
   * 2. context为 查找entry和部分插件的前置路径
   */
  context: path.resolve(__dirname, '../'),
  entry: {
    /**
     * 入口，chunkname: 路径
     * 多入口可配置多个
     */
    app: './src/main.js'
  },
  output: {
    // 资源文件输出时写入的路径
    path: path.resolve(__dirname, '../dist/')
  },
  plugins: [
    // 开发模式下，会将文件写入内存
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: 'static',
        ignore: ['.*']
      }
    ])
  ],
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        // 大部分配置抽取到 .eslintrc.js 文件中
        options: {
          formatter: require('eslint-friendly-formatter'),
          emitWarning: true
        }
      },
      {
        test: /\.vue$/,
        /**
         * loader配置的几种写法: https://www.bilibili.com/bangumi/play/ss12432
         * 单个：loader + options或use: 字符串
         * 多个：use/loaders: [string|[]单个]
         */
        loader: 'vue-loader',
        // 包含在.vue文件内的css预处理器配置
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      // 单独配置的css预处理器配置
      ...utils.styleLoaders({
        sourceMap: true,
        extract: process.env.NODE_ENV === 'production' ? true : false,
        usePostCSS: true
      }),
      {
        // 末尾\?.*匹配带?资源路径，css字体配置中可能带版本信息
        test: /\.(png|jpg|jpeg|gif|svg)(\?.*)?$/,
        /**
         * url-loader
         * 会配合 webpack 对资源引入路径进行复写，如将 css 提取成独立文件，可能出现 404 错误可查看 提取 js 中的 css 部分解决
         * 会以 webpack 的输出路径为基本路径，以 name 配置进行具体输出
         * limit 单位为 byte，小于这个大小的文件会编译为 base64 写进 js 或 html
         */
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(mp4|mp3|wav|webm|ogg|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:7].[ext]',
        }
      },
      {
        test: /\.(woff2|woff|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/fonts/[name].[hash:7].[ext]',
        }
      }
    ]
  }
}