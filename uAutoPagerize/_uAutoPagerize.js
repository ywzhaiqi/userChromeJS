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
	{siteName: '水木社区',
		url: '^http://www\\.newsmth\\.net/nForum.*',
		nextLink: '//a[@title="下一页"]',
		pageElement: '//div[@class="b-content"]',
		exampleUrl: 'http://www.newsmth.net/nForum/#!board/TouHou'
	},
	{siteName: '优酷全部视频',
		url: '^http://www\\.youku\\.com/v.*',
		nextLink: '//a[em/@class="ico_next"]',
		pageElement: '//div[@id="list" or @id="listofficial"]'
	},
	{siteName: 'Mozilla Firefox中文社区',
		url: '^http://www\\.firefox\\.net\\.cn/forum/.*',
		nextLink: '//a[text()="下一页"]',
		pageElement: 'id("pagecontent")/table[@class="tablebg"]'
	},
	{siteName:'OperaChina',
		url: /http:\/\/(?:bbs\.operachina\.com|oc\.ls\.tl)/i,
		nextLink:'auto;',
		pageElement: '//table | //article[@class="post blue"]'
	},
	{siteName:'178漫画, 动漫之家',
		url:/^http:\/\/(?:manhua\.178\.com|www\.dmzj\.com)\/.+\.shtml/i,
		siteExample:'http://manhua.178.com/lansechumoshi/15794.shtml',
		nextLink:'//div[@class="pages2"]/descendant::a[text()="下一页"]',
		pageElement:'//div[@class="inner_img"]',
		useiframe:true,
	},

	// 我个人用的
	{siteName    : 'BookLink.Me:最有爱的小说搜索引擎',
		url         : '^http://booklink\\.me/charpter\\.php\\?.*',
		nextLink    : '//a[text()="下一页"]',
		pageElement : '//tr[@bgcolor]',
		exampleUrl  : 'http://booklink.me/charpter.php?site_id=1&book_id=2074146',
	},

	// 其它
	{  
		url         : '^https://mobile\\.twitter\\.com/[^/]+/status(?:es)?/\\d',
		nextLink    : 'id("tweets-list")/div[@class="list-tweet"][1]/div[@class="list-tweet-status permalink"]/a[@class="status_link"][2]',
		pageElement : 'id("tweets-list")',
	},
	{
		url         : '^http://www\\.dm5\\.com/m\\d+/',
		nextLink    : 'id("s_next")/a',
		pageElement : 'id("showimage")',
	},
	{siteName:'顶点小说',
		url: '^http://www\\.23us\\.com/html/.+\\.html',
		siteExample:'http://www.23us.com/html/26/26627/16952316.html',
		nextLink:' //dd[@id="footlink"]/descendant::a[text()="下一页"]',
		pageElement: 'id("amain")/dl/dd/h1 | id("contents")'
	},
	// {	// 内容无效，可能js加载
	// 	url         : '^http://www\\.dm5\\.com/m\\d+/'
	// 	,nextLink    : 'id("s_next")/a'
	// 	,pageElement : 'id("showimage")'
	// 	,exampleUrl  : 'http://www.dm5.com/m118202/'
	// },
	{
		url          : '^http://bbs\\.iiikl\\.net/forum\\.php\\?forum_id=.*'
		,nextLink    : '//a[@class="next"]'
		,pageElement : '//tr[@class="topic_list_row"]'
		,exampleUrl  : 'http://bbs.iiikl.net/forum.php?forum_id=82&class_id=0&page=2'
	}
];

// 本体に組み込まれている MICROFORMAT を利用するか？
USE_MICROFORMAT = true;
