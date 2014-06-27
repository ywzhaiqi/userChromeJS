// ==UserScript==
// @name           externalFuncButtonM.uc.js
// @description    实用工具按钮 
// @include        main
// @author         lastdream2013
// @charset        UTF-8
// @version        2014-6-26 修改为外置规则可重载版本 By ywzhaiqi
// @version        20130616.0.13 minor fix
// @version        20130511.0.11 tidy and merge moveable code 
// @version        20130507 0.1 first release 
// ==/UserScript==

var gExternalFuncButtonM = {
    autohideEmptySubDirs: true,  //自动隐藏没有一个子项目的子目录菜单
    moveSubDirstoBottom: false,  //把主菜单下的子目录移动到最下面
    moveablePositonOrInsertafter: true, //true : ToolbarPalette moveable button  false: insert appbutton in "insertafter" 
    insertafter: 'urlbar-icons',  // useless if moveablePositonOrInsertafter is true;  urlbar-icons addon-bar TabsToolbar alltabs-button
    get FILE() {
        let aFile = Services.dirsvc.get("UChrm", Ci.nsILocalFile);
        //aFile.appendRelativePath("Local\\_externalFuncButtonM.js");
        aFile.appendRelativePath("_externalFuncButtonM.js");
        delete this.FILE;
        return this.FILE = aFile;
    },
    toolbar: {},  // 已移到外部文件中

    subdirPopupHash : [],
    subdirMenuHash : [],
    _externalFuncPopup : null,
    _isready : false,
    unescapeHTML : function(input) {
            return input.replace(/&amp;/g, '&')
          .replace(/&quot;/g, '\"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&apos;/g, '\'')
          .replace(/([^\\])\\([^\\])/g, '$1\\\\$2');
    },
    init : function () {

        var ExternalFuncBtn = document.createElement('toolbarbutton');
        ExternalFuncBtn.id = "ExternalFuncButtonM-ID";
        ExternalFuncBtn.setAttribute("label", "扩展小功能按钮");
        // ExternalFuncBtn.setAttribute("onclick", "");
        ExternalFuncBtn.setAttribute("tooltiptext", "扩展小功能按钮,可以自定义小函数功能。\n中键重载，右键编辑");
        ExternalFuncBtn.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
        ExternalFuncBtn.setAttribute("type", "menu");
        ExternalFuncBtn.setAttribute("removable", "true");
        ExternalFuncBtn.setAttribute("image", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAACrklEQVQokQXBe0zMAQDA8Z9l/jClsGmNlqlGKafuSKl2YXFmY8iM0TzaaHMreYy1NqXHpXaTUtxYXVd6yDyqo066U10q0kOdmhCyS653d1Jfn4+wyPE1vkE9uIs1eAbl4i0tZJW3grDQHMJ9lBx1LSHaS0+ok4ZDIa1I/PUsdSlGkGz5RLsJPvyE3inom4WhWbCNw5/GWagFHgLVYH4JP3pA5F+EIF5XwcQklBoryNLHkFF/nuLGS5SpDqOUeaJZJaLcYRO1kh3kSHYzYZwj0Ps8QvB6FZYRUFaeQdkSSl7vIZ50RdL0aB/qMHtaXNz4stydpmULyHOyA10/x0JiEfZtVjMyDKqGs9w17eV2t5x72ot0lF2nxE/Mr5X7wVHGoP1Smj3WQv0fjm+8gLBTrGLgO2QZ5KS3H0HRmsld3QM6nuWTHxBK2xIpQ4v86F9uR7WrA+jMnPGLR/AV59A3BmmGVG52J3OjrY4sQwMFBclkHvBHFyjinWglxhCB4m0LGa3sJMLvKoLbZhWmOYh7msdlvZpTZZ0kaAcpqNFgNqmh/T68iAPDQTClwwjIxMkIKyQPaZ6Gi8+MxNV2cUID8TWg0FbSb6mGsRL4mgS/omEsH2ZA4puN4LFHS9M0RBXVE6P9yOlSOFdh42qVio6/BVim0rBOxGCdj2LQkoF5CkRBdxAcxQrqfoO8ooj4xkouGb4Sq9OjeB+HiSuYbRGMTkmxsocBWyzfmcZnVwLCmm136JyB1JpXyMsLiVTrOKkpI8OYRNtkCsOTCQx8iWRkPobPtlz6/sFq6TWEjYFaOn/Am2/QPA5ts2AYhffjMDQDWGFuGOaYZ2Ac3prBa38VwmJ7FVKZAfctybgFpbI2vBrngMe4SrLZGpzLVrdUpJ4pbA9OZENgIt6y5wjOt/gPKhYkm4yP4hgAAAAASUVORK5CYII=");
        ExternalFuncBtn.addEventListener('click', function(event){
            switch(event.button) {
                case 0:
                    break;
                case 1:
                    setTimeout(function(){
                        gExternalFuncButtonM.rebuild(true);
                    }, 10);
                    break;
                case 2:
                    gExternalFuncButtonM.edit(gExternalFuncButtonM.FILE);
                    break;
            }
    
            event.preventDefault();
            event.stopPropagation();
        }, false);

        var ExternalFuncPopup = document.createElement('menupopup');
        ExternalFuncPopup.setAttribute('onpopupshowing', 'event.stopPropagation();gExternalFuncButtonM.onpopupshowing();');
        this._externalFuncPopup = ExternalFuncPopup;
        ExternalFuncBtn.appendChild(ExternalFuncPopup);
        setTimeout(function () { //延时加载菜单，不对启动造成影响，也不影响第一次打开菜单时的响应速度
            gExternalFuncButtonM.rebuild();
        }, 1000);
        document.insertBefore(document.createProcessingInstruction('xml-stylesheet', 'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(
        '\
            #ExternalFuncButtonM-ID {\
            -moz-appearance: none !important;\
            border-style: none !important;\
            border-radius: 0 !important;\
            padding: 0 3px !important;\
            margin: 0 !important;\
            background: transparent !important;\
            box-shadow: none !important;\
            -moz-box-align: center !important;\
            -moz-box-pack: center !important;\
            min-width: 18px !important;\
            min-height: 18px !important;\
            }\
            #ExternalFuncButtonM-ID > .toolbarbutton-icon {\
                max-width: 18px !important;\
                padding: 0 !important;\
                margin: 0 !important;\
            }\
            #ExternalFuncButtonM-ID dropmarker{display: none !important;}\
        ') + '"'), document.documentElement);

        if (this.moveablePositonOrInsertafter) {
            var navigator = document.getElementById("navigator-toolbox");
            if (!navigator || navigator.palette.id !== "BrowserToolbarPalette")
                return;
            document.getElementById("urlbar-icons").appendChild(ExternalFuncBtn);
            this.updateToolbar();
        } else {
            var navigator = document.getElementById(this.insertafter);
            if (!navigator)
                return;
            navigator.parentNode.insertBefore(ExternalFuncBtn, navigator.previousSibling);
        }
    },
    rebuild: function(isAlert) {
        var aFile = this.FILE;
        if (!aFile || !aFile.exists() || !aFile.isFile()) {
            this.log(aFile? aFile.path : "配置文件");
            return;
        }

        var data = this.loadText(aFile);
        var sandbox = new Cu.Sandbox( new XPCNativeWrapper(window) );
        sandbox.Components = Components;
        sandbox.Cc = Cc;
        sandbox.Ci = Ci;
        sandbox.Cr = Cr;
        sandbox.Cu = Cu;
        sandbox.Services = Services;
        sandbox.locale = Services.prefs.getCharPref("general.useragent.locale");

        try {
            Cu.evalInSandbox(data, sandbox, "1.8");
        } catch (e) {
            this.alert("Error: " + e + "\n请重新检查配置文件.");
            return this.log(e);
        }

        if (sandbox.toolbar) {
            this.toolbar = sandbox.toolbar;
        } else {
            this.alert('配置文件中 toolbar 不存在');
            return;
        }

        this.loadSubMenu();

        if (isAlert) this.alert("配置已经重新载入");
    },
    loadSubMenu : function () {
        // if (this._isready)
            // return;

        if (this._externalFuncPopup == null)
            return;
        var ExternalFuncPopup = this._externalFuncPopup;

        // remove
        for (var i = ExternalFuncPopup.childNodes.length - 1; i >= 0; i--) {
            ExternalFuncPopup.removeChild(ExternalFuncPopup.childNodes[i]);
        }

        for (var i = 0; i < this.toolbar.subdirs.length; i++) {
            if (this.toolbar.subdirs[i].name == 'separator') {
                ExternalFuncPopup.appendChild(document.createElement('menuseparator'));
            } else {
                var subDirItem = ExternalFuncPopup.appendChild(document.createElement('menu'));
                var subDirItemPopup = subDirItem.appendChild(document.createElement('menupopup'));
                subDirItem.setAttribute('class', 'menu-iconic');
                subDirItem.setAttribute('label', this.toolbar.subdirs[i].name);
                subDirItem.setAttribute('image', this.toolbar.subdirs[i].image);
                gExternalFuncButtonM.subdirPopupHash[this.toolbar.subdirs[i].name] = subDirItemPopup;
                gExternalFuncButtonM.subdirMenuHash[this.toolbar.subdirs[i].name] = subDirItem;
            }
        }

        for (var i = 0; i < this.toolbar.configs.length; i++) {
            let configItems;
            if (this.toolbar.configs[i].name == 'separator') {
                configItems = document.createElement('menuseparator');
            } else {
                configItems = ExternalFuncPopup.appendChild(document.createElement('menuitem'));
                configItems.setAttribute('class', 'menuitem-iconic');
                configItems.setAttribute('label', this.toolbar.configs[i].name);
                configItems.setAttribute('image', this.toolbar.configs[i].image);
                if (typeof this.toolbar.configs[i].command == 'function') {
                    configItems.setAttribute('oncommand', this.unescapeHTML(this.toolbar.configs[i].command.toSource()) + '.call(this, event);');
                } else {
                    configItems.setAttribute('oncommand', this.toolbar.configs[i].command);
                }
                configItems.setAttribute('tooltiptext', this.toolbar.configs[i].name);
            }
            if (this.toolbar.configs[i].subdir && gExternalFuncButtonM.subdirPopupHash[this.toolbar.configs[i].subdir])
                gExternalFuncButtonM.subdirPopupHash[this.toolbar.configs[i].subdir].appendChild(configItems);
            else
                ExternalFuncPopup.appendChild(configItems);
        }

        if (this.autohideEmptySubDirs) {
            for (let[name, popup]in Iterator(gExternalFuncButtonM.subdirPopupHash)) {
                if (popup.hasChildNodes()) {
                    continue;
                } else {
                    gExternalFuncButtonM.subdirMenuHash[name].setAttribute("hidden", "true");
                }
            }
        }

        if (this.moveSubDirstoBottom) {
            let i = ExternalFuncPopup.childNodes.length;
            while (ExternalFuncPopup.firstChild.getAttribute('class') != 'menuitem-iconic' && i-- != 0) {
                ExternalFuncPopup.appendChild(ExternalFuncPopup.firstChild);
            }
        }
        // this._isready = true;
    },
    onpopupshowing : function () {
        // if (!this._isready)
        //     this.loadSubMenu();
    },
    updateToolbar: function () {
        let toolbars = Array.slice(document.querySelectorAll('#navigator-toolbox > toolbar'));
        toolbars.forEach(function (toolbar) {
            var currentset = toolbar.getAttribute("currentset");
            if (currentset.split(",").indexOf("ExternalFuncButtonM-ID") < 0)
                return;
            toolbar.currentSet = currentset;
            try {
                BrowserToolboxCustomizeDone(true);
            } catch (ex) {}
        });
    },
    edit: function(aFile) {
        if (!aFile || !aFile.exists() || !aFile.isFile()) return;
        var editor;
        try {
            editor = Services.prefs.getComplexValue("view_source.editor.path", Ci.nsILocalFile);
        } catch(e) {}
        
        if (!editor || !editor.exists()) {
            alert("编辑器的路径未设置!!!\n请设置 view_source.editor.path");
            toOpenWindowByType('pref:pref', 'about:config?filter=view_source.editor.path');
            return;
        }

        var UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
        UI.charset = window.navigator.platform.toLowerCase().indexOf("win") >= 0? "gbk": "UTF-8";
        var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);

        try {
            var path = UI.ConvertFromUnicode(aFile.path);
            var args = [path];
            process.init(editor);
            process.run(false, args, args.length);
        } catch (e) {
            alert("编辑器路径不正确");
        }
    },
    loadText: function(aFile) {
        var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
        var sstream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
        fstream.init(aFile, -1, 0, 0);
        sstream.init(fstream);

        var data = sstream.read(sstream.available());
        try { data = decodeURIComponent(escape(data)); } catch(e) {}
        sstream.close();
        fstream.close();
        return data;
    },
    alert: function(aString, aTitle) {
        Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService)
            .showAlertNotification("", aTitle||"addMenu" , aString, false, "", null);
    },
    log: function() {
        Application.console.log(Array.slice(arguments));
    },
};

    gExternalFuncButtonM.init();
