location == "chrome://browser/content/browser.xul" && (function(event) {
    var self = arguments.callee;
    if (!event) {
        ["dragstart", "drag", "dragover", "drop"].forEach(function(type) {
            gBrowser.mPanelContainer.addEventListener(type, self, false);
        });
        window.addEventListener("unload", function() {
            ["dragstart", "drag", "dragover", "drop"].forEach(function(type) {
                gBrowser.mPanelContainer.removeEventListener(type, self, false);
            });
        }, false);

        self.seemAsURL = function(url) { // 来自 Easy DragToGo+ 扩展，略作修正
            var DomainName = /(\w+(\-+\w+)*\.)+\w{2,7}/i;
            var HasSpace = /\S\s+\S/;
            var KnowNameOrSlash = /^(www|bbs|forum|blog)|\//i;
            var KnowTopDomain1 = /\.(com|net|org|gov|edu|info|mobi|mil|asia)$/i;
            var KnowTopDomain2 = /\.(de|uk|eu|nl|it|cn|be|us|br|jp|ch|fr|at|se|es|cz|pt|ca|ru|hk|tw|pl|me|tv|cc)$/i;
            var IsIpAddress = /^([1-2]?\d?\d\.){3}[1-2]?\d?\d/;
            var seemAsURL = !HasSpace.test(url) && DomainName.test(url) && (KnowNameOrSlash.test(url) || KnowTopDomain1.test(url) || KnowTopDomain2.test(url) || IsIpAddress.test(url));
            return seemAsURL;
        };
        return;
    }
    switch (event.type) {
        case "dragstart":
            {
                event.target.localName == "img" && event.dataTransfer.setData("application/x-moz-file-promise-url", event.target.src);
                break;
            }
        case "drag":
            {
                self.dragFromInside = true;
                self.sourceNode = event.target;
                break;
            }
        case "dragover":
            {
                self.dragFromInside && (Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService).getCurrentSession().canDrop = true);
                break;
            }
        case "drop":
            {
                if (self.dragFromInside && event.target.localName != "textarea" && (!(event.target.localName == "input" && (event.target.type == "text" || event.target.type == "password"))) && event.target.contentEditable != "true") {
                    event.preventDefault();
                    event.stopPropagation();
                    if (event.dataTransfer.types.contains("application/x-moz-file-promise-url")) {
                        if (event.ctrlKey) {
                            //ci
                            return;
                        }
                        if (event.altKey) {
                            //ai
                            return;
                        }
                        if (event.shiftKey) {
                            //si
                            return;
                        }
                        //i
                    } else if (event.dataTransfer.types.contains("text/x-moz-url")) {
                        if (event.ctrlKey) {
                            //cl
                            return;
                        }
                        if (event.altKey) {
                            //al
                            return;
                        }
                        if (event.shiftKey) {
                            //sl
                            return;
                        }
                        //l
                    } else {
                        if (event.ctrlKey) {
                            //ct
                            return;
                        }
                        if (event.altKey) {
                            //at
                            return;
                        }
                        if (event.shiftKey) {
                            //st
                            return;
                        }
                        //t
                    }
                    self.dragFromInside = false;
                }
            }
    }
})()