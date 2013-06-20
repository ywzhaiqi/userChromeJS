// ==UserScript==
// @name           autoLaunchReader.uc.js
// @description    自动启用 小说阅读脚本 或 Evernote clearly 或 Readability
// @author         ywzhaiqi
// @namespace      ywzhaiqi@gmail.com
// @include        main
// @charset        UTF-8
// @version        0.0.4
// @note           2013/06/06 ver0.004 调用小说脚本失败后，再次调用其它工具。clearly 后台加载网页的支持
// @note           2013/06/04 ver0.003 修复诸多bug
// @note           2013/06/03 ver0.002 改用 Overlay
// @note           2013/06/02 ver0.001 js创建按钮
// ==/UserScript==

if (typeof window.autoReader != "undefined") {
    window.autoReader.uninit();
    delete window.autoReader;
}

(function(css) {

    // 按钮鼠标中键点击自定义
    var middleButtonClicked = function(){
        
    };

    var AUTO_SITE_TEXT = "";
    var AUTO_START = true;
    var BUTTON_ID = "autoReaderButton";
    var DEBUG = false;

    let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
    if (!window.Services) Cu.import("resource://gre/modules/Services.jsm");

    var ns = window.autoReader = {
        auto_sites_reg: [],

        get prefs() {
            delete ns.prefs;
            return ns.prefs = Services.prefs.getBranch("autoReader.");
        },
        get AUTO_START() AUTO_START,
        set AUTO_START(bool) {
            updateIcon();
            return AUTO_START = !! bool;
        },
        get AUTO_SITE_TEXT() AUTO_SITE_TEXT,
        set AUTO_SITE_TEXT(text) {
            ns.handleAutoSiteText(text);
            AUTO_SITE_TEXT = text;
        },

        init: function() {
            ns.style = addStyle(css);

            // addon-bar, urlbar-icons, nav-bar, PersonalToolbar
            ns.makeIcon("addon-bar");

            ns.loadSetting();

            // addEventListener
            gBrowser.mPanelContainer.addEventListener('DOMContentLoaded', this, true);

            window.addEventListener('unload', this, false);
        },
        uninit: function() {
            ns.style.parentNode.removeChild(ns.style);

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
        handleEvent: function(event) {
            switch (event.type) {
                case "DOMContentLoaded":
                    if (this.AUTO_START && event.originalTarget instanceof HTMLDocument) {
                        var win = event.originalTarget.defaultView;
                        if (win.frameElement) {
                            return;
                        }
                        this.autoLaunch(win);
                      }
                    break;
                case "unload":
                    this.uninit(event);
                    break;
            }
        },

        makeIcon: function(_toolbarId) {
            var _toolbar = $(_toolbarId);
            if(!_toolbar){
                throw("autoLaunchReader.uc.js 工具栏ID 不存在");
            }

            ns.icon = _toolbar.appendChild($C("toolbarbutton", {
                id: BUTTON_ID,
                class: "toolbarbutton-1",
                type: "context",
                removable: "true",
                state: ns.AUTO_START ? "on" : "off",
                label: "autoReader",
                onclick: "if (event.button != 2) autoReader.iconClick(event);",
                context: "autoReader-menupopup",
                tooltiptext: "左键调用阅读工具，右键弹出菜单",
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABOUlEQVQ4jZ2TsUrDUBSGvxvzAg7qJA5BdBARI1ishYJ26uZLOBQtUpEMjhUr6KAgqC/gC7ipIKSCoiKOQTI4dnQ1N7kOkpomuZb6w4Fz7v3/w38O9wqlFAAV56UKbABzwBj56ACvQPO6Zd8DCKUUK9uP+4CjEeng3B4uHohyvV0FrgYUA4RAwYyCoPYPMcAQ0DAjKe30jXu+mmGX1m8yZwqKRijlaCglyYhhWRaWZXWbpnmRlONG9JP0RBIjy8fdvHNXy3DNKAi0Q/q+3+MGIM3/00EsijFstzLcviPMr1123eRx+zZI1p9vu7k76KB/upmZU7VnRFI+p7vOVC5+l5ZTJ+JJTJdPl4A2IHQuNPgCZoVSiqnSyQ6wB5gDiOueu3km4u88WThaALaAIjChEX4ALtB8f2h4AN/8SQfIa3maJAAAAABJRU5ErkJggg=="
            }));

            setTimeout(function(icon){
                icon.removeAttribute("image");
            }, 500, ns.icon);

            var xml = '\
                <menupopup id="autoReader-menupopup" onpopupshowing="autoReader.onPopupShowing();">\
                    <menuitem label="启用自动阅读器"\
                              id="autoReader-AUTOSTART"\
                              type="checkbox"\
                              autoCheck="true"\
                              checked="' + AUTO_START + '"\
                              oncommand="autoReader.toggle(event);"/>\
                    <hbox hidden="true">\
                        <textbox id="autoReader-autosite-textbox" cols="50"/>\
                        <toolbarbutton id="autoReader-autosite-button"\
                                class="toolbarbutton-1" tooltiptext="设置是否自动启用"\
                                oncommand="autoReader.onAutoSiteButtonCommand();"\
                                image="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJdSURBVDjLpZP7S1NhGMf9W7YfogSJboSEUVCY8zJ31trcps6zTI9bLGJpjp1hmkGNxVz4Q6ildtXKXzJNbJRaRmrXoeWx8tJOTWptnrNryre5YCYuI3rh+8vL+/m8PA/PkwIg5X+y5mJWrxfOUBXm91QZM6UluUmthntHqplxUml2lciF6wrmdHriI0Wx3xw2hAediLwZRWRkCPzdDswaSvGqkGCfq8VEUsEyPF1O8Qu3O7A09RbRvjuIttsRbT6HHzebsDjcB4/JgFFlNv9MnkmsEszodIIY7Oaut2OJcSF68Qx8dgv8tmqEL1gQaaARtp5A+N4NzB0lMXxon/uxbI8gIYjB9HytGYuusfiPIQcN71kjgnW6VeFOkgh3XcHLvAwMSDPohOADdYQJdF1FtLMZPmslvhZJk2ahkgRvq4HHUoWHRDqTEDDl2mDkfheiDgt8pw340/EocuClCuFvboQzb0cwIZgki4KhzlaE6w0InipbVzBfqoK/qRH94i0rgokSFeO11iBkp8EdV8cfJo0yD75aE2ZNRvSJ0lZKcBXLaUYmQrCzDT6tDN5SyRqYlWeDLZAg0H4JQ+Jt6M3atNLE10VSwQsN4Z6r0CBwqzXesHmV+BeoyAUri8EyMfi2FowXS5dhd7doo2DVII0V5BAjigP89GEVAtda8b2ehodU4rNaAW+dGfzlFkyo89GTlcrHYCLpKD+V7yeeHNzLjkp24Uu1Ed6G8/F8qjqGRzlbl2H2dzjpMg1KdwsHxOlmJ7GTeZC/nesXbeZ6c9OYnuxUc3fmBuFft/Ff8xMd0s65SXIb/gAAAABJRU5ErkJggg=="\
                                />\
                    </hbox>\
                    <menuitem id="autoReader-menuitem-preferences" label="设置自动启用的站点"\
                            oncommand="autoReader.showSettingDialog();" />\
                    <menuseparator/>\
                    <menuitem label="Evernote Clearly" oncommand="autoReader.launch_clearly();" />\
                    <menuitem label="Readability 中文版" oncommand="autoReader.launch_readability_cn();" />\
                    <menuitem label="小说阅读脚本" oncommand="autoReader.launch_myNovelReader();" />\
                </menupopup>\
            ';

            var range = document.createRange();
            range.selectNodeContents($('mainPopupSet'));
            range.collapse(false);
            range.insertNode(range.createContextualFragment(xml.replace(/\n|\t/g, '')));
            range.detach();
        },
        loadSetting: function(){
            ["AUTO_START"].forEach(function(name) {
                try{
                    ns[name] = ns.prefs.getBoolPref(name);
                }catch(e) {}
            }, ns);

            ["AUTO_SITE_TEXT"].forEach(function(name) {
                try{
                    ns[name] = ns.prefs.getCharPref(name);
                }catch(e) {}
            }, ns);
        },
        handleAutoSiteText: function(text) {
            ns.auto_sites_reg = [];

            var auto_sites = (text || ns.AUTO_SITE_TEXT).split("\n");

            auto_sites.forEach(function(line) {
                line = line.trim();
                if (line) {
                    var reg;
                    if(line.search(/^re;/i) == 0){
                        reg = new RegExp(line.slice(3), "i");
                    }else{
                        reg = wildcardToRegExpStr(line);
                    }
                    ns.auto_sites_reg.push(reg);
                }
            });
        },
        autoLaunch: function(win) {
            var locationHref = win.location.href;

            debug("检验地址: " + locationHref);

            var sites = this.auto_sites_reg;

            for (var i = 0; i < sites.length; i++) {
                if (new RegExp(sites[i]).test(locationHref)) {
                    return this.launch(win);
                }
            }
        },
        launch: function(win, timer) {
            var isAutoLaunch = false;
            if(win){
                isAutoLaunch = true;
            }else{
                win = getFocusedWindow();
            }

            win.setTimeout(function() {

                var wrappedJS = win.wrappedJSObject;

                var other_launch = function(){

                    if (window.__readable_by_evernote) {
                        if(isAutoLaunch){
                            __readable_by_evernote__launch(win.document);
                            debug("后台加载 __readable_by_evernote__launch")
                        }else{
                            __readable_by_evernote.__readable_by_evernote__launch();
                        }
                    } else if (wrappedJS.X_readability) {
                        wrappedJS.X_readability();
                    } else {
                        // gBrowser.loadURI(READER_TOOL_URL);
                    }
                };

                if (wrappedJS.readx) {  // 小说阅读脚本
                    wrappedJS.readx();
                    // 如果小说阅读脚本没调用成功，则调用
                    setTimeout(function(){
                        var bodyName = win.document.body.getAttribute("name");
                        if(!bodyName || bodyName != "MyNovelReader"){
                            other_launch();
                        }
                    }, 500);
                    return;
                }

                other_launch();

            }, timer || 0);
        },
        launch_clearly: function(){
            __readable_by_evernote.readable_by_evernote__button__call();
        },
        launch_readability_cn: function(){
            if(content.wrappedJSObject.X_readability){
                content.wrappedJSObject.X_readability();
            }
        },
        launch_myNovelReader: function(){
            if(content.wrappedJSObject.readx){
                content.wrappedJSObject.readx();
            }
        },
        // launch_readability_online: function(){
        //     run_readability_online(content.document);
        // },
        iconClick: function(event){
            if (!event || !event.button) {
                autoReader.launch();
            } else if (event.button == 1) {
                middleButtonClicked();
            }
        },
        toggle: function() {
            if (this.AUTO_START) {
                this.AUTO_START = false;
                updateIcon();
            } else {
                this.AUTO_START = true;
                updateIcon();
            }
        },
        onPopupShowing: function(event) {
            var tabWindow;

            if (tabWindow = window.gBrowser.selectedTab.linkedBrowser.contentWindow) {
                return $('autoReader-autosite-textbox').value = tabWindow.location.href;
            }
        },
        showSettingDialog: function(xulBase64) {
            if (!xulBase64) {
                xulBase64 = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjw/eG1sLXN0eWxlc2hlZXQgaHJlZj0iY2hyb21lOi8vZ2xvYmFsL3NraW4vIiB0eXBlPSJ0ZXh0L2NzcyI/Pg0KPHdpbmRvdyB4bWxucz0iaHR0cDovL3d3dy5tb3ppbGxhLm9yZy9rZXltYXN0ZXIvZ2F0ZWtlZXBlci90aGVyZS5pcy5vbmx5Lnh1bCIgDQogICAgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiICB0aXRsZT0i6K6+572u6Ieq5Yqo5ZCv55So55qE56uZ54K5Ij4NCiAgICA8aGJveCBhbGlnbj0iY2VudGVyIiB0b29sdGlwdGV4dD0i5LiA6KGM5LiA5Liq572R5Z2A77yM5Zue6L2m6ZSu6L6T5YWl57uT5p6c77yM56S65L6L77yaaHR0cDovL3d3dy5jbmJldGEuY29tL2FydGljbGVzLyouaHRtIj4NCiAgICAgICAgPGxhYmVsIHZhbHVlPSLlvZPliY3nvZHlnYAiPjwvbGFiZWw+DQogICAgICAgIDx0ZXh0Ym94IGZsZXg9IjEiLz4NCiAgICAgICAgPGJ1dHRvbiBpZD0iYnRuX2VudGVyIiBsYWJlbD0i56Gu5a6aIiBvbmNvbW1hbmQ9ImJ0bl9lbnRlcl9jbGlja2VkKCk7Ii8+DQogICAgICAgIDxidXR0b24gaWQ9ImJ0bl9vcmlnaW5hbF91cmwiIGxhYmVsPSLljp/lp4vlnLDlnYAiLz4NCiAgICA8L2hib3g+DQogICAgPHRleHRib3ggaWQ9InVybHMiIG11bHRpbGluZT0idHJ1ZSIgZmxleD0iMSIvPg0KICAgIDxoYm94IGRpcj0icmV2ZXJzZSI+DQogICAgICAgIDxidXR0b24gaWQ9InNhdmUiIGxhYmVsPSLkv53lrZgiLz4NCiAgICA8L2hib3g+DQogICAgPHNjcmlwdD4NCiAgICAgICAgPCFbQ0RBVEFbDQoNCiAgICAgICAgdmFyIHVybF90ZXh0Ym94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigidGV4dGJveCIpOw0KICAgICAgICB2YXIgdXJsc190ZXh0Ym94ID0gJCgidXJscyIpOw0KICAgICAgICB2YXIgYnRuX2VudGVyID0gJCgiYnRuX2VudGVyIik7DQogICAgICAgIHZhciBidG5fb3JpZ2luYWxfdXJsID0gJCgiYnRuX29yaWdpbmFsX3VybCIpOw0KDQogICAgICAgIHZhciBsb2NhdGlvbkhyZWYgPSBvcGVuZXIuY29udGVudC5sb2NhdGlvbi5ocmVmOw0KDQogICAgICAgIC8vIOWvueWcsOWdgOi/m+ihjOeugOWNleWkhOeQhg0KICAgICAgICB2YXIgdmFsdWUgPSBsb2NhdGlvbkhyZWYucmVwbGFjZSgvI1teXC9dKiQvLCAiIik7DQogICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXC9bXlwvXSooXC5zP2h0bWw/fFwuYXNweCkkLywgIi8qJDEiKTsNCiAgICAgICAgdXJsX3RleHRib3gudmFsdWUgPSB2YWx1ZTsNCg0KICAgICAgICB1cmxfdGV4dGJveC5hZGRFdmVudExpc3RlbmVyKCJrZXl1cCIsIGZ1bmN0aW9uKGV2ZW50KXsNCiAgICAgICAgICAgIGlmKGV2ZW50LndoaWNoID09IDEzIHx8IGV2ZW50LmtleUNvZGUgPT0gMTMpew0KICAgICAgICAgICAgICAgIGJ0bl9lbnRlcl9jbGlja2VkKCk7DQogICAgICAgICAgICB9DQogICAgICAgIH0sIGZhbHNlKTsNCg0KICAgICAgICB1cmxzX3RleHRib3gudmFsdWUgPSBvcGVuZXIuYXV0b1JlYWRlci5BVVRPX1NJVEVfVEVYVA0KDQogICAgICAgIGJ0bl9vcmlnaW5hbF91cmwuc2V0QXR0cmlidXRlKCJ0b29sdGlwdGV4dCIsIGxvY2F0aW9uSHJlZik7DQogICAgICAgIGJ0bl9vcmlnaW5hbF91cmwuYWRkRXZlbnRMaXN0ZW5lcigiY29tbWFuZCIsIGZ1bmN0aW9uKCl7DQogICAgICAgICAgICB1cmxfdGV4dGJveC52YWx1ZSA9IGxvY2F0aW9uSHJlZjsNCiAgICAgICAgfSwgZmFsc2UpOw0KDQogICAgICAgICQoInNhdmUiKS5hZGRFdmVudExpc3RlbmVyKCJjb21tYW5kIiwgZnVuY3Rpb24oKXsNCiAgICAgICAgICAgIG9wZW5lci5hdXRvUmVhZGVyLkFVVE9fU0lURV9URVhUID0gdXJsc190ZXh0Ym94LnZhbHVlOw0KICAgICAgICAgICAgb3BlbmVyLmF1dG9SZWFkZXIuaGFuZGxlQXV0b1NpdGVUZXh0KCk7DQogICAgICAgICAgICBjbG9zZSgpOw0KICAgICAgICB9LCBmYWxzZSk7DQoNCiAgICAgICAgZnVuY3Rpb24gYnRuX2VudGVyX2NsaWNrZWQoKXsNCiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHVybF90ZXh0Ym94LnZhbHVlLnRyaW0oKTsNCiAgICAgICAgICAgIGlmKHZhbHVlKXsNCiAgICAgICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSB1cmxzX3RleHRib3gudmFsdWU7DQogICAgICAgICAgICAgICAgaWYobmV3VmFsdWUpew0KICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZSArPSAiXG4iOw0KICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICB1cmxzX3RleHRib3gudmFsdWUgPSBuZXdWYWx1ZSArIHVybF90ZXh0Ym94LnZhbHVlOw0KICAgICAgICAgICAgICAgIHVybF90ZXh0Ym94LnZhbHVlID0gIiI7DQogICAgICAgICAgICB9DQogICAgICAgIH0NCg0KICAgICAgICBmdW5jdGlvbiAkKGlkKSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7DQoNCiAgICAgICAgXV0+DQogICAgPC9zY3JpcHQ+DQo8L3dpbmRvdz4=";
            }
            window.openDialog("data:application/vnd.mozilla.xul+xml;charset=UTF-8;base64," + xulBase64,
                "name", "top=" + (window.screenY + 100) + ",left=" + (window.screenX + 50));
        },
        onAutoSiteButtonCommand: function(event) {
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

    ns.init();

    function updateIcon() {
        var newState = "";
        var checkautomenu = $("autoReader-AUTOSTART");

        if (ns.AUTO_START == false) {
            newState = "off";
            checkautomenu.setAttribute("checked", false);
        } else {
            newState = "on";
            checkautomenu.setAttribute("checked", true);
        }

        ns.icon.setAttribute("state", newState);
    }

    // 代码来自 __readable_by_evernote.__readable_by_evernote__launch
    function __readable_by_evernote__launch(doc){
        var
            _d = doc,
            _b = _d.getElementsByTagName('body')[0],
            _o = _d.getElementById('__readable_extension_definitions'),
            _l = _d.createElement('script')
        ;

        //  create, if not present

        //  ======================

        if (_o);
        else
        {

            _o = _d.createElement('dl');

            _o.setAttribute('style', 'display: none;');

            _o.setAttribute('id', '__readable_extension_definitions');

            _b.appendChild(_o);

        }

        //  set options

        //  ===========

        var
            _options = __readable_by_evernote.__get_saved__options(),

            _vars = __readable_by_evernote.__get_saved__vars(),

            _translations = __readable_by_evernote.__get_translations(),


            __definition_items_html = __readable_by_evernote.__get__stuffAsDefinitionItemsHTML

            ({

                'option': _options,

                'var': _vars,

                'translation': _translations

            })
        ;



        _o.innerHTML = __definition_items_html;
        

        //  launch in context

        //  =================

        _l.setAttribute('src', 'chrome://readable-by-evernote/content/js/__bookmarklet_to_inject.js');

        _l.className = 'bookmarklet_launch';

        _b.appendChild(_l);

        //  custom events

        //  =============

        __readable_by_evernote.__add_custom_events_handler();
    }

    function debug() { if(DEBUG) Application.console.log(Array.slice(arguments)); }

    function $(id) document.getElementById(id);

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

    function getFocusedWindow() {
        var win = document.commandDispatcher.focusedWindow;
        return (!win || win == window) ? content : win;
    }

    function wildcardToRegExpStr(urlstr) {
        if (urlstr.source) return urlstr.source;
        let reg = urlstr.replace(/[()\[\]{}|+.,^$?\\]/g, "\\$&").replace(/\*+/g, function(str) {
            return str === "*" ? ".*" : "[^/]*";
        });
        return "^" + reg + "$";
    }

})('\
#autoReaderButton[state="on"]{\
    list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABOUlEQVQ4jZ2TsUrDUBSGvxvzAg7qJA5BdBARI1ishYJ26uZLOBQtUpEMjhUr6KAgqC/gC7ipIKSCoiKOQTI4dnQ1N7kOkpomuZb6w4Fz7v3/w38O9wqlFAAV56UKbABzwBj56ACvQPO6Zd8DCKUUK9uP+4CjEeng3B4uHohyvV0FrgYUA4RAwYyCoPYPMcAQ0DAjKe30jXu+mmGX1m8yZwqKRijlaCglyYhhWRaWZXWbpnmRlONG9JP0RBIjy8fdvHNXy3DNKAi0Q/q+3+MGIM3/00EsijFstzLcviPMr1123eRx+zZI1p9vu7k76KB/upmZU7VnRFI+p7vOVC5+l5ZTJ+JJTJdPl4A2IHQuNPgCZoVSiqnSyQ6wB5gDiOueu3km4u88WThaALaAIjChEX4ALtB8f2h4AN/8SQfIa3maJAAAAABJRU5ErkJggg==);\
}\
#autoReaderButton[state="off"]{\
    list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABH0lEQVQ4jZ2TTU7DMBSEv2dyBlghFt4jJFggegROAklp07RSDlAJoSYNJRQuwg342YDEOossWPYKFcjdNLSJEwqMNJKfPfPm2ZLFGAPAKIpPgTZwAOxQjxnwDgwH/eAZQIwxjKLxJRA2mBpgwkE/uJJl8sPfzAB8AccOiPsPM8AWEDjAYfWkH/iWOoqTuiYthcg2IpS4hNYarfWqaVUnsqs2zXnmtr/X99PUOncEsTYL5HlemgagqlcIWKyYCpx7F5ZW2e5yQpzcrE1ja9XP9nJ9dzuxtApk9vsWVHSSKYS3qn98na7uX1Ov8VXiJD0BnmqiNmEO7Kte13sRCAU+696jgXOBTq/rZVJ852QyPQJ8oAXsNaR+AI/A0O+4GcAC/tBIHXgDrRwAAAAASUVORK5CYII=);\
}\
');


(function(){

function updateToolbar() {
    var toolbars = document.querySelectorAll("toolbar");
    Array.slice(toolbars).forEach(function(toolbar) {
        var currentset = toolbar.getAttribute("currentset");
        if (currentset.split(",").indexOf("autoReaderButton") < 0) return;
        toolbar.currentSet = currentset;
        try {
            BrowserToolboxCustomizeDone(true);
        } catch (ex) {}
    });
}

updateToolbar();

})();