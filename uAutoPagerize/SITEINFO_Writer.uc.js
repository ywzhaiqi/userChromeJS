// ==UserScript==
// @name           SITEINFO_Writer.uc.js
// @description    uAutoPagerize 中文增强版的站点配置辅助工具
// @namespace      http://d.hatena.ne.jp/Griever/
// @author         Griever, 深度修改 by ywzhaiqi
// @update         2013-8-22
// @include        main
// @include        chrome://browser/content/devtools/framework/toolbox.xul
// @compatibility  Firefox 20 - firefox 23
// @charset        UTF-8
// @version        下書き1
// @note           fix compatibility for firefox 23a1 by lastdream2013
// @note           まだこれからつくり込む段階
// @note           ツールメニューから起動する
// ==/UserScript==

/**
 * 1、大幅修改以适应 uAutoPagerize 中文规则增强版，移植了 AutoPager 的自动识别功能
 * 2、给自带的开发工具右键添加 "复制 xpath 的功能"
 */

location == "chrome://browser/content/browser.xul" && (function(css){

    let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
    if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");

    if (window.siteinfo_writer) {
    	window.siteinfo_writer.destroy();
    	delete window.siteinfo_writer;
    }

    var ns = window.siteinfo_writer = {
        USE_FIREBUG: false,

        get prefs() {
            delete this.prefs;
            return this.prefs = Services.prefs.getBranch("siteinfo_writer.");
        },

    	init: function() {

            try{
                ns["USE_FIREBUG"] = ns.prefs.getBoolPref("USE_FIREBUG");
            }catch(e) {}

          	this.style = addStyle(css);

    	  	var overlay = '\
    	      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
    	               xmlns:html="http://www.w3.org/1999/xhtml"> \
    	        <window id="main-window">\
    				<vbox id="sw-container" class="sw-add-element" hidden="true">\
    				    <hbox id="sw-hbox">\
                          <toolbarbutton id="sw-discovery" tooltiptext="自动识别，来自 AutoPager" oncommand="siteinfo_writer.discoveryAll(true, true);" />\
    				      <toolbarbutton label="查看规则" oncommand="siteinfo_writer.toJSON();"/>\
    				      <toolbarbutton label="查看规则(SP)" oncommand="siteinfo_writer.toSuperPreLoaderFormat();"/>\
    				      <toolbarbutton id="sw-curpage-info" label="读取当前页面规则" oncommand="siteinfo_writer.getCurPageInfo();"/>\
    				      <toolbarbutton label="从剪贴板读取规则" oncommand="siteinfo_writer.readFromClipboard();"/>\
                          <toolbarbutton id="sw-launch" label="启动规则" tooltiptext="启动uAutoPagerize" oncommand="siteinfo_writer.launch();"/>\
                          <checkbox id="sw-useiframe" label="useiframe" checked="false"/>\
                          <checkbox id="sw-inspect-by-firebug" label="用Firebug查看元素" checked="' + this.USE_FIREBUG +'" \
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
            window.addEventListener('unload', this, false);
    	},
        observe: function (aSubject, aTopic, aData) {
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
    	uninit: function ()  {
            try{
                ns.prefs.setBoolPref("USE_FIREBUG", ns["USE_FIREBUG"]);
            }catch(e) {}

    		gBrowser.mPanelContainer.removeEventListener('DOMContentLoaded', this, true);
            window.removeEventListener('unload', this, false);
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
                case "unload":
                    this.uninit(event);
                    break;
    		}
    	},
    	textboxPopupShowing: function(event) {
            event.currentTarget.removeEventListener(event.type, arguments.callee, false);
            var popup = event.originalTarget;
            var type = event.currentTarget.id.replace("sw-", "");

            popup.appendChild($C("menuseparator", {}));

            popup.appendChild($C("menuitem", {
                label: '查看元素',
                accesskey: 'Q',
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
                // this.discoveryAll(true, false);
                info = {
                    nextLink: "auto;"
                }
                this.setAllValue(info)
                this.setUrl();
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
    		if(ids.indexOf('a') == 0){  // json 格式
    			url = "http://wedata.net/items/" + ids.slice(1) + ".json"
    		}else{
    			url = "http://www.teesoft.info/autopager/down/" + ids;
    		}

    		log("Request: " + url);
    		var xhr = new XMLHttpRequest();
    		xhr.onload = function(){
    			ns.parseInfoFromAP(xhr);
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
                alert("有错误发生，请分别检查 url、nextLink、pageElement 是否正确");
    		}
    	},
        inspect: function(aType){
            var self = this;
            Aardvark.start(function(elem){
                let items = self.findXPathes(elem);
                self.createXPathPopupMenu(items, aType);
            });
        },
    	inspect_old: function(aType) {
            if (this._inspect){
                try{  // 防止页面刷新后出现的 dead object 错误
                    this._inspect.uninit();
                }catch(e) {}
            }
            var self = this;
            this._inspect = new Inspector(content, aType, function(items) {
                if (items.length) {
                    self.createXPathPopupMenu(items, aType);
                }
                self._inspect = null;
            });
    	},
        devtools: null,
        inspectMix: function(aType) {
            let xpath = this[aType].value;
            let doc = content.document;

            var elem;
            try{
                if(xpath.startsWith("css;"))
                    elem = doc.querySelector(xpath.slice(4))
                else
                    elem = getFirstElementByXPath(xpath, doc);
            }catch(e){
                return;
            }

            if(!elem) return;

            // 载入 devtools
            if(!this.devtools)
                this.devtools = this.loadDevtools();

            // 已经存在则直接启动
            if(window.Firebug && Firebug.isInitialized && Firebug.currentContext){
                this.inspectWithFirebug(elem);
                return;
            }else{
                // 检测自带开发工具是否已经启动
                let target = this.devtools.TargetFactory.forTab(gBrowser.selectedTab);
                let toolbox = gDevTools.getToolbox(target);
                if(toolbox){
                    this.inspectWithDevtools(elem);
                    return;
                }
            }

            // 不存在
            if(window.Firebug && this.USE_FIREBUG){
                this.inspectWithFirebug(elem);
            }else{
                this.inspectWithDevtools(elem);
            }
        },
        inspectWithFirebug: function(elem){
            Firebug.browserOverlay.startFirebug(function(Firebug){
                Firebug.Inspector.inspectFromContextMenu(elem);
            });
        },
        loadDevtools: function(){
            /*
             * 有这么变的吗，四个版本，变了三次地址！！！
             */
            var devtools = {};
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
            }
            return devtools;
        },
        inspectWithDevtools: function(elem){
            let tt = this.devtools.TargetFactory.forTab(gBrowser.selectedTab);
            return gDevTools.showToolbox(tt, "inspector").then((function (elem) {
                return function(toolbox) {
                    let inspector = toolbox.getCurrentPanel();
                    inspector.selection.setNode(elem, "Siteinfo-writer-Inspector");
                }
            })(elem));
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
                }, 2000, this)
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
                if(item == "-" ){
                    if(i == 0 || i == (items.length - 1))
                        break;
                    this.popup.appendChild(document.createElement("menuseparator"));
                    continue;
                }

                let menuitem = document.createElement("menuitem");
                menuitem.setAttribute("label", item.xpath || item);
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
        findXPathes: function(elem){
            var doc = elem.ownerDocument;
            var items = [];
            items = autopagerXPath.discoveryMoreLinks(doc, items, [elem]);

            return items;
        },
    };

    /**
     * autopagerXPath，来自 Autopager 扩展
     */
    var autopagerXPath = {
        smarttext: "next|>|下一页|下一頁|翻页|翻下页|下一章|下一张|下一幅|下一节|下一篇|后一页|前进|下篇|后页|往后|次を表示",
        discoverytext: "navbar|right_arrow|pagN|page|pages|paging|下页|次页|Volgende|Volg|Verder|Напред|Следва|Næste|Nächste|Naechste|Weiter|Vorwärts|Vorwaerts|Volgende|Continue|Onward|Venonta|Seuraava|Suivant|Prochaine|Επόμενη|Næst|Successive|Successiva|Successivo|Prossima|Prossime|Prossimo|Altra|Altro|次へ|다음|Neste|Dalej|Następna|Następne|Następny|Więcej|Próximo|Înainte|Înaintare|Următor|Următoare|След|Следующая|Siguiente|Próxima|Próximos|Nästa|Sonraki|Devam|İlerle",
        MAXTextLength: 20,
        MAXLevel: 6,

        _existingSites: null,
        get existingSites() {
            if(this._existingSites == null){
                let info_cn = window.uAutoPagerize.SITEINFO_CN || [];
                this._existingSites = window.uAutoPagerize.MY_SITEINFO.concat(info_cn) || [];
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

    /**
     *  Aardvark，改自 elemhidehelper 扩展
     */
    var Aardvark = {
        showhelp: true,

        window: null,
        browser: null,
        anchorElem: null,
        selectedElem: null,
        isUserSelected: false,
        lockedAnchor: null,
        commentElem: null,
        mouseX: -1,
        mouseY: -1,
        prevSelectionUpdate: -1,
        commandLabelTimer: null,
        viewSourceTimer: null,
        boxElem: null,
        paintNode: null,
        prevPos: null,

        start: function(callback) {
            let wrapper = {
                window: window,
                get browser() window.gBrowser,
            };

            if (!this.canSelect(wrapper.browser))
                return;

            if (this.browser)
                this.quit();

            this.window = wrapper.window;
            this.browser = wrapper.browser;
            this.callback = callback;

            this.browser.addEventListener("click", this.onMouseClick, true);
            this.browser.addEventListener("DOMMouseScroll", this.onMouseScroll, true);
            this.browser.addEventListener("keypress", this.onKeyPress, true);
            this.browser.addEventListener("mousemove", this.onMouseMove, true);
            this.browser.addEventListener("select", this.quit, false);
            this.browser.contentWindow.addEventListener("pagehide", this.onPageHide, true);

            this.browser.contentWindow.focus();

            let doc = this.browser.contentDocument;
            this.boxElem = doc.importNode(E("ehh-elementmarker").firstElementChild.cloneNode(true), true);

            this.initHelpBox();

            if (this.showhelp)
                this.showMenu();

            // Make sure to select some element immeditely (whichever is in the center of the browser window)
            let[wndWidth, wndHeight] = this.getWindowSize(doc.defaultView);
            this.isUserSelected = false;
            this.onMouseMove({
                clientX: wndWidth / 2,
                clientY: wndHeight / 2,
                screenX: -1,
                screenY: -1,
                target: null
            });
        },

        canSelect: function(browser) {
            if (!browser || !browser.contentWindow || !(browser.contentDocument instanceof Ci.nsIDOMHTMLDocument)) {
                return false;
            }

            let location = browser.contentWindow.location;
            if (location.href == "about:blank")
                return false;

            if (location.hostname == "" &&
                location.protocol != "mailbox:" &&
                location.protocol != "imap:" &&
                location.protocol != "news:" &&
                location.protocol != "snews:") {
                return false;
            }

            return true;
        },

        doCommand: function(command, event) {
            if (this[command](this.selectedElem)) {
                this.showCommandLabel(this.commands[command + "_key"], this.commands[command + "_altkey"], this.commands[command + "_label"]);
                if (event)
                    event.stopPropagation();
            }
            if (event)
                event.preventDefault();
        },

        showCommandLabel: function(key, alternativeKey, label) {
            if (this.commandLabelTimer)
                this.commandLabelTimer.cancel();

            E("ehh-commandlabel-key").textContent = key.toUpperCase();
            E("ehh-commandlabel-alternativeKey").textContent = alternativeKey.toUpperCase();
            E("ehh-commandlabel-label").setAttribute("value", label);

            var commandLabel = E("ehh-commandlabel");
            commandLabel.showPopup(this.window.document.documentElement, this.mouseX, this.mouseY, "tooltip", "topleft", "topleft");

            this.commandLabelTimer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
            this.commandLabelTimer.initWithCallback(function() {
                commandLabel.hidePopup();
                Aardvark.commandLabelTimer = null;
            }, 400, Ci.nsITimer.TYPE_ONE_SHOT);
        },

        commandsData: {
            select: {
                "key": "s",
                "label": "确定选择",
                "alternativeKey": ""
            },
            wider: {
                "key": "w",
                "label": "扩大选择范围",
                "alternativeKey": ""
            },
            narrower: {
                "key": "n",
                "label": "缩小选择范围",
                "alternativeKey": ""
            },
            lock: {
                "key": "l",
                "label": "锁定/解锁 选区",
                "alternativeKey": ""
            },
            quit: {
                "key": "q",
                "label": "取消选择",
                "alternativeKey": ""
            },
            blinkElement: {
                "key": "b",
                "label": "闪烁所选",
                "alternativeKey": ""
            },
            viewSource: {
                "key": "v",
                "label": "查看源代码",
                "alternativeKey": ""
            },
            viewSourceWindow: {
                "key": "u",
                "label": "查看源代码(在独立的窗口)",
                "alternativeKey": ""
            },
            showMenu: {
                "key": "h",
                "label": "显示/隐藏 帮助",
                "alternativeKey": ""
            },
        },
        commandsInited: false,
        initHelpBox: function() {
            if(this.commandsInited)
                return;

            var helpBoxRows = E("ehh-helpbox-rows");
            var helpBoxInited = helpBoxRows.firstElementChild ? true : false;

            for (var i = 0; i < this.commands.length; i++) {
                var command = this.commands[i];
                var key = this.commandsData[command].key;
                var alternativeKey = this.commandsData[command].alternativeKey;
                var label = this.commandsData[command].label;
                this.commands[command + "_key"] = key.toLowerCase();
                this.commands[command + "_altkey"] = alternativeKey.toLowerCase();
                this.commands[command + "_label"] = label;

                if(helpBoxInited)
                    continue;

                var row = this.window.document.createElement("row");
                helpBoxRows.appendChild(row);

                var element = this.window.document.createElement("description");
                element.textContent = key.toUpperCase();
                element.className = "key";
                row.appendChild(element);

                var element = this.window.document.createElement("description");
                element.textContent = alternativeKey.toUpperCase();
                element.className = "key";
                row.appendChild(element);

                element = this.window.document.createElement("description");
                element.setAttribute("value", label);
                element.className = "label";
                row.appendChild(element);
            }

            this.commandsInited = true;
        },

        hideTooltips: function() {
            let tooltips = ["ehh-helpbox", "ehh-commandlabel", "ehh-viewsource"];
            for (let i = 0; i < tooltips.length; i++) {
                let tooltip = E(tooltips[i]);
                if (tooltip)
                    tooltip.hidePopup();
            }
        },

        onMouseClick: function(event) {
            if (event.button != 0 || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey)
                return;

            this.doCommand("select", event);
        },

        onMouseScroll: function(event) {
            if (!event.shiftKey || event.altKey || event.ctrlKey || event.metaKey)
                return;

            if ("axis" in event && event.axis != event.VERTICAL_AXIS)
                return;

            for (let i = 0; i < Math.abs(event.detail); i++)
                this.doCommand(event.detail > 0 ? "wider" : "narrower", event);
        },

        onKeyPress: function(event) {
            if (event.altKey || event.ctrlKey || event.metaKey)
                return;

            var command = null;
            if (event.keyCode == event.DOM_VK_ESCAPE)
                command = "quit";
            else if (event.keyCode == event.DOM_VK_RETURN)
                command = "select";
            else if (event.charCode) {
                var key = String.fromCharCode(event.charCode).toLowerCase();

                content.console.log(key, this.commands);

                var commands = this.commands;
                for (var i = 0; i < commands.length; i++)
                    if (commands[commands[i] + "_key"] == key || commands[commands[i] + "_altkey"] == key)
                        command = commands[i];
            }

            if (command)
                this.doCommand(command, event);
        },

        onPageHide: function(event) {
            this.doCommand("quit", null);
        },

        onMouseMove: function(event) {
            this.mouseX = event.screenX;
            this.mouseY = event.screenY;

            this.hideSelection();

            let x = event.clientX;
            let y = event.clientY;

            // We might have coordinates relative to a frame, recalculate relative to top window
            let node = event.target;
            while (node && node.ownerDocument && node.ownerDocument.defaultView && node.ownerDocument.defaultView.frameElement) {
                node = node.ownerDocument.defaultView.frameElement;
                let rect = node.getBoundingClientRect();
                x += rect.left;
                y += rect.top;
            }

            let elem = this.browser.contentDocument.elementFromPoint(x, y);
            while (elem && "contentDocument" in elem && this.canSelect(elem)) {
                let rect = elem.getBoundingClientRect();
                x -= rect.left;
                y -= rect.top;
                elem = elem.contentDocument.elementFromPoint(x, y);
            }

            if (elem) {
                if (!this.lockedAnchor)
                    this.setAnchorElement(elem);
                else {
                    this.lockedAnchor = elem;
                    this.selectElement(this.selectedElem);
                }
            }
        },

        onAfterPaint: function() {
            // Don't update position too often
            if (this.selectedElem && Date.now() - this.prevSelectionUpdate > 20) {
                let pos = this.getElementPosition(this.selectedElem);
                if (!this.prevPos || this.prevPos.left != pos.left || this.prevPos.right != pos.right || this.prevPos.top != pos.top || this.prevPos.bottom != pos.bottom) {
                    this.selectElement(this.selectedElem);
                }
            }
        },

        setAnchorElement: function(anchor) {
            this.anchorElem = anchor;

            let newSelection = anchor;
            if (this.isUserSelected) {
                // User chose an element via wider/narrower commands, keep the selection if
                // out new anchor is still a child of that element
                let e = newSelection;
                while (e && e != this.selectedElem)
                    e = this.getParentElement(e);

                if (e)
                    newSelection = this.selectedElem;
                else
                    this.isUserSelected = false;
            }

            this.selectElement(newSelection);
        },

        appendDescription: function(node, value, className) {
            var descr = this.window.document.createElement("description");
            descr.setAttribute("value", value);
            if (className)
                descr.setAttribute("class", className);
            node.appendChild(descr);
        },

        /**************************
         * Element marker display *
         **************************/

        getElementLabel: function(elem) {
            let tagName = elem.tagName.toLowerCase();
            let addition = "";
            if (elem.id != "")
                addition += ", id: " + elem.id;
            if (elem.className != "")
                addition += ", class: " + elem.className;
            if (elem.style.cssText != "")
                addition += ", style: " + elem.style.cssText;

            return [tagName, addition];
        },

        selectElement: function(elem) {
            this.selectedElem = elem;
            this.prevSelectionUpdate = Date.now();

            let border = this.boxElem.getElementsByClassName("border")[0];
            let label = this.boxElem.getElementsByClassName("label")[0];
            let labelTag = this.boxElem.getElementsByClassName("labelTag")[0];
            let labelAddition = this.boxElem.getElementsByClassName("labelAddition")[0];

            if (this.boxElem.parentNode)
                this.boxElem.parentNode.removeChild(this.boxElem);

            let doc = this.browser.contentDocument;
            let[wndWidth, wndHeight] = this.getWindowSize(doc.defaultView);

            let pos = this.getElementPosition(elem);
            this.boxElem.style.left = Math.min(pos.left - 1, wndWidth - 2) + "px";
            this.boxElem.style.top = Math.min(pos.top - 1, wndHeight - 2) + "px";
            border.style.width = Math.max(pos.right - pos.left - 2, 0) + "px";
            border.style.height = Math.max(pos.bottom - pos.top - 2, 0) + "px";

            [labelTag.textContent, labelAddition.textContent] = this.getElementLabel(elem);

            // If there is not enough space to show the label move it up a little
            if (pos.bottom < wndHeight - 25)
                label.className = "label";
            else
                label.className = "label onTop";

            doc.documentElement.appendChild(this.boxElem);

            this.paintNode = doc.defaultView;
            if (this.paintNode) {
                this.prevPos = pos;
                this.paintNode.addEventListener("MozAfterPaint", this.onAfterPaint, false);
            }
        },

        hideSelection: function() {
            if (this.boxElem.parentNode)
                this.boxElem.parentNode.removeChild(this.boxElem);

            if (this.paintNode)
                this.paintNode.removeEventListener("MozAfterPaint", this.onAfterPaint, false);
            this.paintNode = null;
            this.prevPos = null;
        },

        getWindowSize: function(wnd) {
            return [wnd.innerWidth, wnd.innerHeight];
        },

        getElementPosition: function(element) {
            // Restrict rectangle coordinates by the boundaries of a window's client area
            function intersectRect(rect, wnd) {
                let[wndWidth, wndHeight] = this.getWindowSize(wnd);
                rect.left = Math.max(rect.left, 0);
                rect.top = Math.max(rect.top, 0);
                rect.right = Math.min(rect.right, wndWidth);
                rect.bottom = Math.min(rect.bottom, wndHeight);
            }

            let rect = element.getBoundingClientRect();
            let wnd = element.ownerDocument.defaultView;

            rect = {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom
            };
            while (true) {
                intersectRect.call(this, rect, wnd);

                if (!wnd.frameElement)
                    break;

                // Recalculate coordinates to be relative to frame's parent window
                let frameElement = wnd.frameElement;
                wnd = frameElement.ownerDocument.defaultView;

                let frameRect = frameElement.getBoundingClientRect();
                let frameStyle = wnd.getComputedStyle(frameElement, null);
                let relLeft = frameRect.left + parseFloat(frameStyle.borderLeftWidth) + parseFloat(frameStyle.paddingLeft);
                let relTop = frameRect.top + parseFloat(frameStyle.borderTopWidth) + parseFloat(frameStyle.paddingTop);

                rect.left += relLeft;
                rect.right += relLeft;
                rect.top += relTop;
                rect.bottom += relTop;
            }

            return rect;
        },

        getParentElement: function(elem) {
            let result = elem.parentNode;
            if (result && result.nodeType == Ci.nsIDOMElement.DOCUMENT_NODE && result.defaultView && result.defaultView.frameElement)
                result = result.defaultView.frameElement;

            if (result && result.nodeType != Ci.nsIDOMElement.ELEMENT_NODE)
                return null;

            return result;
        },

        /***************************
         * Commands implementation *
         ***************************/

        commands: [
            "select",
            "wider",
            "narrower",
            "lock",
            "quit",
            "blinkElement",
            "viewSource",
            "viewSourceWindow",
            "showMenu"
        ],


        wider: function(elem) {
            if (!elem)
                return false;

            let newElem = this.getParentElement(elem);
            if (!newElem)
                return false;

            this.isUserSelected = true;
            this.selectElement(newElem);
            return true;
        },

        narrower: function(elem) {
            if (elem) {
                // Search selected element in the parent chain, starting with the anchor element.
                // We need to select the element just before the selected one.
                let e = this.anchorElem;
                let newElem = null;
                while (e && e != elem) {
                    newElem = e;
                    e = this.getParentElement(e);
                }

                if (!e || !newElem)
                    return false;

                this.isUserSelected = true;
                this.selectElement(newElem);
                return true;
            }
            return false;
        },

        lock: function(elem) {
            if (!elem)
                return false;

            if (this.lockedAnchor) {
                this.setAnchorElement(this.lockedAnchor);
                this.lockedAnchor = null;
            } else
                this.lockedAnchor = this.anchorElem;

            return true;
        },

        quit: function() {
            if (!this.browser)
                return false;

            if ("blinkTimer" in this)
                this.stopBlinking();

            if (this.commandLabelTimer)
                this.commandLabelTimer.cancel();
            if (this.viewSourceTimer)
                this.viewSourceTimer.cancel();
            this.commandLabelTimer = null;
            this.viewSourceTimer = null;

            this.hideSelection();
            this.hideTooltips();

            this.browser.removeEventListener("click", this.onMouseClick, true);
            this.browser.removeEventListener("DOMMouseScroll", this.onMouseScroll, true);
            this.browser.removeEventListener("keypress", this.onKeyPress, true);
            this.browser.removeEventListener("mousemove", this.onMouseMove, true);
            this.browser.removeEventListener("select", this.quit, false);
            this.browser.contentWindow.removeEventListener("pagehide", this.onPageHide, true);

            this.anchorElem = null;
            this.selectedElem = null;
            this.window = null;
            this.browser = null;
            this.commentElem = null;
            this.lockedAnchor = null;
            this.boxElem = null;
            return false;
        },

        select: function(elem) {
            if (!elem)
                return false;

            this.callback(elem);

            this.quit();
            return false;
        },

        blinkElement: function(elem) {
            if (!elem)
                return false;

            if ("blinkTimer" in this)
                this.stopBlinking();

            let counter = 0;
            this.blinkElem = elem;
            this.blinkOrigValue = elem.style.visibility;
            this.blinkTimer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
            this.blinkTimer.initWithCallback(function() {
                counter++;
                elem.style.visibility = (counter % 2 == 0 ? "visible" : "hidden");
                if (counter == 6)
                    Aardvark.stopBlinking();
            }, 250, Ci.nsITimer.TYPE_REPEATING_SLACK);

            return true;
        },

        stopBlinking: function() {
            this.blinkTimer.cancel();
            this.blinkElem.style.visibility = this.blinkOrigValue;

            delete this.blinkElem;
            delete this.blinkOrigValue;
            delete this.blinkTimer;
        },

        viewSource: function(elem) {
            if (!elem)
                return false;

            var sourceBox = E("ehh-viewsource");
            if (sourceBox.state == "open" && this.commentElem == elem) {
                sourceBox.hidePopup();
                return true;
            }
            sourceBox.hidePopup();

            while (sourceBox.firstElementChild)
                sourceBox.removeChild(sourceBox.firstElementChild);
            this.getOuterHtmlFormatted(elem, sourceBox);
            this.commentElem = elem;

            let anchor = this.window.document.documentElement;
            let x = this.mouseX;
            let y = this.mouseY;
            this.viewSourceTimer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
            this.viewSourceTimer.initWithCallback(function() {
                sourceBox.showPopup(anchor, x, y, "tooltip", "topleft", "topleft");
                Aardvark.viewSourceTimer = null;
            }, 500, Ci.nsITimer.TYPE_ONE_SHOT);
            return true;
        },

        viewSourceWindow: function(elem) {
            if (!elem)
                return false;

            var range = elem.ownerDocument.createRange();
            range.selectNodeContents(elem);
            var selection = {
                rangeCount: 1,
                getRangeAt: function() {
                    return range
                }
            };

            this.window.openDialog("chrome://global/content/viewPartialSource.xul", "_blank", "scrollbars,resizable,chrome,dialog=no",
                null, null, selection, "selection");
            return true;
        },

        getOuterHtmlFormatted: function(node, container) {
            var type = null;
            switch (node.nodeType) {
                case node.ELEMENT_NODE:
                    var box = this.window.document.createElement("vbox");
                    box.className = "elementBox";

                    var startTag = this.window.document.createElement("hbox");
                    startTag.className = "elementStartTag";
                    if (!node.firstElementChild)
                        startTag.className += " elementEndTag";

                    this.appendDescription(startTag, "<", null);
                    this.appendDescription(startTag, node.tagName, "tagName");

                    for (var i = 0; i < node.attributes.length; i++) {
                        var attr = node.attributes[i];
                        this.appendDescription(startTag, attr.name, "attrName");
                        if (attr.value != "") {
                            this.appendDescription(startTag, "=", null);
                            this.appendDescription(startTag, '"' + attr.value.replace(/"/, "&quot;") + '"', "attrValue");
                        }
                    }

                    this.appendDescription(startTag, node.firstElementChild ? ">" : " />", null);
                    box.appendChild(startTag);

                    if (node.firstElementChild) {
                        for (var child = node.firstElementChild; child; child = child.nextElementSibling)
                            this.getOuterHtmlFormatted(child, box);

                        var endTag = this.window.document.createElement("hbox");
                        endTag.className = "elementEndTag";
                        this.appendDescription(endTag, "<", null);
                        this.appendDescription(endTag, "/" + node.tagName, "tagName");
                        this.appendDescription(endTag, ">", null);
                        box.appendChild(endTag);
                    }
                    container.appendChild(box);
                    return;

                case node.TEXT_NODE:
                    type = "text";
                    break;
                case node.CDATA_SECTION_NODE:
                    type = "cdata";
                    break;
                case node.COMMENT_NODE:
                    type = "comment";
                    break;
                default:
                    return;
            }

            var text = node.nodeValue.replace(/\r/g, '').replace(/^\s+/, '').replace(/\s+$/, '');
            if (text == "")
                return;

            if (type != "cdata") {
                text = text.replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");
            }
            text = text.replace(/\t/g, "  ");
            if (type == "cdata")
                text = "<![CDATA[" + text + "]]>";
            else if (type == "comment")
                text = "<!--" + text + "-->";

            var lines = text.split("\n");
            for (var i = 0; i < lines.length; i++)
                this.appendDescription(container, lines[i].replace(/^\s+/, '').replace(/\s+$/, ''), type);
        },

        showMenu: function() {
            var helpBox = E("ehh-helpbox");
            if (helpBox.state == "open") {
                helpBox.hidePopup();
                return true;
            }

            // Show help box
            helpBox.showPopup(this.browser, -1, -1, "tooltip", "topleft", "topleft");
            return true;
        }
    };
    // 添加 xul 和 样式
    var AardvarkInit = {
        init: function(){
            // Makes sure event handlers like Aardvark.onKeyPress always have the correct
            // this pointer set.
            for each (let method in ["onMouseClick", "onMouseScroll", "onKeyPress", "onPageHide", "onMouseMove", "onAfterPaint", "quit"])
                Aardvark[method] = Aardvark[method].bind(Aardvark);

            if(!E("ehh-popupset")){
                this.addPopupSet();
                this.addChromeCss();

            }
        },
        addPopupSet: function(){
            var xul = '\
                <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
                         xmlns:html="http://www.w3.org/1999/xhtml"> \
                <window id="main-window">\
                <popupset id="ehh-popupset"\
                        xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"\
                        xmlns:html="http://www.w3.org/1999/xhtml">\
                    <tooltip id="ehh-helpbox" noautohide="true" orient="vertical">\
                        <description id="ehh-helpbox-title" value="页面元素选择 - 快捷键"/>\
                    \
                        <grid flex="1">\
                            <columns>\
                                <column/>\
                                <column flex="1"/>\
                            </columns>\
                            <rows id="ehh-helpbox-rows"/>\
                        </grid>\
                    </tooltip>\
                    <tooltip id="ehh-commandlabel" noautohide="true">\
                        <hbox align="center">\
                            <description id="ehh-commandlabel-key"/>\
                            <description id="ehh-commandlabel-alternativeKey"/>\
                            <description id="ehh-commandlabel-label"/>\
                        </hbox>\
                    </tooltip>\
                    <tooltip id="ehh-viewsource" noautohide="true" orient="vertical"/>\
                    <tooltip id="ehh-elementmarker">\
                        <html:div>\
                            <html:div class="border"/>\
                            <html:div class="label"><html:span class="labelTag"/><html:span class="labelAddition"/></html:div>\
                        </html:div>\
                    </tooltip>\
                </popupset>\
                </window>\
                </overlay>\
            ';

            xul = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(xul);
            window.userChrome_js.loadOverlay(xul, this);
        },
        observe: function (aSubject, aTopic, aData) {
            if (aTopic == "xul-overlay-merged") {
                this.addContentCss();
            }
        },
        addChromeCss: function(){
            var css = '\
                #ehh-helpbox, #ehh-commandlabel, #ehh-viewsource {\
                        margin: 10px;\
                        padding: 5px;\
                    }\
                    #ehh-helpbox row {\
                        -moz-box-align: center;\
                    }\
                    #ehh-helpbox .key:not(:empty) {\
                        font-weight: bold;\
                        margin: 2px 10px 2px 0px;\
                        border: 1px solid black;\
                        text-align: start;\
                        width: 30px;\
                        height: 30px;\
                        padding: 2px;\
                        background-color: white;\
                        color: black;\
                        border-radius: 3px;\
                    }\
                    #ehh-helpbox-title {\
                        font-size: 130%;\
                        margin-bottom: 10px;\
                    }\
                    #ehh-commandlabel {\
                        font-size: 150%;\
                    }\
                    #ehh-commandlabel-key:not(:empty), #ehh-commandlabel-alternativeKey:not(:empty) {\
                        font-weight: bold;\
                        margin: 0px 10px 0px 0px;\
                        border: 1px solid black;\
                        text-align: start;\
                        width: 45px;\
                        height: 45px;\
                        padding: 2px;\
                        background-color: white;\
                        color: black;\
                        border-radius: 4px;\
                    }\
                    #ehh-viewsource {\
                        max-width: none;\
                    }\
                    #ehh-viewsource description, #ehh-viewsource hbox, #ehh-viewsource vbox {\
                        margin: 0px;\
                    }\
                    #ehh-viewsource .elementBox {\
                        border: 1px solid #CCCCCC;\
                        margin: 5px;\
                    }\
                    #ehh-viewsource .text, #ehh-viewsource .cdata, #ehh-viewsource .comment {\
                        margin: 0px 5px;\
                    }\
                    #ehh-viewsource .tagName {\
                        font-weight: bold;\
                        color: #FF0000;\
                    }\
                    #ehh-viewsource .attrName {\
                        margin-left: 5px;\
                        color: #00FF00;\
                    }\
                    #ehh-viewsource .attrValue {\
                        color: #0000FF;\
                    }\
                    #ehh-viewsource .comment {\
                        color: #808080;\
                    }\
                ';

            addStyle(css);
        },
        addContentCss: function(){
            var cssStr = '\
                @namespace url("http://www.w3.org/1999/xhtml");\
                 .%%CLASS%%, .%%CLASS%% > .label, .%%CLASS%% > .label > .labelTag, .%%CLASS%% > .label > .labelAddition, .%%CLASS%% > .border {\
                    display: block !important;\
                    position: static !important;\
                    float: none !important;\
                    clear: none !important;\
                    right: auto !important;\
                    bottom: auto !important;\
                    z-index: 2147483647 !important;\
                    background: transparent !important;\
                    border: none !important;\
                    clip: auto !important;\
                    cursor: auto !important;\
                    margin: 0px !important;\
                    max-width: none !important;\
                    max-height: none !important;\
                    min-width: 0px !important;\
                    min-height: 0px !important;\
                    opacity: 1 !important;\
                    outline: none !important;\
                    padding: 0px !important;\
                    visibility: visible !important;\
                    -moz-binding: none !important;\
                    border-radius: 0px !important;\
                    -moz-user-focus: none !important;\
                    -moz-user-input: none !important;\
                    -moz-user-select: none !important;\
                }\
                .%%CLASS%% {\
                    position: fixed !important;\
                    width: auto !important;\
                    height: auto !important;\
                }\
                .%%CLASS%% > .border {\
                    border: 2px solid #ff0000 !important;\
                    top: auto !important;\
                    left: auto !important;\
                }\
                .%%CLASS%% > .label {\
                    float: left !important;\
                    background-color: #fff0cc !important;\
                    border-color: #000000 !important;\
                    border-width: 0px 2px 1px 2px !important;\
                    border-style: solid !important;\
                    border-bottom-left-radius: 6px !important;\
                    border-bottom-right-radius: 6px !important;\
                    padding: 2px 5px !important;\
                    top: auto !important;\
                    left: auto !important;\
                    width: auto !important;\
                    height: auto !important;\
                }\
                .%%CLASS%% > .label.onTop {\
                    position: relative !important;\
                    left: 5px !important;\
                    top: -25px !important;\
                    border-top-width: 1px !important;\
                    border-radius: 6px !important;\
                }\
                .%%CLASS%% > .label > .labelTag, .%%CLASS%% > .label > .labelAddition {\
                    display: inline !important;\
                    font-family: Arial !important;\
                    font-size: 12px !important;\
                    color: #000000 !important;\
                    top: auto !important;\
                    left: auto !important;\
                    width: auto !important;\
                    height: auto !important;\
                    direction: ltr !important;\
                    font-size-adjust: none !important;\
                    font-stretch: normal !important;\
                    font-style: normal !important;\
                    font-variant: normal !important;\
                    font-weight: normal !important;\
                    letter-spacing: normal !important;\
                    line-height: normal !important;\
                    text-align: start !important;\
                    text-decoration: none !important;\
                    text-indent: 0px !important;\
                    text-shadow: none !important;\
                    text-transform: none !important;\
                    text-transform: none !important;\
                    white-space: normal !important;\
                    word-spacing: 0px !important;\
                }\
                .%%CLASS%% > .label > .labelTag {\
                    font-weight: bold !important;\
                }\
            ';

            // Use random marker class
            let elementMarkerClass = null;
            {
                let rnd = [];
                let offset = "a".charCodeAt(0);
                for (let i = 0; i < 20; i++)
                    rnd.push(offset + Math.random() * 26);

                elementMarkerClass = String.fromCharCode.apply(String, rnd);
            }

            let data = cssStr.replace(/%%CLASS%%/g, elementMarkerClass);
            let styleService = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
            let styleURI = Services.io.newURI("data:text/css," + encodeURIComponent(data), null, null);
            styleService.loadAndRegisterSheet(styleURI, Ci.nsIStyleSheetService.USER_SHEET);

            E("ehh-elementmarker").firstElementChild.setAttribute("class", elementMarkerClass);
        }
    };

    window.siteinfo_writer.init();
    AardvarkInit.init();

    /**
     * Inspector
     */
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
        ATTR_CLASSID: 0,
        ATTR_ID: 1,
        ATTR_CLASS: 2,
        ATTR_NOT_CLASSID: 3,
        ATTR_FULL: 4,
        TEXT: 5,
        NEXT_REG: /[下后][一]?[页张个篇章节步]/,
        PAGE_KEY: /page|nav|pg/,
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
            obj.ancestor_classid = obj.self_classid;
            obj.ancestor_id      = obj.self_id;
            obj.ancestor_class   = obj.self_class;
            obj.ancestor_attr    = obj.self_attr;
            obj.ancestor_full    = obj.self_full;

            if(this.aType == "nextLink"){
                obj.self_text        = this.getElementXPath(current, this.TEXT);
                obj.ancestor_text    = obj.self_text;
            }

            var hasId = current.getAttribute("id");
            var hasPageKey = false;
            for (let [i, elem] in Iterator(nodes)) {
                obj.localnames = elem.localName + "/" + obj.localnames;

                if(this.aType == "nextLink" && !(hasId || hasPageKey)){
                    hasPageKey = this.PAGE_KEY.test(elem.getAttribute("class"));
                    obj.ancestor_text = this.getElementXPath(elem, this.ATTR_CLASSID) + "/" + obj.ancestor_text;
                }

                if (!hasId) {
                    hasId = elem.getAttribute("id");
                    obj.ancestor_classid = this.getElementXPath(elem, this.ATTR_CLASSID) + "/" + obj.ancestor_classid;
                    obj.ancestor_id = this.getElementXPath(elem, this.ATTR_ID) + "/" + obj.ancestor_id;
                    obj.ancestor_full = this.getElementXPath(elem, this.ATTR_FULL) + "/" + obj.ancestor_full;
                }

                obj.ancestor_class = this.getElementXPath(elem, this.ATTR_NOT_CLASS) + "/" + obj.ancestor_class;
                obj.ancestor_attr = this.getElementXPath(elem, this.ATTR_NOT_CLASSID) + "/" + obj.ancestor_attr;
            }

            if(this.aType == "nextLink"){
                let xpaths = obj.ancestor_text.split("/");
                if(xpaths.length >= 3){
                    var lastXPath = xpaths.pop()
                    xpaths.pop()  //去掉倒数第2个
                    obj.text_descendant = xpaths.join("/") + "/descendant::" + lastXPath;
                }
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

            if(hasPageKey){
                // 移动到第一个
                let old_index = res.indexOf(obj.ancestor_text);
                res.splice(0, 0, res.splice(old_index, 1)[0]);
            }

            return res;
        },
        getElementXPath: function(elem, constant) {
            if (!elem.getAttribute)
                return "";

            if (this.ATTR_CLASSID == constant) {
                let elemId = elem.getAttribute("id")
                if (elemId)
                    return 'id("'+ elemId +'")';

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

        getXPath_AP: function(originalTarget){
            var doc = originalTarget.ownerDocument;
            var items = [];
            items = autopagerXPath.discoveryMoreLinks(doc, items, [originalTarget]);

            // if(this.aType == "nextLink"){
                // var pushParentXPath = function(elem){
                //     if (elem && elem.parentNode && elem.parentNode.tagName.toLowerCase() == "a") {
                //         var aItems = autopagerXPath.discoveryMoreLinks(doc, [], [elem.parentNode]);
                //         if (!aItems) return;
                //         items.push("-");
                //         for (var i in aItems)
                //             items.push(aItems[i]);
                //     }
                // };

                // pushParentXPath(originalTarget);
                // pushParentXPath(originalTarget.parentNode);
            // }

            return items;
        },
    };

    function log(arg){ Application.console.log("[SITEINFO_Writer] " + arg); }
    function $(id) document.getElementById(id);
    function E(id) document.getElementById(id);
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


// 给自带的开发工具右键添加 "设置 nextLink 的值" 和 "设置 pageElement 的值"
location == "chrome://browser/content/devtools/framework/toolbox.xul" && (function (){
    let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
    if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");

    var mainwin = Services.wm.getMostRecentWindow("navigator:browser");
    var siteinfo_writer = mainwin.siteinfo_writer || {}

    var ns = {
        init: function(){
            var panel = document.getElementById("toolbox-panel-inspector")
            if(!panel) return;

            ns.addIframeListener()

            // 从其它面板转过来，未成功
            // var observer = new MutationObserver(function(mutations){
            //     mutations.forEach(function(mutation){
            //         if(mutation.addedNodes.length){
            //             ns.addIframeListener()
            //         }
            //     })
            // });
            // observer.observe(panel, {childList: true})
        },
        addIframeListener: function(){
            var iframe = document.getElementById("toolbox-panel-iframe-inspector");
            if(!iframe) return;

            var doc = iframe.contentDocument;
            ns.win = iframe.contentWindow;

            ns.iframeInit(doc);
        },
        iframeInit: function(doc){
            // 添加菜单
            var popup = doc.getElementById("inspector-node-popup");
            if(!popup){
                throw("[SITEINFO_Writer] inspector popup node not find.")
            }

            var m = $C("menu", {
                label: "Get XPath",
                id: "menu-copy-xpath",
                accesskey: "x"
            });
            var p = m.appendChild($C("menupopup", {}));
            p.addEventListener("popupshowing", ns.onPopupshowing, false);
            popup.insertBefore(m, popup.firstChild);
        },
        onPopupshowing: function(event){
            var popup = event.target;
            var range = document.createRange();
            range.selectNodeContents(popup);
            range.deleteContents();
            range.detach();

            var inspector = ns.win.inspector;
            var elem = inspector.selection.node;

            if(siteinfo_writer){
                var items = siteinfo_writer.findXPathes(elem);
                ns.createMenuitem(popup, items);
            }
        },
        createMenuitem: function(popup, items) {
            for (let [i, item] in Iterator(items)) {
                let str = item.xpath

                let m = document.createElement("menuitem");
                m.setAttribute("label", str);
                m.setAttribute("class", "menuitem-non-iconic");
                m.style.setProperty("max-width","63em","important");
                if (str.length > 110)
                    m.setAttribute("tooltiptext", str);
                m.addEventListener("click", ns.copyToClipboard, false)

                popup.appendChild(m);
            }
        },
        copyToClipboard: function(event) {
            Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(event.target.getAttribute("label"));
        },
    };

    ns.init();

    function log(arg) Application.console.log(arg)
    function $C(name, attr) {
        var el = document.createElement(name);
        if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
        return el;
    }
})();
