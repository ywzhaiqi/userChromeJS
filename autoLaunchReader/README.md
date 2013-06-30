autoLaunchReader.uc.js
======================

通过点击按钮调用阅读扩展或脚本进行阅读，也可通过添加地址自动调用。个人 小说阅读脚本和 Evernote Clearly 配合使用。

## 特性

 - 点击按钮手动调用阅读工具。
 - 输入地址后，在启用模式下，匹配地址会自动调用。
 - 小说阅读脚本支持的网站会优先调用，失败后会再次调用其它工具（需小说阅读脚本 2.0+）。

## 支持的阅读工具

按照顺序查找调用

 1. [小说阅读脚本 for Greasemonkey](https://userscripts.org/scripts/show/165951)
 2. [Evernote Clearly :: Firefox 附加组件 - Mozilla Add-ons](https://addons.mozilla.org/zh-cn/firefox/addon/clearly/)
 3. [Readability 中文增强版 for Greasemonkey](https://userscripts.org/scripts/show/163581)

## 说明

按钮左键点击调用阅读工具，右键点击弹出菜单，`设置自动启用的站点` 点击后弹出设置对话框。

#### 启用禁用自动阅读

![按钮2种状态](按钮2种状态.png)

#### 弹出菜单

![弹出的菜单](弹出的菜单.png)

#### 设置自动启用站点对话框

![设置自动启用站点对话框](设置自动启用站点对话框.png)

**输入框1**：按`确定` 按钮或 输入框内 `确定键` 输入结果，地址经过简单处理，`原始地址` 显示当前页面的地址（未处理）。

**输入框2**：全部地址列表，一行一个地址。

**地址格式说明**

 - 格式一： 用 `*` 匹配地址，示例：`http://www.cnbeta.com/articles/*.htm`
 - 格式二： 开头 `re;`，后面接正则表达式，示例：`re;^http://www\.cnbeta\.com/articles/\d+\.htm$`

## 调用命令

通过 鼠标手势 等程序调用

    autoReader.launch();

## 未完善的

 - Evernote Clearly 修改版
 	- 加入中文下一页关键字，同时加入ajax头信息（防乱码）
 	- 原扩展默认立即加载所有页面，故类似小说网站的，会从当前页加载到最后一页，可能会很卡。