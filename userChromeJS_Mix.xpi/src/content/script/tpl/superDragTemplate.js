location == "chrome://browser/content/browser.xul" && (function(event) {
    var self = arguments.callee;
    if (!event) {
        self.GESTURES = {
            image: {
                //I
            },
            link: {
                //L
            },
            text: {
                //T
            },
        };
        ["dragstart", "dragover", "drop"].forEach(function(type) {
            gBrowser.mPanelContainer.addEventListener(type, self, false);
        });
        window.addEventListener("unload", function() {
            ["dragstart", "dragover", "drop"].forEach(function(type) {
                gBrowser.mPanelContainer.removeEventListener(type, self, false);
            });
        }, false);

        self.seemAsURL = function(url) {  // 来自 Easy DragToGo+ 扩展，略作修正
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
                self.lastPoint = [event.screenX, event.screenY];
                self.sourceNode = event.target;
                self.directionChain = "";
                event.target.localName == "img" && event.dataTransfer.setData("application/x-moz-file-promise-url", event.target.src);
                if (event.dataTransfer.types.contains("application/x-moz-file-promise-url")) {
                    self.type = "image";
                } else if (event.dataTransfer.types.contains("text/x-moz-url")) {
                    self.type = "link";
                } else {
                    self.type = "text";
                }
                break;
            }
        case "dragover":
            {
                if (!self.lastPoint) return;
                Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService).getCurrentSession().canDrop = true;
                var [subX, subY] = [event.screenX - self.lastPoint[0], event.screenY - self.lastPoint[1]];
                var [distX, distY] = [(subX > 0 ? subX : (-subX)), (subY > 0 ? subY : (-subY))];
                var direction;
                if (distX < 10 && distY < 10) return;
                if (distX > distY) direction = subX < 0 ? "L" : "R";
                else direction = subY < 0 ? "U" : "D";
                if (direction != self.directionChain.charAt(self.directionChain.length - 1)) {
                    self.directionChain += direction;
                    XULBrowserWindow.statusTextField.label = self.GESTURES[self.type][self.directionChain] ? "\u624b\u52bf: " + self.directionChain + " " + self.GESTURES[self.type][self.directionChain].name : "\u672a\u77e5\u624b\u52bf:" + self.directionChain;
                    self.cmd = self.GESTURES[self.type][self.directionChain] ? self.GESTURES[self.type][self.directionChain].cmd : "";
                }
                self.lastPoint = [event.screenX, event.screenY];
                break;
            }
        case "drop":
            {
                if (self.lastPoint && event.target.localName != "textarea" && (!(event.target.localName == "input" && (event.target.type == "text" || event.target.type == "password"))) && event.target.contentEditable != "true") {
                    event.preventDefault();
                    event.stopPropagation();
                    self.lastPoint = XULBrowserWindow.statusTextField.label = "";
                    self.cmd && self.cmd(event, self);
                }
            }
    }
})()