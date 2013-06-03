// ==UserScript==
// @name           autoLanuchReader.uc.js
// @description    自动启用 小说阅读脚本 或 Evernote Clealy 或 Readability
// @author         ywzhaiqi
// @namespace      ywzhaiqi@gmail.com
// @include        main
// @charset        UTF-8
// @version        0.0.2
// @note           脚本版不再更新，改为扩展版
// @note           2013/06/03 ver0.002 改用 Overlay
// @note           2013/06/02 ver0.001 js创建按钮
// ==/UserScript==

if (typeof window.autoReader != "undefined") {
    window.autoReader.unint();
    delete window.autoReader;
}

(function(css) {

    var reader_tools = [
        { name: "小说阅读脚本", wrapped_command: "readx" },
        { name: "Evernote Clealy", command: function(){ window.__readable_by_evernote.readable_by_evernote__button__call();} },
        { name: "Readability 脚本版", wrapped_command: "X_readability" },
        // 在线版
        { name: "Readability 在线版", url: "javascript:(function(){readStyle='style-newspaper';readSize='size-large';readMargin='margin-wide';_readability_script=document.createElement('SCRIPT');_readability_script.type='text/javascript';_readability_script.src='http://lab.arc90.com/experiments/readability/js/readability.js?x='+(Math.random());document.getElementsByTagName('head')%5B0%5D.appendChild(_readability_script);_readability_css=document.createElement('LINK');_readability_css.rel='stylesheet';_readability_css.href='http://lab.arc90.com/experiments/readability/css/readability.css';_readability_css.type='text/css';_readability_css.media='screen';document.getElementsByTagName('head')%5B0%5D.appendChild(_readability_css);_readability_print_css=document.createElement('LINK');_readability_print_css.rel='stylesheet';_readability_print_css.href='http://lab.arc90.com/experiments/readability/css/readability-print.css';_readability_print_css.media='print';_readability_print_css.type='text/css';document.getElementsByTagName('head')%5B0%5D.appendChild(_readability_print_css);})();"},
        { name: "Instapaper 在线版", url: "javascript:function%20iprl5(){var%20d=document,z=d.createElement('scr'+'ipt'),b=d.body,l=d.location;try{if(!b)throw(0);d.title='(Saving...)%20'+d.title;z.setAttribute('src',l.protocol+'//www.instapaper.com/j/H88Ks3SLLP21?u='+encodeURIComponent(l.href)+'&t='+(new%20Date().getTime()));b.appendChild(z);}catch(e){alert('Please%20wait%20until%20the%20page%20has%20loaded.');}}iprl5();void(0)"},
        { name: "Readable 在线版", url: "javascript:(function(){if(document.getElementsByTagName('html').length>0);else{return;}if(document.getElementsByTagName('body').length>0);else{return;}if(window.$readable);else{window.$readable={};window.$readable.path='http://readable-app.appspot.com/';}window.$readable.options={};window.$readable.options.base='better_readability';window.$readable.options.font_family='lucida';window.$readable.options.font_size='16';window.$readable.options.text_line_height='1_625';window.$readable.options.text_align='normal';window.$readable.options.text_image_align='center';window.$readable.options.text_box_width='30_em';window.$readable.options.text_box_align='center';window.$readable.options.text_box_outer_margin='1';window.$readable.options.text_box_inner_margin='2';window.$readable.options.color_theme='off_yellow_off_black';window.$readable.options.background_transparency='90';window.$readable.options.background_transparency_color='from_theme';window.$readable.options.video='strip';if(window.$readable.callScript){window.$readable.callScript();return;}if(document.getElementsByTagName('head').length>0);else{document.getElementsByTagName('html')[0].insertBefore(document.createElement('head'),document.getElementsByTagName('body')[0]);}document.getElementsByTagName('head')[0].appendChild(document.createElement('script')).setAttribute('src',window.$readable.path+'target.js?rand='+encodeURIComponent(Math.random()));})()"},
    ];

    //var EXAMPLE_AUTO_SITE_TEXT = function () {/*
    //    http://www.cnbeta.com/articles/*.htm
    //    http://www.zhuzhudao.com/txt/*
    //*/}.toString().replace("function () {/*", "").replace("*/}", "").trim();

    var AUTO_SITE_TEXT = "";
    var AUTO_START = true;
    var BUTTON_ID = "autoReaderButton";

    var ns = window.autoReader = {
        auto_sites_reg: [],
        button: null,
        currentMatch_siteText: "",

        get prefs() {
            delete this.prefs;
            return this.prefs = Services.prefs.getBranch("autoReader.");
        },
        get AUTO_START() AUTO_START,
        set AUTO_START(bool) {
            updateIcon();
            return AUTO_START = !! bool;
        },
        get AUTO_SITE_TEXT() AUTO_SITE_TEXT,
        set AUTO_SITE_TEXT(text) {
            this.handleAutoSiteText(text);
            AUTO_SITE_TEXT = text;
        },

        init: function() {

            ns.loadOverlay();

            ns.loadSetting();

            ns.handleAutoSiteText();

            // addEventListener
            gBrowser.mPanelContainer.addEventListener('DOMContentLoaded', this, true);
            window.addEventListener('unload', this, false);
        },
        uninit: function() {
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
                    if (this.AUTO_START) {
                        this.autoLaunch(event.target.defaultView);
                    }
                    break;
                case "unload":
                    this.uninit(event);
                    break;
            }
        },

        loadOverlay: function() {
             // addon-bar, urlbar-icons, nav-bar, PersonalToolbar
            var overlay = '\
                <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
                        xmlns:html="http://www.w3.org/1999/xhtml"> \
                    <toolbarpalette id="PersonalToolbar">\
                        <toolbarbutton id="' + BUTTON_ID + '" type="menu-button" class="toolbarbutton-1"\
                                state="on" label="autoReader" removable="true" \
                                onclick="autoReader.iconClick(event);" tooltiptext="点击启用阅读器"\
                                insertBefore="downloads-button" >\
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
                                        oncommand="event.stopPropagation();autoReader.showSettingDialog();" />\
                            </menupopup>\
                        </toolbarbutton>\
                    </toolbarpalette>\
                </overlay>';

            overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
            window.userChrome_js.loadOverlay(overlay, autoReader);

            ns.style = addStyle(css);
        },
        loadSetting: function(){
            ["AUTO_START"].forEach(function(name) {
                ns[name] = ns.prefs.getBoolPref(name);
            }, ns);

            ["AUTO_SITE_TEXT"].forEach(function(name) {
                ns[name] = ns.prefs.getCharPref(name);
            }, ns);
        },
        handleAutoSiteText: function(text) {
            var self = this;
            this.auto_sites_reg = [];

            var auto_sites = (text || this.AUTO_SITE_TEXT).split("\n");

            auto_sites.forEach(function(line) {
                line = line.trim();
                if (line) {
                    self.auto_sites_reg.push(wildcardToRegExpStr(line));
                }
            });
        },
        autoLaunch: function(win) {
            var locationHref = win.location.href;

            var sites = this.auto_sites_reg;
            this.currentMatch_siteText = "";

            for (var i = 0; i < sites.length; i++) {
                if (new RegExp(sites[i]).test(locationHref)) {
                    this.currentMatch_siteText = sites[i];
                    this.launch(win);
                    break;
                }
            }
        },
        launch: function(win, timer) {
            win = win || getFocusedWindow();

            win.setTimeout(function() {

                var wrappedJS = win.wrappedJSObject;

                // if (wrappedJS.readx) {
                //     wrappedJS.readx();
                // } else if (window.__readable_by_evernote) {
                //     window.__readable_by_evernote.readable_by_evernote__button__call();
                // } else if (wrappedJS.X_readability) {
                //     wrappedJS.X_readability();
                // } else {
                //      window.loadURI(reader_tools[0].url);
                // }

                for (var i = 0; i < reader_tools.length; i++) {
                    let cmd = reader_tools[i].wrapped_command;
                    if(cmd && wrappedJS[cmd.split(".")[0]]){
                        wrappedJS[cmd]();
                        return;
                    }

                    cmd = reader_tools[i].command;
                    if(cmd){
                        try{
                            cmd();
                        }catch(e){
                            continue;
                        }
                        return;
                    }

                    if(reader_tools[i].url){
                        window.loadURI(reader_tools[i].url);
                        return;
                    }
                }

            }, timer || 0);
        },
        iconClick: function(event){
            if(event.target.id != BUTTON_ID) return;

            if(event.button == 1){
                autoReader.launch();
            }else if (event.button == 2){
                // $("autoReader-menupopup").;
                event.preventDefault();
                event.stopPropagation();
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
                var value = this.currentMatch_siteText;
                if(!value){
                    value = tabWindow.location.href;
                }
                return $('autoReader-autosite-textbox').value = value;
            }
        },
        showSettingDialog: function(xulBase64) {
            if (!xulBase64) {
                xulBase64 = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjw/eG1sLXN0eWxlc2hlZXQgaHJlZj0iY2hyb21lOi8vZ2xvYmFsL3NraW4vIiB0eXBlPSJ0ZXh0L2NzcyI/Pg0KPHdpbmRvdyB4bWxucz0iaHR0cDovL3d3dy5tb3ppbGxhLm9yZy9rZXltYXN0ZXIvZ2F0ZWtlZXBlci90aGVyZS5pcy5vbmx5Lnh1bCIgd2lkdGg9IjUwMCIgaGVpZ2h0PSIzMDAiIA0KICAgIHRpdGxlPSLorr7nva7oh6rliqjlkK/nlKjnmoTnq5nngrkiPg0KICAgIDxoYm94IGFsaWduPSJjZW50ZXIiIHRvb2x0aXB0ZXh0PSLkuIDooYzkuIDkuKrnvZHlnYDvvIzlm57ovabplK7ovpPlhaXnu5PmnpzvvIznpLrkvovvvJpodHRwOi8vd3d3LmNuYmV0YS5jb20vYXJ0aWNsZXMvKi5odG0iPg0KICAgICAgICA8bGFiZWwgdmFsdWU9IuW9k+WJjeermeeCuee9keWdgCI+PC9sYWJlbD4NCiAgICAgICAgPHRleHRib3ggZmxleD0iMSIvPg0KICAgICAgICA8YnV0dG9uIGlkPSJidG5fb3JpZ2luYWxfdXJsIiBsYWJlbD0i5Y6f5aeL5Zyw5Z2AIi8+DQogICAgPC9oYm94Pg0KICAgIDx0ZXh0Ym94IGlkPSJ1cmxzIiBtdWx0aWxpbmU9InRydWUiIGZsZXg9IjEiLz4NCiAgICA8aGJveCBkaXI9InJldmVyc2UiPg0KICAgICAgICA8YnV0dG9uIGlkPSJzYXZlIiBsYWJlbD0i5L+d5a2YIi8+DQogICAgPC9oYm94Pg0KICAgIDxzY3JpcHQ+DQogICAgICAgIDwhW0NEQVRBWw0KDQogICAgICAgIHZhciB1cmxfdGV4dGJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoInRleHRib3giKTsNCiAgICAgICAgdmFyIHVybHNfdGV4dGJveCA9ICQoInVybHMiKTsNCiAgICAgICAgdmFyIGJ0bl9vcmlnaW5hbF91cmwgPSAkKCJidG5fb3JpZ2luYWxfdXJsIik7DQoNCiAgICAgICAgdmFyIGxvY2F0aW9uSHJlZiA9IG9wZW5lci5jb250ZW50LmxvY2F0aW9uLmhyZWY7DQoNCiAgICAgICAgLy8g5a+55Zyw5Z2A6L+b6KGM566A5Y2V5aSE55CGDQogICAgICAgIHZhciB2YWx1ZSA9IGxvY2F0aW9uSHJlZi5yZXBsYWNlKC8jW15cL10qJC8sICIiKTsNCiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cL1teXC9dKihcLnM/aHRtbD98XC5hc3B4KT8kLywgIi8qJDEiKTsNCiAgICAgICAgdXJsX3RleHRib3gudmFsdWUgPSB2YWx1ZTsNCg0KICAgICAgICB1cmxfdGV4dGJveC5hZGRFdmVudExpc3RlbmVyKCJrZXl1cCIsIGZ1bmN0aW9uKGV2ZW50KXsNCiAgICAgICAgICAgIGlmKGV2ZW50LndoaWNoID09IDEzIHx8IGV2ZW50LmtleUNvZGUgPT0gMTMpew0KICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHVybF90ZXh0Ym94LnZhbHVlLnRyaW0oKTsNCiAgICAgICAgICAgICAgICBpZih2YWx1ZSl7DQogICAgICAgICAgICAgICAgICAgIHVybHNfdGV4dGJveC52YWx1ZSArPSAiXG4iICsgdXJsX3RleHRib3gudmFsdWU7DQogICAgICAgICAgICAgICAgICAgIHVybF90ZXh0Ym94LnZhbHVlID0gIiI7DQogICAgICAgICAgICAgICAgfQ0KICAgICAgICAgICAgfQ0KICAgICAgICB9LCBmYWxzZSk7DQoNCiAgICAgICAgdXJsc190ZXh0Ym94LnZhbHVlID0gb3BlbmVyLmF1dG9SZWFkZXIuQVVUT19TSVRFX1RFWFQNCg0KICAgICAgICBidG5fb3JpZ2luYWxfdXJsLnNldEF0dHJpYnV0ZSgidG9vbHRpcHRleHQiLCBsb2NhdGlvbkhyZWYpOw0KICAgICAgICBidG5fb3JpZ2luYWxfdXJsLmFkZEV2ZW50TGlzdGVuZXIoImNvbW1hbmQiLCBmdW5jdGlvbigpew0KICAgICAgICAgICAgdXJsX3RleHRib3gudmFsdWUgPSBsb2NhdGlvbkhyZWY7DQogICAgICAgIH0sIGZhbHNlKTsNCg0KICAgICAgICAkKCJzYXZlIikuYWRkRXZlbnRMaXN0ZW5lcigiY29tbWFuZCIsIGZ1bmN0aW9uKCl7DQogICAgICAgICAgICBvcGVuZXIuYXV0b1JlYWRlci5BVVRPX1NJVEVfVEVYVCA9IHVybHNfdGV4dGJveC52YWx1ZTsNCiAgICAgICAgICAgIGNsb3NlKCk7DQogICAgICAgIH0sIGZhbHNlKTsNCg0KICAgICAgICBmdW5jdGlvbiAkKGlkKSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7DQoNCiAgICAgICAgXV0+DQogICAgPC9zY3JpcHQ+DQo8L3dpbmRvdz4=";
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
        var icon = $(BUTTON_ID);
        if(!icon) return;

        var state = "";
        // var tooltiptext = "";

        if (ns.AUTO_START == false) {
            // tooltiptext = "自动阅读器已关闭";
            state = "off";
        } else {
            // tooltiptext = "自动阅读器已启用";
            state = "on";
        }

        icon.setAttribute("state", state);
        // icon.setAttribute("tooltiptext", tooltiptext);
    }

    function debug() {
        Application.console.log(Array.slice(arguments));
    };

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

