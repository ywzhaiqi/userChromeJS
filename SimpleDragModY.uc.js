// ==UserScript==
// @name         SimpleDragModY
// @description  简单拖曳
// @include      chrome://browser/content/browser.xul
// @note         2014-5-20，增加 “http://pan.baidu.com/s/1bn7uGmb 密码: jl4b” 的识别
// ==/UserScript==

location == "chrome://browser/content/browser.xul" && (function(event) {
	var self = arguments.callee;
	if (!event) {
		["dragstart", "dragover", "drop"].forEach(function(type) {
			gBrowser.mPanelContainer.addEventListener(type, self, false);
		});
		window.addEventListener("unload", function() {
			["dragstart", "dragover", "drop"].forEach(function(type) {
				gBrowser.mPanelContainer.removeEventListener(type, self, false);
			});
		}, false);
		return;
	}
	switch (event.type) {
		case "dragstart":
			{
				self.startPoint = [event.screenX, event.screenY];
				self.sourceNode = event.target;
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
			}
		case "dragover":
			{
				self.startPoint && (Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService).getCurrentSession().canDrop = true);
				break;
			}
		case "drop":
			{
				if (self.startPoint && event.target.localName != "textarea" && (!(event.target.localName == "input" && (event.target.type == "text" || event.target.type == "password"))) && event.target.contentEditable != "true") {
					event.preventDefault();
					event.stopPropagation();
					var [subX, subY] = [event.screenX - self.startPoint[0], event.screenY - self.startPoint[1]];
					var [distX, distY] = [(subX > 0 ? subX : (-subX)), (subY > 0 ? subY : (-subY))];
					var direction;
					if (distX > distY) 
						direction = subX < 0 ? "L" : "R";
					else 
						direction = subY < 0 ? "U" : "D";

					if (event.dataTransfer.types.contains("application/x-moz-file-promise-url")) {
						//新标签打开图片(后台)
						gBrowser.addTab(event.dataTransfer.getData("application/x-moz-file-promise-url"));
					} else if (event.dataTransfer.types.contains("text/x-moz-url")) {
						//新标签打开链接(后台)
						gBrowser.addTab(event.dataTransfer.getData("text/x-moz-url").split("\n")[0]);
					} else {  // 搜索框搜索选中文字(后台)
						var data = event.dataTransfer.getData("text/unicode");
						// http://pan.baidu.com/s/1bn7uGmb 密码: jl4b
						if (data.trim().match(/^http:\/\/.*密码:/i)) {
							data = data.replace(/\s*密码:\s*/, '#');
							openUILinkIn(data, 'tab');
							// gBrowser.addTab(data);
						} else {
							BrowserSearch.loadSearch(data, true);
						}
					}
					self.startPoint = 0;
				}
			}
	}
})()