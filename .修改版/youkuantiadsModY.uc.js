// ==UserScript==
// @name            youkuantiadsModY.uc.js
// @namespace       YoukuAntiADs@harv.c
// @description     视频网站去黑屏（网络本地结合版）。如果有本地播放器则使用本地的路径，否则使用默认的网络播放器
// @include         chrome://browser/content/browser.xul
// @author          harv.c
// @homepage        http://haoutil.tk
// @version         1.5.4
// @updateUrl       https://j.mozest.com/zh-CN/ucscript/script/92.meta.js
// @downloadUrl     https://j.mozest.com/zh-CN/ucscript/script/92.uc.js
// @note            2014-7-1 新增：提前判断是否为 flash，加快速度。
// @note            2014-7-1 新增：本地播放器检测功能。
// ==/UserScript==
(function() {
    /*
        脚本地址：http://bbs.kafan.cn/thread-1509944-1-1.html
        绿色播放器主页：https://g.mozest.com/thread-43519-1-1
     */

    var refD = 'file:///' + Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties)
            .get("ProfD", Components.interfaces.nsILocalFile).path + '/chrome/swf/';

    // YoukuAntiADs, request observer
    function YoukuAntiADs() {
        this.nsIHttpChannel = Components.interfaces.nsIHttpChannel;
    }
    YoukuAntiADs.prototype = {
        SITES: {
            'youku_loader': {
                'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/loader.swf',
                're': /http:\/\/static\.youku\.com(\/v[\d\.]+)?\/v\/swf\/loaders?\.swf/i
            },
            'youku_player': {
                'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/player.swf',
                're': /http:\/\/static\.youku\.com(\/v[\d\.]+)?\/v\/swf\/q?player[^\.]*\.swf/i
            },
            'ku6': {
                'player': 'https://haoutil.googlecode.com/svn/trunk/player/ku6.swf',
                're': /http:\/\/player\.ku6cdn\.com\/default\/common\/player\/\d{12}\/player\.swf/i
            },
            'ku6_out': {
                'player': 'https://haoutil.googlecode.com/svn/trunk/player/ku6_out.swf',
                're': /http:\/\/player\.ku6cdn\.com\/default\/out\/\d{12}\/player\.swf/i
            },
            'iqiyi': {
                'player0': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/iqiyi_out.swf',
                'player1': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/iqiyi5.swf',
                'player2': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/iqiyi.swf',
                're': /http:\/\/www\.iqiyi\.com\/player\/\d+\/player\.swf/i
            },
            'tudou': {
                'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/tudou.swf',
                're': /http:\/\/js\.tudouui\.com\/.*portalplayer[^\.]*\.swf/i
            },
            'tudou_olc': {
                'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/olc_8.swf',
                're': /http:\/\/js\.tudouui\.com\/.*olc[^\.]*\.swf/i
            },
            'tudou_sp': {
                'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/sp.swf',
                're': /http:\/\/js\.tudouui\.com\/.*\/socialplayer[^\.]*\.swf/i
            },
            'letv': {
                'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/letv.swf',
                're': /http:\/\/.*letv[\w]*\.com\/(hz|.*\/(?!(Live|seed))(S[\w]{2,3})?(?!Live)[\w]{4})Player[^\.]*\.swf/i
            },
            'letvskin': {
                'player': 'http://player.letvcdn.com/p/201403/05/1456/newplayer/1/SLetvPlayer.swf',
                're': /http:\/\/.*letv[\w]*\.com\/p\/\d+\/\d+\/(?!1456)\d*\/newplayer\/\d+\/SLetvPlayer\.swf/i
            },
            'pplive': {
                'player': 'https://haoutil.googlecode.com/svn/trunk/player/pplive.swf',
                're': /http:\/\/player\.pplive\.cn\/ikan\/.*\/player4player2\.swf/i
            },
            'pplive_live': {
                'player': 'https://haoutil.googlecode.com/svn/trunk/player/pplive_live.swf',
                're': /http:\/\/player\.pplive\.cn\/live\/.*\/player4live2\.swf/i
            },
            'sohu': {
                'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/sohu.swf',
                're': /http:\/\/tv\.sohu\.com\/upload\/swf(\/p2p(\/yc)?)?\/\d+\/(main|playershell)\.swf/i
            },
            'pps': {
                'player': 'https://haoutil.googlecode.com/svn/trunk/player/testmod/pps.swf',
                're': /http:\/\/www\.iqiyi\.com\/player\/cupid\/.*\/pps[\w]+.swf/i
            },
            // 2个本地的
            // '17173':{
            //     'player': refD + '17173_Player_file.swf',
            //     're': /http:\/\/f\.v\.17173cdn\.com\/(\d+)\/flash\/Player_file\.swf/i
            // },
            // '17173_Live':{
            //     'player': refD + '17173_Player_stream.swf',
            //     're': /http:\/\/f\.v\.17173cdn\.com\/(\d+)\/flash\/Player_stream\.swf/i
            // }
        },
        os: Cc['@mozilla.org/observer-service;1']
                .getService(Ci.nsIObserverService),
        init: function() {
            var site = this.SITES['iqiyi'];
            site['preHandle'] = function(aSubject) {
                var wnd = this.getWindowForRequest(aSubject);
                if(wnd) {
                    site['cond'] = [
                        !/(^((?!baidu|61|178).)*\.iqiyi\.com|pps\.tv)/i.test(wnd.self.location.host),
                        wnd.self.document.querySelector('span[data-flashplayerparam-flashurl]'),
                        true
                    ];
                    if(!site['cond']) return;

                    for(var i = 0; i < site['cond'].length; i++) {
                        if(site['cond'][i]) {
                            if(site['player'] != site['player' + i]) {
                                site['player'] = site['player' + i];
                                site['storageStream'] = site['storageStream' + i] ? site['storageStream' + i] : null;
                                site['count'] = site['count' + i] ? site['count' + i] : null;
                            }
                            break;
                        }
                    }
                }
            };
            site['callback'] = function() {
                if(!site['cond']) return;

                for(var i = 0; i < site['cond'].length; i++) {
                    if(site['player' + i] == site['player']) {
                        site['storageStream' + i] = site['storageStream'];
                        site['count' + i] = site['count'];
                        break;
                    }
                }
            };
        },
        // getPlayer, get modified player
        getPlayer: function(site, callback) {
            NetUtil.asyncFetch(site['player'], function(inputStream, status) {
                var binaryOutputStream = Cc['@mozilla.org/binaryoutputstream;1']
                                            .createInstance(Ci['nsIBinaryOutputStream']);
                var storageStream = Cc['@mozilla.org/storagestream;1']
                                        .createInstance(Ci['nsIStorageStream']);
                var count = inputStream.available();
                var data = NetUtil.readInputStreamToString(inputStream, count);

                storageStream.init(512, count, null);
                binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));
                binaryOutputStream.writeBytes(data, count);

                site['storageStream'] = storageStream;
                site['count'] = count;

                if(typeof callback === 'function') {
                    callback();
                }
            });
        },
        getWindowForRequest: function(request){
            if(request instanceof Ci.nsIRequest){
                try{
                    if(request.notificationCallbacks){
                        return request.notificationCallbacks
                                    .getInterface(Ci.nsILoadContext)
                                    .associatedWindow;
                    }
                } catch(e) {}
                try{
                    if(request.loadGroup && request.loadGroup.notificationCallbacks){
                        return request.loadGroup.notificationCallbacks
                                    .getInterface(Ci.nsILoadContext)
                                    .associatedWindow;
                    }
                } catch(e) {}
            }
            return null;
        },
        observe: function(aSubject, aTopic, aData) {
            if(aTopic != 'http-on-examine-response') return;

            if (!(aSubject instanceof this.nsIHttpChannel)) {
                return;
            }

            var aVisitor = new myNsIHttpHeaderVisitor();
            aSubject.visitResponseHeaders(aVisitor);
            if (!aVisitor.isFlash()) {
                return;
            }

            // console.log('[youku] ', aSubject, aTopic, aData)

            var http = aSubject.QueryInterface(this.nsIHttpChannel);
            for(var i in this.SITES) {
                var site = this.SITES[i];
                if(site['re'].test(http.URI.spec)) {
                    var fn = this, args = Array.prototype.slice.call(arguments);

                    if(typeof site['preHandle'] === 'function')
                        site['preHandle'].apply(fn, args);

                    if(!site['storageStream'] || !site['count']) {
                        http.suspend();
                        this.getPlayer(site, function() {
                            http.resume();
                            if(typeof site['callback'] === 'function')
                                site['callback'].apply(fn, args);
                        });
                    }

                    var newListener = new TrackingListener();
                    aSubject.QueryInterface(Ci.nsITraceableChannel);
                    newListener.originalListener = aSubject.setNewListener(newListener);
                    newListener.site = site;

                    break;
                }
            }
        },
        QueryInterface: function(aIID) {
            if(aIID.equals(Ci.nsISupports) || aIID.equals(Ci.nsIObserver))
                return this;

            return Cr.NS_ERROR_NO_INTERFACE;
        },
        register: function() {
            this.init();
            this.os.addObserver(this, 'http-on-examine-response', false);
        },
        unregister: function() {
            this.os.removeObserver(this, 'http-on-examine-response', false);
        }
    };

    // TrackingListener, redirect youku player to modified player
    function TrackingListener() {
        this.originalListener = null;
        this.site = null;
    }
    TrackingListener.prototype = {
        onStartRequest: function(request, context) {
            this.originalListener.onStartRequest(request, context);
        },
        onStopRequest: function(request, context) {
            this.originalListener.onStopRequest(request, context, Cr.NS_OK);
        },
        onDataAvailable: function(request, context) {
            this.originalListener.onDataAvailable(request, context, this.site['storageStream'].newInputStream(0), 0, this.site['count']);
        }
    };

    function myNsIHttpHeaderVisitor() {
        this._isFlash = false;
    }
    myNsIHttpHeaderVisitor.prototype.visitHeader = function(aHeader, aValue) {
        if (aHeader.indexOf("Content-Type") !== -1) {
            if (aValue.indexOf("application/x-shockwave-flash") !== -1) {
                this._isFlash = true;
            }
        }
    };
    myNsIHttpHeaderVisitor.prototype.isFlash = function() {
        return this._isFlash;
    };

    /**
     * 如果存在本地播放器，则替换地址为本地
     * @param {Array} sites 定义的站点列表
     */
    function setLocalPath(sites) {
        let swfPaths = {};

        let aFolder = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties)
                .get("ProfD", Components.interfaces.nsILocalFile);
        aFolder.appendRelativePath('chrome');
        aFolder.appendRelativePath('swf');

        if (!aFolder.exists()) {
            return;
        }

        // 取得所有的 .swf 文件
        let files = aFolder.directoryEntries.QueryInterface(Ci.nsISimpleEnumerator);
        while (files.hasMoreElements()) {
            let file = files.getNext().QueryInterface(Ci.nsIFile);
            if (file.leafName.endsWith('.swf')) {
                swfPaths[file.leafName] = refD + file.leafName;
            }
        }

        // 替换地址
        for(let [sitename, site] in Iterator(sites)) {
            for (let [name, url] in Iterator(site)) {
                if (typeof url === 'string' && url.startsWith('http')) {
                    let filename = url.match(/[^\/]+$/)[0];
                    if (filename in swfPaths) {
                        site[name] = swfPaths[filename];
                    }
                }
            }
        }

        // console.log('替换本地播放器成功', sites);
    }

    // register observer
    var y = new YoukuAntiADs();

    // 替换本地播放器
    setLocalPath(y.SITES);

    if(location == 'chrome://browser/content/browser.xul') {
        y.register();
    }

    // unregister observer
    window.addEventListener('unload', function() {
        if(location == 'chrome://browser/content/browser.xul') {
            y.unregister();
        }
    });

})();
