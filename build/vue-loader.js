
const utils = require('./utils')

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: true
  }),
  cssSourceMap: true,
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}