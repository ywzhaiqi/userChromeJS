// ==UserScript==
// @name           Inspector_de_Info
// @description    SITEINFO 翻页规则生成器
// @namespace      http://d.hatena.ne.jp/Griever/
// @author         Griever
// @modified       ywzhaiqi
// @version        2014.9.4
// @license        MIT License
// @compatibility  Firefox 32
// @charset        UTF-8
// @include        main
// @screenshot     http://f.hatena.ne.jp/Griever/20120409200608
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS/blob/master/Inspector_de_Info/Inspector_de_Info.uc.js
// @homepageURL    https://github.com/Griever/userChromeJS/blob/master/Inspector_de_Info.uc.js
// @version        0.0.4
// @note           0.0.4 なんかいじった
// @note           0.0.3 CSS Selector も取得してみた
// @note           0.0.3 E4X の修正忘れを修正
// @note           0.0.2 Remove E4X
// ==/UserScript==

(function(CSS){

if (window.Inspector_de_Info) {
	window.Inspector_de_Info.destroy();
	delete window.Inspector_de_Info;
}

window.Inspector_de_Info = {
	getFocusedWindow: function(){
		var win = document.commandDispatcher.focusedWindow;
		return (!win || win == window) ? window.content : win;
	},
	ready: function(subject, aToolbox) {
		var doc = aToolbox.doc;
		var win = doc.defaultView;
		win.Inspector_de_Info = window.Inspector_de_Info;

		if (doc.getElementById("idei-container")) return;

		var inspectFrame = doc.getElementById("toolbox-panel-iframe-inspector");
		if (!inspectFrame)
			return;

		inspectFrame.addEventListener("load", inspectFrameOnload, true);
		if (inspectFrame.contentDocument)
			inspectFrameOnload(inspectFrame.contentDocument);

		function inspectFrameOnload(iDoc) {
			inspectFrame.removeEventListener("load", inspectFrameOnload, true);

			var popup = iDoc.getElementById("inspector-node-popup");

			var m = iDoc.createElement("menu");
			m.setAttribute("label", "Get Selector");
			m.setAttribute("id", "idei-selector-menu");
			m.setAttribute("accesskey", "S");
			var p = m.appendChild(iDoc.createElement("menupopup"));
			p.setAttribute("onpopupshowing", "window.top.Inspector_de_Info.onPopupshowing(event)");
			p.setAttribute("idei-type", "selector");
			popup.insertBefore(m, popup.firstChild);

			var m = iDoc.createElement("menu");
			m.setAttribute("label", "Get XPath");
			m.setAttribute("id", "idei-xpath-menu");
			m.setAttribute("accesskey", "X");
			var p = m.appendChild(iDoc.createElement("menupopup"));
			p.setAttribute("onpopupshowing", "window.top.Inspector_de_Info.onPopupshowing(event)");
			p.setAttribute("idei-type", "xpath");
			popup.insertBefore(m, popup.firstChild);
		};

		var buttons = doc.getElementById("toolbox-buttons");

		var infobutton = buttons.insertBefore(document.createElement("toolbarbutton"), buttons.firstChild);
		infobutton.setAttribute("id", "idei-button");
		infobutton.setAttribute("class", "command-button");
		infobutton.setAttribute("image", "resource://gre/chrome/toolkit/skin/classic/mozapps/plugins/pluginHelp-16.png");
		infobutton.setAttribute("label", "INFO");
		infobutton.setAttribute("accesskey", "Q");
		infobutton.addEventListener("command", function(event) {
			var container = doc.getElementById("idei-container");
			if (container.hidden = !container.hidden) return;

			doc.getElementById("idei-url").value = "^" + content.location.href.replace(/[()\[\]{}|+.,^$?\\]/g, "\\$&");
		}, false);

		var xml = '\
			<hbox id="idei-container" hidden="true">\
				<popupset>\
					<menupopup id="idei-textbox-popup">\
						<menuitem label="@class=&quot;value&quot; → contains()"\
						          tooltiptext="class 属性转为 contains() 形式"\
						          oncommand="Inspector_de_Info.replaceAttrXPath(Inspector_de_Info.NORMAL_TO_CLASS)" />\
						<menuitem label="@name=&quot;value&quot; → starts-with(@name, &quot;value&quot;)"\
						          tooltiptext="属性转为 starts-with(@name, &quot;value&quot;) 形式"\
						          oncommand="Inspector_de_Info.replaceAttrXPath(Inspector_de_Info.NORMAL_TO_STARTS)" />\
						<menuitem label="@name=&quot;value&quot; → ends-with(@name, &quot;value&quot;)"\
						          tooltiptext="属性转为 substring(@name, string-length(@name) - string-length(&quot;value&quot;) + 1) = &quot;value&quot; 形式"\
						          oncommand="Inspector_de_Info.replaceAttrXPath(Inspector_de_Info.NORMAL_TO_ENDS)" />\
						<menuseparator />\
						<menuitem label="starts/ends/contains → @name=&quot;value&quot;"\
						          tooltiptext="属性转为 @name=&quot;value&quot; 形式"\
						          oncommand="Inspector_de_Info.replaceAttrXPath(Inspector_de_Info.SOME_TO_NORMAL)" />\
						<menuseparator />\
						<menuitem label=":first-child"\
						          tooltiptext="会插入对应于 CSS 的 :first-child 的 XPath\n[not(preceding-sibling::*)]"\
						          oncommand="Inspector_de_Info.insertText(\'[not(preceding-sibling::*)]\');" />\
						<menuitem label=":last-child"\
						          tooltiptext="会插入对应于 CSS 的 :last-child 的 XPath\n[not(following-sibling::*)]"\
						          oncommand="Inspector_de_Info.insertText(\'[not(following-sibling::*)]\');" />\
						<menuitem label=":only-child"\
						          tooltiptext="会插入对应于 CSS 的 :only-child 的 XPath\n[count(parent::*/child::*) = 1]"\
						          oncommand="Inspector_de_Info.insertText(\'[count(parent::*/child::*) = 1]\');" />\
						<menuitem label=":empty"\
						          tooltiptext="会插入对应于 CSS 的 :empty 的 XPath\n[not(*) and not(text())]"\
						          oncommand="Inspector_de_Info.insertText(\'[not(*) and not(text())]\');" />\
						<menuitem label="E 后面的 F ( E + F )"\
						          tooltiptext="会插入对应于 CSS 的 E + F 的 XPath\nE/following-sibling::*[1][self::F]"\
						          oncommand="Inspector_de_Info.insertText(\'E/following-sibling::*[1][self::F]\');" />\
						<menuitem label="E 以后的 F ( E ~ F )"\
						          tooltiptext="会插入对应于 CSS 的 E ~ F 的 XPath\nE/following-sibling::F"\
						          oncommand="Inspector_de_Info.insertText(\'E/following-sibling::F\');" />\
						<menuitem label="E 前面的 F"\
						          tooltiptext="E/preceding-sibling::*[1][self::F]"\
						          oncommand="Inspector_de_Info.insertText(\'E/preceding-sibling::*[1][self::F]\');" />\
						<menuitem label="E 以前的 F"\
						          tooltiptext="E/preceding-sibling::F"\
						          oncommand="Inspector_de_Info.insertText(\'E/preceding-sibling::F\');" />\
					</menupopup>\
				</popupset>\
				<vbox id="idei-hbox">\
					<button label="JSON"\
					        oncommand="Inspector_de_Info.checkInfo(document, true);"/>\
					<button label="launch"\
					        oncommand="Inspector_de_Info.launch(document);"\
					        tooltiptext="尝试运行 uAutoPagerize"/>\
				</vbox>\
				<grid id="idei-grid" flex="1">\
					<columns>\
						<column />\
						<column flex="1"/>\
					</columns>\
					<rows>\
						<row>\
							<label value="url"/>\
							<textbox id="idei-url"/>\
						</row>\
						<row>\
							<label value="nextLink"/>\
							<textbox id="idei-nextLink" context="idei-textbox-popup"/>\
						</row>\
						<row>\
							<label value="pageElement"/>\
							<textbox id="idei-pageElement" context="idei-textbox-popup"/>\
						</row>\
						<row>\
							<label value="insertBefore"/>\
							<textbox id="idei-insertBefore" context="idei-textbox-popup"/>\
						</row>\
					</rows>\
				</grid>\
			</hbox>\
		';
		var range = document.createRange();
		range.selectNode(inspectFrame);
		range.collapse(false);
		range.insertNode(range.createContextualFragment(xml.replace(/\n|\t/g, '')));
	},
	init: function() {
		gDevTools.on("toolbox-ready", Inspector_de_Info.ready);


		window.addEventListener("unload", this, false);
	},
	uninit: function() {
		window.removeEventListener("unload", this, false);
	},
	destroy: function() {
		this.uninit();
		["idei-button","idei-container","idei-selector-menu","idei-xpath-menu"].forEach(function(id){
			var elem = $(id);
			if (elem) elem.parentNode.removeChild(elem);
		}, this);
		if (this.xulstyle) this.xulstyle.parentNode.removeChild(this.xulstyle);
	},
	handleEvent: function(event) {
		switch(event.type){
			case "unload":
				this.uninit();
				break;
		}
	},
	onPopupshowing: function (event) {
		var popup = event.target;
		var range = document.createRange();
		range.selectNodeContents(popup);
		range.deleteContents();
		range.detach();
		
		var elem = popup.ownerDocument.defaultView.inspector.selection.node;
		if (elem instanceof Text) elem = elem.parentNode;
		if (!(elem instanceof Element)) return;

		var array = popup.getAttribute("idei-type") === "selector" ? 
			this.getSelectorAll(elem):
			this.getXPathAll(elem);
		this.createMenuitem(popup, array);
	},
	createMenuitem: function(popup, items) {
		items.forEach(function(str, i, a) {
			if (a.indexOf(str) !== i) return;
			let m = document.createElement("menuitem");
			m.setAttribute("label", str);
			m.setAttribute("oncommand", "window.top.Inspector_de_Info.copyToClipboard(event)");
			m.style.setProperty("max-width","63em","important");
			if (str.length > 110)
				m.setAttribute("tooltiptext", str);
			popup.appendChild(m);
		}, this);
	},
	run: function() {
		var container = $("idei-container");
		if (container.hidden = !container.hidden) return;

		$("idei-url").value = "^" + InspectorUI.selection.ownerDocument.location.href.replace(/[()\[\]{}|+.,^$?\\]/g, "\\$&");
	},
	copyToClipboard: function(event) {
		Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(event.target.getAttribute("label"));
	},
	getXPathAll: function(node) {
		var res = [];
		var localName = node.localName.toLowerCase();

		var id = node.getAttribute('id');
		if (id) res.push('id("' + id + '")');
		var cls = node.getAttribute('class');
		if (cls) {
			res.push(localName + '[@class='+ escapeXPathExpr(cls) +']');
			let cs = cls.trim().split(/\s+/).map(function(c) {
				let contains = 'contains(concat(" ",normalize-space(@class)," "), " '+ c +' ")';
				res.push(localName + '[' + contains + ']');
				return contains;
			}, this);
			if (cs.length > 1)
				res.push(localName + '[' + cs.join(' and ') + ']');
		}
		var attrs = [
			[nodeName, nodeValue]
				for each({nodeName, nodeValue} in $A(node.attributes))
					if (!/^(?:id|class)$/i.test(nodeName))];
		var all = attrs.map(function([n, v]){
			if (n === 'href' || n === 'src') {
				if (v.indexOf('javascript:') === 0) {
					res.push(localName + '[starts-width(@'+ n +', "javascript:")]');
				} else if (v.indexOf('data:') === 0) {
					var str = (/^data\:.*?\,/.exec(v)||['data:'])[0];
					res.push(localName + '[starts-width(@'+ n +', "'+ str +'")]');
				}
			}
			res.push(localName + '[@'+ n +'='+ escapeXPathExpr(v) +']');
			return '@'+ n +'='+ escapeXPathExpr(v) +'';
		});
		if (all.length > 1)
			res.push(localName + '[' + all.join(' and ') + ']');
		var first = node.firstChild;
		if (first instanceof Text && /\S/.test(first.textContent))
			res.push(localName + '[text()=' + escapeXPathExpr(first.textContent).replace(/\'/g, "\\\'") + ']')
		res.push(localName);
		return res;
	},
	getSelectorAll: function(node) {
		var res = [];
		var localName = node.localName.toLowerCase();

		var id = node.getAttribute('id');
		if (id) res.push('#' + id);
		var cls = node.getAttribute('class');
		if (cls) res.push('.' + Array.slice(node.classList).join('.'));
		var attrs = [
			[nodeName, nodeValue]
				for each({nodeName, nodeValue} in $A(node.attributes))
					if (!/^(?:id|class)$/i.test(nodeName))];
		var all = attrs.map(function([n, v]){
			if (n === 'href' || n === 'src') {
				if (v.indexOf('data:') === 0) {
					var str = (/^data\:.*?\,/.exec(v) || ['data:'])[0];
					res.push(localName + '['+ n +'^="'+ str +'"]');
				} else {
					var str = (/[^/]+\/?$/.exec(v) || [""])[0];
					var pre = v.slice(0, -str.length);
					if (pre && pre != v) res.push(localName + '['+ n +'^="'+ pre +'"]');
					if (str && str != v) res.push(localName + '['+ n +'$="'+ str +'"]');
				}
			}
			res.push(localName + '['+ n +'="'+ v +'"]');
			return '[' + n +'="'+ v +'"]';
		});
		if (all.length > 1)
			res.push(localName + all.join(''));
		res.push(localName);
		return res;
	},
	toJSON: function(tDoc) {
		var json = "{\n";
		json += "\turl          : '" + tDoc.getElementById("idei-url").value.replace(/\\/g, "\\\\") + "'\n";
		json += "\t,nextLink    : '" + tDoc.getElementById("idei-nextLink").value + "'\n";
		json += "\t,pageElement : '" + tDoc.getElementById("idei-pageElement").value + "'\n";
		if (tDoc.getElementById("idei-insertBefore").value)
			json += "\t,insertBefore: '" + tDoc.getElementById("idei-insertBefore").value + "'\n";
		json += "\t,exampleUrl  : '" + content.location.href + "'\n";
		json += "}";
//		if (confirm(json + '\n\n設定ファイルに追記しますか？')) {
//			this.addSaveFile('\nMY_SITEINFO.unshift('+ json +');');
//			if (!window.uAutoPagerize) return
//			uAutoPagerize.loadSetting(true);
//		}
		alert(json);
	},
	launch: function(tDoc) {
		var uap = window.uAutoPagerize;
		if (!uap) return this.checkInfo(true);
		var win = content;
		if (win.ap) return alert("uAutoPagerize 已经在运行了");

		var i = this.checkInfo(tDoc);
		if (!i) return;

		var [index, info] = uap.getInfo([i], win);
		if (index === 0) {
			if (win.AutoPagerize && win.AutoPagerize.launchAutoPager)
				win.AutoPagerize.launchAutoPager([i]);
			else alert("SITEINFO 正常、uAutoPagerize 无法启动");
		} else {
			alert("SITEINFO 不匹配");
		}
	},
	addSaveFile: function(data) {
		if (!window.uAutoPagerize)
			return alert('uAutoPagerize 没运行');
		var file = uAutoPagerize.file;
		if (!window.uAutoPagerize.file || !file.exists())
			return alert('_uAutoPagerize.js 文件不存在');

		var suConverter = Cc['@mozilla.org/intl/scriptableunicodeconverter'].createInstance(Ci.nsIScriptableUnicodeConverter);
		suConverter.charset = 'UTF-8';
		data = suConverter.ConvertFromUnicode(data);

		var foStream = Cc['@mozilla.org/network/file-output-stream;1'].createInstance(Ci.nsIFileOutputStream);
		foStream.init(file, 0x02 | 0x10, 0664, 0);
		foStream.write(data, data.length);
		foStream.close();
	},
	checkInfo: function(tDoc, isAlert) {
		var i = {
			url         : tDoc.getElementById("idei-url").value,
			nextLink    : tDoc.getElementById("idei-nextLink").value,
			pageElement : tDoc.getElementById("idei-pageElement").value,
			insertBefore: tDoc.getElementById("idei-insertBefore").value
		};
		if (!i.url || !i.nextLink || !i.pageElement)
			return alert("输入值无效");
		var logs = [];
		var win = content;
		var doc = win.document;

		try {
			if (!new RegExp(i.url).test(doc.location.href))
				logs.push("url 不匹配");
		} catch (e) {
			return alert(e);
		}
		try {
			if (!doc.evaluate(i.nextLink, doc, null, 9, null).singleNodeValue)
				logs.push("nextLink 没有找到");
		} catch (e) {
			logs.push("nextLink 不正确");
		}
		try {
			if (!doc.evaluate(i.pageElement, doc, null, 9, null).singleNodeValue)
				logs.push("pageElement 没有找到");
		} catch (e) {
			logs.push("pageElement 不正确");
		}
		try {
			if (i.insertBefore)
				doc.evaluate(i.insertBefore, doc, null, 9, null).singleNodeValue;
		} catch (e) {
			logs.push("insertBefore 不正确");
		}

		if (logs.length) 
			return alert(logs.join("\n"));
		if (isAlert)
			this.toJSON(tDoc);
		return i;
	},
	NORMAL_TO_CLASS: 0,
	CLASS_TO_NORMAL: 1,
	NORMAL_TO_STARTS: 2,
	STARTS_TO_NOMARL: 3,
	NORMAL_TO_ENDS: 4,
	ENDS_TO_NORMAL: 5,
	SOME_TO_NORMAL: 6,
	replaceAttrXPath: function(constant) {
		var t = document.commandDispatcher.focusedElement;
		if (!t || !("selectionStart" in t)) return;

		if (t.selectionStart == t.selectionEnd) {
			t.select();
			var value = t.value;
		} else {
			var value = t.value.substring(t.selectionStart, t.selectionEnd);
		}
		if (!value) return;
		if (!t.editor || !t.editor.insertText) {
			t instanceof Ci.nsIDOMNSEditableElement;
			t.editor.QueryInterface(Ci.nsIPlaintextEditor);
		}
		switch (constant) {
			case this.NORMAL_TO_CLASS : t.editor.insertText(normal2class(value)); break;
			case this.CLASS_TO_NORMAL : t.editor.insertText(class2normal(value)); break;
			case this.NORMAL_TO_STARTS: t.editor.insertText(normal2starts(value)); break;
			case this.STARTS_TO_NOMARL: t.editor.insertText(starts2normal(value)); break;
			case this.NORMAL_TO_ENDS  : t.editor.insertText(normal2ends(value)); break;
			case this.ENDS_TO_NORMAL  : t.editor.insertText(ends2normal(value)); break;
			case this.SOME_TO_NORMAL  : t.editor.insertText(class2normal(starts2normal(ends2normal(value)))); break;
		}
	},
	insertText: function(aStr) {
		var cmd = "cmd_insertText";
		var ctrl = document.commandDispatcher.getControllerForCommand(cmd);
		if (!ctrl || !ctrl.isCommandEnabled(cmd)) return;
		ctrl = ctrl.QueryInterface(Ci.nsICommandController);
		var params = Cc["@mozilla.org/embedcomp/command-params;1"].createInstance(Ci.nsICommandParams);
		params.setStringValue("state_data", aStr);
		ctrl.doCommandWithParams(cmd, params);
	},
};

window.Inspector_de_Info.init();




function normal2class(xpath) {
	return xpath.replace(/@class=\"(.+?)\"/g, function(str, cls) {
		cls = cls.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "").split(" ");
		for (var i = 0, l = cls.length; i < l; i++) {
			cls[i] = 'contains(concat(" ",normalize-space(@class)," "), " '+ cls[i] +' ")';
		}
		return cls.join(" and ");
	});
}

function class2normal(xpath) {
	let r = /(?:contains\(concat\(\" \"\,normalize\-space\(@class\)\,\" \"\)\, \" .+? \"\)(?: and )?)+/g;
	return xpath.replace(r, function(str) {
		let cls = str.split(' and ').map(function(c) c.replace(/.*\" (.*) \".*/i, '$1') );
		return '@class="'+ cls.join(' ') +'"';
	});
}

function normal2starts(xpath) {
	return xpath.replace(/(@.+?)=\"(.+?)\"/g, function(str, aName, aValue) {
		return 'starts-with('+ aName +', "'+ aValue +'")';
	});
}

function starts2normal(xpath) {
	return xpath.replace(/starts-with\((@.+?)\, \"(.+?)\"\)/g, function(str, aName, aValue) {
		return aName + '="' + aValue + '"';
	});
}

function normal2ends(xpath) {
	return xpath.replace(/(@.+?)=\"(.+?)\"/g, function(str, aName, aValue) {
		return 'substring('+ aName +', string-length(' + aName + ') - string-length("' + aValue + '") + 1) = "' + aValue + '"'
	});
}

function ends2normal(xpath) {
	return xpath.replace(/substring\((@.+?)\, string\-length\(@.+?\) \- string\-length\(\"(.+?)\"\) \+ 1\) = \".+?\"/g, function(str, aName, aValue) {
		return aName + '="' + aValue + '"';
	});
}


function $(id) { return document.getElementById(id); }
function $$(exp, doc) { return Array.prototype.slice.call((doc || document).querySelectorAll(exp)); }

function $A(args) { return Array.prototype.slice.call(args); }
function U(text) 1 < 'あ'.length ? decodeURIComponent(escape(text)) : text;
function $C(name, attr) {
	var el = document.createElement(name);
	if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
	return el;
}
function addStyle(css) {
	var pi = document.createProcessingInstruction(
		'xml-stylesheet',
		'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"'
	);
	return document.insertBefore(pi, document.documentElement);
}
// http://d.hatena.ne.jp/amachang/20090917/1253179486
function escapeXPathExpr(text) {
	var matches = text.match(/[^"]+|"/g);
	function esc(t) {
		return t == '"' ? ('\'' + t + '\'') : ('"' + t + '"');
	}
	if (matches) {
		if (matches.length == 1) {
			return esc(matches[0]);
		} else {
			var results = [];
			for (var i = 0, len = matches.length; i < len; i ++) {
				results.push(esc(matches[i]));
			}
			return 'concat(' + results.join(', ') + ')';
		}
	} else {
		return '""';
	}
}

})('\
#inspector-toolbar[hidden="true"] ~ #idei-container\
  { display: none !important; }\
\
#idei-container row {\
  -moz-box-align: center !important;\
}\
#idei-container label {\
  margin: 0px !important;\
}\
#idei-container textbox {\
  margin: 1px !important;\
}\
\
');
