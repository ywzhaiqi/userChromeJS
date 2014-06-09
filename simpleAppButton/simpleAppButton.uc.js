// ==UserScript==
// @name           simpleAppButton.uc.js
// @namespace      ywzhaiqi@gmail.com
// @description    launch application by left click, middle click, right click，可移动的按钮。
// @note           第一次启动需从定制窗口中拖出按钮
// @include        main
// @charset        UTF-8
// ==/UserScript==

location == "chrome://browser/content/browser.xul" && (function() {

    // 依次为鼠标左键、中键、右键点击启动程序的路径。支持相对和绝对路径
    var left_click_path = "\\chrome";
    var middle_click_path = "C:\\Program Files\\Internet Explorer\\IEXPLORE.EXE";
    var right_click_path = "C:\\Windows\\notepad.exe";

    // 按钮图标
    var image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADcklEQVQ4jWWT7U+aBxTFn+/8LfswkqbTJWucMZuN6zTrXupmUzur9X2uIGq164xWFOO68PJIsYCo6GQIxaFF0cegRkBofKhWoKXosCjVDbvalgS9Zx/arJv7JTc3J7nnfjqHYY6hNbuEPfopVmdbDGqt8wda6/yBzra43qOfYrVml/D4/T/IDA5Bm2ZCrRzl0m4+BE8gDE8gDO+b7Q6EoTJx6VbNhFpmcAj+YxbJDILKLhOnveOisRkPxpxuMjvdMDvdr/WMl8ZmvBib8ZLO5qKyjmFOJDO8fVLV/au6QWWBVG+HvHcYS9+VIVz1Ce43n8Mwq0CHdhxS/W9vxo4GlYVKO4bUDMMwTGWXWZhdrUx/06LF100aGqgpx37dO3Rw6wRemN4jF1sMjb2NamU/40KLgr6VdqFcJqfsakW6+PqAkDnbMsievMQis0yNzEsqLDeexgtzBlIrp5AKZ6H/thgPnv6IhY0voPflo8FZgDOSGzhZIsdp8W2WyW8yhIQVOsqsG0FeTR/tKzLwjMuiV+FsvNzJpX7zLfy+b6LVnatwhM9Q1+x5ZFzuoxNV/cgV6ULMqVpd6oN6M3KabCi8akQ7a4TS7IJmyA5W1YY5fhI7z514uKfAfPRzXBttRI7EiqwGK96vMaSYHIk59dG1u5R3/S4qjH5S8nF4t5L05NlLDE77qddqgXZyhIycEnJrPV3sMeJTKUd5bU58KLGkmKJuZyhfyqGgfRpiexgdy1uYeryH4O5zjEw7cPiKx/7TO0hsiHAQyUWZeg6FrAef9SzgnNQZYkrkC+zZmwtU0ruEclOI6rkNKPk4WdbimFsepMODARz91UxHu7lY95dQsf4eig08FfZ6UXRzgWXEWp/wS4U7XT7E44IxgPO/rODi+BrE06tIxktx9EcBjrazcPjwXZhmf0KlJYgKUxBFfffSlVrf62iLR1fVl03rVDsRoStzG7iytElidwTWFSVtrn+FROBj8npK0TK7TN9PRVFte0R1o6vqt1E28ALR+CNONBujRk8crfcT6A7toieUwI21J2jmY2jwxyDxbEHsikE0+ZgTGfhjfXDwgtbFmLrJu53uXt8lTTQJw2aS9JtJsNE/qTO4iyb/dvqHxZha5Dhm/jddvriwcy3BKiN7IXYjmVJFkyl5ZC/U+SDBtvvi/6vz31LBdk6sWYzpAAAAAElFTkSuQmCC";

    // 按钮的属性
    var buttonAttrs = {
        id: "mAppButton-1",
        class: "toolbarbutton-1 chromeclass-toolbar-additional",
        label: "自定义启动程序按钮",
        tooltiptext: "左键点击启动，右键点击启动",
        removable: "true",
        image: image
    };


    /* 设置区结束  */
	// 来自 User Agent Overrider 扩展
    const log = function() { dump(Array.slice(arguments).join(' ') + '\n'); };
    const trace = function(error) { log(error); log(error.stack); };
    const ToolbarManager = (function() {

        /**
         * Remember the button position.
         * This function Modity from addon-sdk file lib/sdk/widget.js, and
         * function BrowserWindow.prototype._insertNodeInToolbar
         */
        let layoutWidget = function(document, button, isFirstRun) {

            // Add to the customization palette
            let toolbox = document.getElementById('navigator-toolbox');
            toolbox.palette.appendChild(button);

            // Search for widget toolbar by reading toolbar's currentset attribute
            let container = null;
            let toolbars = document.getElementsByTagName('toolbar');
            let id = button.getAttribute('id');
            for (let i = 0; i < toolbars.length; i += 1) {
                let toolbar = toolbars[i];
                if (toolbar.getAttribute('currentset').indexOf(id) !== -1) {
                    container = toolbar;
                }
            }

            // if widget isn't in any toolbar, default add it next to searchbar
            if (!container) {
                if (isFirstRun) {
                    container = document.getElementById('nav-bar');
                } else {
                    return;
                }
            }

            // Now retrieve a reference to the next toolbar item
            // by reading currentset attribute on the toolbar
            let nextNode = null;
            let currentSet = container.getAttribute('currentset');
            let ids = (currentSet === '__empty') ? [] : currentSet.split(',');
            let idx = ids.indexOf(id);
            if (idx !== -1) {
                for (let i = idx; i < ids.length; i += 1) {
                    nextNode = document.getElementById(ids[i]);
                    if (nextNode) {
                        break;
                    }
                }
            }

            // Finally insert our widget in the right toolbar and in the right position
            container.insertItem(id, nextNode, null, false);

            // Update DOM in order to save position
            // in this toolbar. But only do this the first time we add it to the toolbar
            if (ids.indexOf(id) === -1) {
                container.setAttribute('currentset', container.currentSet);
                document.persist(container.id, 'currentset');
            }
        };

        let addWidget = function(window, widget, isFirstRun) {
            try {
                layoutWidget(window.document, widget, isFirstRun);
            } catch(error) {
                trace(error);
            }
        };

        let removeWidget = function(window, widgetId) {
            try {
                let widget = window.document.getElementById(widgetId);
                widget.parentNode.removeChild(widget);
            } catch (error) {
                trace(error);
            }
        };

        let exports = {
            addWidget: addWidget,
            removeWidget: removeWidget,
        };
        return exports;
    })();

    var PROFILE_PATH = Components.classes['@mozilla.org/file/directory_service;1']
        .getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsILocalFile)
        .path;

    var appButton = $C('toolbarbutton', buttonAttrs);
    appButton.addEventListener("click", function(event) {
        if (event.button == 0) {
            exec(handlePath(left_click_path));
        } else if (event.button == 1) {
            exec(handlePath(middle_click_path));
        } else if (event.button == 2) {
            exec(handlePath(right_click_path));
        }
    }, false);


    ToolbarManager.addWidget(window, appButton, false);


    function handlePath(path) {
        path = path.replace(/\//g, '\\').toLocaleLowerCase();
        if (/^(\\)/.test(path)) {
            return PROFILE_PATH + path;
        }

        return path;
    }

    function exec(path, args) {
        args = args || [];
        var args_t = args.slice(0);
        for (var i = 0; i < args_t.length; i++) {
            args_t[i] = args_t[i].replace(/%u/g, gBrowser.currentURI.spec);
        }

        var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
        file.initWithPath(path);
        if (!file.exists()) {
            Cu.reportError('File Not Found: ' + path);
            return;
        }

        if (!file.isExecutable()) {
            file.launch();
        } else {
            var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
            process.init(file);
            process.run(false, args_t, args_t.length);
        }
    }

    function $C(name, attr) {
        var el = document.createElement(name);
        if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
        return el;
    }
})()