// ==UserScript==
// @name           autoLanuchReader.uc.js
// @description    自动启用 小说阅读脚本 或 Evernote Clealy 或 Readability
// @author         ywzhaiqi
// @namespace      ywzhaiqi@gmail.com
// @include        main
// @charset        UTF-8
// @version        0.0.1
// @note           2013/06/02 ver0.001
// ==/UserScript==

if(typeof window.autoReader != "undefined"){
    window.autoReader.unint();
    delete window.autoReader;
}

(function(){

var AUTO_SITE_TEXT = "";

//var EXAMPLE_AUTO_SITE_TEXT = function () {/*
//    http://www.cnbeta.com/articles/*.htm
//    http://www.zhuzhudao.com/txt/*
//*/}.toString().replace("function () {/*", "").replace("*/}", "").trim();

var BUTTON_OFF_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABH0lEQVQ4jZ2TTU7DMBSEv2dyBlghFt4jJFggegROAklp07RSDlAJoSYNJRQuwg342YDEOossWPYKFcjdNLSJEwqMNJKfPfPm2ZLFGAPAKIpPgTZwAOxQjxnwDgwH/eAZQIwxjKLxJRA2mBpgwkE/uJJl8sPfzAB8AccOiPsPM8AWEDjAYfWkH/iWOoqTuiYthcg2IpS4hNYarfWqaVUnsqs2zXnmtr/X99PUOncEsTYL5HlemgagqlcIWKyYCpx7F5ZW2e5yQpzcrE1ja9XP9nJ9dzuxtApk9vsWVHSSKYS3qn98na7uX1Ov8VXiJD0BnmqiNmEO7Kte13sRCAU+696jgXOBTq/rZVJ852QyPQJ8oAXsNaR+AI/A0O+4GcAC/tBIHXgDrRwAAAAASUVORK5CYII=";
var BUTTON_ON_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABOUlEQVQ4jZ2TsUrDUBSGvxvzAg7qJA5BdBARI1ishYJ26uZLOBQtUpEMjhUr6KAgqC/gC7ipIKSCoiKOQTI4dnQ1N7kOkpomuZb6w4Fz7v3/w38O9wqlFAAV56UKbABzwBj56ACvQPO6Zd8DCKUUK9uP+4CjEeng3B4uHohyvV0FrgYUA4RAwYyCoPYPMcAQ0DAjKe30jXu+mmGX1m8yZwqKRijlaCglyYhhWRaWZXWbpnmRlONG9JP0RBIjy8fdvHNXy3DNKAi0Q/q+3+MGIM3/00EsijFstzLcviPMr1123eRx+zZI1p9vu7k76KB/upmZU7VnRFI+p7vOVC5+l5ZTJ+JJTJdPl4A2IHQuNPgCZoVSiqnSyQ6wB5gDiOueu3km4u88WThaALaAIjChEX4ALtB8f2h4AN/8SQfIa3maJAAAAABJRU5ErkJggg==";


var AUTO_START = true;
var BUTTON_ID = "autoReaderButton";

var ns = window.autoReader = {
    auto_sites_reg: [],
    button: null,
    currentMatch_siteText:"",

    get prefs() {
        delete this.prefs;
        return this.prefs = Services.prefs.getBranch("autoReader.");
    },
    get AUTO_START() AUTO_START,
    set AUTO_START(bool) {
        updateIcon();
        return AUTO_START = !!bool;
    },
    get AUTO_SITE_TEXT() AUTO_SITE_TEXT,
    set AUTO_SITE_TEXT(text) {
        this.handleAutoSiteText(text);
        AUTO_SITE_TEXT = text;
    },

    init: function(){
        ["AUTO_START"].forEach(function(name) {
            try {
                ns[name] = ns.prefs.getBoolPref(name);
            } catch (e) {}
        }, ns);

        ["AUTO_SITE_TEXT"].forEach(function(name) {
            try {
                ns[name] = ns.prefs.getCharPref(name);
            } catch (e) {}
        }, ns);


        // addon-bar, urlbar-icons, nav-bar, PersonalToolbar
        this.addButton("PersonalToolbar");

        this.handleAutoSiteText();

        gBrowser.mPanelContainer.addEventListener('DOMContentLoaded', this, true);
        window.addEventListener('unload', this, false);
    },
    uninit: function(){
        gBrowser.mPanelContainer.removeEventListener('DOMContentLoaded', this, true);
        window.removeEventListener('unload', this, false);

        ["AUTO_START"].forEach(function(name) {
            try {
                ns.prefs.setBoolPref(name, ns[name]);
            } catch (e) {}
        }, ns);

        ["AUTO_SITE_TEXT"].forEach(function(name) {
            try {
                ns.prefs.setCharPref(name, ns[name]);
            } catch (e) {}
        }, ns);
    },
    handleEvent: function(event){
        switch(event.type){
            case "DOMContentLoaded":
                if(this.AUTO_START){
                    this.autoLaunch(event.target.defaultView);
                }
                break;
            case "unload":
                this.uninit(event);
                break;
        }
    },
    addButton: function(_toolbarId){
        var _toolbar = document.getElementById(_toolbarId);
        if(!_toolbar) return;

        this.button = _toolbar.appendChild($C("toolbarbutton",{
            id: BUTTON_ID,
            class: "toolbarbutton-1",
            // type: "menu-button",
            removable: true,
            context: "autoReader-menupopup",
            lable: "autoReader",
            oncommand: "autoReader.launch();",
            tooltiptext: "自动启用Clealy、Readability、小说阅读脚本",
            image: AUTO_START ? BUTTON_ON_IMAGE : BUTTON_OFF_IMAGE
        }));

        // <hbox >\
        //     <textbox id="autoReader-autosite-textbox" cols="50"/>\
        //     <toolbarbutton id="autoReader-autosite-button"\
        //             class="toolbarbutton-1" tooltiptext="设置是否自动启用"\
        //             oncommand="autoReader.onAutoSiteButtonCommand();"\
        //             image="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJdSURBVDjLpZP7S1NhGMf9W7YfogSJboSEUVCY8zJ31trcps6zTI9bLGJpjp1hmkGNxVz4Q6ildtXKXzJNbJRaRmrXoeWx8tJOTWptnrNryre5YCYuI3rh+8vL+/m8PA/PkwIg5X+y5mJWrxfOUBXm91QZM6UluUmthntHqplxUml2lciF6wrmdHriI0Wx3xw2hAediLwZRWRkCPzdDswaSvGqkGCfq8VEUsEyPF1O8Qu3O7A09RbRvjuIttsRbT6HHzebsDjcB4/JgFFlNv9MnkmsEszodIIY7Oaut2OJcSF68Qx8dgv8tmqEL1gQaaARtp5A+N4NzB0lMXxon/uxbI8gIYjB9HytGYuusfiPIQcN71kjgnW6VeFOkgh3XcHLvAwMSDPohOADdYQJdF1FtLMZPmslvhZJk2ahkgRvq4HHUoWHRDqTEDDl2mDkfheiDgt8pw340/EocuClCuFvboQzb0cwIZgki4KhzlaE6w0InipbVzBfqoK/qRH94i0rgokSFeO11iBkp8EdV8cfJo0yD75aE2ZNRvSJ0lZKcBXLaUYmQrCzDT6tDN5SyRqYlWeDLZAg0H4JQ+Jt6M3atNLE10VSwQsN4Z6r0CBwqzXesHmV+BeoyAUri8EyMfi2FowXS5dhd7doo2DVII0V5BAjigP89GEVAtda8b2ehodU4rNaAW+dGfzlFkyo89GTlcrHYCLpKD+V7yeeHNzLjkp24Uu1Ed6G8/F8qjqGRzlbl2H2dzjpMg1KdwsHxOlmJ7GTeZC/nesXbeZ6c9OYnuxUc3fmBuFft/Ff8xMd0s65SXIb/gAAAABJRU5ErkJggg=="\
        //             />\
        // </hbox>\

        var xml = '\
            <menupopup id="autoReader-menupopup" onpopupshowing="autoReader.onPopupShowing();">\
                <menuitem label="启用自动阅读器"\
                          id="autoReader-AUTOSTART"\
                          type="checkbox"\
                          autoCheck="true"\
                          checked="'+ AUTO_START +'"\
                          oncommand="autoReader.toggle(event);"/>\
                <menuitem id="autoReader-menuitem-preferences" label="设置自动启用的站点"\
                        oncommand="autoReader.showSettingDialog();" />\
            </menupopup>\
        ';

        var range = document.createRange();
        range.selectNodeContents($('mainPopupSet'));
        range.collapse(false);
        range.insertNode(range.createContextualFragment(xml.replace(/\n|\t/g, '')));
        range.detach();
    },
    handleAutoSiteText: function(text){
        var self = this;
        this.auto_sites_reg = [];

        var auto_sites = (text || this.AUTO_SITE_TEXT).split("\n");

        auto_sites.forEach(function(line){
            line = line.trim();
            if(line){
                self.auto_sites_reg.push(wildcardToRegExpStr(line));
            }
        });
    },
    autoLaunch: function(win){
        var locationHref = win.location.href;

        var sites = this.auto_sites_reg;
        this.currentMatch_siteText = "";

        for (var i = 0; i < sites.length; i++) {
            if(new RegExp(sites[i]).test(locationHref)){
                this.currentMatch_siteText = sites[i];
                this.launch(win);
                break;
            }
        }
    },
    launch: function(win, timer){
        win = win || getFocusedWindow();

        win.setTimeout(function(){

            var wrappedJS = win.wrappedJSObject;

            if (wrappedJS.readx) {
                wrappedJS.readx();
            }else if (window.__readable_by_evernote) {
                window.__readable_by_evernote.readable_by_evernote__button__call();
            }else if (wrappedJS.X_readability) {
                wrappedJS.X_readability();
            }

        }, timer || 0);
    },
    toggle: function(){
        if (this.AUTO_START) {
            this.AUTO_START = false;
            updateIcon();
        } else {
            this.AUTO_START = true;
            updateIcon();
        }
    },
    onPopupShowing: function(event){
        // var tabWindow;

        // if (tabWindow = window.gBrowser.selectedTab.linkedBrowser.contentWindow) {
        //     var value = this.currentMatch_siteText;
        //     if(!value){
        //         value = tabWindow.location.href;
        //     }
        //     return $('autoReader-autosite-textbox').value = value;
        // }
    },
    showSettingDialog: function(xulBase64){
        if(!xulBase64){
            xulBase64 = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjw/eG1sLXN0eWxlc2hlZXQgaHJlZj0iY2hyb21lOi8vZ2xvYmFsL3NraW4vIiB0eXBlPSJ0ZXh0L2NzcyI/Pg0KPHdpbmRvdyB4bWxucz0iaHR0cDovL3d3dy5tb3ppbGxhLm9yZy9rZXltYXN0ZXIvZ2F0ZWtlZXBlci90aGVyZS5pcy5vbmx5Lnh1bCIgd2lkdGg9IjUwMCIgaGVpZ2h0PSIzMDAiIA0KICAgIHRpdGxlPSLorr7nva7oh6rliqjlkK/nlKjnmoTnq5nngrkiPg0KICAgIDxoYm94IGFsaWduPSJjZW50ZXIiIHRvb2x0aXB0ZXh0PSLkuIDooYzkuIDkuKrnvZHlnYDvvIzlm57ovabplK7ovpPlhaXnu5PmnpzvvIznpLrkvovvvJpodHRwOi8vd3d3LmNuYmV0YS5jb20vYXJ0aWNsZXMvKi5odG0iPg0KICAgICAgICA8bGFiZWwgdmFsdWU9IuW9k+WJjeermeeCuee9keWdgCI+PC9sYWJlbD4NCiAgICAgICAgPHRleHRib3ggZmxleD0iMSIvPg0KICAgICAgICA8YnV0dG9uIGlkPSJidG5fb3JpZ2luYWxfdXJsIiBsYWJlbD0i5Y6f5aeL5Zyw5Z2AIi8+DQogICAgPC9oYm94Pg0KICAgIDx0ZXh0Ym94IGlkPSJ1cmxzIiBtdWx0aWxpbmU9InRydWUiIGZsZXg9IjEiLz4NCiAgICA8aGJveCBkaXI9InJldmVyc2UiPg0KICAgICAgICA8YnV0dG9uIGlkPSJzYXZlIiBsYWJlbD0i5L+d5a2YIi8+DQogICAgPC9oYm94Pg0KICAgIDxzY3JpcHQ+DQogICAgICAgIDwhW0NEQVRBWw0KDQogICAgICAgIHZhciB1cmxfdGV4dGJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoInRleHRib3giKTsNCiAgICAgICAgdmFyIHVybHNfdGV4dGJveCA9ICQoInVybHMiKTsNCiAgICAgICAgdmFyIGJ0bl9vcmlnaW5hbF91cmwgPSAkKCJidG5fb3JpZ2luYWxfdXJsIik7DQoNCiAgICAgICAgdmFyIGxvY2F0aW9uSHJlZiA9IG9wZW5lci5jb250ZW50LmxvY2F0aW9uLmhyZWY7DQoNCiAgICAgICAgLy8g5a+55Zyw5Z2A6L+b6KGM566A5Y2V5aSE55CGDQogICAgICAgIHZhciB2YWx1ZSA9IGxvY2F0aW9uSHJlZi5yZXBsYWNlKC8jW15cL10qJC8sICIiKTsNCiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cL1teXC9dKihcLnM/aHRtbD98XC5hc3B4KT8kLywgIi8qJDEiKTsNCiAgICAgICAgdXJsX3RleHRib3gudmFsdWUgPSB2YWx1ZTsNCg0KICAgICAgICB1cmxfdGV4dGJveC5hZGRFdmVudExpc3RlbmVyKCJrZXl1cCIsIGZ1bmN0aW9uKGV2ZW50KXsNCiAgICAgICAgICAgIGlmKGV2ZW50LndoaWNoID09IDEzIHx8IGV2ZW50LmtleUNvZGUgPT0gMTMpew0KICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHVybF90ZXh0Ym94LnZhbHVlLnRyaW0oKTsNCiAgICAgICAgICAgICAgICBpZih2YWx1ZSl7DQogICAgICAgICAgICAgICAgICAgIHVybHNfdGV4dGJveC52YWx1ZSArPSAiXG4iICsgdXJsX3RleHRib3gudmFsdWU7DQogICAgICAgICAgICAgICAgICAgIHVybF90ZXh0Ym94LnZhbHVlID0gIiI7DQogICAgICAgICAgICAgICAgfQ0KICAgICAgICAgICAgfQ0KICAgICAgICB9LCBmYWxzZSk7DQoNCiAgICAgICAgdXJsc190ZXh0Ym94LnZhbHVlID0gb3BlbmVyLmF1dG9SZWFkZXIuQVVUT19TSVRFX1RFWFQNCg0KICAgICAgICBidG5fb3JpZ2luYWxfdXJsLnNldEF0dHJpYnV0ZSgidG9vbHRpcHRleHQiLCBsb2NhdGlvbkhyZWYpOw0KICAgICAgICBidG5fb3JpZ2luYWxfdXJsLmFkZEV2ZW50TGlzdGVuZXIoImNvbW1hbmQiLCBmdW5jdGlvbigpew0KICAgICAgICAgICAgdXJsX3RleHRib3gudmFsdWUgPSBsb2NhdGlvbkhyZWY7DQogICAgICAgIH0sIGZhbHNlKTsNCg0KICAgICAgICAkKCJzYXZlIikuYWRkRXZlbnRMaXN0ZW5lcigiY29tbWFuZCIsIGZ1bmN0aW9uKCl7DQogICAgICAgICAgICBvcGVuZXIuYXV0b1JlYWRlci5BVVRPX1NJVEVfVEVYVCA9IGluY2x1ZGVzX3RleHRib3gudmFsdWU7DQogICAgICAgICAgICBjbG9zZSgpOw0KICAgICAgICB9LCBmYWxzZSk7DQoNCiAgICAgICAgZnVuY3Rpb24gJChpZCkgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpOw0KDQogICAgICAgIF1dPg0KICAgIDwvc2NyaXB0Pg0KPC93aW5kb3c+";
        }
        window.openDialog("data:application/vnd.mozilla.xul+xml;charset=UTF-8;base64," + xulBase64,
            "name", "top=" + (window.screenY + 100) + ",left=" + (window.screenX + 50));
    },
    onAutoSiteButtonCommand:function(event){
        // var blackList, tabWindow;

        // blackList = getPref('black_list');
        // if (blackList.length > 0) {
        //   blackList += ', ';
        // }
        // blackList += blacklistTextbox.value;
        // setPref('black_list', blackList);
        // menupopup.hidePopup();

        return event.stopPropagation();
    }
};

window.autoReader.init();

function updateIcon(){
    var tooltiptext = "";
    var button = autoReader.button;

    if(autoReader.AUTO_START == false){
        tooltiptext = "自动阅读器已关闭";
        button.setAttribute("image", BUTTON_OFF_IMAGE);
    }else{
        tooltiptext = "自动阅读器已启用";
        button.setAttribute("image", BUTTON_ON_IMAGE);
    }

    button.setAttribute("tooltiptext", tooltiptext);
}


function debug() { Application.console.log(Array.slice(arguments)); };
function $(id) document.getElementById(id);
function $C(name, attr) {
    var el = document.createElement(name);
    if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
    return el;
}

function getFocusedWindow() {
    var win = document.commandDispatcher.focusedWindow;
    return (!win || win == window) ? content : win;
}

function wildcardToRegExpStr(urlstr) {
    if (urlstr.source) return urlstr.source;
    let reg = urlstr.replace(/[()\[\]{}|+.,^$?\\]/g, "\\$&").replace(/\*+/g, function(str){
        return str === "*" ? ".*" : "[^/]*";
    });
    return "^" + reg + "$";
}

})();
