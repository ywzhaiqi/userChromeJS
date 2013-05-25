// 修改自 openlinkinnewtabwithleftdoubleclick

(function() {
  var gTimer = null;

  function findLink(element) {
    switch (element.tagName) {
    case 'A': return element;

    case 'B': case 'I': case 'SPAN': case 'SMALL':
    case 'STRONG': case 'EM': case 'BIG': case 'SUB':
    case 'SUP': case 'IMG': case 'S':
      var parent = element.parentNode;
      return parent && findLink(parent);

    default:
      return null;
    }
  }

  function click(element, view) {
    var e = document.createEvent('MouseEvents');
    e.initMouseEvent('click', true, true, view, 0,
                     0, 0, 0, 0, false, false, false, false, 0, element);
    return !element.dispatchEvent(e);
  }

  function openTab(href) {
    if ('TreeStyleTabService' in window)
      TreeStyleTabService.readyToOpenChildTab(gBrowser.selectedTab, false);
    return gBrowser.addTab(href);
  }


  function findFrames(frame) {
    var frames = frame.frames;
    var fs = {};

    for (var i = 0, len = frames.length; i < len; ++i) {
      var f = frames[i];
      fs[f.name] = f;

      var children = findFrames(f);
      for (k in children) {
        var f = children[k];
        fs[f.name] = f;
      }
    }

    return fs;
  }

  function followLink(args) {
    var link = args.link;
    var newTab = args.newTab;
    var window = args.window;
    var activate = args.activate;
    var href = link.href;
    var target = link.target;

    if (newTab) {
      var tab = openTab(href);
      if (activate) {
        gBrowser.selectedTab = tab;
      }
    } else if (!target || target == '_self') {
      window.location.href = href;
    } else {
      switch (target) {
      case '_top':
        window.top.location.href = href;
        break;

      case '_parent':
        window.parent.location.href = href;
        break;

      case '_blank':
        gBrowser.selectedTab = gBrowser.addTab(href);
        break;

      default:
        var frames = findFrames(window.top);
        var frame = frames[target];

        if (frame) {
          frame.location.href = href;
        } else {
          gBrowser.selectedTab = gBrowser.addTab(href);
        }
      }
    }
  }

  gBrowser.mPanelContainer.addEventListener('click', function(e) {
    if (e.button == 2 && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
      var link = findLink(e.target);
      if (link) {
        var href = link.href;

        if (href && href.match(/^(https?|ftp):\/\//)) {
          e.preventDefault();
          e.stopPropagation();

          if (!gTimer) {
            gTimer = setTimeout(function() {
              try {
                // if (click(link, e.view)) {
                  followLink({ link: link, window: e.view, newTab: true, activate: false });
                // }
                clearTimeout(gTimer);
              } finally {
                gTimer = null;
              }
            }, 200);
          }
        }
      }
    }
  }, false);

  // gBrowser.mPanelContainer.addEventListener('dblclick', function(e) {
  //   content.console.log(e.button)
  //   if (gTimer) {
  //     try {
  //       clearTimeout(gTimer);
  //       var link = findLink(e.target);
  //       if (link) {
  //         var href = link.href;
  //         if (href.match(/^(https?|ftp):\/\//) && click(link, e.view)) {
  //           followLink({ link: link, window: e.view, newTab: true, activate: false });
  //         }
  //       }
  //     } finally {
  //       gTimer = null;
  //     }
  //   }
  // }, false);
})();