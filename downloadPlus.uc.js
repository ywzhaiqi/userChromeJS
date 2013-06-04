// ==UserScript==
// @name           downloadPlus.uc.js
// @description    新建下载，删除文件，下载窗口（下载重命名 + 双击复制链接 + 另存为 + 保存并打开），完成下载提示音，自动关闭下载产生的空白标签
// @note           ywzhaiqi 修改整合（Alice0775、紫云飞）
// @include        chrome://browser/content/browser.xul
// @include        chrome://browser/content/places/places.xul
// @include        chrome://mozapps/content/downloads/unknownContentType.xul
// ==/UserScript==

(function() {

    switch (location.href) {
        case "chrome://browser/content/browser.xul":

            // 下载按钮右键点击新建下载
            newDownload_button();

            // DownloadsPanel 右键新增移除下载文件功能
            downloadsPanel_removeFile();

            //下载提示音
            download_sound_play();

            //自动关闭下载产生的空白标签
            autoClose_blankTab();

            break;
        case "chrome://browser/content/places/places.xul":

            // 书签窗口 "新建下载" 按钮
            newDownload_places();

            break;
        case "chrome://mozapps/content/downloads/unknownContentType.xul":

            // 下载改名
            download_dialog_changeName();

            // 下载另存为
            download_dialog_saveAs();

            // 下载弹出窗口双击链接复制完整链接
            download_dialog_showCompleteURL();

            break;
    }

    function download_sound_play() {
        var downloadPlaySound = {
            DL_START: "",
            DL_DONE: "file:///C:/WINDOWS/Media/chimes.wav", //设置响铃
            DL_CANCEL: "",
            DL_FAILED: "",

            observerService: null,
            init: function sampleDownload_init() {
                window.addEventListener("unload", this, false);
                this.observerService = Components.classes["@mozilla.org/observer-service;1"]
                    .getService(Components.interfaces.nsIObserverService);
                this.observerService.addObserver(this, "dl-start", false);
                this.observerService.addObserver(this, "dl-done", false);
                this.observerService.addObserver(this, "dl-cancel", false);
                this.observerService.addObserver(this, "dl-failed", false);
            },

            uninit: function() {
                window.removeEventListener("unload", this, false);
                this.observerService.removeObserver(this, "dl-start");
                this.observerService.removeObserver(this, "dl-done");
                this.observerService.removeObserver(this, "dl-cancel");
                this.observerService.removeObserver(this, "dl-failed");
            },

            observe: function(subject, topic, state) {
                var oDownload = subject.QueryInterface(Components.interfaces.nsIDownload);
                var oFile = null;
                try {
                    oFile = oDownload.targetFile;
                } catch (e) {
                    oFile = oDownload.target;
                }

                if (topic == "dl-start") {
                    if (this.DL_START)
                        this.playSoundFile(this.DL_START);
                }

                if (topic == "dl-cancel") {
                    if (this.DL_CANCEL) this.playSoundFile(this.DL_CANCEL);
                } else if (topic == "dl-failed") {
                    if (this.DL_FAILED) this.playSoundFile(this.DL_FAILED);
                } else if (topic == "dl-done") {
                    if (this.DL_DONE) this.playSoundFile(this.DL_DONE);
                }
            },

            playSoundFile: function(aFilePath) {
                var ios = Components.classes["@mozilla.org/network/io-service;1"]
                    .createInstance(Components.interfaces["nsIIOService"]);
                try {
                    var uri = ios.newURI(aFilePath, "UTF-8", null);
                } catch (e) {
                    return;
                }
                var file = uri.QueryInterface(Components.interfaces.nsIFileURL).file;
                if (!file.exists()) return;
                this.play(uri);
            },

            play: function(aUri) {
                var sound = Components.classes["@mozilla.org/sound;1"]
                    .createInstance(Components.interfaces["nsISound"]);
                sound.play(aUri);
            },

            handleEvent: function(event) {
                switch (event.type) {
                    case "load":
                        this.init();
                        break;
                    case "unload":
                        this.uninit();
                        break;
                }
            }
        };
        downloadPlaySound.init();
    }

    function newDownload_button() {
        var downloads_button_id = "downloads-button";
        var downloads_indicator_id = "downloads-indicator";

        addButtonListener(downloads_button_id);

        // 如果没成功
        if (!addButtonListener(downloads_indicator_id)) {
            var target = document.getElementById(downloads_button_id);

            var observer = new window.MutationObserver(function(mutations) {

                if (addButtonListener(downloads_indicator_id)) {
                    observer.disconnect();
                }
            });

            observer.observe(target, {
                attributes: true
            });
        }

        function addButtonListener(_buttonId) {
            var _button = document.getElementById(_buttonId);
            if (_button) {
                _button.removeEventListener("click", btnDownloads_Clicked, false);
                _button.addEventListener("click", btnDownloads_Clicked, false);
                return true;
            } else {
                return false;
            }

            function btnDownloads_Clicked(e) {
                if (e.button == 2 && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    open_newDownload_dialog();
                }
            }
        }
    }

    function downloadsPanel_removeFile() {
        var removeDownloadfile = {
            removeStatus: function() {
                var RMBtn = document.querySelector("#removeDownload");
                var state = document.querySelector("#downloadsListBox").selectedItems[0].getAttribute('state');
                RMBtn.setAttribute("disabled", "true");
                if (state != "0" && state != "4" && state != "5")
                    RMBtn.removeAttribute("disabled");
            },
            removeMenu: function() {
                try {
                    removeDownloadfile.removeStatus();
                } catch (e) {};
                if (document.querySelector("#removeDownload")) return;
                var menuitem = document.createElement("menuitem"),
                    rlm = document.querySelector('.downloadRemoveFromHistoryMenuItem');
                menuitem.setAttribute("label", rlm.getAttribute("label").indexOf("History") != -1 ? "Delete File" : "\u4ECE\u786C\u76D8\u4E2D\u5220\u9664");
                menuitem.setAttribute("id", "removeDownload");
                menuitem.onclick = function() {
                    var path = decodeURI(DownloadsView.richListBox.selectedItem.image)
                        .replace(/moz\-icon\:\/\/file\:\/\/\//, "").replace(/\?size\=32$/, "")
                        .replace(/\?size\=32\&state\=normal$/, "").replace(/\//g, "\\\\");
                    if (DownloadsView.richListBox.selectedItem.getAttribute('state') == "2") {
                        path = path + ".part";
                    }
                    var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                    file.initWithPath(path);
                    file.exists() && file.remove(0);
                    new DownloadsViewItemController(DownloadsView.richListBox.selectedItem).doCommand("cmd_delete");
                };
                document.querySelector("#downloadsContextMenu").appendChild(rlm);
                document.querySelector("#downloadsContextMenu").insertBefore(menuitem, rlm.nextSibling);
                removeDownloadfile.removeStatus();
            },
            Start: function() {
                document.querySelector("#downloadsContextMenu").addEventListener("popupshowing", this.removeMenu, false);
            }
        }
        try {
            eval("DownloadsPanel.showPanel = " + DownloadsPanel.showPanel.toString()
                .replace(/DownloadsPanel\.\_openPopupIfDataReady\(\)/, "{$&;removeDownloadfile\.Start\(\);}"));
        } catch (e) {}
    }

    function newDownload_places() {
        var button = document.querySelector("#placesToolbar").insertBefore(document.createElement("toolbarbutton"), document.querySelector("#clearDownloadsButton"));
        button.id = "createNewDownload";
        button.label = "新建下载";
        button.style.paddingRight = "9px";
        button.addEventListener("command", open_newDownload_dialog, false);
        window.addEventListener("click", function(e) {
            button.style.display = (document.getElementById("searchFilter").attributes.getNamedItem("collection").value == "downloads") ? "-moz-box" : "";
        }, false);
    }

    function open_newDownload_dialog() {
        window.openDialog("data:application/vnd.mozilla.xul+xml;charset=UTF-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPD94bWwtc3R5bGVzaGVldCBocmVmPSJjaHJvbWU6Ly9nbG9iYWwvc2tpbi8iIHR5cGU9InRleHQvY3NzIj8+Cjx3aW5kb3cgeG1sbnM9Imh0dHA6Ly93d3cubW96aWxsYS5vcmcva2V5bWFzdGVyL2dhdGVrZWVwZXIvdGhlcmUuaXMub25seS54dWwiIHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiB0aXRsZT0i5paw5bu65LiL6L295Lu75YqhIj4KICAgIDxoYm94IGFsaWduPSJjZW50ZXIiIHRvb2x0aXB0ZXh0PSJodHRwOi8vd3d3LmV4YW1wbGUuY29tL1sxLTEwMC0zXSAgKFvlvIDlp4st57uT5p2fLeS9jeaVsF0pIj4KICAgICAgICA8bGFiZWwgdmFsdWU9IuaJuemHj+S7u+WKoSI+PC9sYWJlbD4KICAgICAgICA8dGV4dGJveCBmbGV4PSIxIi8+CiAgICA8L2hib3g+CiAgICA8dGV4dGJveCBpZD0idXJscyIgbXVsdGlsaW5lPSJ0cnVlIiBmbGV4PSIxIi8+CiAgICA8aGJveCBkaXI9InJldmVyc2UiPgogICAgICAgIDxidXR0b24gbGFiZWw9IuW8gOWni+S4i+i9vSIvPgogICAgPC9oYm94PgogICAgPHNjcmlwdD4KICAgICAgICA8IVtDREFUQVsKICAgICAgICBmdW5jdGlvbiBQYXJzZVVSTHMoKSB7CiAgICAgICAgICAgIHZhciBiYXRjaHVybCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoInRleHRib3giKS52YWx1ZTsKICAgICAgICAgICAgaWYgKC9cW1xkKy1cZCsoLVxkKyk/XF0vLnRlc3QoYmF0Y2h1cmwpKSB7CiAgICAgICAgICAgICAgICBmb3IgKHZhciBtYXRjaCA9IGJhdGNodXJsLm1hdGNoKC9cWyhcZCspLShcZCspLT8oXGQrKT9cXS8pLCBpID0gbWF0Y2hbMV0sIGogPSBtYXRjaFsyXSwgayA9IG1hdGNoWzNdLCB1cmxzID0gW107IGkgPD0gajsgaSsrKSB7CiAgICAgICAgICAgICAgICAgICAgdXJscy5wdXNoKGJhdGNodXJsLnJlcGxhY2UoL1xbXGQrLVxkKygtXGQrKT9cXS8sIChpICsgIiIpLmxlbmd0aCA8IGsgPyAoZXZhbCgiMTBlIiArIChrIC0gKGkgKyAiIikubGVuZ3RoKSkgKyAiIikuc2xpY2UoMikgKyBpIDogaSkpOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcigiI3VybHMiKS52YWx1ZSA9IHVybHMuam9pbigiXG4iKTsKICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIiN1cmxzIikudmFsdWUgPSBiYXRjaHVybDsKICAgICAgICAgICAgfQogICAgICAgIH0KICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCJ0ZXh0Ym94IikuYWRkRXZlbnRMaXN0ZW5lcigia2V5dXAiLCBQYXJzZVVSTHMsIGZhbHNlKTsKICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCJidXR0b24iKS5hZGRFdmVudExpc3RlbmVyKCJjb21tYW5kIiwgZnVuY3Rpb24gKCkgewogICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCIjdXJscyIpLnZhbHVlLnNwbGl0KCJcbiIpLmZvckVhY2goZnVuY3Rpb24gKHVybCkgewogICAgICAgICAgICAgICAgb3BlbmVyLnNhdmVVUkwodXJsICwgbnVsbCwgbnVsbCwgbnVsbCwgdHJ1ZSwgbnVsbCwgZG9jdW1lbnQpOwogICAgICAgICAgICB9KTsKICAgICAgICAgICAgY2xvc2UoKQogICAgICAgIH0sIGZhbHNlKTsKICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCJ0ZXh0Ym94IikudmFsdWUgPSAob3BlbmVyLm9wZW5lciB8fCB3aW5kb3cub3BlbmVyKS5yZWFkRnJvbUNsaXBib2FyZCgpOwogICAgICAgIFBhcnNlVVJMcygpOwogICAgICAgIF1dPgogICAgPC9zY3JpcHQ+Cjwvd2luZG93Pg==",
            "name", "top=" + (window.screenY + 50) + ",left=" + (window.screenX + 50));
    }

    function download_dialog_showCompleteURL() {
        var s = document.querySelector("#source");
        s.value = dialog.mLauncher.source.spec;
        s.setAttribute("crop", "center");
        s.setAttribute("tooltiptext", dialog.mLauncher.source.spec);
        s.addEventListener("dblclick", function() {
            Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper).copyString(dialog.mLauncher.source.spec)
        }, false);
    }

    function download_dialog_changeName() {
        if (location != "chrome://mozapps/content/downloads/unknownContentType.xul") return;
        document.querySelector("#mode").addEventListener("select", function() {
            if (dialog.dialogElement("save").selected) {
                if (!document.querySelector("#locationtext")) {
                    var locationtext = document.querySelector("#location").parentNode.insertBefore(document.createElement("textbox"), document.querySelector("#location"));
                    locationtext.id = "locationtext";
                    locationtext.setAttribute("style", "margin-top:-2px;margin-bottom:-3px");
                    locationtext.value = document.querySelector("#location").value;
                }
                document.querySelector("#location").hidden = true;
                document.querySelector("#locationtext").hidden = false;
            } else {
                document.querySelector("#locationtext").hidden = true;
                document.querySelector("#location").hidden = false;
            }
        }, false)
        dialog.dialogElement("save").selected && dialog.dialogElement("save").click();
        window.addEventListener("dialogaccept", function() {
            if ((document.querySelector("#locationtext").value != document.querySelector("#location").value) && dialog.dialogElement("save").selected) {
                dialog.mLauncher.saveToDisk(dialog.promptForSaveToFile(dialog.mLauncher, window, document.querySelector("#locationtext").value), 1);
                dialog.onCancel = null;
                document.documentElement.removeAttribute("ondialogaccept");
            }
        }, false);
    }

    function download_dialog_saveAs() {
        var saveas = document.documentElement.getButton("extra1");
        saveas.setAttribute("hidden", "false");
        saveas.setAttribute("label", "\u53E6\u5B58\u4E3A");
        saveas.setAttribute("oncommand", 'var file=(dialog.promptForSaveToFileAsync||dialog.promptForSaveToFile).call(dialog,dialog.mLauncher,window,dialog.mLauncher.suggestedFileName,"",true);if(file){dialog.mLauncher.saveToDisk(file,1);dialog.onCancel=function(){};close()}');
    }

    function autoClose_blankTab() {
        eval("gBrowser.mTabProgressListener = " + gBrowser.mTabProgressListener.toString().replace(/(?=var location)/, '\
            if (aWebProgress.DOMWindow.document.documentURI == "about:blank"\
            && aRequest.QueryInterface(nsIChannel).URI.spec != "about:blank") {\
            aWebProgress.DOMWindow.setTimeout(function() {\
            !aWebProgress.isLoadingDocument && aWebProgress.DOMWindow.close();\
            }, 100);\
            }\
        '));
    }

})();


// saveAndOpen 保存并打开,学习IE9.这里的open方式和下载框里选择的打开方式无关.打开只是调用系统的默认程序.相当于下载完成后双击该文件图标.

location == "chrome://mozapps/content/downloads/unknownContentType.xul" && (function (s) {
    var saveAndOpen = document.getAnonymousElementByAttribute(document.querySelector("*"), "dlgtype", "extra2");
    saveAndOpen.parentNode.insertBefore(saveAndOpen,document.documentElement.getButton("accept").nextSibling.nextSibling);
    saveAndOpen.setAttribute("hidden", "false");
    saveAndOpen.setAttribute("label", "\u4FDD\u5B58\u5E76\u6253\u5F00");
    saveAndOpen.setAttribute("oncommand", 'Components.classes["@mozilla.org/browser/browserglue;1"].getService(Components.interfaces.nsIBrowserGlue).getMostRecentBrowserWindow().saveAndOpen.urls.push(dialog.mLauncher.source.asciiSpec);document.querySelector("#save").click();document.documentElement.getButton("accept").disabled=0;document.documentElement.getButton("accept").click()')
})()

location == "chrome://browser/content/browser.xul" && (function () {
    saveAndOpen = {
        urls: [],
        onStateChange: function (prog, req, flags, status, dl) {
            if (flags == 327696 && !! ~this.urls.indexOf(dl.source.spec)) {
                this.urls[this.urls.indexOf(dl.source.spec)] = "";
                Cc["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager).getDownload(Cc["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager).DBConnection.lastInsertRowID).targetFile.launch();
            }
        },
        onSecurityChange: function (prog, req, state, dl) {},
        onProgressChange: function (prog, req, prog, progMax, tProg, tProgMax, dl) {},
        onDownloadStateChange: function (state, dl) {}
    }
    Components.classes["@mozilla.org/download-manager;1"].getService(Components.interfaces.nsIDownloadManager).addListener(saveAndOpen);
})()