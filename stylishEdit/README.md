# stylish0.5_edit.uc

为 Stylish 添加外部编辑器、颜色选择、自动添加 !important 功能。

![效果图](stylish0.5_edit.uc.js.png)

## 说明

 - 使用时需把 extensions.stylish.editor 设为 1（默认0）。
 - 第62行 EDITOR\_PATH 为编辑器路径，如果空则为 about:config 中 "view_source.editor.path" 的路径。
 - 改了后原输入框没有了代码高亮。