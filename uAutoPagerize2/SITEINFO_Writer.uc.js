// ==UserScript==
// @name           SITEINFO_Writer.uc.js
// @description    uAutoPagerize 中文增强版的站点配置辅助工具
// @namespace      http://d.hatena.ne.jp/Griever/
// @author         Griever
// @modified       ywzhaiqi
// @include        main
// @compatibility  Firefox 5 - firefox 23a1
// @charset        UTF-8
// @version        2014.8.3
// @startup        window.siteinfo_writer.init();
// @shutdown       window.siteinfo_writer.destroy();
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS/tree/master/uAutoPagerize2
// @downloadURL    https://github.com/ywzhaiqi/userChromeJS/raw/master/uAutoPagerize2/SITEINFO_Writer.uc.js
// @note           增加下一页中文选择xpath
// @note           fix compatibility for firefox 23a1 by lastdream2013
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
				<vbox id="sw-container" class="sw-add-element" hidden="true" collapsed="false">\
				    <hbox id="sw-hbox" collapsed="false">\
				      <toolbarbutton label="查看规则" oncommand="siteinfo_writer.toJSON();"/>\
				      <toolbarbutton label="查看规则(SP)" oncommand="siteinfo_writer.toSuperPreLoaderFormat();"/>\
				      <toolbarbutton id="sw-curpage-info" label="读取当前页面规则" oncommand="siteinfo_writer.getCurPageInfo();"/>\
				      <toolbarbutton label="从剪贴板读取规则" oncommand="siteinfo_writer.readFromClipboard();"/>\
				      <toolbarbutton id="sw-launch" label="启动规则" tooltiptext="启动uAutoPagerize" oncommand="siteinfo_writer.launch();"/>\
                      <checkbox id="sw-useiframe" label="useiframe" checked="false"/>\
                      <toolbarbutton label="重置" oncommand="siteinfo_writer.show(true);"/>\
                      <spacer flex="1"/>\
				      <toolbarbutton class="tabs-closebutton close-icon" oncommand="siteinfo_writer.hide();"/>\
				    </hbox>\
				    <grid id="sw-grid">\
				      <columns>\
				        <column />\
				        <column />\
				        <column flex="1"/>\
				        <column />\
				      </columns>\
				      <rows>\
				        <row>\
				          <label value="name" />\
                          <toolbarbutton class="inspect"\
                                         tooltiptext="提取网站名称"\
                                         oncommand="siteinfo_writer.siteName.value = content.document.title;"/>\
				          <textbox id="sw-siteName"/>\
                          <hbox />\
				        </row>\
				        <row>\
				          <label value="url" />\
                          <toolbarbutton class="inspect"\
                                         tooltiptext="提取地址"\
                                         oncommand="siteinfo_writer.setUrl();"/>\
				          <textbox id="sw-url" oninput="siteinfo_writer.onInput(event);"/>\
                          <hbox />\
				        </row>\
				        <row>\
				          <label value="nextLink" />\
                          <toolbarbutton class="inspect"\
                                         tooltiptext="提取XPath"\
                                         oncommand="siteinfo_writer.inspect(\'nextLink\');"/>\
				          <textbox id="sw-nextLink" />\
				          <toolbarbutton class="check"\
				                         tooltiptext="测试XPath"\
				                         oncommand="siteinfo_writer.xpathTest(\'nextLink\');"/>\
				        </row>\
				        <row>\
				          <label value="pageElement" />\
                          <toolbarbutton class="inspect"\
                                         tooltiptext="提取XPath"\
                                         oncommand="siteinfo_writer.inspect(\'pageElement\');"/>\
				          <textbox id="sw-pageElement" />\
				          <toolbarbutton class="check"\
				                         tooltiptext="测试XPath"\
				                         oncommand="siteinfo_writer.xpathTest(\'pageElement\');"/>\
				        </row>\
				        <row hidden="true">\
				          <label value="insertBefore" />\
                          <toolbarbutton class="inspect"\
                                         tooltiptext="提取XPath"\
                                         oncommand="siteinfo_writer.inspect(\'insertBefore\');"/>\
				          <textbox id="sw-insertBefore" />\
				          <toolbarbutton class="check"\
				                         tooltiptext="测试XPath"\
				                         oncommand="siteinfo_writer.xpathTest(\'insertBefore\');"/>\
				        </row>\
				      </rows>\
				    </grid>\
                    <panel id="sw-autocompletePanel" fade="fast">\
                        <richlistbox id="sw-autocompleteList" seltype="single"\
                                 maxheight="250" minwidth="100"/>\
                    </panel>\
                    <hbox height="0">\
                        <html:span id="sw-measurer" collapsed="true" style=":0;padding:0;border:none;position:absolute;z-index:-1;visibility: hidden;width: auto;">\
                            aaaaaa\
                        </html:span>\
                        <spacer flex="1"/>\
                    </hbox>\
				</vbox>\
			</window>\
	      </overlay>';
    	overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
    	window.userChrome_js.loadOverlay(overlay, window.siteinfo_writer);

        gBrowser.mPanelContainer.addEventListener('DOMContentLoaded', this, true);
	},
	uninit : function ()  {
		gBrowser.mPanelContainer.removeEventListener('DOMContentLoaded', this, true);
	},
    destroy: function() {
        $A(document.getElementsByClassName("sw-add-element")).forEach(function(e){
            e.parentNode.removeChild(e);
        });

        this.style && this.style.parentNode.removeChild(this.style);

        this.uninit();
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
            // $("devToolsSeparator").parentNode.insertBefore(menuitem, $("devToolsSeparator"));

            setTimeout(function() {
                if (!window.uAutoPagerize) {
                    $("sw-launch").hidden = true;
                    return;
                }

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

            this.nextLink.setAttribute("tooltiptext", '例：auto; 或 css;a#pnnext 或 //a[@id="pnnext"] 或 //div[@id="footlink"]/descendant::a[text()="下一页"]');
            this.pageElement.setAttribute("tooltiptext", '例：css;#ires 或 //div[@id="ires"]');

            this.nextLink.addEventListener("popupshowing", siteinfo_writer.textboxPopupShowing, false);
            this.pageElement.addEventListener("popupshowing", siteinfo_writer.textboxPopupShowing, false);
            this.insertBefore.addEventListener("popupshowing", siteinfo_writer.textboxPopupShowing, false);

            // 自动补全
            this.url.addEventListener('keypress', function(event){
                if (event.keyCode == 13) {
                    siteinfo_writer.urlTest();
                }
            }, false);
            setupAutoCompleter(this.nextLink);
            setupAutoCompleter(this.pageElement);
        }
    },
	handleEvent: function(event){
		switch(event.type){
			case "DOMContentLoaded":
				var doc = event.target,
					win = doc.defaultView;
				if(win && win.location.hostname == 'ap.teesoft.info'){
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
            label: '查看元素',
            accesskey: 'Q',
            oncommand: "siteinfo_writer.inspectMix('" + type + "');",
        }));

        popup.appendChild($C("menuitem", {
            label: '查看元素(Firebug)',
            accesskey: 'F',
            hidden: !window.Firebug,
            oncommand: "siteinfo_writer.inspectMix('" + type + "', true);",
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
            info = {
                siteName: content.document.title,
                nextLink: "auto;",
                pageElement: "css;",
                useiframe: false,
                insertBefore: "",
            };

        this.setTextBoxValue(info);
        this.setUrl();
		this.container.hidden = false;
        // 设置总规则数量
        if (window.uAutoPagerize) {
            var list = uAutoPagerize.MY_SITEINFO.concat(uAutoPagerize.SITEINFO_CN).concat(uAutoPagerize.SITEINFO);
            $('sw-curpage-info').setAttribute('tooltiptext', '共有 ' + list.length +
                    ' 个规则。其中中文规则 ' + uAutoPagerize.SITEINFO_CN.length + ' 个，原版JSON规则 ' +
                    uAutoPagerize.SITEINFO.length + ' 个。');
        }
	},
	hide: function() {
		this.container.hidden = true;
	},
    setUrl: function() {
        var location = content.location;
        // var url = location.protocol + "//" + location.host + location.pathname;
        var url = location.href;
        this.url.value = "^" + url.replace(/[()\[\]{}|+.,^$?\\]/g, '\\$&');
        this.url.className = "";
    },
    setTextBoxValue: function(info, test){
        this.siteName.value = info.siteName || info.name || content.document.title;
        this.nextLink.value = info.nextLink || "";
        this.pageElement.value = info.pageElement || "";
        this.useiframe.checked = !!info.useiframe;
        this.insertBefore.value = info.insertBefore || "";

        var url = info.url,
            urlValue;
        if(url){  // 转为字符串
            switch(typeof(url)){
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
        }

        if(urlValue)
            this.url.value = urlValue;
        else
            this.setUrl();

        if (test) {
            this.urlTest();
            this.xpathTest('nextLink');
            this.xpathTest('pageElement');
        } else {
            this.url.style.color = '';
            this.nextLink.style.color = '';
            this.pageElement.style.color = '';
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
        spdb += "name: '" + this.siteName.value + "',\n";
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
		if(!window.uAutoPagerize) return;

        var getInfoFromURL = function (url) {
            if (!url) url = content.location.href;
            var list = uAutoPagerize.MY_SITEINFO.concat(uAutoPagerize.SITEINFO_CN).concat(uAutoPagerize.SITEINFO);
            return list.filter(function(info, index, array) {
                try {
                    var exp = info.url_regexp || Object.defineProperty(info, "url_regexp", {
                            enumerable: false,
                            value: toRE(info.url)
                        }).url_regexp;
                    return exp.test(url);
                } catch(e){ }
            });
        };
		var list = getInfoFromURL();
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

        this.setTextBoxValue(info, true);
        this.urlTest();
	},
    // autopager 查询网站 install(a36122) 没有引号的错误。
    fixAutoPagerBug: function(doc){
        var links = doc.querySelectorAll("a.install");
        for (var i = links.length - 1; i >= 0; i--) {
            let link = links[i];
            let onclick = link.getAttribute("onclick").replace(/install\((\w+)\)/, "install('$1')");
            link.setAttribute("onclick", onclick + ";return false;");
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

            var info = {
                name: getFirstElementByXPath("//desc", site).textContent.replace("AutoPager rule for ", ""),
                url: (urlIsRegex == 'false') ? wildcardToRegExpStr(urlPattern) : urlPattern,
                nextLink: getFirstElementByXPath("//linkXPath", site).textContent,
                pageElement: getFirstElementByXPath("//contentXPath", site).textContent
            };

            this.setTextBoxValue(info, false);

			// this.url.value = (urlIsRegex == 'false') ? wildcardToRegExpStr(urlPattern) : urlPattern;

			// this.siteName.value = getFirstElementByXPath("//desc", site).textContent.replace("AutoPager rule for ", "");
			// this.nextLink.value = getFirstElementByXPath("//linkXPath", site).textContent;
			// this.pageElement.value = getFirstElementByXPath("//contentXPath", site).textContent;
		}else{
			log("parseInfoFromAP: JSON");
			var info = JSON.parse(xhr.responseText);

            var newInfo = {
                name: info.name,
                url: info.data.url,
                nextLink: info.data.nextLink,
                pageElement: info.data.pageElement
            }

            this.setTextBoxValue(newInfo, false);
		}
	},
	readFromClipboard: function(){
		var dataStr = readFromClipboard();
		if(dataStr){
            var info = this.parseStringInfo(dataStr);
			if(info){
                this.setTextBoxValue(info, true);
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
            else
                alert("翻页规则语法正确，但uAutoPagerize无法执行，可能uAutoPagerize被禁用或没有安装脚本");
		} else {
                alert("有错误发生，请分别检查 url、nextLink、pageElement 是否正确");
		}
	},
	inspect: function(aType) {
		if (this._inspect)
			this._inspect.uninit();
		var self = this;
		this._inspect = new Inspector(content, aType, function(xpathArray) {
			if (xpathArray.length) {
				let range = document.createRange();
				range.selectNodeContents(self.popup);
				range.deleteContents();
				range.detach();
				for (let [i, x] in Iterator(xpathArray)) {
					let menuitem = document.createElement("menuitem");
					menuitem.setAttribute("label", x);
					menuitem.setAttribute("oncommand", "siteinfo_writer['"+ aType +"'].value = this.getAttribute('label');" +
                        "siteinfo_writer.xpathTest('"+ aType +"');");
					self.popup.appendChild(menuitem);
				}
				self.popup.openPopup(self.container, "before_start");
			}
			self._inspect = null;
		});
	},
    urlTest: function() {
        var urlValue = this.url.value;
        if(urlValue.startsWith("wildc;"))
            urlValue = wildcardToRegExpStr(urlValue.slice(6));
        try {
            var regexp = new RegExp(urlValue);

            if (regexp.test(content.location.href)){
                // this.url.classList.remove("error");
                this.url.style.color = "green";
            }else
                this.url.style.color = "red";
        } catch (e) {
            this.url.style.color = "red";
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
    toClearElements: [],
	xpathTest: function(aType) {
		var textbox = this[aType]
		if (!textbox || !textbox.value) return;

        var selector = textbox.value;
        var elements = getElementsMix(selector);
        if(elements && elements.length){
            textbox.style.color = "green";
            if (elements.length == 1){
                elements[0].scrollIntoView();
            }
        }else{
            textbox.style.color = "red";
            return;
        }

        var self = this;
        clearElementsStyle();

        for (let [i, elem] in Iterator(elements)) {
            if (!("orgcss" in elem))
                elem.orgcss = elem.style.cssText;
            elem.style.outline = "3px solid magenta";
            this.toClearElements.push(elem);
        }

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.timer = setTimeout(clearElementsStyle, 5000);

        function clearElementsStyle() {
            for (let [i, elem] in Iterator(self.toClearElements)) {
                try {  // 可能是 dead object
                    if ("orgcss" in elem) {
                        elem.orgcss?
                            elem.style.cssText = elem.orgcss:
                            elem.removeAttribute("style");
                        delete elem.orgcss;
                    }
                } catch(e) {}
            }
            self.toClearElements = [];
        }
	},
    inspectMix: function(aType, useFirebug) {
        let xpath = this[aType].value;
        let doc = content.document;

        var elems = getElementsMix(xpath);
        if(!elems) return;

        Inspect.start(elems[0], useFirebug);
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

function Inspector(aWindow, aType, aCallback) {
	this.win = aWindow;
	this.doc = this.win.document;
    this.type = aType;
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
	NEXT_REG: /[下后][一]?[页张个篇章节步]|next/i,
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

        if(this.type == "nextLink"){
            // TODO: descendant
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
                if(this.type == "nextLink"){
				    obj.ancestor_text = this.getElementXPath(elem, this.ATTR_CLASSID) + "/" + obj.ancestor_text;
                }
			}
			obj.ancestor_class = this.getElementXPath(elem, this.ATTR_NOT_CLASS) + "/" + obj.ancestor_class;
			obj.ancestor_attr = this.getElementXPath(elem, this.ATTR_NOT_CLASSID) + "/" + obj.ancestor_attr;
		}

        if(this.type == "nextLink"){
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
};

/**
 * 改自 UserStyleManager 扩展
 */
const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const XHTML = "http://www.w3.org/1999/xhtml";

const XPathKeywordsList = [
    "comment()", "node()", "text()",

    // Function
    "concat(", "substring(", "substring-after(", "substring-before(", "string(", "local-name(",
    "name(", "namespace-uri(", "normalize-space(", "translate(", "ceiling(", "count(",
    "floor(", "last()", "number(", "position()", "round(", "sum(", "boolean(", "contains(",
    "false()", "lang(", "not(", "starts-with(", "string-length(", "true()",

    // "and", "or","div", "mod",

    "child::", "parent::",
    "descendant::", "ancestor::",
    "descendant-or-self::", "ancestor-or-self::",
    "preceding-sibling::", "following-sibling::",
    "preceding::", "following::",
    "preceding-or-self::", "following-or-self::",
    "self::", "attribute::",
];

function setupAutoCompleter(textBox) {
    var ap = new XPathAutoCompleter(textBox);
    textBox.addEventListener("keypress", function(event) {
        ap.handleKeyPress(event);
        if (event.keyCode != 13) return;
        if (ap.panel.state != "open" || (ap.panel.state == "open" && !ap.list.selectedItem)) {  // 没有自动补全的情况
            var type = event.target.id.replace("sw-", "");
            siteinfo_writer.xpathTest(type);
        }
    }, false);
    textBox.addEventListener("keyup", ap.handleKeyUp.bind(ap), false);
    return ap;
}

function XPathAutoCompleter(textBox){
    this.editor = textBox;

    this.panel = document.getElementById("sw-autocompletePanel");
    this.list = document.getElementById("sw-autocompleteList");
    this.popupMeasurer = document.getElementById('sw-measurer');

    this.list.addEventListener("click", this.autocompletePanelPress.bind(this), false);
    this.list.addEventListener("keypress", this.autocompletePanelPress.bind(this), false);
    this.list.addEventListener("popupshown", this.autocompletePanelOpen.bind(this), false);
}

XPathAutoCompleter.prototype = {
    getText: function (aStart, aEnd) {
        return this.editor.value;
    },

    setText: function (aText, aStart, aEnd) {
        if (aStart == null) {
            aStart = 0;
        }
        if (aEnd == null) {
            aEnd = this.getText().length;
        }
        // separating out the text before and after astart and aend
        this.editor.value = this.editor.value.slice(0, aStart) + aText + this.editor.value.slice(aEnd);
    },

    getCaretOffset: function () {
        return this.editor.selectionStart;
    },
    setCaretOffset: function (aOffset) {
        this.editor.setSelectionRange(aOffset, aOffset);
    },

    handleKeyPress: function(event){
        if (event.ctrlKey || event.altKey || event.metaKey) {
            if (this.panel.state == "open") {
                this.panel.hidePopup();
            }
            return;
        }

        switch (event.keyCode) {
            case event.DOM_VK_DELETE:
            case event.DOM_VK_BACK_SPACE:
                if (this.panel.state == "open") {
                    this.panel.hidePopup();
                }
                return;
            case event.DOM_VK_UP:
                if (this.panel.state == "open") {
                    if (this.list.currentIndex == 0) {
                        this.list.currentIndex =
                            this.list.selectedIndex =
                            this.list.itemCount - 1;
                    } else {
                        this.list.currentIndex--;
                        this.list.selectedIndex--;
                    }
                    event.preventDefault();
                }
                return;
            case event.DOM_VK_DOWN:
                if (this.panel.state == "open") {
                    if (this.list.currentIndex ==
                        this.list.itemCount - 1) {
                        this.list.currentIndex =
                            this.list.selectedIndex = 0;
                    } else {
                        this.list.currentIndex++;
                        this.list.selectedIndex++;
                    }
                    event.preventDefault();
                }
                return;
            case event.DOM_VK_LEFT:
            case event.DOM_VK_RIGHT:
            case event.DOM_VK_HOME:
            case event.DOM_VK_END:
            case event.DOM_VK_ESCAPE:
                if (this.panel.state == "open") {
                    this.panel.hidePopup();
                }
                return;
            case event.DOM_VK_TAB:
                if (this.panel.state == "open") {
                    if (this.list.selectedItem) {
                        let value = this.list.selectedItem.lastChild.value;
                        let currentPos = this.getCaretOffset();
                        this.setText(value, currentPos, currentPos);
                        this.setCaretOffset(currentPos + value.length);
                        this.panel.hidePopup();
                    }
                    event.preventDefault();
                }
                return;
            case event.DOM_VK_ENTER:
            case event.DOM_VK_RETURN:
                if (this.panel.state == "open") {
                    if (this.list.selectedItem) {
                        let value = this.list.selectedItem.lastChild.value;
                        let currentPos = this.getCaretOffset();
                        this.setText(value, currentPos, currentPos);
                        this.setCaretOffset(currentPos + value.length);
                        this.panel.hidePopup();
                    }
                }
                return;
        }
    },

    handleKeyUp: function (event) {
        switch (event.keyCode) {
            case event.DOM_VK_CONTROL:
            case event.DOM_VK_ALT:
            case event.DOM_VK_SHIFT:
            case event.DOM_VK_UP:
            case event.DOM_VK_DELETE:
            case event.DOM_VK_BACK_SPACE:
            case event.DOM_VK_DOWN:
            case event.DOM_VK_LEFT:
            case event.DOM_VK_RIGHT:
            case event.DOM_VK_HOME:
            case event.DOM_VK_END:
            case event.DOM_VK_ESCAPE:
            case event.DOM_VK_TAB:
            case event.DOM_VK_ENTER:
            case event.DOM_VK_RETURN:
                return;
        }

        let currentPos = this.getCaretOffset();
        let text = this.getText();
        let matchedList = [];
        let lastWord = text.slice(currentPos - 1, currentPos);
        // check if the types word is !
        if ("'" == lastWord) {
            let textAfter = text.slice(currentPos).split("\n")[0];
            let textBefore = text.slice(0, currentPos).split("\n").slice(-1)[0];
            if (textAfter.trim() == "" && textBefore.split("'").length % 2 == 0) {
                this.setText("'", currentPos, currentPos);
                this.setCaretOffset(currentPos);
            }
        } else if ('"' == lastWord) {
            let textAfter = text.slice(currentPos).split("\n")[0];
            let textBefore = text.slice(0, currentPos).split("\n").slice(-1)[0];
            if (textAfter.trim() == "" && textBefore.split('"').length % 2 == 0) {
                this.setText('"', currentPos, currentPos);
                this.setCaretOffset(currentPos);
            }
        }else if (text.slice(0, currentPos).split("\n").slice(-1)[0].split("'").length % 2 &&
            text.slice(0, currentPos).split("\n").slice(-1)[0].split('"').length % 2) {

            if ("(" == lastWord) {
                let textAfter = text.slice(currentPos);
                let textBefore = text.slice(0, currentPos);
                if (textBefore.split("(").length - textBefore.split(")").length >
                    textAfter.split(")").length - textAfter.split("(").length) {
                    this.setText(")", currentPos, currentPos);
                    this.setCaretOffset(currentPos);
                }
            } else if ("[" == lastWord) {
                let textAfter = text.slice(currentPos);
                let textBefore = text.slice(0, currentPos);
                if (textBefore.split("[").length - textBefore.split("]").length >
                    textAfter.split("]").length - textAfter.split("[").length) {
                    this.setText("]", currentPos, currentPos);
                    this.setCaretOffset(currentPos);
                }
            } else {
                let richlist = this.list;
                try {
                    while (richlist.firstChild) {
                        richlist.removeChild(richlist.firstChild);
                    }
                } catch (ex) {}

                // Checking for autocompleting
                let textBefore = text.slice(0, currentPos);
                let word = textBefore.match(/([0-9a-zA-Z_\-]+)$/);

                if (!word) {
                    try {
                        this.panel.hidePopup();
                    } catch (ex) {}
                    return;
                }

                word = word[1];

                for (let i = 0; i < XPathKeywordsList.length; i++) {
                    if (XPathKeywordsList[i].slice(0, word.length).toLowerCase() != word.toLowerCase()) {
                        continue;
                    }
                    matchedList.push(XPathKeywordsList[i]);
                }
                if (matchedList.length == 0) {
                    if (this.panel.state == "open") {
                        this.panel.hidePopup();
                    }
                    return;
                }
                let maxLen = 0;
                for (let i = 0; i < matchedList.length; i++) {
                    if (maxLen < matchedList[i].length) {
                        maxLen = matchedList[i].length;
                    }
                    let item = document.createElementNS(XUL, "richlistitem");

                    let matchingPart = document.createElementNS(XUL, "label");
                    matchingPart.setAttribute("value", word);
                    matchingPart.setAttribute("style", "margin: 2px 0px; font-family: " +
                        "monospace; font-size: inherit; font-size: 14px;");
                    item.appendChild(matchingPart);

                    let rest = document.createElementNS(XUL, "label");
                    rest.setAttribute("value", matchedList[i].slice(word.length));
                    rest.setAttribute("style", "color: #444; margin: 2px 0px; font-family:" +
                        "monospace; font-size: inherit; font-size: 14px;");
                    item.appendChild(rest);
                    richlist.appendChild(item);
                }

                // // 不太准确
                // var pos = this.editor.selectionStart;
                // var offsetX = window.screenX + Math.min(position * 6, window.innerWidth - (maxLen*8 + 30));

                //
                var preText = text.slice(0, currentPos);
                var offsetX = this.getTextWidth(preText);

                this.panel.openPopup(this.editor, "before_start", offsetX, 0, false, false);

                richlist.focus();
                richlist.currentIndex = richlist.selectedIndex = 0;
                this.editor.focus();
            }
        }
    },

    getTextWidth: function(text){
        var measurer = this.popupMeasurer;
        measurer.style.fontSizeAdjust = this.editor.style.fontSizeAdjust;
        measurer.textContent = text;
        return measurer.offsetWidth;
    },

    //  function to handle click/enter on the panel
    autocompletePanelPress: function (event) {
        if (event.button && event.button == 0 ||
            event.keyCode == event.DOM_VK_ENTER ||
            event.keyCode == event.DOM_VK_RETURN) {
            if (this.panel.state == "open") {
                if (this.list.selectedItem) {
                    let value = this.list.selectedItem.lastChild.value;
                    this.panel.hidePopup();
                    this.editor.focus();
                    let caretOffset = this.getCaretOffset();
                    this.setText(value, caretOffset, caretOffset);
                }
            }
        }
    },

    //  function to handle opening of autocomplete panel
    autocompletePanelOpen: function () {
        this.list.currentIndex = this.list.selectedIndex = 0;
    },
};

/**
 * 调用自带的开发工具或 Firebug
 */
var Inspect = (function(){
    let mainWin = window;

    let Firebug = mainWin.Firebug;
    let gDevTools = mainWin.gDevTools;
    let gBrowser = mainWin.gBrowser;
    let gDevToolsBrowser = mainWin.gDevToolsBrowser;

    let devtools = (function(){
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
        }
        return devtools;
    })();

    let inspectWithDevtools = function (elem){
        let tt = devtools.TargetFactory.forTab(mainWin.gBrowser.selectedTab);
        return gDevTools.showToolbox(tt, "inspector").then((function (elem) {
            return function(toolbox) {
                let inspector = toolbox.getCurrentPanel();
                inspector.selection.setNode(elem, "Siteinfo-writer-Inspector");
            }
        })(elem));
    };

    let inspectWithFirebug = function (elem){
        Firebug.browserOverlay.startFirebug(function(Firebug){
            Firebug.Inspector.inspectFromContextMenu(elem);
        });
    };

    let start = function(elem, useFirebug){
        if (!elem) {
            if (useFirebug && Firebug) {
                mainWin.document.getElementById("cmd_firebug_toggleInspecting").doCommand();
            } else {
                gDevToolsBrowser.selectToolCommand(gBrowser, "inspector");
            }
            return;
        }

        // 已经打开则直接启动
        if (Firebug && Firebug.isInitialized && Firebug.currentContext) {
            Firebug.browserOverlay.startFirebug(function(Firebug) {
                Firebug.Inspector.inspectFromContextMenu(elem);
            });
            return;
        } else { // 检测自带开发工具是否已经启动
            let target = devtools.TargetFactory.forTab(gBrowser.selectedTab);
            let toolbox = gDevTools.getToolbox(target);
            if (toolbox) {
                inspectWithDevtools(elem);
                return;
            }
        }

        // 没有打开则启动
        if (useFirebug && Firebug) {
            inspectWithFirebug(elem);
        } else {
            inspectWithDevtools(elem);
        }
    };

    return {
        start: start,
        inspectWithDevtools: inspectWithDevtools,
        inspectWithFirebug: inspectWithFirebug
    };
})();


function log(arg){ Application.console.log("[SITEINFO_Writer] " + arg); }
function $(id) document.getElementById(id);
function $A(arr) Array.slice(arr);
function $C(name, attr) {
	var el = document.createElement(name);
	if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
	return el;
}

function getElementsMix(selector) {
    var elements = null;
    var autoGetLink = window.uAutoPagerize.autoGetLink;
    var doc = content.document;
    if(selector.startsWith("css;")){
        selector = selector.slice(4);
        if(selector)
            elements = doc.querySelectorAll(selector);
    }else if(autoGetLink && selector.trim() == "auto;"){
        let nextLink = autoGetLink(doc);
        if(nextLink)
            elements = [nextLink];
    }else{
        try {
            elements = getElementsByXPath(selector, doc);
        } catch (e) {}
    }

    return elements;
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
#sw-container{\
    background: #DBEAF9;\
}\
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
#sw-grid .inspect {\
  list-style-image: url("chrome://global/skin/icons/Search-glass.png");\
  -moz-image-region: rect(0px, 16px, 16px, 0px);\
}\
#sw-grid .check {\
  list-style-image: url("chrome://global/skin/icons/find.png");\
  -moz-image-region: rect(0px, 48px, 16px, 32px);\
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
');
