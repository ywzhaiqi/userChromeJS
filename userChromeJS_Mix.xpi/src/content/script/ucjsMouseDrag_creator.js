var {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;

var checkSupport = (location.protocol !== 'chrome:');

MouseDrag = {
    quickDragTemplate: "",
    easyDragTemplate: "",
    superDragTemplate: "",
    install_rdf: "PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxSREYgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOmVtPSJodHRwOi8vd3d3Lm1vemlsbGEub3JnLzIwMDQvZW0tcmRmIyI+Cgk8RGVzY3JpcHRpb24gYWJvdXQ9InVybjptb3ppbGxhOmluc3RhbGwtbWFuaWZlc3QiPgoJCTxlbTppZD5EcmFnTmFtZUB6aXl1bmZlaTwvZW06aWQ+CgkJPGVtOnZlcnNpb24+MS4wPC9lbTp2ZXJzaW9uPgoJCTxlbTp0YXJnZXRBcHBsaWNhdGlvbj4KCQkJPERlc2NyaXB0aW9uPgoJCQkJPGVtOmlkPntlYzgwMzBmNy1jMjBhLTQ2NGYtOWIwZS0xM2EzYTllOTczODR9PC9lbTppZD4KCQkJCTxlbTptaW5WZXJzaW9uPjEuMDwvZW06bWluVmVyc2lvbj4KCQkJCTxlbTptYXhWZXJzaW9uPjEwLio8L2VtOm1heFZlcnNpb24+CgkJCTwvRGVzY3JpcHRpb24+CgkJPC9lbTp0YXJnZXRBcHBsaWNhdGlvbj4KCQk8ZW06bmFtZT5EcmFnTmFtZTwvZW06bmFtZT4KCQk8ZW06ZGVzY3JpcHRpb24+RHJhZ05hbWU8L2VtOmRlc2NyaXB0aW9uPgoJCTxlbTpjcmVhdG9yPue0q+S6kemjnjwvZW06Y3JlYXRvcj4KCTwvRGVzY3JpcHRpb24+CjwvUkRGPg==",
    chrome_manifest: "Y29udGVudCBEcmFnTmFtZSAuLwpvdmVybGF5IGNocm9tZTovL2Jyb3dzZXIvY29udGVudC9icm93c2VyLnh1bCBjaHJvbWU6Ly9EcmFnTmFtZS9jb250ZW50L292ZXJsYXkueHVs",
    overlay_xul: "PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxvdmVybGF5IHhtbG5zPSJodHRwOi8vd3d3Lm1vemlsbGEub3JnL2tleW1hc3Rlci9nYXRla2VlcGVyL3RoZXJlLmlzLm9ubHkueHVsIj4KCTxzY3JpcHQ+CgkJPCFbQ0RBVEFbIAp3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigibG9hZCIsZnVuY3Rpb24oKXsKLy8vCn0sZmFsc2UpCgkJXV0+Cgk8L3NjcmlwdD4KPC9vdmVybGF5Pg==",
    selectedDragStyle: [],

    // added by me
    init: function() {
        this['quickDragTemplate'] = this.getTemplate('quickDragTemplate');
        this['easyDragTemplate'] = this.getTemplate('easyDragTemplate');
        this['superDragTemplate'] = this.getTemplate('superDragTemplate');
    },
    getTemplate: function(name) {
        var file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties)
                .get("ProfD", Ci.nsILocalFile);
        file.append('extensions');
        file.append('userChromeJS@mozdev.org');
        file.append('content');
        file.append('script');
        file.append('tpl');
        file.append(name + '.js');

        // 替换 window 换行符
        var str = loadText(file).replace(/\r\n/g, '\n');
        // str = utf8_to_b64(str);
        return str;
    },

    changeDragCommand: function() {
        var arr = {
            t: "text",
            i: "image",
            l: "link"
        };
        Array.filter($("#dragCommand")[0].options, function(o) {
            return !(!!~o.value.toLowerCase().indexOf(arr[$("#dragStyle").val().length > 1 ? $("#dragStyle").val().slice(1, 2) : $("#dragStyle").val().slice(-1)]) ? o.style.display = "" : o.style.display = "none");
        })[0].selected = true;
    },
    changeDragStyle: function() {
        Array.filter($("#dragStyle")[0].options, function(o) {
            return !(o.style.display = (($("#easydrag:checked").length ? /^e/ : $("#superdrag:checked").length ? /^p/ : /^[^ep]/).test(o.value) ? "" : "none"));
        })[0].selected = true;
        MouseDrag.changeDragCommand();
    },
    openChrome: function() {
        try {
            checkSupport && netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("UChrm", Components.interfaces.nsILocalFile).reveal();
        } catch (e) {
            alert("about:config中signed.applets.codebase_principal_support禁止了该行为");
        }
    },
    saveUC: function() {
        var data = $("#MouseDragScript").val();
        if (!data) {
            alert("内容不能为空");
            return;
        }
        try {
            checkSupport && netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        } catch (e) {
            alert("about:config中 signed.applets.codebase_principal_support 禁止了该行为");
            return;
        }

        var filename = $("#quickdrag:checked").length ? "QuickDrag" : $("#easydrag:checked").length ? "EasyDrag" : "SuperDrag";
        var SCRIPTS_FOLDER = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties)
                .get("UChrm", Components.interfaces.nsILocalFile);

        var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
        fp.init(window, "另存为", Ci.nsIFilePicker.modeSave);
        fp.appendFilter("uc脚本文件", "*.uc.js;*.uc.xul");
        fp.appendFilters(Ci.nsIFilePicker.filterAll);
        fp.displayDirectory = SCRIPTS_FOLDER;
        fp.defaultExtension = ".uc.js";
        fp.defaultString = (filename  + ".uc.js");

        var res = fp.show();
        if (res != Ci.nsIFilePicker.returnCancel) {
            var file = fp.file;

            var suConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
            suConverter.charset = 'UTF-8';
            data = suConverter.ConvertFromUnicode(data);

            var foStream = Components.classes['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
            foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
            foStream.write(data, data.length);
            foStream.close();

            // alert('已经成功保存 "' + file.leafName + '" 到 chrome 目录下');
        }
    },
    makeXPI: function() {
        if (!$("#dragStyle").val()) {
            alert("请先选择");
        }
        try {
            checkSupport && netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        } catch (e) {
            alert("about:config中 signed.applets.codebase_principal_support 禁止了该行为");
            return;
        }
        var zipW = new Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter")();
        var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("DeskP", Components.interfaces.nsILocalFile);
        var xpiname = $("#quickdrag:checked").length ? "QuickDrag" : $("#easydrag:checked").length ? "EasyDrag" : "SuperDrag";
        file.append(xpiname + ".xpi");
        zipW.open(file, 44);
        var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
        converter.charset = "UTF-8";
        zipW.addEntryStream("install.rdf", Components.interfaces.nsIZipWriter.COMPRESSION_DEFAULT, null, converter.convertToInputStream(decodeURIComponent(escape(atob(this.install_rdf))).replace(/DragName/g, xpiname)), false);
        zipW.addEntryStream("chrome.manifest", Components.interfaces.nsIZipWriter.COMPRESSION_DEFAULT, null, converter.convertToInputStream(decodeURIComponent(escape(atob(this.chrome_manifest))).replace(/DragName/g, xpiname)), false);
        zipW.addEntryStream("overlay.xul", Components.interfaces.nsIZipWriter.COMPRESSION_DEFAULT, null, converter.convertToInputStream(decodeURIComponent(escape(atob(this.overlay_xul))).replace(/\/\/\//g, $("#MouseDragScript").val())), false);
        zipW.close();

        file.reveal();
    },
    generateScript: function() {
        if (!$("#dragStyle").val())
            return;
        if ($("#superdrag:checked").length) {
            this.selectedDragStyle[$("#dragStyle").val()] = $("#dragStyle").val().slice(2).toUpperCase() + ':{' + "\n//" + this[$("#dragCommand").val()].name + '\nname:"' + this[$("#dragCommand").val()].name.replace(/[^\u0000-\u00FF]/g, function($0) {
                return "\\u" + $0.charCodeAt(0).toString(16);
            }) + '",\ncmd:' + this[$("#dragCommand").val()].cmd.toString().replace("(", "(event,self") + '\n},'
            // var script = decodeURIComponent(escape(atob(this.superDragTemplate)));
            var script = this.superDragTemplate;
            $("#MouseDragScript").val(js_beautify(script.replace("//T", [this.selectedDragStyle[i]
                for (i in this.selectedDragStyle)
                    if (/^pt/.test(i))
            ].join("")).replace("//I", [this.selectedDragStyle[i]
                for (i in this.selectedDragStyle)
                    if (/^pi/.test(i))
            ].join("")).replace("//L", [this.selectedDragStyle[i]
                for (i in this.selectedDragStyle)
                    if (/^pl/.test(i))
            ].join(""))));
        } else {
            this.selectedDragStyle[$("#dragStyle").val()] = "//" + this[$("#dragCommand").val()].name + "\n" + this[$("#dragCommand").val()].cmd.toString().split("\n").slice(1, -1).join("\n");
            if ($("#quickdrag:checked").length) {
                // var script = decodeURIComponent(escape(atob(this.quickDragTemplate)));
                var script = this.quickDragTemplate
            } else {
                // var script = decodeURIComponent(escape(atob(this.easyDragTemplate)));
                var script = this.easyDragTemplate;
            }
            for (i in this.selectedDragStyle) {
                script = script.replace("//" + i, this.selectedDragStyle[i]);
            }

            $("#MouseDragScript").val(js_beautify(script.replace(/.+[\t ]*\n[\t ]*\/\/...?\n.+\n.+/g, "").replace(/\/\/.\n/g, "")));
        }
        $("#dragStyle")[0].options[$("#dragStyle")[0].selectedIndex].style.backgroundColor = "pink";
        $("#dragCommand")[0].options[$("#dragCommand")[0].selectedIndex].style.backgroundColor = "pink";
        $("#dragStyle")[0].selectedIndex++;
        MouseDrag.changeDragCommand();
        $("#MouseDragScriptLineNum").text("行数:" + ($("#MouseDragScript").val().match(/\n/g).length + 1));
        if ($("#quickdrag:checked").length && $("#dragStyle").val().length > 2) {
            $("#dragStyle")[0].selectedIndex = -1;
        }
        if (($("#easydrag:checked").length) && /^[^e]/.test($("#dragStyle").val())) {
            $("#dragStyle")[0].selectedIndex = -1;
        }
        if (($("#superdrag:checked").length) && /^[^p]/.test($("#dragStyle").val())) {
            $("#dragStyle")[0].selectedIndex = -1;
        }
    },
    clear: function() {
        this.selectedDragStyle = {};
        this.changeDragStyle();
        this.changeDragCommand();

        $("#dragStyle > option").css('backgroundColor', '');
        $("#dragCommand > option").css('backgroundColor', '');
        $("#MouseDragScript").val('');
    },

    openImage: {
        name: "当前标签打开图片",
        cmd: function() {
            loadURI(event.dataTransfer.getData("application/x-moz-file-promise-url"));
        }
    },
    newTabOpenImage: {
        name: "新标签打开图片(前台)",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab(event.dataTransfer.getData("application/x-moz-file-promise-url"));
        }
    },
    newTabOpenImageBG: {
        name: "新标签打开图片(后台)",
        cmd: function() {
            gBrowser.addTab(event.dataTransfer.getData("application/x-moz-file-promise-url"));
        }
    },
    openImageLK: {
        name: "当前标签打开图片链接",
        cmd: function() {
            loadURI(event.dataTransfer.getData("text/x-moz-url").split("\n")[0]);
        }
    },
    newTabOpenImageLk: {
        name: "新标签打开图片链接(前台)",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab(event.dataTransfer.getData("text/x-moz-url").split("\n")[0]);
        }
    },
    newTabOpenImageLkBG: {
        name: "新标签打开图片链接(后台)",
        cmd: function() {
            gBrowser.addTab(event.dataTransfer.getData("text/x-moz-url").split("\n")[0]);
        }
    },
    copyImageURL: {
        name: "复制图片地址",
        cmd: function() {
            Components.classes['@mozilla.org/widget/clipboardhelper;1'].createInstance(Components.interfaces.nsIClipboardHelper).copyString(event.dataTransfer.getData("application/x-moz-file-promise-url"));
        }
    },
    copyImageContents: {
        name: "复制图片",
        cmd: function() {
            (document.popupNode = content.document.createElement('img')).src = event.dataTransfer.getData("application/x-moz-file-promise-url");
            goDoCommand('cmd_copyImageContents');
        }
    },
    saveImage: {
        name: "下载图片",
        cmd: function() {
            saveImageURL(event.dataTransfer.getData("application/x-moz-file-promise-url"), null, null, null, null, null, document);
        }
    },
    saveImageSkipPrompt: {
        name: "下载图片(不弹窗)",
        cmd: function() {
            saveImageURL(event.dataTransfer.getData("application/x-moz-file-promise-url"), null, null, null, true, null, document);
        }
    },
    saveImageSomeWhereSkipPrompt: {
        name: "下载图片(指定位置不弹窗)",
        cmd: function() {
            var path = "c:";
            var uri = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI(event.dataTransfer.getData("application/x-moz-file-promise-url"), null, null)
            var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(path);
            file.append(getDefaultFileName(null, uri));
            internalSave(null, null, null, null, null, null, null, {
                file: file,
                uri: uri
            }, null, internalSave.length === 12 ? document : true, internalSave.length === 12 ? true : null, null);
        }
    },
    searchImageBD: {
        name: "搜索相似图片(baidu)",
        cmd: function() {
            gBrowser.addTab('http://stu.baidu.com/i?rt=0&rn=10&ct=1&tn=baiduimage&objurl=' + encodeURIComponent(event.dataTransfer.getData("application/x-moz-file-promise-url")));
        }
    },
    searchImageGG: {
        name: "搜索相似图片(Google)",
        cmd: function() {
            gBrowser.addTab('http://www.google.com/searchbyimage?image_url=' + encodeURIComponent(event.dataTransfer.getData("application/x-moz-file-promise-url")));
        }
    },
    searchImageSG: {
        name: "搜索相似图片(sougou)",
        cmd: function() {
            gBrowser.addTab('http://pic.sogou.com/ris?query=' + encodeURIComponent(event.dataTransfer.getData("application/x-moz-file-promise-url")));
        }
    },
    searchImageTE: {
        name: "搜索相似图片(tineye)",
        cmd: function() {
            gBrowser.addTab('http://www.tineye.com/search/?pluginver=firefox-1.0&sort=size&order=desc&url=' + encodeURIComponent(event.dataTransfer.getData("application/x-moz-file-promise-url")));
        }
    },
    searchImageAll: {
        name: "搜索相似图片(全部引擎)",
        cmd: function() {
            gBrowser.addTab('http://www.tineye.com/search/?pluginver=firefox-1.0&sort=size&order=desc&url=' + encodeURIComponent(event.dataTransfer.getData("application/x-moz-file-promise-url")));
            gBrowser.addTab('http://stu.baidu.com/i?rt=0&rn=10&ct=1&tn=baiduimage&objurl=' + encodeURIComponent(event.dataTransfer.getData("application/x-moz-file-promise-url")));
            gBrowser.addTab('http://www.google.com/searchbyimage?image_url=' + encodeURIComponent(event.dataTransfer.getData("application/x-moz-file-promise-url")));
            gBrowser.addTab('http://pic.sogou.com/ris?query=' + encodeURIComponent(event.dataTransfer.getData("application/x-moz-file-promise-url")));
        }
    },
    openLink: {
        name: "当前标签打开链接",
        cmd: function() {
            loadURI(event.dataTransfer.getData("text/x-moz-url").split("\n")[0]);
        }
    },
    newTabOpenLink: {
        name: "新标签打开链接(前台)",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab(event.dataTransfer.getData("text/x-moz-url").split("\n")[0]);
        }
    },
    newTabOpenLinkBG: {
        name: "新标签打开链接(后台)",
        cmd: function() {
            gBrowser.addTab(event.dataTransfer.getData("text/x-moz-url").split("\n")[0]);
        }
    },

    searchLink: {
        name: "搜索框搜索链接文字(前台)",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab();
            BrowserSearch.loadSearch(event.dataTransfer.getData("text/x-moz-url").split("\n")[1], false);
        }
    },
    searchLinkBG: {
        name: "搜索框搜索链接文字(后台)",
        cmd: function() {
            BrowserSearch.loadSearch(event.dataTransfer.getData("text/x-moz-url").split("\n")[1], true);
        }
    },
    searchLinkGG: {
        name: "Google搜索链接文字(前台)",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab('http://www.google.com/search?q=' + encodeURIComponent(event.dataTransfer.getData("text/x-moz-url").split("\n")[1]));
        }
    },
    searchLinkGGBG: {
        name: "Google搜索链接文字(后台)",
        cmd: function() {
            gBrowser.addTab('http://www.google.com/search?q=' + encodeURIComponent(event.dataTransfer.getData("text/x-moz-url").split("\n")[1]));
        }
    },
    searchLinkBD: {
        name: "baidu搜索链接文字(前台)",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab('http://www.baidu.com/s?wd=' + event.dataTransfer.getData("text/x-moz-url").split("\n")[1]);
        }
    },
    searchLinkBDBG: {
        name: "baidu搜索链接文字(后台)",
        cmd: function() {
            gBrowser.addTab('http://www.baidu.com/s?wd=' + event.dataTransfer.getData("text/x-moz-url").split("\n")[1]);
        }
    },
    copyLink: {
        name: "复制链接",
        cmd: function() {
            Components.classes['@mozilla.org/widget/clipboardhelper;1'].createInstance(Components.interfaces.nsIClipboardHelper).copyString(event.dataTransfer.getData("text/x-moz-url").split("\n")[0]);
        }
    },
    copyLinkName: {
        name: "复制链接文字",
        cmd: function() {
            Components.classes['@mozilla.org/widget/clipboardhelper;1'].createInstance(Components.interfaces.nsIClipboardHelper).copyString(event.dataTransfer.getData("text/x-moz-url").split("\n")[1]);
        }
    },
    saveLink: {
        name: "下载链接",
        cmd: function() {
            saveImageURL(event.dataTransfer.getData("text/x-moz-url").split("\n")[0], null, null, null, null, null, document);
        }
    },
    saveLinkSkipPrompt: {
        name: "下载链接(不弹窗)",
        cmd: function() {
            saveImageURL(event.dataTransfer.getData("text/x-moz-url").split("\n")[0], null, null, null, true, null, document);
        }
    },
    // searchText: {
    //     name: "搜索框搜索选中文字(前台)",
    //     cmd: function() {
    //         gBrowser.selectedTab = gBrowser.addTab();
    //         BrowserSearch.loadSearch(event.dataTransfer.getData("text/unicode"), false);
    //     }
    // },
    // searchTextBG: {
    //     name: "搜索框搜索选中文字(后台)",
    //     cmd: function() {
    //         BrowserSearch.loadSearch(event.dataTransfer.getData("text/unicode"), true);
    //     }
    // },
    searchTextNotURI: {
        name: "搜索框搜索选中文字(前台)[识别URL并打开]",
        cmd: function() {
            (self.seemAsURL(event.dataTransfer.getData("text/unicode")) && (gBrowser.selectedTab = gBrowser.addTab(event.dataTransfer.getData("text/unicode")))) || ((gBrowser.selectedTab = gBrowser.addTab()) & BrowserSearch.loadSearch(event.dataTransfer.getData("text/unicode"), false));
        }
    },
    searchTextNotURIBG: {
        name: "搜索框搜索选中文字(后台)[识别URL并打开]",
        cmd: function() {
            (self.seemAsURL(event.dataTransfer.getData("text/unicode")) && gBrowser.addTab(event.dataTransfer.getData("text/unicode"))) || BrowserSearch.loadSearch(event.dataTransfer.getData("text/unicode"), true);
        }
    },
    searchTextPopup: {
        name: "弹出搜索框(前台)",
        cmd: function() {
            var popup = document.getAnonymousElementByAttribute(document.querySelector("#searchbar").searchButton, "anonid", "searchbar-popup");
            var text = event.dataTransfer.getData("text/unicode");
            var serach = function() {
                popup.removeEventListener("command", serach, false);
                popup.removeEventListener("popuphidden", closeSerach, false)
                setTimeout(function(selectedEngine) {
                    gBrowser.selectedTab = gBrowser.addTab();
                    BrowserSearch.loadSearch(text, false);
                    popup.querySelectorAll("#" + selectedEngine.id)[0].click();
                }, 10, popup.querySelector("*[selected=true]"))
            }
            var closeSerach = function() {
                popup.removeEventListener("command", serach, false);
                popup.removeEventListener("popuphidden", closeSerach, false)
            }
            popup.addEventListener("command", serach, false)
            popup.addEventListener("popuphidden", closeSerach, false)
            popup.openPopup(null, null, event.screenX - 100, event.screenY - 100);
        }
    },
    searchTextPopupBG: {
        name: "弹出搜索框(后台)",
        cmd: function() {
            var popup = document.getAnonymousElementByAttribute(document.querySelector("#searchbar").searchButton, "anonid", "searchbar-popup");
            var text = event.dataTransfer.getData("text/unicode");
            var serach = function() {
                popup.removeEventListener("command", serach, false);
                popup.removeEventListener("popuphidden", closeSerach, false)
                setTimeout(function(selectedEngine) {
                    BrowserSearch.loadSearch(text, true);
                    popup.querySelectorAll("#" + selectedEngine.id)[0].click();
                }, 10, popup.querySelector("*[selected=true]"))
            }
            var closeSerach = function() {
                popup.removeEventListener("command", serach, false);
                popup.removeEventListener("popuphidden", closeSerach, false)
            }
            popup.addEventListener("command", serach, false)
            popup.addEventListener("popuphidden", closeSerach, false)
            popup.openPopup(null, null, event.screenX - 100, event.screenY - 100);
        }
    },
    // searchTextGG: {
    //     name: "Google搜索选中文字(前台)",
    //     cmd: function() {
    //         gBrowser.selectedTab = gBrowser.addTab('http://www.google.com/search?q=' + encodeURIComponent(event.dataTransfer.getData("text/unicode")));
    //     }
    // },
    // searchTextGGBG: {
    //     name: "Google搜索选中文字(后台)",
    //     cmd: function() {
    //         gBrowser.addTab('http://www.google.com/search?q=' + encodeURIComponent(event.dataTransfer.getData("text/unicode")));
    //     }
    // },
    // searchTextBD: {
    //     name: "baidu搜索选中文字(前台)",
    //     cmd: function() {
    //         gBrowser.selectedTab = gBrowser.addTab('http://www.baidu.com/s?wd=' + event.dataTransfer.getData("text/unicode"));
    //     }
    // },
    // searchTextBDBG: {
    //     name: "baidu搜索选中文字(后台)",
    //     cmd: function() {
    //         gBrowser.addTab('http://www.baidu.com/s?wd=' + event.dataTransfer.getData("text/unicode"));
    //     }
    // },
    searchTextNotURIGG: {
        name: "Google搜索选中文字(前台)[识别URL并打开]",
        cmd: function() {
            (self.seemAsURL(event.dataTransfer.getData("text/unicode")) && (gBrowser.selectedTab = gBrowser.addTab(event.dataTransfer.getData("text/unicode")))) || (gBrowser.selectedTab = gBrowser.addTab('http://www.google.com/search?q=' + encodeURIComponent(event.dataTransfer.getData("text/unicode"))));
        }
    },
    searchTextNotURIGGBG: {
        name: "Google搜索选中文字(后台)[识别URL并打开]",
        cmd: function() {
            (self.seemAsURL(event.dataTransfer.getData("text/unicode")) && gBrowser.addTab(event.dataTransfer.getData("text/unicode"))) || gBrowser.addTab('http://www.google.com/search?q=' + encodeURIComponent(event.dataTransfer.getData("text/unicode")));
        }
    },
    searchTextNotURIBD: {
        name: "baidu搜索选中文字(前台)[识别URL并打开]",
        cmd: function() {
            (self.seemAsURL(event.dataTransfer.getData("text/unicode")) && (gBrowser.selectedTab = gBrowser.addTab(event.dataTransfer.getData("text/unicode")))) || (gBrowser.selectedTab = gBrowser.addTab('http://www.baidu.com/s?wd=' + event.dataTransfer.getData("text/unicode")));
        }
    },
    searchTextNotURIBDBG: {
        name: "baidu搜索选中文字(后台)[识别URL并打开]",
        cmd: function() {
            (self.seemAsURL(event.dataTransfer.getData("text/unicode")) && gBrowser.addTab(event.dataTransfer.getData("text/unicode"))) || gBrowser.addTab('http://www.baidu.com/s?wd=' + event.dataTransfer.getData("text/unicode"));
        }
    },
    
    searchTextInSite: {
        name: "搜索框搜索选中文字(站内)(前台)",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab();
            BrowserSearch.loadSearch("site:" + content.location.host + " " + event.dataTransfer.getData("text/unicode"), false);
        }
    },
    searchTextInSiteBG: {
        name: "搜索框搜索选中文字(站内)(后台)",
        cmd: function() {
            BrowserSearch.loadSearch("site:" + content.location.host + " " + event.dataTransfer.getData("text/unicode"), true);
        }
    },
    searchTextInSiteGG: {
        name: "Google搜索选中文字(站内)(前台)",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab('http://www.google.com/search?q=' + "site:" + content.location.host + " " + encodeURIComponent(event.dataTransfer.getData("text/unicode")));
        }
    },
    searchTextInSiteGGBG: {
        name: "Google搜索选中文字(站内)(后台)",
        cmd: function() {
            gBrowser.addTab('http://www.google.com/search?q=' + "site:" + content.location.host + " " + encodeURIComponent(event.dataTransfer.getData("text/unicode")));
        }
    },
    searchTextInSiteBD: {
        name: "baidu搜索选中文字(站内)(前台)",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab('http://www.baidu.com/s?wd=' + "site:" + content.location.host + " " + event.dataTransfer.getData("text/unicode"));
        }
    },
    searchTextInSiteBDBG: {
        name: "baidu搜索选中文字(站内)(后台)",
        cmd: function() {
            gBrowser.addTab('http://www.baidu.com/s?wd=' + "site:" + content.location.host + " " + event.dataTransfer.getData("text/unicode"));
        }
    },
    copyText: {
        name: "复制文本",
        cmd: function() {
            Components.classes['@mozilla.org/widget/clipboardhelper;1'].createInstance(Components.interfaces.nsIClipboardHelper).copyString(event.dataTransfer.getData("text/unicode"));
        }
    },
    transText: {
        name: "Google翻译文本",
        cmd: function() {
            var div = content.document.documentElement.appendChild(content.document.createElement("div"));
            div.style.cssText = "position:absolute;z-index:1000;border-left:solid 0.5px #0000AA;border-top:solid 1px #0000AA;border-right:solid 2.5px #0000AA;border-bottom:solid 2px #0000AA;background-color:white;padding-left:5px;padding: 1pt 3pt 1pt 3pt;font-size: 10pt;color: black;left:" + +(event.clientX + content.scrollX + 10) + 'px;top:' + +(event.clientY + content.scrollY + 10) + "px";
            var xmlhttp = new XMLHttpRequest;
            xmlhttp.open("get", "http://translate.google.cn/translate_a/t?client=t&hl=zh-CN&sl=auto&tl=zh-CN&text=" + event.dataTransfer.getData("text/unicode"), 0);
            xmlhttp.send();
            div.textContent = eval("(" + xmlhttp.responseText + ")")[0][0][0];
            content.addEventListener("click", function() {
                content.removeEventListener("click", arguments.callee, false);
                div.parentNode.removeChild(div);
            }, false);
        }
    },
    openText: {
        name: "按URL打开文本",
        cmd: function() {
            gBrowser.selectedTab = gBrowser.addTab(event.dataTransfer.getData("text/unicode"));
        }
    },
    searchBarOpenText: {
        name: "打开查找栏搜索文本",
        cmd: function() {
            gFindBar._findField.value = event.dataTransfer.getData("text/unicode");
            gFindBar.open();
            gFindBar.toggleHighlight(1);
        }
    },
    searchBarHideText: {
        name: "不打开查找栏搜索文本",
        cmd: function() {
            gFindBar._findField.value = event.dataTransfer.getData("text/unicode");
            gFindBar.toggleHighlight(1);
        }
    },
    saveText: {
        name: "下载文字",
        cmd: function() {
            saveImageURL('data:text/plain;charset=UTF-8;base64,' + btoa(unescape(encodeURIComponent(event.dataTransfer.getData("text/unicode")))), event.dataTransfer.getData("text/unicode").slice(0, 5) + ".txt", null, null, null, null, document);
        }
    },
    saveTextSkipPrompt: {
        name: "下载文字(不弹窗)",
        cmd: function() {
            saveImageURL('data:text/plain;charset=UTF-8;base64,' + btoa(unescape(encodeURIComponent(event.dataTransfer.getData("text/unicode")))), event.dataTransfer.getData("text/unicode").slice(0, 5) + ".txt", null, null, true, null, document);
        }
    },
}

$(function() {
    $("#superdrag").parent().after('<br/><b id="MouseDragScriptLineNum" style="float:right">行数:0</b><br/><textarea spellcheck="false" style="background-color:#000000;color: #FFFFFF;width:100%;height:500px" id="MouseDragScript"></textarea>');
    [i
        for (i in MouseDrag)
            if (MouseDrag[i].toString() == "[object Object]")
    ].map(
        function(key) {
            $("#dragCommand").append('<option value="' + key + '">' + MouseDrag[key].name + '</option>')
        })
    $("#easydrag").attr("checked", true);
    $("#easydrag").click();
    $("#dragCommand").parent().after('<label style="color:white">' + $("#dragCommand>*").length + '</label>');
})


function loadText(aFile) {
    if (!aFile.exists() || !aFile.isFile()) return null;
    var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
    var sstream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
    fstream.init(aFile, -1, 0, 0);
    sstream.init(fstream);
    var data = sstream.read(sstream.available());
    try { data = decodeURIComponent(escape(data)); } catch(e) {}
    sstream.close();
    fstream.close();
    return data;
}

function utf8_to_b64( str ) {
  return window.btoa(unescape(encodeURIComponent( str )));
}

function b64_to_utf8( str ) {
  return decodeURIComponent(escape(window.atob( str )));
}


MouseDrag.init();