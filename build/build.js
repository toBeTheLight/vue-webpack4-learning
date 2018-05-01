process.env.NODE_ENV = 'production'
/**
 * 这块基本上直接拿的webpack模板代码
 * https://github.com/vuejs-templates/webpack
 */
const path = require('path')

const webpack = require('webpack')
const chalk = require('chalk') // 终端输出包 着色
const rm = require('rimraf') // 删除功能模块
const ora = require('ora') // 终端输出包 loading等临时状态显示

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