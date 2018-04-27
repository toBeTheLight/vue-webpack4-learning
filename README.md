从0开始的vue开发模板

使用webpack4搭建原vue-cli webpack 模板，熟悉webpack与webpack4配置。  
本文不做webpack配置api的介绍，只介绍配置过程中需要注意的地方。查看代码注释阅读效果更佳。配置位于build文件夹下。

# 基本公用配置

由于webpack配置中的如context，entry（chunk入口），output（输出）和module.rules中loaders的配置在开发模式和生产模式基本都是公用的，所以我们提取到`webpack.base.js`文件内，供复用。

需要注意的有：

## 文件名hash

hash是用在文件输出的名字中的，如`[chunkname]-[hash].js`，总的来说，webpack提供了三种hash：
1. `[hash]`：此次打包的所有内容的hash。
2. `[chunkhash]`：每一个chunk 都根据自身的内容计算而来。
3. `[contenthash]`：由css提取插件提供，根据自身内容计算得来。

可参考[基于 webpack 的持久化缓存方案](https://github.com/pigcan/blog/issues/9)，三种hash的使用，我们在优化部分再讲。

## loader优先级

loader优先级需要注意两点，

1. 同配置内优先级：优先处理的loader在配置数组内按照倒序排列，如对less处理则，`['style-loader', 'css-loader', 'postcss-loader', 'less-loader']`。
2. 不同配置内优先级：如对js文件的处理需要使用`eslint-loader`和`babel-loader`，但是又不能配置在一个use内，可使用`enforce: 'pre'`强调优先级。

*参考webpack文档*。

## css预处理器配置

我们以less文件的loader配置 `['vue-style-loader', 'css-loader', 'postcss-loader', 'less-loader']`，使用 `@import url(demo.less)`为例:
1. less-loader先处理less语法
2. postcss-loader进行前缀添加等其他处理
3. css-loader将内容引入@import所在的css文件内
4. vue-style-loader将生成style标签插入head  

*vue-style-loader类似style-loader*

但是由于vue单文件组件，又分为两种情况

* .vue文件内的style：  
  `vue-loader`会对vue单文件组件进行处理，其也有如webpack的loader配置选项，由于`vue-loader`内置了`postcss`对css进行处理，对vue文件内的预处理器，所以我们不需要再配置`postcss-loader`
* 直接引入：  
  如main.js中`import 'demo.less'`，在`vue-loader`处理范围置之外，所以需要配置`postcss-loader`。

由于这种情况我们将`less`、`scss`等文件的配置封装为函数，由usePostCss参数决定对应配置，将文件放入`utils.js`文件内，将`vue-loader`配置放在`vue-loader.js`文件内

## postcss-loader

postcss-loader是一个强大的css处理工具，我们将postcss的配置拆分出去，新建`postcss.config.js`文件
```js
module.exports = {
  plugins: {
    // 处理@import
    'postcss-import': {},
    // 处理css中url
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
```
除了注释中列出的插件，可能会用到nextcss（新的css语法），px2rem/px-to-viewport移动端适配的插件。

## babel-loader

我们使用babel编译js语法，同样将babel-loader的配置拆分出去，需要创建`.babelrc`并配置：
```js
{
  "presets": [
    [
      /* *
       *  babel-preset-env
       *  可以根据配置的目标运行环境自动启用需要的 babel 插件。
       */
      "env", {
        "modules": false, // 关闭babel对module的处理，防止其使webpack的模块优化无效
        "targets": { // 目标运行环境
          "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
        }
      }
    ]
  ],
  "plugins": [
    "dynamic-import-node" // 异步加载插件
  ]
}
```

# 生产模式

由于生产模式的配置相当来说比较简单，我们先进行生产模式的配置。

## 添加script脚本命令
在package.json下添加

```
"scripts": {
  "build": "node build/build.js"`
}
```
那么使用`npm run build`就可执行`node build/build.js`

## 生产模式配置文件

新建`webpack.prod.js`文件，使用

```
const merge = require('webpack-merge')
const webpackBaseConfig = require('./webpack.base')
module.exports = merge(webpackBaseConfig, {
  // 生产模式配置
})
```
合并基本配置和生产模式独有配置。

## mode

这是webpack4的新api，有三个预设值：`development`，`production`，`none`，我们在生产模式选用`mode: 'production'`，webpack4在此配置下默认启用了：
* 插件
  * FlagDependencyUsagePlugin
  * FlagIncludedChunksPlugin
  * ModuleConcatenationPlugin：作用域提升 webpack3的scope hosting
  * NoEmitOnErrorsPlugin：遇到错误代码不跳出
  * OccurrenceOrderPlugin
  * SideEffectsFlagPlugin
  * UglifyJsPlugin：js代码压缩
* process.env.NODE_ENV 的值设为 production

所以这些内容我们不需要再配置

## 创建js逻辑





## 环境区分问题

我们默认配置目的为上述目的，在这个前提下，简述下配置中可能存在的问题。

1. hot热更新模式不支持文件名使用hash，所以output下的filename和chunkFilename需要区分开发和生产模式。
2. dev-server下，开发服务启动后需要静态页，我们需要`html-webpack-plugin`插件配合，`HtmlWebpackPlugin`配置的filename需和devServer的contentBase的路径匹配才能在浏览器打开服务地址后读取到html文件，所以HtmlWebpackPlugin配置在开发和生产模式尽量分开。
3. 开发模式要保证每次修改后编译的速度够快，所以部分插件在开发模式下不需要使用，如css提取，代码压缩，所以相关插件只在生产模式下配置。

## 变动

## 缓存固化