var { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
Cu.import("resource://gre/modules/Services.jsm");

var mainWin = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator)
            .getMostRecentWindow("navigator:browser");
var userChromejs = mainWin.userChromejs;

var app = angular.module('userChromejsApp', [], function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome|data):/);
});


app.controller('mainCtroller', function($scope){
    $scope.version = '1.7.0';
    $scope.activeTabIndex = 0;
    $scope.tabs = ['已安装脚本', '实用程序', '在线网址'];

    $scope.setTab = function(index) {
        $scope.activeTabIndex = index;
    };
});

app.controller('scriptListCtrl', function($scope){
    // 重新读取脚本
    mainWin.userChrome_js.getScripts();

    // $scope.headings = ['名称', '版本', '作者', '说明', '主页', '最新更新', '编辑', '打开', '删除']
    $scope.headings = ['名称', '版本', '说明', '主页', '最新更新', '编辑', '打开', '删除']
    $scope.search = '';

    $scope.openSetting = function() {
        mainWin.userChromejs.openPrefs();
    };
    $scope.updateScripts = function() {
        mainWin.userChromejs.openChromeURL('update.html');
    };

    // $scope.predicate = '-name';
    $scope.getLastUpdateTime = function(script) {
        var info = userChromejs.store.get(script.filename, {});
        if (info.installTime) {
            return getDiffTime(Date.now(), info.installTime);
        } else {
            return 'NA';
        }
    };

    $scope.toggleEnable = function(script) {
        userChromejs.chgScriptStat(script.filename);
    };
    $scope.editScript = function(script) {
        userChromejs.launchEditor(script);
    };
    $scope.openConfig = function(script) {
        userChromejs.openConfig(script);
    };
    $scope.openScript = function(script) {
        script.file.reveal();
    };
    $scope.updateScript = function(script) {
        // '<img class="icon16" src="/img/download.gif" name="down" alt=" ?">'
    };
    $scope.deleteScript = function(script) {
        if (script.deleted) return;

        userChromejs.script.uninstall(script);
        script.deleted = true;
    };

    $scope.$watch('search', updateSearch)

    function updateSearch() {
        var search = $scope.search;
        var scripts = userChromejs.manganer.list();

        if (!search) {
            $scope.filters = scripts;
        }

        $scope.filters = scripts.filter(function(script){
            return isMatch(script, search.toLowerCase().split(' '));
        });

        function isMatch(script, terms) {
            return terms.some(function(term){
                // 搜索内容
                var isMatched = ['name', 'filename', 'author', 'description'].some(function(pop){
                    return script[pop] && script[pop].toLowerCase().indexOf(term) !== -1;
                });
                if (isMatched) {
                    return isMatched;
                }

                // 搜索名字
                return ['homepageURL', 'downloadURL', 'reviewURL', 'restartless', 'config'].some(function(pop){
                    if (script[pop]) {
                        return pop.toLowerCase().indexOf(term) !== -1;
                    }
                });
            });
        }
    }

    function getDiffTime(sTime, eTime) {
        var e = Math.abs(sTime - eTime),
            c = Math.round(e / 6E4),
            d = Math.round(e / 36E5),
            e = Math.round(e / 864E5);
        return 60 >= c ? c + " 分钟" : 48 >= d ? d + " 小时" : e + " 天"
    }
});


app.controller('scriptUtilCtrl', function($scope){
    $scope.utils = [
        {name: '脚本设置', 
            input: { value: '导出', onclick: function() { userChromejs.save.exportPrefs(js_beautify); } },
            input2: { value: '导入', onclick: function() { userChromejs.save.importPrefs(js_beautify); } },
        },
        {name: 'addMenuPlus 生成器', url: 'http://ywzhaiqi.github.io/addMenu_creator/'},
        {name: '紫云飞鼠标手势生成器', url: 'chrome://userchromejs/content/ucjsMouseGestures_creator.html'},
        {name: '紫云飞拖曳生成器', url: 'chrome://userchromejs/content/ucjsMouseDrag_creator.html'},
    ];
});

app.controller('scriptWebSitesCtrl', function($scope) {
    var webSites = {
        '国内论坛': [
            ['卡饭论坛uc脚本索引', 'http://bbs.kafan.cn/forum.php?mod=viewthread&tid=1340501&page=1#pid25548028'],
            ['Mozest uc脚本论坛区', 'https://g.mozest.com/forum-75-1'],
            ['Mozest uc脚本下载区', 'https://j.mozest.com/zh-CN/ucscript/'],
            ['firefox吧的精品贴', 'http://tieba.baidu.com/f/good?kw=firefox'],
        ],
        '国内大神': [
            ['紫云飞 - UserChromeJS脚本', 'http://www.cnblogs.com/ziyunfei/archive/2011/11/25/2263756.html', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAADCklEQVQ4jZWU3UvTYRTH9wd4oSvNrW02V1PzlZpJFs6ZryM0X8qkbZUv058u6cWZWs2XXFvOiinZrKzowi6iQJCIoCKMFCmCgqQrrQjrpiCiuurTxS+2fmiZBw6H3/N8nw/nOb/zHJnsH1ah0WBbp0NIjKfJkEzNxiSKE9fyrzOL2h6NmtNpqYznZ/PSWs77RhsfnPXMnhC4X1NJZ04mRXGxS4M3h0fg0MVy12hkvrIMHDXQ7QSfCwZ6YNgDQ128cjUwWJJLRZIegyp6cfCGsDAOamN5mmPiZ1UltBwAVwu426G/E4Y8cHsQZm7A62t8vHQUi0GLxaBl6xrVQuhupToowFEPzmbocoL3uLgW8MLUFZh/BB8mgtqxvWXsTUuQAk3ylfgTk4Iii0EL7YfgpJgF/m4xPrkIb8YkunmXg77CLDYpo0LQeo2G6aws8RCEoO4OMQ72ivHOQGjvtw5fKw+rKyjV60Tg1vBwrian8NNsDgolUH8PnHdDwCOBBYEBD586BLymTNZHhCMri4yCknJoEMBeK712vysII+CBy17p/mWvuN7XzgNrObkxq5E1KFVwpB0Ot0D1fmhuEOvX2wZnu+HCqRAw4IFhL4z4fnu/6OfdzDbvY3+CHplLrYaR69DaBlYrNNqh47DYLme7ROCID670w9UzcDMAU2Pw4h5Mj8O7KZi4xVennba0FGTH1DHgHoA6QXKd5Thzk3xpqqYpPg6ZbZUCymywY+fCgv9hf/u2GLRwd5RnpWaKlQrxT48kJPM5O08q+s9oMWihtZEBw8ZQH9qVKh6nb1nQFv+b6URuDlUatfS1+OMSmNliWnb9nhfl44zTL3zL1ujV9K3VM5mewff8Iti5C/ZYoLYGHAIcPCC6YId9Nn6UljBtMtKl12OURyw+cXLlKxHUMYwmJTOXZYLicjjihDPnwO+HUx6oreNTYQHj6Rl06HTkR65aei4WylfQGqPjVuoG3hpzoHA7mIv5llfAVEYmPn08VoVi+ZN7mzySqmgldSoNglqLVaHEvERGvwC5vwKViDoIawAAAABJRU5ErkJggg=='],
            ['zbinlin — Bitbucket', 'https://bitbucket.org/zbinlin'],
            ['黒仪大螃蟹 - 百度网盘', 'http://pan.baidu.com/share/home?uk=2467242534#category/type=0', 'http://himg.bdimg.com/sys/portrait/item/6c93f90b.jpg'],
            ['dannylee 的多个脚本', 'http://g.mozest.com/thread-43513-1-1']
        ],
        'github': [
            ['ywzhaiqi/userChromeJS', 'https://github.com/ywzhaiqi/userChromeJS'],
            ['defpt/userChromeJs', 'https://github.com/defpt/userChromeJs'],
            ['feiruo/userChromeJS', 'https://github.com/feiruo/userChromeJS'],
            ['Drager-oos/userChrome', 'https://github.com/Drager-oos/userChrome'],
            ['Harv/userChromeJS', 'https://github.com/Harv/userChromeJS'],
            ['lastdream2013/userChrome', 'https://github.com/lastdream2013/userChrome'],
        ],
        '贴吧分享': [
            ['【FireSpider】一个图片采集器', 'http://tieba.baidu.com/p/3038754959'],
            ['两个关于右键菜单搜索的脚本', 'http://tieba.baidu.com/p/3280706126'],
            ['修改FF在window下的下载文件大小', 'http://tieba.baidu.com/p/3255073796'],
            ['BiliAss b站弹幕转ass字幕', 'http://tieba.baidu.com/p/3084445383']
        ],
        '国外主页': [
            ['alice0775/userChrome.js', 'https://github.com/alice0775/userChrome.js'],
            ['Griever/userChromeJS', 'https://github.com/Griever/userChromeJS'],
            ['ardiman/userChrome.js', 'https://github.com/ardiman/userChrome.js'],
            ['userChrome.js用スクリプト', 'http://wiki.nothing.sh/page/userChrome.js%CD%D1%A5%B9%A5%AF%A5%EA%A5%D7%A5%C8', 'img/wiki.nothing.sh.ico']
        ],
        // '其它': [

        // ]
    };

    var icons = {
        // 'github.com': 'moz-anno:favicon:https://assets-cdn.github.com/favicon.ico',
        'github.com': 'img/github.ico',
        'bbs.kafan.cn': 'img/kafan.ico',
        'g.mozest.com': 'img/mozest.ico',
        'j.mozest.com': 'img/mozest.ico',
        'tieba.baidu.com': 'img/tieba.baidu.ico',
        'pan.baidu.com': 'img/pan.baidu.ico',
        'bitbucket.org': 'img/bitbucket.png'
    };

    angular.forEach(webSites, function(sites, type){
        sites.forEach(function(site){
            if (site[2]) return;

            var url = site[1];
            var uri = Services.io.newURI(url, null, null);
            site[2] = icons[uri.host];
        });
    });

    $scope.webSites = webSites;
});

$('.script_sel, #setting-tab').hide();