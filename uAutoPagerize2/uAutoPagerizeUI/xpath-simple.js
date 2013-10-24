/**
 * getXPath 来自 siteinfo_write.uc.js
 */

var autopagerXPath = {
    NEXT_REG: /[下后][一]?[页张个篇章节步]|next/i,
    PAGE_KEY: /page|nav|next|^pg$|^nxt$/i,
    MAXTextLength: 20,
    MAXLevel: 6,

    ATTR_CLASSID: 0,
    ATTR_ID: 1,
    ATTR_CLASS: 2,
    ATTR_NOT_CLASSID: 3,
    ATTR_FULL: 4,
    TEXT: 5,
    getXPath: function(originalTarget, aType) {
        this.isNextLink = aType == "nextLink";

        var nodes = getElementsByXPath('ancestor-or-self::*[not(local-name()="html" or local-name()="HTML" or local-name()="body" or local-name()="BODY")]', originalTarget).reverse();
        if (nodes.length == 0) return [];

        var current = nodes.shift();
        var obj = {};
        obj.localnames = current.localName;
        obj.self_classid = this.getElementXPath(current, this.ATTR_CLASSID);
        obj.self_id = this.getElementXPath(current, this.ATTR_ID);
        obj.self_class = this.getElementXPath(current, this.ATTR_CLASS);
        obj.self_attr = this.getElementXPath(current, this.ATTR_NOT_CLASSID);
        obj.self_full = this.getElementXPath(current, this.ATTR_FULL);
        obj.ancestor_classid = obj.self_classid;
        obj.ancestor_id = obj.self_id;
        obj.ancestor_class = obj.self_class;
        obj.ancestor_attr = obj.self_attr;
        obj.ancestor_full = obj.self_full;
        if (this.isNextLink) {
            obj.self_text = this.getElementXPath(current, this.TEXT);
            obj.ancestor_text = obj.self_text;
        }

        var hasId = current.getAttribute("id");
        var hasPageKey = false;
        for (let[i, elem] in Iterator(nodes)) {
            obj.localnames = elem.localName + "/" + obj.localnames;

            if (this.isNextLink && !(hasId || hasPageKey)) {
                hasPageKey = this.PAGE_KEY.test(elem.getAttribute("class"));
                obj.ancestor_text = this.getElementXPath(elem, this.ATTR_CLASSID) + "/" + obj.ancestor_text;
            }

            if (!hasId) {
                hasId = elem.getAttribute("id");
                obj.ancestor_classid = this.getElementXPath(elem, this.ATTR_CLASSID) + "/" + obj.ancestor_classid;
                obj.ancestor_id = this.getElementXPath(elem, this.ATTR_ID) + "/" + obj.ancestor_id;
                obj.ancestor_full = this.getElementXPath(elem, this.ATTR_FULL) + "/" + obj.ancestor_full;
            }

            obj.ancestor_class = this.getElementXPath(elem, this.ATTR_NOT_CLASS) + "/" + obj.ancestor_class;
            obj.ancestor_attr = this.getElementXPath(elem, this.ATTR_NOT_CLASSID) + "/" + obj.ancestor_attr;
        }

        if (this.isNextLink) {
            var xpaths = obj.ancestor_text.split("/");
            if (xpaths.length >= 3) {
                var lastXPath = xpaths.pop();
                xpaths.pop(); //去掉倒数第2个
                obj.text_descendant = xpaths.join("/") + "/descendant::" + lastXPath;
            }
        }

        for (let[key, val] in Iterator(obj)) {
            if (val.substr(0, 4) !== 'id("'){
                // 排除第一个没有属性的
                let x = obj[key].split("/")[0];
                if(x.indexOf("[") == -1){
                    delete obj[key];
                    continue;
                }

                obj[key] = val = "//" + val;
            }
        }

         var res = [x for each(x in obj)].filter(function(e, i, a) a.indexOf(e) === i).sort(function(a, b) {
            let aa = a.substr(0, 4) == 'id("';
            let bb = b.substr(0, 4) == 'id("';
            if ((aa && bb) || (!aa && !bb))
                return b.length - a.length;
            return bb ? 1 : -1;
         });

        if (hasPageKey) { // 移动到第一个
            let old_index = res.indexOf(obj.ancestor_text);
            res.splice(0, 0, res.splice(old_index, 1)[0]);
        }

        return res;
    },
    getElementXPath: function(elem, constant) {
        if (!elem.getAttribute) return "";

        if (this.ATTR_CLASSID == constant) {
            if (elem.getAttribute("id"))
                return  elem.nodeName.toLowerCase() + '[@id="' + elem.getAttribute("id") + '"]';
            if (elem.getAttribute("class"))
                return elem.nodeName.toLowerCase() + '[@class="' + elem.getAttribute("class") + '"]';
            return elem.nodeName.toLowerCase();
        }
        if (this.ATTR_ID == constant) {
            if (elem.getAttribute("id"))
                return elem.nodeName.toLowerCase() + '[@id="' + elem.getAttribute("id") + '"]';
            return elem.nodeName.toLowerCase();
        }
        if (this.ATTR_CLASS == constant) {
            if (elem.getAttribute("class"))
                return elem.nodeName.toLowerCase() + '[@class="' + elem.getAttribute("class") + '"]';
            return elem.nodeName.toLowerCase();
        }
        if (this.isNextLink && this.TEXT == constant) {
            var text = elem.textContent;
            if (text.length < this.MAXTextLength) {
                var m = text.match(this.NEXT_REG);
                if (m) {
                    let xpath = elem.nodeName.toLowerCase();
                    let arr = [];
                    if (elem.hasAttribute("rel"))
                        arr.push('@rel="' + elem.getAttribute("rel") + '"');
                    if(elem.hasAttribute("id"))
                        arr.push('@id="' + elem.getAttribute("id") + '"');
                    if(this.PAGE_KEY.test(elem.getAttribute("class")))
                        arr.push('@class="' + elem.getAttribute("class") + '"');
                    if (text == m[0] || text.indexOf(">") > 0)
                        arr.push('text()="' + text + '"');
                    else
                        arr.push('contains(text(), "' + m[0] + '")');

                    return xpath += '[' + arr.join(" and ") + ']';
                }
            }
            return elem.nodeName.toLowerCase();
        }

        var xpath = elem.nodeName.toLowerCase();
        if (this.ATTR_FULL == constant) {
            let x = [];
            if (elem.hasAttribute("id"))
                x[x.length] = '@id="' + elem.getAttribute("id") + '"';
            if (elem.hasAttribute("class"))
                x[x.length] = '@class="' + elem.getAttribute("class") + '"';
            if (x.length)
                xpath += '[' + x.join(" and ") + ']';
        }

        var arr = [
            "@"+ x.nodeName +'="'+ x.nodeValue +'"'
                for each(x in Array.slice(elem.attributes))
                    if (!/^(?:id|class|style|href)$/i.test(x.nodeName))
        ];

        if (arr.length > 0)
            xpath += '[' + arr.join(" and ") + ']';
        return xpath;
    },
};

function autopagerXPathItem() {
    this.xpath = "";
    this.authority = 0;
    this.matchCount = 0;
    this.tmpCount = 1;
}


function getElementsByXPath(xpath, node) {
    var nodesSnapshot = getXPathResult(xpath, node, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
    var data = [];
    for (var i = 0, l = nodesSnapshot.snapshotLength; i < l; i++) {
        data[i] = nodesSnapshot.snapshotItem(i);
    }
    return data;
}

function getFirstElementByXPath(xpath, node) {
    var result = getXPathResult(xpath, node, XPathResult.FIRST_ORDERED_NODE_TYPE);
    return result.singleNodeValue;
}

function getXPathResult(xpath, node, resultType) {
    var doc = node.ownerDocument || node
    var resolver = doc.createNSResolver(node.documentElement || node)
    // Use |node.lookupNamespaceURI('')| for Opera 9.5
    var defaultNS = node.lookupNamespaceURI(null)
    if (defaultNS) {
        const defaultPrefix = '__default__'
        xpath = addDefaultPrefix(xpath, defaultPrefix)
        var defaultResolver = resolver
        resolver = function(prefix) {
            return (prefix == defaultPrefix) ? defaultNS : defaultResolver.lookupNamespaceURI(prefix)
        }
    }
    return doc.evaluate(xpath, node, resolver, resultType, null)
}

function addDefaultPrefix(xpath, prefix) {
    const tokenPattern = /([A-Za-z_\u00c0-\ufffd][\w\-.\u00b7-\ufffd]*|\*)\s*(::?|\()?|(".*?"|'.*?'|\d+(?:\.\d*)?|\.(?:\.|\d+)?|[\)\]])|(\/\/?|!=|[<>]=?|[\(\[|,=+-])|([@$])/g
    const TERM = 1, OPERATOR = 2, MODIFIER = 3
    var tokenType = OPERATOR
    prefix += ':'

        function replacer(token, identifier, suffix, term, operator, modifier) {
            if (suffix) {
                tokenType =
                    (suffix == ':' || (suffix == '::' &&
                    (identifier == 'attribute' || identifier == 'namespace'))) ? MODIFIER : OPERATOR
            } else if (identifier) {
                if (tokenType == OPERATOR && identifier != '*') {
                    token = prefix + token
                }
                tokenType = (tokenType == TERM) ? OPERATOR : TERM
            } else {
                tokenType = term ? TERM : operator ? OPERATOR : MODIFIER
            }
            return token
        }
    return xpath.replace(tokenPattern, replacer)
}
