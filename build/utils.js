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
      return [MiniCssExtractPlugin.loader].concat(loaders)
    } else {
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