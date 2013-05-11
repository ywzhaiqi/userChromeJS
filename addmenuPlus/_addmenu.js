// 可以导入多文件的配置。默认在这个文件加载后执行。
// include('');

app([
	{label: "速记器",
		oncommand: "Scratchpad.openScratchpad();",
		insertAfter: "appmenu_webDeveloper",
	},
	{label: "错误控制台",
		oncommand: "toJavaScriptConsole();",
		insertAfter: "appmenu_webDeveloper",
	},
]);

// app({
// 	label: "重启浏览器",
// 	oncommand: "Application.restart();"
// });

page([
	// {
	// 	id: "context-inspect",
	// 	insertBefore: 'menu_firebug_firebugInspect'
	// },
	{	// 改保存链接快捷键为 S
		id: "context-savelink",
		accesskey: "s"
	},
	{	// 给 Firebug 换个快捷键
		id: "menu_firebug_firebugInspect",
		accesskey: "F"
	},
]);


tab([
	{},
	{
		label: "复制标题",
		text: "%TITLE%",
		accesskey: "s"
	},
	{
		label: "复制标题+地址",
		text: "%TITLE%\n%URL%",
		accesskey: "d"
		
	},
	{	
		label: "复制标题+地址(简短)",
		text: "%TITLES%\n%URL%",
		accesskey: "f"
	},
	{},
	{	// 标签的右键菜单中加入复制图标网址的功能
		label: "复制 Favicon 的 URL",
		text: "%FAVICON%",
		accesskey: "g"
	},
	{
		label: "复制 Favicon 的 base64",
		text: "%FAVICON_BASE64%",
		accesskey: "h",
	},
]);

page({
	label: "复制链接文本",
	accesskey: "c",
	text: "%LINK_TEXT%",
	insertAfter: "context-copylink"
});

page({
	label: "DOM Inspector",
	accesskey: "D",
	oncommand: "inspectDOMNode(gContextMenu.target);",
	insertBefore: "menu_firebug_firebugInspect"
});

// 替换 openImgRar.uc.js。 打开图像rar
page({
	label: "打开图像RAR",
	accesskey: "R",
	condition: 'image',
	insertAfter: "context-copyimage",
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
});

page({
	label: '复制图像base64',
	// url : 'http://www.google.com/searchbyimage?image_url=%IMAGE_URL%',
	text: "%IMAGE_BASE64%",
	// accesskey: "s",
	insertAfter: "context-copyimage",
	condition: "image"
});
page({
	label: 'Google 相似图片搜索',
	url : 'http://www.google.com/searchbyimage?image_url=%IMAGE_URL%',
	accesskey: "s",
	insertAfter: "context-copyimage",
	condition: "image"
});

// 自定义子菜单
var pagesub = PageMenu({ label: "子菜单", accesskey: "z" });
pagesub([
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
	{label: "Web Archive",
		url: "http://web.archive.org/web/*/%u",
		accesskey: "w",
		condition: "nolink"
	},
	{label: "Web Archive",
		accesskey: "w",
		url: "http://web.archive.org/web/*/%l",
	},
	{  },
	{label: "在侧边栏打开",
		condition: "noselect nomedia noinput nomailto",
		ccesskey: "b",
		oncommand: function(event) {
			var title = gContextMenu.onLink? gContextMenu.linkText() : gContextMenu.target.ownerDocument.title;
			var url = gContextMenu.linkURL || gContextMenu.target.ownerDocument.location.href;
			openWebPanel(title, url);
		}
	},
	{},
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
	}
]);

var selmenu = PageMenu({ label: "选取范围", condition:"select", accesskey: "R", insertBefore: "context-sep-open" });
selmenu([
	{
		label: "站内搜索"
		,url: "http://www.google.com.hk/search?q=site:%HOST%+%SEL%"
	},{
		label: "高亮选择的文字"
		,oncommand: function(event) {
			var ts = {};
			addMenu.getRangeAll().forEach(function(range) {
				var word = range.toString();
				if (ts[word]) return;
				gFindBar._highlightDoc(true, word);
				ts[word] = true;
			});
		}
	},{
		label: "打开选取范围内的 URL",
		oncommand: function(event) {
			var urls = {};
			var reg = /h?t?tps?\:\/\/(?:\w+\.wikipedia\.org\/wiki\/\S+|[^\s\\.]+?\.[\w#%&()=~^_?.;:+*/-]+)/g;
			var matched = addMenu.focusedWindow.getSelection().toString().match(reg) || [];
			matched.forEach(function(url) {
				url = url.replace(/^h?t?tp/, "http");
				if (!urls[url])
					gBrowser.addTab(url);
				urls[url] = true;
			});
		}
	},{
		label: "打开选取范围内的链接",
		oncommand: function(event) {
			var urls = {};
			addMenu.$$('a:not(:empty)', null, true).forEach(function(a) {
				if (!urls[a.href] && /^http|^file/.test(a.href))
					gBrowser.addTab(a.href);
				urls[a.href] = true;
			});
		}
	},{
		label: "打开一组选取范围内新的链接",
		oncommand: function(event) {
			var urls = [];
			addMenu.$$('a:not(:empty)', null, true).forEach(function(a) {
				if (/^http|^file/.test(a.href))
					urls.push(a.href);
			});
			if (urls.length === 0) return;

			TabView._initFrame(function(){
				var item = TabView._iframe.focusedWindow.GroupItems.newGroup();
				urls.forEach(function(url, i){
					var tab = gBrowser.addTab(url);
					TabView.moveTabTo(tab, item.id);
					if (i === 0) gBrowser.selectedTab = tab;
				});
			});
		}
	},{
		label: "复制选取范围内的链接",
		oncommand: function(event) {
			var urls = {};
			addMenu.$$('a:not(:empty)', null, true).forEach(function(a) { urls[a.href] = true; });
			urls = Object.keys(urls);
			if (urls.length === 0) return;
			addMenu.copy(urls.join('\n'));
		}
	},{
		label: "打开选取范围内的图片",
		oncommand: function() {
			var urls = [];
			addMenu.$$('a:not(:empty)', null, true).forEach(function(a) {
				if (/\.(jpe?g|png|gif|bmp)$/i.test(a.href) && urls.indexOf(a.href) === -1)
					urls.push(a.href);
			});
			if (urls.length === 0) return;

			var htmlsrc = '<style> img { max-width: 100%; max-height: 100%; } </style>';
			htmlsrc += urls.map(function(u) '\n<img src="' + u + '">').join("");
			gBrowser.addTab("data:text/html;charset=utf-8," + encodeURIComponent(htmlsrc));
		}
	},{
		label: "勾选选取范围内的选择框"
		,icon: "checkbox"
		,checked: true
		,oncommand: function(event) {
			addMenu.$$('input[type="checkbox"]:not(:disabled)', null, true).forEach(function(a){
				a.checked = true;
			});
		}
	},{
		label: "取消勾选选取范围内的选择框"
		,icon: "checkbox"
		,oncommand: function(event) {
			addMenu.$$('input[type="checkbox"]:not(:disabled)', null, true).forEach(function(a){
				a.checked = false;
			});
		}
	},
]);
