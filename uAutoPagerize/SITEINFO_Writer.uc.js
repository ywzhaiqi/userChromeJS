// ==UserScript==
// @name           SITEINFO_Writer.uc.js
// @description    uAutoPagerize 中文增强版的站点配置辅助工具
// @namespace      http://d.hatena.ne.jp/Griever/
// @author         Griever
// @modified       ywzhaiqi
// @update         2013-8-5
// @include        main
// @compatibility  Firefox 5 - firefox 23a1
// @charset        UTF-8
// @version        下書き1
// @note           大幅修改以适应 uAutoPagerize 中文规则增强版，移植了 AutoPager 的自动识别功能
// @note           fix compatibility for firefox 23a1 by lastdream2013
// @note           まだこれからつくり込む段階
// @note           ツールメニューから起動する
// ==/UserScript==

(function(css){

let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");

if (window.siteinfo_writer) {
	window.siteinfo_writer.destroy();
	delete window.siteinfo_writer;
}

window.siteinfo_writer = {
    USE_DEVTOOLS: false,  // 默认使用自带开发工具
    USE_FIREBUG: true,    // 默认使用 Firebug 查看

	init: function() {
      	this.style = addStyle(css);

	  	var overlay = '\
	      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
	               xmlns:html="http://www.w3.org/1999/xhtml"> \
	        <window id="main-window">\
				<vbox id="sw-container" class="sw-add-element" hidden="true">\
				    <hbox id="sw-hbox">\
				      <toolbarbutton label="查看规则" oncommand="siteinfo_writer.toJSON();"/>\
				      <toolbarbutton label="查看规则(SP)" oncommand="siteinfo_writer.toSuperPreLoaderFormat();"/>\
				      <toolbarbutton id="sw-curpage-info" label="读取当前页面规则" oncommand="siteinfo_writer.getCurPageInfo();"/>\
				      <toolbarbutton label="从剪贴板读取规则" oncommand="siteinfo_writer.readFromClipboard();"/>\
				      <toolbarbutton id="sw-discovery" tooltiptext="自动识别" oncommand="siteinfo_writer.discoveryAll(true, true);" />\
                      <toolbarbutton id="sw-launch" label="启动规则" tooltiptext="启动uAutoPagerize" oncommand="siteinfo_writer.launch();"/>\
                      <checkbox id="sw-useiframe" label="useiframe" checked="false"/>\
                      <checkbox id="sw-useDevtools" label="使用自带查看器" checked="' + this.USE_DEVTOOLS +'" \
                            oncommand="siteinfo_writer.USE_DEVTOOLS=!siteinfo_writer.USE_DEVTOOLS" \
                            hidden="true"/>\
                      <checkbox id="sw-inspect-by-firebug" label="用Firebug查看" checked="' + this.USE_FIREBUG +'" \
                            oncommand="siteinfo_writer.USE_FIREBUG=!siteinfo_writer.USE_FIREBUG" \
                            hidden="' + !window.Firebug + '" />\
                      <spacer flex="1"/>\
				      <toolbarbutton class="tabs-closebutton" oncommand="siteinfo_writer.hide();"/>\
				    </hbox>\
				    <grid id="sw-grid">\
				      <columns>\
				        <column />\
				        <column />\
                        <column />\
				        <column flex="1"/>\
				        <column />\
                        <column />\
				      </columns>\
				      <rows>\
				        <row>\
				          <label value="name" />\
                          <hbox />\
                          <toolbarbutton class="inspect"\
                                         tooltiptext="提取网站名称"\
                                         oncommand="siteinfo_writer.siteName.value = content.document.title;"/>\
				          <textbox id="sw-siteName"/>\
                          <hbox />\
                          <hbox />\
				        </row>\
				        <row>\
				          <label value="url" />\
                          <hbox />\
                          <toolbarbutton class="inspect"\
                                         tooltiptext="提取地址"\
                                         oncommand="siteinfo_writer.setUrl();"/>\
				          <textbox id="sw-url" oninput="siteinfo_writer.onInput(event);"/>\
                          <hbox />\
                          <hbox />\
				        </row>\
				        <row>\
				          <label value="nextLink" />\
                          <toolbarbutton class="discovery"\
                                         tooltiptext="自动识别下一页链接"\
                                         oncommand="siteinfo_writer.discovery(\'nextLink\');"/>\
                          <toolbarbutton class="inspect"\
                                         tooltiptext="提取XPath"\
                                         oncommand="siteinfo_writer.inspect(\'nextLink\');"/>\
				          <textbox id="sw-nextLink" \
                                   onkeypress="if(event.keyCode == 13){ siteinfo_writer.xpathTest(\'nextLink\'); }"/>\
				          <toolbarbutton class="check"\
				                         tooltiptext="测试XPath"\
				                         oncommand="siteinfo_writer.xpathTest(\'nextLink\');"/>\
                          <toolbarbutton class="inspect-devtools"\
                                         tooltiptext="使用Firebug或自带开发工具查看元素"\
                                         oncommand="siteinfo_writer.inspectMix(\'nextLink\');"/>\
				        </row>\
				        <row>\
				          <label value="pageElement" />\
                          <toolbarbutton class="discovery"\
                                         tooltiptext="自动识别内容"\
                                         oncommand="siteinfo_writer.discovery(\'pageElement\');"/>\
                          <toolbarbutton class="inspect"\
                                         tooltiptext="提取XPath"\
                                         oncommand="siteinfo_writer.inspect(\'pageElement\');"/>\
				          <textbox id="sw-pageElement" \
                                         onkeypress="if(event.keyCode == 13){ siteinfo_writer.xpathTest(\'pageElement\'); }"/>\
				          <toolbarbutton class="check"\
				                         tooltiptext="测试XPath"\
				                         oncommand="siteinfo_writer.xpathTest(\'pageElement\');"/>\
                          <toolbarbutton class="inspect-devtools"\
                                         tooltiptext="使用Firebug或自带开发工具查看元素"\
                                         oncommand="siteinfo_writer.inspectMix(\'pageElement\');"/>\
				        </row>\
				        <row hidden="true">\
				          <label value="insertBefore" />\
                          <hbox />\
                          <toolbarbutton class="inspect"\
                                         tooltiptext="提取XPath"\
                                         oncommand="siteinfo_writer.inspect(\'insertBefore\');"/>\
				          <textbox id="sw-insertBefore" />\
				          <toolbarbutton class="check"\
				                         tooltiptext="测试XPath"\
				                         oncommand="siteinfo_writer.xpathTest(\'insertBefore\');"/>\
                          <toolbarbutton class="inspect-devtools"\
                                         tooltiptext="使用Firebug或自带开发工具查看元素"\
                                         oncommand="siteinfo_writer.inspectMix(\'insertBefore\');"/>\
				        </row>\
				      </rows>\
				    </grid>\
				  </vbox>\
			</window>\
	      </overlay>';
    	overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    	window.userChrome_js.loadOverlay(overlay, window.siteinfo_writer);

        gBrowser.mPanelContainer.addEventListener('DOMContentLoaded', this, true);
	},
	observe : function (aSubject, aTopic, aData) {
        if (aTopic == "xul-overlay-merged") {
            this.popup = $("mainPopupSet").appendChild($C("menupopup", {
                id: "sw-popup",
                class: "sw-add-element",
            }));

            var menuitem = $C("menuitem", {
                id: "sw-menuitem",
                class: "sw-add-element",
                label: "辅助定制翻页规则",
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
                    let newMenuItem = menuitem.cloneNode(false);
                    newMenuItem.setAttribute("id", "sw-popup-menuitem");
                    aupPopup.appendChild(newMenuItem);
                }
            }, 2000);

            this.container = $("sw-container");
            this.url = $("sw-url");
            this.siteName = $("sw-siteName");
            this.nextLink = $("sw-nextLink");
            this.pageElement = $("sw-pageElement");
            this.useiframe = $("sw-useiframe");
            this.insertBefore = $("sw-insertBefore");

            this.nextLink.addEventListener("popupshowing", siteinfo_writer.textboxPopupShowing, false);
            this.pageElement.addEventListener("popupshowing", siteinfo_writer.textboxPopupShowing, false);
            this.insertBefore.addEventListener("popupshowing", siteinfo_writer.textboxPopupShowing, false);

            this.nextLink.setAttribute("tooltiptext", '例：auto; 或 css;a#pnnext 或 //a[@id="pnnext"] 或 //div[@id="footlink"]/descendant::a[text()="下一页"]');
            this.pageElement.setAttribute("tooltiptext", '例：css;#ires 或 //div[@id="ires"]');
        }
	},
	uninit : function ()  {
		gBrowser.mPanelContainer.removeEventListener('DOMContentLoaded', this, true);
	},
    destroy: function() {
        $A(document.getElementsByClassName("sw-add-element")).forEach(function(e){
            e.parentNode.removeChild(e);
        })
        this.style && this.style.parentNode.removeChild(this.style);

        this.uninit();
    },
	handleEvent: function(event){
		switch(event.type){
			case "DOMContentLoaded":
				var doc = event.target,
					win = doc.defaultView;
				if(win.location.hostname == 'ap.teesoft.info'){
					addContentStyle(doc, ".install{ display: block !important; }\
                        #need-ap { display: none !important;  }");
					this.fixAutoPagerBug(doc);

                    // 点击 install 自动安装
                    doc = win.wrappedJSObject.document;
					var evt = doc.createEvent("Events");
                    var self = this;
				    doc.addEventListener(evt, function(event){
				    	var ids = event.target.textContent;
				    	self.requestInfoFromAP(ids);
				    }, false);
				}
				break;
		}
	},
	textboxPopupShowing: function(event) {
        event.currentTarget.removeEventListener(event.type, arguments.callee, false);
        var popup = event.originalTarget;
        var type = event.currentTarget.id.replace("sw-", "");

        popup.appendChild($C("menuseparator", {}));

        popup.appendChild($C("menuitem", {
            label: '用开发工具查看元素',
            oncommand: "siteinfo_writer.inspectMix('" + type + "');",
        }));

        popup.appendChild($C("menuitem", {
            label: '@class="xxx" → contains()',
            oncommand: "siteinfo_writer.class2contains('" + type + "');",
        }));

        popup.appendChild($C("menuitem", {
            label: 'contains() → @class="xxx"',
            oncommand: "siteinfo_writer.contains2class('" + type + "');",
        }));
	},
	show: function(reset) {
        let info;
        if(!reset && content.ap && content.ap.info)
            info = content.ap.info;
        else
            [, info] = uAutoPagerize.getInfo();

        if(info){
            this.setAllValue(info);
        }else{
            this.discoveryAll(true, true);
        }

		this.container.hidden = false;
	},
	hide: function() {
		this.container.hidden = true;
	},
    setUrl: function() {
        var location = content.location;
        var url = location.protocol + "//" + location.host + location.pathname;

        this.url.value = "^" + url.replace(/[()\[\]{}|+.,^$?\\]/g, '\\$&');
        this.url.className = "";
    },
    setAllValue: function(info){
        this.siteName.value = info.siteName || info.name || content.document.title;
        this.nextLink.value = info.nextLink || "";
        this.pageElement.value = info.pageElement || "";
        this.useiframe.checked = !!info.useiframe;
        this.insertBefore.value = info.insertBefore || "";

        if(info.url){  // 转为字符串
            let url = info.url;
            let type = typeof(url);
            let urlValue;
            switch(type){
                case "object":
                    urlValue = String(url).replace(/^\//, '').replace(/\/[img]*$/, '').replace(/\\\//g, '/');
                    break;
                case "string":
                    if(url.match(/^\/(.*)\/[igm]?$/))
                        urlValue = RegExp.$1.replace(/\\\/\\\//g, '\/\/');
                    else
                        urlValue = url.replace(/\\\//g, '/').replace(/\\\\/g, '\\');
                    break;
            }

            if(urlValue)
                this.url.value = urlValue;
            else
                this.setUrl();
        }
    },
	toJSON: function() {
		var json = "\t{";
		json += "name: '" + this.siteName.value + "',\n";
		json += "\t\turl: '" + this.url.value.replace(/\\/g, "\\\\") + "',\n";
		json += "\t\tnextLink: '" + this.nextLink.value.replace(/'/g, '"') + "',\n";
		json += "\t\tpageElement: '" + this.pageElement.value.replace(/'/g, '"') + "',\n";
        if(this.useiframe.checked)
            json += "\t\tuseiframe: true,\n";
		if (this.insertBefore.value)
            json += "\t\tinsertBefore: '" + this.insertBefore.value + "',\n";
		json += "\t\texampleUrl: '" + content.location.href + "',\n";
		json += "\t},";
		var r=confirm("翻页规则（按确定键将其复制到剪贴板）："+'\n\n' + json);
		if(r){
			try{
                Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper)
                    .copyString(json);
            }catch(e){
                alert(e);
            }
		}
	},
	toSuperPreLoaderFormat: function() {
        var spdb = "\t{";
        spdb += "siteName: '" + this.siteName.value + "',\n";
        spdb += "\t\turl: /" + this.url.value.replace(/\//g, "\\\/") + "/i,\n";
        spdb += "\t\texampleUrl: '" + content.location.href + "',\n";
        spdb += "\t\tnextLink: '" + this.nextLink.value + "',\n";
        spdb += "\t\tautopager: {\n";
        spdb += "\t\t\tpageElement: '" + this.pageElement.value + "',\n";
        if (this.useiframe.checked)
            spdb += "\t\tuseiframe: true,\n";
        if (this.insertBefore.value)
            spdb += "\t\t\tHT_insert: ['" + this.insertBefore.value + "', 1],\n";
        spdb += "\t\t}\n";
        spdb += "\t},";
        var r = confirm("翻页规则(SuperPreLoader格式)（按OK键将其复制到剪贴板）：" + '\n\n' + spdb);
        if (r) {
            try {
                Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper).copyString(spdb);
            } catch (e) {
                alert(e);
            }
        }
	},
	getCurPageInfo: function(){
		if(!uAutoPagerize) return;

		var list = uAutoPagerize.getInfoFromURL();
		if(!list) return;

		var self = this;
		if(list.length == 1){
			this.setValueFromCurPage(list[0]);
		}else{
			this.curPageInfos = list;

			let range = document.createRange();
			range.selectNodeContents(self.popup);
			range.deleteContents();
			range.detach();
			for (let [i, info] in Iterator(list)) {
                let label = (info.siteName || info.name || info.url);
                if(info.type)
                    label += '[' + info.type + ']';

				let menuitem = document.createElement("menuitem");
				menuitem.setAttribute("label", label);
                menuitem.setAttribute("tooltiptext", "右键点击复制");
                menuitem.setAttribute("siteinfo_num", i);
				// menuitem.setAttribute("oncommand", "siteinfo_writer.setValueFromCurPage(" + i + ")");
				self.popup.appendChild(menuitem);

                // 设置当前页面的 info 为粗体
                if(content.ap && content.ap.info){
                    let infoC = content.ap.info;
                    if(info.url == infoC.url && info.nextLink == infoC.nextLink && info.pageElement == infoC.pageElement)
                        menuitem.setAttribute("class", "sw-highlight-info");
                }

                menuitem.addEventListener("click", function(e){
                    var num = e.target.getAttribute("siteinfo_num");
                    var info = self.curPageInfos[num];

                    if(e.button == 0){
                        self.setValueFromCurPage(info);
                    }else if (e.button == 2){
                        copyToClipboard(siteInfoToString(info));
                        // alert("该站点信息已经复制");
                    }
                });
			}
			self.popup.openPopup($("sw-curpage-info"), "before_after");
		}
	},
	setValueFromCurPage: function(info){
		if(typeof info == 'number'){
			info = this.curPageInfos[info];
		}

        this.setAllValue(info);
        this.urlTest();
	},

    // autopager 查询网站 install(a36122) 没有引号的错误。
    fixAutoPagerBug: function(doc){
        var link, links, onclick;
        links = doc.querySelectorAll("a.install");
        for (var i = links.length - 1; i >= 0; i--) {
            link = links[i];
            onclick = link.getAttribute("onclick").replace(/install\((\w+)\)/, "install('$1')");
            link.setAttribute("onclick", onclick);
        }
    },
	requestInfoFromAP: function(ids){
		var url;
		// json 格式
		if(ids.indexOf('a') == 0){
			url = "http://wedata.net/items/" + ids.slice(1) + ".json"
		}else{
			url = "http://www.teesoft.info/autopager/down/" + ids;
		}

		log("Request: " + url);
		var xhr = new XMLHttpRequest();
		var self = this;
		xhr.onload = function(){
			self.parseInfoFromAP(xhr);
		};
		xhr.open("GET", url, true);
		xhr.send(null);
	},
	parseInfoFromAP: function(xhr){
		if(this.container.hidden == true){
			this.container.hidden = false;
		}

		if(xhr.responseXML){
			log("parseInfoFromAP: XML");
			var xml = xhr.responseXML.documentElement;
			var site = getFirstElementByXPath("/autopager/site", xml);

			var urlPattern = getFirstElementByXPath("//urlPattern", site).textContent;
			var urlIsRegex = getFirstElementByXPath("//urlIsRegex", site).textContent;
			this.url.value = (urlIsRegex == 'false') ? wildcardToRegExpStr(urlPattern) : urlPattern;

			this.siteName.value = getFirstElementByXPath("//desc", site).textContent.replace("AutoPager rule for ", "");
			this.nextLink.value = getFirstElementByXPath("//linkXPath", site).textContent;
			this.pageElement.value = getFirstElementByXPath("//contentXPath", site).textContent;
		}else{
			log("parseInfoFromAP: JSON");
			var info = JSON.parse(xhr.responseText);

            this.setAllValue({
                name: info.name,
                url: info.data.url,
                nextLink: info.data.nextLink,
                pageElement: info.data.pageElement
            });
		}
	},

	readFromClipboard: function(){
		var dataStr = readFromClipboard();
		if(dataStr){
			var info = this.parseStringInfo(dataStr);
			if(info){
                this.setAllValue(info);
			}else{
				alert("剪贴板的数据格式不正确");
			}
		}
	},
	parseStringInfo: function(str) {
	    var lines = str.split(/\r\n|\r|\n/)
	    var re = /(^[^:]*?):(.*)$/
	    var strip = function(str) {
	        return str.replace(/^[\s\t{'"]*/, '').replace(/[\s,}'"]*$/, '')
	    }
	    var info = {}
	    for (var i = 0; i < lines.length; i++) {
	    	lines[i] = strip(lines[i]);
	        if (lines[i].match(re)) {
	            info[RegExp.$1.trim()] = strip(RegExp.$2).trim();
	        }
	    }
	    var isValid = function(info) {
	        var infoProp = ['url', 'nextLink', 'pageElement']
	        for (var i = 0; i < infoProp.length; i++) {
	            if (!info[infoProp[i]]) {
	                return false
	            }
	        }
	        return true
	    }
	    return isValid(info) ? info : null
	},

	launch: function() {
		if(content.ap){
			var r = confirm("uAutopagerize 已经运行，是否重新启动？");
            if(r)
                content.ap.destroy(true);
            else
                return;
		}

		var i = {};
		["url", "nextLink", "pageElement", "insertBefore"].forEach(function(type) {
			if (this[type].value)
				i[type] = this[type].value
		}, this);
		if (!i.url || !i.nextLink || !i.pageElement)
			return alert("指定的值无效");

        if(this.useiframe.checked)
            i.useiframe = true;

		let [index, nextLink, pageElement] = uAutoPagerize.getInfo([i], content);

		if (index === 0) {
			if (content.AutoPagerize && content.AutoPagerize.launchAutoPager)
				content.AutoPagerize.launchAutoPager([i]);
			else alert("翻页规则语法正确，但uAutoPagerize无法执行，可能uAutoPagerize被禁用或没有安装脚本");
		} else {
            alert("下一页链接或页面内容没有找到");
		}
	},
	inspect: function(aType) {
        if (this.USE_DEVTOOLS) {
            gDevToolsBrowser.selectToolCommand(gBrowser, "inspector");
        } else {
            if (this._inspect)
                this._inspect.uninit();
            var self = this;
            this._inspect = new Inspector(content, aType, function(items) {
                if (items.length) {
                    self.createXPathPopupMenu(items, aType);
                }
                self._inspect = null;
            });
        }
	},
    inspectMix: function(aType) {
        let xpath;
        if(aType == "nextLink"){
            xpath = this.nextLink.value;
        }else if(aType == "pageElement"){
            xpath = this.pageElement.value;
        }else if(aType == "insertBefore"){
            xpath = this.insertBefore.value;
        }

        var doc = content.document;
        try{
            var elem = getFirstElementByXPath(xpath, doc);
        }catch(e){
            return;
        }

        if(!elem)
            return;

        if(window.Firebug && this.USE_FIREBUG){
            Firebug.browserOverlay.startFirebug(function(Firebug){
                Firebug.Inspector.inspectFromContextMenu(elem);
            });
        }else{
            /*
             * 有这么变的吗，四个版本，变了三次地址！！！
             */
            let devtools = {};
            let version = Services.appinfo.version.split(".")[0];
            let DEVTOOLS_URI;
            if (version >= 24) {
                DEVTOOLS_URI = "resource://gre/modules/devtools/Loader.jsm";
                ({devtools} = Cu.import(DEVTOOLS_URI, {}));
            } else if (version < 24 && version >= 23) {
                DEVTOOLS_URI = "resource:///modules/devtools/gDevTools.jsm";
                ({devtools} = Cu.import(DEVTOOLS_URI, {}));
            } else if (version < 23 && version >= 20) {
                DEVTOOLS_URI = "resource:///modules/devtools/Target.jsm";
                devtools = Cu.import(DEVTOOLS_URI, {});
            } else {
                return (function (elem, InspectorUI) {
                    if (InspectorUI.isTreePanelOpen) {
                        InspectorUI.inspectNode(elem);
                        InspectorUI.stopInspecting();
                    } else {
                        InspectorUI.openInspectorUI(elem);
                    }
                })(elem, InspectorUI);
            }
            let tt = devtools.TargetFactory.forTab(gBrowser.selectedTab);
            return gDevTools.showToolbox(tt, "inspector").then((function (elem) {
                return function(toolbox) {
                    let inspector = toolbox.getCurrentPanel();
                    inspector.selection.setNode(elem, "Siteinfo-writer-Inspector");
                }
            })(elem));
        }
    },

    discoveryResult: null,
    discoveryAll: function(setValue, test){
        this.discoveryResult = new autopagerDiscoveryResult(content.document, []);

        if(setValue){
            var linkXPath = this.discoveryResult.linkXPaths[0];
            var contentXPath = this.discoveryResult.contentXPaths[0];

            this.setAllValue({
               nextLink: linkXPath && linkXPath.xpath,
               pageElement: contentXPath && contentXPath.xpath
            });
        }

        if(test){
            this.xpathTest("pageElement");
            setTimeout(function(self){
                self.xpathTest("nextLink");
            }, 1000, this)
        }
    },
    discovery: function(aType){
        if(!this.discoveryResult)
            this.discoveryAll(false, false);

        var items = [];
        if(aType == 'nextLink'){
            items  = this.discoveryResult.linkXPaths;
        }else if(aType == 'pageElement'){
            items = this.discoveryResult.contentXPaths;
        }

        this.createXPathPopupMenu(items, aType);
    },
    createXPathPopupMenu: function(items, aType){
        let range = document.createRange();
        range.selectNodeContents(this.popup);
        range.deleteContents();
        range.detach();

        for (let [i, item] in Iterator(items)) {
            if(item == "-"){
                this.popup.appendChild(document.createElement("menuseparator"));
                continue;
            }

            let menuitem = document.createElement("menuitem");
            menuitem.setAttribute("label", item.xpath);
            menuitem.setAttribute("oncommand", "siteinfo_writer['"+ aType +"'].value = this.getAttribute('label');" +
                "siteinfo_writer.xpathTest('"+ aType +"');");
            this.popup.appendChild(menuitem);
        }
        this.popup.openPopup(this.container, "before_start");
    },

    toClearElements: [],
	xpathTest: function(aType) {
		var textbox = this[aType]
		if (!textbox || !textbox.value) return;

        var selector = textbox.value;
        var autoGetLink = uAutoPagerize.autoGetLink;
        var doc = content.document;
		try {
            var elements;
            if(selector.startsWith("css;")){
                selector = selector.slice(4);
                if(selector)
                    elements = doc.querySelectorAll(selector);
                else
                    return alert("css; 后面不能为空");
            }else if(autoGetLink && selector.trim() == "auto;"){
                let nextLink = autoGetLink(doc);
                if(nextLink)
                    elements = [nextLink];
                else
                    return alert("没有找到下一页链接");
            }else{
                elements = getElementsByXPath(selector, doc);
            }
		} catch (e) {
            return alert(e);
		}

        if(elements && elements[0]){
            elements[0].scrollIntoView();
        }else{
            return alert("没有找到元素");
        }

        var self = this;
        clearElementsStyle();

		for (let [i, elem] in Iterator(elements)) {
			if (!("orgcss" in elem))
				elem.orgcss = elem.style.cssText;
			elem.style.backgroundImage = "-moz-linear-gradient(magenta, plum)";
			elem.style.outline = "1px solid magenta";
            this.toClearElements.push(elem);
		}

		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		this.timer = setTimeout(clearElementsStyle, 5000);

        function clearElementsStyle() {
            for (let [i, elem] in Iterator(self.toClearElements)) {
                if ("orgcss" in elem) {
                    elem.orgcss?
                        elem.style.cssText = elem.orgcss:
                        elem.removeAttribute("style");
                    delete elem.orgcss;
                }
            }
            self.toClearElements = [];
        }
	},
	urlTest: function() {
		var urlValue = this.url.value;
        if(urlValue.startsWith("wildc;"))
            urlValue = wildcardToRegExpStr(urlValue.slice(6));
        try {
            var regexp = new RegExp(urlValue);

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
    getElementXPathes: function(elem){
        var doc = elem.ownerDocument;
        var items = [];
        items = autopagerXPath.discoveryMoreLinks(doc, items, [elem]);

        return items;
    }
};

var existingSites

var autopagerXPath = {
    smarttext: "next|>|下一页|下一頁|下一章|下一节|下一篇|下一幅|次を表示",
    discoverytext: "navbar|right_arrow|pagN|page|pages|paging|下页|次页|Volgende|Volg|Verder|Напред|Следва|Næste|Nächste|Naechste|Weiter|Vorwärts|Vorwaerts|Volgende|Continue|Onward|Venonta|Seuraava|Suivant|Prochaine|Επόμενη|Næst|Successive|Successiva|Successivo|Prossima|Prossime|Prossimo|Altra|Altro|次へ|다음|Neste|Dalej|Następna|Następne|Następny|Więcej|Próximo|Înainte|Înaintare|Următor|Următoare|След|Следующая|Siguiente|Próxima|Próximos|Nästa|Sonraki|Devam|İlerle",
    MAXTextLength: 20,
    MAXLevel: 6,

    _existingSites: null,
    get existingSites() {
        if(this._existingSites == null){
            this._existingSites = window.uAutoPagerize.MY_SITEINFO.concat(window.uAutoPagerize.SITEINFO_CN) || [];
        }

        return this._existingSites;
    },

    discoveryLink: function(doc, xpathes) {
        var smarttext = this.smarttext;
        var discoverytext = this.discoverytext;

        var url = doc.documentURI;
        var body = doc.documentElement.innerHTML;
        var strs = (smarttext + "|" + discoverytext).split("|");

        var texts = "|";
        var ignoredTexts = "|";
        for (var k = 0; k < strs.length; ++k)
            strs[k] = strs[k].toLowerCase().replace(new RegExp(" ", "gm"), "");
        for (var k = 0; k < strs.length; ++k) {
            if (strs[k].length == 0)
                continue;
            if (texts.indexOf("|" + strs[k] + "|") == -1 && ignoredTexts.indexOf("|" + strs[k] + "|") == -1) {
                if (body.indexOf(strs[k]) != -1)
                    texts = texts + strs[k] + "|";
                else
                    ignoredTexts = ignoredTexts + strs[k] + "|";
            }
        }
        var tmpPaths = this.convertToXpath(texts);

        var links = [];
        var item = null;
        for (var i in tmpPaths) {
            //get the nodes
            var urlNodes = this.evaluate(doc, tmpPaths[i]);
            if (urlNodes != null && urlNodes.length != 0) {
                for (var level = 1; level < this.MAXLevel; level += 1) {
                    var items = this.getLinkXPathItemFromNodes(doc, urlNodes, level);
                    for (var l in items) {
                        item = items[l];
                        if (item != null)
                            this.addItem(doc, links, item);
                    }
                }
            }
        }

        //try the links next to this page
        item = new autopagerXPathItem();
        item.authority = 0.2;
        item.xpath = "(//a[@href and @href = %href%]/following-sibling::a[1])[translate(text(),'0123456789','')='']";
        this.addItem(doc, links, item);

        item = new autopagerXPathItem();
        item.authority = 0.1;
        item.xpath = "(//a[@href and %href% = concat(%pathname%,@href) ]/following-sibling::a[1])[translate(text(),'0123456789','')='']";
        this.addItem(doc, links, item);

        item = new autopagerXPathItem();
        item.authority = 0.1;
        item.xpath = "(//a[@href and contains(@href , concat(%pathname% , %search%))]/following-sibling::a[1])[translate(text(),'0123456789','')='']";
        this.addItem(doc, links, item);

        item = new autopagerXPathItem();
        item.authority = 0.1;
        item.xpath = "(//a[@href and contains(concat(%pathname% , %search%),@href)]/following-sibling::a[1])[translate(text(),'0123456789','')='']";
        this.addItem(doc, links, item);

        item = new autopagerXPathItem();
        item.authority = 0.12;
        item.xpath = "(//a[@href and contains(@href , %href%)]/following-sibling::a[1])[translate(text(),'0123456789','')='']";
        this.addItem(doc, links, item);

        item = new autopagerXPathItem();
        item.authority = 0.1;
        item.xpath = "(//a[@href and contains(@href , %filename%)]/following-sibling::a[1])[translate(text(),'0123456789','')='']";
        this.addItem(doc, links, item);

        //try to find the page navigator, then find next links
        var navBars = this.evaluate(doc, "//*[count(a[text() != '' and translate(text(),'0123456789','')=''])>=2]/a[text() != '' and translate(text(),'0123456789','')='']");
        if (navBars && navBars.length != 0) {
            for (var level = 1; level < this.MAXLevel; level += 1) {
                var paths = this.anaLyzeNavbar(doc, navBars, level);
                for (var i in paths) {
                    item = new autopagerXPathItem();
                    item.authority = (this.MAXLevel / level);
                    item.xpath = paths[i];
                    if (item.xpath.indexOf("//input") != -1)
                        item.authority = item.authority / 2;
                    this.addItem(doc, links, item);
                }
            }
        }

        item = new autopagerXPathItem();
        item.xpath = "//*[count(a[text() != '' and translate(text(),'0123456789','')=''])>=2 ]/*[name()='STRONG' or name()='B']/following-sibling::a[1]";
        item.authority = 4;
        this.addItem(doc, links, item);

        links = this.mergeXPath(links);
        var newlinks = [];
        for (var i = 0; i < links.length; ++i) {
            if (links[i].authority > 0.005 && links[i].matchCount < 40)
                newlinks.push(links[i])
        }
        links = this.sortItems(newlinks);

        // try the existing site settings
        links.push("-");  // 添加分隔符
        Array.slice(this.existingSites).forEach(function(site){
            var existes = links.filter(function(link){
                return link.xpath == site.nextLink;
            });
            if(existes.length) return;

            var nodes = autopagerXPath.evaluate(doc, site.nextLink);
            if (nodes != null && nodes.length > 0) {
                item = new autopagerXPathItem();
                item.authority = 4;
                item.xpath = site.nextLink
                item.matchCount = nodes.length
                item.existing = true;
                links.push(item);
            }
        });

        return links;
    },
    discoveryMoreLinks: function(doc, links, nodes) {
        for (var level = 1; level < this.MAXLevel; level += 1) {
            var items = this.getLinkXPathItemFromNodes(doc, nodes, level);
            for (var i in items) {
                var item = items[i];
                if (item != null)
                    this.addItem(doc, links, item);
            }
        }
        links = this.mergeXPath(links);
        links = this.sortItems(links);
        var newLinks = [];
        //filter it again
        for (var i = 0; i < links.length; i++) {
            var item = links[i]
            if (this.isMatchNodes(doc, item.xpath, nodes))
                newLinks.push(item);
        }
        return newLinks;
    },
    discoveryContent: function(doc, xpathes) {
        var node = doc.body;
        var url = doc.documentURI;
        var items = [];
        var links = [];
        var item = null;

        var knowLinks = [];
        xpathes = xpathes || {};
        for (var n in xpathes) {
            var site = xpathes[n];
            //try the existing site settings
            var nodes = this.evaluate(doc, site.x, true, 10);
            if (nodes != null && nodes.length > 0) {
                item = new autopagerXPathItem();
                item.authority = site.c;
                item.matchCount = nodes.length

                if (site.x != "//body" && site.x != "//body/*" && site.x != "//body/table") {
                    nodes = this.evaluate(doc, site.n, true, 2);
                    if (nodes != null && nodes.length > 0)
                        item.authority = item.authority * 3;
                }
                item.xpath = site.x
                knowLinks.push(item)
                //this.addItem(doc,links,item);
                //site.xpathItem = item
            }
        }
        knowLinks = this.sortItems(knowLinks);
        for (var i = 0; i < knowLinks.length; i++) {
            var l = knowLinks[i]
            var ignore = false;
            for (var n = 0; n < i; n++) {
                if (l.xpath == knowLinks[n].xpath) {
                    ignore = true;
                    break;
                }
            }
            if (!ignore)
                this.addItem(doc, links, l);
        }

        var contentNode = this.discoveryBigContent(node, items);
        contentNode = this.discoveryBigContent(contentNode, items);

        for (var i in items) {
            item = items[i];
            if (item != null)
                this.addItem(doc, links, item);
        }

        item = new autopagerXPathItem();
        item.authority = 1;
        item.xpath = "//body/*";
        links.push(item)

        links = this.mergeXPath(links);
        //get others

        links = this.sortItems(links);

        //try the existing site settings
        var existingSites = this.existingSites;
        links.push("-");  // 添加分隔符
        Array.slice(this.existingSites).forEach(function(site){
            if(site.pageElement == "//body/*") return;

            var existes = links.filter(function(link){
                return link.xpath == site.pageElement;
            });
            if(existes.length) return;

            var nodes = autopagerXPath.evaluate(doc, site.pageElement, true, 10);
            if (nodes != null && nodes.length > 0) {
                item = new autopagerXPathItem();
                item.authority = 4;
                item.xpath = site.pageElement
                item.matchCount = nodes.length
                item.existing = true;
                links.push(item);
            }
        });

        return links;
    },
    discoveryBigContent: function(node, items) {
        var contentNode = null;
        var len = 0;
        for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (child.nodeType == 1 && child.innerHTML.length > len) {
                contentNode = child;
                len = child.innerHTML.length;
            }
        }
        var item = null;
        for (var level = 1; level < this.MAXLevel; level += 1) {

            item = new autopagerXPathItem();
            item.xpath = this.getLinkXpathFromNode(node, contentNode, level);
            item.authority = (this.MAXLevel / level);
            items.push(item);
            item = new autopagerXPathItem();
            item.xpath = this.getXPathForObjectByParent(contentNode, 3, level);
            item.authority = (this.MAXLevel / level);
            items.push(item);

        }
        return contentNode;
    },
    isMatchNodes: function(doc, xpath, nodes) {
        var matchNodes = this.evaluate(doc, xpath);
        if (matchNodes != null && matchNodes.length > 0) {
            for (var n = 0; n < nodes.length; n++)
                for (var i = 0; i < matchNodes.length; i++) {
                    if (nodes[n].isEqualNode(matchNodes[i]))
                        return true;
                }
        }
        return false;
    },
    sortItems: function(links) {
        links.sort(function authority(a, b) {
            if (b.authority == a.authority) {
                if (a.xpath.length == b.xpath.length)
                    return a.matchCount - b.matchCount;
                return a.xpath.length - b.xpath.length;
            }
            return b.authority - a.authority;
        });
        return links;
    },
    modifyAuthoryByDeep: function(item) {
        var reg = /\/\/|\//g;
        var count = 0;
        while (reg.exec(item.xpath)) {
            count++;
        }
        if (count >= 2)
            count = count / 1.5;
        else if (count == 0)
            count = 1;
        return item.authority / count;
    },
    mergeXPath: function(links) {
        //return links;
        for (var i = 0; i < links.length; ++i) {
            var item = links[i];
            item.authority = this.modifyAuthoryByDeep(item);
        }

        for (var i = 0; i < links.length; ++i) {
            var item = links[i];
            for (var j = i + 1; j < links.length; ++j) {
                if (links[i].matchCount == links[j].matchCount) {
                    var left = -1;
                    var right = -1;
                    if (this.xpathContain(links[i], links[j])) {
                        left = j
                        right = i;
                    } else if (this.xpathContain(links[j], links[i])) {
                        left = i
                        right = j;
                    }
                    if (left >= 0) {
                        if (links[left].authority < links[right].authority)
                            links[left].authority = links[right].authority;
                        if (links[right].matchCount > 2)
                            links[left].authority = links[left].authority + 1 / links[right].matchCount;
                        else
                            links[left].authority = links[left].authority + 1;
                    }
                }
            }
        }
        var newlinks = [];
        for (var i = 0; i < links.length; ++i) {
            if (links[i].xpath.length < 128)
                newlinks.push(links[i])
        }
        return newlinks;
    },
    xpathContain: function(item1, item2) {
        if (item2.xpath.substring(0, 2) == '//') {
            return item1.xpath.indexOf(item2.xpath.substring(1)) >= 0;
        }
        return item1.xpath.indexOf(item2.xpath) >= 0;
    },
    addItem: function(doc, links, item) {
        //ignore
        if (!item.xpath || item.xpath == "//a")
            return;

        // autopagerUtils.log("Start " + item.xpath + " " + item.authority);
        item.authority = this.modifyAuthoryByDeep(item);
        for (var i in links) {
            if (links[i].xpath == item.xpath) {
                if (links[i].matchCount > 1) {
                    if (item.xpath[0] != item.xpath[item.xpath.length - 1]) {
                        item.authority = item.authority / item.xpath.length;
                    }
                }
                if (links[i].matchCount > 2)
                    links[i].authority = links[i].authority + (item.authority / links[i].matchCount);
                else
                    links[i].authority = links[i].authority + item.authority;
                return;
            }
        }

        var nodes = this.evaluate(doc, item.xpath);
        if (nodes != null && nodes.length > 0) {
            item.matchCount = nodes.length;
            if (nodes.length > 1) {
                if (nodes[0] != nodes[nodes.length - 1]) {
                    item.authority = item.authority / nodes.length;
                }
            }
            if (item.matchCount > 2)
                item.authority = item.authority / item.matchCount;


            //if the xpath use possion, lower it's 'authority
            if (/\d( )*]/.test(item.xpath.replace("following-sibling\:\:a\[1\]", ""))) {
                item.authority = item.authority / 2;
            }
            links.push(item);
        }
        // autopagerUtils.log("End " + item.xpath + " " + item.authority);
    },

    convertToXpath: function(str, exactlymatch) {
        var xpaths = new Array();
        var strs = str.split("|");
        for (var k = 0; k < strs.length; ++k) {
            if (!exactlymatch)
                strs[k] = strs[k].toLowerCase().replace(new RegExp(" ", "gm"), "");
        }
        for (var i = 0; i < strs.length; ++i) {
            if (strs[i].length == 0)
                continue;
            this.convertStringToXPath(xpaths, "//a[", "]", strs[i], "", exactlymatch);
            this.convertStringToXPath(xpaths, "//*[", "][count(a)=1]/a", strs[i], "", exactlymatch);
            this.convertStringToXPath(xpaths, "//input[(@type='submit' or @type='button' or @type='image') and ", "]", strs[i], "", exactlymatch);
            this.convertStringToXPath(xpaths, "//*[", "][count(input)=1]/input", strs[i], "", exactlymatch);
            var chars = this.getChars(str);
            xpaths.push("//head/link[" + this.xpathEquals("@ref", chars, str) + "]/@href");
            if (!exactlymatch) {
                xpaths.push("//head/link[" + this.xpathContains("@ref", chars, str) + "]/@href");
            }
        }
        return xpaths;
    },
    xpathContains: function(path, chars, str) {
        return "contains(translate(normalize-space(" + path + "),'" + chars.toUpperCase() + "', " + "'" + chars + "'),'" + str + "')";
    },
    xpathEquals: function(path, chars, str) {
        return path + "='" + str + "'";
    },
    convertStringToXPath: function(xpaths, prefix, subfix, str, dir, exactlymatch) {
        var chars = this.getChars(str);
        if (str.length > 0) {
            xpaths.push(dir + prefix + this.xpathEquals("@id", chars, str) + subfix);
            xpaths.push(dir + prefix + this.xpathEquals("@rel", chars, str) + subfix);
            xpaths.push(dir + prefix + this.xpathEquals("@name", chars, str) + subfix);
            xpaths.push(dir + prefix + this.xpathEquals("@title", chars, str) + subfix);
            xpaths.push(dir + prefix + this.xpathEquals("@class", chars, str) + subfix);
            xpaths.push(dir + prefix + this.xpathEquals("img/@src", chars, str) + subfix);
            xpaths.push(dir + prefix + "img[" + this.xpathEquals("@src", chars, str) + "]" + subfix);
            xpaths.push(dir + prefix + "img[" + this.xpathEquals("@alt", chars, str) + "]" + subfix);
            xpaths.push(dir + prefix + this.xpathEquals("text()", chars, str) + subfix);
            xpaths.push(dir + prefix + "span[" + this.xpathEquals("text()", chars, str) + "]" + subfix);
            xpaths.push(dir + prefix + "font[" + this.xpathEquals("text()", chars, str) + "]" + subfix);
            xpaths.push(dir + prefix + "b[" + this.xpathEquals("text()", chars, str) + "]" + subfix);
            xpaths.push(dir + prefix + "strong[" + this.xpathEquals("text()", chars, str) + "]" + subfix);
            xpaths.push(dir + prefix + this.xpathEquals("substring(img/@src,string-length(img/@src) - " + str.length + ")", chars, str) + subfix);
            if (!exactlymatch) {
                xpaths.push(dir + prefix + this.xpathContains("@id", chars, str) + subfix);
                xpaths.push(dir + prefix + this.xpathContains("@rel", chars, str) + subfix);
                xpaths.push(dir + prefix + this.xpathContains("@name", chars, str) + subfix);
                xpaths.push(dir + prefix + this.xpathContains("@title", chars, str) + subfix);
                xpaths.push(dir + prefix + this.xpathContains("@class", chars, str) + subfix);
                xpaths.push(dir + prefix + this.xpathContains("img/@src", chars, str) + subfix);
                xpaths.push(dir + prefix + "img[" + this.xpathContains("@src", chars, str) + "]" + subfix);
                xpaths.push(dir + prefix + "img[" + this.xpathContains("@alt", chars, str) + "]" + subfix);
                xpaths.push(dir + prefix + this.xpathContains("text()", chars, str));
                xpaths.push(dir + prefix + "span[" + this.xpathContains("text()", chars, str) + "]" + subfix);
                xpaths.push(dir + prefix + "font[" + this.xpathContains("text()", chars, str) + "]" + subfix);
                xpaths.push(dir + prefix + "b[" + this.xpathContains("text()", chars, str) + "]" + subfix);
                xpaths.push(dir + prefix + "strong[" + this.xpathContains("text()", chars, str) + "]" + subfix);
                xpaths.push(dir + prefix + this.xpathContains("substring(img/@src,string-length(img/@src) - " + str.length + ")", chars, str) + subfix);

            }
        }
    },
    getChars: function(str) {
        var chars = "";
        for (var i = 0; i < str.length; ++i) {
            if (chars.indexOf(str.charAt(i)) == -1) {
                chars = chars + str.charAt(i);
            }
        }
        return chars;
    },

    getLinkXPathItemFromNodes: function(node, urlNodes, level) {
        var items = [];
        var item = null;
        //if we only get one node
        if (urlNodes.length == 1) {
            item = new autopagerXPathItem();
            item.xpath = this.getLinkXpathFromNode(node, urlNodes[0], level);
            item.authority = (this.MAXLevel / level);
            if (urlNodes[0].tagName != 'A')
                item.authority = item.authority / 3;
            items.push(item);
            item = new autopagerXPathItem();
            item.xpath = this.getXPathForObjectByParent(urlNodes[0], 3, level);
            item.authority = (this.MAXLevel / level);
            if (urlNodes[0].tagName != 'A')
                item.authority = item.authority / 3;
            items.push(item);

            var xpath = this.getXPathForObjectBySibling(urlNodes[0], 3, level);
            if (xpath) {
                item = new autopagerXPathItem();
                item.xpath = xpath
                item.authority = (this.MAXLevel / level);
                if (urlNodes[0].tagName != 'A')
                    item.authority = item.authority / 3;
                items.push(item);

                item = new autopagerXPathItem();
                item.xpath = xpath
                // if (item.xpath.substr(-3) != "[1]")
                //     item.xpath = item.xpath + "[1]"
                item.authority = (this.MAXLevel / level);
                if (urlNodes[0].tagName != 'A')
                    item.authority = item.authority / 3;
                items.push(item);
            }

            xpath = this.getXPathForObjectBySibling2(urlNodes[0], 3, level);
            if (xpath) {
                item = new autopagerXPathItem();
                item.xpath = xpath
                item.authority = (this.MAXLevel / level) + 0.2;
                if (urlNodes[0].tagName != 'A')
                    item.authority = item.authority / 3;
                items.push(item);

                item = new autopagerXPathItem();
                item.xpath = xpath;
                if (item.xpath.substr(-3) != "[1]")
                    item.xpath = item.xpath + "[1]"
                item.authority = (this.MAXLevel / level) + 0.2;
                if (urlNodes[0].tagName != 'A')
                    item.authority = item.authority / 3;
                items.push(item);
            }

            item = new autopagerXPathItem();
            item.xpath = this.getXPathForObjectByPosition(urlNodes[0], 3, level);
            item.authority = (this.MAXLevel / level) / 1.2;
            if (urlNodes[0].tagName != 'A')
                item.authority = item.authority / 3;
            items.push(item);
        } else if (urlNodes.length <= 4) {
            item = new autopagerXPathItem();
            item.authority = (this.MAXLevel / level);
            if (urlNodes[0].tagName != 'A')
                item.authority = item.authority / 3;
            item.xpath = this.getLinkXpathFromTwoNodes(node, urlNodes[0], urlNodes[1], level);
            items.push(item);
        } else // too many links, ignore this
        {
            var paths = this.anaLyzeNavbar(node, urlNodes, level);
            for (var i in paths) {
                item = new autopagerXPathItem();
                item.authority = (this.MAXLevel / level);
                if (urlNodes[0].tagName != 'A')
                    item.authority = item.authority / 3;
                item.xpath = paths[i];
                items.push(item);
            }
        }
        return items;
    },
    getLinkXpathFromTwoNodes: function(parents, node1, node2, level) {
        //find the similar thing in node1 and node2
        //todo
        return this.getXPathForObjectByChild(node1, 3, level);
    },
    getText: function(x) {
        if (x.nodeValue != null && String(x.nodeValue) != "")
            return String(x.nodeValue);
        if (x.lastChild != null && x.lastChild.nodeValue != null)
            return String(x.lastChild.nodeValue);
        return "";
    },
    anaLyzeNavbar: function(node, urlNodes, level) {
        var nodes = [];
        for (var i = 0; i < urlNodes.length; ++i) {
            var num = parseInt(autopagerXPath.getText(urlNodes[i]));
            if (num != NaN) {
                nodes.push(urlNodes[i]);
            }
        }

        nodes.sort(function(x, y) {
            var txt1 = parseInt(autopagerXPath.getText(x));
            var txt2 = parseInt(autopagerXPath.getText(y));
            return txt1 - txt2;
        });
        var xpaths = [];
        for (var i = 0; i < nodes.length - 1; i++) {
            if (parseInt(this.getText(nodes[i + 1])) == 2 + parseInt(this.getText(nodes[i]))) {
                var xpath = this.getXPathForObjectByChild(nodes[i + 1], 3, level);
                if (xpath != null && xpath.length > 0)
                    xpaths.push(xpath);
                xpath = this.getXPathForObjectByParent(nodes[i + 1], 3, level);
                if (xpath != null && xpath.length > 0)
                    xpaths.push(xpath);
                xpath = this.getXPathForObjectBySibling(nodes[i + 1], 3, level);
                if (xpath != null && xpath.length > 0)
                    xpaths.push(xpath);
                xpath = this.getXPathForObjectBySibling2(nodes[i + 1], 3, level);
                if (xpath != null && xpath.length > 0)
                    xpaths.push(xpath);
            }
        }
        if (xpaths.length == 0 && nodes.length > 0) {
            var xpath = this.getXPathForObjectBySibling(nodes[0], 3, level);
            if (xpath != null && xpath.length > 0)
                xpaths.push(xpath);
            xpath = this.getXPathForObjectBySibling2(nodes[0], 3, level);
            if (xpath != null && xpath.length > 0)
                xpaths.push(xpath);
        }
        return xpaths;
    },
    getLinkXpathFromNode: function(parents, node, level) {
        return this.getXPathForObjectByChild(node, 3, level);
    },

    appendAndCondition: function(base, newStr) {
        if (base.length > 0) {
            if (newStr.length > 0)
                return base + " and " + newStr;
            else
                return base;
        }
        return newStr;
    },
    getClearText: function(str) {
        return str.replace(new RegExp("^[  \t \n \r]*", "gm"), "").replace(new RegExp("([  \t \n \r]*)$", "gm"), "");
    },
    getXIdetify: function(node, dir, level) {
        var xi = "";
        try {
            if (level >= 1 && node.getAttribute("id") != null && node.getAttribute("id").length > 0) {
                xi = this.appendAndCondition(xi, dir + "@id='" + node.getAttribute("id") + "'");
            }
            if (level >= 1 && node.getAttribute("rel") != null && node.getAttribute("rel").length > 0) {
                xi = this.appendAndCondition(xi, dir + "@rel='" + node.getAttribute("rel") + "'");
            }
            if (level >= 2 && (node.className != null) && (node.className.length > 0)) {
                xi = this.appendAndCondition(xi, dir + "@class='" + node.className + "'");
            }
            if (level >= 3 && node.getAttribute("title") != null && node.getAttribute("title").length > 0) {
                xi = this.appendAndCondition(xi, dir + "@title='" + node.getAttribute("title") + "'");
            }
            if (level >= 3 && level < 5 && node.textContent != null && node.childNodes.length == 1 && node.textContent.length > 0 && node.textContent.length < this.MAXTextLength) {
                //only if child is #text
                var child = node.childNodes[0];

                if (child.nodeType == 3)
                    xi = this.appendAndCondition(xi, "(" + dir + "text()='" + this.getClearText(child.textContent) + "')");
            }
            if (level >= 5 && node.textContent != null && node.childNodes.length == 1 && node.textContent.length > 0 && node.textContent.length < this.MAXTextLength) {
                //only if child is #text
                var child = node.childNodes[0];

                if (child.nodeType == 3)
                    xi = this.appendAndCondition(xi, "contains(" + dir + "text(),'" + this.getClearText(child.textContent) + "')");
            }
            if (node.tagName == "INPUT") {
                if (level >= 3 && node.getAttribute("type") != null && node.getAttribute("type").length > 0) {
                    xi = this.appendAndCondition(xi, dir + "@type='" + node.getAttribute("type") + "'");
                }
                if (level >= 1 && node.getAttribute("name") != null && node.getAttribute("name").length > 0) {
                    xi = this.appendAndCondition(xi, dir + "@name='" + node.getAttribute("name") + "'");
                }
                if (level >= 3 && node.getAttribute("value") != null && node.getAttribute("value").length > 0) {
                    xi = this.appendAndCondition(xi, dir + "@value='" + node.getAttribute("value") + "'");
                }
                if (level >= 3 && node.getAttribute("src") != null && node.getAttribute("src").length > 0) {
                    xi = this.appendAndCondition(xi, dir + "@src='" + node.getAttribute("src") + "'");
                }
            } else if (node.tagName == "IMG") {
                if (level >= 3 && node.getAttribute("src") != null && node.getAttribute("src").length > 0) {
                    xi = this.appendAndCondition(xi, dir + "@src='" + node.getAttribute("src") + "'");
                }
                if (level >= 3 && node.getAttribute("alt") != null && node.getAttribute("alt").length > 0) {
                    xi = this.appendAndCondition(xi, dir + "@alt='" + node.getAttribute("alt") + "'");
                }
            }
        } catch (e) {

        }
        return xi;
    },
    getTagCount: function(childs, index) {
        var tagCount = 0;
        var tagname = childs[index].tagName;
        for (var i = childs.length - 1; i >= 0; --i) {
            if (childs[i].tagName == tagname)
                tagCount++;
        }
        return tagCount;
    },

    getTagIndex: function(childs, index) {
        var tagIndex = 1;
        var tagname = childs[index].tagName;
        for (var i = index - 1; i >= 0; --i) {
            if (childs[i].tagName == tagname)
                tagIndex++;
        }
        return tagIndex;
    },
    getXPath: function(node, dir, deep, maxChildCount, level) {
        var xi = this.getXIdetify(node, dir, level);
        if (deep > 0 && node.hasChildNodes() && (node.childNodes != null) && (node.childNodes.length > 0)) {
            var childs = node.childNodes;
            for (var i = 0; i < childs.length; ++i) {
                if (childs[i].nodeType == 1) {
                    var tagname = childs[i].tagName.toLowerCase();
                    if (maxChildCount >= this.getTagIndex(childs, i)) {
                        if (this.getTagCount(childs, i) > 1)
                            tagname = tagname + "[" + this.getTagIndex(childs, i) + "]";
                        xi = this.appendAndCondition(xi,
                            this.getXPath(childs[i], dir + tagname + "/", deep - 1, maxChildCount, level));
                    }
                }
            }
        }
        return xi;
    },
    getTagName: function(node) {
        if (!node)
            return "nosuchnode";
        var tagname = node.tagName.toLowerCase();
        if (tagname == 'td' || tagname == 'th' || tagname == 'tr' || tagname == 'tbody')
            tagname = "table";
        return tagname;
    },
    getPathDir: function(root, child) {
        var dir = "";
        if (root != child) {
            if (root == 'table') {
                if (child == 'td' || child == 'th')
                    dir = "/" + child;
                if (child != "tbody")
                    dir = "/tr" + dir;
                dir = "tbody" + dir;
            }
            if (dir.length > 0)
                dir = dir + "/";
        }
        return dir;
    },

    getXPathForObjectByChild: function(target, maxChildCount, level) {
        if (!target)
            return [];
        var tagname = this.getTagName(target);
        var dir = this.getPathDir(tagname, target.tagName.toLowerCase());
        var path = "//" + tagname;
        var xi = this.getXPath(target, dir, 1, maxChildCount, level);
        if (xi.length > 0)
            path = path + "[" + xi + "]";
        return path;
    },
    getXPathForObjectByParent: function(target, maxChildCount, level) {
        var nodePath = this.getNodeParents(target)
        var dir = "";
        var path = "/";
        for (var i in nodePath) {
            var node = nodePath[i]
            var xi = this.getXPath(node, dir, 0, maxChildCount, level);
            path = path + "/" + node.tagName.toLowerCase();
            if (xi.length > 0)
                path = path + "[" + xi + "]";

        }
        return path;
    },
    getXPathForObjectBySibling: function(target, maxChildCount, level) {

        if (target.nodeType != 1)
            return "";
        var nodePath = this.getPreviousNodes(target)
        var dir = "";
        var path = this.getXPathForObjectByParent(target.parentNode, maxChildCount, level);
        for (var i in nodePath) {
            var node = nodePath[i]
            var xi = this.getXPath(node, dir, 0, maxChildCount, level);
            if (i == 0)
                path = path + "/" + node.tagName.toLowerCase();
            else
                path = path + "/following-sibling::" + node.tagName.toLowerCase();

            if (xi.length > 0)
                path = path + "[" + xi + "]";
            else
                path = path + "[" + this.getNodePosition(node) + "]";
        }
        return path;
    },
    getXPathForObjectBySibling2: function(target, maxChildCount, level) {

        if (target.nodeType != 1)
            return "";
        var nodePath = this.getPrecedingDifferentNode(target)
        var count = nodePath[0]
        var node = nodePath[1]
        if (node == null || !node.tagName)
            return null;

        var dir = "";
        var path = this.getXPathForObjectByParent(target.parentNode, maxChildCount, level); {
            var xi = this.getXPath(node, dir, 0, maxChildCount, level);
            path = path + "/*"; // + target.tagName.toLowerCase();
            var prepath = node.tagName.toLowerCase();
            if (xi.length > 0)
                prepath += "[" + xi + "]";
            else
                prepath += "[last()]";


            path += "[(position()=count(../" + prepath + "/preceding-sibling::*)+" + count + ") and name()='" + target.tagName.toUpperCase() + "']"

            xi = this.getXPath(target, dir, 0, maxChildCount, level);
            if (xi.length > 0)
                path = path + "[" + xi + "]";


        }
        return path;
    },
    getXPathForObjectByPosition: function(target, maxChildCount, level) {

        if (target == null || target.nodeType != 1)
            return "";
        var pos = this.getNodePosition(target)
        var path = this.getXPathForObjectByParent(target.parentNode, maxChildCount, level);
        path = path + "/" + target.tagName.toLowerCase() + "[" + pos + "]";
        return path;
    },
    getPreviousNodes: function(node) {
        var result = []
        var tagname = node.tagName;
        while (node != null && node.nodeType == 1 || node.nodeType == 3) {
            if (node.nodeType == 1) {
                result.unshift(node)
                if (node.nodeType == 1 && node.hasAttribute("id")) return result
                if (node.nodeType == 1 && tagname != node.tagName) return result
            }
            node = node.previousSibling
            if (node == null)
                break;
        }
        return result
    },
    getPrecedingDifferentNode: function(node) {
        var result = []
        var count = 0;
        var tagname = node.tagName;
        while (node != null && node.nodeType == 1 || node.nodeType == 3) {
            count++;
            if (node.nodeType == 1) {
                if (node.nodeType == 1 && node.hasAttribute("id"))
                    break;
                if (node.nodeType == 1 && tagname != node.tagName)
                    break;
            }
            node = node.previousSibling
            if (node == null)
                break;
        }
        result.push(count);
        result.push(node);
        return result
    },
    getNodePosition: function(node) {
        var pos = 0;
        var tagname = node.tagName;
        while (node != null) {
            if (node.nodeType == 1 && tagname == node.tagName) {
                pos = pos + 1;
            }
            node = node.previousSibling
            if (node == null)
                break;
        }
        return pos;
    },
    getNodeParents: function(node) {
        var result = []

        while (node && (node.nodeType == 1 || node.nodeType == 3)) {
            result.unshift(node)
            if (node.nodeType == 1 && node.hasAttribute("id")) return result
            if (node.nodeType == 1 && node.tagName == 'BODY') return result
            node = node.parentNode
        }
        return result
    },

    evaluate: function(node, expr, enableJS, max) {
        var doc = (node.ownerDocument == null) ? node : node.ownerDocument;
        var found = [];

        if(typeof(expr) == 'string'){
            var aExpr = this.preparePath(doc, expr, enableJS);
            try {
                found = getElementsByXPath(aExpr, node);
            } catch (e) {

            }
        }

        return found;
    },
    preparePath: function(doc, path, enableJS) {
        //host
        //href
        //hostname
        //pathname
        //port
        //protocol
        //search
        //title
        if (typeof(enableJS) == 'undefined')
            enableJS = true;
        var processXPath = function(xpath) {
            return xpath;
        };
        var newPath = processXPath(path);
        if (newPath.indexOf("%") == -1)
            return newPath;

        try {
            var href = "";
            var host = "";
            var port = "";
            if (enableJS) {
                host = doc.location.host;
                href = doc.location.href;
            } else {
                if (doc.documentElement.getAttribute("autopager-real-url")) {
                    href = doc.documentElement.getAttribute("autopager-real-url")
                } else {
                    href = doc.baseURI;
                }
                host = href;

                //remove prototol
                host = host.substring(doc.location.protocol.length + 2);
                port = doc.location.port + "";
                host = host.substring(0, host.indexOf("/"));

                if (port.length > 0)
                    host = host.substring(0, host.length - port.length - 1);
            }
            newPath = newPath.replace(/\%href\%/g, "'" + href + "'");
            newPath = newPath.replace(/\%host\%/g, "'" + host + "'");
            newPath = newPath.replace(/\%hostname\%/g, "'" + host + "'");
            newPath = newPath.replace(/\%pathname\%/g, "'" + doc.location.pathname + "'");
            var pathname = doc.location.pathname;
            var filename = pathname.substr(pathname.lastIndexOf(pathname, "/"))
            newPath = newPath.replace(/\%filename\%/g, "'" + filename + "'");
            if (!doc.location.port)
                port = doc.location.port;
            newPath = newPath.replace(/\%port\%/g, port);
            newPath = newPath.replace(/\%protocol\%/g, "'" + doc.location.protocol + "'");
            newPath = newPath.replace(/\%search\%/g, "'" + doc.location.search + "'");
            newPath = newPath.replace(/\%title\%/g, "'" + doc.title + "'");
            //newPath = newPath.replace(/\%referrer\%/g,"'" + doc.referrer+ "'");
            newPath = newPath.replace(/\%baseuri\%/g, "'" + href.substring(0, href.lastIndexOf("/") + 1) + "'");
        } catch (e) {
            // autopagerMain.alertErr(e);
        }
        return newPath;
    }
};

window.siteinfo_writer.init();

function autopagerDiscoveryResult(doc, xpathes){
    this.linkXPaths = autopagerXPath.discoveryLink(doc, xpathes);
    this.contentXPaths = autopagerXPath.discoveryContent(doc, xpathes);
}
function autopagerXPathItem(){
    this.xpath = "";
    this.authority = 0;
    this.matchCount = 0;
    this.tmpCount = 1;
}


function Inspector(aWindow, aType, aCallback) {
	this.win = aWindow;
	this.doc = this.win.document;
    this.aType = aType;
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
                    this.callback(this.getXPath(this.target))
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
    getXPath: function(originalTarget){
        var doc = originalTarget.ownerDocument;
        var items = [];
        items = autopagerXPath.discoveryMoreLinks(doc, items, [originalTarget]);

        if(this.aType == "nextLink"){
            var pushParentXPath = function(elem){
                if (elem && elem.parentNode && elem.parentNode.tagName.toLowerCase() == "a") {
                    var aItems = autopagerXPath.discoveryMoreLinks(doc, [], [elem.parentNode]);
                    if (!aItems) return;
                    items.push("-");
                    for (var i in aItems)
                        items.push(aItems[i]);
                }
            };

            // pushParentXPath(originalTarget);
            // pushParentXPath(originalTarget.parentNode);
        }

        return items;
    },

    ATTR_CLASSID: 0,
    ATTR_ID: 1,
    ATTR_CLASS: 2,
    ATTR_NOT_CLASSID: 3,
    ATTR_FULL: 4,
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
            var text = elem.textContent;
            if(text.length < 20){
                var m = text.match(this.NEXT_REG)
                if(m){
                    if(text == m[0] || text.indexOf(">") > 0)
                        return elem.nodeName.toLowerCase() + '[text()="' + text + '"]';
                    else
                        return elem.nodeName.toLowerCase() + '[contains(text(), "' + m[0] + '")]';
                }
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


function log(arg){ Application.console.log("[SITEINFO_Writer] " + arg); }
function $(id) document.getElementById(id);
function $A(arr) Array.slice(arr);
function $C(name, attr) {
	var el = document.createElement(name);
	if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
	return el;
}

function wildcardToRegExpStr(urlstr) {
	if (urlstr.source) return urlstr.source;
	let reg = urlstr.replace(/[()\[\]{}|+.,^$?\\]/g, "\\$&").replace(/\*+/g, function(str){
		return str === "*" ? ".*" : "[^/]*";
	});
	return "^" + reg + "$";
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

function readFromClipboard() {
	var url;
	try {
		// Create transferable that will transfer the text.
		var trans = Components.classes["@mozilla.org/widget/transferable;1"]
						.createInstance(Components.interfaces.nsITransferable);
		trans.init(getLoadContext());
		trans.addDataFlavor("text/unicode");
		// If available, use selection clipboard, otherwise global one
		if (Services.clipboard.supportsSelectionClipboard())
			Services.clipboard.getData(trans, Services.clipboard.kSelectionClipboard);
		else
			Services.clipboard.getData(trans, Services.clipboard.kGlobalClipboard);
		var data = {};
		var dataLen = {};
		trans.getTransferData("text/unicode", data, dataLen);
		if (data) {
			data = data.value.QueryInterface(Components.interfaces.nsISupportsString);
			url = data.data.substring(0, dataLen.value / 2);
		}
	} catch (ex) {}
	return url;
}

function copyToClipboard(sData){
    Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper).copyString(sData);
}

function siteInfoToString (obj) {
    var str = '{\n';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += "    " + p + ': ' + obj[p] + ',\n';
        }
    }
    str += '},';
    return str;
}

function addContentStyle(doc, css) {
    var heads = doc.getElementsByTagName('head');
    if (heads.length > 0) {
        var node = doc.createElement('style');
        node.type = 'text/css';
        node.innerHTML = css;
        heads[0].appendChild(node);
    }
}

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
#sw-grid .discovery {\
  list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACAUlEQVQ4jZXSQWgTURAG4D9pNYISakugKJ6860HBS8W1tiqmW2OVYgSpiKAHG1OaxJYgrDl5sBCXoAfFSlo8BESDspciqx4sbjapVtSiFQSRll5CtmlTuvveeLALVneDDszpzXxvYAZYH144hxeAx+XtV0iS5AUAWZZ3iqIYE4S2m8FgMDkyIu9eK3EH7OZodPBCSDy4PH73Ok08ucUejd+gi+d7zHA4nKyHNABAf//AgTO9R0y+NEXEP1q89pbRctEyy5Ns8HKY4vH4OQDI5XINjsCO7a0PFr6/JDKnV82yRtzQiVV04kbBmvuikHhUKKmquslxEkVR/CePd0xTdYq4UWS0WCQ7maETLWqUiPaZmqa1OgLZbHbzscNtBVoqETf09UBFJ6qVKHLptKW6AF4A6GwXxr5+ekbEPqxa5TfEKgUyyxqnlXfmwrcJErs6XiuK4nMFRkfH9p/qbq+tVItENMs4m2GcPjOiWStx5SyFQj1RANB1fcNfa7DXGIkMnOjuOvTj/u1r9EK5wx/eS1GnsPc9gMnmpqb5VCq1BwBUVW10RfL5/LahoWQ4MTzcF4td7ZUkqXlt5Od+v7+STqd3/V7vhPx5LB4AkGXZB+Cpz+erZjKZfY7bsBFVVRvtBOCxf5MkaSOAVy0tWx+7AnXCLt4SCASc7+Efkf9uqov8BEtwDwXhLuv5AAAAAElFTkSuQmCC);\
}\
\
#sw-grid .check {\
  list-style-image: url("chrome://global/skin/icons/find.png");\
  -moz-image-region: rect(0px, 48px, 16px, 32px);\
}\
#sw-grid .inspect-devtools {\
    list-style-image: url("chrome://browser/skin/devtools/inspect-button.png");\
    -moz-image-region: rect(0px, 16px, 16px, 0px);\
}\
#sw-url.error {\
    outline: 1px solid red !important;\
}\
#sw-popup > * {\
  max-width: none !important;\
}\
#sw-launch, .sw-highlight-info{\
	font-weight: 700;\
}\
#sw-grid row { height: 30px; }\
#sw-discovery {\
    list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAACk0lEQVRIie3TW0iTYRzH8eel93nFsXeFvTvCK4XbDA/QvDCVGNguoiIvNrUW1YpEqhsxFriiDCIRL3KJQXRwkkKxorQsKZOglPIQm9HQDrREGeoMDxkVHn5dCUWFe2e7qi/8rj/8H3gI+aeqqalR2Gy23enpaVcopR6dTufJzc095na7k/+WweTnWw8nJoqT2RvW42jJXlRXHkHV6RLs32OFRqOaz8rKrPd6vQnLQnJyst0G/RrcaKhC6M09hIMPMPLuPob6mzE8cBcfAi3YWbAVoij6XS6XMirFbDbvMhrW4rWvCfNTvcCnFz/t8+hTDPU3Ixx8iENFO5BhMrVH46zgOPqq49HVX4AfNzfZg+GBOxh734a0FAPsdrtNksLzfLZl00YsTP8ZWdzsRBcGA7dx4dxxGI36VkkQx3EnzpSXLIks7uNgG3ydjdDr9VOSIEqp5/L58oihL+FOvPXfhE6rnZV6UUV1pTNiaG6yGy+fNUKflCQNksvlhQcc+RFDsxNdaLh4CkajISAJcrvdyRq1cn4s2B4RNDPyBNu3mGGxWFySIEIIycrMrLcXbMPcVM+S0DVPBURRDNXV1Un/tF6vN0EURf/BokJ8HX/+W2BhuhdN189ipYKHIAghp9OZJhkihBCXy6XMMJnaU1P0uFR7EsHAPcyMdmB88DFab9Wi0LoZlNJuSlk/wzBQKoVQWVmZKSqMEELsdrvNaNS3chzni4+P72NZ1sdxXEtcXFweIYTjeV6glPoYhoFKpRopLS1NjRpbKkGQaSmlfoZhlveMkcTz/OpFTK1WjzocjthdplAoEihl+xiGgU6nDRcX71sXM0wQBC3Lsj5CyDeZTJYXM4gQQjQauXKVXG6NKfK/mPQdiHM1ltAZvg0AAAAASUVORK5CYII=);\
}\
');