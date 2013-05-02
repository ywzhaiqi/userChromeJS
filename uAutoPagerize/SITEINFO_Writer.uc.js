// ==UserScript==
// @name           SITEINFO_Writer.uc.js
// @description    AutoPagerize の SITEINFO を書くためのスクリプト
// @namespace      http://d.hatena.ne.jp/Griever/
// @author         Griever
// @include        main
// @compatibility  Firefox 5
// @charset        UTF-8
// @version        下書き1
// @note           增加下一页中文选择xpath By ywzhaiqi@gmail.com
// @note           fix compatibility by lastdream2013
// @note           まだこれからつくり込む段階
// @note           ツールメニューから起動する
// ==/UserScript==

(function(css){

if (window.siteinfo_writer) {
	window.siteinfo_writer.destroy();
	delete window.siteinfo_writer;
}

window.siteinfo_writer = {
	init: function() {
      	this.style = addStyle(css);
      	
	  	var overlay = '\
	      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
	               xmlns:html="http://www.w3.org/1999/xhtml"> \
	        <window id="main-window">\
				<vbox id="sw-container" class="sw-add-element" hidden="true">\
				    <hbox id="sw-hbox">\
				      <toolbarbutton label="JSON" oncommand="siteinfo_writer.toJSON();"/>\
				      <toolbarbutton id="sw-launch" label="launch" tooltiptext="uAutoPagerize im Vorfeld ausführen" oncommand="siteinfo_writer.launch();"/>\
				      <spacer flex="1"/>\
				      <toolbarbutton class="tabs-closebutton" oncommand="siteinfo_writer.hide();"/>\
				    </hbox>\
				    <grid id="sw-grid">\
				      <columns>\
				        <column />\
				        <column flex="1"/>\
				        <column />\
				        <column />\
				      </columns>\
				      <rows>\
				        <row>\
				          <label value="url" />\
				          <textbox id="sw-url" oninput="siteinfo_writer.onInput(event);"/>\
				          <hbox />\
				          <toolbarbutton class="inspect"\
				                         tooltiptext="Url Abruf"\
				                         oncommand="siteinfo_writer.url.value = \'^\' + content.location.href.replace(/[()\[\]{}|+.,^$?\\]/g, \'\\$&amp;\');"/>\
				        </row>\
				        <row>\
				          <label value="nextLink" />\
				          <textbox id="sw-nextLink" multiline="true"/>\
				          <toolbarbutton class="check"\
				                         tooltiptext="XPath Test"\
				                         oncommand="siteinfo_writer.xpathTest(\'nextLink\');"/>\
				          <toolbarbutton class="inspect"\
				                         tooltiptext="XPath Abruf"\
				                         oncommand="siteinfo_writer.inspect(\'nextLink\');"/>\
				        </row>\
				        <row>\
				          <label value="pageElement" />\
				          <textbox id="sw-pageElement" multiline="true"/>\
				          <toolbarbutton class="check"\
				                         tooltiptext="XPath Test"\
				                         oncommand="siteinfo_writer.xpathTest(\'pageElement\');"/>\
				          <toolbarbutton class="inspect"\
				                         tooltiptext="XPath Abruf"\
				                         oncommand="siteinfo_writer.inspect(\'pageElement\');"/>\
				        </row>\
				        <row>\
				          <label value="insertBefore" />\
				          <textbox id="sw-insertBefore" multiline="true"/>\
				          <toolbarbutton class="check"\
				                         tooltiptext="XPath Test"\
				                         oncommand="siteinfo_writer.xpathTest(\'insertBefore\');"/>\
				          <toolbarbutton class="inspect"\
				                         tooltiptext="XPath Abruf"\
				                         oncommand="siteinfo_writer.inspect(\'insertBefore\');"/>\
				        </row>\
				      </rows>\
				    </grid>\
				  </vbox>\
			</window>\
	      </overlay>';
	    overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
	    window.userChrome_js.loadOverlay(overlay, window.siteinfo_writer);
	},
  	observe: function(aSubject, aTopic, aData){
    	if (aTopic == "xul-overlay-merged") {

		this.popup = $("mainPopupSet").appendChild($C("menupopup",{
		 id: "sw-popup",
		 class: "sw-add-element",
		 }));

		var menuitem = $C("menuitem", {
			 class: "sw-add-element",
			 label: "SITEINFO Writer starten",
			 oncommand: "siteinfo_writer.show();",
			 });
		$("devToolsSeparator").parentNode.insertBefore(menuitem, $("devToolsSeparator"));
		
		setTimeout(function() {
			if (!window.uAutoPagerize) {
				$("sw-launch").hidden = true;
				return;
			};
			
			let aupPopup = $("uAutoPagerize-popup");
			if (aupPopup) {
				aupPopup.appendChild(document.createElement("menuseparator")).setAttribute("class", "sw-add-element");
				aupPopup.appendChild(menuitem.cloneNode(false));
			}
		}, 2000);

		this.container = $("sw-container"); 
		this.url = $("sw-url");
		this.nextLink = $("sw-nextLink");
		this.pageElement = $("sw-pageElement");
		this.insertBefore = $("sw-insertBefore"); 

		this.nextLink.addEventListener("popupshowing", siteinfo_writer.pps, false);
		this.pageElement.addEventListener("popupshowing", siteinfo_writer.pps, false);
		this.insertBefore.addEventListener("popupshowing", siteinfo_writer.pps, false);
	}
	},
	uninit: function() {
	},

	pps: function(event) {
		event.currentTarget.removeEventListener(event.type, arguments.callee, false);
		var popup = event.originalTarget;
		var type = event.currentTarget.id.replace("sw-", "");
		
	    popup.appendChild($C("menuseparator",{}));
	    popup.appendChild($C("menuitem", {
	 	label: '@class="xxx" → contains()',
		oncommand: "siteinfo_writer.class2contains('"+ type +"');",
	 }));
	    popup.appendChild($C("menuitem",{
	 	label: 'contains() → @class="xxx"',
		oncommand: "siteinfo_writer.contains2class('"+ type +"');",
	 }));
	},
	destroy: function() {
		$A(document.getElementsByClassName("sw-add-element")).forEach(function(e){
			e.parentNode.removeChild(e);
		})
		this.style.parentNode.removeChild(this.style);
	},
	setUrl: function() {
		this.url.value = "^" + content.location.href.replace(/[()\[\]{}|+.,^$?\\]/g, '\\$&');
		this.url.className = "";
	},
	show: function() {
		this.setUrl();
		this.nextLink.value = "";
		this.pageElement.value = "";
		this.insertBefore.value = "";
		this.container.hidden = false;
	},
	hide: function() {
		this.container.hidden = true;
	},
	toJSON: function() {
		var json = "{\n";
		json += "\turl          : '" + this.url.value.replace(/\\/g, "\\\\") + "'\n";
		json += "\t,nextLink    : '" + this.nextLink.value + "'\n";
		json += "\t,pageElement : '" + this.pageElement.value + "'\n";
		json += "\t,insertBefore: '" + this.insertBefore.value + "'\n";
		json += "\t,exampleUrl  : '" + content.location.href + "'\n";
		json += "}";
		alert(json);
	},
	launch: function() {
		if (content.ap) return alert("已经运行");

		var i = {};
		["url", "nextLink", "pageElement", "insertBefore"].forEach(function(type) {
			if (this[type].value)
				i[type] = this[type].value
		}, this);
		if (!i.url || !i.nextLink || !i.pageElement)
			return alert("指定的值无效");

		let [index, info] = uAutoPagerize.getInfo([i], content);

		if (index === 0) {
			if (content.AutoPagerize && content.AutoPagerize.launchAutoPager)
				content.AutoPagerize.launchAutoPager([i]);
			else alert("SITEINFO 正常但 uAutoPagerize 无法执行");
		} else {
			alert("SITEINFO 不匹配");
		}
	},
	inspect: function(aType) {
		if (this._inspect) 
			this._inspect.uninit();
		var self = this;
		this._inspect = new Inspector(content, function(xpathArray) {
			if (xpathArray.length) {
				let range = document.createRange();
				range.selectNodeContents(self.popup);
				range.deleteContents();
				range.detach();
				for (let [i, x] in Iterator(xpathArray)) {
					let menuitem = document.createElement("menuitem");
					menuitem.setAttribute("label", x);
					menuitem.setAttribute("oncommand", "siteinfo_writer['"+ aType +"'].value = this.getAttribute('label')");
					self.popup.appendChild(menuitem);
				}
				self.popup.openPopup(self.container, "before_start");
			}
			self._inspect = null;
		});
	},
	xpathTest: function(aType) {
		var textbox = this[aType]
		if (!textbox || !textbox.value) return;
		try {
			var elements = getElementsByXPath(textbox.value, content.document);
		} catch (e) {
			alert(e);
		}

		for (let [i, elem] in Iterator(elements)) {
			if (!("orgcss" in elem))
				elem.orgcss = elem.style.cssText;
			elem.style.backgroundImage = "-moz-linear-gradient(magenta, plum)";
			elem.style.outline = "1px solid magenta";
		}

		var self = this;
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		this.timer = setTimeout(function() {
			for (let [i, elem] in Iterator(elements)) {
				if ("orgcss" in elem) {
					elem.orgcss?
						elem.style.cssText = elem.orgcss:
						elem.removeAttribute("style");
					delete elem.orgcss;
				}
			}
		}, 5000);
	},
	urlTest: function() {
		var url = this.url.value;
		try {
			var regexp = new RegExp(this.url.value);
			if (regexp.test(content.location.href))
				this.url.classList.remove("error");
			else 
				this.url.classList.add("error");
		} catch (e) {
			this.url.classList.add("error");
		}
	},
	inputTimer: null,
	onInput: function(event) {
		if (this.inputTimer) {
			clearTimeout(this.inputTimer);
		}
		var self = this;
		this.inputTimer = setTimeout(function() {
			self.urlTest();
		}, 100);
	},
	class2contains: function(aType) {
		this[aType].value = this.splitClass(this[aType].value);
	}, 
	contains2class: function(aType) {
		this[aType].value = this.normalClass(this[aType].value);
	}, 
	splitClass: function(xpath) {
		return xpath.replace(/@class=\"(.+?)\"/g, function(str, cls) {
			cls = cls.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "").split(" ");
			for (var i = 0, l = cls.length; i < l; i++) {
				cls[i] = 'contains(concat(" ",normalize-space(@class)," "), " '+ cls[i] +' ")';
			}
			return cls.join(" and ");
		});
	},
	normalClass: function(xpath) {
		let r = /(?:contains\(concat\(\" \"\,normalize\-space\(@class\)\,\" \"\)\, \" .+? \"\)(?: and )?)+/g;
		return xpath.replace(r, function(str) {
			let cls = str.split(' and ').map(function(c) c.replace(/.*\" (.*) \".*/i, '$1') );
			return '@class="'+ cls.join(' ') +'"';
		});
	},
};

window.siteinfo_writer.init();

function Inspector(aWindow, aCallback) {
	this.win = aWindow;
	this.doc = this.win.document;
	this.callback = aCallback;
	this.init();
}
Inspector.prototype = {
	init : function(){
		this.doc.addEventListener('mousedown', this, true);
		this.doc.addEventListener('click', this, true);
		this.doc.addEventListener('mouseover', this, true);
	},
	uninit : function(){
		var self = this;
		this.lowlight();
		this.doc.removeEventListener('mouseover', this, true);
		setTimeout(function(){
			self.doc.removeEventListener('mousedown', self, true);
			self.doc.removeEventListener('click', self, true);
		}, 500);
		XULBrowserWindow.statusTextField.label = "";
	},
	handleEvent : function(event){
		switch(event.type){
			case 'mousedown':
				event.preventDefault();
				event.stopPropagation();
				this.uninit();
				if (event.button == 0)
					this.callback(this.getXPath(this.target));
				break;
			case 'mouseover':
				if (this.target)
					this.lowlight();
				this.target = event.target;
				this.highlight();
				break;
			case "click":
				event.preventDefault();
				event.stopPropagation();
				break;
		}
	},
	highlight : function(){
		if (this.target.mozMatchesSelector('html, body'))
			return;
		if (!("orgcss" in this.target))
			this.target.orgcss = this.target.style.cssText;
		this.target.style.outline = "magenta 2px solid";
		this.target.style.outlineOffset = "-1px";
		XULBrowserWindow.statusTextField.label = this.getElementXPath(this.target, this.ATTR_FULL);
	},
	lowlight : function() {
		if ("orgcss" in this.target) {
			this.target.orgcss?
				this.target.style.cssText = this.target.orgcss:
				this.target.removeAttribute("style");
			delete this.target.orgcss;
		}
	},
	ATTR_CLASSID: 0,
	ATTR_ID: 1,
	ATTR_CLASS: 2,
	ATTR_NOT_CLASSID: 3,
	ATTR_FULL: 4,
	TEXT: 5,
	NEXT_REG: /[下后][一]?[页张个篇章节步]/,
	NEXT_REG_A: /^[下后][一]?[页张个篇章节步]$/,
	getXPath: function(originalTarget) {
		var nodes = getElementsByXPath(
			'ancestor-or-self::*[not(local-name()="html" or local-name()="HTML" or local-name()="body" or local-name()="BODY")]', originalTarget).reverse();
		if (nodes.length == 0) return [];

		var current = nodes.shift();
		var obj = {};
		obj.localnames       = current.localName;
		obj.self_classid     = this.getElementXPath(current, this.ATTR_CLASSID);
		obj.self_id          = this.getElementXPath(current, this.ATTR_ID);
		obj.self_class       = this.getElementXPath(current, this.ATTR_CLASS);
		obj.self_attr        = this.getElementXPath(current, this.ATTR_NOT_CLASSID);
		obj.self_full        = this.getElementXPath(current, this.ATTR_FULL);
		obj.self_text        = this.getElementXPath(current, this.TEXT);
		obj.ancestor_classid = obj.self_classid;
		obj.ancestor_id      = obj.self_id;
		obj.ancestor_class   = obj.self_class;
		obj.ancestor_attr    = obj.self_attr;
		obj.ancestor_full    = obj.self_full;
		obj.ancestor_text    = obj.self_text;

		var hasId = current.getAttribute("id");
		for (let [i, elem] in Iterator(nodes)) {
			obj.localnames = elem.localName + "/" + obj.localnames;

			if (!hasId) {
				hasId = elem.getAttribute("id");
				obj.ancestor_classid = this.getElementXPath(elem, this.ATTR_CLASSID) + "/" + obj.ancestor_classid;
				obj.ancestor_id = this.getElementXPath(elem, this.ATTR_ID) + "/" + obj.ancestor_id;
				obj.ancestor_full = this.getElementXPath(elem, this.ATTR_FULL) + "/" + obj.ancestor_full;
				obj.ancestor_text = this.getElementXPath(elem, this.ATTR_ID) + "/" + obj.ancestor_text;
			}
			obj.ancestor_class = this.getElementXPath(elem, this.ATTR_NOT_CLASS) + "/" + obj.ancestor_class;
			obj.ancestor_attr = this.getElementXPath(elem, this.ATTR_NOT_CLASSID) + "/" + obj.ancestor_attr;
		}

		for (let [key, val] in Iterator(obj)) {
			if (val.substr(0, 4) !== 'id("')
				obj[key] = val = "//" + val;
		}
		var res = [x for each(x in obj)].filter(function(e, i, a) a.indexOf(e) === i).sort(function(a, b){
			let aa = a.substr(0, 4) == 'id("';
			let bb = b.substr(0, 4) == 'id("';
			if ((aa && bb) || (!aa && !bb))
				return b.length - a.length;
			return bb? 1 : -1;
		});
		//var res = [[x, obj[x]] for(x in obj)].sort(function([a,], [b,]) a >= b);
		////inspectObject([x for each(x in res)]);
		//res = [x for each([,x] in res)].filter(function(e, i, a) a.indexOf(e) === i);
		////inspectObject(res);
		return res;
	},
	getElementXPath: function(elem, constant) {
		if (!elem.getAttribute)
			return "";

		if (this.ATTR_CLASSID == constant) {
			if (elem.getAttribute("id"))
				return 'id("'+ elem.getAttribute('id') +'")';
			if (elem.getAttribute("class"))
				return elem.nodeName.toLowerCase() + '[@class="' + elem.getAttribute("class") + '"]';
			return elem.nodeName.toLowerCase();
		}
		if (this.ATTR_ID == constant) {
			if (elem.getAttribute("id"))
				return 'id("'+ elem.getAttribute('id') +'")';
			return elem.nodeName.toLowerCase();
		}
		if (this.ATTR_CLASS == constant) {
			if (elem.getAttribute("class"))
				return elem.nodeName.toLowerCase() + '[@class="' + elem.getAttribute("class") + '"]';
			return elem.nodeName.toLowerCase();
		}
		if(this.TEXT == constant){
			var elemHtml = elem.textContent;
			if(elemHtml.length < 20  && elemHtml.match(this.NEXT_REG)){
				if(elemHtml.match(this.NEXT_REG_A)){
					return elem.nodeName.toLowerCase() + '[text()="' + elemHtml + '"]';
				}
				return elem.nodeName.toLowerCase() + '[contains(text(), "' + elemHtml + '")]';
			}
			return elem.nodeName.toLowerCase();
		}

		var xpath = elem.nodeName.toLowerCase();
		if (this.ATTR_FULL == constant) {
			let x = [];
			if (elem.hasAttribute("id"))
				x[x.length] = '@id="' + elem.getAttribute("id") + '"';
			if (elem.hasAttribute("class"))
				x[x.length] = '@class="' + elem.getAttribute("class") + '"';
			if (x.length)
				xpath += '['+ x.join(" and ") +']';
		}

/*
		var attrs = elem.attributes;
		var arr = [];
		for (var i = 0, len = attrs.length; i < len; i++) {
			var name = attrs[i].nodeName;
			if (name === "style" || name === "id" || name === "class") continue;
			var value = attrs[i].nodeValue;
			arr[arr.length] = '@' + name + '="' + value + '"';
		};
*/
		var arr = [
			"@"+ x.nodeName +'="'+ x.nodeValue +'"' 
				for each(x in $A(elem.attributes)) 
					if (!/^(?:id|class|style)$/i.test(x.nodeName))
		];
		if (arr.length > 0)
			xpath += '[' + arr.join(" and ") + ']';
		return xpath;
	},
};



function log(){ Application.console.log($A(arguments)); }
function $(id) document.getElementById(id);
function $A(arr) Array.slice(arr);
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

function getElementsByXPath(xpath, node) {
	var nodesSnapshot = getXPathResult(xpath, node, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
	var data = [];
	for (var i = 0, l = nodesSnapshot.snapshotLength; i < l; i++) {
		data[i] = nodesSnapshot.snapshotItem(i);
	}
	return data;
}

function getFirstElementByXPath(xpath, node) {
	var result = getXPathResult(xpath, node, XPathResult.FIRST_ORDERED_NODE_TYPE);
	return result.singleNodeValue;
}

function getXPathResult(xpath, node, resultType) {
	var doc = node.ownerDocument || node
	var resolver = doc.createNSResolver(node.documentElement || node)
	// Use |node.lookupNamespaceURI('')| for Opera 9.5
	var defaultNS = node.lookupNamespaceURI(null)
	if (defaultNS) {
		const defaultPrefix = '__default__'
		xpath = addDefaultPrefix(xpath, defaultPrefix)
		var defaultResolver = resolver
		resolver = function (prefix) {
			return (prefix == defaultPrefix)
				? defaultNS : defaultResolver.lookupNamespaceURI(prefix)
		}
	}
	return doc.evaluate(xpath, node, resolver, resultType, null)
}

function addDefaultPrefix(xpath, prefix) {
	const tokenPattern = /([A-Za-z_\u00c0-\ufffd][\w\-.\u00b7-\ufffd]*|\*)\s*(::?|\()?|(".*?"|'.*?'|\d+(?:\.\d*)?|\.(?:\.|\d+)?|[\)\]])|(\/\/?|!=|[<>]=?|[\(\[|,=+-])|([@$])/g
	const TERM = 1, OPERATOR = 2, MODIFIER = 3
	var tokenType = OPERATOR
	prefix += ':'
	function replacer(token, identifier, suffix, term, operator, modifier) {
		if (suffix) {
			tokenType =
				(suffix == ':' || (suffix == '::' &&
				 (identifier == 'attribute' || identifier == 'namespace')))
				? MODIFIER : OPERATOR
		}
		else if (identifier) {
			if (tokenType == OPERATOR && identifier != '*') {
				token = prefix + token
			}
			tokenType = (tokenType == TERM) ? OPERATOR : TERM
		}
		else {
			tokenType = term ? TERM : operator ? OPERATOR : MODIFIER
		}
		return token
	}
	return xpath.replace(tokenPattern, replacer)
};


})('\
\
#sw-grid row > label {\
  margin: 1px !important;\
}\
  #sw-grid row > textbox {\
  -moz-appearance: none !important;\
  margin: 1px !important;\
  padding: 1px !important;\
  border-width: 1px !important;\
}\
  #sw-grid row > textbox[multiline="true"] {\
  height: 4em;\
}\
\
  #sw-grid .inspect {\
  list-style-image: url("chrome://global/skin/icons/Search-glass.png");\
  -moz-image-region: rect(0px, 16px, 16px, 0px);\
}\
\
  #sw-grid .check {\
  list-style-image: url("chrome://global/skin/icons/find.png");\
  -moz-image-region: rect(0px, 48px, 16px, 32px);\
}\
\
  #sw-url.error {\
  outline: 1px solid red !important;\
}\
  #sw-popup > * {\
  max-width: none !important;\
}\
');
