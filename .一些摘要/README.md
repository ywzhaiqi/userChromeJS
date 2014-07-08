总览
====

 - [Mozilla 开发者网络](https://developer.mozilla.org/)
 - [Add-ons](https://developer.mozilla.org/Add-ons)

Mozilla technologies
--------------------

 - [Places](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Places)
 - [Toolkit API](https://developer.mozilla.org/en-US/docs/Toolkit_API)
 - [XPCOM](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM)
 - [XUL](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL)

Downloads
---------

 - [Open and Save Dialogs](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Tutorial/Open_and_Save_Dialogs)
 - 调用 [Downloads.jsm](https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Downloads.jsm) 模块或 [Downloading Files](https://developer.mozilla.org/en-US/Add-ons/Code_snippets/Downloading_Files) 进行下载


KeyCode
-------

 - 来源： [Custom Buttons • View topic - Select an element to hide CB](http://custombuttons.sourceforge.net/forum/viewtopic.php?f=6&t=2130)
 - [sendKeyEvent()](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIDOMWindowUtils#sendKeyEvent())
 - [Constants for keyCode value](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode#Constants_for_keyCode_value)

```
    // simulate ctrl+shift+s
    var utils = document.commandDispatcher.focusedWindow.
        QueryInterface(Components.interfaces.nsIInterfaceRequestor).
        getInterface(Components.interfaces.nsIDOMWindowUtils);
    utils.sendKeyEvent("keypress", 0, KeyEvent.DOM_VK_K,
        Event.CONTROL_MASK | Event.SHIFT_MASK);

    // simulate shift+f4
    var utils = document.commandDispatcher.focusedWindow.
        QueryInterface(Components.interfaces.nsIInterfaceRequestor).
        getInterface(Components.interfaces.nsIDOMWindowUtils);
    utils.sendKeyEvent("keypress", KeyEvent.DOM_VK_F4, 0,
        Event.SHIFT_MASK);
```