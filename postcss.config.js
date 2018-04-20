module.exports = {
  plugins: {
    // 处理@import
    'postcss-import': {},
    // 处理url
    'postcss-url': {},
    // 自动前缀
    'autoprefixer': {
      "browsers": [
        "> 1%",
        "last 2 versions"
      ]
    }
  }
}