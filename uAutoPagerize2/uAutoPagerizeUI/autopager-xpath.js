/*
 * Come From AutoPager.xpi
 */

var autopagerXPath = {
    smarttext: "next|>|下一页|下一頁|翻页|翻下页|下一章|下一张|下一幅|下一节|下一篇|后一页|前进|下篇|后页|往后|次を表示",
    discoverytext: "navbar|right_arrow|pagN|page|pages|paging|下页|次页|Volgende|Volg|Verder|次へ",
    MAXTextLength: 20,
    MAXLevel: 6,
    existingSites: [],

    discovery: function(doc, xpathes) {
        var url = doc.documentURI;
        return new autopagerDiscoveryResult(doc, xpathes);
    },
    discoveryLink: function(doc, xpathes) {
        xpathes = xpathes || [];
        var url = doc.documentURI;

        var smarttext = this.smarttext;
        var discoverytext = this.discoverytext;

        var body = doc.documentElement.innerHTML
        var strs = (smarttext + "|" + discoverytext).split("|");
        var texts = "|";
        var ignoredTexts = "|";
        for (var k = 0; k < strs.length; ++k)
            strs[k] = strs[k].toLowerCase().replace(new RegExp(" ", "gm"), "");
        for (var k = 0; k < strs.length; ++k) {
            if (strs[k].length == 0)
                continue;
            if (texts.indexOf("|" + strs[k] + "|") == -1 && ignoredTexts.indexOf("|" + strs[k] + "|") == -1) {
                if (body.indexOf(strs[k]) != -1)
                    texts = texts + strs[k] + "|";
                else
                    ignoredTexts = ignoredTexts + strs[k] + "|";
            }
        }
        var tmpPaths = this.convertToXpath(texts);
        //var tmpPaths2 =  this.convertToXpath(discoverytext);

        //tmpPaths = this.merge(tmpPaths,tmpPaths2);
        var links = []; //this.evaluate(doc,"//a[@href]");
        var item = null;
        for (var i in tmpPaths) {
            //get the nodes
            var urlNodes = this.evaluate(doc, tmpPaths[i]);
            if (urlNodes != null && urlNodes.length != 0) {
                for (var level = 1; level < this.MAXLevel; level += 1) {
                    var items = this.getLinkXPathItemFromNodes(doc, urlNodes, level);
                    for (var l in items) {
                        item = items[l];
                        if (item != null)
                            this.addItem(doc, links, item);
                    }
                }
            }
        }
        //get others
        //

        var existingSites = this.existingSites;
        for (var i in existingSites) {
            var site = existingSites[i];
            //try the existing site settings
            var nodes = this.evaluate(doc, site.linkXPath, true, 10);
            if (nodes != null && nodes.length > 0) {
                item = new autopagerXPathItem();
                item.authority = 4;
                item.xpath = site.linkXPath
                item.matchCount = nodes.length
                this.addItem(doc, links, item);
            }
        }
        var knowLinks = [];
        for (var n in xpathes) {
            var site = xpathes[n];
            //try the existing site settings
            var nodes = this.evaluate(doc, site.n, true, 10);
            if (nodes != null && nodes.length > 0) {
                item = new autopagerXPathItem();
                item.authority = Math.sqrt(site.c);
                item.matchCount = nodes.length

                if (site.n != "//a[contains(text(),'Next')]" && site.n != "//a[contains(text(),'next')]") {
                    nodes = this.evaluate(doc, site.x, true, 2);
                    if (nodes != null && nodes.length > 0)
                        item.authority = item.authority * 3;
                }
                item.xpath = site.n
                knowLinks.push(item)
                //this.addItem(doc,links,item);
                //site.xpathItem = item
            }
        }
        knowLinks = this.sortItems(knowLinks);
        for (var i = 0; i < knowLinks.length; i++) {
            var l = knowLinks[i]
            var ignore = false;
            for (var n = 0; n < i; n++) {
                if (l.xpath == knowLinks[n].xpath) {
                    ignore = true;
                    break;
                }
            }
            if (!ignore)
                this.addItem(doc, links, l);
        }


        //try the links next to this page
        item = new autopagerXPathItem();
        item.authority = 0.2;
        item.xpath = "(//a[@href and @href = %href%]/following-sibling::a[1])[translate(text(),'0123456789','')='']";
        this.addItem(doc, links, item);

        //		item = new autopagerXPathItem();
        //        item.authority = 1;
        //        item.xpath = "//a[@href and @href = %href%]/following-sibling::a[1]";
        //        this.addItem(doc,links,item);

        //try the links next to this page
        item = new autopagerXPathItem();
        item.authority = 0.1;
        item.xpath = "(//a[@href and %href% = concat(%pathname%,@href) ]/following-sibling::a[1])[translate(text(),'0123456789','')='']";
        this.addItem(doc, links, item);

        //		//try the links next to this page
        //        item = new autopagerXPathItem();
        //        item.authority = 0.6;
        //        item.xpath = "//a[@href and %href% = concat(%pathname%,@href) ]/following-sibling::a[1]";
        //        this.addItem(doc,links,item);
        //
        //        //try the links next to this page
        //        item = new autopagerXPathItem();
        //        item.authority = 0.6;
        //        item.xpath = "//a[@href and contains(@href , concat(%pathname% , %search%))]/following-sibling::a[1]";
        //        this.addItem(doc,links,item);

        //try the links next to this page
        item = new autopagerXPathItem();
        item.authority = 0.1;
        item.xpath = "(//a[@href and contains(@href , concat(%pathname% , %search%))]/following-sibling::a[1])[translate(text(),'0123456789','')='']";
        this.addItem(doc, links, item);

        //        //try the links next to this page
        //        item = new autopagerXPathItem();
        //        item.authority = 0.6;
        //        item.xpath = "//a[@href and contains(concat(%pathname% , %search%),@href)]/following-sibling::a[1]";
        //        this.addItem(doc,links,item);

        //try the links next to this page
        item = new autopagerXPathItem();
        item.authority = 0.1;
        item.xpath = "(//a[@href and contains(concat(%pathname% , %search%),@href)]/following-sibling::a[1])[translate(text(),'0123456789','')='']";
        this.addItem(doc, links, item);

        //        //try the links next to this page
        //        item = new autopagerXPathItem();
        //        item.authority = 0.6;
        //        item.xpath = "//a[@href and contains(@href , %href%)]/following-sibling::a[1]";
        //        this.addItem(doc,links,item);

        //try the links next to this page
        item = new autopagerXPathItem();
        item.authority = 0.12;
        item.xpath = "(//a[@href and contains(@href , %href%)]/following-sibling::a[1])[translate(text(),'0123456789','')='']";
        this.addItem(doc, links, item);

        //        //try the links next to this page
        //        item = new autopagerXPathItem();
        //        item.authority = 0.1;
        //        item.xpath = "//a[@href and contains(@href , %filename%)]/following-sibling::a[1]";
        //        this.addItem(doc,links,item);
        //try the links next to this page
        item = new autopagerXPathItem();
        item.authority = 0.1;
        item.xpath = "(//a[@href and contains(@href , %filename%)]/following-sibling::a[1])[translate(text(),'0123456789','')='']";
        this.addItem(doc, links, item);

        //try to find the page navigator, then find next links
        var navBars = this.evaluate(doc, "//*[count(a[text() != '' and translate(text(),'0123456789','')=''])>=2]/a[text() != '' and translate(text(),'0123456789','')='']");
        if (navBars && navBars.length != 0) {
            for (var level = 1; level < this.MAXLevel; level += 1) {
                var paths = this.anaLyzeNavbar(doc, navBars, level);
                for (var i in paths) {
                    item = new autopagerXPathItem();
                    item.authority = (this.MAXLevel / level);
                    item.xpath = paths[i];
                    if (item.xpath.indexOf("//input") != -1)
                        item.authority = item.authority / 2;
                    this.addItem(doc, links, item);
                }
            }
        }

        item = new autopagerXPathItem();
        item.xpath = "//*[count(a[text() != '' and translate(text(),'0123456789','')=''])>=2 ]/*[name()='STRONG' or name()='B']/following-sibling::a[1]";
        item.authority = 4;
        this.addItem(doc, links, item);

        links = this.mergeXPath(links);
        var newlinks = [];
        for (var i = 0; i < links.length; ++i) {
            if (links[i].authority > 0.005 && links[i].matchCount < 40)
                newlinks.push(links[i])
        }
        links = this.sortItems(newlinks);
        return links;
    },
    discoveryMoreLinks: function(doc, links, nodes) {
        for (var level = 1; level < this.MAXLevel; level += 1) {
            var items = this.getLinkXPathItemFromNodes(doc, nodes, level);
            for (var i in items) {
                var item = items[i];
                if (item != null)
                    this.addItem(doc, links, item);
            }
        }
        links = this.mergeXPath(links);
        links = this.sortItems(links);
        var newLinks = [];
        //filter it again
        for (var i = 0; i < links.length; i++) {
            var item = links[i]
            if (this.isMatchNodes(doc, item.xpath, nodes))
                newLinks.push(item);
        }
        return newLinks;
    },
    isMatchNodes: function(doc, xpath, nodes) {
        var matchNodes = this.evaluate(doc, xpath);
        if (matchNodes != null && matchNodes.length > 0) {
            for (var n = 0; n < nodes.length; n++)
                for (var i = 0; i < matchNodes.length; i++) {
                    if (nodes[n].isEqualNode(matchNodes[i]))
                        return true;
                }
        }
        return false;
    },
    sortItems: function(links) {
        links.sort(function authority(a, b) {
            if (b.authority == a.authority) {
                if (a.xpath.length == b.xpath.length)
                    return a.matchCount - b.matchCount;
                return a.xpath.length - b.xpath.length;
            }
            return b.authority - a.authority;
        });
        return links;
    },
    modifyAuthoryByDeep: function(item) {
        var reg = /\/\/|\//g;
        var count = 0;
        while (reg.exec(item.xpath)) {
            count++;
        }
        if (count >= 2)
            count = count / 1.5;
        else if (count == 0)
            count = 1;
        return item.authority / count;
    },
    mergeXPath: function(links) {
        //return links;
        for (var i = 0; i < links.length; ++i) {
            var item = links[i];
            item.authority = this.modifyAuthoryByDeep(item);
        }

        for (var i = 0; i < links.length; ++i) {
            var item = links[i];
            for (var j = i + 1; j < links.length; ++j) {
                if (links[i].matchCount == links[j].matchCount) {
                    var left = -1;
                    var right = -1;
                    if (this.xpathContain(links[i], links[j])) {
                        left = j
                        right = i;
                    } else if (this.xpathContain(links[j], links[i])) {
                        left = i
                        right = j;
                    }
                    if (left >= 0) {
                        if (links[left].authority < links[right].authority)
                            links[left].authority = links[right].authority;
                        if (links[right].matchCount > 2)
                            links[left].authority = links[left].authority + 1 / links[right].matchCount;
                        else
                            links[left].authority = links[left].authority + 1;
                    }
                }
            }
        }
        var newlinks = [];
        for (var i = 0; i < links.length; ++i) {
            if (links[i].xpath.length < 128)
                newlinks.push(links[i])
        }

        return newlinks;
    },
    xpathContain: function(item1, item2) {
        if (item2.xpath.substring(0, 2) == '//') {
            return item1.xpath.indexOf(item2.xpath.substring(1)) >= 0;
        }
        return item1.xpath.indexOf(item2.xpath) >= 0;
    },
    merge: function(array1, array2) {
        for (var i in array2) {
            if (array1.indexOf(array2[i]) == -1)
                array1.push(array2[i]);
        }
        return array1;
    },
    addItem: function(doc, links, item) {
        //ignore
        if (!item.xpath || item.xpath == "//a")
            return;

        // debug("Start " + item.xpath + " " + item.authority);
        item.authority = this.modifyAuthoryByDeep(item);
        for (var i in links) {
            if (links[i].xpath == item.xpath) {
                if (links[i].matchCount > 1) {
                    if (item.xpath[0] != item.xpath[item.xpath.length - 1]) {
                        item.authority = item.authority / item.xpath.length;
                    }
                }
                if (links[i].matchCount > 2)
                    links[i].authority = links[i].authority + (item.authority / links[i].matchCount);
                else
                    links[i].authority = links[i].authority + item.authority;
                return;
            }
        }
        var nodes = this.evaluate(doc, item.xpath);
        if (nodes != null && nodes.length > 0) {
            item.matchCount = nodes.length;
            if (nodes.length > 1) {
                if (nodes[0] != nodes[nodes.length - 1]) {
                    item.authority = item.authority / nodes.length;
                }
            }
            if (item.matchCount > 2)
                item.authority = item.authority / item.matchCount;


            //if the xpath use possion, lower it's 'authority
            if (/\d( )*]/.test(item.xpath.replace("following-sibling\:\:a\[1\]", ""))) {
                item.authority = item.authority / 2;
            }
            links.push(item);
        }
        //debug("End " + item.xpath + " " + item.authority);

    },
    getLinkXPathItemFromNodes: function(node, urlNodes, level) {
        var items = [];
        var item = null;

        //if we only get one node
        if (urlNodes.length == 1) {
            item = new autopagerXPathItem();
            item.xpath = this.getLinkXpathFromNode(node, urlNodes[0], level);
            item.authority = (this.MAXLevel / level);
            if (urlNodes[0].tagName != 'A'  )
                item.authority = item.authority / 3;
            items.push(item);

            item = new autopagerXPathItem();
            item.xpath = this.getXPathForObjectByParent(urlNodes[0], 3, level);
            item.authority = (this.MAXLevel / level);
            if (urlNodes[0].tagName != 'A')
                item.authority = item.authority / 3;
            items.push(item);

            var xpath = this.getXPathForObjectBySibling(urlNodes[0], 3, level);
            if (xpath) {
                item = new autopagerXPathItem();
                item.xpath = xpath
                item.authority = (this.MAXLevel / level);
                if (urlNodes[0].tagName != 'A')
                    item.authority = item.authority / 3;
                items.push(item);

                item = new autopagerXPathItem();
                item.xpath = xpath
                if (item.xpath.substr(-3) != "[1]")
                    item.xpath = item.xpath + "[1]"
                item.authority = (this.MAXLevel / level);
                if (urlNodes[0].tagName != 'A')
                    item.authority = item.authority / 3;
                items.push(item);
            }

            xpath = this.getXPathForObjectBySibling2(urlNodes[0], 3, level);
            if (xpath) {
                item = new autopagerXPathItem();
                item.xpath = xpath
                item.authority = (this.MAXLevel / level) + 0.2;
                if (urlNodes[0].tagName != 'A')
                    item.authority = item.authority / 3;
                items.push(item);

                item = new autopagerXPathItem();
                item.xpath = xpath;
                if (item.xpath.substr(-3) != "[1]")
                    item.xpath = item.xpath + "[1]"
                item.authority = (this.MAXLevel / level) + 0.2;
                if (urlNodes[0].tagName != 'A')
                    item.authority = item.authority / 3;
                items.push(item);
            }

            item = new autopagerXPathItem();
            item.xpath = this.getXPathForObjectByPosition(urlNodes[0], 3, level);
            item.authority = (this.MAXLevel / level) / 1.2;
            if (urlNodes[0].tagName != 'A')
                item.authority = item.authority / 3;
            items.push(item);
        } else if (urlNodes.length <= 4) {
            item = new autopagerXPathItem();
            item.authority = (this.MAXLevel / level);
            if (urlNodes[0].tagName != 'A'  )
                item.authority = item.authority / 3;
            item.xpath = this.getLinkXpathFromTwoNodes(node, urlNodes[0], urlNodes[1], level);
            items.push(item);
        } else // too many links, ignore this
        {
            var paths = this.anaLyzeNavbar(node, urlNodes, level);
            for (var i in paths) {
                item = new autopagerXPathItem();
                item.authority = (this.MAXLevel / level);
                if (urlNodes[0].tagName != 'A')
                    item.authority = item.authority / 3;
                item.xpath = paths[i];
                items.push(item);
            }
        }
        return items;

    },
    getLinkXpathFromTwoNodes: function(parents, node1, node2, level) {
        //find the similar thing in node1 and node2
        //todo
        return this.getXPathForObjectByChild(node1, 3, level);
    },
    getText: function(x) {
        if (x.nodeValue != null && String(x.nodeValue) != "")
            return String(x.nodeValue);
        if (x.lastChild != null && x.lastChild.nodeValue != null)
            return String(x.lastChild.nodeValue);
        return "";
    },
    anaLyzeNavbar: function(node, urlNodes, level) {
        var nodes = [];
        for (var i = 0; i < urlNodes.length; ++i) {
            var num = parseInt(autopagerXPath.getText(urlNodes[i]));
            if (num != NaN) {
                nodes.push(urlNodes[i]);
            }
        }

        nodes.sort(function(x, y) {
            var txt1 = parseInt(autopagerXPath.getText(x));
            var txt2 = parseInt(autopagerXPath.getText(y));
            return txt1 - txt2;
        });
        var xpaths = [];
        for (var i = 0; i < nodes.length - 1; i++) {
            if (parseInt(this.getText(nodes[i + 1])) == 2 + parseInt(this.getText(nodes[i]))) {
                var xpath = this.getXPathForObjectByChild(nodes[i + 1], 3, level);
                if (xpath != null && xpath.length > 0)
                    xpaths.push(xpath);
                xpath = this.getXPathForObjectByParent(nodes[i + 1], 3, level);
                if (xpath != null && xpath.length > 0)
                    xpaths.push(xpath);
                xpath = this.getXPathForObjectBySibling(nodes[i + 1], 3, level);
                if (xpath != null && xpath.length > 0)
                    xpaths.push(xpath);
                xpath = this.getXPathForObjectBySibling2(nodes[i + 1], 3, level);
                if (xpath != null && xpath.length > 0)
                    xpaths.push(xpath);
            }
        }
        if (xpaths.length == 0 && nodes.length > 0) {
            var xpath = this.getXPathForObjectBySibling(nodes[0], 3, level);
            if (xpath != null && xpath.length > 0)
                xpaths.push(xpath);
            xpath = this.getXPathForObjectBySibling2(nodes[0], 3, level);
            if (xpath != null && xpath.length > 0)
                xpaths.push(xpath);
        }
        return xpaths;
    },
    getLinkXpathFromNode: function(parents, node, level) {
        return this.getXPathForObjectByChild(node, 3, level);
    },

    appendAndCondition: function(base, newStr) {
        if (base.length > 0) {
            if (newStr.length > 0)
                return base + " and " + newStr;
            else
                return base;
        }
        return newStr;
    },
    getClearText: function(str) {
        return str.replace(new RegExp("^[  \t \n \r]*", "gm"), "").replace(new RegExp("([  \t \n \r]*)$", "gm"), "");
    },
    getXIdetify: function(node, dir, level) {
        var xi = "";
        try {
            if (level >= 1 && node.getAttribute("id") != null && node.getAttribute("id").length > 0) {
                xi = this.appendAndCondition(xi, dir + "@id='" + node.getAttribute("id") + "'");
            }
            if (level >= 1 && node.getAttribute("rel") != null && node.getAttribute("rel").length > 0) {
                xi = this.appendAndCondition(xi, dir + "@rel='" + node.getAttribute("rel") + "'");
            }
            if (level >= 2 && (node.className != null) && (node.className.length > 0)) {
                xi = this.appendAndCondition(xi, dir + "@class='" + node.className + "'");
            }
            if (level >= 3 && node.getAttribute("title") != null && node.getAttribute("title").length > 0) {
                xi = this.appendAndCondition(xi, dir + "@title='" + node.getAttribute("title") + "'");
            }
            if (level >= 3 && level < 5 && node.textContent != null && node.childNodes.length == 1 && node.textContent.length > 0 && node.textContent.length < this.MAXTextLength) {
                //only if child is #text
                var child = node.childNodes[0];

                if (child.nodeType == 3)
                    xi = this.appendAndCondition(xi, "(" + dir + "text()='" + this.getClearText(child.textContent) + "')");
            }
            if (level >= 5 && node.textContent != null && node.childNodes.length == 1 && node.textContent.length > 0 && node.textContent.length < this.MAXTextLength) {
                //only if child is #text
                var child = node.childNodes[0];

                if (child.nodeType == 3)
                    xi = this.appendAndCondition(xi, "contains(" + dir + "text(),'" + this.getClearText(child.textContent) + "')");
            }
            if (node.tagName == "INPUT") {
                if (level >= 3 && node.getAttribute("type") != null && node.getAttribute("type").length > 0) {
                    xi = this.appendAndCondition(xi, dir + "@type='" + node.getAttribute("type") + "'");
                }
                if (level >= 1 && node.getAttribute("name") != null && node.getAttribute("name").length > 0) {
                    xi = this.appendAndCondition(xi, dir + "@name='" + node.getAttribute("name") + "'");
                }
                if (level >= 3 && node.getAttribute("value") != null && node.getAttribute("value").length > 0) {
                    xi = this.appendAndCondition(xi, dir + "@value='" + node.getAttribute("value") + "'");
                }
                if (level >= 3 && node.getAttribute("src") != null && node.getAttribute("src").length > 0) {
                    xi = this.appendAndCondition(xi, dir + "@src='" + node.getAttribute("src") + "'");
                }
            } else if (node.tagName == "IMG") {
                if (level >= 3 && node.getAttribute("src") != null && node.getAttribute("src").length > 0) {
                    xi = this.appendAndCondition(xi, dir + "@src='" + node.getAttribute("src") + "'");
                }
                if (level >= 3 && node.getAttribute("alt") != null && node.getAttribute("alt").length > 0) {
                    xi = this.appendAndCondition(xi, dir + "@alt='" + node.getAttribute("alt") + "'");
                }
            }
        } catch (e) {
            autopagerMain.alertErr(e);
        }
        return xi;
    },
    getTagCount: function(childs, index) {
        var tagCount = 0;
        var tagname = childs[index].tagName;
        for (var i = childs.length - 1; i >= 0; --i) {
            if (childs[i].tagName == tagname)
                tagCount++;
        }
        return tagCount;
    },

    getTagIndex: function(childs, index) {
        var tagIndex = 1;
        var tagname = childs[index].tagName;
        for (var i = index - 1; i >= 0; --i) {
            if (childs[i].tagName == tagname)
                tagIndex++;
        }
        return tagIndex;
    },
    getXPath: function(node, dir, deep, maxChildCount, level) {
        var xi = this.getXIdetify(node, dir, level);
        if (deep > 0 && node.hasChildNodes() && (node.childNodes != null) && (node.childNodes.length > 0)) {
            var childs = node.childNodes;
            for (var i = 0; i < childs.length; ++i) {
                if (childs[i].nodeType == 1) {
                    var tagname = childs[i].tagName.toLowerCase();
                    if (maxChildCount >= this.getTagIndex(childs, i)) {
                        if (this.getTagCount(childs, i) > 1)
                            tagname = tagname + "[" + this.getTagIndex(childs, i) + "]";
                        xi = this.appendAndCondition(xi,
                            this.getXPath(childs[i], dir + tagname + "/", deep - 1, maxChildCount, level));
                    }
                }
            }
        }
        return xi;
    },
    getTagName: function(node) {
        if (!node)
            return "nosuchnode";
        var tagname = node.tagName.toLowerCase();
        if (tagname == 'td' || tagname == 'th' || tagname == 'tr' || tagname == 'tbody')
            tagname = "table";
        return tagname;
    },
    getTarget: function(node) {
        var target = node;
        var tagname = target.tagName.toLowerCase();

        while (tagname == 'td' || tagname == 'th' || tagname == 'tr' || tagname == 'tbody') {
            target = target.parentNode;
            tagname = target.tagName.toLowerCase();
        }
        return target;
    },
    getPathDir: function(root, child) {
        var dir = "";
        if (root != child) {
            if (root == 'table') {
                if (child == 'td' || child == 'th')
                    dir = "/" + child;
                if (child != "tbody")
                    dir = "/tr" + dir;
                dir = "tbody" + dir;
            }
            if (dir.length > 0)
                dir = dir + "/";
        }
        return dir;
    },

    getXPathForObjectByChild: function(target, maxChildCount, level) {
        if (!target)
            return [];
        var tagname = this.getTagName(target);
        var dir = this.getPathDir(tagname, target.tagName.toLowerCase());
        var path = "//" + tagname;
        var xi = this.getXPath(target, dir, 1, maxChildCount, level);
        if (xi.length > 0)
            path = path + "[" + xi + "]";
        return path;
    },
    getXPathForObjectByParent: function(target, maxChildCount, level) {

        var nodePath = this.getNodeParents(target)
        var dir = "";
        var path = "/";
        for (var i in nodePath) {
            var node = nodePath[i]
            var xi = this.getXPath(node, dir, 0, maxChildCount, level);
            path = path + "/" + node.tagName.toLowerCase();
            if (xi.length > 0)
                path = path + "[" + xi + "]";

        }
        return path;
    },
    getXPathForObjectBySibling: function(target, maxChildCount, level) {

        if (target.nodeType != 1)
            return "";
        var nodePath = this.getPreviousNodes(target)
        var dir = "";
        var path = this.getXPathForObjectByParent(target.parentNode, maxChildCount, level);
        for (var i in nodePath) {
            var node = nodePath[i]
            var xi = this.getXPath(node, dir, 0, maxChildCount, level);
            if (i == 0)
                path = path + "/" + node.tagName.toLowerCase();
            else
                path = path + "/following-sibling::" + node.tagName.toLowerCase();

            if (xi.length > 0)
                path = path + "[" + xi + "]";
            else
                path = path + "[" + this.getNodePosition(node) + "]";
        }
        return path;
    },
    getXPathForObjectBySibling2: function(target, maxChildCount, level) {

        if (target.nodeType != 1)
            return "";
        var nodePath = this.getPrecedingDifferentNode(target)
        var count = nodePath[0]
        var node = nodePath[1]
        if (node == null || !node.tagName)
            return null;

        var dir = "";
        var path = this.getXPathForObjectByParent(target.parentNode, maxChildCount, level); {
            var xi = this.getXPath(node, dir, 0, maxChildCount, level);
            path = path + "/*"; // + target.tagName.toLowerCase();
            var prepath = node.tagName.toLowerCase();
            if (xi.length > 0)
                prepath += "[" + xi + "]";
            else
                prepath += "[last()]";


            path += "[(position()=count(../" + prepath + "/preceding-sibling::*)+" + count + ") and name()='" + target.tagName.toUpperCase() + "']"

            xi = this.getXPath(target, dir, 0, maxChildCount, level);
            if (xi.length > 0)
                path = path + "[" + xi + "]";


        }
        return path;
    },
    getXPathForObjectByPosition: function(target, maxChildCount, level) {

        if (target == null || target.nodeType != 1)
            return "";
        var pos = this.getNodePosition(target)
        var path = this.getXPathForObjectByParent(target.parentNode, maxChildCount, level);
        path = path + "/" + target.tagName.toLowerCase() + "[" + pos + "]";
        return path;
    },
    getPreviousNodes: function(node) {
        var result = []
        var tagname = node.tagName;
        while (node != null && node.nodeType == 1 || node.nodeType == 3) {
            if (node.nodeType == 1) {
                result.unshift(node)
                if (node.nodeType == 1 && node.hasAttribute("id")) return result
                if (node.nodeType == 1 && tagname != node.tagName) return result
            }
            node = node.previousSibling
            if (node == null)
                break;
        }
        return result
    },
    getPrecedingDifferentNode: function(node) {
        var result = []
        var count = 0;
        var tagname = node.tagName;
        while (node != null && node.nodeType == 1 || node.nodeType == 3) {
            count++;
            if (node.nodeType == 1) {
                if (node.nodeType == 1 && node.hasAttribute("id"))
                    break;
                if (node.nodeType == 1 && tagname != node.tagName)
                    break;
            }
            node = node.previousSibling
            if (node == null)
                break;
        }
        result.push(count);
        result.push(node);
        return result
    },
    getNodePosition: function(node) {
        var pos = 0;
        var tagname = node.tagName;
        while (node != null) {
            if (node.nodeType == 1 && tagname == node.tagName) {
                pos = pos + 1;
            }
            node = node.previousSibling
            if (node == null)
                break;
        }
        return pos;
    },
    getNodeParents: function(node) {
        var result = []

        while (node && (node.nodeType == 1 || node.nodeType == 3)) {
            result.unshift(node)
            if (node.nodeType == 1 && node.hasAttribute("id")) return result
            if (node.nodeType == 1 && node.tagName == 'BODY') return result
            node = node.parentNode
        }
        return result
    },
    discoveryBigContent: function(node, items) {
        var contentNode = null;
        var len = 0;
        for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            if (child.nodeType == 1 && child.innerHTML.length > len) {
                contentNode = child;
                len = child.innerHTML.length;
            }
        }
        var item = null;
        for (var level = 1; level < this.MAXLevel; level += 1) {

            item = new autopagerXPathItem();
            item.xpath = this.getLinkXpathFromNode(node, contentNode, level);
            item.authority = (this.MAXLevel / level);
            items.push(item);
            item = new autopagerXPathItem();
            item.xpath = this.getXPathForObjectByParent(contentNode, 3, level);
            item.authority = (this.MAXLevel / level);
            items.push(item);

        }
        return contentNode;
    },
    discoveryContent: function(doc, xpathes) {
        var node = doc.body;
        var url = doc.documentURI;
        var items = [];
        var links = []; //this.evaluate(doc,"//a[@href]");
        var item = null;

        var existingSites = this.existingSites;
        for (var i in existingSites) {
            var site = existingSites[i];
            //try the existing site settings
            var nodes = this.evaluate(doc, site.contentXPath.join(" | "), true, 10);
            if (nodes != null && nodes.length > 0) {
                item = new autopagerXPathItem();
                item.authority = 4;
                item.xpath = site.contentXPath.join(" | ")
                item.matchCount = nodes.length
                this.addItem(doc, links, item);
            }
        }
        var knowLinks = [];
        for (var n in xpathes) {
            var site = xpathes[n];
            //try the existing site settings
            var nodes = this.evaluate(doc, site.x, true, 10);
            if (nodes != null && nodes.length > 0) {
                item = new autopagerXPathItem();
                item.authority = site.c;
                item.matchCount = nodes.length

                if (site.x != "//body" && site.x != "//body/*" && site.x != "//body/table") {
                    nodes = this.evaluate(doc, site.n, true, 2);
                    if (nodes != null && nodes.length > 0)
                        item.authority = item.authority * 3;
                }
                item.xpath = site.x
                knowLinks.push(item)
                //this.addItem(doc,links,item);
                //site.xpathItem = item
            }
        }
        knowLinks = this.sortItems(knowLinks);
        for (var i = 0; i < knowLinks.length; i++) {
            var l = knowLinks[i]
            var ignore = false;
            for (var n = 0; n < i; n++) {
                if (l.xpath == knowLinks[n].xpath) {
                    ignore = true;
                    break;
                }
            }
            if (!ignore)
                this.addItem(doc, links, l);
        }


        var contentNode = this.discoveryBigContent(node, items);
        contentNode = this.discoveryBigContent(contentNode, items);

        for (var i in items) {
            item = items[i];
            if (item != null)
                this.addItem(doc, links, item);
        }

        item = new autopagerXPathItem();
        item.authority = 1;
        item.xpath = "//body/*";
        links.push(item)

        links = this.mergeXPath(links);
        //get others

        links = this.sortItems(links);
        return links;

    },
    isValidXPath: function(xpath, doc) {
        var xpe = null;
        try {
            xpe = new XPathEvaluator();
        } catch (e) {
            xpe = doc
        }
        var expr = this.preparePath(doc, xpath, true);
        try {
            xpe.createExpression(expr, xpe.createNSResolver(doc))
        } catch (e) {
            //debug("xpath exception: " + e)
            return false;
        }

        if (xpath == '/' || xpath == '.') return false;

        return true;
    },
    evaluate: function(node, expr, enableJS, max) {
        var doc = (node.ownerDocument == null) ? node : node.ownerDocument;
        var aExpr = this.preparePath(doc, expr, enableJS);
        if (aExpr.match(/^\(auto\-.*\)/)) //"(auto-xxx)[not (@class='autoPagerS')]"
        {
            aExpr = expr.substring(1, expr.indexOf(')'))
        }
        if (aExpr.match(/^auto\-.*/)) //"auto-xxx"
        {
            var autoNodes = this.evaluateAutoNodes(doc, aExpr.substring(5), {
                max: max
            });
            if (autoNodes && autoNodes.length) {
                return this.dumpAutoResult(autoNodes, max);
            }
        }
        var found = [];
        var xpe = null;
        try {
            xpe = new XPathEvaluator();
        } catch (e) {
            xpe = doc
        }
        //autopagerBwUtil.consoleLog("evaluate aExpr:" + aExpr)

        var defaultNSResolver = xpe.createNSResolver(doc.documentElement);

        function nsResolver(prefix) {
            var ns = {
                'xhtml': 'http://www.w3.org/1999/xhtml',
                'mathml': 'http://www.w3.org/1998/Math/MathML'
            };
            return ns[prefix] || defaultNSResolver(prefix);
        }
        try {
            var result = xpe.evaluate(aExpr, node, nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

            found = this.dumpResult(result, max);
            //autopagerBwUtil.consoleLog("evaluate result:" + found)
        } catch (e) {
            //autopagerBwUtil.consoleLog("evaluate exception:" + e)
            //[not (@class='autoPagerS')]
            try {
                aExpr = aExpr.replace("[not (@class='autoPagerS')]", '');
                var result2 = xpe.evaluate(aExpr, node, nsResolver, XPathResult.ANY_TYPE, null);
                found = this.dumpResult(result2, max);
            } catch (ex) {
                //debug("unableevaluator"); //TODO: autopagerUtils.autopagerFormatString("unableevaluator",[aExpr,e]));
            }
        }
        return found;
    },
    dumpResult: function(result, max) {
        var found = [];
        var res;
        switch (result.resultType) {
            case XPathResult.NUMBER_TYPE:
                found.push(String(result.numberValue));
                break;
            case XPathResult.STRING_TYPE:
                found.push(result.stringValue);
                break;
            case XPathResult.BOOLEAN_TYPE:
                found.push(String(result.booleanValue));
                break;
            default:
                {
                    while ((res = result.iterateNext()) && (typeof(max) == 'undefined' || found.length < max))
                        found.push(res);
                }
        }
        return found;
    },
    evaluateAutoNodes: function(doc, func, options) {
        var found = []
        var methods = this.getAutoMethods(func);
        for (var i in methods) {
            var m = methods[i]
            var subFound = m.func(doc, func, options, m);
            if (subFound) {
                for (var k in subFound) {
                    var f = subFound[k]
                    found.push(f)
                }
            }
        }
        return found;
    },
    dumpAutoResult: function(autoNodes, max) {
        var found = [];
        for (var i in autoNodes) {
            var node = autoNodes[i]
            if (found.length >= max)
                break;
            if (found.indexOf(node.node) == -1) {
                found.push(node.node);
            }
        }
        return found;
    },
    getAutoMethods: function(func) {
        var ms = [];
        var allMS = this.getAllAutoMethods()
        for (var i in allMS) {
            var m = allMS[i]
            if (m.name.substring(0, func.length) == func) {
                ms.push(m);
            }
        }
        return ms;
    },
    getAllAutoMethods: function() {
        if (!this._autoMethods) {
            this._autoMethods = [{
                    name: "nextlink-ids",
                    func: this.findLinksNextWithIDs
                }, {
                    name: "nextlink-keywords-rel",
                    func: this.findLinksNextWithKeywords,
                    attrfunc: function(node) {
                        return node.getAttribute("rel")
                    }
                }, {
                    name: "nextlink-navbar",
                    func: this.findLinksNextInNavbar
                }, {
                    name: "nextlink-keywords-class",
                    func: this.findLinksNextWithKeywords,
                    attrfunc: function(node) {
                        var v = node.getAttribute("class");
                        if (v) return v.trim().split(" ");
                        return null;
                    }
                }, {
                    name: "nextlink-keywords-text",
                    func: this.findLinksNextWithKeywords,
                    attrfunc: function(node) {
                        return node.textContent;
                    }
                }, {
                    name: "nextlink-next2curr",
                    func: this.findLinksNext2curr
                } //this may introduce issue for example in http://marc.info/?l=php-general&r=2&b=201202&w=2
                , {
                    name: "nextlink-neighbour",
                    func: this.findLinksNextNeighbour
                } //this may introduce issue for example in http://marc.info/?l=php-general&r=2&b=201202&w=2
                , {
                    name: "nextlink-javascript-next",
                    func: this.findLinksNextWithJavascriptFunction
                }, {
                    name: "rev-nextlink-next2curr",
                    func: this.findLinksNext2currRev
                }, {
                    name: "rev-nextlink-neighbour",
                    func: this.findLinksNextNeighbourRev
                }
            ]
        }
        return this._autoMethods;
    },
    getAllEnabledLinks: function(doc) {
        var nodes = doc.getElementsByTagName("A");
        var enabled = [];
        for (var i = nodes.length - 1; i >= 0; i--) {
            var n = nodes[i];
            if (!n.disabled && (!n.getAttribute("class") || !n.getAttribute("class").match(/disabled/))) {
                enabled.push(n);
            }
        }
        return enabled;
    },
    findLinksNext2curr: function(doc, expr, options, ps) {
        //find links next to current within 50 px
        var found = []
        var nodes = autopagerXPath.getAllEnabledLinks(doc);
        var url = doc.location.href;
        var currs = []
        for (var i = nodes.length - 1; i >= 0; i--) {
            var n = nodes[i];
            if (url == n.href) {
                currs.push({
                    node: n,
                    pos: autopagerMain.myGetPos(n)
                });
            }
        }
        for (var i = nodes.length - 1; i >= 0; i--) {
            var n = nodes[i];
            var pos = autopagerMain.myGetPos(n);
            for (var k in currs) {
                var c = currs[k];
                var xOffset = pos.x - (c.pos.x + c.node.scrollWidth)
                //y position similar, x position a little bigger
                if (xOffset > 0 && xOffset < 40 && Math.abs(pos.y - c.pos.y) < 10) {
                    found.push({
                        func: ps.name,
                        node: n,
                        pos: pos,
                        offset: xOffset
                    })
                }
            }
        }
        if (found.length > 1)
            found.sort(function(a, b) {
                return a.offset - b.offset
            })
        if (found.length > options.max) {
            found = found.slice(0, options.max - 1)
        }
        return found;
    },
    findLinksNext2currRev: function(doc, expr, options) {
        //find links next to current within 50 px
    },
    findLinksNextNeighbour: function(doc, expr, options, ps) {
        //find links with page number next to the current link
        //for example curr link = http://aaa.com/xxx?page=10, we return the link if it has all others same as current page but has a page=11
        //or for http://aaa.com/xxx?row=100, find the links with the min row and with all the others the same
        var found = autopagerXPath.findLinksNextNeighbourImpl(doc, expr, options, ps, {
            func: function(uri, nodeUri) {
                if (!this.clearedUri) {
                    this.clearedUri = autopagerUtils.getPathOfUri(uri)
                    this.miniSameKeyCount = uri["searchParts"].length > 0 ? 1 : 0;
                }
                if (this.clearedUri != autopagerUtils.getPathOfUri(nodeUri))
                    return false;
                var diffCount = 0;
                var sameKeyCount = 0;
                for (var k in uri["searchParts"]) {
                    if (typeof nodeUri["searchParts"][k] != "undefined") {
                        sameKeyCount++;
                        if (nodeUri["searchParts"][k] != uri["searchParts"][k])
                            diffCount++;
                    }
                }
                return sameKeyCount > this.miniSameKeyCount && diffCount <= 1;
            }
        })
        if (!found || found.length == 0) {
            found = autopagerXPath.findLinksNextNeighbourImpl(doc, expr, options, ps, {
                func: function(uri, nodeUri) {
                    if (!this.clearedUri) {
                        this.clearedUri = autopagerUtils.doClearedUrl(uri)
                    }
                    return this.clearedUri == autopagerUtils.doClearedUrl(nodeUri);
                }
            })
        }
        if (!found || found.length == 0) {
            found = autopagerXPath.findLinksNextNeighbourImpl(doc, expr, options, ps, {
                func: function(uri, nodeUri) {
                    if (!this.clearedUri) {
                        this.clearedUri = autopagerUtils.getPathOfUri(uri)
                    }
                    if (this.clearedUri != autopagerUtils.getPathOfUri(nodeUri))
                        return false;
                    for (var k in uri["searchParts"]) {
                        if (typeof nodeUri["searchParts"][k] != "undefined")
                            return true;
                    }
                    return false;
                }
            })
        }
        return found;
    },
    findLinksNextNeighbourImpl: function(doc, expr, options, ps, groupFunc) {
        //find links with page number next to the current link
        //for example curr link = http://aaa.com/xxx?page=10, we return the link if it has all others same as current page but has a page=11
        //or for http://aaa.com/xxx?row=100, find the links with the min row and with all the others the same
        var url = doc.location.href;
        var uri = autopagerUtils.parseUri(url);
        var params = [];
        var paramsHash = [];
        var searchParts = uri["searchParts"];
        for (var k in searchParts) {
            var p = {
                name: k,
                value: searchParts[k],
                values: [searchParts[k]]
            };
            params.push(p);
            paramsHash[k] = p;
        }

        var simularNodes = [];
        var nodes = autopagerXPath.getAllEnabledLinks(doc);

        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            if (!n.href)
                continue;
            var nodeUri = autopagerUtils.parseUri(n.href)
            if (groupFunc.func(uri, nodeUri)) {
                simularNodes.push({
                    node: n,
                    uri: nodeUri
                })
                searchParts = nodeUri["searchParts"];
                for (var k in searchParts) {
                    if (!paramsHash[k]) {
                        var p = {
                            name: k,
                            values: [searchParts[k]]
                        };
                        params.push(p);
                        paramsHash[k] = p;
                    }
                    if (paramsHash[k] && paramsHash[k].values && paramsHash[k].values.indexOf(searchParts[k]) == -1)
                        paramsHash[k].values.push(searchParts[k]);
                }
            }
        }
        var compareValue = function(v1, v2) {
            //if a value <=1 then we treat it as null
            if ((!v1 || v1 <= 1) && (!v2 || v2 <= 1)) {
                return 0;
            } else if (!v1 || v1 <= 1) {
                return -1;
            } else if (!v2 || v2 <= 1) {
                return 1;
            } else if (numParameter) {
                return parseInt(v1) - parseInt(v2)
            } else {
                return v1 == v2 ? 0 : (v1 < v2 ? -1 : 1);
            }
        }

            function isParamAllNum(param) {
                var numParameter = true;
                for (var i = 0; i < param.values.length; i++) {
                    var v = param.values[i];
                    numParameter = !v || !isNaN(parseInt(v));
                    if (!numParameter)
                        break;
                }
                return numParameter;
            }
        for (var i in params) {
            params[i].isNum = isParamAllNum(params[i])
        }
        //sort params to get the key with max number values,for example page number
        params.sort(function(p1, p2) {
            //treat as double if a parameter is a number parameter
            var v1 = p1.values.length * (p1.isNum ? 2 : 1);
            var v2 = p2.values.length * (p2.isNum ? 2 : 1);

            if (v1 == v2 && v2 > 0)
                return compareValue(p1.values[0], p2.values[0]);
            return v2 - v1;
        });
        var found = [];
        if (params.length > 0) {
            var pageIdentifier = params[0];
            var numParameter = isParamAllNum(pageIdentifier);

            var compareNode = function(n1, n2) {
                return compareValue(n1.uri["searchParts"][pageIdentifier.name], n2.uri["searchParts"][pageIdentifier.name])
            }
            simularNodes.sort(compareNode);
            var nIndex = 0;
            while (nIndex < simularNodes.length && (typeof simularNodes[nIndex].uri["searchParts"][pageIdentifier.name] == "undefined" | compareValue(simularNodes[nIndex].uri["searchParts"][pageIdentifier.name], pageIdentifier.value) <= 0)) {
                nIndex++;
            }
            if (nIndex < simularNodes.length) {
                var firstValue = simularNodes[nIndex].uri["searchParts"][pageIdentifier.name];
                while (nIndex < simularNodes.length && simularNodes[nIndex].uri["searchParts"][pageIdentifier.name] == firstValue) {
                    found.push({
                        func: ps.name,
                        node: simularNodes[nIndex].node
                    })
                    nIndex++;
                }
            }
        }
        return found;
    },
    findLinksNextNeighbourRev: function(doc, expr, options) {
        //find links with page number prev to the current link, for site with page num/record num in rev order
        //for example curr link = http://aaa.com/xxx?page=10, we return the link if it has all others same as current page but has a page=9
        //or for http://aaa.com/xxx?row=100, find the links with the max row and with all the others the same. row=90 for example
    },
    findLinksNextWithIDs: function(doc, expr, options, ps) {
        //find by ids
        var smarttext = this.smarttext;
        var strs = (smarttext).split("|");
        var found = []
        for (var i in strs) {
            var id = strs[i];
            var n = doc.getElementById(id);
            if (!n && id != id.toLowerCase()) {
                n = doc.getElementById(id.toLowerCase);
            }
            if (n) {
                found.push({
                    func: ps.name,
                    node: n
                })
                if (found.length >= options.max - 1)
                    break;
            }
        }
        return found;
    },
    findLinksNextWithKeywords: function(doc, expr, options, ps) {
        //find keywords in @rel, @class, text()
        var attrfunc = ps.attrfunc
        var smarttext = this.smarttext;
        var strs = (smarttext).split("|");
        var found = []
        var nodes = autopagerXPath.getAllEnabledLinks(doc);
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            for (var k = 0; k < strs.length; k++) {
                var str = strs[k];
                var attrValue = attrfunc(n);
                if (attrValue) {
                    var attrs
                    if (attrValue.constructor == Array) {
                        attrs = attrValue
                    } else
                        attrs = [attrValue]
                    for (var a in attrs) {
                        var attr = attrs[a].trim();
                        if (attr) {
                            if (str == attr) {
                                found.push({
                                    func: ps.name,
                                    node: n,
                                    exactly: true
                                });
                            } else if (str.toLowerCase() == attr.toLowerCase()) {
                                found.push({
                                    func: ps.name,
                                    node: n,
                                    exactly: false
                                });
                            }
                        }
                    }

                }
            }
        }
        return found;
    },
    findLinksNextInNavbar: function(doc, expr, options, ps) {
        //find links by finding the navagation bar, then find the current link/text and find the next one then
        //different to findLinksNextNeighbour is that this is major find the number series in text insteadof url
        //for example, a navbar looks like 1 2 3 4 [5] 6 7. [5] here is special. So 6 is the next page. Current page can also be with different color or size.
        //so we find all parent for "a" (grant parent if "a"'s parent is "li" or is an element with "a" as the only child.
        var nodes = autopagerXPath.getAllEnabledLinks(doc);
        var positions = []
        for (var i = 0; i < nodes.length - 1; i++) {
            var n = nodes[i];
            var t = autopagerUtils.trim(n.textContent);
            if (t.match(/^[\[\(\<\{\s]*\d[\s\]\)\>\}]*$/)) {
                var pos = autopagerMain.myGetPos(n);
                positions.push({
                    node: n,
                    pos: pos,
                    text: t,
                    num: parseInt(t.replace(/[\[\(\<\{\s\]\)\>\}]/g, ''))
                });
            }
        }
        if (positions.length > 1) {
            positions.sort(function(a, b) {
                if (Math.abs(a.pos.y - b.pos.y) < 5) {
                    return a.pos.x - b.pos.x;
                }
                return a.pos.y - b.pos.y
            })
            var groupStart = 0;
            var groupEnd = 1;
            var found = []

            while (groupEnd <= positions.length) {
                while (groupEnd < positions.length && Math.abs(positions[groupEnd].pos.y - positions[groupEnd - 1].pos.y) < 5) {
                    groupEnd++;
                }
                var group = positions.slice(groupStart, groupEnd);
                if (group.length > 1) {
                    var step = getStep(group);
                    var firstNotMatchStep = getFirstNotMatchStep(group, step);
                    if (firstNotMatchStep >= 0) {
                        found.push({
                            func: ps.name,
                            node: group[firstNotMatchStep].node
                        })
                    } else {
                        var fistSpecial = getFirstSpecial(group);
                        if (fistSpecial >= 0 && fistSpecial < group.length - 1) {
                            found.push({
                                func: ps.name,
                                node: group[fistSpecial + 1].node
                            })
                        } else {
                            //try first node. If its previous node has a previous number then the first node is the one we found
                            var previousNum = group[0].num - step;
                            var firstNode = group[0].node
                            var regx = new RegExp("[\\[\\(\\<\\{\\s]*" + previousNum + "[\\]\\)\\>\\}\\s]*$");
                            var previousNode = getPreviousSiblingNoneEmptyNode(firstNode)
                            if (previousNode && previousNode.textContent.match(regx)) {
                                found.push({
                                    func: ps.name,
                                    node: firstNode
                                })
                            }
                        }
                    }
                }

                groupStart = groupEnd;
                groupEnd++;
            }
        }

        function getStep(group) {
            var step = 10000;
            for (var i = 1; i < group.length; i++) {
                if (step > Math.abs(group[i].num - group[i - 1].num)) {
                    step = Math.abs(group[i].num - group[i - 1].num);
                }
            }
            return (group[group.length - 1].num - group[0].num) > 0 ? step : step * -1;
        }

        function getFirstNotMatchStep(group, step) {
            for (var i = 1; i < group.length; i++) {
                if (step != group[i].num - group[i - 1].num) {
                    return i;
                }
            }
            return -1;
        }

        function getFirstSpecial(group) {
            for (var i = 0; i < group.length; i++) {
                if (group[i].text.match(/^[\[\(\<\]{\s]*\d[\s]*[\]\)\>\}]+$/)) {
                    return i;
                }
                if (i > 0 && inDifferentStyle(group[i - 1].node, group[i].node)) {
                    return i;
                }
            }
            var regx = /[\[\(\<\{][\s]*$/; //"[","(","<" or "{" before a link. [ 6 ], for example
            for (var i = 0; i < group.length; i++) {
                var previousNode = getPreviousSiblingNoneEmptyNode(group[i].node)
                if (previousNode && previousNode.textContent.match(regx)) {
                    return i;
                }
            }
            return -1;
        }

        function getPreviousSiblingNoneEmptyNode(node) {
            var curr = node.previousSibling;
            while (curr && curr.previousSibling && autopagerUtils.trim(curr.textContent) == "") {
                curr = curr.previousSibling;
            }
            if (!curr || curr == node || autopagerUtils.trim(curr.textContent) == "") {
                if (node.parentNode && autopagerUtils.trim(node.parentNode.textContent) == autopagerUtils.trim(node.textContent))
                    return getPreviousSiblingNoneEmptyNode(node.parentNode)
                return null;
            }
            return curr;
        }

        function inDifferentStyle(n1, n2) {
            if (n1.getAttribute("class") != n2.getAttribute("class")) {
                return true;
            } else if (n1.parentNode.tagName != n2.parentNode.tagName) {
                return true;
            } else if (n1.parentNode.getAttribute("class") != n2.parentNode.getAttribute("class")) {
                return true;
            } else if (n1.style["color"] != n2.style["color"]) {
                return true;
            } else if (n1.style["background-color"] != n2.style["background-color"]) {
                return true;
            }
            return false;
        }
        if (found && found.length > options.max) {
            found = found.slice(0, options.max - 1)
        }
        return found;
    },
    findLinksNextWithJavascriptFunction: function(doc, expr, options, ps) {
        //find links with href=javascript:next(),javascript:gonext(),javascript:go2next()
        var attrfunc = function(node) {
            var href = autopagerUtils.trim(node.href);
            if (!href || !href.match(/^javascript\:/))
                return null;
            href = href.substring(11, href.indexOf("("));
            return autopagerUtils.trim(href).toLowerCase();
        }
        var smarttext = this.smarttext;
        var strs = (smarttext).split("|");
        var found = []
        var nodes = autopagerXPath.getAllEnabledLinks(doc);
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            for (var k = 0; k < strs.length; k++) {
                var str = strs[k].toLowerCase();
                var attr = autopagerUtils.trim(attrfunc(n));
                if (attr) {
                    if (str == attr) {
                        found.push({
                            func: ps.name,
                            node: n,
                            exactly: true
                        });
                    } else if ("go" + str == attr || "go2" + str == attr || "goto" + str == attr) {
                        found.push({
                            func: ps.name,
                            node: n,
                            exactly: false
                        });
                    }
                }
            }
        }
    },
    convertToXpath: function(str, exactlymatch) {
        var xpaths = new Array();
        var strs = str.split("|");
        for (var k = 0; k < strs.length; ++k) {
            if (!exactlymatch)
                strs[k] = strs[k].toLowerCase().replace(new RegExp(" ", "gm"), "");
        }
        for (var i = 0; i < strs.length; ++i) {
            if (strs[i].length == 0)
                continue;
            this.convertStringToXPath(xpaths, "//a[", "]", strs[i], "", exactlymatch);
            this.convertStringToXPath(xpaths, "//*[", "][count(a)=1]/a", strs[i], "", exactlymatch);
            this.convertStringToXPath(xpaths, "//input[(@type='submit' or @type='button' or @type='image') and ", "]", strs[i], "", exactlymatch);
            this.convertStringToXPath(xpaths, "//*[", "][count(input)=1]/input", strs[i], "", exactlymatch);
            var chars = this.getChars(str);
            xpaths.push("//head/link[" + this.xpathEquals("@ref", chars, str) + "]/@href");
            if (!exactlymatch) {
                xpaths.push("//head/link[" + this.xpathContains("@ref", chars, str) + "]/@href");
            }
        }
        return xpaths;
    },
    xpathToLowerCase: function(path, str) {
        return "translate(normalize-space(" + path + "),'" + str.toUpperCase() + "', " + "'" + str + "')";
    },
    xpathContains: function(path, chars, str) {
        return "contains(translate(normalize-space(" + path + "),'" + chars.toUpperCase() + "', " + "'" + chars + "'),'" + str + "')";
    },
    xpathEquals: function(path, chars, str) {
        return path + "='" + str + "'";
    },
    convertStringToXPath: function(xpaths, prefix, subfix, str, dir, exactlymatch) {
        var chars = this.getChars(str);
        if (str.length > 0) {
            xpaths.push(dir + prefix + this.xpathEquals("@id", chars, str) + subfix);
            xpaths.push(dir + prefix + this.xpathEquals("@rel", chars, str) + subfix);
            xpaths.push(dir + prefix + this.xpathEquals("@name", chars, str) + subfix);
            xpaths.push(dir + prefix + this.xpathEquals("@title", chars, str) + subfix);
            xpaths.push(dir + prefix + this.xpathEquals("@class", chars, str) + subfix);
            xpaths.push(dir + prefix + this.xpathEquals("img/@src", chars, str) + subfix);
            xpaths.push(dir + prefix + "img[" + this.xpathEquals("@src", chars, str) + "]" + subfix);
            xpaths.push(dir + prefix + "img[" + this.xpathEquals("@alt", chars, str) + "]" + subfix);
            xpaths.push(dir + prefix + this.xpathEquals("text()", chars, str) + subfix);
            xpaths.push(dir + prefix + "span[" + this.xpathEquals("text()", chars, str) + "]" + subfix);
            xpaths.push(dir + prefix + "font[" + this.xpathEquals("text()", chars, str) + "]" + subfix);
            xpaths.push(dir + prefix + "b[" + this.xpathEquals("text()", chars, str) + "]" + subfix);
            xpaths.push(dir + prefix + "strong[" + this.xpathEquals("text()", chars, str) + "]" + subfix);
            xpaths.push(dir + prefix + this.xpathEquals("substring(img/@src,string-length(img/@src) - " + str.length + ")", chars, str) + subfix);
            if (!exactlymatch) {
                xpaths.push(dir + prefix + this.xpathContains("@id", chars, str) + subfix);
                xpaths.push(dir + prefix + this.xpathContains("@rel", chars, str) + subfix);
                xpaths.push(dir + prefix + this.xpathContains("@name", chars, str) + subfix);
                xpaths.push(dir + prefix + this.xpathContains("@title", chars, str) + subfix);
                xpaths.push(dir + prefix + this.xpathContains("@class", chars, str) + subfix);
                xpaths.push(dir + prefix + this.xpathContains("img/@src", chars, str) + subfix);
                xpaths.push(dir + prefix + "img[" + this.xpathContains("@src", chars, str) + "]" + subfix);
                xpaths.push(dir + prefix + "img[" + this.xpathContains("@alt", chars, str) + "]" + subfix);
                xpaths.push(dir + prefix + this.xpathContains("text()", chars, str));
                xpaths.push(dir + prefix + "span[" + this.xpathContains("text()", chars, str) + "]" + subfix);
                xpaths.push(dir + prefix + "font[" + this.xpathContains("text()", chars, str) + "]" + subfix);
                xpaths.push(dir + prefix + "b[" + this.xpathContains("text()", chars, str) + "]" + subfix);
                xpaths.push(dir + prefix + "strong[" + this.xpathContains("text()", chars, str) + "]" + subfix);
                xpaths.push(dir + prefix + this.xpathContains("substring(img/@src,string-length(img/@src) - " + str.length + ")", chars, str) + subfix);

            }
        }

    },
    getChars: function(str) {
        var chars = "";
        for (var i = 0; i < str.length; ++i) {
            if (chars.indexOf(str.charAt(i)) == -1) {
                chars = chars + str.charAt(i);
            }
        }
        return chars;
    },
    appendOrCondition: function(base, newStr) {
        if (base.length > 0) {
            if (newStr.length > 0)
                return base + " or " + newStr;
            else
                return base;
        }
        return newStr;
    },
    modifyXPath: function(id) {
        var box = document.getElementById(id);

        // window.openDialog("chrome://autopager/content/xpath-exprestion.xul",
        //     "autopagerAbout",
        //     "chrome,centerscreen,modal",
        //     box.value,
        //     autopagerUtils.currentDocument(), box);
    },
    preparePath: function(doc, path, enableJS) {
        //host
        //href
        //hostname
        //pathname
        //port
        //protocol
        //search
        //title
        if (typeof(enableJS) == 'undefined')
            enableJS = true;
        var newPath = path;
        if (newPath.indexOf("%") == -1)
            return newPath;
        try {
            var href = "";
            var host = "";
            var port = "";
            if (enableJS) {
                host = doc.location.host;
                href = doc.location.href;
            } else {
                if (doc.documentElement.getAttribute("autopager-real-url")) {
                    href = doc.documentElement.getAttribute("autopager-real-url")
                } else {
                    href = doc.baseURI;
                }
                host = href;

                //remove prototol
                host = host.substring(doc.location.protocol.length + 2);
                port = doc.location.port + "";
                host = host.substring(0, host.indexOf("/"));

                if (port.length > 0)
                    host = host.substring(0, host.length - port.length - 1);
            }
            newPath = newPath.replace(/\%href\%/g, "'" + href + "'");
            newPath = newPath.replace(/\%host\%/g, "'" + host + "'");
            newPath = newPath.replace(/\%hostname\%/g, "'" + host + "'");
            newPath = newPath.replace(/\%pathname\%/g, "'" + doc.location.pathname + "'");
            var pathname = doc.location.pathname;
            var filename = pathname.substr(pathname.lastIndexOf(pathname, "/"))
            newPath = newPath.replace(/\%filename\%/g, "'" + filename + "'");
            if (!doc.location.port)
                port = doc.location.port;
            newPath = newPath.replace(/\%port\%/g, port);
            newPath = newPath.replace(/\%protocol\%/g, "'" + doc.location.protocol + "'");
            newPath = newPath.replace(/\%search\%/g, "'" + doc.location.search + "'");
            newPath = newPath.replace(/\%title\%/g, "'" + doc.title + "'");
            //newPath = newPath.replace(/\%referrer\%/g,"'" + doc.referrer+ "'");
            newPath = newPath.replace(/\%baseuri\%/g, "'" + href.substring(0, href.lastIndexOf("/") + 1) + "'");
        } catch (e) {
            autopagerMain.alertErr(e);
        }
        return newPath;

    },
    isValidateLink: function(node) {
        if (node.tagName.toLowerCase() == "a" && node.getAttribute("href")) {
            var jsOrAjaxPath = /^[ ]*javascript|^\#[0-9a-zA-Z]*/;
            return !jsOrAjaxPath.test(node.getAttribute("href").toLowerCase());
        }
        return true;
    }
};

var autopagerUtils = {
    currentDocument: function() {
        var b = this.currentBrowser();
        if (b && b.docShell)
            return this.currentBrowser().contentDocument;
    },
    currentBrowser: function() {
        var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
        var browser = windowManager.getMostRecentWindow("navigator:browser").document.getElementById("content");


        return browser;
    },
    currentWindow: function() {
        var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
        var browserWindow = windowManager.getMostRecentWindow("navigator:browser");
        return browserWindow;
    },
    trim: function(str) {
        if (!str)
            return str;
        var newstr = str.replace(/^\s\s*/, ''),
            ws = /\s/,
            i = newstr.length;
        while (ws.test(str.charAt(--i)));
        return newstr.slice(0, i + 1);
    },
    getPathOfUri: function(uri) {
        var u = uri["protocol"] + "://" + uri["host"] + ":" + uri["port"] + uri["directoryPath"] + uri["fileName"];
        return u;
    },
    doClearedUrl: function(uri) {
        var u = this.getPathOfUri(uri);
        for (var k in uri["searchParts"]) {
            u += k + "=&";
        }
        return u;
    },
    parseUri: function(sourceUri) {
        var uriPartNames = ["href", "protocol", "host", "hostname", "port", "pathname", "directoryPath", "fileName", "search", "hash"];
        var uriParts = new RegExp("^(?:([^:/?#.]+):)?(?://)?(([^:/?#]*)(?::(\\d*))?)?((/(?:[^?#](?![^?#/]*\\.[^?#/.]+(?:[\\?#]|$)))*/?)?([^?#/]*))?(?:\\?([^#]*))?(?:#(.*))?").exec(sourceUri);
        var uri = {};

        for (var i = 0; i < 10; i++) {
            uri[uriPartNames[i]] = (uriParts[i] ? uriParts[i] : "");
        }

        // Always end directoryPath with a trailing backslash if a path was present in the source URI
        // Note that a trailing backslash is NOT automatically inserted within or appended to the "path" key
        if (uri.directoryPath.length > 0) {
            uri.directoryPath = uri.directoryPath.replace(/\/?$/, "/");
        }
        uri.pathes = uri.pathname.substring(1).split("/");
        var search = uri["search"];
        var searchParts = this.parseSearch(search);
        uri["searchParts"] = searchParts
        return uri;
    },
};


function autopagerDiscoveryResult(doc, xpathes) {
    this.linkXPaths = autopagerXPath.discoveryLink(doc, xpathes);
    this.contentXPaths = autopagerXPath.discoveryContent(doc, xpathes);
}

function autopagerXPathItem() {
    this.xpath = "";
    this.authority = 0;
    this.matchCount = 0;
    this.tmpCount = 1;
}

function autopagerNode() {
    this.node = null;
    this.matchCount = 0;
    this.tmpCount = 1;
}


