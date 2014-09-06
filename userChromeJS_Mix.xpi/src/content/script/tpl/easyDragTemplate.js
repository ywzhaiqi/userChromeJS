location == "chrome://browser/content/browser.xul" && (function(event) {
    var self = arguments.callee;
    if (!event) {
        ["dragstart", "dragover", "drop"].forEach(function(type) {
            gBrowser.mPanelContainer.addEventListener(type, self, false);
        });
        window.addEventListener("unload", function() {
            ["dragstart", "dragover", "drop"].forEach(function(type) {
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
                self.startPoint = [event.screenX, event.screenY];
                self.sourceNode = event.target;
                event.target.localName == "img" && event.dataTransfer.setData("application/x-moz-file-promise-url", event.target.src);
                break;
            }
        case "dragover":
            {
                self.startPoint && (Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService).getCurrentSession().canDrop = true);
                break;
            }
        case "drop":
            {
                if (self.startPoint && event.target.localName != "textarea" && (!(event.target.localName == "input" && (event.target.type == "text" || event.target.type == "password"))) && event.target.contentEditable != "true") {
                    event.preventDefault();
                    event.stopPropagation();
                    var [subX, subY] = [event.screenX - self.startPoint[0], event.screenY - self.startPoint[1]];
                    var [distX, distY] = [(subX > 0 ? subX : (-subX)), (subY > 0 ? subY : (-subY))];
                    var direction;
                    if (distX > distY) direction = subX < 0 ? "L" : "R";
                    else direction = subY < 0 ? "U" : "D";
                    if (event.dataTransfer.types.contains("application/x-moz-file-promise-url")) {
                        if (direction == "U") {
                            //eiu
                            return;
                        }
                        if (direction == "D") {
                            //eid
                            return;
                        }
                        if (direction == "L") {
                            //eil
                            return;
                        }
                        if (direction == "R") {
                            //eir
                            return;
                        }
                        
                        //eie
                        
                        
                    } else if (event.dataTransfer.types.contains("text/x-moz-url")) {
                        if (direction == "U") {
                            //elu
                            return;
                        }
                        if (direction == "D") {
                            //eld
                            return;
                        }
                        if (direction == "L") {
                            //ell
                            return;
                        }
                        if (direction == "R") {
                            //elr
                            return;
                        }
                        
                        //ele
                        
                        
                    } else {
                        if (direction == "U") {
                            //etu
                            return;
                        }
                        if (direction == "D") {
                            //etd
                            return;
                        }
                        if (direction == "L") {
                            //etl
                            return;
                        }
                        if (direction == "R") {
                            //etr
                            return;
                        }
                        
                        //ete
                        
                        
                    }
                    self.startPoint = 0;
                }
            }
    }
})()