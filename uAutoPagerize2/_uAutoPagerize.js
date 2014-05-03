// uAutoPagerize2.uc.js 的配置文件。

var prefs = {
    pauseA: true,            // 快速停止翻页开关，需要刷新页面
        Pbutton: [0, 0, 0],     // 需要按住的键.....0: 不按住任何键;1: shift鍵;2: ctrl鍵; 3: alt鍵;(同时按3个键.就填 1 2 3)(一个都不按.就填 0 0 0)
        mouseA: false,           // 按住鼠标左键..否则.双击;
            Atimeout: 200,      // 按住左键时..延时.多少生效..(单位:毫秒);
        stop_ipage: true,       // 如果在连续翻页过程中暂停.重新启用后.不在继续..连续翻页..
    // 下一页图片的修正，是 image 的属性
    lazyImgSrc: 'zoomfile|file|original|load-src|_src|imgsrc|real_src|src2|data-lazyload-src|data-ks-lazyload|data-lazyload|data-src|data-original|data-thumb|data-imageurl|data-defer-src|data-placeholder',
};


// 自定义站点，优先级最高
var MY_SITEINFO = [
    // 下面的都是示例
    // {
    //    siteName: "google",
    //     url: '^https?\\:\\/\\/(www|encrypted)\\.google\\..{2,9}\\/(webhp|search|#|$|\\?)',
    //     nextLink: "//a[div[@id=('nn')]] | //a[span/@id='nn'] | id('nav')//td[last()]/a | id('nn')/parent::a",
    //     pageElement: "//div[@id='ires']",
    //     exampleUrl: 'http://www.google.com.hk/'
    // },
    // {
    //    siteName: '百度贴吧',
    //     url: '^http://tieba\\.baidu\\.(cn|com)/f',
    //     nextLink: '//div[@class="pager clearfix"]/descendant::a[@class="next"]',  // xpath
    //     nextLink: 'auto;',  // Super_preloader 的自动查找
    //     nextLink: 'css;.pager a.next',  // Super_preloader 的 css 选择器
    //     pageElement: '//ul[@id="thread_list"]',
    // }
];

// 本体に組み込まれている MICROFORMAT を利用するか？
USE_MICROFORMAT = true;
