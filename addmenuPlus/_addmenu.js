// 可以导入多文件的配置。默认在这个文件加载后执行。 include('');
// 调整位置3种方法: insertBefore, insertAfter, position

// 添加样式
// css('\
// /* 右键菜单 */ \
// #context-savepage
// { display: none; !important; }\
// ')

// app({
//     label: "重启浏览器",
//     oncommand: "Application.restart();"
// });

page([
    {   // 给 Firebug 换个快捷键
        id: "menu_firebug_firebugInspect",
        accesskey: "F",
        clone: false
    },
]);

// Host Exceptions 设置显示条件
css('#exex-menu {display: none;}')
page({
    label: "Host Exceptions",
    oncommand: "ExEx.onCommand()",
    condition: "nolink noimage noselect nomedia noinput  nomailto"
})

// 标签右键菜单
tab([
    {
        label: "关闭右边所有的标签页",
        insertAfter: "context_closeOtherTabs",
        oncommand: function() {
            var tabs = gBrowser.mTabContainer.childNodes;
            for (var i = tabs.length - 1; tabs[i] != gBrowser.selectedTab; i--) {
                gBrowser.removeTab(tabs[i]);
            }
        }
    },
    {},
    {
        label: "复制标题",
        text: "%TITLE%",
        accesskey: "s"
    },
    // {
    //     label: "复制标题+地址",
    //     text: "%TITLE%\n%URL%",
    //     accesskey: "d"
    // },
    {
        label: "复制标题+地址(简短)",
        text: "%TITLES%\n%URL%",
        accesskey: "f"
    },
    {
        label: "复制所有标签标题+地址",
        class: "copy",
        oncommand: function(){
            let text = "";
            let tabs = gBrowser.mTabContainer.childNodes;
            for (let i = 0, l=tabs.length; i < l; i++) {
                let win = tabs[i].linkedBrowser.contentWindow;
                text += win.document.title + "\n" +
                    win.location.href + "\n";
            }

            Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(text);
        }
    },
    {},
    {   // 标签的右键菜单中加入复制图标网址的功能
        label: "复制 Favicon 的 URL",
        text: "%FAVICON%",
        accesskey: "g"
    },
    {
        label: "复制 Favicon 的 base64",
        text: "%FAVICON_BASE64%",
        accesskey: "h"
    }
]);

// 链接
css("#context-copylink {display: none}")
page([
    {
        label: "复制链接文本",
        accesskey: "C",
        text: "%LINK_TEXT%",
        insertAfter: "context-copylink",
        condition: "link noimage"
    },
    {
        label: "复制链接地址",
        accesskey: "Y",
        text: "%LINK%",
        insertAfter: "context-copylink",
        condition: "link noimage"
    },
])

// 图像
page([
    {
        label: 'Google 相似图片搜索',
        url : 'http://www.google.com/searchbyimage?image_url=%IMAGE_URL%',
        accesskey: "S",
        insertAfter: "context-viewimageinfo",
        condition: "image"
    },
    {
        label: '复制图像base64',
        text: "%IMAGE_BASE64%",
        insertAfter: "context-viewimageinfo",
        condition: "image"
    },
    {   // 替换 openImgRar.uc.js
        label: "打开图像RAR",
        accesskey: "R",
        condition: 'image',
        image: "moz-icon://file:///c:/program%20files/WinRAR/WinRAR.exe?size=16",
        insertBefore: "context-savevideo",
        oncommand: function(){
            var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
            try {
                var path = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getCharPref("browser.cache.disk.parent_directory") + "\\Cache\\" + new Date().getTime() + ".rar";
                file.initWithPath(path);
            } catch (e) {
                var path = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfLD", Components.interfaces.nsILocalFile).path + "\\Cache\\" + new Date().getTime() + ".rar";
            }
            file.initWithPath(path);
            Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist).saveURI(Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI((gContextMenu.mediaURL || gContextMenu.imageURL), null, null), null, null, null, null, file, null);
            setTimeout(function () {
                file.launch();
            }, 100);
        }
    }
]);


// 自定义子菜单，混杂
var pagesub = PageMenu({ label: "子菜单", accesskey: "z"});
pagesub([
    // {
    //     label: "用 Flvcd 解析当前页面",
    //     url: "http://www.flvcd.com/parse.php?kw=%URL_ENCODE%&flag=&format=high",
    //     condition: "nolink",
    //     where: "tab"
    // },
    // {
    //     label: "用 Flvcd 解析当前链接",
    //     url: "http://www.flvcd.com/parse.php?kw=%LINK_ENCODE%&flag=&format=high",
    //     where: "tab"
    // },
	{label: "Google Site Search",
		accesskey: "s",
		url: "javascript:q%20=%20%22%22%20+%20(window.getSelection%20?%20window.getSelection()%20:%20document.getSelection%20?%20document.getSelection()%20:%20document.selection.createRange().text);%20if%20(!q)%20q%20=%20prompt(%22%E8%AF%B7%E8%BE%93%E5%85%A5%E5%85%B3%E9%94%AE%E8%AF%8D:%22,%20%22%22);%20if%20(q!=null)%20{var%20qlocation=%22%20%22;qlocation=('http://www.google.com/search?num=30&hl=zh-CN&newwindow=1&q='+q+'&sitesearch='+location.host+'');window.open(qlocation);}%20void%200"
	},
	{label : "View Source",
		url   : "view-source:%l",
		accesskey: "s",
		where : "tab"
	},
	{label: "Google docs",
		url  : "http://docs.google.com/viewer?url=%l",
		accesskey: "d",
		where: "tab"
	},
	{label: "Google Translate",
		url: "http://translate.google.cn/translate?u=%u",
		condition: "nolink",
		accesskey: "t"
	},
	{label: "Google Web Cache",
		url: "http://webcache.googleusercontent.com/search?q=cache:%u",
		condition: "nolink",
		accesskey: "c"
	},
	{label: "Google Web Cache",
		url: "http://webcache.googleusercontent.com/search?q=cache:%l",
		accesskey: "c"
	},
	// {label: "Web Archive",
	// 	url: "http://web.archive.org/web/*/%u",
	// 	accesskey: "w",
	// 	condition: "nolink"
	// },
	// {label: "Web Archive",
	// 	accesskey: "w",
	// 	url: "http://web.archive.org/web/*/%l"
	// },
	{},
    {
        label: "Mouseover DOM Inspector",
        url: "javascript:void(z=document.body.appendChild(document.createElement('script')));void(z.language='javascript');void(z.type='text/javascript');void(z.src='http://slayeroffice.com/tools/modi/modi.js');void(z.id='modi');"
    },
    {},
    {
        label: "明文显示密码",
        condition: "input",
        url: "javascript:(function()%7Bvar%20IN,F;IN=document.getElementsByTagName('input');for(var%20i=0;i<IN.length;i++)%7BF=IN%5Bi%5D;if(F.type.toLowerCase()=='password')%7Btry%7BF.type='text'%7Dcatch(r)%7Bvar%20n,Fa;n=document.createElement('input');Fa=F.attributes;for(var%20ii=0;ii<Fa.length;ii++)%7Bvar%20k,knn,knv;k=Fa%5Bii%5D;knn=k.nodeName;knv=k.nodeValue;if(knn.toLowerCase()!='type')%7Bif(knn!='height'&&knn!='width'&!!knv)n%5Bknn%5D=knv%7D%7D;F.parentNode.replaceChild(n,F)%7D%7D%7D%7D)()"
    },
    {
        label: "页面可见区域截图",
        condition: "noinput",
        oncommand : function() {
            var canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
            canvas.width = content.innerWidth;
            canvas.height = content.innerHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawWindow(content, content.pageXOffset, content.pageYOffset, canvas.width, canvas.height, "rgb(255,255,255)");
            saveImageURL(canvas.toDataURL(), content.document.title + ".png",  null, null, null, null, document);
        }
    },
    {
        label: '页面所有区域截图',
        condition: "noinput",
        oncommand: function() {
            var canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
            canvas.width = content.document.documentElement.scrollWidth;
            canvas.height = content.document.documentElement.scrollHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawWindow(content, 0, 0, canvas.width, canvas.height, "rgb(255,255,255)");
            saveImageURL(canvas.toDataURL(), content.document.title + ".png",  null, null, null, null, document);
        }
    },
    {
        label : '浏览器界面截图',
        condition: "noinput",
        oncommand: function() {
            var canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
            canvas.width = innerWidth;
            canvas.height = innerHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawWindow(window, 0, 0, canvas.width, canvas.height, "rgb(255,255,255)");
            saveImageURL(canvas.toDataURL(), content.document.title + ".png",  null, null, null, null, document);
        }
    },
    { },
	{label: "在侧边栏打开",
		condition: "noselect nomedia noinput nomailto",
		ccesskey: "b",
		oncommand: function(event) {
			var title = gContextMenu.onLink? gContextMenu.linkText() : gContextMenu.target.ownerDocument.title;
			var url = gContextMenu.linkURL || gContextMenu.target.ownerDocument.location.href;
			openWebPanel(title, url);
		}
	},
	{ },
	{label: "重新加载配置",
		accesskey: "r",
		oncommand: "setTimeout(function(){ addMenu.rebuild(true); }, 10);"
	}
]);


// IE 等外部程序菜单
var execute = PageMenu({ label: "外部应用程序", accesskey: "E", class: "exec" });
execute([
	{
		label: "用 Internet Explorer 打开当前页面",
		text: "%u",
		exec: "C:\\Program Files\\Internet Explorer\\iexplore.exe",
		accesskey: "I",
		condition: "nolink"
	},
	{
		label: "用 Internet Explorer 打开当前链接",
		text: "%l",
		accesskey: "I",
		exec: "C:\\Program Files\\Internet Explorer\\iexplore.exe"
	},
	{
		label: "用 Chrome 打开当前页面",
		text: "%u",
		exec: Services.dirsvc.get("LocalAppData", Ci.nsILocalFile).path + "\\Google\\Chrome\\Application\\chrome.exe",
		accesskey: "C",
		condition: "nolink"
	},
	{
		label: "用 Chrome 打开当前链接",
		text: "%l",
		exec: Services.dirsvc.get("LocalAppData", Ci.nsILocalFile).path + "\\Google\\Chrome\\Application\\chrome.exe",
		accesskey: "C",
	},
	{
		label: "用 Chrome 打开当前页面(禁用扩展)",
		text: "%u -disable-extensions",
		exec: Services.dirsvc.get("LocalAppData", Ci.nsILocalFile).path + "\\Google\\Chrome\\Application\\chrome.exe",
		accesskey: "E",
		condition: "nolink"
	},
	{
		label: "用 Chrome 打开当前链接(禁用扩展)",
		text: "%l -disable-extensions",
		exec: Services.dirsvc.get("LocalAppData", Ci.nsILocalFile).path + "\\Google\\Chrome\\Application\\chrome.exe",
		accesskey: "E",
	},
    {
        label: "用 Opera 打开当前页面 ",
        text : "%u",
        exec : "C:\\Program Files\\Opera\\opera.exe",
        accesskey: "O",
        condition: "nolink"
    },
    {
        label: "用 Opera 打开当前链接",
        text : "%l",
        accesskey: "O",
        exec : "C:\\Program Files\\Opera\\opera.exe",
    },
]);

var selmenu = PageMenu({ label: "选取范围", condition:"select", accesskey: "R", insertBefore: "context-sep-open" });
selmenu([
	{
		label: "站内搜索"
		,url: "http://www.google.com.hk/search?q=site:%HOST%+%SEL%"
	},
    {
		label: "勾选所有选择框"
		,icon: "checkbox"
		,checked: true
		,oncommand: function(event) {
			addMenu.$$('input[type="checkbox"]:not(:disabled)', null, true).forEach(function(a){
				a.checked = true;
			});
		}
	},
    {
		label: "取消所有选择框"
		,icon: "checkbox"
		,oncommand: function(event) {
			addMenu.$$('input[type="checkbox"]:not(:disabled)', null, true).forEach(function(a){
				a.checked = false;
			});
		}
	},
]);