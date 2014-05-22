// ==UserScript==
// @name           SimpleDragModY
// @description    简单拖曳修改版 By ywzhiqi
// @include        chrome://browser/content/browser.xul
// @charset        UTF-8
// @version        1.1
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS
// @note           2014-5-21，增加：向下后台搜索文字。
// @note           2014-5-20，增加：“http://pan.baidu.com/s/1bn7uGmb 密码: jl4b” 的识别
// @note           2014-5-20，增加：如果在链接上选择文字，会优先打开该文字而不是链接。
// ==/UserScript==

if (window.SimpleDragModY) {  // 方便修改调试用，无需重启
	window.SimpleDragModY.uninit();
	delete window.SimpleDragModY;
}

window.SimpleDragModY = {
	init: function() {
		gBrowser.mPanelContainer.addEventListener("dragstart", this, false);
		gBrowser.mPanelContainer.addEventListener("dragover", this, false);
		gBrowser.mPanelContainer.addEventListener("drop", this, false);
		window.addEventListener("unload", this, false);
	},
	uninit: function() {
		gBrowser.mPanelContainer.removeEventListener("dragstart", this, false);
		gBrowser.mPanelContainer.removeEventListener("dragover", this, false);
		gBrowser.mPanelContainer.removeEventListener("drop", this, false);
		window.removeEventListener("unload", this, false);
	},
	handleEvent: function(event) {
		switch (event.type) {
			case "dragstart":
				this.startPoint = [event.screenX, event.screenY];
				this.sourceNode = event.target;
				event.target.localName == "img" && event.dataTransfer.setData("application/x-moz-file-promise-url", event.target.src);

				if (event.target.nodeName == "A") {
					var selectLinkText = document.commandDispatcher.focusedWindow.getSelection().toString();
					if (selectLinkText != "" && event.explicitOriginalTarget == document.commandDispatcher.focusedWindow.getSelection().focusNode) {
						event.dataTransfer.setData("text/plain", selectLinkText);
						event.dataTransfer.clearData("text/x-moz-url");
						event.dataTransfer.clearData("text/x-moz-url-desc");
						event.dataTransfer.clearData("text/x-moz-url-data");
						event.dataTransfer.clearData("text/uri-list");
					}
				}
				break;
			case "dragover":
				this.startPoint && (Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService).getCurrentSession().canDrop = true);
				break;
			case "drop":
				if (this.startPoint && event.target.localName != "textarea" && (!(event.target.localName == "input" && (event.target.type == "text" || event.target.type == "password"))) && event.target.contentEditable != "true") {
					event.preventDefault();
					event.stopPropagation();
					var [subX, subY] = [event.screenX - this.startPoint[0], event.screenY - this.startPoint[1]];
					var [distX, distY] = [(subX > 0 ? subX : (-subX)), (subY > 0 ? subY : (-subY))];
					var direction;
					if (distX > distY)
						direction = subX < 0 ? "L" : "R";
					else
						direction = subY < 0 ? "U" : "D";

					var url, searchText, 
						inBackground = (direction == "D") ? true : false;

					if (event.dataTransfer.types.contains("application/x-moz-file-promise-url")) { // 图片
						url = event.dataTransfer.getData("application/x-moz-file-promise-url");
					} else if (event.dataTransfer.types.contains("text/x-moz-url")) {  // 链接
						url = event.dataTransfer.getData("text/x-moz-url").split("\n")[0];
					} else {
						// http://pan.baidu.com/s/1bn7uGmb 密码: jl4b
						searchText = event.dataTransfer.getData("text/unicode").trim();
						// console.log(searchText)
						if (searchText.match(/^(?:http:|pan\.).*[\n\s]*密[码|碼][:：]?/i)) {
							url = searchText.replace(/\s*(提取)?密[码|碼][:：]?\s*/, '#');
							if (url.indexOf("...") != -1) {  // url 不完整的
								let html = event.dataTransfer.getData("text/html");
								let node = new DOMParser().parseFromString(html, 'text/html');
								if (node.links.length > 0)
									url = node.links[0].href + '#' + url.split('#')[1];
							}
						}
					}

					if (url) {
						let doc = event.target.ownerDocument || getBrowser().contentDocument;
						gBrowser.loadOneTab(url, {
							referrerURI: doc.documentURIObject, 
							inBackground: inBackground, 
							relatedToCurrent: true
						});
						// openUILinkIn(data, 'tab');
						// gBrowser.addTab(data);
					} else {
						// 搜索框搜索选中文字
						searchText = event.dataTransfer.getData("text/unicode");

						let useNewTab = true;
						// BrowserSearch.loadSearch(searchText, true);
						let engine = Services.search.defaultEngine;
						let submission = engine.getSubmission(searchText, null); // HTML response
						if (submission) {
							openLinkIn(submission.uri.spec,
						               useNewTab ? "tab" : "current",
						               { postData: submission.postData,
						                 inBackground: inBackground,
						                 relatedToCurrent: true });
						}
					}

					this.startPoint = 0;
				}
		}
	}
};

window.SimpleDragModY.init();