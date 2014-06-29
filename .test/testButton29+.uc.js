(function () {
    CustomizableUI.createWidget({
        id : "Sidebar-button",
        type: "custom",
        defaultArea : CustomizableUI.AREA_NAVBAR,
        onBuild: function(aDocument) {
            var button = aDocument.createElement('toolbarbutton');

            var props = {
                id: "Sidebar-button",
                label : "侧边栏开关",
                tooltiptext : "左键：书签侧边栏右键：历史侧边栏中鍵：样式侧边栏",
                context: "userChromejs_options",
            };
            for (var p in props) {
                button.setAttribute(p, props[p]);
            }

            button.addEventListener('click', function(event){
                //console.log('11111', event.button)
                switch (event.button) {
                    case 0:
                        toggleSidebar('viewBookmarksSidebar');
                        break;
                    case 1:
                        toggleSidebar('viewStylishSidebar');
                        break;
                    case 2:
                        break;
                }
            }, false);

            return button;
        }
    });
 
    var cssStr = '@-moz-document url("chrome://browser/content/browser.xul"){'
         + '#Sidebar-button .toolbarbutton-icon {'
         + 'list-style-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAACs0lEQVQ4jc2SXUhTYRjH375o06md5Zmb07VwWmnTTZx6csej25n70p0tvzamVqhTiOqmruxCMAjTu6SIyEqyBDGiorrwQkyCQMqioGUIpYlrtAZrTJfu6aZzXN7ssh74XbzPxe99n//zIvRflqPJ2Ynh2TN8kRwE0ty/4IvksD0tA5AA34SPAdqVChiGzzianJ2cKC0rZ76w0gRaazNQjBsqGTdQNjdQjBs0NAPXRsb6rY2t01eH7/RbG1qmb92b6BseHe8r0tLvMWnOK04kV5Zu0PXHwOxsB4urA6yuDrD8gXa0gEZvAzVlhmLKDGrKDAWEHpRHaNDQDGQdKgZOlKcioqTJAQRdB4ShDiqMNtAaGSCNDqgwMlCms4CmygwllAnUZA2oyBpQaQ1AGGyQqyrfFGUq8leL9TZgKSB0sOwPenyBYPdSINjlC4Y8/mDY4wuGunyBkMcXDHX5Q2GPPxT2ZObkxzhRqih7VVPjABal1gDzK9/LEy1pbmGxVIBL17kGHxOvEZZGYFFTJvi49E2VSPR89k0ZD5NEEELbEEIIJQklv0ibC1hKdLXgXfpRlEg0/myS5AnFYU4kwCUb+vo2YCGMdlhYDBQihFB8dlu5Of6oir9XHEYIbWczApOznYO0NsCnlcBh9ub4sVkQQmjk/hOKL5RE4sOG2tZujmrGBR+++g/EjxH/Yrb3dOolwRdmrMeJpGA/fpKDPuqGt97lg1szqW3tBnPjCZw9v/Z+0SQJxZv/aH++8nN9+2lgMTa0wejE4+rhuw91V26PmQeGbjh6By/bey4M1A0OXTc8mJwiX8x5S6325lN5hSXvONHZ872XZIqC2Z3JWIyXhsdS0qUbe8TyKJaVu5YuU0RxWV4Uy9wXSc6Q/uRhosiOJCyGdqeAWKaYPXOu52Ki7f6b+g1HclJ7IcMjNQAAAABJRU5ErkJggg==)'
         + '}}';
    var sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
    var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    sss.loadAndRegisterSheet(ios.newURI("data:text/css;base64," + btoa(cssStr), null, null), sss.USER_SHEET);
})();