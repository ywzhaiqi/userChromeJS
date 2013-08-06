// addMenu.uc.js ywzhaiqi 的配置文件
/*
◆ 可用的变量 ◆
%EOL%            改行(\r\n)
%TITLE%          页面标题
%URL%            页面URI
%SEL%            选取范围内的文字
%RLINK%          リンクアンカー先の URL  链接锚的目的地
%IMAGE_URL%      画像的 URL
%IMAGE_ALT%      画像的 alt 属性
%IMAGE_TITLE%    画像的 title 属性
%LINK%           リンクアンカー先の URL  链接锚的目的地
%LINK_TEXT%      链接的文本
%RLINK_TEXT%     链接的文本
%MEDIA_URL%      媒体 URL
%CLIPBOARD%      剪贴板的内容
%FAVICON%        Favicon 的 URL
%EMAIL%          E-mail 链接
%HOST%           当前网页(域名)
%LINK_HOST%      当前网页(域名)
%RLINK_HOST%     当前网页(域名)

%XXX_HTMLIFIED%  HTML エンコードされた上記変数（XXX → TITLE などに読み替える）
%XXX_HTML%       HTML エンコードされた上記変数
%XXX_ENCODE%     URI 编码， 类似 TITLE_ENCODE

◇ 簡易的な変数 ◇
%h               当前网页(域名)
%i               图片的 URL
%l               链接的 URL
%m               媒体的 URL
%p               剪贴板的内容
%s               選択文字列
%t               当前页面标题
%u               当前页面 URL

基本的に Copy URL Lite+ の変数はそのまま使えます。
大文字・小文字は区別しません。
*/


/* 
 * 可添加隐藏 PageMenu, TabMenu, ToolMenu, AppMenu
 * 详见 原程序。
 * 
 * 位置更改。
 *   - 可通过隐藏原菜单，加载新的菜单。
 * position: 1,  insertBefore: "id",  insertAfter: "id"
 */


// ===================== 左上角按钮菜单 ====================================

app([
	{
		label: "代码片段速记器",
		accesskey: "d",
		oncommand: "Scratchpad.openScratchpad();"	
	},
	{
		label: "错误控制台",
		accesskey: "c",
		oncommand: "toJavaScriptConsole();"
	},
	{  },   // 分隔条
	{
		label: "重新启动浏览器",
		// accesskey: "R",
		oncommand: "Application.restart();"
	},
]);

app({
	label: "使用 DOM Inspector 查看元素",
	insertAfter: "appmenu_webDeveloper",
	oncommand: function(){
		function o(event){
			if (event.type == 'click'){
				if (event.ctrlKey || event.button == 1) return;
				if (event.button == 0) inspectDOMNode(event.originalTarget);
				setTimeout(function(){
					document.removeEventListener('click', o, true);
					document.removeEventListener('mousedown', o, true);
					document.removeEventListener('mouseup', o, true);
				}, 10);
			}
			event.preventDefault();
			event.stopPropagation();
		}
		document.addEventListener('click', o, true);
		document.addEventListener('mousedown', o, true);
		document.addEventListener('mouseup', o, true);
	}
});


// ====================== 标签右键菜单 =======================================

tab([
	{	// 标签的右键菜单中加入复制图标网址的功能
		label: "复制 Favicon 的 URL",
		text: "%FAVICON%"
	},
	{
		label: "复制页面标题",
		text: "%TITLE%"
	},
	{
		label: "复制页面标题和链接",
		text: "%TITLE%\n%URL%"
	}
]);


// ==================== 菜单栏的“工具”菜单 ===================================

// tool({
// 	label: "使用 DOM Inspector 查看元素",
// 	position: 1,
// });


// ========================== 页面右键菜单 ===================================

/*
  替换 Context_LinkText.uc.js
  页面右键菜单中增加"对链接文本的操作：复制、打开与搜索"
*/
var pagesub = PageMenu({ 
	label: "链接文本",
	condition: "link",
	accesskey: "c",
	insertBefore:'context-copylink', 
});
pagesub([
	{
		label: "复制链接文本",
		// accesskey: "R",
		text: "%LINK_TEXT%"
	},
	{
		label: "打开链接文本",
		url: "%LINK_TEXT%",
		where: "tab"
	},
	{
		label: "搜索链接文本",
		text: "%LINK_TEXT%",
		keyword: "google",
		where  : "tab"
	},
]);

// 替换 openImgRar.uc.js。 打开图像rar
page({
	label: "打开图像rar",
	accesskey: "R",
	position: 1,
	condition: 'image',
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

// 开发工具
page({
	label: "DOM Inspector",
	accesskey: "D",
	oncommand: "inspectDOMNode(gContextMenu.target);",
	insertBefore: "menu_firebug_firebugInspect"
});


// 创建一个子菜单
// pagesub({ ... }) 里面可以添加子菜单
var pagesub = PageMenu({ label: "子菜单", accesskey: "a" });
// 里面可以放一个数组
pagesub([
	{
		label : "查看当前链接网址的源代码",
		url   : "view-source:%l",
		// accesskey: "r",
		where : "tab"
	},
	{
		label: "用 Google docs 打开链接",
		url  : "http://docs.google.com/viewer?url=%l",
		where: "tab"
	},
	{
		label: "添加到 Google 书签",
		url: "http://www.google.co.jp/bookmarks/mark?op=add&bkmk=%u&title=%TITLE_ENCODE%&annotation=%SEL_ENCODE%",
		condition: "nolink"
	},
	{
		label: "Google 翻译当前页面",
		url: "http://translate.google.cn/translate?u=%u",
		condition: "nolink",
		accesskey: "t"
	},
	{
		label: "Google 快照",
		url: "http://webcache.googleusercontent.com/search?q=cache:%u",
		condition: "nolink",
		accesskey: "c"
	},
	{
		label: "当前链接的 Google 快照",
		url: "http://webcache.googleusercontent.com/search?q=cache:%l",
		accesskey: "c"
	},
	{
		label: "Web Archive",
		url: "http://web.archive.org/web/*/%u",
		condition: "nolink"
	},
	{
		label: "当前链接的 Web Archive",
		url: "http://web.archive.org/web/*/%l",
	},
	{  }, // label やアクションが登録されていないので区切り
	{
		label: "当前链接在侧边栏打开",
		condition: "noselect nomedia noinput nomailto",
		ccesskey: "b",
		oncommand: function(event) {
			var title = gContextMenu.onLink? gContextMenu.linkText() : gContextMenu.target.ownerDocument.title;
			var url = gContextMenu.linkURL || gContextMenu.target.ownerDocument.location.href;
			openWebPanel(title, url);
		}
	},
	{},
	{
		label: "重新加载配置",
		accesskey: "r",
		oncommand: "setTimeout(function(){ addMenu.rebuild(true); }, 10);"
	}
]);


// IE 等外部程序菜单
var execute = PageMenu({ label: "外部应用程序", accesskey: "E", class: "exec" });
execute([
	{
		label: "启动 Internet Explorer",
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
		label: "启动 Opera",
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
		label: "启动 Chrome",
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
		label: "启动 Chrome(禁用扩展)",
		text: "%u -disable-extensions",
		exec: Services.dirsvc.get("LocalAppData", Ci.nsILocalFile).path + "\\Google\\Chrome\\Application\\chrome.exe",
		accesskey: "E",
		condition: "nolink"
	},
	{
		label: "用 Chrome(禁用扩展) 打开当前链接",
		text: "%l -disable-extensions",
		exec: Services.dirsvc.get("LocalAppData", Ci.nsILocalFile).path + "\\Google\\Chrome\\Application\\chrome.exe",
		accesskey: "E",
	}
]);



// command 属性からオリジナルの hidden 等を連動させる関数
function syncHidden(event) {
	Array.slice(event.target.children).forEach(function(elem){
		var command = elem.getAttribute('command');
		if (!command) return;
		var original = document.getElementById(command);
		if (!original) {
			elem.hidden = true;
			return;
		};
		elem.hidden = original.hidden;
		elem.collapsed = original.collapsed;
		elem.disabled = original.disabled;
	});
};

// 页面右键菜单移到2级目录菜单
new function () {
	var items = [
		{ command: 'context-bookmarkpage', icon: 'starbutton' }
		,{ command: 'context-savepage' }
		,{ label: '复制当前页面的URL', text: '%URL%' }
		,{ command: 'context-sendpage', style:'display:none;' }
		,{ command: 'context-viewsource' }
		,{ command: 'context-viewinfo' }
		,{ command: 'context-viewbgimage' }
		,{ command: 'context-sep-viewbgimage' }
		,{ command: 'context-back', onclick:'checkForMiddleClick(document.getElementById("Browser:BackOrBackDuplicate"), event);' }
		,{ command: 'context-forward', onclick:'checkForMiddleClick(document.getElementById("Browser:ForwardOrForwardDuplicate"), event);' }
		,{ command: 'context-reload', onclick:'checkForMiddleClick(document.getElementById("Browser:ReloadOrDuplicate"), event);' }
		,{ command: 'context-stop', onclick:'checkForMiddleClick(document.getElementById("Browser:Stop"), event);' }
		,{ command: 'context-sep-stop' }
		,{
			label: '打开主页'
			,icon: 'home'
			,oncommand: 'BrowserGoHome(event);'
			,onclick:'checkForMiddleClick(document.getElementById("Browser:Home"), event);'
		}
	];
	var menu = PageMenu({condition: 'normal', insertBefore: 'context-bookmarkpage', icon: 'starbutton', onpopupshowing: syncHidden });
	menu(items);
	page({ condition:'normal', insertBefore:'context-bookmarkpage' });
	items.forEach(function(it){
		if (it.command)
			css('#contentAreaContextMenu #' + it.command + '{ display: none !important; }')
	});
};

// 页面链接右键菜单移到2级目录菜单
new function () {
	var items = [
		{ command: 'context-copylink' }
		,{ command: 'context-copyemail' }
		,{
			label: '打开当前链接'
			,icon: 'url'
			,oncommand: 'document.getElementById("context-openlinkincurrent").doCommand();'
			,onclick: 'checkForMiddleClick(document.getElementById("context-openlinkintab"), event);'
		}
		,{ command: 'context-openlinkintab' }
		,{ command: 'context-openlinkprivate' }
		,{ command: 'context-openlink' }
		,{ command: 'context-sep-open' }
		,{ command: 'context-bookmarklink' }
		,{ command: 'context-savelink' }
		,{ command: 'context-sendlink', style:'display:none;' }
		,{ command: 'context-sep-copylink', style:'display:none;' }
	];
	var menu = PageMenu({ condition: 'link', insertBefore:'context-copylink', icon:'copy2', onpopupshowing: syncHidden});
	menu(items);
	page({ condition:'link', insertBefore:'context-sep-copylink' });
	items.forEach(function(it){
		if (it.command)
			css('#contentAreaContextMenu[addMenu~="link"] #' + it.command + '{ display: none !important; }')
	});
};

// 页面图片右键菜单移到2级目录菜单
new function () {
	var items = [
		{ command: 'context-viewimage' }
		//,{ command: 'context-reloadimage' }
		,{ command: 'context-copyimage-contents' }
		,{ command: 'context-copyimage' }
		,{ command: 'context-sep-copyimage' }
		,{ command: 'context-saveimage' }
		,{ command: 'context-sendimage', style:'display:none;' }
		,{ command: 'context-viewimageinfo' }
		,{ command: 'context-setDesktopBackground' }
		,{}
		,{
			label: 'Google 类似图片搜索'
			,url : 'http://www.google.com/searchbyimage?image_url=%IMAGE_URL%'
		}
	];
	var menu = PageMenu({ condition:'image', insertBefore:'context-viewimage', icon:'image', onpopupshowing: syncHidden});
	menu(items);
	page({ condition:'image', insertBefore:'context-setDesktopBackground' });
	items.forEach(function(it){
		if (it.command)
			css('#contentAreaContextMenu[addMenu~="image"] #' + it.command + '{ display: none !important; }')
	});
};

// 页面输入框右键菜单移到2级目录菜单
new function () {
	var items = [
		{ command: 'context-undo' }
		//,{ command: 'context-sep-undo' }
		,{ command: 'context-cut' }
		,{ command: 'context-paste' }
		,{ command: 'context-delete' }
		,{ command: 'context-sep-paste' }
		,{ command: 'context-keywordfield' }
		,{ command: 'spell-separator', style:'display:none;' }
		,{ command: 'spell-check-enabled' }
		,{ command: 'spell-add-dictionaries-main' }
		,{ command: 'spell-dictionaries' }
	];
	var menu = PageMenu({ condition:'input', insertBefore:'context-undo', onpopupshowing: syncHidden });
	menu(items);
	items.forEach(function(it){
		if (it.command)
			css('#contentAreaContextMenu[addMenu~="input"] #' + it.command + '{ display: none !important; }')
	});
};


/**
 * ファイルメニューなどを右クリックメニューから無理矢理使えるようにする
 */

// 既存の menupopup をサブメニューとして利用する関数
// menu に subpopup 属性が必要
function subPopupshowing(event) {
	var subPopup = document.getElementById(event.currentTarget.getAttribute('subpopup'));
	if (!subPopup) return;

	var popup = event.target;
	if (!popup.hasAttribute('style')) {
		popup.style.cssText = [
			'-moz-appearance: none !important;'
			,'max-height: 1px !important;'
			,'border: none !important;'
			,'background: transparent !important;'
			,'opacity: 0 !important;'
		].join(' ');
	}
	popup.style.setProperty('min-width', (popup._width || 100)+'px', 'important');

	var { screenY, screenX, width } = popup.boxObject;
	var popupshown = function(evt) {
		var utils = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils);
		utils.sendMouseEvent('mousemove', screenX, screenY, 0, 1, 0);
		subPopup.removeEventListener('popupshown', popupshown, false);
		popup._width = subPopup.boxObject.width;
	};
	setTimeout(function() {
		subPopup.addEventListener('popupshown', popupshown, false);
		subPopup.openPopupAtScreen(screenX-2, screenY-2, true);
	}, 0);
};

// 右クリックメニューに ファイル・ブックマークなどを作る
// 自定义右键菜单，如 文件 菜单等
PageMenu({
	label: '文件菜单'
	,accesskey: 'F'
	,subpopup: 'menu_FilePopup'
	,onpopupshowing: subPopupshowing
});
PageMenu({
	label: '书签菜单'
	,accesskey: 'B'
	,subpopup: 'bookmarksMenuPopup'
	,onpopupshowing: subPopupshowing
});
PageMenu({
	label: '后退菜单'
	,accesskey: 'B'
	,subpopup: 'backForwardMenu'
	,onpopupshowing: subPopupshowing
});

/**
 * 選択範囲を色々するスクリプト群
 * 选取范围
 */
var selmenu = PageMenu({ label: "选取范围", condition:"select", accesskey: "R", insertBefore: "context-sep-open" });
selmenu([
	{
		label: "站内搜索"
		,url: "http://www.google.com.hk/search?q=site:%HOST%+%SEL%"
	}
	,{
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
	}
	,{
		label: "打开选取范围内的 URL"
		,oncommand: function(event) {
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
	}
	,{
		label: "打开选取范围内的链接"
		,oncommand: function(event) {
			var urls = {};
			addMenu.$$('a:not(:empty)', null, true).forEach(function(a) {
				if (!urls[a.href] && /^http|^file/.test(a.href))
					gBrowser.addTab(a.href);
				urls[a.href] = true;
			});
		}
	}
	,{
		label: "打开一组选取范围内新的链接"
		,oncommand: function(event) {
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
	}
	,{
		label: "复制选取范围内的链接"
		,oncommand: function(event) {
			var urls = {};
			addMenu.$$('a:not(:empty)', null, true).forEach(function(a) { urls[a.href] = true; });
			urls = Object.keys(urls);
			if (urls.length === 0) return;
			addMenu.copy(urls.join('\n'));
		}
	}
	,{
		label: "打开选取范围内的图片"
		,oncommand: function() {
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
	}
	,{
		label: "勾选选取范围内的选择框"
		,icon: "checkbox"
		,checked: true
		,oncommand: function(event) {
			addMenu.$$('input[type="checkbox"]:not(:disabled)', null, true).forEach(function(a){
				a.checked = true;
			});
		}
	}
	,{
		label: "取消勾选选取范围内的选择框"
		,icon: "checkbox"
		,oncommand: function(event) {
			addMenu.$$('input[type="checkbox"]:not(:disabled)', null, true).forEach(function(a){
				a.checked = false;
			});
		}
	},
]);


/**
 * 替换 googleImageSearch.uc.js
 * google 以图搜图脚本
 * 用下面的二级菜单替换
 */
// page({
// 	label: "Google 类似图片搜索",
// 	url: "http://www.google.com/searchbyimage?image_url=%i",
// 	condition: "image",
// 	where: "tab"
// });

// // 関数を書いてもいい
// page({
// 	label: "打开选取范围内的链接",
// 	condition: "select", // 表示する条件を自分で決める
// 	oncommand: function(event) {
// 		var sel = addMenu.focusedWindow.getSelection();
// 		var urls = {};
// 		for (var i = 0, len = sel.rangeCount; i < len; i++) {
// 			Array.forEach(sel.getRangeAt(i).cloneContents().querySelectorAll('a:not(:empty)'), function(a){
// 				if (!urls[a.href] && /^http|^file/.test(a.href))
// 					gBrowser.addTab(a.href);
// 				urls[a.href] = true;
// 			});
// 		};
// 	}
// });

// page({
// 	label: "选取范围内复选框的 ON/OFF",
// 	class: "checkbox",
// 	condition: "select",
// 	oncommand: function(event) {
// 		var win = addMenu.focusedWindow;
// 		var sel = win.getSelection();
// 		Array.slice(win.document.querySelectorAll('input[type="checkbox"]:not(:disabled)')).forEach(function(e) {
// 			if (sel.containsNode(e, true))
// 				e.checked = !e.checked;
// 		});
// 	}
// });