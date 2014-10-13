// ==UserScript==
// @name           Places_ShowBookmarkPath.uc.js
// @description    在 "我的足迹" 中右键显示书签路径
// @include        chrome://browser/content/places/places.xul
// @version        2014/10/12
// ==/UserScript==

var UC_PlacesShowPath = {
    bmsvc: Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
                      .getService(Components.interfaces.nsINavBookmarksService),

    init: function() {
        var menuitem = document.createElement('menuitem');
        menuitem.setAttribute('label', '在文件夹中显示');
        menuitem.setAttribute('title', '书签路径');
        // menuitem.setAttribute('oncommand', 'UC_PlacesShowPath.getFolders();');

        // 插入
        var popup = document.getElementById('placesContext');
        popup.appendChild(menuitem);

        // 显示
        var self = this;
        popup.addEventListener('popupshowing', function() {
            var folders = self.getFolders();
            menuitem.setAttribute('label', folders || '');
            menuitem.setAttribute('hidden', !folders);
        });
    },
    getFolders: function() {
        var node = PlacesUIUtils.getViewForNode(document.popupNode).selectedNode;
        if (node && node.itemId >= 0) {
            var parentId = node.itemId;
            var parents = [];
            while(true) {
                parentId = this.bmsvc.getFolderIdForItem(parentId);
                if (parentId == 0) break;

                var parentTitle = this.bmsvc.getItemTitle(parentId);
                if (!parentTitle) break;
                parents.unshift(parentTitle);  // 放到最前面
            }

            return parents.join('\\');
        }
    }
};

UC_PlacesShowPath.init();
