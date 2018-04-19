const path = require('path')

const webpack = require('webpack')
// 终端输出包
const chalk = require('chalk')
const rm = require('rimraf')
// 终端输出包
const ora = require('ora')

const webpackConfig = require('./webpack.prod')

const spinner = ora('building......')
spinner.start()
rm(webpackConfig.output.path, err => {
  if (err) throw err
  webpack(webpackConfig, (err, stats) => {
    spinner.stop()
    if (err) throw err
    // 终端输出
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
      chunks: false,
      chunkModules: false
    }) + '\n\n')
    if (stats.hasErrors()) {
      console.log(chalk.red('error......fail......'))
      process.exit(1)
    }

    console.log(chalk.cyan('complete!\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})