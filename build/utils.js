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
        options: Object.assign(loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
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
