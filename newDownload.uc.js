// ==UserScript==
// @name           新建下载
// @charset        utf-8
// @note           右键点击下载按钮弹出新建下载窗口，修改自紫云飞
// @include        chrome://browser/content/browser.xul
// @include        chrome://browser/content/places/places.xul
// ==/UserScript==


(function() {

    switch (location.href) {
        case "chrome://browser/content/browser.xul":

            // 下载按钮右键点击新建下载
            newDownload_main();

            break;
        case "chrome://browser/content/places/places.xul":

            // 书签窗口 "新建下载" 按钮
            newDownload_places();

            break;
    }

    function newDownload_main() {
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
        window.openDialog("data:application/vnd.mozilla.xul+xml;charset=UTF-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPD94bWwtc3R5bGVzaGVldCBocmVmPSJjaHJvbWU6Ly9nbG9iYWwvc2tpbi8iIHR5cGU9InRleHQvY3NzIj8+Cjx3aW5kb3cgeG1sbnM9Imh0dHA6Ly93d3cubW96aWxsYS5vcmcva2V5bWFzdGVyL2dhdGVrZWVwZXIvdGhlcmUuaXMub25seS54dWwiIHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiB0aXRsZT0i5paw5bu65LiL6L295Lu75YqhIj4KICAgIDxoYm94IGFsaWduPSJjZW50ZXIiIHRvb2x0aXB0ZXh0PSJodHRwOi8vd3d3LmV4YW1wbGUuY29tL1sxLTEwMC0zXSAgKFvlvIDlp4st57uT5p2fLeS9jeaVsF0pIj4KICAgICAgICA8bGFiZWwgdmFsdWU9IuaJuemHj+S7u+WKoSI+PC9sYWJlbD4KICAgICAgICA8dGV4dGJveCBmbGV4PSIxIi8+CiAgICA8L2hib3g+CiAgICA8dGV4dGJveCBpZD0idXJscyIgbXVsdGlsaW5lPSJ0cnVlIiBmbGV4PSIxIi8+CiAgICA8aGJveCBkaXI9InJldmVyc2UiPgogICAgICAgIDxidXR0b24gbGFiZWw9IuW8gOWni+S4i+i9vSIvPgogICAgPC9oYm94PgogICAgPHNjcmlwdD4KICAgICAgICA8IVtDREFUQVsKICAgICAgICBmdW5jdGlvbiBQYXJzZVVSTHMoKSB7CiAgICAgICAgICAgIHZhciBiYXRjaHVybCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoInRleHRib3giKS52YWx1ZTsKICAgICAgICAgICAgaWYgKC9cW1xkKy1cZCsoLVxkKyk/XF0vLnRlc3QoYmF0Y2h1cmwpKSB7CiAgICAgICAgICAgICAgICBmb3IgKHZhciBtYXRjaCA9IGJhdGNodXJsLm1hdGNoKC9cWyhcZCspLShcZCspLT8oXGQrKT9cXS8pLCBpID0gbWF0Y2hbMV0sIGogPSBtYXRjaFsyXSwgayA9IG1hdGNoWzNdLCB1cmxzID0gW107IGkgPD0gajsgaSsrKSB7CiAgICAgICAgICAgICAgICAgICAgdXJscy5wdXNoKGJhdGNodXJsLnJlcGxhY2UoL1xbXGQrLVxkKygtXGQrKT9cXS8sIChpICsgIiIpLmxlbmd0aCA8IGsgPyAoZXZhbCgiMTBlIiArIChrIC0gKGkgKyAiIikubGVuZ3RoKSkgKyAiIikuc2xpY2UoMikgKyBpIDogaSkpOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcigiI3VybHMiKS52YWx1ZSA9IHVybHMuam9pbigiXG4iKTsKICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIiN1cmxzIikudmFsdWUgPSBiYXRjaHVybDsKICAgICAgICAgICAgfQogICAgICAgIH0KICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCJ0ZXh0Ym94IikuYWRkRXZlbnRMaXN0ZW5lcigia2V5dXAiLCBQYXJzZVVSTHMsIGZhbHNlKTsKICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCJidXR0b24iKS5hZGRFdmVudExpc3RlbmVyKCJjb21tYW5kIiwgZnVuY3Rpb24gKCkgewogICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCIjdXJscyIpLnZhbHVlLnNwbGl0KCJcbiIpLmZvckVhY2goZnVuY3Rpb24gKHVybCkgewogICAgICAgICAgICAgICAgb3BlbmVyLnNhdmVVUkwodXJsICwgbnVsbCwgbnVsbCwgbnVsbCwgdHJ1ZSwgbnVsbCwgZG9jdW1lbnQpOwogICAgICAgICAgICB9KTsKICAgICAgICAgICAgY2xvc2UoKQogICAgICAgIH0sIGZhbHNlKTsKICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCJ0ZXh0Ym94IikudmFsdWUgPSAob3BlbmVyLm9wZW5lciB8fCB3aW5kb3cub3BlbmVyKS5yZWFkRnJvbUNsaXBib2FyZCgpOwogICAgICAgIFBhcnNlVVJMcygpOwogICAgICAgIF1dPgogICAgPC9zY3JpcHQ+Cjwvd2luZG93Pg==", "name", "top=" + (window.screenY + 50) + ",left=" + (window.screenX + 50));
    }

})();