/**
 *  Aardvark，改自 elemhidehelper 扩展
 *    调用：Aardvark.start(wrapper, callback)
 *    let wrapper = {
        window: window,
        get browser() window.gBrowser,
    };
 */

function E(id) {return null;}

var Aardvark = {
    showhelp: true,

    window: null,
    browser: null,
    anchorElem: null,
    selectedElem: null,
    isUserSelected: false,
    lockedAnchor: null,
    commentElem: null,
    mouseX: -1,
    mouseY: -1,
    prevSelectionUpdate: -1,
    commandLabelTimer: null,
    viewSourceTimer: null,
    boxElem: null,
    paintNode: null,
    prevPos: null,

    start: function(wrapper, callback) {
        if (!this.canSelect(wrapper.browser))
            return callback();

        if (this.browser)
            this.quit();

        this.window = wrapper.window;
        this.browser = wrapper.browser;
        this.callback = callback;
        E = function(id) wrapper.window.document.getElementById(id);

        this.browser.addEventListener("click", this.onMouseClick, true);
        this.browser.addEventListener("DOMMouseScroll", this.onMouseScroll, true);
        this.browser.addEventListener("keypress", this.onKeyPress, true);
        this.browser.addEventListener("mousemove", this.onMouseMove, true);
        this.browser.addEventListener("select", this.quit, false);
        this.browser.contentWindow.addEventListener("pagehide", this.onPageHide, true);

        this.browser.contentWindow.focus();

        let doc = this.browser.contentDocument;
        this.boxElem = doc.importNode(E("my-aardvark-elementmarker").firstElementChild.cloneNode(true), true);

        this.initHelpBox();

        if (this.showhelp)
            this.showMenu();

        // Make sure to select some element immeditely (whichever is in the center of the browser window)
        let[wndWidth, wndHeight] = this.getWindowSize(doc.defaultView);
        this.isUserSelected = false;
        this.onMouseMove({
            clientX: wndWidth / 2,
            clientY: wndHeight / 2,
            screenX: -1,
            screenY: -1,
            target: null
        });
    },

    canSelect: function(browser) {
        if (!browser || !browser.contentWindow || !(browser.contentDocument instanceof Ci.nsIDOMHTMLDocument)) {
            return false;
        }

        let location = browser.contentWindow.location;
        if (location.href == "about:blank")
            return false;

        if (location.hostname == "" &&
            location.protocol != "mailbox:" &&
            location.protocol != "imap:" &&
            location.protocol != "news:" &&
            location.protocol != "snews:") {
            return false;
        }

        return true;
    },

    doCommand: function(command, event) {
        if (this[command](this.selectedElem)) {
            this.showCommandLabel(this.commands[command + "_key"], this.commands[command + "_altkey"], this.commands[command + "_label"]);
            if (event)
                event.stopPropagation();
        }
        if (event)
            event.preventDefault();
    },

    showCommandLabel: function(key, alternativeKey, label) {
        if (this.commandLabelTimer)
            this.commandLabelTimer.cancel();

        E("my-aardvark-commandlabel-key").textContent = key.toUpperCase();
        E("my-aardvark-commandlabel-alternativeKey").textContent = alternativeKey.toUpperCase();
        E("my-aardvark-commandlabel-label").setAttribute("value", label);

        var commandLabel = E("my-aardvark-commandlabel");
        commandLabel.showPopup(this.window.document.documentElement, this.mouseX, this.mouseY, "tooltip", "topleft", "topleft");

        this.commandLabelTimer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
        this.commandLabelTimer.initWithCallback(function() {
            commandLabel.hidePopup();
            Aardvark.commandLabelTimer = null;
        }, 400, Ci.nsITimer.TYPE_ONE_SHOT);
    },

    commandsData: {
        select: {
            "key": "s",
            "label": "确定选择",
            "alternativeKey": ""
        },
        wider: {
            "key": "w",
            "label": "扩大选择范围",
            "alternativeKey": ""
        },
        narrower: {
            "key": "n",
            "label": "缩小选择范围",
            "alternativeKey": ""
        },
        lock: {
            "key": "l",
            "label": "锁定/解锁 选区",
            "alternativeKey": ""
        },
        quit: {
            "key": "q",
            "label": "取消选择",
            "alternativeKey": ""
        },
        blinkElement: {
            "key": "b",
            "label": "闪烁所选",
            "alternativeKey": ""
        },
        viewSource: {
            "key": "v",
            "label": "查看源代码",
            "alternativeKey": ""
        },
        viewSourceWindow: {
            "key": "u",
            "label": "查看源代码(在独立的窗口)",
            "alternativeKey": ""
        },
        showMenu: {
            "key": "h",
            "label": "显示/隐藏 帮助",
            "alternativeKey": ""
        },
    },
    initHelpBox: function() {
        var helpBoxRows = E("my-aardvark-helpbox-rows");
        if(helpBoxRows.firstElementChild)
            return;

        for (var i = 0; i < this.commands.length; i++) {
            var command = this.commands[i];
            var key = this.commandsData[command].key;
            var alternativeKey = this.commandsData[command].alternativeKey;
            var label = this.commandsData[command].label;

            this.commands[command + "_key"] = key.toLowerCase();
            this.commands[command + "_altkey"] = alternativeKey.toLowerCase();
            this.commands[command + "_label"] = label;

            var row = this.window.document.createElement("row");
            helpBoxRows.appendChild(row);

            var element = this.window.document.createElement("description");
            element.textContent = key.toUpperCase();
            element.className = "key";
            row.appendChild(element);

            var element = this.window.document.createElement("description");
            element.textContent = alternativeKey.toUpperCase();
            element.className = "key";
            row.appendChild(element);

            element = this.window.document.createElement("description");
            element.setAttribute("value", label);
            element.className = "label";
            row.appendChild(element);
        }
    },

    hideTooltips: function() {
        let tooltips = ["my-aardvark-helpbox", "my-aardvark-commandlabel", "my-aardvark-viewsource"];
        for (let i = 0; i < tooltips.length; i++) {
            let tooltip = E(tooltips[i]);
            if (tooltip)
                tooltip.hidePopup();
        }
    },

    onMouseClick: function(event) {
        if (event.button != 0 || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey)
            return;

        this.doCommand("select", event);
    },

    onMouseScroll: function(event) {
        if (!event.shiftKey || event.altKey || event.ctrlKey || event.metaKey)
            return;

        if ("axis" in event && event.axis != event.VERTICAL_AXIS)
            return;

        for (let i = 0; i < Math.abs(event.detail); i++)
            this.doCommand(event.detail > 0 ? "wider" : "narrower", event);
    },

    onKeyPress: function(event) {
        if (event.altKey || event.ctrlKey || event.metaKey)
            return;

        var command = null;
        if (event.keyCode == event.DOM_VK_ESCAPE)
            command = "quit";
        else if (event.keyCode == event.DOM_VK_RETURN)
            command = "select";
        else if (event.charCode) {
            var key = String.fromCharCode(event.charCode).toLowerCase();
            var commands = this.commands;
            for (var i = 0; i < commands.length; i++)
                if (commands[commands[i] + "_key"] == key || commands[commands[i] + "_altkey"] == key)
                    command = commands[i];
        }

        if (command)
            this.doCommand(command, event);
    },

    onPageHide: function(event) {
        this.doCommand("quit", null);
    },

    onMouseMove: function(event) {
        this.mouseX = event.screenX;
        this.mouseY = event.screenY;

        this.hideSelection();

        let x = event.clientX;
        let y = event.clientY;

        // We might have coordinates relative to a frame, recalculate relative to top window
        let node = event.target;
        while (node && node.ownerDocument && node.ownerDocument.defaultView && node.ownerDocument.defaultView.frameElement) {
            node = node.ownerDocument.defaultView.frameElement;
            let rect = node.getBoundingClientRect();
            x += rect.left;
            y += rect.top;
        }

        let elem = this.browser.contentDocument.elementFromPoint(x, y);
        while (elem && "contentDocument" in elem && this.canSelect(elem)) {
            let rect = elem.getBoundingClientRect();
            x -= rect.left;
            y -= rect.top;
            elem = elem.contentDocument.elementFromPoint(x, y);
        }

        if (elem) {
            if (!this.lockedAnchor)
                this.setAnchorElement(elem);
            else {
                this.lockedAnchor = elem;
                this.selectElement(this.selectedElem);
            }
        }
    },

    onAfterPaint: function() {
        // Don't update position too often
        if (this.selectedElem && Date.now() - this.prevSelectionUpdate > 20) {
            let pos = this.getElementPosition(this.selectedElem);
            if (!this.prevPos || this.prevPos.left != pos.left || this.prevPos.right != pos.right || this.prevPos.top != pos.top || this.prevPos.bottom != pos.bottom) {
                this.selectElement(this.selectedElem);
            }
        }
    },

    setAnchorElement: function(anchor) {
        this.anchorElem = anchor;

        let newSelection = anchor;
        if (this.isUserSelected) {
            // User chose an element via wider/narrower commands, keep the selection if
            // out new anchor is still a child of that element
            let e = newSelection;
            while (e && e != this.selectedElem)
                e = this.getParentElement(e);

            if (e)
                newSelection = this.selectedElem;
            else
                this.isUserSelected = false;
        }

        this.selectElement(newSelection);
    },

    appendDescription: function(node, value, className) {
        var descr = this.window.document.createElement("description");
        descr.setAttribute("value", value);
        if (className)
            descr.setAttribute("class", className);
        node.appendChild(descr);
    },

    /**************************
     * Element marker display *
     **************************/

    getElementLabel: function(elem) {
        let tagName = elem.tagName.toLowerCase();
        let addition = "";
        if (elem.id != "")
            addition += ", id: " + elem.id;
        if (elem.className != "")
            addition += ", class: " + elem.className;
        if (elem.style.cssText != "")
            addition += ", style: " + elem.style.cssText;

        return [tagName, addition];
    },

    selectElement: function(elem) {
        this.selectedElem = elem;
        this.prevSelectionUpdate = Date.now();

        let border = this.boxElem.getElementsByClassName("border")[0];
        let label = this.boxElem.getElementsByClassName("label")[0];
        let labelTag = this.boxElem.getElementsByClassName("labelTag")[0];
        let labelAddition = this.boxElem.getElementsByClassName("labelAddition")[0];

        if (this.boxElem.parentNode)
            this.boxElem.parentNode.removeChild(this.boxElem);

        let doc = this.browser.contentDocument;
        let[wndWidth, wndHeight] = this.getWindowSize(doc.defaultView);

        let pos = this.getElementPosition(elem);
        this.boxElem.style.left = Math.min(pos.left - 1, wndWidth - 2) + "px";
        this.boxElem.style.top = Math.min(pos.top - 1, wndHeight - 2) + "px";
        border.style.width = Math.max(pos.right - pos.left - 2, 0) + "px";
        border.style.height = Math.max(pos.bottom - pos.top - 2, 0) + "px";

        [labelTag.textContent, labelAddition.textContent] = this.getElementLabel(elem);

        // If there is not enough space to show the label move it up a little
        if (pos.bottom < wndHeight - 25)
            label.className = "label";
        else
            label.className = "label onTop";

        doc.documentElement.appendChild(this.boxElem);

        this.paintNode = doc.defaultView;
        if (this.paintNode) {
            this.prevPos = pos;
            this.paintNode.addEventListener("MozAfterPaint", this.onAfterPaint, false);
        }
    },

    hideSelection: function() {
        if (this.boxElem.parentNode)
            this.boxElem.parentNode.removeChild(this.boxElem);

        if (this.paintNode)
            this.paintNode.removeEventListener("MozAfterPaint", this.onAfterPaint, false);
        this.paintNode = null;
        this.prevPos = null;
    },

    getWindowSize: function(wnd) {
        return [wnd.innerWidth, wnd.innerHeight];
    },

    getElementPosition: function(element) {
        // Restrict rectangle coordinates by the boundaries of a window's client area
        function intersectRect(rect, wnd) {
            let[wndWidth, wndHeight] = this.getWindowSize(wnd);
            rect.left = Math.max(rect.left, 0);
            rect.top = Math.max(rect.top, 0);
            rect.right = Math.min(rect.right, wndWidth);
            rect.bottom = Math.min(rect.bottom, wndHeight);
        }

        let rect = element.getBoundingClientRect();
        let wnd = element.ownerDocument.defaultView;

        rect = {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom
        };
        while (true) {
            intersectRect.call(this, rect, wnd);

            if (!wnd.frameElement)
                break;

            // Recalculate coordinates to be relative to frame's parent window
            let frameElement = wnd.frameElement;
            wnd = frameElement.ownerDocument.defaultView;

            let frameRect = frameElement.getBoundingClientRect();
            let frameStyle = wnd.getComputedStyle(frameElement, null);
            let relLeft = frameRect.left + parseFloat(frameStyle.borderLeftWidth) + parseFloat(frameStyle.paddingLeft);
            let relTop = frameRect.top + parseFloat(frameStyle.borderTopWidth) + parseFloat(frameStyle.paddingTop);

            rect.left += relLeft;
            rect.right += relLeft;
            rect.top += relTop;
            rect.bottom += relTop;
        }

        return rect;
    },

    getParentElement: function(elem) {
        let result = elem.parentNode;
        if (result && result.nodeType == Ci.nsIDOMElement.DOCUMENT_NODE && result.defaultView && result.defaultView.frameElement)
            result = result.defaultView.frameElement;

        if (result && result.nodeType != Ci.nsIDOMElement.ELEMENT_NODE)
            return null;

        return result;
    },

    /***************************
     * Commands implementation *
     ***************************/

    commands: [
        "select",
        "wider",
        "narrower",
        "lock",
        "quit",
        "blinkElement",
        "viewSource",
        "viewSourceWindow",
        "showMenu"
    ],


    wider: function(elem) {
        if (!elem)
            return false;

        let newElem = this.getParentElement(elem);
        if (!newElem)
            return false;

        this.isUserSelected = true;
        this.selectElement(newElem);
        return true;
    },

    narrower: function(elem) {
        if (elem) {
            // Search selected element in the parent chain, starting with the anchor element.
            // We need to select the element just before the selected one.
            let e = this.anchorElem;
            let newElem = null;
            while (e && e != elem) {
                newElem = e;
                e = this.getParentElement(e);
            }

            if (!e || !newElem)
                return false;

            this.isUserSelected = true;
            this.selectElement(newElem);
            return true;
        }
        return false;
    },

    lock: function(elem) {
        if (!elem)
            return false;

        if (this.lockedAnchor) {
            this.setAnchorElement(this.lockedAnchor);
            this.lockedAnchor = null;
        } else
            this.lockedAnchor = this.anchorElem;

        return true;
    },

    quit: function() {
        if (!this.browser)
            return false;

        if ("blinkTimer" in this)
            this.stopBlinking();

        if (this.commandLabelTimer)
            this.commandLabelTimer.cancel();
        if (this.viewSourceTimer)
            this.viewSourceTimer.cancel();
        this.commandLabelTimer = null;
        this.viewSourceTimer = null;

        this.hideSelection();
        this.hideTooltips();

        this.browser.removeEventListener("click", this.onMouseClick, true);
        this.browser.removeEventListener("DOMMouseScroll", this.onMouseScroll, true);
        this.browser.removeEventListener("keypress", this.onKeyPress, true);
        this.browser.removeEventListener("mousemove", this.onMouseMove, true);
        this.browser.removeEventListener("select", this.quit, false);
        this.browser.contentWindow.removeEventListener("pagehide", this.onPageHide, true);

        this.anchorElem = null;
        this.selectedElem = null;
        this.window = null;
        this.browser = null;
        this.commentElem = null;
        this.lockedAnchor = null;
        this.boxElem = null;
        return false;
    },

    select: function(elem) {
        if (!elem)
            return false;

        this.callback(elem);

        this.quit();
        return false;
    },

    blinkElement: function(elem) {
        if (!elem)
            return false;

        if ("blinkTimer" in this)
            this.stopBlinking();

        let counter = 0;
        this.blinkElem = elem;
        this.blinkOrigValue = elem.style.visibility;
        this.blinkTimer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
        this.blinkTimer.initWithCallback(function() {
            counter++;
            elem.style.visibility = (counter % 2 == 0 ? "visible" : "hidden");
            if (counter == 6)
                Aardvark.stopBlinking();
        }, 250, Ci.nsITimer.TYPE_REPEATING_SLACK);

        return true;
    },

    stopBlinking: function() {
        this.blinkTimer.cancel();
        this.blinkElem.style.visibility = this.blinkOrigValue;

        delete this.blinkElem;
        delete this.blinkOrigValue;
        delete this.blinkTimer;
    },

    viewSource: function(elem) {
        if (!elem)
            return false;

        var sourceBox = E("my-aardvark-viewsource");
        if (sourceBox.state == "open" && this.commentElem == elem) {
            sourceBox.hidePopup();
            return true;
        }
        sourceBox.hidePopup();

        while (sourceBox.firstElementChild)
            sourceBox.removeChild(sourceBox.firstElementChild);
        this.getOuterHtmlFormatted(elem, sourceBox);
        this.commentElem = elem;

        let anchor = this.window.document.documentElement;
        let x = this.mouseX;
        let y = this.mouseY;
        this.viewSourceTimer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
        this.viewSourceTimer.initWithCallback(function() {
            sourceBox.showPopup(anchor, x, y, "tooltip", "topleft", "topleft");
            Aardvark.viewSourceTimer = null;
        }, 500, Ci.nsITimer.TYPE_ONE_SHOT);
        return true;
    },

    viewSourceWindow: function(elem) {
        if (!elem)
            return false;

        var range = elem.ownerDocument.createRange();
        range.selectNodeContents(elem);
        var selection = {
            rangeCount: 1,
            getRangeAt: function() {
                return range
            }
        };

        this.window.openDialog("chrome://global/content/viewPartialSource.xul", "_blank", "scrollbars,resizable,chrome,dialog=no",
            null, null, selection, "selection");
        return true;
    },

    getOuterHtmlFormatted: function(node, container) {
        var type = null;
        switch (node.nodeType) {
            case node.ELEMENT_NODE:
                var box = this.window.document.createElement("vbox");
                box.className = "elementBox";

                var startTag = this.window.document.createElement("hbox");
                startTag.className = "elementStartTag";
                if (!node.firstElementChild)
                    startTag.className += " elementEndTag";

                this.appendDescription(startTag, "<", null);
                this.appendDescription(startTag, node.tagName, "tagName");

                for (var i = 0; i < node.attributes.length; i++) {
                    var attr = node.attributes[i];
                    this.appendDescription(startTag, attr.name, "attrName");
                    if (attr.value != "") {
                        this.appendDescription(startTag, "=", null);
                        this.appendDescription(startTag, '"' + attr.value.replace(/"/, "&quot;") + '"', "attrValue");
                    }
                }

                this.appendDescription(startTag, node.firstElementChild ? ">" : " />", null);
                box.appendChild(startTag);

                if (node.firstElementChild) {
                    for (var child = node.firstElementChild; child; child = child.nextElementSibling)
                        this.getOuterHtmlFormatted(child, box);

                    var endTag = this.window.document.createElement("hbox");
                    endTag.className = "elementEndTag";
                    this.appendDescription(endTag, "<", null);
                    this.appendDescription(endTag, "/" + node.tagName, "tagName");
                    this.appendDescription(endTag, ">", null);
                    box.appendChild(endTag);
                }
                container.appendChild(box);
                return;

            case node.TEXT_NODE:
                type = "text";
                break;
            case node.CDATA_SECTION_NODE:
                type = "cdata";
                break;
            case node.COMMENT_NODE:
                type = "comment";
                break;
            default:
                return;
        }

        var text = node.nodeValue.replace(/\r/g, '').replace(/^\s+/, '').replace(/\s+$/, '');
        if (text == "")
            return;

        if (type != "cdata") {
            text = text.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        }
        text = text.replace(/\t/g, "  ");
        if (type == "cdata")
            text = "<![CDATA[" + text + "]]>";
        else if (type == "comment")
            text = "<!--" + text + "-->";

        var lines = text.split("\n");
        for (var i = 0; i < lines.length; i++)
            this.appendDescription(container, lines[i].replace(/^\s+/, '').replace(/\s+$/, ''), type);
    },

    showMenu: function() {
        var helpBox = E("my-aardvark-helpbox");
        if (helpBox.state == "open") {
            helpBox.hidePopup();
            return true;
        }

        // Show help box
        helpBox.showPopup(this.browser, -1, -1, "tooltip", "topleft", "topleft");
        return true;
    }
};

// Makes sure event handlers like Aardvark.onKeyPress always have the correct
// this pointer set.
for each (let method in ["onMouseClick", "onMouseScroll", "onKeyPress", "onPageHide", "onMouseMove", "onAfterPaint", "quit"])
	Aardvark[method] = Aardvark[method].bind(Aardvark);


if(!window.Services) Components.utils.import("resource://gre/modules/Services.jsm");

var AardvarkInit = {
    init: function(){
        this.win = Services.wm.getMostRecentWindow("navigator:browser");
        this.doc = this.win.document;

        if(!this.doc.getElementById("my-aardvark-popupset")){
            this.addPopupSet();
        }
    },
    addPopupSet: function(){
        var xul = '\
            <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
                     xmlns:html="http://www.w3.org/1999/xhtml"> \
            <window id="main-window">\
            <popupset id="my-aardvark-popupset"\
                    xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"\
                    xmlns:html="http://www.w3.org/1999/xhtml">\
                <tooltip id="my-aardvark-helpbox" noautohide="true" orient="vertical">\
                    <description id="my-aardvark-helpbox-title" value="页面元素选择 - 快捷键"/>\
                \
                    <grid flex="1">\
                        <columns>\
                            <column/>\
                            <column flex="1"/>\
                        </columns>\
                        <rows id="my-aardvark-helpbox-rows"/>\
                    </grid>\
                </tooltip>\
                <tooltip id="my-aardvark-commandlabel" noautohide="true">\
                    <hbox align="center">\
                        <description id="my-aardvark-commandlabel-key"/>\
                        <description id="my-aardvark-commandlabel-alternativeKey"/>\
                        <description id="my-aardvark-commandlabel-label"/>\
                    </hbox>\
                </tooltip>\
                <tooltip id="my-aardvark-viewsource" noautohide="true" orient="vertical"/>\
                <tooltip id="my-aardvark-elementmarker">\
                    <html:div>\
                        <html:div class="border"/>\
                        <html:div class="label"><html:span class="labelTag"/><html:span class="labelAddition"/></html:div>\
                    </html:div>\
                </tooltip>\
            </popupset>\
            </window>\
            </overlay>\
        ';

        xul = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(xul);
        this.win.userChrome_js.loadOverlay(xul, this);
    },
    observe: function (aSubject, aTopic, aData) {
        if (aTopic == "xul-overlay-merged") {
            this.addMainWinCss();
            this.addContentCss();
        }
    },
    addMainWinCss: function(){
        var css = '\
            #my-aardvark-helpbox, #my-aardvark-commandlabel, #my-aardvark-viewsource {\
                    margin: 10px;\
                    padding: 5px;\
                }\
                #my-aardvark-helpbox row {\
                    -moz-box-align: center;\
                }\
                #my-aardvark-helpbox .key:not(:empty) {\
                    font-weight: bold;\
                    margin: 2px 10px 2px 0px;\
                    border: 1px solid black;\
                    text-align: start;\
                    width: 30px;\
                    height: 30px;\
                    padding: 2px;\
                    background-color: white;\
                    color: black;\
                    border-radius: 3px;\
                }\
                #my-aardvark-helpbox-title {\
                    font-size: 130%;\
                    margin-bottom: 10px;\
                }\
                #my-aardvark-commandlabel {\
                    font-size: 150%;\
                }\
                #my-aardvark-commandlabel-key:not(:empty), #my-aardvark-commandlabel-alternativeKey:not(:empty) {\
                    font-weight: bold;\
                    margin: 0px 10px 0px 0px;\
                    border: 1px solid black;\
                    text-align: start;\
                    width: 45px;\
                    height: 45px;\
                    padding: 2px;\
                    background-color: white;\
                    color: black;\
                    border-radius: 4px;\
                }\
                #my-aardvark-viewsource {\
                    max-width: none;\
                }\
                #my-aardvark-viewsource description, #my-aardvark-viewsource hbox, #my-aardvark-viewsource vbox {\
                    margin: 0px;\
                }\
                #my-aardvark-viewsource .elementBox {\
                    border: 1px solid #CCCCCC;\
                    margin: 5px;\
                }\
                #my-aardvark-viewsource .text, #my-aardvark-viewsource .cdata, #my-aardvark-viewsource .comment {\
                    margin: 0px 5px;\
                }\
                #my-aardvark-viewsource .tagName {\
                    font-weight: bold;\
                    color: #FF0000;\
                }\
                #my-aardvark-viewsource .attrName {\
                    margin-left: 5px;\
                    color: #00FF00;\
                }\
                #my-aardvark-viewsource .attrValue {\
                    color: #0000FF;\
                }\
                #my-aardvark-viewsource .comment {\
                    color: #808080;\
                }\
            ';

        var pi = this.doc.createProcessingInstruction(
            'xml-stylesheet',
            'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"'
        );
        this.doc.insertBefore(pi, this.doc.documentElement);
    },
    addContentCss: function(){
        var cssStr = '\
            @namespace url("http://www.w3.org/1999/xhtml");\
             .%%CLASS%%, .%%CLASS%% > .label, .%%CLASS%% > .label > .labelTag, .%%CLASS%% > .label > .labelAddition, .%%CLASS%% > .border {\
                display: block !important;\
                position: static !important;\
                float: none !important;\
                clear: none !important;\
                right: auto !important;\
                bottom: auto !important;\
                z-index: 2147483647 !important;\
                background: transparent !important;\
                border: none !important;\
                clip: auto !important;\
                cursor: auto !important;\
                margin: 0px !important;\
                max-width: none !important;\
                max-height: none !important;\
                min-width: 0px !important;\
                min-height: 0px !important;\
                opacity: 1 !important;\
                outline: none !important;\
                padding: 0px !important;\
                visibility: visible !important;\
                -moz-binding: none !important;\
                border-radius: 0px !important;\
                -moz-user-focus: none !important;\
                -moz-user-input: none !important;\
                -moz-user-select: none !important;\
            }\
            .%%CLASS%% {\
                position: fixed !important;\
                width: auto !important;\
                height: auto !important;\
            }\
            .%%CLASS%% > .border {\
                border: 2px solid #ff0000 !important;\
                top: auto !important;\
                left: auto !important;\
            }\
            .%%CLASS%% > .label {\
                float: left !important;\
                background-color: #fff0cc !important;\
                border-color: #000000 !important;\
                border-width: 0px 2px 1px 2px !important;\
                border-style: solid !important;\
                border-bottom-left-radius: 6px !important;\
                border-bottom-right-radius: 6px !important;\
                padding: 2px 5px !important;\
                top: auto !important;\
                left: auto !important;\
                width: auto !important;\
                height: auto !important;\
            }\
            .%%CLASS%% > .label.onTop {\
                position: relative !important;\
                left: 5px !important;\
                top: -25px !important;\
                border-top-width: 1px !important;\
                border-radius: 6px !important;\
            }\
            .%%CLASS%% > .label > .labelTag, .%%CLASS%% > .label > .labelAddition {\
                display: inline !important;\
                font-family: Arial !important;\
                font-size: 12px !important;\
                color: #000000 !important;\
                top: auto !important;\
                left: auto !important;\
                width: auto !important;\
                height: auto !important;\
                direction: ltr !important;\
                font-size-adjust: none !important;\
                font-stretch: normal !important;\
                font-style: normal !important;\
                font-variant: normal !important;\
                font-weight: normal !important;\
                letter-spacing: normal !important;\
                line-height: normal !important;\
                text-align: start !important;\
                text-decoration: none !important;\
                text-indent: 0px !important;\
                text-shadow: none !important;\
                text-transform: none !important;\
                text-transform: none !important;\
                white-space: normal !important;\
                word-spacing: 0px !important;\
            }\
            .%%CLASS%% > .label > .labelTag {\
                font-weight: bold !important;\
            }\
        ';

        // Use random marker class
        let elementMarkerClass = null;{
            let rnd = [];
            let offset = "a".charCodeAt(0);
            for (let i = 0; i < 20; i++)
                rnd.push(offset + Math.random() * 26);

            elementMarkerClass = String.fromCharCode.apply(String, rnd);
        }

        let data = cssStr.replace(/%%CLASS%%/g, elementMarkerClass);
        let styleService = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
        let styleURI = Services.io.newURI("data:text/css," + encodeURIComponent(data), null, null);
        styleService.loadAndRegisterSheet(styleURI, Ci.nsIStyleSheetService.USER_SHEET);

        this.doc.getElementById("my-aardvark-elementmarker").firstElementChild.setAttribute("class", elementMarkerClass);
    }
};

AardvarkInit.init();