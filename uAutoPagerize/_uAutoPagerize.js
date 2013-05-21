// uAutoPagerize 的配置文件。Ver 0.2.2 以上专用。
// 本体更新時に設定を書き換える手間を省くためのもので、無くても問題ない。

// 排除列表
var EXCLUDE = [
	'https://mail.google.com/*'
	,'http://www.google.co.jp/reader/*'
	,'http://b.hatena.ne.jp/*'
	,'http://www.livedoor.com/*'
	,'http://reader.livedoor.com/*'
	,'http://fastladder.com/*'
	,'http://**mail.yahoo.co.jp/*'
	,'http://maps.google.co.jp/*'
	,'*/archives/*'

	// 一些不需要翻页的网站
	,'https://app.yinxiang.com/*'
	,'https://www.dropbox.com/*'
	,'http://www.toodledo.com/*'
];

// 自定义站点，优先级最高
var MY_SITEINFO = [
	{siteName: "google",
		url: '^https?\\:\\/\\/(www|encrypted)\\.google\\..{2,9}\\/(webhp|search|#|$|\\?)',
		nextLink: "//a[div[@id=('nn')]] | //a[span/@id='nn'] | id('nav')//td[last()]/a | id('nn')/parent::a",
		pageElement: "//div[@id='ires']",
		exampleUrl: 'http://www.google.com.hk/'
	},
	{siteName: '百度贴吧',
		url: '^http://tieba\\.baidu\\.(cn|com)/f',
		nextLink: '//div[@class="pager clearfix"]/descendant::a[@class="next"]',
		pageElement: '//ul[@id="thread_list"]',
	},
	{siteName: '百度空间',
        url: '^http://hi\\.baidu\\.com',
        nextLink: {
            startAfter: '?page=',
            mFails: [/^http:\/\/hi\.baidu\.com\/.+/i, '?page=1'],
            inc: 1,
            isLast: function(doc, win, lhref) {
            	var script = doc.querySelector("#pagerBar > script");
                var m = script && script.textContent.match(/pageSize.*'(\d+)'[\s\S]*curPage.*'(\d+)'/);
                if (m && (m.length === 3)) {
            		if(parseInt(m[2]) >= parseInt(m[1]))
                    	return true;
                }
            }
        },
        pageElement: '//div[@class="mod-realcontent mod-cs-contentblock"]',
        exampleUrl: 'http://hi.baidu.com/gelida',
	},
];

// 本体に組み込まれている MICROFORMAT を利用するか？
USE_MICROFORMAT = true;
