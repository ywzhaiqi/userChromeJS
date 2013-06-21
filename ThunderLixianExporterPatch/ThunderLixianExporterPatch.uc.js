// ==UserScript==
// @name           ThunderLixianExporterPatch.uc.js
// @namespace      ywzhaiqi@gmail.com
// @author         ywzhaiqi
// @description    迅雷离线直接导出IDM.ef2，需配合 ThunderLixianExporter.use.js 使用。
// @include        main
// @charset        UTF-8
// @version        0.0.1
// @note           
// ==/UserScript==

/** 
 * ThunderLixianExporter.use.js 下载地址
 * http://binux.github.io/ThunderLixianExporter/master/ThunderLixianExporter.user.js
 */

if(typeof window.thunderLixian != 'undefined'){
	window.thunderLixian.uninit();
	delete window.thunderLixian;
}

(function(){

// 导出名字
var idm_export_name = "idm.ef2";
// 导出路径为 config  中的 browser.download.dir


let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");


var ns = window.thunderLixian = {

	init: function(){
		gBrowser.mPanelContainer.addEventListener('DOMContentLoaded', this, true);
	},
	uninit: function(){
		gBrowser.mPanelContainer.removeEventListener('DOMContentLoaded', this, true);
	},
	handleEvent: function(event){
		switch(event.type){
			case 'DOMContentLoaded':
				var doc = event.target;
				var win = doc.defaultView;
				if(win.location.hostname == "dynamic.cloud.vip.xunlei.com"){
					var timer = 0;
					var checkButton = setInterval(function(win, doc){
						if(!checkDoc(doc)){
							return clearInterval(checkButton);
						}

						if(doc.getElementById("TLE_batch_getbtn")){
							clearInterval(checkButton);
							ns.addListener(win);
						}
						timer++;
						if(timer > 50){
							clearInterval(checkButton);
						}
					}, 200, win, doc);
				}
				break;
		}
	},
	addListener: function(win){
		var batch_getbtn = win.document.getElementById("TLE_batch_getbtn");
		if(!batch_getbtn) return;

		var link = win.document.createElement("a");
		link.innerHTML = "直接导出IDM文件";
		link.setAttribute("href", "#");
		batch_getbtn.insertBefore(link, batch_getbtn.children[1]);

		link.addEventListener("click", function(){
			var TLE = win.wrappedJSObject.TLE;
			if(!TLE) return;

			TLE.batch_down(null, function(todown){
				var str = "";
				for(var taskId in todown.tasklist){
					var task = todown.tasklist[taskId];
					task.filelist.forEach(function(file, l){
						if (!file.downurl) return;
						str += '<\r\n'+TLE.url_rewrite(file.downurl, TLE.safe_title(file.title))+'\r\ncookie: gdriveid='+todown.gdriveid+'\r\n>\r\n';
					});
				}
				saveFile(str);
			});
		}, false);
	},
};


var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);

try{
	var download_dir = Services.prefs.getCharPref("browser.download.dir");
	var idm_export_path = download_dir + "\\" + idm_export_name;
	file.initWithPath(idm_export_path);
}catch(ex){
	file = FileUtils.getFile("DfltDwnld", [idm_export_name]);
}

function saveFile(data) {
	file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);

	var suConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
	suConverter.charset = 'UTF-8';
	data = suConverter.ConvertFromUnicode(data);

	var foStream = Cc['@mozilla.org/network/file-output-stream;1'].createInstance(Ci.nsIFileOutputStream);
	foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
	foStream.write(data, data.length);
	foStream.close();

	alerts("IDM导出文件路径", file.path);
}

function checkDoc(doc) {
	if (!(doc instanceof HTMLDocument)) return false;
	if (!window.mimeTypeIsTextBased(doc.contentType)) return false;
	if (!doc.body || !doc.body.hasChildNodes()) return false;
	if (doc.body instanceof HTMLFrameSetElement) return false;
	return true;
}

function alerts(title, info){
	Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService)
		.showAlertNotification(null, title, info, false, "", null, "");
}

})();


window.thunderLixian.init();