// uAutoPagerize2.uc.js 的配置文件。

var prefs = {
    pauseA: true,            // 快速停止翻页开关，需要刷新页面
        Pbutton: [0, 0, 0],     // 需要按住的键.....0: 不按住任何键;1: shift鍵;2: ctrl鍵; 3: alt鍵;(同时按3个键.就填 1 2 3)(一个都不按.就填 0 0 0)
        mouseA: false,           // 按住鼠标左键..否则.双击;
            Atimeout: 200,      // 按住左键时..延时.多少生效..(单位:毫秒);
        stop_ipage: true,       // 如果在连续翻页过程中暂停.重新启用后.不在继续..连续翻页..
    ipages: [false, 2],         // 立即翻页,第一项是控制是否在js加载的时候立即翻第二项(必须小于maxpage)的页数,比如[true,3].就是说JS加载后.立即翻3页.

    // 下一页图片延迟加载的移除，是 image 节点的属性。该功能会把属性地址替换到图片地址。
    lazyImgSrc: 'zoomfile|file|original|load-src|_src|imgsrc|real_src|src2|data-lazyload-src|data-ks-lazyload|data-lazyload|data-src|data-original|data-thumb|data-imageurl|data-defer-src|data-placeholder',
};

// 页面不刷新的站点，通过延迟加载和额外添加 hashchange 事件来解决。
var HashchangeSites = [
    { url: /^https?:\/\/(www|encrypted)\.google\..{2,9}\/(webhp|#|$|\?)/, timer: 1500 },
    { url: /^https?:\/\/www\.baidu\.com\/($|#wd=)/, timer: 1000 },
    { url: /^https?:\/\/www\.newsmth\.net/, timer: 1000 },  // 水木清华社区延迟加载及下一页加载的修复
];

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

    // 示例：ipages 参数的使用。打开百度后立即加载3页。
    // {
    //     // 通过更改 pageElement 解决清爽百度的问题
    //     name: '百度搜索',
    //     url: "^https?://www\\.baidu\\.com/(?:s|baidu)\\?",
    //     nextLink: '//p[@id="page"]/a[contains(text(),"下一页")][@href]',
    //     pageElement: 'css;div#content_left',
    //     stylish: '.autopagerize_page_info { margin-bottom: 10px; }',
    //     ipages: [true, 3]
    // },
];

// 本体に組み込まれている MICROFORMAT を利用するか？
USE_MICROFORMAT = true;
