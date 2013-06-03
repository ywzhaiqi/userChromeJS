
addMenuPlus.uc.js
=================

Base on [Griever/addMenu.uc.js](https://github.com/Griever/userChromeJS/tree/master/addMenu). Now not only can add menu, you can modify the menu.

### Add Variables

 - %TITLES%, simple title.
 - %FAVICON_BASE64%, Favicon's Base64.
 - %IMAGE_BASE64%, Image's Base64.

### Modify the menu

modify the firebug key

	page({
		id: "menu_firebug_firebugInspect",
		accesskey: "F",
        clone: false  //
	});


中文说明
--------

#### 可添加的范围

 - page: 页面右键菜单
 - tab: 标签右键
 - app: 左上角橙色菜单
 - too: 工具菜单

二级子菜单

    PageMenu, TabMenu, ToolMenu, AppMenu

#### 标签的介绍

    label       标签的名字
    accesskey   快捷键
    exec        启动外部应用程序。（我新增相对路径。 \\ 代表当前配置的路径，例：\\Chrome 配置下的Chrome文件夹）
    keyword     指定了关键字的书签和搜索引擎
    text        复制你想要的字符串到剪贴板，可与 keyword, exec 一起使用
    url         打开你想要的网址
    where       打开的位置 (current, tab, tabshifted, window)
    condition   菜单出现的条件 (select, link, mailto, image, media, input, noselect, nolink, nomailto, noimage, nomedia, noinput)
    oncommand/command  自定义命令
    image       添加图标 （对应 图标 url 或 base64）
    style       添加样式

    id          标签的ID（我新增的，修改原菜单用）
    position/insertBefore/insertAfter: 位置的设置（3选1），position: 1,  insertBefore: "id",  insertAfter: "id"


#### 可利用的变量

    %EOL%            改行(\r\n)
    %TITLE%          标题
    %TITLES%         简化标题（我新增的，来自faviconContextMenu.uc.xul.css）
    %URL%            地址
    %SEL%            选取范围内的文字
    %RLINK%          链接的地址
    %IMAGE_URL%      图片的 URL
    %IMAGE_BASE64%   图片的 Base64（我新增的）
    %IMAGE_ALT%      图片的 alt 属性
    %IMAGE_TITLE%    图片的 title 属性
    %LINK%           链接的地址
    %LINK_TEXT%      链接的文本
    %RLINK_TEXT%     链接的文本
    %MEDIA_URL%      媒体 URL
    %CLIPBOARD%      剪贴板的内容
    %FAVICON%        Favicon（站点图标） 的 URL
    %FAVICON_BASE64% Favicon 的 Base64（我新增的）
    %EMAIL%          E-mail 链接
    %HOST%           当前网页(域名)
    %LINK_HOST%      当前网页(域名)
    %RLINK_HOST%     当前网页(域名)

    %XXX_HTMLIFIED%  转义后的变量 （XXX 为 上面的 TITLE 等）
    %XXX_HTML%       转义后的变量
    %XXX_ENCODE%     encodeURIComponent 后的变量

简易的变量

    %h               当前网页(域名)
    %i               图片的 URL
    %l               链接的 URL
    %m               媒体的 URL
    %p               剪贴板的内容
    %s               选取的文字列
    %t               标题
    %u               URL


示例
--------

示例：页面右键添加一个菜单

    page({
        label: "复制链接文本",
        text: "%LINK_TEXT%",
    });

示例：页面右键添加多个菜单

    page([
        {
            label: "复制链接文本",
            text: "%LINK_TEXT%",
        },
        { },  // 分隔条
        {
            label: '复制图像base64',
            text: "%IMAGE_BASE64%",
            condition: "image",
        }
    ]);

示例：页面右键添加子菜单

    var pagesub = PageMenu({ label: "子菜单", accesskey: "z" });
    pagesub([
        {
            label: "Google Translate",
            url: "http://translate.google.cn/translate?u=%u",
            condition: "nolink",
            accesskey: "t",
        },
        {
            label: "Google docs",
            url  : "http://docs.google.com/viewer?url=%l",
            accesskey: "d",
            where: "tab",
        },
        {
            label: "重新加载配置",
            accesskey: "r",
            oncommand: "setTimeout(function(){ addMenu.rebuild(true); }, 10);"
        }
    ]);

示例：菜单出现的条件，排除了链接、图片、输入框、选择等多个条件

    page({
        label: "snaplinks批量操作模式",
        condition: "nolink noimage noinput noselect",
        oncommand: "snapLinks.init();"
    });

示例：修改 firebug 快捷键

    page({
        id: "menu_firebug_firebugInspect",
        accesskey: "F",
        clone: false  // 直接修改原菜单，还原回去需重启后生效
    });

示例：打开相对路径程序或文件夹

    page({
        label: "执行相对路径程序",
        // exec: "\\1\\base64.exe",  // 执行当前配置文件夹下的程序
        exec: "\\Chrome"  // 打开当前配置下的Chrome文件夹
    });

示例：添加图标

    page({
        label: "图标测试菜单",
        image: "chrome://browser/content/abouthome/bookmarks.png"
        // 或
        // image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABxElEQVQ4jZXQzYsScRzH8d/f16lTFCwRdOoSUYddtlrUaXTVEdR1xqfysLtUrC2EujNjbplPjIGtJIZB6YLMjqu105/w7tQhMB8+99f7C18hVpiiKGiaRjqdJplMsor5B6dSKWzbxnVdVFVdL6CqKuPxmMlkgmmaxOPx9QKapmHbNt1uF0VREEKISCRCOBxmd3d3eSyRSDAcDmk2m4RCIYLBIPl8nsFggCzLiwOyLBOLxej3+7TbbSqVCuVymVqtRqPRQJKk+QE5bSLnPhGNRrEsi06ng2VZtFot6vU61WoVn883Hz/TDLLmhOSJQ/j1N3q9HqVSiUAggCzLSJKE1+udjyXNIKs7VLq/KZ+5hI/HbGd6+P3+5c/yqQYp3eHdmcvL6pT900sK7V94Ds656/+4OOBN6CSLDuXPLocfpqjFC56bE45bP9nKjbjjNf8f2Eno7BUcjI7L4fspe4ULMrrDm8aMzRcjbnuMxde3ckP0zhX7p5fE3tqkTxzy9RmPsiM2dpZgIYS4r32n0L4iY0xIFh2O6jMeZkfceroCFkKIe4qF5+Cco9qMV9UZD1I/uPl4Rfx3G7LFdd9Xrj35wo3t9fAfyK1fDftrXK0AAAAASUVORK5CYII="
    });


## 我修改的说明

 1. 增加 修改原菜单的功能（克隆一个，隐藏原来的）。可修改菜单名称、快捷键等各种属性或移动位置。
 2. 添加 %TITLES% 参数，简短的标题。
 3. 添加 %FAVICON_BASE64% 参数，站点图标的 base64
 4. 添加 %IMAGE_BASE64% 参数，图片的 BASE64

