const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const webpackBaseConfig = require('./webpack.base')
const merge = require('webpack-merge')
const path = require('path')

module.exports = merge(webpackBaseConfig, {
  /**
   * production模式下默认启用这些插件
   * FlagDependencyUsagePlugin, 
   * FlagIncludedChunksPlugin, 
   * ModuleConcatenationPlugin,  // 作用域提升
   * NoEmitOnErrorsPlugin,  // 遇到错误代码不跳出
   * OccurrenceOrderPlugin, 
   * SideEffectsFlagPlugin
   * UglifyJsPlugin.  // js代码压缩
   * 
   * process.env.NODE_ENV 的值设为 production
   */
  mode: 'production',
  output: {
    /**
     * development下HotModuleReplacement下文件名无法使用hash，
     * 所以将filename与chunkFilename配置从base中拆分到dev与prod中
     */
    filename: 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[name].[chunkhash].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, '../dist/index.html'),// 文件写入路径
      template: path.join(__dirname, '../src/index.html'),// 模板文件路径
      inject: true // 插入位置
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "css/[name]-[contenthash].css"
    }),
    /**
     * https://zhuanlan.zhihu.com/p/35093098
     * https://github.com/pigcan/blog/issues/9
     * vue-cli webpack中也有此配置
     * 正常来讲，引用node_modules不变的话，vender的hash应该是不变的，
     * 但是引用其他的模块，模块id变化会引起vender中模块id变化，引起hash变化，
     * 使用此插件对引入路径进行hash截取最后几位做模块标识可解决这个问题
     * 
     * 开发模式有另一个插件NamedModulesPlugin
     */
    new webpack.HashedModuleIdsPlugin()
  ],
  /**
   * 暂时不知道具体配置信息
   */
  optimization: {
    splitChunks: {
      chunks: "async",
      minSize: 1,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: true,
      cacheGroups: {
        commons: {
          name: "commons",
          chunks: "async",
          minChunks: 2
        },
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    },
    /**
     * 对应原来的minchunks: Infinity
     * 运行时代码
     */
    runtimeChunk: {
      name: 'manifest'
    }
  }
})