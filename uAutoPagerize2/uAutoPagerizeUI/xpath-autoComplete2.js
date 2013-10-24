/**
 * 修改自 FirePath.xpi
 */

var EXPORTED_SYMBOLS = ["setupAutoCompleter"];

const XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

// ************************************************************************************************
// XPath Tokens from XPath V1 W3C Recommendation on http://www.w3.org/TR/xpath

var BaseChar = "[\u0041-\u005A]|[\u0061-\u007A]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u00FF]|[\u0100-\u0131]|" +
        "[\u0134-\u013E]|[\u0141-\u0148]|[\u014A-\u017E]|[\u0180-\u01C3]|[\u01CD-\u01F0]|[\u01F4-\u01F5]|[\u01FA-\u0217]|" +
        "[\u0250-\u02A8]|[\u02BB-\u02C1]|\u0386|[\u0388-\u038A]|\u038C|[\u038E-\u03A1]|[\u03A3-\u03CE]|[\u03D0-\u03D6]|" +
        "\u03DA|\u03DC|\u03DE|\u03E0|[\u03E2-\u03F3]|[\u0401-\u040C]|[\u040E-\u044F]|[\u0451-\u045C]|[\u045E-\u0481]|" +
        "[\u0490-\u04C4]|[\u04C7-\u04C8]|[\u04CB-\u04CC]|[\u04D0-\u04EB]|[\u04EE-\u04F5]|[\u04F8-\u04F9]|[\u0531-\u0556]|" +
        "\u0559|[\u0561-\u0586]|[\u05D0-\u05EA]|[\u05F0-\u05F2]|[\u0621-\u063A]|[\u0641-\u064A]|[\u0671-\u06B7]|" +
        "[\u06BA-\u06BE]|[\u06C0-\u06CE]|[\u06D0-\u06D3]|\u06D5|[\u06E5-\u06E6]|[\u0905-\u0939]|\u093D|[\u0958-\u0961]|" +
        "[\u0985-\u098C]|[\u098F-\u0990]|[\u0993-\u09A8]|[\u09AA-\u09B0]|\u09B2|[\u09B6-\u09B9]|[\u09DC-\u09DD]|" +
        "[\u09DF-\u09E1]|[\u09F0-\u09F1]|[\u0A05-\u0A0A]|[\u0A0F-\u0A10]|[\u0A13-\u0A28]|[\u0A2A-\u0A30]|[\u0A32-\u0A33]|" +
        "[\u0A35-\u0A36]|[\u0A38-\u0A39]|[\u0A59-\u0A5C]|\u0A5E|[\u0A72-\u0A74]|[\u0A85-\u0A8B]|\u0A8D|[\u0A8F-\u0A91]|" +
        "[\u0A93-\u0AA8]|[\u0AAA-\u0AB0]|[\u0AB2-\u0AB3]|[\u0AB5-\u0AB9]|\u0ABD|\u0AE0|[\u0B05-\u0B0C]|[\u0B0F-\u0B10]|" +
        "[\u0B13-\u0B28]|[\u0B2A-\u0B30]|[\u0B32-\u0B33]|[\u0B36-\u0B39]|\u0B3D|[\u0B5C-\u0B5D]|[\u0B5F-\u0B61]|" +
        "[\u0B85-\u0B8A]|[\u0B8E-\u0B90]|[\u0B92-\u0B95]|[\u0B99-\u0B9A]|\u0B9C|[\u0B9E-\u0B9F]|[\u0BA3-\u0BA4]|" +
        "[\u0BA8-\u0BAA]|[\u0BAE-\u0BB5]|[\u0BB7-\u0BB9]|[\u0C05-\u0C0C]|[\u0C0E-\u0C10]|[\u0C12-\u0C28]|[\u0C2A-\u0C33]|" +
        "[\u0C35-\u0C39]|[\u0C60-\u0C61]|[\u0C85-\u0C8C]|[\u0C8E-\u0C90]|[\u0C92-\u0CA8]|[\u0CAA-\u0CB3]|[\u0CB5-\u0CB9]|" +
        "\u0CDE|[\u0CE0-\u0CE1]|[\u0D05-\u0D0C]|[\u0D0E-\u0D10]|[\u0D12-\u0D28]|[\u0D2A-\u0D39]|[\u0D60-\u0D61]|" +
        "[\u0E01-\u0E2E]|\u0E30|[\u0E32-\u0E33]|[\u0E40-\u0E45]|[\u0E81-\u0E82]|\u0E84|[\u0E87-\u0E88]|\u0E8A|\u0E8D|" +
        "[\u0E94-\u0E97]|[\u0E99-\u0E9F]|[\u0EA1-\u0EA3]|\u0EA5|\u0EA7|[\u0EAA-\u0EAB]|[\u0EAD-\u0EAE]|\u0EB0|" +
        "[\u0EB2-\u0EB3]|\u0EBD|[\u0EC0-\u0EC4]|[\u0F40-\u0F47]|[\u0F49-\u0F69]|[\u10A0-\u10C5]|[\u10D0-\u10F6]|\u1100|" +
        "[\u1102-\u1103]|[\u1105-\u1107]|\u1109|[\u110B-\u110C]|[\u110E-\u1112]|\u113C|\u113E|\u1140|\u114C|\u114E|\u1150|" +
        "[\u1154-\u1155]|\u1159|[\u115F-\u1161]|\u1163|\u1165|\u1167|\u1169|[\u116D-\u116E]|[\u1172-\u1173]|\u1175|\u119E|" +
        "\u11A8|\u11AB|[\u11AE-\u11AF]|[\u11B7-\u11B8]|\u11BA|[\u11BC-\u11C2]|\u11EB|\u11F0|\u11F9|[\u1E00-\u1E9B]|" +
        "[\u1EA0-\u1EF9]|[\u1F00-\u1F15]|[\u1F18-\u1F1D]|[\u1F20-\u1F45]|[\u1F48-\u1F4D]|[\u1F50-\u1F57]|\u1F59|\u1F5B|\u1F5D|" +
        "[\u1F5F-\u1F7D]|[\u1F80-\u1FB4]|[\u1FB6-\u1FBC]|\u1FBE|[\u1FC2-\u1FC4]|[\u1FC6-\u1FCC]|[\u1FD0-\u1FD3]|[\u1FD6-\u1FDB]|" +
        "[\u1FE0-\u1FEC]|[\u1FF2-\u1FF4]|[\u1FF6-\u1FFC]|\u2126|[\u212A-\u212B]|\u212E|[\u2180-\u2182]|[\u3041-\u3094]|" +
        "[\u30A1-\u30FA]|[\u3105-\u312C]|[\uAC00-\uD7A3]";

var Ideographic = "[\u4E00-\u9FA5]|\u3007|[\u3021-\u3029]";

var Letter = BaseChar + "|" + Ideographic;

var NCNameStartChar = Letter + "|_";

var NCNameChar = "[A-Z]|_|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|" +
        "[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|" +
        "-|\\.|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]";

var NCName = "(?:(?:" +  NCNameStartChar + ")(?:" +  NCNameChar + ")*)";

var QName = NCName + ":" + NCName + "|" + NCName;

var NameTest = "\\*|" + NCName + ":\\*|" + QName;

var NodeType = "comment|text|processing-instruction|node";

var NameOperator = "and|or|mod|div";

var Operator = NameOperator + "|\\*|//|/|\\||\\+|-|!=|<=|<|>=|>|=";

var FunctionName = QName;

var AxisName = "ancestor|ancestor-or-self|attribute|child|descendant|descendant-or-self|following|following-sibling|parent|preceding|" +
        "preceding-sibling|self";

var Literal = "\"[^\"]*\"|'[^']*'";

var Numbers = "\\d+(?:\\.\\d?)?|\\.\\d+";

var ExprToken = "\\(|\\)|\\[|\\]|\\.\\.|@|,|::|" + NameTest + "|" + NodeType + "|" + Operator + "|" + FunctionName + "|" +
AxisName + "|" + Literal + "|" + Numbers + "|\\.";

var xPathToken = new RegExp(ExprToken, "g");

var selectedToken = new RegExp(NCName + ":(?!:)|" + ExprToken + "|\\s", "g");

var nameTestToken = new RegExp(NameTest);
// Function supported by Firefox
var functionNameToken = new RegExp("concat|substring|substring-after|substring-before|string|local-name|name|namespace-uri|normalize-space" +
        "translate|ceiling|count|floor|last|number|position|round|sum|boolean|contains|false|lang|not|starts-with|string-length|true");

var expressionToken = new RegExp("\\]|\\)|\\*" + NameTest + "|" + Literal + "|" + Numbers + "|\\.");

var getNamespace = new RegExp("([^:]+:).*");


// function init(){
//     var docStr = '<html>\
//       <head>\
//         <meta charset="utf-8">\
//         <title>Google Phone Gallery</title>\
//       </head>\
//       <body>\
//         <a href="test.html">next</a>\
//         <div ng-view></div>\
//       </body>\
//     </html>';
//     var doc = new DOMParser().parseFromString(docStr, "text/html");

//     setupAutoCompleter("input", doc);

//     setupAutoCompleter("input2", doc);
// }

var evaluator = {
    node: mainWin.content.document,
    xPathEvaluator: new XPathEvaluator(),

    evaluateExpression: function(xPath){
        var xPathExpression = this.getXPathExpression(xPath);
        if(!xPathExpression) return null;

        var result;
        try{
            result = xPathExpression.evaluate(this.node, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
        } catch(e) {
            return null;
        }
        return this.processResult(result);
    },
    hasResult: function(xPath){
        var xPathExpression = this.getXPathExpression(xPath);
        if(!xPathExpression) return false;

        var result;
        try{
            result = xPathExpression.evaluate(this.node, XPathResult.ANY_UNORDERED_NODE_TYPE, null);
        } catch(e) {
            return false;
        }
        return result.singleNodeValue != null;
    },
    getXPathExpression: function(xPath){
        try {
            if (xPath) {
                // we want to lower case the XPath expression but not the literal inside.
                //  eg: //DIV[@id='TEST'] should become //div[@id='TEST']
                xPath = xPath.replace(/([^'"]*)('[^']+'|"[^"]+")?/g,
                    function(str, expression, literal){return expression.toLowerCase() + literal;});
            }
            return this.xPathEvaluator.createExpression(xPath, null);
        } catch (e) {
            return null;
        }
    },
    processResult: function(evaluationResult){
        switch(evaluationResult.resultType) {
            case XPathResult.NUMBER_TYPE:
                return evaluationResult.numberValue;
            case XPathResult.STRING_TYPE:
                return evaluationResult.stringValue;
            case XPathResult.BOOLEAN_TYPE:
                return evaluationResult.booleanValue;
            default:
                var result = [];
                var node;
                while (node = evaluationResult.iterateNext()) {
                    result.push(node);
                }
                return result;
        }
    }
};

function setupAutoCompleter(textBox) {
    var ap = new XPathAutoCompleter(textBox);
    textBox.addEventListener("keypress", ap.handleKeyPress.bind(ap), false);
    textBox.addEventListener("keyup", ap.handleKeyUp.bind(ap), false);
}

function XPathAutoCompleter(textBox){
    this.textBox = textBox;
    this.panel = document.getElementById("autocompletePanel");
    this.list = document.getElementById("autocompleteList");

    this.evaluator = evaluator;

    this.lastRangeStart = -1;
    this.word = "";
    this.candidates = null;

    this.revert = function() {
    };

    this.hide = function() {
        if (this.panel.state == "open") {
            this.panel.hidePopup();
        }
    };

    this.getMachedList = function(){
        var value = this.textBox.value;
        var offset = this.textBox.selectionStart;

        // Find the part of the string that is being completed
        var range = this.getAutoCompleteRange(value, offset);
        if (!range)
            range = {start: 0, end: value.length};

        var preExpr = value.substr(0, range.start);
        var lastExpr = value.substring(range.start, range.end);
        var postExpr = value.substr(range.end);

        if(range.start == this.lastRangeStart){  // 从上次列表中筛选数据
            var findExpr = this.word = lastExpr + postExpr;
            this.candidates = this.candidates.filter(function(name){
                return name.lastIndexOf(findExpr, 0) == 0;
            });
        }else{
            this.word = "";
            this.candidates = this.getAutoCompleteList(preExpr, lastExpr, postExpr);
        }
        this.lastRangeStart = range.start;

        return this.candidates;
    };

    this.setText = function (aText, aStart, aEnd) {
        if (aStart == null) {
            aStart = 0;
        }
        if (aEnd == null) {
            aEnd = this.textBox.value.length;
        }
        // separating out the text before and after astart and aend
        this.textBox.value = this.textBox.value.slice(0, aStart) + aText + this.textBox.value.slice(aEnd);
    };

    this.getCaretOffset = function () {
        return this.textBox.selectionStart;
    };

    this.setCaretOffset = function (aOffset) {
        this.textBox.setSelectionRange(aOffset, aOffset);
    };

    this.handleKeyPress = function(event){
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
                }
                event.stopPropagation();
                event.preventDefault();
                return;
            case event.DOM_VK_ENTER:
            case event.DOM_VK_RETURN:
                if (this.panel.state == "open") {
                    if (this.list.selectedItem) {
                        let currentPos = this.getCaretOffset();
                        this.setText(this.list.selectedItem.lastChild.value,
                            currentPos, currentPos + 1);
                        this.panel.hidePopup();
                    }
                }
                return;
        }
    };

    this.handleKeyUp = function (event) {
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

        let richlist = this.list;
        try {
            while (richlist.firstChild) {
                richlist.removeChild(richlist.firstChild);
            }
        } catch (ex) {}

        let matchedList = this.getMachedList();
        let word = this.word;

        if (matchedList.length == 0) {
            if (this.panel.state == "open") {
                this.panel.hidePopup();
            }
            return;
        }

        for (let i = 0; i < matchedList.length; i++) {
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

        // let boundData = this.editor.getBoundingClientRect();
        // let x = boundData.left + word.length * 8;
        // let y = boundData.top;
        // if(this.panel.state == "open"){
        //     this.panel.moveTo(x, 0);
        // }else{

        // }

        // let x = word.length * 8;
        this.panel.openPopup(this.textBox, "before_start");

        richlist.focus();
        richlist.currentIndex = richlist.selectedIndex = 0;
        this.textBox.focus();
        // this.setCaretOffset(currentPos);
    };

    //  function to handle click/enter on the panel
    this.autocompletePanelPress = function (event) {
        if (event.button && event.button == 0 ||
            event.keyCode == event.DOM_VK_ENTER ||
            event.keyCode == event.DOM_VK_RETURN) {
            if (this.panel.state == "open") {
                if (this.list.selectedItem) {
                    let value = this.list.selectedItem.lastChild.value + ": ";
                    this.panel.hidePopup();
                    this.editor.focus();
                    let caretOffset = this.getCaretOffset();
                    this.setText(value, caretOffset, caretOffset);
                }
            }
        }
    };

    //  function to handle opening of autocomplete panel
    this.autocompletePanelOpen = function () {
        this.list.currentIndex = this.list.selectedIndex = 0;
    };

    // FireXPath 扩展
    this.getAutoCompleteRange = function(value, offset) {
        var preSelection = value.substring(0, offset);
        var result;
        var tokens = [];

        while ((result = selectedToken.exec(preSelection)) != null) {
            tokens.unshift(result[0]);
        }

        var start;
        var end;
        if(tokens.length == 0) {
            start = 0;
            end =  value.length;
        } else if(nameTestToken.test(tokens[0])) {
            start = preSelection.lastIndexOf(tokens[0]);
            end = start + tokens[0].length
        } else {
            start = preSelection.lastIndexOf(tokens[0]) + tokens[0].length;
            var postSelection = value.substring(start);
            var firstTokenIndex = postSelection.search(selectedToken);
            end = (firstTokenIndex == -1? value.length : start + firstTokenIndex);
        }

        return{start: start, end: end - 1};
    };

    this.getAutoCompleteList = function(preExpr, lastExpr) {
        var result;
        var token;
        var previousToken = ""
        var tokens = [];
        var stack = [];
        while ((result = xPathToken.exec(preExpr)) != null) {
            token = result[0];
            if(token == "[") {
                stack.unshift({type: "predicate", name: tokens[0] || ""});
            } else if(token == "(") {
                if(functionNameToken.test(previousToken))
                    stack.unshift({type: "function", name: tokens[0] || ""});
                else
                    stack.unshift({type: "bracket", name: tokens[0] || ""});
            } else if(token == "]" || token == ")") {
                stack.shift();
            }
            tokens.unshift(token);
            previousToken = token
        }

        var returning = [];

        var inside = (stack.length > 0? stack[0].type: null);

        if (!tokens.length) {
            // At the begining
            returning = extendArrays(["/"], this.getNodeList(lastExpr, inside, tokens, true) || [], this.Functions);
        } else if(tokens[0] == "|") {
            // After union operator
            returning = this.getNodeList(lastExpr, inside, tokens, true) || [];
        } else if(tokens[0] == "::" || tokens[0] == "@") {
            // After an Axis
            returning = this.getNodeList(lastExpr, inside, tokens, false) || [];
        } else if(include(["/", "//"], tokens[0])) {
            // After a separator or the root
            returning = this.getNodeList(lastExpr, inside, tokens, true) || [];
        } else if(include(["(", ",", "["], tokens[0]) ||
                // If the token is * or  name operator, we make sure it's actually an operator
                (tokens[0] != "*" && !include(this.NameOperators, tokens[0]) && include(this.Operators, tokens[0])) ||
                ((tokens[0] == "*" || include(this.NameOperators, tokens[0]))
                     && tokens[1] != undefined && !include(extendArrays(["@", "::", "(", "["], this.Operators), tokens[1]))
            ) {
            // After "(", "," "[" or an operator
            var nodeList = this.getNodeList(lastExpr, inside, tokens, true);
            if(nodeList)
                returning =  extendArrays(["/"], nodeList, this.Functions);
        } else if(expressionToken.test(tokens[0])) {
            // After an expression
            returning =  this.getOperators(tokens[0], inside);
        } else{
            return [];
        }
        if(tokens[0] == "." && returning.length > 0 && !include(returning, ".")) returning.unshift(".");
        if(tokens[0] == "/" && returning.length > 0 && !include(returning, "/")) returning.unshift("/");

        return returning;
    };

    this.getNodeList = function(lastExpr, inside, tokens, addAxes) {
        var flattenedExpr = this.flattenExpression(tokens);
        var returning = [];

        var result = this.evaluator.evaluateExpression(flattenedExpr + "*");

        var attribute = false;
        if(!result) return null;

        if(endsWith(flattenedExpr, "@") || endsWith(flattenedExpr, "attribute::")) {
            result.forEach(function(attribute) {
                add(returning, attribute.name);
            });
            attribute = true;
            this.addNamespacesAndSort(returning);
            if(returning.length > 0) returning.unshift("*");
        } else {
            result.forEach(function(node) {
                add(returning, getTagName(node));
            });
            this.addNamespacesAndSort(returning);
            if(this.evaluator.hasResult(flattenedExpr + "comment()")) returning.push("comment()");
            if(this.evaluator.hasResult(flattenedExpr + "node()")) returning.push("node()");
            if(this.evaluator.hasResult(flattenedExpr + "text()")) returning.push("text()");
            if(addAxes) {
                var parentExpression = flattenedExpr.replace(/\/$/, "");
                parentExpression += (endsWith(parentExpression, "/")?"descendant-or-self::node()":"");
                parentExpression = parentExpression || "/";
                result = this.evaluator.evaluateExpression(parentExpression);
                if(result) {
                    var hasSelf =  result.some(function(node) {return node.nodeType == 1;});
                    var hasAttribute = result.some(function(node) {return node.hasAttributes();});
                    var hasAncestor = result.some(function(node) {return node.parentNode && node.parentNode.nodeType==1;});
                    var hasDescendant = result.some(function(node) {return node.hasChildNodes();});
                    var hasFollowingSibling = result.some(function(node) {return hasNextSibling(node);});
                    var hasFollowing = hasFollowingSibling || result.some(function(node) {return hasFollowingNode(node);});
                    var hasPrecedingSibling = result.some(function(node) {return hasPreviousSibling(node);});
                    var hasPreceding = hasPrecedingSibling || result.some(function(node) {return hasPrecedingNode(node);});
                    returning.push(".");
                    if(hasAttribute) returning.push("@");
                    if(hasAncestor) returning.push("..");
                    if(hasAncestor) returning.push("ancestor::");
                    if(hasSelf || hasAncestor)returning.push("ancestor-or-self::");
                    if(hasDescendant) returning.push("descendant::");
                    if(hasSelf || hasDescendant)returning.push("descendant-or-self::");
                    if(hasFollowing) returning.push("following::");
                    if(hasFollowingSibling) returning.push("following-sibling::");
                    if(hasAncestor) returning.push("parent::");
                    if(hasPreceding) returning.push("preceding::");
                    if(hasPrecedingSibling) returning.push("preceding-sibling::");
                    if(hasDescendant) returning.push("child::");
                    if(hasSelf)returning.push("self::");
                    if(hasAttribute) returning.push("attribute::");

                    if(hasDescendant) returning.unshift("*");
                }
            } else {
                if(returning.length > 0) returning.unshift("*");
            }
        }

        if(returning.indexOf(lastExpr) != -1) {
            returning.unshift(lastExpr + " ");
            if(!attribute) returning.unshift(lastExpr + "/", lastExpr+"[");
            if(inside == "function") returning.unshift(lastExpr + ",", lastExpr + ")");
            if(inside == "bracket") returning.unshift(lastExpr + ")");
            if(inside == "predicate") returning.unshift(lastExpr + "]");
            if(!attribute) returning.unshift(lastExpr+"|");
        }
        return returning;
    };

    this.addNamespacesAndSort = function(returning) {
        var namespaces = [];
        for each(var node in returning) {
            if(getNamespace.test(node)) {
                add(namespaces, getNamespace.exec(node)[1] + "*");
            }
        }
        returning.push.apply(returning, namespaces);
        returning.sort();
    };

    this.getOperators = function(token, inside) {
        var returning;
        if((/\)|"[^"]*"|'[^']*'|\d+(?:\.\d?)?|\.\d+/).test(token))
            returning = cloneArray(this.NumberAndBooleanOperators);
        else
            returning = extendArrays(this.NodeSetOperators, this.NumberAndBooleanOperators);

        if(inside == "function") returning.unshift(",", ")");
        if(inside == "bracket") returning.unshift(")");
        if(inside == "predicate") returning.unshift("]");

        return returning;
    };

    this.addNamespacesAndSort = function(returning) {
        var namespaces = [];
        for each(var node in returning) {
            if(getNamespace.test(node)) {
                add(namespaces, getNamespace.exec(node)[1] + "*");
            }
        }
        returning.push.apply(returning, namespaces);
        returning.sort();
    };

    this.getOperators = function(token, inside) {
        var returning;
        if((/\)|"[^"]*"|'[^']*'|\d+(?:\.\d?)?|\.\d+/).test(token))
            returning = cloneArray(this.NumberAndBooleanOperators);
        else
            returning = extendArrays(this.NodeSetOperators, this.NumberAndBooleanOperators);

        if(inside == "function") returning.unshift(",", ")");
        if(inside == "bracket") returning.unshift(")");
        if(inside == "predicate") returning.unshift("]");

        return returning;
    };

    this.flattenExpression = function(tokens) {
        var inPredicate = 0;
        var inFunctionOrBracket = 0;
        var clone = cloneArray(tokens);
        var token;
        var flattenedExpression = [];

        // Piece of code used twice in the method
        function inPF() {
                if(token =="]") inPredicate++;
                else if(token =="[") inPredicate--;
                else if(token ==")") inFunctionOrBracket++;
                else if(token =="(") inFunctionOrBracket--;
        }

        while(token = clone.shift()) {
            // If we are in a function or predicate
            if(inPredicate == 0 && inFunctionOrBracket == 0 && (
                    include(["(", ",", "["], token) ||
                    // If the token is * or  name operator, we make sure it's actually an operator
                    (token != "*" && !include(this.NameOperators, token) && include(this.NumberAndBooleanOperators, token)) ||
                    ((token == "*" || include(this.NameOperators, token))
                         && clone[0] != undefined && !include(extendArrays(["@", "::", "(", "["], this.Operators), clone[0]))
                )
            )
            {
                //if the last token is the root
                if(include(["/", "//"], flattenedExpression[0]))
                    break;

                // Find the end of the function or predicate
                do {
                    inPF();
                    if(inPredicate < 0 || inFunctionOrBracket < 0) break;
                } while(token = clone.shift());

                // Remove the function name (if in a function)
                if(inFunctionOrBracket < 0) {
                    if(functionNameToken.test(clone[0]))
                        token = clone.shift();
                    else {
                        inFunctionOrBracket = 0;
                        inPredicate = 0;
                        continue;
                    }
                }

                // Reset inFunction and inPredicate
                inFunctionOrBracket = 0;
                inPredicate = 0;

                flattenedExpression.unshift("/");
            } else {
                inPF();
                if(token =="|") break;
                flattenedExpression.unshift(token);
            }
        }
        return flattenedExpression.join(" ");
    };

    this.NodeSetOperators = [
        "/",
        "//",
        "|",
        "["
    ];

    this.NumberAndBooleanOperators = [
        "and ",
        "or ",
        "< ",
        "<= ",
        "> ",
        ">= ",
        "= ",
        "+ ",
        "- ",
        "* ",
        "div ",
        "mod "
    ];

    this.Operators = [
        "and",
        "or",
        "<",
        "<=",
        ">",
        ">=",
        "=",
        "+",
        "-",
        "*",
        "div",
        "mod",
        "/",
        "//",
        "|"
    ];

    this.NameOperators = [
        "and",
        "or",
        "div",
        "mod"
    ];

    this.Functions = [
        "concat(",
        "substring(",
        "substring-after(",
        "substring-before(",
        "string(",
        "local-name(",
        "name(",
        "namespace-uri(",
        "normalize-space(",
        "translate(",
        "ceiling(",
        "count(",
        "floor(",
        "last()",
        "number(",
        "position()",
        "round(",
        "sum(",
        "boolean(",
        "contains(",
        "false()",
        "lang(",
        "not(",
        "starts-with(",
        "string-length(",
        "true()",
    ];

    this.list.addEventListener("click", this.autocompletePanelPress.bind(this), false);
    this.list.addEventListener("keypress", this.autocompletePanelPress.bind(this), false);
    this.list.addEventListener("popupshown", this.autocompletePanelOpen.bind(this), false);
}


// ************************************************************************************************
// Firebug 辅助函数
var Str = {}, Arr = {};

Str.hasPrefix = function(hay, needle) {
    // Passing empty string is ok, but null or undefined is not.
    if (hay == null) {
        return false;
    }

    // This is the fastest way of testing for prefixes - (hay.indexOf(needle) === 0)
    // can be O(|hay|) in the worst case, and (hay.substr(0, needle.length) === needle)
    // unnecessarily creates a new string and might be O(|needle|) in some JavaScript
    // implementations. See the discussion in issue 3071.
    return hay.lastIndexOf(needle, 0) === 0;
};

Arr.cloneArray = function(array, fn) {
    var newArray = [],
        len = array.length;

    if (fn)
        for (var i = 0; i < len; ++i)
            newArray.push(fn(array[i]));
    else
        for (var i = 0; i < len; ++i)
            newArray.push(array[i]);

    return newArray;
};


// ************************************************************************************************
// Auto Completion Helpers

function extendArrays(){
    var newArray = [];
    for (var i = 0; i < arguments.length; i++) {
        newArray.push.apply(newArray, arguments[i]);
    }
    return newArray;
}

function include (arrayOrString, value) {
    try{
        return arrayOrString.indexOf(value) != -1;
    } catch(e) {
        return false;
    }
}

function add(array, value) {
    if(!include(array, value)) {
        array.push(value);
    }
}

function endsWith(string, end) {
    return string.search(end+"$") != -1;
}

function hasNextSibling(node) {
    return !!getNextElement(node.nextSibling)
}

function hasPreviousSibling(node) {
    return !!getPreviousElement(node.previousSibling)
}

function hasFollowingNode(node) {
    var parent = node;
    while(parent = parent.parentNode) {
        if(hasNextSibling(parent))
            return true;
    }
    return false;
}

function hasPrecedingNode(node) {
    var parent = node;
    while(parent = parent.parentNode) {
        if(hasPreviousSibling(parent))
            return true;
    }
    return false;
}

function cloneArray(arr){
    return arr.slice(0);
}

function isHtmlDocument(doc) {
    return doc.contentType === 'text/html';
}

function getTagName(node) {
    var ns = node.namespaceURI;
    var prefix = node.lookupPrefix(ns);

    //if an element has a namespace it needs a prefix
    if(ns != null && !prefix) {
        prefix = getPrefixFromNS(ns);
    }

    var name = node.localName;
    if (isHtmlDocument(node.ownerDocument)) {
        //lower case only for HTML document
        return name.toLowerCase();
    } else {
        return (prefix? prefix + ':': '') + name;
    }
}

function getPrefixFromNS(ns) {
    return ns.replace(/.*[^\w](\w+)[^\w]*$/, "$1");
}

// 来自 Firebug DOM.js
function getNextElement(node){
    while (node && node.nodeType != Node.ELEMENT_NODE)
        node = node.nextSibling;

    return node;
}
function getPreviousElement(node){
    while (node && node.nodeType != Node.ELEMENT_NODE)
        node = node.previousSibling;

    return node;
}
