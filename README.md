从0开始的vue开发模板

使用webpack4，熟悉webpack配置

基本配置内容查看build文件夹下注释。README文件主要阐述差异和变化。

## 目的

* 各种loader编译文件
* 开发模式热更新
* 生产模式，打包压缩代码，提起公共代码，提取css

## mode

现在由两种预设模式可以选择

  * development，此模式默认启用插件有：
    * NamedChunksPlugin  // 使用entry名做标识
    * NamedModulesPlugin // 使用模块的相对路径非自增id做标识
  * production，此模式默认启用插件有：
    * FlagDependencyUsagePlugin
    * FlagIncludedChunksPlugin
    * ModuleConcatenationPlugin // 作用域提升 scope hosting
    * NoEmitOnErrorsPlugin // 遇到错误代码不跳出
    * OccurrenceOrderPlugin
    * SideEffectsFlagPlugin
    * UglifyJsPlugin // js代码压缩

所以选择模式后，这些插件不需要再进行配置。

## 环境区分问题

我们默认配置目的为上述目的，在这个前提下，简述下配置中可能存在的问题。

1. hot热更新模式不支持文件名使用hash，所以output下的filename和chunkFilename需要区分开发和生产模式。
2. dev-server下，开发服务启动后需要静态页，我们需要`html-webpack-plugin`插件配合，`HtmlWebpackPlugin`配置的filename需和devServer的contentBase的路径匹配才能在浏览器打开服务地址后读取到html文件，所以HtmlWebpackPlugin配置在开发和生产模式尽量分开。
3. 开发模式要保证每次修改后编译的速度够快，所以部分插件在开发模式下不需要使用，如css提取，代码压缩，所以相关插件只在生产模式下配置。

## 变动

## 缓存固化