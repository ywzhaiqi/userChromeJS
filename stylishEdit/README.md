# stylish0.5_edit.uc

为 Stylish 增加外部编辑器、颜色选择、添加 !important 功能。**修复了原脚本只能在纯文本下编辑的情况（即使用时需把 extensions.stylish.editor 设为 1，默认为0）。现在无需设置也能使用。**

![效果图](stylish0.5_edit.uc.js.png)

## 说明

 - 第62行 EDITOR\_PATH 为编辑器路径，如果空则为 about:config 中 "view_source.editor.path" 的路径。