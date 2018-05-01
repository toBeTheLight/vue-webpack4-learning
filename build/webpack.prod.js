const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpackBaseConfig = require('./webpack.base')
const BundleAnalyzer = require('webpack-bundle-analyzer')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
// const CompressionWebpackPlugin = require('compression-webpack-plugin')
const merge = require('webpack-merge')
const path = require('path')

module.exports = merge(webpackBaseConfig, {
  /**
   * production模式下默认启用这些插件
   * FlagDependencyUsagePlugin, // 应该是删除无用代码的，其他插件依赖
   * FlagIncludedChunksPlugin, // 应该是删除无用代码的，其他插件依赖
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
    filename: 'static/js/[name].[chunkhash:7].js',
    chunkFilename: 'static/js/[name].[chunkhash:7].js'
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
      filename: "static/css/[name].[contenthash:7].css"
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
    new webpack.HashedModuleIdsPlugin(),
    new OptimizeCSSAssetsPlugin({}), // css 压缩
    new BundleAnalyzer.BundleAnalyzerPlugin(), // bundle 分析
    // gzip 压缩一般由服务器直接提供
    // new CompressionWebpackPlugin({
    //   asset: '[path].gz[query]',
    //   algorithm: 'gzip',
    //   test: new RegExp(
    //     '\\.(' +
    //     config.build.productionGzipExtensions.join('|') +
    //     ')$'
    //   ),
    //   threshold: 10240,
    //   minRatio: 0.8
    // })
  ],
  /**
   * 优化部分包括代码拆分
   * 且运行时（manifest）的代码拆分提取为了独立的 runtimeChunk 配置 
   */
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        },
        commons: {
          // async 设置提取异步代码中的公用代码
          chunks: "async",
          name: 'commons-async',
          /**
           * minSize 默认为 30000
           * 想要使代码拆分真的按照我们的设置来
           * 需要减小 minSize
           */
          minSize: 0,
          // 至少为两个 chunks 的公用代码
          minChunks: 2
        }
      }
    },
    /**
     * 对应原来的 minchunks: Infinity
     * 提取 webpack 运行时代码
     * 直接置为 true 或设置 name
     */
    runtimeChunk: {
      name: 'manifest'
    }
  }
})
