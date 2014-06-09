uc 脚本代码总览
==============

用于 uc 脚本或 Firefox 扩展。

- [使用剪贴板 | MDN](https://developer.mozilla.org/zh-CN/docs/Using_the_Clipboard)


代码片段
-------

### 头部

```js
const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
const NS_XUL = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
```

### Utils

```js
// 来自 User Agent Overrider 扩展
const Utils = (function() {

    const sbService = Cc['@mozilla.org/intl/stringbundle;1']
                         .getService(Ci.nsIStringBundleService);
    const windowMediator = Cc['@mozilla.org/appshell/window-mediator;1']
                              .getService(Ci.nsIWindowMediator);

    let localization = function(id, name) {
        let uri = 'chrome://' + id + '/locale/' + name + '.properties';
        return sbService.createBundle(uri).GetStringFromName;
    };

    let setAttrs = function(widget, attrs) {
        for (let [key, value] in Iterator(attrs)) {
            widget.setAttribute(key, value);
        }
    };

    let getMostRecentWindow = function(winType) {
        return windowMediator.getMostRecentWindow(winType);
    };

    let exports = {
        localization: localization,
        setAttrs: setAttrs,
        getMostRecentWindow: getMostRecentWindow,
    };
    return exports;
})();
```

### StyleManager

```js
// 来自 User Agent Overrider 扩展
const StyleManager = (function() {

    const styleService = Cc['@mozilla.org/content/style-sheet-service;1']
                            .getService(Ci.nsIStyleSheetService);
    const ioService = Cc['@mozilla.org/network/io-service;1']
                         .getService(Ci.nsIIOService);

    const STYLE_TYPE = styleService.USER_SHEET;

    const new_nsiURI = function(uri) ioService.newURI(uri, null, null);

    let uris = [];

    let load = function(uri) {
        let nsiURI = new_nsiURI(uri);
        if (styleService.sheetRegistered(nsiURI, STYLE_TYPE)) {
            return;
        }
        styleService.loadAndRegisterSheet(nsiURI, STYLE_TYPE);
        uris.push(uri);
    };

    let unload = function(uri) {
        let nsiURI = new_nsiURI(uri);
        if (!styleService.sheetRegistered(nsiURI, STYLE_TYPE)) {
            return;
        }
        styleService.unregisterSheet(nsiURI, STYLE_TYPE);
        let start = uris.indexOf(uri);
        uris.splice(start, 1);
    };

    let destory = function() {
        for (let uri of uris.slice(0)) {
            unload(uri);
        }
        uris = null;
    };

    let exports = {
        load: load,
        unload: unload,
        destory: destory,
    };
    return exports;
})();
```

### BrowserManager

```js
// 来自 User Agent Overrider 扩展
const BrowserManager = (function() {

    const windowWatcher = Cc['@mozilla.org/embedcomp/window-watcher;1']
                             .getService(Ci.nsIWindowWatcher);

    const BROWSER_URI = 'chrome://browser/content/browser.xul';

    let listeners = [];

    let onload = function(event) {
        for (let listener of listeners) {
            let window = event.currentTarget;
            window.removeEventListener('load', onload);
            if (window.location.href !== BROWSER_URI) {
                return;
            }
            try {
                listener(window);
            } catch(error) {
                trace(error);
            }
        }
    };

    let observer = {
        observe: function(window, topic, data) {
            if (topic !== 'domwindowopened') {
                return;
            }
            window.addEventListener('load', onload);
        }
    };

    let run = function(func, uri) {
        let enumerator = windowWatcher.getWindowEnumerator();
        while (enumerator.hasMoreElements()) {
            let window = enumerator.getNext();
            if (window.location.href !== BROWSER_URI) {
                continue;
            }

            try {
                func(window);
            } catch(error) {
                trace(error);
            }
        }
    };

    let addListener = function(listener) {
        listeners.push(listener);
    };

    let removeListener = function(listener) {
        let start = listeners.indexOf(listener);
        if (start !== -1) {
            listeners.splice(start, 1);
        }
    };

    let initialize = function() {
        windowWatcher.registerNotification(observer);
    };

    let destory = function() {
        windowWatcher.unregisterNotification(observer);
        listeners = null;
    };

    initialize();

    let exports = {
        run: run,
        addListener: addListener,
        removeListener: removeListener,
        destory: destory,
    };
    return exports;
})();
```



### ToolbarManager

```js
// 来自 User Agent Overrider 扩展
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
        } catch(error) {
            trace(error);
        }
    };

    let exports = {
        addWidget: addWidget,
        removeWidget: removeWidget,
    };
    return exports;
})();
```

### Pref

```js
// 来自 User Agent Overrider 扩展
const Pref = function(branchRoot) {

    const supportsStringClass = Cc['@mozilla.org/supports-string;1'];
    const prefService = Cc['@mozilla.org/preferences-service;1']
                           .getService(Ci.nsIPrefService);

    const new_nsiSupportsString = function(data) {
        let string = supportsStringClass.createInstance(Ci.nsISupportsString);
        string.data = data;
        return string;
    };

    let branch = prefService.getBranch(branchRoot);

    let setBool = function(key, value) {
        try {
            branch.setBoolPref(key, value);
        } catch(error) {
            branch.clearUserPref(key)
            branch.setBoolPref(key, value);
        }
    };
    let getBool = function(key, defaultValue) {
        let value;
        try {
            value = branch.getBoolPref(key);
        } catch(error) {
            value = defaultValue || null;
        }
        return value;
    };

    let setInt = function(key, value) {
        try {
            branch.setIntPref(key, value);
        } catch(error) {
            branch.clearUserPref(key)
            branch.setIntPref(key, value);
        }
    };
    let getInt = function(key, defaultValue) {
        let value;
        try {
            value = branch.getIntPref(key);
        } catch(error) {
            value = defaultValue || null;
        }
        return value;
    };

    let setString = function(key, value) {
        try {
            branch.setComplexValue(key, Ci.nsISupportsString,
                                   new_nsiSupportsString(value));
        } catch(error) {
            branch.clearUserPref(key)
            branch.setComplexValue(key, Ci.nsISupportsString,
                                   new_nsiSupportsString(value));
        }
    };
    let getString = function(key, defaultValue) {
        let value;
        try {
            value = branch.getComplexValue(key, Ci.nsISupportsString).data;
        } catch(error) {
            value = defaultValue || null;
        }
        return value;
    };

    let reset = function(key) {
        branch.clearUserPref(key);
    };

    let addObserver = function(observer) {
        try {
            branch.addObserver('', observer, false);
        } catch(error) {
            trace(error);
        }
    };
    let removeObserver = function(observer) {
        try {
            branch.removeObserver('', observer, false);
        } catch(error) {
            trace(error);
        }
    };

    let exports = {
        setBool: setBool,
        getBool: getBool,
        setInt: setInt,
        getInt: getInt,
        setString: setString,
        getString: getString,
        reset: reset,
        addObserver: addObserver,
        removeObserver: removeObserver
    }
    return exports;
};
```

### UAManager

```js
// 来自 User Agent Overrider 扩展
let UAManager = (function() {

    // There are a bug since Firefox 17, was fixed at Firefox 23
    // https://bugzilla.mozilla.org/show_bug.cgi?id=814379

    let hackingWay = function() {
        // this way work only at Firefox 17 - 24

        Cu.import('resource://gre/modules/UserAgentOverrides.jsm');

        // Orignal UA selector function, a method of UserAgentOverrides.
        // Keep it for revert to default.
        let orignalGetOverrideForURI = UserAgentOverrides.getOverrideForURI;

        let revert = function() {
            UserAgentOverrides.getOverrideForURI = orignalGetOverrideForURI;
        };

        let change = function(uastring) {
            UserAgentOverrides.getOverrideForURI = function() uastring;
        };

        let exports = {
            revert: revert,
            change: change,
        };
        return exports;
    };

    let normalWay = function() {
        // this way work only at Firefox 23+

        let pref = Pref('general.useragent.');

        let revert = function() {
            pref.reset('override');
        };

        let change = function(uastring) {
            pref.setString('override', uastring);
        };

        let exports = {
            revert: revert,
            change: change,
        };
        return exports;
    }

    const appInfo = Cc['@mozilla.org/xre/app-info;1']
                       .getService(Components.interfaces.nsIXULAppInfo);
    let mainVersion = parseInt(appInfo.version.split('.')[0]);
    if (mainVersion < 23) {
        return hackingWay();
    } else {
        return normalWay();
    }
})();
```