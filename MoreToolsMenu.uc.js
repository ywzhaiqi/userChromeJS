    (function() {
            const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

            var toolsPopup = $('menu_ToolsPopup');

            var menu, popup;
            
            menu = document.createElement("menu");
            menu.setAttribute("id", "moreTools-menu");
            menu.setAttribute("label", "Tools");
            menu.setAttribute("accesskey", "T");
            
            popup = document.createElement("menupopup");
            popup.setAttribute("id", "menu_MoreToolsPopup");
            
            $A(toolsPopup.childNodes).forEach(absorb);

            $W('popupshowing popupshown popuphiding popuphidden').forEach(function(type) {
                    popup.addEventListener(type, MTM_forwardEvent, true);
            });

            menu.appendChild(popup);
            $('main-menubar').insertBefore(menu, $('tools-menu').nextSibling);

            toolsPopup.addEventListener('DOMNodeInserted', function MTM_onDOMNodeInserted(event) {
                    var target = event.originalTarget;
                    if (target.parentNode === this)
                            absorb(target);
            }, false);

            function U(text) 1 < '?'.length ? decodeURIComponent(escape(text)) : text;
            function $A(arr) Array.slice(arr);
            function $W(str) str.split(' ');
            function $(id) document.getElementById(id);
            function isMoreTools(item) {
                    switch (item.getAttribute('id')) {
                    case 'menu_search':
                    case 'browserToolsSeparator':
                    case 'menu_openDownloads':
                    case 'menu_openAddons':
                    case 'sync-setup':
                    case 'sync-syncnowitem':
                    case 'devToolsSeparator':
                    case 'javascriptConsole':
                    case 'webConsole':
                    case 'menu_pageInfo':
                    case 'sanitizeSeparator':
                    case 'privateBrowsingItem':
                    case 'sanitizeItem':
                    case 'prefSep':
                    case 'menu_preferences':
                            return false;
                    }
                    return true;
            }
            function absorb(item) {
                    if (!isMoreTools(item)) return;

                    if (item.localName === 'menuseparator') {
                            setTimeout(function() document.adoptNode(item), 0);
                            return;
                    }

                    var itemLabel = item.getAttribute('label').toLowerCase();
                    var nodes = $A(popup.children);
                    for (var index = 0, len = nodes.length; index < len; index++) {
                            if (itemLabel < nodes[index].getAttribute('label').toLowerCase()) break;
                    }
                    popup.insertBefore(item, nodes[index]);
            }
            function MTM_forwardEvent({type}) {
                    var _event = document.createEvent('PopupEvents');
                    _event.initMouseEvent(type, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    toolsPopup.dispatchEvent(_event);
            }
    })();