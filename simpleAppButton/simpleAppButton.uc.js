// ==UserScript==
// @name           simpleAppButton.uc.js
// @namespace      ywzhaiqi@gmail.com
// @description    launch application by left click, middle click, right click
// @note           第一次启动需从定制窗口中拖出按钮
// @include        main
// @charset        UTF-8
// ==/UserScript==

location == "chrome://browser/content/browser.xul" && (function () {

	// 依次为鼠标左键、中键、右键点击路径。支持相对和绝对路径
	var left_click_path = "\\chrome";
	var middle_click_path = "C:\\Program Files\\Internet Explorer\\IEXPLORE.EXE";
	var right_click_path = "C:\\Windows\\notepad.exe";

	// 图标
	var image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADcklEQVQ4jWWT7U+aBxTFn+/8LfswkqbTJWucMZuN6zTrXupmUzur9X2uIGq164xWFOO68PJIsYCo6GQIxaFF0cegRkBofKhWoKXosCjVDbvalgS9Zx/arJv7JTc3J7nnfjqHYY6hNbuEPfopVmdbDGqt8wda6/yBzra43qOfYrVml/D4/T/IDA5Bm2ZCrRzl0m4+BE8gDE8gDO+b7Q6EoTJx6VbNhFpmcAj+YxbJDILKLhOnveOisRkPxpxuMjvdMDvdr/WMl8ZmvBib8ZLO5qKyjmFOJDO8fVLV/au6QWWBVG+HvHcYS9+VIVz1Ce43n8Mwq0CHdhxS/W9vxo4GlYVKO4bUDMMwTGWXWZhdrUx/06LF100aGqgpx37dO3Rw6wRemN4jF1sMjb2NamU/40KLgr6VdqFcJqfsakW6+PqAkDnbMsievMQis0yNzEsqLDeexgtzBlIrp5AKZ6H/thgPnv6IhY0voPflo8FZgDOSGzhZIsdp8W2WyW8yhIQVOsqsG0FeTR/tKzLwjMuiV+FsvNzJpX7zLfy+b6LVnatwhM9Q1+x5ZFzuoxNV/cgV6ULMqVpd6oN6M3KabCi8akQ7a4TS7IJmyA5W1YY5fhI7z514uKfAfPRzXBttRI7EiqwGK96vMaSYHIk59dG1u5R3/S4qjH5S8nF4t5L05NlLDE77qddqgXZyhIycEnJrPV3sMeJTKUd5bU58KLGkmKJuZyhfyqGgfRpiexgdy1uYeryH4O5zjEw7cPiKx/7TO0hsiHAQyUWZeg6FrAef9SzgnNQZYkrkC+zZmwtU0ruEclOI6rkNKPk4WdbimFsepMODARz91UxHu7lY95dQsf4eig08FfZ6UXRzgWXEWp/wS4U7XT7E44IxgPO/rODi+BrE06tIxktx9EcBjrazcPjwXZhmf0KlJYgKUxBFfffSlVrf62iLR1fVl03rVDsRoStzG7iytElidwTWFSVtrn+FROBj8npK0TK7TN9PRVFte0R1o6vqt1E28ALR+CNONBujRk8crfcT6A7toieUwI21J2jmY2jwxyDxbEHsikE0+ZgTGfhjfXDwgtbFmLrJu53uXt8lTTQJw2aS9JtJsNE/qTO4iyb/dvqHxZha5Dhm/jddvriwcy3BKiN7IXYjmVJFkyl5ZC/U+SDBtvvi/6vz31LBdk6sWYzpAAAAAElFTkSuQmCC";

	var navigator = document.getElementById("navigator-toolbox");
	if (!navigator || navigator.palette.id !== "BrowserToolbarPalette")
		return;

	var appButton = document.createElement('toolbarbutton');
	appButton.id = "mAppButton-1";
	appButton.setAttribute("label", "自定义按钮");
	appButton.setAttribute("tooltiptext", "左键点击启动，右键点击启动");
	appButton.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
	appButton.setAttribute("removable", "true");
	appButton.setAttribute("image", image);

	appButton.addEventListener("click", function(event){
		if(event.button == 0){
			exec(handlePath(left_click_path));
		}else if(event.button == 1){ 
			exec(handlePath(middle_click_path));
		}else if(event.button == 2){  
			exec(handlePath(right_click_path));
		}

	}, false);

	navigator.palette.appendChild(appButton);

	updateToolbar("mAppButton-1");

	var FF_PATH = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsILocalFile).path;

	function handlePath(path){
		path = path.replace(/\//g, '\\').toLocaleLowerCase();
		if (/^(\\)/.test(path)) {
			return FF_PATH + path;
		}

		return path;
	}

	function exec(path, args) {
		args = args || [];
		var args_t = args.slice(0);
		for (var i = 0; i < args_t.length; i++) {
			args_t[i] = args_t[i].replace(/%u/g, gBrowser.currentURI.spec);
		}

		var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
		file.initWithPath(path);
		if (!file.exists()) {
			Cu.reportError('File Not Found: ' + path);
			return;
		}

		if (!file.isExecutable()) {
			file.launch();
		} else {
			var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
			process.init(file);
			process.run(false, args_t, args_t.length);
		}
	}

	 function updateToolbar(buttonId) {
		let toolbars = Array.slice(document.querySelectorAll('#navigator-toolbox > toolbar'));
		toolbars.forEach(function (toolbar) {
			var currentset = toolbar.getAttribute("currentset");
			if (currentset.split(",").indexOf(buttonId) < 0)
				return;
			toolbar.currentSet = currentset;
			try {
				BrowserToolboxCustomizeDone(true);
			} catch (ex) {}
		});
	}

})()
