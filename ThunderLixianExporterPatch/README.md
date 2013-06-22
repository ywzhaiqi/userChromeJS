ThunderLixianExporterPatch.uc.js
================================

迅雷离线直接导出 IDM.ef2，需配合 [ThunderLixianExporter.use.js](http://binux.github.io/ThunderLixianExporter/master/ThunderLixianExporter.user.js) 使用。

### 写这个脚本的原因

 - 本人拥有免费的 18G 迅雷离线账号，用了上面的 GM 脚本就可以提取出下载地址下载。
 - 本人用 IDM 来下载资源，原 GM 脚本导出很麻烦，需要很多步骤，故写了这个 uc 脚本实现一键导出。

### 说明

 - 导出路径为 firefox 下载保存的文件夹（即 config 中的 browser.download.dir）
 - 导出名字为 idm.ef2、idm-1.ef2、idm-2.ef2....