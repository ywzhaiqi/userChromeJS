
# addMenuPlus

Base on [Griever/addMenu.uc.js](https://github.com/Griever/userChromeJS/tree/master/addMenu). Now not only can add menu, you can modify the menu.

### Add Variables

 - %TITLES%, simple title.
 - %FAVICON_BASE64%, Favicon's Base64.
 - %IMAGE_BASE64%, Image's Base64.

### Modify the menu

	{
		id: "menu_firebug_firebugInspect",
		accesskey: "F"
	},


## 我修改的说明

 1. 增加 修改原菜单的功能（克隆一个，隐藏原来的）。可修改菜单名称、快捷键等各种属性或移动位置。
 2. 添加 %TITLES% 参数，简短的标题。
 3. 添加 %FAVICON_BASE64% 参数，站点图标的 base64
 4. 添加 %IMAGE_BASE64% 参数，图片的 BASE64

