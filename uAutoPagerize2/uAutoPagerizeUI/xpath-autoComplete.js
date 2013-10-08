/**
 * 参考 UserStyleManager 扩展
 */
const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

const XPathKeywordsList = [
    "next",
    "auto;",

    "@id='", "@class='",

    "comment()", "node()", "text()",

    // Function
    "concat(", "substring(", "substring-after(", "substring-before(", "string(", "local-name(",
    "name(", "namespace-uri(", "normalize-space(", "translate(", "ceiling(", "count(",
    "floor(", "last()", "number(", "position()", "round(", "sum(", "boolean(", "contains(",
    "false()", "lang(", "not(", "starts-with(", "string-length(", "true()",

    "and", "or","div", "mod",

    "ancestor::", "ancestor-or-self::", "descendant::", "descendant-or-self::",
    "following::", "following-or-self::",  "preceding::", "preceding-or-self::",
    "parent::", "child::", "self::", "attribute::",

    "a[text()='下一页']", "a[contains(text(),'下一页')]", "a[contains(.//text(),'下一页')]",
    "text()='下一页'", "contains(text(),'下一页')", "descendant::a[text()='下一页']",
];

// 测试用
// function init(){
//     setupAutoCompleter(document.getElementById("input"));
// }


function setupAutoCompleter(textBox) {
    var ap = new XPathAutoCompleter(textBox);
    textBox.addEventListener("keypress", ap.handleKeyPress.bind(ap), false);
    textBox.addEventListener("keyup", ap.handleKeyUp.bind(ap), false);
}

function XPathAutoCompleter(textBox){
    this.editor = textBox;
    this.panel = document.getElementById("autocompletePanel");
    this.list = document.getElementById("autocompleteList");

    this.list.addEventListener("click", this.autocompletePanelPress.bind(this), false);
    this.list.addEventListener("keypress", this.autocompletePanelPress.bind(this), false);
    this.list.addEventListener("popupshown", this.autocompletePanelOpen.bind(this), false);
}

XPathAutoCompleter.prototype = {
    getText: function (aStart, aEnd) {
        return this.editor.value;
    },

    setText: function (aText, aStart, aEnd) {
        if (aStart == null) {
            aStart = 0;
        }
        if (aEnd == null) {
            aEnd = this.getText().length;
        }
        // separating out the text before and after astart and aend
        this.editor.value = this.editor.value.slice(0, aStart) + aText + this.editor.value.slice(aEnd);
    },

    getCaretOffset: function () {
        return this.editor.selectionStart;
    },
    setCaretOffset: function (aOffset) {
        this.editor.setSelectionRange(aOffset, aOffset);
    },

    handleKeyPress: function(event){
        if (event.ctrlKey || event.altKey || event.metaKey) {
            if (this.panel.state == "open") {
                this.panel.hidePopup();
            }
            return;
        }

        switch (event.keyCode) {
            case event.DOM_VK_DELETE:
            case event.DOM_VK_BACK_SPACE:
                if (this.panel.state == "open") {
                    this.panel.hidePopup();
                }
                return;
            case event.DOM_VK_UP:
                if (this.panel.state == "open") {
                    if (this.list.currentIndex == 0) {
                        this.list.currentIndex =
                            this.list.selectedIndex =
                            this.list.itemCount - 1;
                    } else {
                        this.list.currentIndex--;
                        this.list.selectedIndex--;
                    }
                    event.preventDefault();
                }
                return;
            case event.DOM_VK_DOWN:
                if (this.panel.state == "open") {
                    if (this.list.currentIndex ==
                        this.list.itemCount - 1) {
                        this.list.currentIndex =
                            this.list.selectedIndex = 0;
                    } else {
                        this.list.currentIndex++;
                        this.list.selectedIndex++;
                    }
                    event.preventDefault();
                }
                return;
            case event.DOM_VK_LEFT:
            case event.DOM_VK_RIGHT:
            case event.DOM_VK_HOME:
            case event.DOM_VK_END:
            case event.DOM_VK_ESCAPE:
                if (this.panel.state == "open") {
                    this.panel.hidePopup();
                }
                return;
            case event.DOM_VK_TAB:
                if (this.panel.state == "open") {
                    if (this.list.selectedItem) {
                        let value = this.list.selectedItem.lastChild.value;
                        let currentPos = this.getCaretOffset();
                        this.setText(value, currentPos, currentPos);
                        this.setCaretOffset(currentPos + value.length);
                        this.panel.hidePopup();
                    }
                    event.preventDefault();
                }
                return;
            case event.DOM_VK_ENTER:
            case event.DOM_VK_RETURN:
                if (this.panel.state == "open") {
                    if (this.list.selectedItem) {
                        let value = this.list.selectedItem.lastChild.value;
                        let currentPos = this.getCaretOffset();
                        this.setText(value, currentPos, currentPos);
                        this.setCaretOffset(currentPos + value.length);
                        this.panel.hidePopup();
                    }
                }
                return;
        }
    },

    handleKeyUp: function (event) {
        switch (event.keyCode) {
            case event.DOM_VK_CONTROL:
            case event.DOM_VK_ALT:
            case event.DOM_VK_SHIFT:
            case event.DOM_VK_UP:
            case event.DOM_VK_DELETE:
            case event.DOM_VK_BACK_SPACE:
            case event.DOM_VK_DOWN:
            case event.DOM_VK_LEFT:
            case event.DOM_VK_RIGHT:
            case event.DOM_VK_HOME:
            case event.DOM_VK_END:
            case event.DOM_VK_ESCAPE:
            case event.DOM_VK_TAB:
            case event.DOM_VK_ENTER:
            case event.DOM_VK_RETURN:
                return;
        }

        let currentPos = this.getCaretOffset();
        let text = this.getText();
        let matchedList = [];
        let lastWord = text.slice(currentPos - 1, currentPos);
        // check if the types word is !
        if ("'" == lastWord) {
            let textAfter = text.slice(currentPos).split("\n")[0];
            let textBefore = text.slice(0, currentPos).split("\n").slice(-1)[0];
            if (textAfter.trim() == "" && textBefore.split("'").length % 2 == 0) {
                this.setText("'", currentPos, currentPos);
                this.setCaretOffset(currentPos);
            }
        } else if ('"' == lastWord) {
            let textAfter = text.slice(currentPos).split("\n")[0];
            let textBefore = text.slice(0, currentPos).split("\n").slice(-1)[0];
            if (textAfter.trim() == "" && textBefore.split('"').length % 2 == 0) {
                this.setText('"', currentPos, currentPos);
                this.setCaretOffset(currentPos);
            }
        }else if (text.slice(0, currentPos).split("\n").slice(-1)[0].split("'").length % 2 &&
            text.slice(0, currentPos).split("\n").slice(-1)[0].split('"').length % 2) {

            if ("(" == lastWord) {
                let textAfter = text.slice(currentPos);
                let textBefore = text.slice(0, currentPos);
                if (textBefore.split("(").length - textBefore.split(")").length >
                    textAfter.split(")").length - textAfter.split("(").length) {
                    this.setText(")", currentPos, currentPos);
                    this.setCaretOffset(currentPos);
                }
            } else if ("[" == lastWord) {
                let textAfter = text.slice(currentPos);
                let textBefore = text.slice(0, currentPos);
                if (textBefore.split("[").length - textBefore.split("]").length >
                    textAfter.split("]").length - textAfter.split("[").length) {
                    this.setText("]", currentPos, currentPos);
                    this.setCaretOffset(currentPos);
                }
            } else {
                let richlist = this.list;
                try {
                    while (richlist.firstChild) {
                        richlist.removeChild(richlist.firstChild);
                    }
                } catch (ex) {}

                // Checking for autocompleting
                let textBefore = text.slice(0, currentPos);
                let word = textBefore.match(/([0-9a-zA-Z_\-]+)$/);

                if (!word) {
                    try {
                        this.panel.hidePopup();
                    } catch (ex) {}
                    return;
                }

                word = word[1];

                for (let i = 0; i < XPathKeywordsList.length; i++) {
                    if (XPathKeywordsList[i].slice(0, word.length).toLowerCase() != word.toLowerCase()) {
                        continue;
                    }
                    matchedList.push(XPathKeywordsList[i]);
                }
                if (matchedList.length == 0) {
                    if (this.panel.state == "open") {
                        this.panel.hidePopup();
                    }
                    return;
                }
                // let maxLen = 0;
                for (let i = 0; i < matchedList.length; i++) {
                    // if (maxLen < matchedList[i].length) {
                    //     maxLen = matchedList[i].length;
                    // }
                    let item = document.createElementNS(XUL, "richlistitem");

                    let matchingPart = document.createElementNS(XUL, "label");
                    matchingPart.setAttribute("value", word);
                    matchingPart.setAttribute("style", "margin: 2px 0px; font-family: " +
                        "monospace; font-size: inherit; font-size: 14px;");
                    item.appendChild(matchingPart);

                    let rest = document.createElementNS(XUL, "label");
                    rest.setAttribute("value", matchedList[i].slice(word.length));
                    rest.setAttribute("style", "color: #444; margin: 2px 0px; font-family:" +
                        "monospace; font-size: inherit; font-size: 14px;");
                    item.appendChild(rest);
                    richlist.appendChild(item);
                }

                this.panel.openPopup(this.editor, "before_start");

                richlist.focus();
                richlist.currentIndex = richlist.selectedIndex = 0;
                this.editor.focus();
            }
        }
    },

    //  function to handle click/enter on the panel
    autocompletePanelPress: function (event) {
        if (event.button && event.button == 0 ||
            event.keyCode == event.DOM_VK_ENTER ||
            event.keyCode == event.DOM_VK_RETURN) {
            if (this.panel.state == "open") {
                if (this.list.selectedItem) {
                    let value = this.list.selectedItem.lastChild.value;
                    this.panel.hidePopup();
                    this.editor.focus();
                    let caretOffset = this.getCaretOffset();
                    this.setText(value, caretOffset, caretOffset);
                }
            }
        }
    },

    //  function to handle opening of autocomplete panel
    autocompletePanelOpen: function () {
        this.list.currentIndex = this.list.selectedIndex = 0;
    },
};