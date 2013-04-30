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

	// My Exclude
	,'https://userscripts.org/scripts/search?q=*'
];

// 自定义站点，优先级最高
var MY_SITEINFO = [
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
];

// 本体に組み込まれている MICROFORMAT を利用するか？
USE_MICROFORMAT = true;
