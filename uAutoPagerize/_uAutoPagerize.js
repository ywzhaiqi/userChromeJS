// uAutoPagerize 的配置文件。Ver 0.2.2 以上专用。
// 本体更新時に設定を書き換える手間を省くためのもので、無くても問題ない。

// 排除列表
var EXCLUDE = [
    'https://mail.google.com/*'
    ,'http://www.google.*/reader/*'
    ,'http://maps.google.*/*'
    ,'http://b.hatena.ne.jp/*'
    ,'http://www.livedoor.com/*'
    ,'http://reader.livedoor.com/*'
    ,'http://fastladder.com/*'
    ,'http://*mail.yahoo.*/*'
    ,'*/archives/*'

	// 一些不需要翻页的网站
	,'https://app.yinxiang.com/*'
	,'https://www.dropbox.com/*'
	,'http://www.toodledo.com/*'
];

// 自定义站点，优先级最高
var MY_SITEINFO = [
    // 下面的都是示例
	//{
 //       siteName: "google",
	//	url: '^https?\\:\\/\\/(www|encrypted)\\.google\\..{2,9}\\/(webhp|search|#|$|\\?)',
	//	nextLink: "//a[div[@id=('nn')]] | //a[span/@id='nn'] | id('nav')//td[last()]/a | id('nn')/parent::a",
	//	pageElement: "//div[@id='ires']",
	//	exampleUrl: 'http://www.google.com.hk/'
	//},
	//{
 //       siteName: '百度贴吧',
	//	url: '^http://tieba\\.baidu\\.(cn|com)/f',
	//	nextLink: '//div[@class="pager clearfix"]/descendant::a[@class="next"]',  // xpath
 //        nextLink: 'auto;',  // Super_preloader 的自动查找
 //        nextLink: 'css;.pager a.next',  // Super_preloader 的 css 选择器
	//	pageElement: '//ul[@id="thread_list"]',
	//}
];

// 本体に組み込まれている MICROFORMAT を利用するか？
USE_MICROFORMAT = true;
