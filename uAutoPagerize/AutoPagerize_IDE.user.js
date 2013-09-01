// ==UserScript==
// @name          AutoPagerize IDE
// @include       http*
// @exclude       http*://mail.google.com/*
// @exclude       http*://maps.google*
// @exclude       http*://www.google.com/reader*
// @grant         GM_registerMenuCommand
// ==/UserScript==


/*
 * @title AutoPagerize IDE
 * @description AutoPagerize IDEの結果をAutoPagerizeに加えやすいように書き換えた。
 * @include http://*
 * @license MIT License
 * @require
 */


//
// AuroPagerize IDE
//
// auther:  KUMAGAI Kentaro, GMO Internet lab. http://labs.gmo.jp/blog/ku/
// version: 0.0.4 2007/12/11
//
// this bookmarklet helps to create rules for Mozilla Firefox Greasemonkey script
// AutoPagerize http://userscripts.org/scripts/show/8551
//
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//


window.__apride_disable_ui = (location.host == 'fav' || location.host == 'dokodemo');
//window.__apride_disable_ui = true;
window.DEBUG_MODE = 0;

function dirty_generated_code() {
    if (window.__apride_disable_ui)
        return;

    var e = document.createElement('style');
    e.innerHTML = "\
                * #_apride {\
                    position: fixed;\
                    top: 5%;\
                    right: 5%;\
                }\
                \
                #_apride_main {\
                    padding: 10px;\
                    color: black;\
                }\
                \
                /*\
                #_apride_titlebar {\
                    background: blue;\
                    color: white;\
                    font-weight: bold;\
                    font-size: large;\
                    padding: 4px;\
                }\
                \
                #_apride input._es_text_error {\
                    background-color: red;\
                    color: white;\
                    font-weight: bold;\
                }\
                \
                */\
                \
                /** \
                 * floating window styles. \
                 *\
                 **/\
                \
                \
                ._floating_window {\
                    position: fixed!important;\
                    position: absolute;\
                    width: 400px;\
                    height: 400px;\
                    top: 5%;\
                    right: 5%;\
                    text-align: left;\
                    z-index: 100000;\
                    color: black;\
                \
                    font-family: '微软雅黑',Sans-Serif !important;\
                    font-size: normal !important;\
                    background: none repeat scroll 0% 0% rgb(249, 244, 227);\
                }\
                \
                ._floating_window div {\
                \
                }\
                \
                ._floating_window img {\
                    border: 0px none;\
                }\
                ._floating_logo  {\
                    padding-top: 10px;\
                }\
                \
                ._floating_tl {\
                    background: url('http://labs.gmo.jp/blog/ku/bookmarklet/bg/tl.png') top left no-repeat;\
                    cursor: move;\
                    position: absolute;\
                    top: 0; left: 0;\
                    width: 25px;\
                    height: 59px;\
                }\
                ._floating_tc {\
                    background: url('http://labs.gmo.jp/blog/ku/bookmarklet/bg/tc.png') top center repeat-x;\
                    cursor: move;\
                    position: absolute;\
                    top: 0; left: 25px; right: 25px;\
                    width: 350px; \
                    height: 59px;\
                }\
                ._floating_tr {\
                    background: url('http://labs.gmo.jp/blog/ku/bookmarklet/bg/tr.png') top right no-repeat;\
                    _background: url('http://labs.gmo.jp/blog/ku/bookmarklet/bg/tr.gif') top right no-repeat;\
                    cursor: move;\
                    position: absolute;\
                    top: 0; right: 0;\
                    width: 25px; \
                    height: 59px;\
                }\
                ._floating_ml {\
                    background: url('http://labs.gmo.jp/blog/ku/bookmarklet/bg/cl.png') center left repeat-y;\
                    _background: url('http://labs.gmo.jp/blog/ku/bookmarklet/bg/cl.gif') center left repeat-y;\
                    position: absolute;\
                    top: 59; left: 0; bottom: 23px;\
                    width: 25px; \
                    height: 318px;\
                }\
                ._floating_mc {\
                    background: #f9f4e3;\
                    overflow: auto;\
                    overflow-x: hidden;\
                    position: absolute;\
                    top: 59; left: 25px; right: 20px; bottom: 23px;\
                    width: 360px; \
                    height: 318px;\
                    z-index: 100001;\
                    scrollbar-face-color: #d6e3ee;\
                    scrollbar-3dlight-color: #dae6f0;\
                    scrollbar-highlight-color: #d6e3ee;\
                    scrollbar-shadow-color: #d6e3ee;\
                    scrollbar-darkshadow-color: #b4bfcc;\
                    scrollbar-arrow-color: #475f84;\
                    scrollbar-track-color: #f9f4e3;\
                }\
                ._floating_mr {\
                    background: url('http://labs.gmo.jp/blog/ku/bookmarklet/bg/cr.png') center right repeat-y;\
                    _background: url('http://labs.gmo.jp/blog/ku/bookmarklet/bg/cr.gif') center right repeat-y;\
                    position: absolute;\
                    top: 59; right: 0; bottom: 23px;\
                    width: 20px; \
                    height: 318px;\
                }\
                ._floating_bl {\
                    background: url('http://labs.gmo.jp/blog/ku/bookmarklet/bg/bl.png') bottom left no-repeat;\
                    _background: url('http://labs.gmo.jp/blog/ku/bookmarklet/bg/bl.gif') bottom left no-repeat;\
                    position: absolute;\
                    bottom: 0; left: 0;\
                    width: 25px; \
                    height: 23px;\
                }\
                ._floating_bc {\
                    background: url('http://labs.gmo.jp/blog/ku/bookmarklet/bg/bc.png') bottom center repeat-x;\
                    _background: url('http://labs.gmo.jp/blog/ku/bookmarklet/bg/bc.gif') bottom center repeat-x;\
                    position: absolute;\
                    bottom: 0; left: 25px; right: 25px;\
                    width: 350px; \
                    height: 23px;\
                }\
                ._floating_br {\
                    background: url('http://labs.gmo.jp/blog/ku/bookmarklet/bg/br.png') bottom right no-repeat;\
                    _background: url('http://labs.gmo.jp/blog/ku/bookmarklet/bg/br.gif') bottom right no-repeat;\
                    cursor: se-resize;\
                    position: absolute;\
                    bottom: 0; right: 0;\
                    width: 25px; \
                    height: 23px;\
                }\
                /*\
                ._floating_tc a:hover {\
                    background: none;\
                }\
                */\
                \
                #_apride img._es_selected_color {\
                    width: 16px;\
                    height: 16px;\
                }\
                \
                \
                ._floating_close {\
                    float: right;\
                    margin-top: 16px;\
                }\
                ._floating_mc .wrap {\
                    padding: 8px 16px 8px 8px;\
                }\
                ._floating_mc p {\
                    line-height: 1.2;\
                }\
                \
                ._floating_window #_apride_generated_code {\
                    font-size: small;\
                    color: black !important;\
                \
                    margin-top: 10px; \
                    display: none;\
                    width: 295px;\
                    height: 85px;\
                }\
                \
                #_apride .apride_input {\
                    width: 280px !important;\
                }\
                \
                #_apride dt._es_active_field {\
                    background: #e72d89;\
                    color: white;\
                    font-weight: bold;\
                }\
            ";
    document.getElementsByTagName("head")[0].appendChild(e);
    var div1 = document.createElement('div');
    div1.setAttribute('id', '//*[@id="_apride"');
    div1.innerHTML = '<div class="_floating_window" id="_apride"><div class="_floating_mc" id="_floating_mc"><form action="javascript:void(0);"><dl><dt id="_es_pageElement_field">pageElement<dd><span id="_es_pageElement_color"><img class="_es_selected_color" src="http://labs.gmo.jp/blog/ku/pixelcube.png" /></span><input class="apride_input" id="_es_pageElement" name="_es_pageElement" type="text" value="" /><dt id="_es_insertBefore_field">insertBefore<dd><span id="_es_insertBefore_color"><img class="_es_selected_color" src="http://labs.gmo.jp/blog/ku/pixelcube.png" /></span><input class="apride_input" id="_es_insertBefore" name="_es_insertBefore" type="text" value="" /><dt id="_es_nextLink_field">nextLink<dd><span id="_es_nextLink_color"><img class="_es_selected_color" src="http://labs.gmo.jp/blog/ku/pixelcube.png" /></span><input class="apride_input" id="_es_nextLink" name="_es_nextLink" type="text" value="" /><dt><span><img src="http://labs.gmo.jp/blog/ku/pixelcube.png" /></span>url<dd><input class="apride_input" id="_es_url" name="_es_url" type="text" value="" /></dl><input id="_apride_test" name="_apride_test" type="submit" value="apply this" /> <input id="_apride_generate" name="_apride_generate" type="submit" value="generate" /> <input id="_apride_strict" name="_apride_strict" type="checkbox" value="1" />strict <a href="http://swdyh.infogami.com/autopagerize" style="color: black;" target="_blank">infogami</a></form><textarea id="_apride_generated_code"></textarea></div><div id="_floating_titlebar"><div class="_floating_tl"></div><div class="_floating_tc" id="_apride_titlebar"><div class="_floating_close" id="_apride_close"><a href="javascript:void(0);" id="_floating_closewindow"><img alt="close this window" src="http://labs.gmo.jp/blog/ku/bookmarklet/close.gif" /></a></div><div class="_floating_logo">AutoPagerize IDE 0.0.5</div></div></div><div class="_floating_tr" id="_floating_top_right"></div><div class="_floating_ml" id="_floating_moddile_left"></div><div class="_floating_mr" id="_floating_moddile_right"></div><div class="_floating_bl" id="_floating_bottom_left"></div><div class="_floating_bc" id="_floating_bottom_center"></div><div class="_floating_br" id="_floating_bottom_right"></div></div>';

    return div1;
}
window.assert = window.trace = function(e) {
    if (window.DEBUG_MODE) {
        console.log(e);
    }
}

window.$ = function(id) {
    return document.getElementById(id);
}
window.$F = function(id) {
    var e = $(id);
    return (e && e.value) ? e.value : null;
}

window.get_classnames = function(e) {
    var classnames = {};
    e.className.split(/\s+/).forEach(function(name) {
        classnames[name] = 0;
    });
    return classnames;
}
window.add_classname = function(e, classname) {
    var classnames = get_classnames(e);
    classnames[classname] = 0;
    var names = [];
    for (i in classnames) {
        names.push(i);
    }
    var i = e.className = names.join(" ");
    trace("name: " + i + "/" + e.id);
}
window.remove_classname = function(e, classname) {
    var classnames = get_classnames(e);
    var names = [];
    for (i in classnames) {
        if (i != classname)
            names.push(i);
    }
    e.className = names.join(" ");
}

window.exec_element_ready = function(id, fn) {
    var timer = setInterval(function() {
        if ($(id)) {
            clearInterval(timer);
            fn.apply(this, [$(id)]);
        }
    }, 200);
}

String.prototype.surround = function(c) {
    if (c.length > 1)
        return c[0] + this + c[1];
    else
        return c + this + c;
}
String.prototype.qq = function() {
    return this.surround('""')
}
String.prototype.q = function() {
    return this.surround("''")
}

String.prototype.markup = function(tagname, attributes, pad) {
    pad = pad || '';

    var pairs = [''];
    if (attributes) {
        for (n in attributes) {
            pairs.push(n + "=" + attributes[n].replace(/"/g, '&quot;').qq());
        }
    }

    var str = this.toString();
    return (str == '') ? ('<' + tagname + pairs.join(' ') + '/>') :
        ('{' + str.surround(pad) + '}')
}

Array.prototype.collect = function(fn) {
    var ret = [];
    this.forEach(function(i) {
        ret.push(fn.call(this, i));
    }.bind(this));
    return ret;
};


Function.prototype.bind = function(scope) {
    var self = this;
    return function() {
        self.apply(scope, arguments);
    };
}


Function.prototype.bindAsEventListener = function(object) {
    var __method = this;
    return function(event) {
        return __method.call(object, event || window.event);
    }
}

Event.observe = function(obj, eventname, fn, capture) {
    obj.addEventListener(eventname, fn, capture);
}
Event.stopObserving = function(obj, eventname, fn, capture) {
    obj.removeEventListener(eventname, fn, capture);
}

//
// copyed from autopagerize.user.js.
//

function getFirstElementByXPath(xpath, node) {
    var node = node || document
    var result = document.evaluate(xpath, node, null,
        XPathResult.FIRST_ORDERED_NODE_TYPE, null)
    // for search element
    //  if (DEBUG_MODE) {
    //      var rule = [".match{border: 3px solid #f00}\n",
    //      ".match:after{content:'", xpath, "'}\n"].join('')
    //          GM_addStyle(rule)
    //          result.singleNodeValue.className =
    //          result.singleNodeValue.className + ' match'
    //  }
    return result.singleNodeValue ? result.singleNodeValue : null
}

function createDocumentFragmentByString(str) {
    var range = document.createRange()
    range.setStartAfter(document.body)
    return range.createContextualFragment(str)
}

function createHTMLDocumentByString(str) {
    var html = str.replace(/<!DOCTYPE.*?>/, '').replace(/<html.*?>/, '').replace(/<\/html>.*/, '')
    var htmlDoc = document.implementation.createDocument(null, 'html', null)
    var fragment = createDocumentFragmentByString(html)
    htmlDoc.documentElement.appendChild(fragment)
    return htmlDoc
}


function getElementsByXPath(xpath, node) {
    var node = node || document
    var nodesSnapshot = document.evaluate(xpath, node, null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
    var data = []
    for (var i = 0; i < nodesSnapshot.snapshotLength; i++) {
        data.push(nodesSnapshot.snapshotItem(i))
    }
    return (data.length >= 1) ? data : null
}



/**
 * @param id  most outer elements id.
 * @param elements id which works as title bar.
 * @return
 **/

function FloatingWindow(id, titlebar_id, resizebar_id, closewindow_id, ui_setup_fn, init_callback, close_callback) {
    this.window_id = id;
    this.titlebar_id = titlebar_id || id + "_top_center";
    this.resizebar_id = resizebar_id || id + "_bottom_right";
    this.closewindow_id = closewindow_id || id + "_closewindow";
    this.ev = {};

    this.dragging = false;
    this.last_pos = null;

    this.minimumX = null;
    this.minimumY = null;

    this.event_handler = {};

    this.on_init = init_callback || function() {};
    this.ui_setup_fn = ui_setup_fn || function() {};
    this.on_close = close_callback || function() {};

    this.initialize();
}

FloatingWindow.prototype.show_loading = function(show_or_hide) {
    if (show_or_hide) {
        this.div_loading = document.createElement('div');
        this.div_loading.style.position = "fixed";
        this.div_loading.style.right = "0px";
        this.div_loading.style.top = "0px";
        this.div_loading.style.background = "red";
        this.div_loading.style.fontWeight = "bold";
        this.div_loading.style.textColor = "white";
        var text = document.createTextNode("Loading...");
        this.div_loading.appendChild(text);
        document.body.appendChild(this.div_loading);
    } else {
        if (this.div_loading) {
            document.body.removeChild(this.div_loading);
            this.div_loading = null;
        }
    }
}

FloatingWindow.prototype.onclose = function() {
    var close_window = $(this.closewindow_id);
    var resize = $(this.resizebar_id);
    var handle = $(this.titlebar_id);
    if (close_window)
        Event.stopObserving(close_window, "click", this.event_handler.close_window);
    if (resize)
        Event.stopObserving(resize, "mousedown", this.event_handler.resize);
    if (handle) {
        Event.stopObserving(handle, "selectstart", this.event_handler.selectstart);
        Event.stopObserving(handle, "mousedown", this.event_handler.handle);
    }
    Event.stopObserving(window.document, "mouseup", this.event_handler.document_moseup);
    Event.stopObserving(window.document, "mousemove", this.event_handler.document_mosedown);

    var me = $(this.window_id);
    me.parentNode.removeChild(me);

    return true;
}

FloatingWindow.prototype.initialize = function() {
    this.show_loading(true);
    // disable creating hatolet window for debugging purpose.
    if (!window.__debug_disable_folating_window) {
        var e = this.ui_setup_fn.call(this);
        if (e)
            window.document.body.appendChild(e);
    }

    var timerid = setInterval(function() {
        if (this.initialize_callback()) {
            this.on_init();

            var close_window = $(this.closewindow_id);
            if (close_window) {
                Event.observe(close_window, "click",
                    this.event_handler.close_window = function() {
                        this.on_close.call(this);
                        this.onclose();
                        return true;
                    }.bind(this));
                close_window.onclick = function() {}.bind(this);
            }

            clearInterval(timerid);
        }
        this.show_loading(false);
    }.bind(this), 400);

}

FloatingWindow.prototype.initialize_callback = function() {
    var resize = $(this.resizebar_id);
    var handle = $(this.titlebar_id);
    if (handle == null) {
        trace(this.titlebar_id + " not found.");
        return false;
    } else {
        if (resize) {
            Event.observe(resize, "mousedown",
                this.event_handler.resize = this.onmousedown.bind(this));
        }
        if (handle) {
            Event.observe(handle, "mousedown",
                this.event_handler.handle = this.onmousedown.bind(this));
            Event.observe(handle, "selectstart", this.event_handler.selectstart = function(ev) {
                trace("stop");
                ev = ev || window.ev;
                window.stop_event(ev);
                return false;
            });
        }
        Event.observe(window.document, "mouseup",
            this.event_handler.document_moseup = this.onmouseup.bind(this));
        Event.observe(window.document, "mousemove",
            this.event_handler.document_mosedown = this.onmousemove.bind(this));
        return true;
    }
};

FloatingWindow.prototype.onmousemove = function(ev) {
    if (this.dragging) {
        if (window.event) {
            ev = window.event;
        }
        var pos = {
            x: ev.screenX,
            y: ev.screenY
        };
        var diffX = pos.x - this.last_pos.x;
        var diffY = pos.y - this.last_pos.y;

        var w = $(this.window_id);

        if (this.dragging.id == this.resizebar_id) {
            var resize = function(w, change_height_only) {
                var x = parseInt(w.style.width);
                var y = parseInt(w.style.height);
                if (isNaN(x))
                    x = w.clientWidth;
                if (isNaN(y))
                    y = w.clientHeight;

                //x += diffX;
                //y += diffY;
                //if ( this.minimumX && x < this.minimumX ) x = this.minimumX;
                //if ( this.minimumY && y < this.minimumY ) y = this.minimumY;

                w.style.height = (y + diffY) + "px";
                if (!change_height_only)
                    w.style.width = (x + diffX) + "px";
            }
            var objs = [w,
                $(this.window_id + "_mc"),
                $(this.window_id + "_rc"),
                $(this.window_id + "_bc"),
            ];
            for (var i = 0; i < objs.length; i++) {
                if (objs[i])
                    resize(objs[i]);
            }
            var objs = [
                $(this.window_id + "_ml"),
                $(this.window_id + "_mr"),
                //$(this.window_id + "_mc"),
            ];
            for (var i = 0; i < objs.length; i++) {
                resize(objs[i], true);
            }



        }

        if (this.dragging.id == this.titlebar_id) {
            var top = parseInt(w.style.top);
            var left = parseInt(w.style.left);
            if (isNaN(top))
                top = w.offsetTop;
            if (isNaN(left))
                left = w.offsetLeft;

            w.style.top = (top + diffY) + "px";
            w.style.left = (left + diffX) + "px";
        }


        this.last_pos = pos;
        window.stop_event(ev);
    }
    return true;
}
FloatingWindow.prototype.onmousedown = function(ev) {
    if (window.event) {
        ev = window.event;
    }

    this.last_pos = {
        x: ev.screenX,
        y: ev.screenY
    };

    //window.stop_event(ev);
    this.dragging = ev.currentTarget;


    return true;
}
FloatingWindow.prototype.onmouseup = function(ev) {
    if (window.event) {
        ev = window.event;
    }
    if (this.dragging) {
        window.stop_event(ev);
        this.dragging = null;
    }
    return true;
}

window.stop_event = function(ev) {
    if (document.all) {
        window.event.cancelBubble = true;
        window.event.returnValue = false;
    } else {
        if (ev) {
            ev.preventDefault();
            ev.stopPropagation()
            // for safari.
            // stopPropagation() is defined but do nothing on safari.
            this['on' + ev.type] = function() {
                return false
            };
        }
    }
}



ElementSelector = function(container_id) {
    this.matched_elements = [];
    this.container_id = container_id;
    this.item_suffix = 0;
    this.styles_overwrite = ["outlineWidth", "outlineStyle", "outlineColor", "backgroundColor"];

    this.hijack_events = ["click", "mouseover", "mouseout"];
    this.event_handlers = {};
    this.selected_elements_xpath = {};

    this.data_mode = "rss";

    this.active_field_index = 0;

    if (this.get_fields) {
        this.fields = this.get_fields();
    } else {
        trace("you need define ElementSelector.prototype.get_fields().");
    }
}

ElementSelector.get_incetance = function(id) {
    return ElementSelector.singleton ? ElementSelector.singleton : new ElementSelector(id);
}


// elements_group_name: id of input which contains xpath expression.
ElementSelector.prototype.refresh_selected_elements = function(elements_group_name, xpath) {
    if (this.selected_elements_xpath[elements_group_name]) {
        this.selected_elements_xpath[elements_group_name].forEach(function(e) {
            this.deselect(e);
        }.bind(this));
        this.selected_elements_xpath[elements_group_name] = null;
    }

    if (xpath == '') {
        return;
    }

    var nodes;

    try {
        nodes = ElementSelector.XPath.evaluate(xpath);
        this.selected_elements_xpath[elements_group_name] = nodes;
        if (this.on_xpath_match)
            this.on_xpath_match(elements_group_name);


        nodes.forEach(function(e) {
            this.select(e);
        }.bind(this));

        trace("new!" + "(" + nodes.length + ")" + xpath);
    } catch (e) {
        if (this.on_xpath_exception)
            this.on_xpath_exception(elements_group_name, e);
    }

}

ElementSelector.prototype.set_active_field = function(active_id) {
    for (var i = 0; i < this.fields.length; i++) {
        var id = this.fields[i];
        if (id == active_id) {
            this.active_field_index = i;
            break;
        }
    }
    this.refresh_active_field();
}

ElementSelector.prototype.hijack = function(parent_node) {
    this.hijack_events.forEach(function(event_name) {
        var handler = this["on" + event_name].bindAsEventListener(this);
        this.event_handlers[event_name] = handler;
        Event.observe(document, event_name, handler, false);
    }.bind(this));
    this.refresh_active_field();

}



ElementSelector.prototype.refresh_active_field = function() {
    var fields = this.get_fields();
    var active_id = fields[this.active_field_index];

    for (var i = 0; i < fields.length; i++) {
        var e = $(fields[i] + '_field');
        trace(fields[i] + '_field' + "/");
        if (i == this.active_field_index) {
            add_classname(e, '_es_active_field');
        } else {
            remove_classname(e, '_es_active_field');
        }
    }
}


ElementSelector.prototype.restore_event_handlers = function() {
    this.hijack_events.forEach(function(event_name) {
        var handler = this.event_handlers[event_name];
        Event.stopObserving(document, event_name, handler, false);
    }.bind(this));
}

ElementSelector.prototype.dehilight = function() {
    for (var i = 0; i < this.hilighted.length; i++) {
        var e = this.hilighted[i];
        e.style.outline = "";
    }
    this.hilighted = [];
}

ElementSelector.get_index_color = function(n) {
    // Citrus!
    // http://kuler.adobe.com/index.cfm#themeID/34878
    var rgb = [
        "rgb(240, 225, 76)",
        "rgb(255, 187, 32)",
        "rgb(250, 123, 18)",
        "rgb(232, 83, 5)",
        "rgb(89, 204, 13)",
    ];
    var i = n % rgb.length;

    return rgb[i];
}
ElementSelector.style_matched = function(e) {

    var c = ElementSelector.get_index_color(e.__hatolet_ui_status.field_id);

    ElementSelector.apply_style(e, {
        'outlineWidth': '2px',
        'outlineStyle': 'dotted',
        'outlineColor': "#e72d89",
        'backgroundColor': c
    });
}

ElementSelector.style_selected = function(e) {

    var c = ElementSelector.get_index_color(e.__hatolet_ui_status.field_id);

    ElementSelector.apply_style(e, {
        'outlineWidth': '2px',
        'outlineStyle': 'dotted',
        'outlineColor': "#0063dc",
        'backgroundColor': c
    });
}

ElementSelector.prototype.blur = function() {
    e = this.focused;

    if (this.focused == null)
        return;

    this.focused = null;
    e.__hatolet_ui_status.focused = false;


    ElementSelector.update_style(e);
}
ElementSelector.update_style = function(e) {
    if (e.__hatolet_ui_status.selected) {
        ElementSelector.style_selected(e);
    } else if (e.__hatolet_ui_status.matched) {
        ElementSelector.style_matched(e);
    } else if (e.__hatolet_ui_status.focused) {
        ElementSelector.apply_style(e, {
            'outlineWidth': '2px',
            'outlineStyle': 'dashed',
            'outlineColor': "#0063dc"
        });
    } else {
        ElementSelector.restore_style(e);
    }
}

ElementSelector.prototype.focus = function(e) {
    if (typeof e.__hatolet_ui_status == "undefined")
        e.__hatolet_ui_status = {};
    e.__hatolet_ui_status.focused = true;
    ElementSelector.update_style(e);
    this.focused = e;
}

ElementSelector.restore_style = function(e, styles) {
    var styles_to_restore = styles || [
        'outlineWidth',
        'outlineStyle',
        'outlineColor',
        'backgroundColor'
    ];
    for (var i = 0; i < styles_to_restore.length; i++) {
        var n = styles_to_restore[i];
        var v = e._hatolet_style_original[n];
        if (typeof v != "undefined")
            e.style[n] = v;
    }
}
ElementSelector.apply_style = function(e, styles) {
    for (n in styles) {
        if (typeof e._hatolet_style_original == "undefined")
            e._hatolet_style_original = {};

        if (typeof e._hatolet_style_original[n] == "undefined") {
            e._hatolet_style_original[n] = e.style[n];
        }
        e.style[n] = styles[n];
    }
    //this.focused = e;
}

ElementSelector.prototype.deselect = function(node) {
    node.__hatolet_ui_status.selected = false;
    var field_id = node.__hatolet_ui_status.field_id;
    node.__hatolet_ui_status.field_id = null;

    if (this.remove)
        this.remove(field_id);

    ElementSelector.restore_style(node);
}
ElementSelector.prototype.select = function(node) {
    var field_id = this.item_suffix;

    if (typeof node.__hatolet_ui_status == 'undefined') {
        node.__hatolet_ui_status = {};
    }


    node.__hatolet_ui_status.selected = true;
    node.__hatolet_ui_status.field_id = field_id;

    //var path_array = ElementSelector.XPath.get_path_from_element(node);
    //this.add(field_id, node, path_array);
    var matched_elements_hashkey = null;
    ElementSelector.style_selected(node);
}

// obsolete.
/*
ElementSelector.prototype.toggle = function (node) {
        if ( node.__hatolet_ui_status.selected ) {
            this.deselect(node);
        } else {
            this.item_suffix++;

            // this.select(node);

            if ( this.add )
                matched_elements_hashkey = this.add(node);

            this.selected_elements_xpath[matched_elements_hashkey] = [ node ];
        }
}
*/

ElementSelector.prototype.onclick = function(ev) {
    {
        ev = window.event || ev;
        var node = ev.target;

        // if target is submit button.
        if (node.tagName.toLowerCase() == "input" &&
            (node.type.toLowerCase() == "submit" ||
                node.type.toLowerCase() == "checkbox" ||
                node.type.toLowerCase() == "text")
        ) {
            trace("form element." + node.type.toLowerCase());
            return true;
        }

        // is descendant of div hatolet.
        //if ( node.className != "__hatolet_event_handler" ) {
        var e = node;
        while (e) {
            if (e.id == this.container_id) {
                if (node.tag == 'a') {
                    return true;
                }
                trace("in apride. discard event.");
                trace(node);
                return false;
            }
            e = e.parentNode;
        }
        //}

        this.item_suffix++;
        if (this.active_field_index < this.fields.length) {
            ret = this.add(node, this.fields[this.active_field_index]);
            this.refresh_selected_elements(ret.id, ret.xpath);
            this.active_field_index++;
            this.refresh_active_field();
        }


        ev.preventDefault();
        ev.stopPropagation()
    }

    return false;
}
ElementSelector.prototype.onmouseout = function(ev) {
    if (window.event) {
        ev = window.event;
    }

    this.blur();
    e = this.focused;

    if (this.focused == null)
        return;

    this.focused = null;
    e.__hatolet_ui_status.focused = false;


    window.stop_event(ev);
    //return false;
}
ElementSelector.prototype.is_ascendant = function(e) {
    var hatolet_root = $(this.container_id);
    var node = e;

    while (node != null) {
        if (node == hatolet_root)
            return true;
        node = node.parentNode;
    }
    return false;
}
ElementSelector.prototype.onmouseover = function(ev) {
    if (window.event) {
        ev = window.event;
    }

    var target = ev.target;

    if (this.focused != target) {
        // if element is descendant of hatolet, dont change styles.
        if (!this.is_ascendant(target)) {
            this.focus(target);
        }
    }

    window.stop_event(ev);
    //return false;
}


ElementSelector.prototype.show_generated_list_elements = function(prefix, is_show) {
    for (var i = 0; i < this.item_suffix; i++) {
        var e = $(prefix + i);

        if (e == null)
            continue;

        e.style.display = (is_show) ? "" : "none";
    }
}
ElementSelector.prototype.onchange_datatype = function(ev) {
    if (window.event) {
        ev = window.event;
    }
    var s = ev.target;
    var i = s.selectedIndex;
    var v = s.options[i].value;

    var is_rss = (v == "RSS");
    this.show_generated_list_elements("hatolet_window_datatype", (v == "RSS"));
    this.show_generated_list_elements("hatolet_window_fieldname", (v == "XML"));

}

ElementSelector.prototype.mark_matched = function(matches) {
    //this.matched_elements = [];
    matches.forEach(function(m) {
        var items_per_entry = m.length;
        for (var i = 0; i < items_per_entry; i++) {
            m[i].forEach(function(e) {
                if (typeof e.__hatolet_ui_status == "undefined") {
                    e.__hatolet_ui_status = {};
                }
                e.__hatolet_ui_status.matched = true;
                e.__hatolet_ui_status.field_id = i;
                ElementSelector.update_style(e);
            });
        }
    });
}

ElementSelector.prototype.alert = function(e) {
    alert(e);
}

/**
 *
 *  ElementSelector.XPath
 *
 **/

ElementSelector.XPath = function() {}

ElementSelector.XPath.attributes_for_predicate = [
    "border",
    //      "bgColor",
    //      "cellPadding",
    //      "cellSpacing",
    "height",
    "width",
    "class",
    "id"
];

ElementSelector.XPath.get_predicates = function(e) {
    var names = ElementSelector.XPath.attributes_for_predicate;
    var conds = {};
    for (var j = 0; j < names.length; j++) {
        var predicate_name = names[j];
        var propname = predicate_name;
        if (predicate_name == "class") {
            propname = "className";
        }
        if (e[propname]) {
            conds[predicate_name] = e[propname];
        }
    }
    return conds;
}
/**
 * get xpath array from DOM element.
 * @param
 * @return
 **/
ElementSelector.XPath.get_path_from_element = function(e) {
    var path = [];
    do {
        var tagname = e.tagName.toLowerCase();

        var index = null;

        // we can identify the element only with id if it is specified.
        // no need further information.
        var conds = ElementSelector.XPath.get_predicates(e);
        var has_id = ((conds && (typeof conds.id)) != 'undefined');

        if (has_id) {
            conds = {
                id: conds.id
            };
        } else {
            index = ElementSelector.XPath._get_sibling_number(e);
        }
        var p = new ElementSelector.XPath.Path(tagname, index, conds, e);
        path.unshift(p);

        if (has_id) {
            break;
        }

        e = e.parentNode;
    } while (e.parentNode);
    return path;
}


/**
 * construct xpath expression from array.
 * @param
 * @return
 *:*/
ElementSelector.XPath.prototype.format_expression = function(is_strict) {
    var s = [];
    var path = this.path;
    for (var i = 0; i < path.length; i++) {
        var x = path[i];
        s.push(x.format_expression(is_strict));
    }
    return s.join("/");
}

ElementSelector.XPath.evaluate = function(xpath, context) {

    context = context || document;
    return getElementsByXPath(xpath, context);
}

/**
 *
 *  ElementSelector.XPath.Path
 *
 **/

ElementSelector.XPath.Path = function(tagname, index, conds, element) {
    this.tagname = tagname;
    this.index = index;
    this.conds = conds;
    this.element = element;
}
ElementSelector.XPath.Path.prototype.from_string = function(s) {
    if (s.match(/^(\w+)(\[(.+?)\])*/)) {
        this.tagname = RegExp.$1;
        this.index = RegExp.$3;
    } else {
        // empty path.
        this.tagname = "";
        this.index = null;
    }
}
ElementSelector.XPath.Path.prototype.relax = function() {
    this.index = null;
}

ElementSelector.XPath.Path.prototype.equal = function(path) {
    trace(this.tagname + "==" + path.tagname);
    trace(this.index + "==" + path.index);
    return (this.tagname == path.tagname) &&
        (this.index == path.index);
}
ElementSelector.XPath.Path.prototype.format_predicates = function(is_strict) {
    var conds = [];
    for (var name in this.conds) {
        if (is_strict || (name == 'class' || name == 'id'))
            conds.push("@" + name + "=" + String(this.conds[name]).qq());
    }
    return (conds.length > 0) ? conds.join(" and ").surround("[]") : '';
}
ElementSelector.XPath.Path.prototype.format_expression = function(is_strict) {
    var s = "";

    is_strict = is_strict || this.strict;

    s = this.tagname;
    if (this.index != null) {
        var index_string = new String(this.index);
        s += index_string.surround("[]");
    }
    if (is_strict) {
        s += this.format_predicates(is_strict);
    }
    return s;
}


/**
 * get_path_from_element() support function.
 * @param
 * @return
 **/
ElementSelector.XPath._get_sibling_number = function(e) {
    var tagname = e.tagName.toLowerCase();

    var index = 1;
    var children = e.parentNode.childNodes;
    for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (c == e)
            break;
        else if (c.tagName && c.tagName.toLowerCase() == tagname)
            index++;
    }
    return index;
}



// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html

APRIDE = function() {
    this.inserted_items = [];
}

APRIDE.get_incetance = function() {
    return (APRIDE.singleton) ? APRIDE.singleton : (APRIDE.singleton = new APRIDE());
}

ElementSelector.prototype.get_fields = function() {
    return [
        '_es_pageElement',
        '_es_insertBefore',
        '_es_nextLink'
    ];
}
ElementSelector.prototype.remove = function(field_id) {

}

ElementSelector.prototype.on_xpath_match = function(id) {
    remove_classname($(id), '_es_text_error');
}
ElementSelector.prototype.on_xpath_exception = function(id, exception_object) {
    trace(exception_object);
    add_classname($(id), '_es_text_error');
}

ElementSelector.prototype.add = function(node, id) {
    var elements = [
        '_es_pageElement',
        '_es_insertBefore',
        '_es_nextLink'
    ];

    var path = ElementSelector.XPath.get_path_from_element(node);

    if (id == '_es_nextLink') {
        // nextLink element must be a anchor tag.
        while (path.length > 1 && path[path.length - 1].tagname != 'a') {
            path.pop();
        }
    }

    // remove html and body.
    // it brings some trouble when applying xpath to the next page document.
    while (path.length > 0 && (path[0].tagname == 'html' || path[0].tagname == 'body')) {
        path.shift();
    }

    if (path.length == 0) {
        trace("selected field does not contain any anchor tags.");
        return;
    }

    var e = $(id + '_color');
    e.style.background = ElementSelector.get_index_color(this.item_suffix);

    var is_strict = $('_apride_strict').checked;

    ElementSelector.XPath.is_strict = true;

    var expressions = path.collect(function(d) {
        return d.tagname + d.format_predicates(is_strict);
    });

    var xpath = '//' + expressions.join('/');
    $(id).value = xpath;

    return {
        id: id,
        xpath: xpath
    };
}

/**
 * get property names these can use for xpath expression.
 * @param
 * @return
 **/

function get_next_url() {
    var xpath = $('_es_nextLink').value;
    var res = getFirstElementByXPath(xpath, document);

    if (res) {
        return res.href;
    } else {
        return null;
    }
}

// elements have 3 state flags.
// pointed      mouse cursor is inside of element.
// selected
//

function onreadystatechange(req) {

    if (req.readyState == 4) {
        // only if "OK"
        if (req.status == 200) {
            trace("ok");
            // ...processing statements go here...
            var document_next = createHTMLDocumentByString(req.responseText);
            //window.dn = document_next;

            var page_element_xpath = $F('_es_pageElement');
            var nextpages = getElementsByXPath(page_element_xpath, document_next);
            trace("nextpage: " + req._requested_url);
            if (nextpages) {
                trace(nextpages);
            } else {
                alert("nextpages not found.");
                trace(document_next);
                trace(req.responseText);
                window.document_next = document_next;
                return;
            }
            var thispage = getFirstElementByXPath(page_element_xpath, document);

            trace("thispage: " + page_element_xpath);
            trace(typeof thispage);
            if (thispage) {
                trace(thispage);
            } else {
                alert("thispage not found.");
                return;
            }

            var insert_before_xpath = $F('_es_insertBefore');
            var insert_point = getFirstElementByXPath(insert_before_xpath, document);

            var apride = APRIDE.get_incetance();
            apride.inserted_items = nextpages;
            assert(apride.inserted_items == null);

            nextpages.forEach(function(i) {
                insert_point.parentNode.insertBefore(i, insert_point);
            });


            //thispage.parentNode.appendChild(nextpages);

        } else {
            trace("There was a problem retrieving the XML data:\n" +
                req.statusText);
        }
    }

}

function exec_once() {
    try {
        var container_id = "_apride";
        // prevent creating hatolet window multiple times.
        if (!$(container_id)) {

            var w = new FloatingWindow(container_id, container_id + "_titlebar", null, container_id + "_close",
                function() { // html generator.
                    return dirty_generated_code();
                }, function() { // initializer.
                    var es = ElementSelector.get_incetance(container_id);
                    APRIDE.es = es;
                    es.hijack();

                    ["_es_pageElement", "_es_nextLink", "_es_insertBefore"].forEach(function(id) {
                        Event.observe($(id), 'blur', function() {
                            var xpath = $(id).value;

                            if ($(id).__apride_last_xpath) {
                                if ($(id).__apride_last_xpath == xpath) {
                                    return;
                                }
                            }
                            $(id).__apride_last_xpath = xpath;

                            // deselect previous selected elements.
                            var matched = this.selected_elements_xpath[id];
                            if (matched) {
                                matched.forEach(function(e) {
                                    this.deselect(e);
                                }.bind(this));
                                this.selected_elements_xpath[id] = [];
                            }

                            // select newly matched elements.
                            es.refresh_selected_elements(id, xpath);
                        }.bind(this));
                        Event.observe($(id), 'focus', function() {
                            es.set_active_field(id);
                        }.bind(this));
                    }.bind(es));

                    var submit = $('_apride_test');
                    Event.observe(submit, 'click', function(ev) {
                        var ev = window.ev || ev;
                        var url;
                        try {
                            url = get_next_url();
                        } catch (e) {
                            trace(e);
                            return;
                        }

                        if (url) {
                            var req = new XMLHttpRequest();
                            req.onreadystatechange = function() {
                                onreadystatechange(req);
                            };
                            req._requested_url = url;

                            // remove previously inserted elements.
                            var apride = APRIDE.get_incetance();
                            if (apride.inserted_items) {
                                apride.inserted_items.forEach(function(e) {
                                    e.parentNode.removeChild(e);
                                });
                                apride.inserted_items = null;
                            }

                            req.open("GET", url, true);
                            trace(url);
                            req.send('');
                        } else {
                            es.alert('url has false value. maybe xpath is not correct.');
                        }
                        window.stop_event(ev);
                        return false;
                    });

                    var gen = $('_apride_generate');
                    Event.observe(gen, 'click', function(ev) {
                        var ev = window.ev || ev;

                        var infogamiEscape = function(v) {
                            return v.replace(/([_\*])/, "\\$1");
                        }

                        var rules = ["url", "nextLink", "pageElement", "insertBefore"].map(function(id) {
                            var v = infogamiEscape($('_es_' + id).value);
                            return id + ":    '" + v + "',";
                        });
                        rules.push("exampleUrl:    '" +
                            infogamiEscape(document.location.href) + "',");
                        var code = rules.join("\n");

                        var value = '';

                        var title_tags = document.getElementsByTagName('title');
                        if (title_tags.length > 0) {
                            value = '/* ' + title_tags[0].textContent + '*/\n';
                        }

                        var textarea = $(container_id + '_generated_code');
                        value += (code.markup('textarea', {}, '\n'));

                        textarea.value = value;
                        textarea.style.display = 'block';

                        window.stop_event(ev);
                        return true;
                    });
                }, function() { // onclose.
                    APRIDE.es.restore_event_handlers();
                });


        }

        exec_element_ready('_es_url', function(e) {
            e.value = location.href;
        });
    } catch (e) {
        trace(e);
    }
    return false;
}


GM_registerMenuCommand("启动 AutoPagerize IDE", exec_once);