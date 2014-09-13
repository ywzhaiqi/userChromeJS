pref("extensions.userChromeJS@mozdev.org.description", "chrome://userChromeJS/locale/userChromeJS.properties");

// userChrome. 是 rebuild_userChrome 的存储方式
pref("userChrome.closeWindow", false);

// userChrome.js 的实验模式
pref("userChrome.EXPERIMENT", false);

pref("userChrome.enable.reuse", true);

// userChrome.js 的导入脚本的文件夹
pref("userChrome.arrSubdir", ", xul, TabMixPlus, withTabMixPlus, SubScript, UCJSFiles, userContent, userMenu");

pref("userChrome.install_skipSelect", true);
pref("userChrome.custom_prefs", "userChrome., userChromeJS., uAutoPagerize., addMenu.");

pref("userChrome.FILE", "local\\userChromejs_mix.json");