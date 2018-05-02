# 前言

[源代码](https://github.com/toBeTheLight/vue-webpack4/tree/master)

熟悉 webpack 与 webpack4 配置。

webpack4 相对于 3 的最主要的区别是所谓的`零配置`，但是为了满足我们的项目需求还是要自己进行配置，不过我们可以使用一些 webpack 的预设值。同时 webpack 也拆成了两部分，webpack 和 webpack-cli，都需要本地安装。 

我们通过实现一个 vue 的开发模板（vue init webpack 模板，其实跟 vue 关系不太大）来进行一次体验。在配置过程中会尽量使用 webpack4 的相关内容。

本文**不做** webpack 配置的**完整介绍**，着重介绍配置过程中需要注意的地方。查看代码注释阅读效果更佳，完整配置与详细注释可见源代码。配置位于 build 文件夹下。

**与版本 4 相关的章节会添加符号 ④**。

需要注意的一点是，我们的 webpack 代码是运行在node环境下的，这部分代码可以使用 node api，但是我们的业务代码（src下）是无法使用 node api 的。

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

三种 hash 的使用，我们在优化部分再讲，先优先使用 `[chunkhash]`。

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
  `vue-loader` 会对 .vue 单文件组件进行处理，对 .vue 单文件组件内的各种 lang="type" 我们可以在 `vue-loader` 的 options [配置不同的 loader](https://vue-loader-v14.vuejs.org/zh-cn/options.html#loaders)，由于 `vue-loader` 内置了 `postcss` 对 css 进行处理，所以此处我们不需要再配置 `postcss-loader`
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

由于这种差异我们将 对 css 预处理器文件的配置封装为函数，由 `usePostCss` 参数生成对应配置，将文件放入 `utils.js` 文件内，将 `vue-loader` 配置放在 `vue-loader.js` 文件内。

也就是对 css 预处理器的配置我们需要在 `vue-loader` 内和 `webpack` 内配置两遍。

*写这篇 README.md 期间 vue-loader 发布了 v15 版，需要配合插件使用，不用再进行两遍配置*

## postcss-loader

[postcss-loader](https://www.npmjs.com/package/postcss-loader) 是一个强大的 css 处理工具，我们将 postcss 的配置拆分出去，新建 `postcss.config.js` 配置文件
```js
module.exports = {
  plugins: {
    // 处理 @import
    'postcss-import': {},
    // 处理 css 中 url
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

我们使用 babel 编译浏览器不能识别的 js、类 js 语法，如转义 ES6+、JSX等。同样将 [babel-loader](https://www.npmjs.com/package/babel-loader) 的配置拆分出去，需要创建 `.babelrc` 并配置：

```js
{
  "presets": [
    [
      /* *
       *  babel-preset-env
       *  可以根据配置的目标运行环境自动启用需要的 babel 插件。
       */
      "env", {
        "modules": false, // 关闭 babel 对 es module 的处理
        "targets": { // 目标运行环境
          "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
        }
      }
    ]
  ],
  "plugins": [
    "syntax-dynamic-import" // 异步加载语法编译插件
  ]
}
```

## 媒体资源 loader

我们还需要对图片、视频、字体等文件进行 loader 配置，以字体文件为例子，主要用到的是 [url-loader](https://www.npmjs.com/package/url-loader)：
```js
{
  /**
   * 末尾 \?.* 匹配带 ? 资源路径
   * 我们引入的第三方 css 字体样式对字体的引用路径中可能带查询字符串的版本信息
   */
  test: /\.(woff2|woff|eot|ttf|otf)(\?.*)?$/,
  /**
   * url-loader
   * 会配合 webpack 对资源引入路径进行复写，如将 css 提取成独立文件，可能出现 404 错误可查看 提取 js 中的 css 部分解决
   * 会以 webpack 的输出路径为基本路径，以 name 配置进行具体输出
   * limit 单位为 byte，小于这个大小的文件会编译为 base64 写进 js 或 html
   */
  loader: 'url-loader',
  options: {
    limit: 10000,
    name: 'static/fonts/[name].[hash:7].[ext]',
  }
}
```
## 静态文件拷贝

直接引用（绝对路径）和代码执行时确定的资源路径应该是以静态文件存在的，这些资源文件不会经过 webpack 编译处理，所以我们将它们放在独立的文件夹（如 static）中，并在代码打包后拷贝到我们的输出目录，我们使用 [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) 自动完成这个工作：

```js
const CopyWebpackPlugin = require('copy-webpack-plugin')

// 在开发模式下，会将文件写入内存
new CopyWebpackPlugin([
  {
    from: path.resolve(__dirname, '../static'),
    to: 'static',
    ignore: ['.*']
  }
])
```
*此插件在拷贝文件过多时会崩溃，不知道解决了没有。*

# 生产模式 production

我们先进行生产模式的配置。

## 添加 script 脚本命令

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
// 在第一行设置当前为 生产环境
process.env.NODE_ENV = 'production'

const webpack = require('webpack')
const rm = require('rimraf')
const webpackConfig = require('./webpack.prod')
// 删除 webpack 输出目录下的内容，也可只删除子文件如 static 等
rm(webpackConfig.output.path, err => {
  // webpack 按照生产模式配置启动
  webpack(webpackConfig, (err, stats) => {
    // 输出一些状态信息
  })
}
```
*更多细节见源代码注释*。

## 生产模式配置文件

新建 `webpack.prod.js` 文件，使用

```js
const merge = require('webpack-merge') // 专用合并 webpack 配置的包
const webpackBaseConfig = require('./webpack.base')
module.exports = merge(webpackBaseConfig, {
  // 生产模式配置
})
```
合并基本配置和生产模式独有配置，然后我们开始进行生产模式下的 webpack 的配置信息的填写。

## ④ mode 预设

这是 webpack4 的新 api ，有三个预设值：`development`，`production`，`none`，我们在生产模式选用`mode: 'production'`，webpack4在此配置下[默认启用](https://webpack.js.org/concepts/mode/#usage)了：
* 插件
  * FlagDependencyUsagePlugin：应该是删除无用代码的，其他插件依赖
  * FlagIncludedChunksPlugin：应该是删除无用代码的，其他插件依赖
  * ModuleConcatenationPlugin：作用域提升 webpack3的scope hosting
  * NoEmitOnErrorsPlugin：遇到错误代码不跳出
  * OccurrenceOrderPlugin
  * SideEffectsFlagPlugin
  * UglifyJsPlugin：js代码压缩
  * process.env.NODE_ENV 的值设为 production

所以这些默认启用的内容我们不需要再配置。

最后一点设置 `process.env.NODE_ENV 的值设为 production` 其实是使用 DefinePlugin 插件：

```js
new webpack.DefinePlugin({
  "process.env.NODE_ENV": JSON.stringify("production") 
})
```

从而我们可以在业务代码中通过 `process.env.NODE_ENV`，如进行判断，使用开发接口还是线上接口。如果我们需要在 webpack 中判断当前环境，还需要单独的设置 `process.env.NODE_ENV = 'production'`，这也是我们在 `build.js` 中第一行做的事情。

## 添加 webpack 打出的 bundles 到 HTML 文件

* 我们使用 webpack 配置入口时只能配置 js 文件作为入口，webpack 打出的 bundles 并不能自动与我们项目的 HTML 文件发生关联。
* 需要我们手动添加`<script src="./bundles.js"></script>`（还可能包括后面提取出来的 css 文件）到 HTML 文件。
* 我们可以使用 [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) 插件自动完成这个工作。
* 当仅使用 webpack 对 js 进行打包，而没有 HTML文件需求时，不需要这一步。

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
plugins: [
  new HtmlWebpackPlugin({
    filename: path.join(__dirname, '../dist/index.html'),// 文件写入路径
    template: path.join(__dirname, '../src/index.html'),// 模板文件路径
    inject: true // js 等 bundles 插入 html 的位置 head/body等
  })
]
```
如果不对 HtmlWebpackPlugin 进行配置，则其会创建一个 HTML 文件，其中 `filename` 在开发模式下还是比较重要的。

## ④ 提取 js 中的 css 部分到单独的文件

使用过 webpack3 的同学应该对 [extract-text-webpack-plugin](https://www.npmjs.com/package/extract-text-webpack-plugin) 插件（以旧插件代称）比较熟悉，为了尝试webpack4，我并不想使用这个插件的 `@next` 版本，所以选择了新的替代插件 [mini-css-extract-plugin](https://www.npmjs.com/package/mini-css-extract-plugin)（以新插件代称）。  
与旧插件相同，同样需要在 webpack 的 loader 部分和 plugin 部分都进行配置，不同的是新插件提供了单独的 loader，在 loader 部分与旧插件的配置方式不太相同。配置如下：

* loader 部分

      ```js
      const MiniCssExtractPlugin = require("mini-css-extract-plugin")
      // ...
      [
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
          /*
          * 复写 css 文件中资源路径
          * webpack3.x 配置在 extract-text-webpack-plugin 插件中
          * 因为 css 文件中的外链是相对与 css 的，
          * 我们抽离的 css 文件在可能会单独放在 css 文件夹内
          * 引用其他如 img/a.png 会寻址错误
          * 这种情况下所以单独需要配置 ../，复写其中资源的路径
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

## ④ 拆分 js 代码

这是 webpack 配置中很重要的一个环节，影响到我们使用浏览器缓存的合理性，影响页面资源的加载速度，将 js 进行合理拆分，可以有效减小我们每次更新代码影响到的文件范围。  
使用过 webpack3 的同学一定清楚，我们一般会提取出这么几个文件 `manifest.js`（webpack 运行时，即webpack解析其他bundle的代码等）、`vendor.js`（node_modules内的库）、app.js（真正的项目业务代码）。在 webpack3 中我们使用 `webpack.optimize.CommonsChunkPlugin`插件进行提取，webpack4 中我们可以直接使用 [optimization](https://webpack.js.org/plugins/split-chunks-plugin/) 配置项进行配置（当然仍可使用插件配置）：
```js
/**
 * 优化部分包括代码拆分
 * 且运行时（manifest）的代码拆分提取为了独立的 runtimeChunk 配置 
 */
optimization: {
  splitChunks: {
    chunks: "all",
    cacheGroups: {
      // 提取 node_modules 中代码
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        name: "vendors",
        chunks: "all"
      },
      commons: {
        // async 设置提取异步代码中的公用代码
        chunks: "async"
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
```

也可将不会变的开发依赖配置到单独的entry中，如：
```js
entry: {
  app: 'index.js',
  vendor2: ['vue', 'vue-router', 'axios']
}
```

# 开发模式 development

开发模式与生产模式的不同是，在开发时会频繁运行代码，所以很多东西在开发模式是不推荐配置的，如css文件提取，代码压缩等。所以针对一些写入公共配置文件，但是开发模式不需要的功能，我们需要做类似修改：`process.env.NODE_ENV === 'production' ? true : false`，如 css 预处理中是否需要配置提取 loader `MiniCssExtractPlugin.loader`。此外还有一些是只配置在生产模式下的，如 `MiniCssExtractPlugin` 和 js 代码拆分优化。

开发模式我们需要一个[开发服务](https://webpack.js.org/configuration/dev-server/#devserver)，帮我们完成实时更新、接口代理等功能。我们使用 `webpack-dev-server`。需要 npm 安装。

## 添加 script 脚本命令

同样，在 package.json 下添加

```
"scripts": {
  "dev": "webpack-dev-server --config ./build/webpack.dev.js"
}
```
使用 `--config` 指定配置文件，由于命令直接调用 webpack-dev-server 运行，所以我们直接写配置就好，可以不像生产模式一样去编写调用逻辑。

## 开发模式配置文件

新建 `webpack.dev.js` 文件，同样使用：
```js
// 在第一行设置当前环境为开发环境
process.env.NODE_ENV = 'development'
const merge = require('webpack-merge') // 专用合并webpack配置的包
const webpackBaseConfig = require('./webpack.base')
module.exports = merge(webpackBaseConfig, {
  // 开发模式配置
})
```
## ④ mode 预设

同样，在开发模式下我们可以将 `mode` 配置为 `development`，同样[默认启用](https://webpack.js.org/concepts/mode/#usage)了一些功能：
* 插件
  * NamedChunksPlugin：使用 entry 名做 chunk 标识
  * NamedModulesPlugin：使用模块的相对路径非自增 id 做模块标识
* process.env.NODE_ENV 的值设为 development

## 开发服务配置 devServer

[文档](https://webpack.js.org/configuration/dev-server/#devserver)

```js
devServer: {
  clientLogLevel: 'warning',
  inline: true,
  // 启动热更新
  hot: true,
  // 在页面上全屏输出报错信息
  overlay: {
    warnings: true,
    errors: true
  },
  // 显示 webpack 构建进度
  progress: true,
  // dev-server 服务路径
  contentBase: false,
  compress: true,
  host: 'localhost',
  port: '8080',
  // 自动打开浏览器
  open: true,
  // 可以进行接口代理配置
  proxy： xxx,
  // 跟 friendly-errors-webpack-plugin 插件配合
  quiet: true,
  publicPath: '/'
}
```

## 其他插件

devServer 使用热更新 hot 时需要使用插件：

```js
plugins: [
  new webpack.HotModuleReplacementPlugin()
]
```
优化 webpack 输出信息，需要配置：
```js
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
plugins: [
  new FriendlyErrorsPlugin()
]
```

## 注意事项

* 热更新：在使用热更新时，我们的 chunk 名中不能使用 `[hash]` 做标识，文件名变化无法热更新，所以需要将原来配置在公共配置中的 output 中的文件名配置分别写入生产和开发模式配置中，开发模式去掉 `[hash]`
  ```
  filename: 'static/[name].js', 
  chunkFilename: 'static/[id].js'
  ```
* HtmlWebpackPlugin：在生产模式下，我们将 html 文件写入到 dist 下，但是在开发模式下，并没有实际的写入过程，且 `devServer` 启动后的服务内容与 `contentBase` 有关，两者需要一致，所以我们将 `HtmlWebpackPlugin` 的配置也分为 生产和开发模式，开发模式下使用：
  ```
  new HtmlWebpackPlugin({
    filename: 'index.html', // 文件写入路径，前面的路径与 devServer 中 contentBase 对应
    template: path.resolve(__dirname, '../src/index.html'),// 模板文件路径
    inject: true
  })
  ```

# 优化

## 配置提取

* 开发模式和生产模式的一些功能启用，如 css 是否提取。
* 路径配置，如文件输出路径和文件名、output 中的 publicPath（代码 output 中只配置了 [path](https://webpack.js.org/configuration/output/#output-path)，没配置 [publicPath](https://webpack.js.org/configuration/output/#output-publicpath)，将这部分路径的 static 写到了各个资源的输出name中，可参考[Webpack中publicPath详解](https://juejin.im/post/5ae9ae5e518825672f19b094?utm_source=gold_browser_extension)）、服务配置如端口等。

我们可以提取到独立的 config 文件中（本代码没做）。

## 拆分 js 代码

在生产模式的 `拆分 js 代码` 部分我们已经讲了如何拆分，那么为了更好的分析我们的拆分是否合理，我们可以配置一个 bundle 组成分析的插件。
```js
const BundleAnalyzer = require('webpack-bundle-analyzer')
plugins: [
  new BundleAnalyzer.BundleAnalyzerPlugin()
]
```

## hash 固化

我们使用文件名中的 hash 变化来进行资源文件的更新，那么合理利用缓存时，就要求我们合理的拆分文件，在内容更新时最小限度的影响文件名中的 hash。这里就用到了`[hash]`，`[chunkhash]`，`[contenthash]`。然而 webpack 对 hash 的默认处理并不尽如人意，这一部分的优化可以参考[基于 webpack 的持久化缓存方案](https://github.com/pigcan/blog/issues/9)

# 多页面

多页面配置代码位于 [muilt-pages 分支](https://github.com/toBeTheLight/vue-webpack4/tree/muilt-pages)。我们只需做少量修改，以目前有 entry 页和 index 页为例。

## entry 改动

将两个页面的 js 入口都配置在 `webpack` 的 `entry`中：
```js
entry: {
  /**
    * 入口，chunkname: 路径
    * 多入口可配置多个
    */
  main: './src/main.js',
  entry: './src/entry.js'
}
```
也可以自己设置项目结构，使用 node api 动态读取的方式获取目前的多页面入口。

## HtmlWebpackPlugin 改动

需按照页面个数配置多个 `HtmlWebpackPlugin`：
```js
new HtmlWebpackPlugin({
  filename: path.join(__dirname, '../dist/main.html'),// 文件写入路径
  template: path.join(__dirname, '../src/index.html'),// 模板文件路径
  inject: true, // 插入位置
  chunks: ['manifest', 'vendors', 'common', 'main']
}),
new HtmlWebpackPlugin({
  filename: path.join(__dirname, '../dist/entry.html'),// 文件写入路径
  template: path.join(__dirname, '../src/index.html'),// 模板文件路径
  inject: true, // 插入位置
  chunks: ['manifest', 'vendors', 'common', 'entry']
}),
```

其中需手动指定每个页面的插入的 chunks（同步的），否则会将其他页面的文件也一同插入当前页面。

## ④ 公共js提取

在单页面下，一般不存在提取非异步 js 文件的公共代码（非 node_modules）的问题，在多页面下我们的页面间可能会公用 api、配置等文件，此时可以增加：

```js
'common': {
  // initial 设置提取同步代码中的公用代码
  chunks: 'initial',
  // test: 'xxxx', 也可使用 test 选择提取哪些 chunks 里的代码
  name: 'common',
  minSize: 0,
  minChunks: 2
}
```
提取同步代码中的公用代码

# 参考

1. [基于 webpack 的持久化缓存方案](https://github.com/pigcan/blog/issues/9)
2. [webpack issues](https://github.com/webpack/webpack/issues)
3. [vuejs-templates/webpack/issues](https://github.com/vuejs-templates/webpack/issues)