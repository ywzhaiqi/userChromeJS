"use strict";
let global = this;

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;
const { Services } = module("resource://gre/modules/Services.jsm");
// const { XPathAP } = module('xpath_autoComplete2');

const mainWin = Services.wm.getMostRecentWindow("navigator:browser");
const uAutoPagerize = mainWin.uAutoPagerize;

var USE_FIREBUG = false;

var table = null;
var data = null;
var tree, filterBox;
var filterText = "";
var selectedSite, selectedRow;

// controls
var chkUseiframe, chkIloaded, exampleUrl, siteName, urlPattern, nextLink, pageElement, insertBefore;
var message, xpathFindPopup;

var newSiteInfo = {
    name: mainWin.content.document.title,
    url: getContentUrl(),
    // nextLink: "//a[contains(.//text(),'下一页')]",
    nextLink: "auto;",
    pageElement: "//body/*"
};

var debug = mainWin.content.console.log;

function init(){
	tree = document.getElementById("tree");
    filterBox = document.getElementById("filter");

	// 右边一般面板
	chkUseiframe = document.getElementById("chkUseiframe");
	chkIloaded = document.getElementById("chkIloaded");
	exampleUrl = document.getElementById("exampleUrl");
	siteName = document.getElementById("siteName");
	urlPattern = document.getElementById("urlPattern");
	nextLink = document.getElementById("nextLink");
	pageElement = document.getElementById("pageElement");
	insertBefore = document.getElementById("insertBefore");

	// 底部信息条
	message = document.getElementById("message");
    xpathFindPopup = document.getElementById("xpath-find-popup");

    var locationHref = mainWin.content.location.href;
    if(locationHref.startsWith("http")){
        filterBox.value = locationHref;
        filterBox.doCommand();
        if(tree.view.rowCount > 0){
            tree.focus();
            tree.view.selection.select(0);
        }
    }else{
        loadTable();
        updateDetails(newSiteInfo);
    }

    // 回车检测
    var onKeypress = function(event){
        if(event.keyCode==13){
            setTimeout(function(){
                xpathTools.xpathTest(event.target.id);
            }, 200);
        }
    };
    nextLink.addEventListener("keypress", onKeypress, false);
    pageElement.addEventListener("keypress", onKeypress, false);

    // autoComplete
    setupAutoCompleter(nextLink);
    setupAutoCompleter(pageElement);
}

function cleanUp(){
    Aardvark.quit();
    // uAutoPagerize.saveSetting();
}

//this function is called every time the tree is sorted, filtered, or reloaded
function loadTable(msg){
	msg = msg || "";
	//remember scroll position. this is useful if this is an editable table
	//to prevent the user from losing the row they edited
	var topVisibleRow = null;
	if(table){
		topVisibleRow = getTopVisibleRow();
	}
	if(data == null){
		data = uAutoPagerize.MY_SITEINFO || [];
	}
	if(filterText == ""){
		table = data;
		msg += "共有";
	}else{
		table = [];
		data.forEach(function(info){
            var exp = info.url_regexp || Object.defineProperty(info, "url_regexp", {
                    enumerable: false,
                    value: new RegExp(info.url)
                }).url_regexp;

			if(info.name && info.name.toLowerCase().indexOf(filterText) != -1 ||
                info.url.toString().indexOf(filterText) != -1 || exp.test(filterText)){
				table.push(info);
			}
		});
		msg += "找到";
	}

	tree.view = new treeView(table);

	//restore scroll position
	if(topVisibleRow){
		setTopVisibleRow(topVisibleRow);
	}

	message.value = msg + table.length + "个规则";
}

//generic custom tree view stuff
function treeView(table){
	this.rowCount = table.length;
	this.getCellText = function(row, col){
		return table[row][col.id];
	};
	this.getCellValue = function(row, col){
		return table[row][col.id];
	};
	this.setTree = function(treebox){
		this.treebox = treebox;
	};
	this.isEditable = function(row, col){
		return col.editable;
	};
	this.isContainer = function(row){ return false; };
	this.isSeparator = function(row){ return false; };
	this.isSorted = function(){ return false; };
	this.getLevel = function(row){ return 0; };
	this.getImageSrc = function(row,col){ return null; };
	this.getRowProperties = function(row,props){};
	this.getCellProperties = function(row,col,props){};
	this.getColumnProperties = function(colid,col,props){};
	this.cycleHeader = function(col, elem) {};
}

function prepareForComparison(o){
	if(typeof o == "string")
		return o.toLowerCase();
	return o;
}

function getTopVisibleRow(){
	return tree.treeBoxObject.getFirstVisibleRow();
}

function setTopVisibleRow(topVisibleRow){
	return tree.treeBoxObject.scrollToRow(topVisibleRow);
}

function setFilter(text){
	filterText = prepareForComparison(text);;
	loadTable();
}

function updateDetails(info){
    if(!info){
        selectedRow = tree.currentIndex;
        selectedSite = table[selectedRow];
        info = selectedSite;
    }

    chkUseiframe.checked = info.useiframe || false;
    chkIloaded.checked = info.iloaded || false;
    chkIloaded.hidden = !chkUseiframe.checked;
    exampleUrl.hidden = info.exampleUrl == undefined || info.exampleUrl == "";
    exampleUrl.value = info.exampleUrl || "";
    exampleUrl.href = exampleUrl.value;

    siteName.value = info.name || "";
    urlPattern.value = info.url || "";
    nextLink.value = info.nextLink || "";
    pageElement.value = info.pageElement || "";

    urlPattern.style.color = "";
    nextLink.style.color = "";
    pageElement.style.color = "";
}

function toggleUseIframe(event){
	if(chkUseiframe.checked){
		chkIloaded.hidden = false;
	}else{
		chkIloaded.hidden = true;
	}
}

function handleAddSiteButton(event){
    addSiteInfo(newSiteInfo);
}

function addSiteInfo(info){
    data.unshift(info);
    loadTable("刚刚添加了1个规则，");
    tree.view.selection.select(0);
}

function editSetting(){
    uAutoPagerize.edit(uAutoPagerize.file);
    copyToClipboard(selectedSite.name || selectedSite.url.replace("\\", "\\\\"));
}

function reloadSetting(){
    uAutoPagerize.loadSetting(true);

    data = uAutoPagerize.MY_SITEINFO || [];
    loadTable();
    updateDetails();
}

function handleCloneSiteButton(event){
	var cloneSite = selectedSite.clone();
	var newRow = selectedRow + 1;
	data.splice(newRow, 0, cloneSite);
	loadTable("刚刚克隆了1个规则，");
	tree.view.selection.select(nweRow);
}

function handleDeleteSiteButton(event){
	var index = -1;
	for (var i = 0, l = data.length; i < l; i++) {
		if(selectedSite == data[i]){
			index = i;
			break;
		}
	}

	if(index != -1){
		data.splice(index, 1);
		loadTable("刚刚删除了一个规则，");
	}
}

function handleSaveSiteButton(event){
    if(selectedSite){
        if(chkUseiframe.checked){
            selectedSite.useiframe = true;
            selectedSite.iloaded = chkIloaded.checked;
        }else{
            delete selectedSite.useiframe;
        }
        selectedSite.name = siteName.value;
        selectedSite.url = urlPattern.value;
        selectedSite.nextLink = nextLink.value;
        selectedSite.pageElement = pageElement.value;

        tree.treeBoxObject.invalidateRow(selectedRow);
    }else{
        var info = {
            name: siteName.value,
            url: urlPattern.value,
            nextLink: nextLink.value,
            pageElement: pageElement.value,
        };

        if(chkUseiframe.checked){
            info.useiframe = true;
            if(chkIloaded)
                info.iloaded = true;
        }

        addSiteInfo(info);
    }
}


function readInfoFromClipBoard() {
    var str = readFromClipboard();
    if(!str){
        return alert("剪贴板里没有内容");
    }

    var info = {};
    var lines = str.split(/\r\n|\r|\n/);
    var re = /(^[^:]*?)[: ]+(.*)$/;
    var strip = function(str) {
        return str.replace(/^[\s\t{'"]*/, '').replace(/[\s,}'"]*$/, '');
    };
    for (var i = 0; i < lines.length; i++) {
        lines[i] = strip(lines[i]);
        if (lines[i].match(re)) {
            info[RegExp.$1.trim()] = strip(RegExp.$2).trim();
        }
    }
    var isValid = function(info) {
        var infoProp = ['url', 'nextLink', 'pageElement'];
        for (var i = 0; i < infoProp.length; i++) {
            if (!info[infoProp[i]]) {
                return false;
            }
        }
        return true;
    };

    if(isValid(info)){
        addSiteInfo(info);
    }else{
        alert("剪贴板数据不匹配");
    }
}

function copyInfoToClipBoard() {
    var json = "\t{";
    json += "name: '" + siteName.value + "',\n";
    json += "\t\turl: '" + urlPattern.value.replace(/\\/g, "\\\\") + "',\n";
    json += "\t\tnextLink: '" + nextLink.value.replace(/'/g, '"') + "',\n";
    json += "\t\tpageElement: '" + pageElement.value.replace(/'/g, '"') + "',\n";
    if (chkUseiframe.checked){
        json += "\t\tuseiframe: true,\n";
        if(chkIloaded.checked)
            json += "\t\tiloaded: true,\n";
    }
    if (insertBefore.value)
        json += "\t\tinsertBefore: '" + insertBefore.value + "',\n";
    json += "\t\texampleUrl: '" + mainWin.content.location.href + "',\n";
    json += "\t},";
    var r = confirm("翻页规则（按确定键将其复制到剪贴板）：" + '\n\n' + json);
    if (r)
        copyToClipboard(json);
}

function handleTestSiteButton(event){

}

function inputUrlTester(event){

}
function setUrl(){
	urlPattern.value = getContentUrl();
}
function setSiteName() {
    siteName.value = mainWin.content.document.title;
}

function getContentUrl(){
	var url = mainWin.content.location.href;
    // .replace(/#.*$/, "");  // 去掉hash
    if (url.indexOf("?")>0)
        url = url.substring(0,url.indexOf("?"));

    url = "^" + url.replace(/[()\[\]{}|+.,^$?\\]/g, '\\$&');
	return url;
}

var xpathTools = {
    checkUrlPattern: function(){
        var url = mainWin.content.location.href;
        if (!url)
            urlPattern.style.color = "";

        var urlValue = urlPattern.value;
        if(urlValue.startsWith("wildc;"))
            urlValue = wildcardToRegExpStr(urlValue.slice(6));
        try {
            var regexp = new RegExp(urlValue);

            if (regexp.test(url))
                urlPattern.style.color = "green";
            else
                urlPattern.style.color = "red";
        } catch (e) {
            urlPattern.style.color = "red";
        }
    },
    pickupElement: function (aType){
        let dactyl = mainWin.dactyl;
        if(dactyl)
            dactyl.execute(":js modes.push(modes.PASS_THROUGH, null, null);");

        let wrapper = {
            window: mainWin,
            browser: mainWin.gBrowser
        };
        var self = this;
        Aardvark.start(wrapper, function(elem){
            if(dactyl)
                dactyl.execute(":js modes.cleanup();");

            if(!elem) return;

            // let xpaths = autopagerXPath.getXPath(elem, aType);
            let doc = elem.ownerDocument;
            let items = autopagerXPath.discoveryMoreLinks(doc, [], [elem]);
            let xpaths = [];
            items.forEach(function(i){
                xpaths.push(i.xpath);
            });

            self.createAndOpenPopup(xpaths, elem, aType);
        });
    },
    createAndOpenPopup: function(xpaths, elem, aType){
        let range = document.createRange();
        range.selectNodeContents(xpathFindPopup);
        range.deleteContents();
        range.detach();
        for (let [i, xpath] in Iterator(xpaths)) {
            let menuitem = document.createElement("menuitem");
            menuitem.setAttribute("label", xpath);
            menuitem.setAttribute("oncommand", "window['"+ aType +"'].value = this.getAttribute('label');" +
                "xpathTools.xpathTest('"+ aType +"');");
            xpathFindPopup.appendChild(menuitem);
        }
        xpathFindPopup.openPopup(window[aType], "before_start");
    },
    toClearElements: [],
    xpathTest: function (aType){
        var textbox = window[aType];
        var selector = textbox.value;
        var doc = mainWin.content.document;

        var elements = null;
        if(selector.startsWith("auto;")){
            let nextLink = uAutoPagerize.autoGetLink(doc);
            if(nextLink)
                elements = [nextLink];
        }else{
            try{
                elements = uAutoPagerize.getElementsMix(selector, doc);
            }catch(e) {}
        }

        if(elements && elements.length){
            textbox.style.color = "green";
            elements[0].scrollIntoView();
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
    inspectMix: function (aType){
        let xpath = window[aType].value;
        let doc = mainWin.content.document;

        var elem;
        try{
            elem = uAutoPagerize.getElementMix(xpath, doc);
        }catch(e){}

        Inspect.inspect(elem);
    }
};

var Inspect = (function(){
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

    let inspect = function(elem){
        if(!elem){
            if(USE_FIREBUG && Firebug){
                mainWin.document.getElementById("cmd_firebug_toggleInspecting").doCommand();
            }else{
                gDevToolsBrowser.selectToolCommand(gBrowser, "inspector");
            }
            return;
        }

        // 已经打开则直接启动
        if(Firebug && Firebug.isInitialized && Firebug.currentContext){
            Firebug.browserOverlay.startFirebug(function(Firebug){
                Firebug.Inspector.inspectFromContextMenu(elem);
            });
            return;
        }else{  // 检测自带开发工具是否已经启动
            let target = devtools.TargetFactory.forTab(gBrowser.selectedTab);
            let toolbox = gDevTools.getToolbox(target);
            if(toolbox){
                inspectWithDevtools(elem);
                return;
            }
        }

        // 没有打开则启动
        if(USE_FIREBUG && Firebug){
            inspectWithFirebug(elem);
        }else{
            inspectWithDevtools(elem);
        }
    };

    return {
        inspect: inspect
    };
})();


function wildcardToRegExpStr(urlstr) {
    if (urlstr.source) return urlstr.source;
    let reg = urlstr.replace(/[()\[\]{}|+.,^$?\\]/g, "\\$&").replace(/\*+/g, function(str){
        return str === "*" ? ".*" : "[^/]*";
    });
    return "^" + reg + "$";
}

function readFromClipboard() {
    var url;
    try {
        // Create transferable that will transfer the text.
        var trans = Components.classes["@mozilla.org/widget/transferable;1"]
                        .createInstance(Components.interfaces.nsITransferable);
        trans.init(mainWin.getLoadContext());
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

function module (uri) {
    if(!/^[a-z]+:/.exec(uri))
        uri = "chrome://userChromejs/content/uAutoPagerize/" + uri + ".js";

    let obj = {};
    Components.utils.import(uri, obj);
    return obj;
}