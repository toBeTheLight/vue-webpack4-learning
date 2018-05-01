/**
 * 提取css文件插件
 * extract-text-webpack-plugin插件废弃，虽然有next版本，但是好像也有问题
 * 使用mini-css-extract-plugin代替
 */
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
/**
 * cssLoaders为vue-loader内样式文件相关配置
 * 因为vue-loader内已经内置postcss做相关处理
 * 所以传入options不需要postcss
 */
exports.cssLoaders = (options) => {
  const postLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }
  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }
  // 生成针对某种css预处理器的loaders配置组
  const generateLoaders = (type, loaderOptions) => {
    const loaders = options.usePostCSS ? [cssLoader, postLoader] : [cssLoader]
    loaderOptions = loaderOptions || {}
    if (type) {
      loaders.push({
        loader: `${type}-loader`,
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    if (options.extract) {
      return [{
        loader: MiniCssExtractPlugin.loader,
        options: {
          /*
          * 复写css文件中资源路径
          * webpack3.x配置在extract-text-webpack-plugin插件中
          * 因为css文件中的外链是相对与css的，
          * 我们抽离的css文件在可能会单独放在css文件夹内
          * 引用其他如img/a.png会寻址错误
          * 这种情况下所以单独需要配置../../，复写其中资源的路径
          */
          publicPath: '../../' 
        }
      }].concat(loaders)
    } else {
      /**
       * 以返回 ['vue-style-loader', 'css-loader', 'postcss-loader', 'less-loader']
       * @import url(demo.less)为例子
       * less-loader先处理less语法
       * postcss-loader进行前缀添加等其他处理
       * css-loader处理@import将内容引入@import所在的css文件内
       * vue-style-loader将生成style标签插入head
       */
      return ['vue-style-loader'].concat(loaders)
    }
  }
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    scss: generateLoaders('scss'),
    sass: generateLoaders('sass', {indentedSyntax: true}),
    styl: generateLoaders('stylus'),
    stylus: generateLoaders('stylus')
  }
}
/**
 * 无组件关联的单独的样式文件的处理
 * 由于vue-loader对非组件相关的样式文件无能为力
 * 所以需要单独配置
 */
exports.styleLoaders = (options) => {
  const rules = []
  const loaders = exports.cssLoaders(options)

  for (const type in loaders) {
    rules.push({
      test: new RegExp(`\\.${type}$`),
      use: loaders[type]
    })
  }
  return rules
}