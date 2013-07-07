uSuper_preloader.uc.js
======================

基于 NLF 的 Super_preloader（版本 2.0.22）修改而来的 uc脚本。

## 特性

 - 保持原有功能
 - 增加对 noscript 的支持
 - 精简了代码，去掉了其它浏览器的兼容等
 - 自动监测数据库文件是否修改

## 使用说明

uSuper_preloader.uc.js 脚本文件
uSuper_preloader.db.js 数据库文件

 - **必须**，兼容原数据库
 - 数据库文件，默认路径为 Chrome 目录下的 `Local\uSuper_preloader.db.js`（可在代码里更改）。
 - 删除了无用的数据，只保留了必须的。
 - 增加了一些站点。

## TODO

 - 保存设置无需刷新页面