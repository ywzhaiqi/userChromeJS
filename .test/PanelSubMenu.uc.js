
(function(){

    var toolbarbuttons = [
        {
            label: '测试菜单1',
            oncommand: '',
        }
    ];

    // 来自 User Agent Overrider 扩展
    const ToolbarManager = (function() {

        /**
         * Remember the button position.
         * This function Modity from addon-sdk file lib/sdk/widget.js, and
         * function BrowserWindow.prototype._insertNodeInToolbar
         */
        let layoutWidget = function(document, button, isFirstRun) {

            // Add to the customization palette
            let toolbox = document.getElementById('navigator-toolbox');
            toolbox.palette.appendChild(button);

            // Search for widget toolbar by reading toolbar's currentset attribute
            let container = null;
            let toolbars = document.getElementsByTagName('toolbar');
            let id = button.getAttribute('id');
            for (let i = 0; i < toolbars.length; i += 1) {
                let toolbar = toolbars[i];
                if (toolbar.getAttribute('currentset').indexOf(id) !== -1) {
                    container = toolbar;
                }
            }

            // if widget isn't in any toolbar, default add it next to searchbar
            if (!container) {
                if (isFirstRun) {
                    container = document.getElementById('nav-bar');
                } else {
                    return;
                }
            }

            // Now retrieve a reference to the next toolbar item
            // by reading currentset attribute on the toolbar
            let nextNode = null;
            let currentSet = container.getAttribute('currentset');
            let ids = (currentSet === '__empty') ? [] : currentSet.split(',');
            let idx = ids.indexOf(id);
            if (idx !== -1) {
                for (let i = idx; i < ids.length; i += 1) {
                    nextNode = document.getElementById(ids[i]);
                    if (nextNode) {
                        break;
                    }
                }
            }

            // Finally insert our widget in the right toolbar and in the right position
            container.insertItem(id, nextNode, null, false);

            // Update DOM in order to save position
            // in this toolbar. But only do this the first time we add it to the toolbar
            if (ids.indexOf(id) === -1) {
                container.setAttribute('currentset', container.currentSet);
                document.persist(container.id, 'currentset');
            }
        };

        let addWidget = function(window, widget, isFirstRun) {
            try {
                layoutWidget(window.document, widget, isFirstRun);
            } catch(error) {
                trace(error);
            }
        };

        let removeWidget = function(window, widgetId) {
            try {
                let widget = window.document.getElementById(widgetId);
                widget.parentNode.removeChild(widget);
            } catch(error) {
                trace(error);
            }
        };

        let exports = {
            addWidget: addWidget,
            removeWidget: removeWidget,
        };
        return exports;
    })();

    window.PanelCustomButton1 = {
        customViewID: 'PanelUI-customView',

        init: function() {
            let button = $C('toolbarbutton', {
                id: 'mPanelSubMenu-button1',
                class: 'toolbarbutton-1 chromeclass-toolbar-additional',
                label: '测试按钮',
                "cui-areatype": "menu-panel",
                "cui-anchorid": "PanelUI-menu-button",
                tooltiptext: '',
                oncommand: 'PanelCustomButton1.showSubView(this);',
                image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAACYElEQVRIid3Vy04aYRjGcdfehHt3X+Z+vI4mTWzSRVMV5CAICiJyFBSlakUQz4gowwxCQySxFcUiVGk1iIOjw+OmmYRqPr+0u77Jf/v8lm9X1391odgXzEbzmFnJI7icQ+DzIaaXsvAvivAtiPCGBXjmM3DP8XCFeEzNpOEMHsAZ2IdjOgWHPwVCSA/Hcd0vArPRPP684tXrHV0BR5eA3bsHQkgfIaTnRWAmknsGhLO/mCpctmHzJMFxXD8hpPdFILh8+AwIZX8yla+1Me7apQPTS1koitIBBMQ6U9magrGpBB3wL2Yhy3IH4BOvmBKqCqyTO3TA90mEJEkdgEv8wRRffYTFsU0HvGEBjUajA3AINab2Lx5gtm/RAc9cBtfX1x2ATagylazIMNk26YA7xKNer6vj7TZgES6YSlRkjIxv0AHXbBq1Wk0dVxTAJFSY2jq/h9H6CuAMHqBSqaDdBh4fgYcHQJ/5ztTGeQsGyzodmAzso1wuq+OyDGgz50zFyy3ozWt0wOFPoVQqqeP398BA5oypWFmCzhSnAxO+PRwfH0OWgVYLkCTgA3/KVORMgta4SgfsniSKxaI6fncHvOdLTC2d3kFjiNEBm3sXhUIBkgQ0m8DtLfCOP2FqodTEkC5KB8amEsjlcup4owG8TX9jav6kicHhFTpgdSYgiqI6fnMDvEl/ZSp0cosBTYQOWCZ3MDqxDbN9CybbJkbGN2G0bsBgWYd+dA06cxzDpji0xlVoDDFo9FEM6aIY1K5gQBPBx6FlOkAI6SGE9HEc1/+3UV8mx3Hdv5Hef6jj6T8BraHEXgQsuRQAAAAASUVORK5CYII='
            });

            ToolbarManager.addWidget(window, button, false);

            this.addSubView();
        },
        addSubView: function() {
            let panelView = $C('panelview', {
                id: PanelCustomButton1.customViewID,
                flex: 1,
                class: 'PanelUI-subview'
            });

            panelView.appendChild($C('label', {
                value: '测试',
                class: 'panel-subview-header'
            }));

            let vbox = $C('vbox', {
                id: 'PanelUI-customItems',
                class: 'panel-subview-body'
            });

            try {
                for (let button of toolbarbuttons) {
                    vbox.appendChild($C('toolbarbutton', button));
                }
            } catch (e) {
                // console.error('添加按钮错误', e);
            }

            panelView.appendChild(vbox);

            $('PanelUI-multiView').appendChild(panelView);
        },
        showSubView: function(aAnchor) {
            let popup = $('PanelUI-popup');
            popup.addEventListener('popuphiding', function(event){
                event.preventDefault();
                event.stopPropagation();
                popup.removeEventListener('popuphiding', arguments.callee, false);
            }, false);

            PanelUI.multiView.showSubView(PanelCustomButton1.customViewID, aAnchor);
        },
    };
    
    PanelCustomButton1.init();

    function $(id) document.getElementById(id);
    function $C(name, attr) {
        var el = document.createElement(name);
        if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
        return el;
    }
})()