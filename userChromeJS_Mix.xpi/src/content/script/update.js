var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
Cu.import("resource://gre/modules/Services.jsm");

var mainWin = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator)
            .getMostRecentWindow("navigator:browser");

function nano(tpl, data) {
    return tpl.replace(/\{([\w\.]*)\}/g, function(str, key) {
        var keys = key.split('.'),
            value = data[keys.shift()];
        keys.forEach(function(key) {
            value = value[key];
        });
        return (value === null || value === undefined) ? '' : value;
    });
}

function displayUpdateScript(newScript, oldScript) {
    var info = {
        homepageURL: newScript.homepageURL || oldScript.homepageURL,
        name: newScript.name || oldScript.name,
        oldVersion: oldScript.version,
        newVersion: newScript.version,
        downloadURL: newScript.downloadURL || oldScript.downloadURL
    };

    var tpl = '<a target="_blank" href="{homepageURL}">{name}</a> 脚本从版本 <b>{oldVersion}</b> 更新到了版本 <b>{newVersion}</b>，' +
        '<a target="_blank" href="{downloadURL}">下载链接</a>';
    $('<li>').html(nano(tpl, info)).appendTo('#infos');
}

function displayNoUpdateScript(script) {
    var info = {
        name: script.name,
        homepageURL: script.homepageURL || script.downloadURL
    }
    var tpl = '<a target="_blank" href="{homepageURL}">{name}</a> 脚本没有更新';
    $('<li>').html(nano(tpl, info)).appendTo('#infos');
}

function compareVersion() {
    var text = this.responseText;
    var oldScript = this.oldScript;
    var newScript = mainWin.userChrome_js.parseScript(text);

    if (newScript.version && Services.vc.compare(newScript.version, oldScript.version) > 0) {
        displayUpdateScript(newScript, oldScript);
    } else {
        displayNoUpdateScript(oldScript);
    }
}

function isHasChanged(script) {
    var url = script.downloadURL;
    if (!url) {
        return;
    }

    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.oldScript = script;
    req.onload = compareVersion;
    req.send();
}

function init() {
    var scripts = mainWin.userChromejs.manganer.list(),
        downScripts = scripts.filter((s) => s.canUpdate),
        downLength = downScripts.length;

    $('#scripts-title').text(nano('共有 {downLength} 个脚本需要检查是否有更新信息，另有 {otherLength} 脚本没有下载链接', {
        downLength: downLength,
        otherLength: scripts.length - downLength
    }));

    downScripts.map(isHasChanged);
}

init();