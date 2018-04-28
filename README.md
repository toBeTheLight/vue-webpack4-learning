从0开始的 vue 开发模板

使用 webpack4 搭建原 vue-cli webpack 模板，熟悉 webpack 与 webpack4 配置。与版本 4 相关的章节会添加符号 ④。  
本文不做 webpack 配置 api 的介绍，只介绍配置过程中需要注意的地方。查看代码注释阅读效果更佳。配置位于 build 文件夹下。

# 基本公用配置

由于 webpack 配置中的如 context，entry（chunk入口），output（输出）和 module.rules 中 loaders 的配置在开发模式和生产模式基本都是公用的，所以我们提取到 `webpack.base.js` 文件内，供复用。其中 output 部分如下：
```js
output: {
  
  path: path.resolve(__dirname, '../dist/'), // 资源文件输出时写入的路径
  filename: 'static/js/[name].[chunkhash].js', // 使用 chunkhash 加入文件名做文件更新和缓存处理
  chunkFilename: 'static/js/[name].[chunkhash].js'
}
```

需要注意的有：

## 文件名 hash

hash 是用在文件输出的名字中的，如 `[name].[hash].js`，总的来说，webpack 提供了三种 hash：
1. `[hash]`：此次打包的所有内容的 hash。
2. `[chunkhash]`：每一个 chunk 都根据自身的内容计算而来。
3. `[contenthash]`：由 css 提取插件提供，根据自身内容计算得来。

可参考[基于 webpack 的持久化缓存方案](https://github.com/pigcan/blog/issues/9)，三种 hash 的使用，我们在优化部分再讲，先优先使用 `[chunkhash]`。

## loader 优先级

loader 优先级需要注意两点，

1. 同 test 配置内优先级：在同一个 test 下配置多个 loader ，[优先处理的 loader 放在配置数组的后面](https://webpack.js.org/concepts/loaders/#loader-features)，如对 less 处理，则：
    ```js
    {
      test: /\.less$/,
      use: [
        'style-loader', 
        'css-loader', 
        'postcss-loader', 
        'less-loader'
      ]
    }
    ```
2. 不同 test 内优先级：如对 js 文件的处理需要两个 test 分别配置，使用 `eslint-loader` 和 `babel-loader` ，但是又不能配置在一个配置对象内，可使用 [enforce: 'pre'](https://webpack.js.org/configuration/module/#rule-enforce) 强调优先级，由 `eslint-loader` 优先处理。
    ```js
    {
      test: /\.(js|vue)$/,
      loader: 'eslint-loader',
      enforce: 'pre',
    },
    {
      test: /\.js$/,
      loader: 'babel-loader'
    }
    ```

## css 预处理器配置

我们以 less 文件的 loader 配置 `['vue-style-loader', 'css-loader', 'postcss-loader', 'less-loader']`，使用 `@import url(demo.less)`为例:
1. less-loader 先处理 less 语法
2. postcss-loader 进行前缀添加等其他处理
3. css-loader 将内容引入 @import 所在的 css 文件内
4. vue-style-loader 将生成 style 标签，将 css 内容插入 HTML  

*vue-style-loader 功能类似 style-loader*

但是由于 vue 中的单文件组件，又分为两种情况：

* .vue 文件内的 style：  
  `vue-loader`会对 .vue 单文件组件进行处理，对 .vue 单文件组件内的 lang="type"，各种 type 的语言我们可以在 `vue-loader` 的 options [配置不同的 loader](https://vue-loader-v14.vuejs.org/zh-cn/options.html#loaders)，由于 `vue-loader` 内置了 `postcss` 对 css 进行处理，所以此处我们不需要再配置 `postcss-loader`
  ```
  {
    test: /\.vue$/,
    loader: 'vue-loader',
    options: {
      loaders: {
        less: ['// xxx-loaders'],
        scss: ['// xxx-loaders'],
      }
    }
  }
  ```
* js 直接引入中引入样式文件：  
  如 main.js 中 `import 'demo.less'`，这种方式引入的样式文件，在 `vue-loader` 处理范围置之外，所以仍然需要配置 `postcss-loader`。

由于这种差异我们将 对css预处理器文件的配置封装为函数，由 `usePostCss` 参数生成对应配置，将文件放入 `utils.js` 文件内，将 `vue-loader` 配置放在 `vue-loader.js` 文件内。

## postcss-loader

postcss-loader 是一个强大的 css 处理工具，我们将 postcss 的配置拆分出去，新建 `postcss.config.js` 配置文件
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
除了注释中列出的需要的功能插件，我们还可能会用到 `nextcss`（新的css语法的处理），`px2rem/px-to-viewport` 移动端适配相关的插件。

## babel-loader

我们使用 babel 编译浏览器不能识别的 js、类 js 语法，同样将 babel-loader 的配置拆分出去，需要创建 `.babelrc` 并配置：
```js
{
  "presets": [
    [
      /* *
       *  babel-preset-env
       *  可以根据配置的目标运行环境自动启用需要的 babel 插件。
       */
      "env", {
        "modules": false, // 关闭babel对es module的处理
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

# 生产模式 production

由于生产模式的配置相当来说比较简单，我们先进行生产模式的配置。

## 添加script脚本命令

在 package.json 下添加

```
"scripts": {
  "build": "node build/build.js"`
}
```
那么使用 `npm run build` 命令就可执行 `node build/build.js`，我们不直接使用 `webpack webpack.prod.config.js` 命令去执行配置文件，而是在 build.js 中，做一些文件删除的处理，再启动 webpack。

## 创建 build.js 逻辑

主要是两个工作，引入 `rimraf` 模块删除 webpack 下之前产生的指定文件，启动 webpack，并在不同阶段给出不同的提示信息。

```js
const webpack = require('webpack')
const rm = require('rimraf')
const webpackConfig = require('./webpack.prod')
// 删除webpack输出目录下的内容，也可只删除子文件如static等
rm(webpackConfig.output.path, err => {
  // webpack按照生产模式配置启动
  webpack(webpackConfig, (err, stats) => {
    // 输出一些状态信息
  })
}
```
*更多细节见源代码注释*。

## 生产模式配置文件

新建 `webpack.prod.js` 文件，使用

```js
const merge = require('webpack-merge') // 专用合并webpack配置的包
const webpackBaseConfig = require('./webpack.base')
module.exports = merge(webpackBaseConfig, {
  // 生产模式配置
})
```
合并基本配置和生产模式独有配置，然后我们开始进行生产模式下的 webpack 的配置信息的填写。

## ④ mode 预设

这是 webpack4 的新 api ，有三个预设值：`development`，`production`，`none`，我们在生产模式选用`mode: 'production'`，webpack4在此配置下默认启用了：
* 插件
  * FlagDependencyUsagePlugin：应该是删除无用代码的，其他插件依赖
  * FlagIncludedChunksPlugin：应该是删除无用代码的，其他插件依赖
  * ModuleConcatenationPlugin：作用域提升 webpack3的scope hosting
  * NoEmitOnErrorsPlugin：遇到错误代码不跳出
  * OccurrenceOrderPlugin
  * SideEffectsFlagPlugin
  * UglifyJsPlugin：js代码压缩
* process.env.NODE_ENV 的值设为 production：node环境变量

所以这些默认启用的内容我们不需要再配置。

## 添加 webpack 打出的 bundles 到 HTML 文件

* 我们使用 webpack 配置入口时只能配置 js 文件作为入口，webpack 打出的 bundles 并不能自动与我们项目的 HTML 文件发生关联。
* 需要我们手动添加`<script src="./bundles.js"></script>`（还可能包括后面提取出来的 css 文件）到 HTML 文件。
* 我们可以使用 `html-webpack-plugin` 插件自动完成这个工作。
* 当仅使用 webpack 对 js 进行打包，而没有 HTML文件需求时，不需要这一步。

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
plugins: [
  new HtmlWebpackPlugin({
    filename: path.join(__dirname, '../dist/index.html'),// 文件写入路径
    template: path.join(__dirname, '../src/index.html'),// 模板文件路径
    inject: true // js等bundles插入html的位置 head/body等
  })
]
```
如果不对 HtmlWebpackPlugin 进行配置，则其会创建一个 HTML 文件，其中 `filename` 在开发模式下还是比较重要的。

## ④ 提取 js 中的 css 部分到单独的文件

使用过 webpack3 的同学应该对 `extract-text-webpack-plugin` 插件（以旧插件代称）比较熟悉，为了产生webpack4，我并不想使用这个插件的 `@next` 版本，所以选择了新的`mini-css-extract-plugin`（以新插件代称）。  
与旧插件相同，同样需要在 webpack 的 loader 部分和 plugin 部分都进行配置，不同的是新插件提供了单独的 loader，与旧插件的配置方式不太相同。配置如下：

* loader 部分
  ```js
  const MiniCssExtractPlugin = require("mini-css-extract-plugin")
  // ...
  [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
      /*
      * 复写css文件中资源路径
      * webpack3.x配置在extract-text-webpack-plugin插件中
      * 因为css文件中的外链是相对与css的，
      * 我们抽离的css文件在可能会单独放在css文件夹内
      * 引用其他如img/a.png会寻址错误
      * 这种情况下所以单独需要配置../，复写其中资源的路径
      */
      publicPath: '../' 
    },
    {
      loader: 'css-loader',
      options: {}
    },
    {
      loader: 'less-loader',
      options: {}
    }
  ]
  ```
* plugin 部分
  ```js
  new MiniCssExtractPlugin({
    // 输出到单独的 css 文件夹下
    filename: "static/css/[name].[chunkhash].css"
  })
  ```
可以看到这个 loader 也配置在了 css 预处理器部分，在前面我们已经把 css 预处理器的配置提取到了 utils.js 文件的函数内，所以这里也是，我们使用 `extract` 参数决定是否需要提取。

回忆一下，之前使用的 `style-loader` 或 `vue-style-loader` 的作用，它们会创建标签将 css 的内容直接插入到 HTML中。而提取成独立的 css 文件之后，插入到 HTML 的工作由 `html-webpack-plugin` 插件完成，两者职责的这部分职责是重复的，所以我们需要使用 `extract` 参数做类似如下处理：
```js
if (options.extract) {
  return [MiniCssExtractPlugin.loader, ...otherLoaders]
} else {
  return ['vue-style-loader', ...otherLoaders]
}
```

## ④ js 公共文件提取

这是 webpack 配置中很重要的一个环节，影响到我们使用浏览器缓存的合理性，影响页面资源的加载速度。使用过 webpack3 的同学一定清楚，我们一般会提取出这么几个文件 `manifest.js`（webpack 运行时等）、`vendor.js`（node_modules内的库）、app.js（真正的项目业务代码）。

## 环境区分问题

我们默认配置目的为上述目的，在这个前提下，简述下配置中可能存在的问题。

1. hot热更新模式不支持文件名使用hash，所以output下的filename和chunkFilename需要区分开发和生产模式。
2. dev-server下，开发服务启动后需要静态页，我们需要`html-webpack-plugin`插件配合，`HtmlWebpackPlugin`配置的filename需和devServer的contentBase的路径匹配才能在浏览器打开服务地址后读取到html文件，所以HtmlWebpackPlugin配置在开发和生产模式尽量分开。
3. 开发模式要保证每次修改后编译的速度够快，所以部分插件在开发模式下不需要使用，如css提取，代码压缩，所以相关插件只在生产模式下配置。

## 变动

## 缓存固化