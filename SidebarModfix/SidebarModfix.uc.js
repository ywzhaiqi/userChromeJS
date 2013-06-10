// ==UserScript==
// @name            SidebarMod.uc.js
// @description     Firefox侧边栏增强
// @include         chrome://browser/content/browser.xul
// @charset         UTF-8
// @author          NightsoN
// @note            v20130526: 增加中键点击标题或菜单则在标签页打开 by ywzhaiqi
// @note            v20130520: 更改了图标获取顺序，现在的获取顺序 style > favicon > 第一个子图标 by ywzhaiqi
// @note            v20130428: mino fixed by lastdream2013, add useful site
// @version         0.5
// ==/UserScript==

(function () {

if (!document.getElementById('sidebar-box')) return;
if (!window.SidebarMod) {
	window.SidebarMod = {
		operaLikeToggler: true,//是否显示Opera风格屏幕边缘侧边栏开关条
		sitelist:[
			{
				name: 'firefox内部功能',
                style: 'list-style-image: url("chrome://browser/skin/places/bookmark.png");-moz-image-region: rect(0px, 48px, 16px, 32px);',
				childs: [
					{
						name: '书签',
						url: 'chrome://browser/content/bookmarks/bookmarksPanel.xul',
                        favicon: "chrome://browser/content/abouthome/bookmarks.png"
					},
					{
						name: '历史',
						url: 'chrome://browser/content/history/history-panel.xul',
                        favicon: 'chrome://browser/content/abouthome/history.png'
					},
					{
						name: '下载',
						url: 'chrome://mozapps/content/downloads/downloads.xul',
                        favicon: "chrome://browser/content/abouthome/downloads.png"
					},
                    {
                        name: '扩展',
                        url: 'chrome://mozapps/content/extensions/extensions.xul',
                        favicon: "chrome://browser/content/abouthome/addons.png"
                    },
                    {
                        name: 'Scrapbook',
                        url: 'chrome://scrapbook/content/scrapbook.xul',
                        favicon: 'chrome://scrapbook/skin/main_24.png'
                    },
                    {
                        name: 'Console',
                        url: 'chrome://global/content/console.xul',
                        style: 'list-style-image: url("chrome://global/skin/console/console-toolbar.png");-moz-image-region: rect(0px, 24px, 24px, 0px);'
                    },
                    {
                        name: 'Preferences',
                        url: "about:config",
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABxElEQVQ4jZXQzYsScRzH8d/f16lTFCwRdOoSUYddtlrUaXTVEdR1xqfysLtUrC2EujNjbplPjIGtJIZB6YLMjqu105/w7tQhMB8+99f7C18hVpiiKGiaRjqdJplMsor5B6dSKWzbxnVdVFVdL6CqKuPxmMlkgmmaxOPx9QKapmHbNt1uF0VREEKISCRCOBxmd3d3eSyRSDAcDmk2m4RCIYLBIPl8nsFggCzLiwOyLBOLxej3+7TbbSqVCuVymVqtRqPRQJKk+QE5bSLnPhGNRrEsi06ng2VZtFot6vU61WoVn883Hz/TDLLmhOSJQ/j1N3q9HqVSiUAggCzLSJKE1+udjyXNIKs7VLq/KZ+5hI/HbGd6+P3+5c/yqQYp3eHdmcvL6pT900sK7V94Ds656/+4OOBN6CSLDuXPLocfpqjFC56bE45bP9nKjbjjNf8f2Eno7BUcjI7L4fspe4ULMrrDm8aMzRcjbnuMxde3ckP0zhX7p5fE3tqkTxzy9RmPsiM2dpZgIYS4r32n0L4iY0xIFh2O6jMeZkfceroCFkKIe4qF5+Cco9qMV9UZD1I/uPl4Rfx3G7LFdd9Xrj35wo3t9fAfyK1fDftrXK0AAAAASUVORK5CYII='
                    },
                    {
                        name: 'Stylish',
                        url: 'chrome://stylish/content/manage-standalone.xul?sidebar',
                        favicon: 'chrome://stylish/skin/16.png'
                    }
				]
			},
			{
				name: '常用站点',
				childs: [
                    {
                        name: '豆瓣',
                        url: 'http://m.douban.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABPElEQVQ4jZVTMYrEMAz0F/IFf8Ef8StcbydIH8gLAq7TBdwvuEutOp3BfSDd1nPFnXROsntwAlWyRprR2Jhg0Gb36OAnD0qEuMZTcmWUvSBvGZTou0caF15Q9oLjdeBTHK8DZS9YeLkDcGUAAFfG+BwR14i8ZZS9gCuDEqF7dLhubNrVbW9hgtFmP3nY3mpN8gTUotnegivrxJb3lYob3B1AaPylgUTe8hnA9vb0kCsjrhGUSKn4ySuIn/x9g4UXAEBc44mWnzziGrVZL3AFMMEgb1k3uHKXCHP4DECJbl4Q84zPEX7ySuktgJw0zAFhDr9q/+T4HN+LKLcX2+qDRgvR6HgddxHjGrWYt6wrusGpM1tjfTSSGxzc4ECJkLesvm9N1drbyHQp/Ce4MkyYw01xmdB+ZUp0ElYofgHXdqE+cgjSRwAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '网易',
                        url: 'http://3g.163.com/touch/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAT0lEQVQ4jWNgoAX4z8DwHxsmWTM+MaI0Y2PjNQSfIrIMIDks8CkkKxwojglcBhLlf3SDSPIGTDEuPkWuwGkAvpAnJIbXMEKuIegFfOJUAQBXtbVLrN/2QwAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '饭否',
                        url: 'http://m.fanfou.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABFUlEQVQ4jaWT0YmDQBCGtwFBrEBIA1dCSrAES0gJKcESLCElWICwi4FAQPDIQ0AQcvggHBx89zAZdtUTLnfCz7g4+/nP7KzZnSFxf9PuDCayYGpROcD+6tehYgtZC0UvMjVEFkzifAJA3sn67QLVCG5i9ZSD5CQuAOTdOlGT806cxXbuagbQP1WjxI8viVslzQD7qyQXvXdSDj87AjjeF4CslQ3V6KVQgPdP2XS8bwDUUvhRAW4SQNjorH0BcLhJTBtfXtq8ADC1NLQcxI2bNk4hBOQdnB4eoLWH9jcBenwgkOWM/ApQ9L5+fT89/KzoKK8AeScNWs6A9iW2vrTD7QmIFuOpShtppHY8VNYKLLJg/nudvwGJFjptrPPa+QAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '猫扑',
                        url: 'http://3g.mop.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACDElEQVQ4ja2Sv2saYRjHXyGD7SAhcIOUclAoRBEdQscOdfAHB+IhCncRpQq1GIiLeEM9hKOFTHbIplAyxHStgv9Ari3ZjKVwJFNADjQcAYk4qJdvB7nXXo9Chz7wgZeH5/28P56HkP8dfkWAXxHwr3lb9H98g1XY6LVsxVY+01L+LvErArxKEV6lCFYWaSFTS9jynYsTp4SVRXiVIh69e0PxVPPwVPPYOtynuT/lhBBCbu/vwMoiXAUe7mQQlXoAHz+/dBBupuCp5sFIOftTvEoRrgKPSj2A2ZzDbM5hMo1hZEQdqFoErCzCU81vBIyUQ6UewGqRxWzOYWykoelxyuVNgq5HRhSaHgcj5UCvv10RsVpkKWMjjWs9g2s9g8ubBOV3Ce1Uo9cCU0tA1SIwlxJlYpRsEmuzerWL069u8Md763/wKkW87TyDT9oBCflQ+fQKqhahp6paBP0hh+4giNftp3Ang3An12tGyoF4qnnM5hw0PY4PvecgIR980g7qXx7bePH+CUjIB/54D91BEOrV7kawWmQBswyYZXz/WYI7GUR3YMdV4NEfchgZUUymMUymsXUnWFlE+1yAuZTwYB7hwTyCuZQAs0w/dGykba2cTGNonwubgbIG5OCshs7FCRVZEms2+kMOpU4GrCwi3Ew5x7nRayHcTIGRctg63HfgVwQcnNVwe39HN/8CP0/uZd4hfyoAAAAASUVORK5CYII='
                    },
                    {
                        name: '亦歌',
                        url: 'http://www.1g1g.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABIElEQVQ4jc3OvU7CUACG4WNre/p36OodODh6Aw46G5GiYviRYrEQQUAEL8U7cCJxdfICTEycSExMnEhcSVxfN8VQtTEMfvObJ58Q/26IwMZpreN2CqjeENW/InNxT2bwin85/R1wmlPcFnhtUB1QPVDnY1T/EX9ACiAGuzFENreQ8erns8gn008B2PXECBH5qG4KwKp9D3hnKQB5lAy4jRXc058BRGBjlr5EyLCNVb/FiSc4zWQALeii74/QC88Yhx8RIvCQIVg1sCOwT+YBxIaHlgM9D/oeLB/MAj5mBWQVrBCs4yRg00fLgpYDLQA9PwuYGMUXjPIDZuUaWekmAGsmYnuC2BmzlB0hduejRQ+zfIOsPv0dMIpvGKW7hbx5B+TOnoWB2G7ZAAAAAElFTkSuQmCC'
                    },
                    {
                        name: 'Twitter',
                        url: 'https://mobile.twitter.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABtElEQVQ4jc2SsUsbURzHf+DQRbxF19zSQSg0B67FbCVbF+f4HzR19wpdKqEaSofSg4AcBtNQQ6YmYBKFKgSOloRwxmDwLMlpQLn3Qi5Hohm+HRo1Vy/q2AdfePD9fb783pdH9F8cxphwnxfOVqKB9f3dxXRpvcq5eO1VORdJM7nkV/bKXiGMMcGv7JVJ0UHqCShWg/Ah3w5nK1H/l91SqtZaoPyJFaR4E+Knwm/N5NJowGrxeIniTdAWu1XyHKTomEqa9mL2KEEG6z6nLQZKtECRAkbXfFs0oy54ROFf9lcAs1QwrJdvSs63GzNWA73fhvhx2/BtHDTHBQB4SkREP886L0jR7w4lWn/lAUu5dv3mnQAmXRs8Qq81lnC1bfDevKw7qpC27McEGLw37wpo2faMlDw8oOT5g3BI62YAPHEFAJgAMBc77kdCWjczDpZy7fqFczXn+eM0k0tysbHm26yfjoN5bxAAMOEC5Z3Dd8LKd0aRAuhz+U7zQtqyZd1RPeHh+qLVHwRTjctlWXfUV/udHyGtm5F1R001Lpet/iAIQPSE/+lgejj4DMDs8D59L0hEfwC1m8lBvoNIXAAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '豆瓣电台',
                        url: 'http://douban.fm/partner/sidebar',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZElEQVQ4jWNgYGBgmF9h9p8czADTfGtn9f+fD1aQhG/trIYYMr/CjGTNMIxhwNntnUThUQPwGEBxLFDVgP8/3/3///////8/32HlEzbg////8yvMIHqw8GnvApLCgKLMRGl2BgAcEBr6B9RuCQAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '新浪微博',
                        url: 'http://m.weibo.cn/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACbUlEQVQ4jb1SW0gUYRQ+TAsSZA+xL5Lu7R9nptBIzJJQKCFKicAHo4cowi5gkBCtbMXiPvQQbJnrziAVCUW91IN0ISiCTXYLglYSfIkC3ZnFWt3LjLZ5a/+vB1stCiGCDhwO/Od83/l+zkf0v0IPUlU2RCfTIWqNdNC6vyawVLpmqTRqaZS1VJrKqrT/j4N9RCUJJh3VPYo6zqTm4nuASMhq1JC5ShWWRt3TGs2memnLL+BxJ9utM3lM90jcEBUkmPSx2Bs6tLbCDNGwqZKZDVGDpdJjK0y3l8GGW243RGXREBUUU2fKqCFKxw1RfmBI0otkneOgeVnoslS6Z4WpY1qjESIiSrjlNoPJheLmVeq7SW/JvlyYOk2VLlgqvaLhMrfTEOVpQ1SQ3FqLrL8b+SdPMfc2jtloDNb1G/i0p3lJkagMfdixYT0R0UQPbTPD1EQJJt/UPRKfPHIM36bSPJfLQdM0HggEEI/HOQDwhQWeOdf1Q4k8Ne5kO1f+LirpiYZdKOTzSKVScLlcICIIggCbzYZYLAYAKMx8gbGpuqjk5YpBRGU+0+XjABAMBnljYyP6+/t5S0sLiIj7/X5wzjlfXESyumbpOh7p+U8E8qPPB1rBCwUMDAzA6/UiEonAZrNBEAREo1EAwMydu0vXYXJhzCXuXSZ4XV6+UffI7zPnL2LBtLjP50NlZSWvr6/H4OAgL+S/wupTuSFtRoLJ8wkmnfjNfQ/t9lKdyZeSNdtT6c6zMHt6YV7pQfr0GSRr6qCL8pwhyvdHKljVqn5vI1rzrMxRG3e4D8cd7NSw093+xsmabtntpasC/yW+A9uHY8MWzyGVAAAAAElFTkSuQmCC'
                    },
                   {
                        name: '腾讯微博',
                        url: 'http://1.t.qq.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACuUlEQVQ4jX2TW0iTYRjHX6mrIOgiCLopuurghRVURBcVESWRN94oBNaoLFpkhiFlaiFmrqOYWti0YRSZYWWWZuS5PGC6qdPmPOSmc+ft2+cM/X5dzFaK9Ic/vPC+/x/Pw/M+QiySMqYCvQh7Q/l2zjRe4IG+gLapTha/X6DgiAYGowiM3GDSYsYyIRFbe5oN5duJqY4lreUaj3q1S0OUqRz4mYBs1WKzS7jcEj6vF51Bx9GaeLZV7uXk59OUGErJMxQthCiOh+DMZ86ajtM+il+a4V+ZHQbuduURUxtPUsNFKgZfozU+I9yz4noMtnSmLY8WBN9/t5L+1sjLThuzv4K0j7dxufUKmV8z0fbp6Hb2IuasEeDRoYypCNgbwmH1GyMrsj4hMmsQV99T3mUF4IdtkIxv18luy+aVqXIeMHUTxXwU2WsEoKrPwfI7TYjbDYh7TYiceuJe9ITh+vEeUptTyWzPmgeMxKGYDjAjDQNwvG4MkddBRGEnEYWdiPwONhZ3hQEBv0xxTzGq+rMI9AIGIlEGI0EewuSYZVWxgQhtH6Lkj/tZVtBNRb8TUAhKMzQONXLsy6l5gF7AwGZmvN3Y/LNk1I8hnpoQZSMh64ZJqDIz7A5NR5aCtJhaUbekhADB/iimzYnhEj+P+tlVaWH/ByuHaibYWWklv9cXvvc7vbwzfqSo/wlCaq5j8kkB424fLp+MLMt/5zg3Fz7+ck3g097HE70P3/lzqFtSSKpNDv0FWZPLZEYqkzYLiyW7HUjNdXjOqnCtWYtz5Wrs69aHyv9XAfUZXEf2YS/Jw179ElfVc9zau3guqPAc3INnRySe6N24dm9BunNr6X2QNbl4tm7Ce3gr/sQYAsnxBNJOIGmSCNxUI11KIFj+7P8bKYQQwYoy5Mcapgs1TBfdQy59SPDd6yWDvwFbc6OSqZLwaQAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '网易微博',
                        url: 'http://3g.163.com/t/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAT0lEQVQ4jWNgoAX4z8DwHxsmWTM+MaI0Y2PjNQSfIrIMIDks8CkkKxwojglcBhLlf3SDSPIGTDEuPkWuwGkAvpAnJIbXMEKuIegFfOJUAQBXtbVLrN/2QwAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '巴士电台',
                        url: 'http://bus.fm/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABPElEQVQ4jWNgYGBgePD1tWTovh0rpJbNf8owb9p/fFhq2fynoft2rHjw9bUkAwMDA8P116/VBJfMeUtIIzoWXDLn7bm3b7UYQvZuX41L0cMvn/9XnDn+32/PNqzy/nu2rWPgWzzrAy4DkMH2Jw//y61chCLPs2jmZwZ8zkQH3/78/r/ozs3/Ift2ItThM+Dn37//Yw/u+X/74we4IXNuXvvPuXAWcQb8////P8O8af/ZFsz4b7xx9X/RZfMx1RFjAF5MdQOEls7977Fzy3+bretJNyD24J7/3/78Rgl5og0QWjr3/8+/f1E0//n3j7ABsISEzYB1D+7h1cyzaOZnBv8929bBBOy3bfi/4t7t/ydfvfxfevoYanzjSsrn3r7VoigzwbJzyN7tq8WXz39OSKP48vnPQ/ZuXw3LzgBPzHTE1v4angAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '虾米电台',
                        url: 'http://kuang.xiami.com/res/kuang/xiamikuang0709.swf/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA+0lEQVQ4jaXQPWsCQRDG8fEud+tX01YNpAiksEhhkcIiYCHKXT5TSJPGfIoEbMId95Jbq1hc8U81si4X8GXhxwwzz7Kw0qQysKlku5ce57CpZE0qA7GJZLukxyVsIpnYdcA1xC4DfAB2GbB/X9F13KzYRYAPOGlmFwHSPIeodrs5eqndbg47ADerpJmHKKCzar9/W+Hmm3mI/DzdoIDOqj3A7+sa947UswgFdNb/ZvUsQurHCNV+en/w9XHYAbhZJdU0xgecNKumMVI9xPiAo+r3LinvDarruDs3q6S8M1xDyonJylvDJYqJySUfmWEx7ufFuM+ZvvORGf4Bdjajn5E5dW4AAAAASUVORK5CYII='
                    },
                    {
                        name: '维基百科',
                        url: 'http://zh.m.wikipedia.org/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABS0lEQVQ4jcWTwY3EIAxFR6MUETpwDaPcQwekBVICOUIRLiGUQBqYlAAdhB6I/h5GQZPdaLXSrrQHDljW8/e3fSt7wW/e7f8BYQlQg4LsJcISUPYCP3vIXsJMBjFFlL3ATAZqUIgpIqYIPWqoQb0UOOtARBVQ9gLZSxARYorIW4azDsyMshfkLUOPGsz8AsQUIVoBPWrkLaPsBcwM0Qr42WN9rtCjrvADcPJADQqiFVifKw7oocJZBz/7CghLqP/be1C0As66msjMaO4N1KBO1Z11td3TFGQvIXtZjYspont0kL2sOTFFmMlcj9FZh+beVHkH4N1gZq5mXu4BEUENCnnL8LOHHjW6R1dNc9ZVoy8Bzjp0jw5mMvCzr5KJCMx88ugS4GcPIgIR1VbCEmrsmNK3q/zZzLIX6FGDiH52C2EJXyrFFE+b+mfH9AGWL1wAegygIwAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '百度百科',
                        url: 'http://wapbaike.baidu.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACoklEQVQ4jZ2T6UuUURSHzz9QRhCpJJVZERUFmVmp7bZYZiUttpiEVliEtCctJtGHPgQGEm1EUbQHUlCBWSI1NbagJfheX3XG1LSmhWL0NTtPH6ZmEulLF86XcznPPb/7O0eksAYprEEK3iKHqpED1Uj+a2TvK2TXC2SHG8lzIVufILkVyKZyJLsMySpF1t1HpLCG/z2ScQ+Rgre9LqzaTj1S0K7VVR0KYKxOtY2jvQAr7iBysLpH0nGUPTvaGBVTp5kZzWobh2mTGzVljldt4/QEpJcgsr8qmPj8qRuAXXltTB7fQE5mC26Xn7hx9cyd4cHt8vcEpN1GZN9rADyNXWxY26y5Oa1668ZXcjJbKC7yAVBc5KO4yIfb5cfr6QoBFt1EZPdLAK5d+sKQgZYmxjUogG0cOjtCsm3jsGrZO1YuadLWlh8BwPxriOysBOC5y09CbANLFzZxt+QbtnHYvKGFvC2t2Mbh2NGPTBpfT0ykwe3yK4DMvYLI9mcAdHfDjatftbjIp7ZxSE326ogoo2NibNYsf6e2cViW6iVtvlcb6gOOyKxLiGx7Gmyzo+MntnFIm+dlZJTR6HDDn1ixuElt4/D44XfltzKZfhGR3Iog4E1VJymzvYwYVMffxdHhhnHDbbIymrHrQlZK4nlENpUDoAqH89t18ACjQweaXoDBA4yOHWbzqPR78Gdl6jlEssuCgKMFHzS8r6WR/SwiwywN71OrEWEWUf0tHdTf0mERhssXvoQA8WcRySoNtuRp7GJLdivJSR7SU5o4cdzHieM+Zk1tJHZ0PRvXN9P2/kdIQtxpRNY9+Hu4FKgEnvwjKntM4sRTiKy+F1iK9BJkyW0k9Say4HrA49mXkZkXkaQLSMJ5ZMo5JP5M4OXYU8iEk/wC6ZkDX3ssK20AAAAASUVORK5CYII='
                    },
                    {
                        name: '互动百科',
                        url: 'http://3g.baike.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABVUlEQVQ4jaWSwSvDYRjHn79AkmhFW1vT0Gb90k5ujv4BVwcn5Q+QRn5tbUVZP6GtlJbk4ECRi5tcXLg5yg5yQw7Y+Dg87+ttlGne+vQ+z/d9P8/h7RUAdjvaAxB2OvkPQrWLP1F/BoCPuu4mF7a7+ZWzGRUaLy6Dr1rY6kHp/cmFr5cvfJfZZTyhEoJKCMrf2BvTi/vj2h9POrlsnEoIYbMPNvtgo78ZgJtTVwOcTLtz4wlrYVgLQxBxvJuHCiJQO4ePd3i8hZcHuL/S3HhCKQqlKKzGlGBI5Q3PZZbHmp6txrCesBKHlTgsDyh22d7ydKf54az2xhOKCSgmoDCoAARjrr+/dkNtVhjEekJ+GPLDkEvCq/ksuaSjOgXrE81ZLon1BD8FfgqWRlS+PNC6FcYTFtOwmIajgg5Y8P6G8YSsB1kPGm86YH60NdkM1hMA5jLtAXwCyK3ufWEwzWsAAAAASUVORK5CYII='
                    },
                    {
                        name: '糗事百科',
                        url: 'http://wap2.qiushibaike.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAhUlEQVQ4jWNgwAM6Es3/45PHCzoSzf9/uzbpP1mGwDQ/WBFLugHImmG4I9GceIOwGYBsEEHNMAMuttlgYLwugWmEBRw2jNcl+JxO0CvITiekGatXkOMcm9/RwwHFJeg24/I/ejjgNIAUTJEBMO/AwwDmR0KakMMCa0wQCkCCyRpfAGJTDwBSGrIfx7jxzAAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '百度贴吧',
                        url: 'http://wapp.baidu.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACoklEQVQ4jZ2T6UuUURSHzz9QRhCpJJVZERUFmVmp7bZYZiUttpiEVliEtCctJtGHPgQGEm1EUbQHUlCBWSI1NbagJfheX3XG1LSmhWL0NTtPH6ZmEulLF86XcznPPb/7O0eksAYprEEK3iKHqpED1Uj+a2TvK2TXC2SHG8lzIVufILkVyKZyJLsMySpF1t1HpLCG/z2ScQ+Rgre9LqzaTj1S0K7VVR0KYKxOtY2jvQAr7iBysLpH0nGUPTvaGBVTp5kZzWobh2mTGzVljldt4/QEpJcgsr8qmPj8qRuAXXltTB7fQE5mC26Xn7hx9cyd4cHt8vcEpN1GZN9rADyNXWxY26y5Oa1668ZXcjJbKC7yAVBc5KO4yIfb5cfr6QoBFt1EZPdLAK5d+sKQgZYmxjUogG0cOjtCsm3jsGrZO1YuadLWlh8BwPxriOysBOC5y09CbANLFzZxt+QbtnHYvKGFvC2t2Mbh2NGPTBpfT0ykwe3yK4DMvYLI9mcAdHfDjatftbjIp7ZxSE326ogoo2NibNYsf6e2cViW6iVtvlcb6gOOyKxLiGx7Gmyzo+MntnFIm+dlZJTR6HDDn1ixuElt4/D44XfltzKZfhGR3Iog4E1VJymzvYwYVMffxdHhhnHDbbIymrHrQlZK4nlENpUDoAqH89t18ACjQweaXoDBA4yOHWbzqPR78Gdl6jlEssuCgKMFHzS8r6WR/SwiwywN71OrEWEWUf0tHdTf0mERhssXvoQA8WcRySoNtuRp7GJLdivJSR7SU5o4cdzHieM+Zk1tJHZ0PRvXN9P2/kdIQtxpRNY9+Hu4FKgEnvwjKntM4sRTiKy+F1iK9BJkyW0k9Say4HrA49mXkZkXkaQLSMJ5ZMo5JP5M4OXYU8iEk/wC6ZkDX3ssK20AAAAASUVORK5CYII='
                    },
                    {
                        name: 'Facebook',
                        url: 'http://iphone.facebook.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAYElEQVQ4jWNgoAZIrFzz3zpyBkk4sXLNf7gBpGqGYaINSKhY/f/1uy//YYBkA5A1k2UAukb6GYALEG3A63dfUPwP4w+hMCDaANekef9zW7bgxDCALOaaNI+KBlCcmSgBAGeM72Qj9WvdAAAAAElFTkSuQmCC'
                    },
                    {
                        name: 'Google阅读器',
                        url: 'https://www.google.com/reader/i/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACFUlEQVQ4jX3Sz2vaYBwG8Ng4et+hSAvCGD0Vdlltoaf2st291UsPAw+1jDkG7joLjm77AwrubxgDd5EV2gjWzWiM0TQ2XbJU46+IQW0qhWQ8OwTj1LoXntv7fL68X16CmDrG0T6Mo33okQA6B350DvxQd3dQ2VpzMrwoY7o3UW4fH04g6u4O5OdPUdlaQ+nJI2S9nvmAZRq4G+q4G+oYpL5CjwRmAGZ1ZT4wKt/eaBj0G+g1RNTfvXQAZnUFWa8HisTMIvqnV2gU004G/QZ6ehVdTcbv1y+c6efLS6gp7BhZjJn4Nw/eqhPxRWlclfMobG8i6/VMAovv/8wtu8MiyBADMpiBL0qjfXyI8+WlKSBmwjINXLV7+PxTx+OPnXsBMphBUy07gCIx+CXSNjC9uA/fa3CHxRlAveZQ2N6cBSiWh6BI483rVVAsj4dvOKdMBjPgYhGw/mcOIFz8sIFRkWJ51Oqys/l40p6+sHcCMpjB6cY6TjfWwSW/oavJKHFpGxhN7elVFC95FC95aC0RWkuEL0pjYe8ErkAC7VYVtboMyzRwe6OBK6RAuMMiKJYHxfLoajK6mgyat4GmWkY8ycAVSMAVSMAyDQz6DVimAcs07CeQIcYpUux48pdUFk21DPWac4ASl0aJSyOfO0M+d2Z/IjLEQFAkCIoEmueRqwgQFAnxJOM8ZwTc+/8JgiBGF/6Xed2/El5+8KbNu3wAAAAASUVORK5CYII='
                    },
				]
			},
			{
				name: '邮箱',
				childs: [
					{
						name: 'Gmail邮箱',
						url: 'https://mail.google.com/mail/x/1cj43rhn0qhbt/?ltmpl=ecobh&nui=5&btmpl=mobile&shva=1',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAiElEQVQ4jdWPsQ3AIAwEGYtZ2IZpvIGHoaRLm47q0wCyiY2SKspL3/mOJ4T/p8SI0TNnNKJtz5whGSUoMQLMcMOM9T7I14+UfEmHj5TUiikA4EsWGIAtMCUGvBWAWUkULFbZglrRiJREwo0IqNURDLgfjO/I2fLmJlhhN11iLngcb8GbTsHnuQAHliL7fehqZAAAAABJRU5ErkJggg=='
					},
					{
						name: 'hotmail邮箱',
						url: 'https://login.live.com/?pcexp=false',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAOklEQVQ4jWP47if3HxdmYGBgqN/F8B8XZmBgYGAYNWAwGEA5WPL+P07MwMDwfyfDf1x41IDBYwCFAABNnuSDUZI3LgAAAABJRU5ErkJggg=='
					},
					{
						name: '网易邮箱',
						url: 'http://m.mail.163.com/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAT0lEQVQ4jWNgoAX4z8DwHxsmWTM+MaI0Y2PjNQSfIrIMIDks8CkkKxwojglcBhLlf3SDSPIGTDEuPkWuwGkAvpAnJIbXMEKuIegFfOJUAQBXtbVLrN/2QwAAAABJRU5ErkJggg=='
					},
					{
						name: 'QQ邮箱',
						url: 'http://w.mail.qq.com/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADMUlEQVQ4jWWTXWxTdRyG/5jYC+ONhBjCxoWROD7cDHKBkw9ZhBQ3CMNlqBCNQFyiy0bWqRVNlPiVsKzJsBdsxrBlgChj2Qc0RWA2c5hmUGDUlkE/JrpubHbnnJ719HRtz+njBYkf25P87t7nd/W+QsyD26KIwKOO3N2NPj18xDg1/KFhdVX5XnLtcJT0bSian/+/PFpgI/yCrv3ZydSkzFhMoeLiW6zu3UCNp4am4SZ9m3u3baF4Vlj4vdzN+LvosdNMxXVkRUOWJM74T7Lz0uus7dvMocF6zoddvOE56F5zdo3l3weR9S1IbRj3bUh/TTCrzZHNZCCfh2yGsfhvfHW9iVd/2sPHvx5m8I+rbHNXOh7KflGM+r1BrBZ9vIOkZoBpYgK9vhiNXbfpv/kAslm894do/OUQzb5mTo7+YKzt3bRaEFnXQuIURKrQ4tcxARPY3+XH8oUb8ZmLRw73cykwDcBoLIB9qJG2kVasF6sdgom6u0w2YkZ2oauTAJwbmUYc9SCaBxHHriK+HqC22w9APgPe6BD2IRv7rhwICmL1GSJlmJEdZFIqhgl7+kMI5zDiuA/R6kM4r/Fi+00GQhJGziCpaBy/8Q2vuHcnBGM7M4wWYobKID2NL6bz+Ld+FrUHEO0BxIkAizqCPNY6QoNXhnwOPaHjCQ+w+cL2pCD4RJiAgFAZ2dkoJtBzR0a030OcHnt4HWFqu/2YQNY0SappbkSvsenC9qBIhiuc2fAqUhE7iiIDeXruyGztj9HglWnwyljPT9DglRkISUjjEVRZ4+d7Htb1bWkRWjRaPNHZZoxrc0hqCk3TwMxh5gww8gAYQHYqgtrWRKJ8C5r9I476jhnFvaXFQggh5Keedk6dO8EDJU5cn0PNGKSBNKDNTDJ7uYvEvkrkpcuRFy8l/XwpPe9ZW/5pYlAIi1xY6Fbq9jPzYytx1xlmur9Ddn6KUldF4uXnUDY+i/rmVtSK9SRKStzB6mqLmI/0ZIFNKV2lJ9+xkrK/RurI2+jN9aQ7Pmeu80uSNVW6VLB84Zj+S3zJsiJl5UqHunfXrdQn76N9UEuisvyWsuIZR3zJsgVz/hsDb4s1Ix8u4wAAAABJRU5ErkJggg=='
					},
					{
						name: '139邮箱',
						url: 'http://wapmail.10086.cn/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAp0lEQVQ4jWNgGAUMdl2H/8MwNjG7rsP/pbvv/mdgYGCQ7r6LKU6MATA5XOIM6AZgcyE+NoYBJLuAJ3fLf57cLXADYHxkDAsDbOIYBiADXHJwcWwm4nIBVnFiFMKiEZc4ZYA7e8t8ZIxNLHnPL6ziKbt+LWDgzt2UgIwZGBgwxDDEs7fEI4szsGduVGfPXqcGcxUynz17nRp75kZ1dJezZ25UZ8/cqA4AXbcUT3TS3DcAAAAASUVORK5CYII='
					},
				]
			},
			{
				name: '翻译',
				childs: [
					{
						name: 'google翻译',
						url: 'http://translate.google.com/m/translate',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABs0lEQVQ4jY2SP4viQBiHX0UQWz/AXb+VX8Iu/YqFhdhcd5BKEOTKC9jJFYrFgo3FIjYiCRauhTCQDMp4bJFklzCuLJLOWNj8rpDMJt7u7Q08xQzze953/hAR0el4QJLw8KR4fXkE/Wtch01zjP6gmxLsd9uPJafjAf1BF82WjmZLR61eRa1eVfNmS4cMxP8JksGk6FPB6XjAii1Qq1fBBYMMBL79+InvDIrbB0CzIpSmQHF0RnF0vkiTFxZX7A+6MOzwU0FxdEZKYJpj1fp1eO5KzF0JzYreF/iekzr77QMUhh2q1zDsUIULPQl6fXkEFww53cWKLWCaY3DBVMuaFWHuSsT7fM/5W5DTXYUMBGQgUJoCpelFst9tcc84DDuE7znQrAiFnrwIkuGY/W6rBIYdQgYC7RmHZkXwPQf3jL8JiCglISLKVCaqzfhZfc9RcMFwc/eMfGd9EWQbS+R0F9nGEtnGEpnKBJnKJFWxPNygPNygPePggqE942nBdTjG9xyUhxvVcqEnsWILrNjiTfCRJN9ZI99Zp8LxWsy73ztTmYCI6ObuGV/7Tym+/PqtICL6A7F/dNYyWabFAAAAAElFTkSuQmCC'
					},
					{
						name: '有道词典',
						url: 'http://dict.youdao.com/m',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAyklEQVQ4jc1QsQ3CMBB0R5seJJ/F2wPQpUtHSwN1RoiYgA0YgVEYIQNQuEFCiS1lhNDg5IE4gQpO+ub0d39/QvwVaujcK9N6ZVoP3dwACCFErWjH+VGTblGZNhhYIOF8VHyd06K/ZOwU/wYnacWingJfSUoD76DPUYPnRSq6bhRte94c4gagNbtUOlBWSUqdpH2fbLn57IXIhGIHcRE043FDaTxVVDwECyTcoIbORwUO+uhA2WOKr6/H/nbQpQWSaQPo5lU4GfvnuAOO7rs1HAnRyQAAAABJRU5ErkJggg=='
					},
					{
						name: '海词词典',
						url: 'http://3g.dict.cn/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACQElEQVQ4jY3Tz2vTYBzH8SB487I+U8RdxUzqhky8qCBDcOrJk/gHTBCPipTRNjAtKgh9oNXhaQOZ0B1EkLRYS5kV3Nb1hzSt1k27NGvRNa2lTZMmLcrHw5aOWFED72Nez/N9kochHJ0hHEX6+BFLhKMgHIXNTX/Y3HTJ5vZy+6bu7Wd+fwhHcXN5DamTdkvOTAmuTBmuTAnXFjOYCIRxyPMYxO29bwEGp/04/HwVidNjllheAMsLsAezGI/mcSNRhCMl4sSTBRCOzvQB8XOnLJmA2TAv4PLbdTgz5W3E3MngtB8sL2D54jhYXsBoKIf1Z0+RqLdR7f7ESl3Dg/w3HAtlwfICzi9+giMlbo/j9A71AJYXMPYqh3fVFmSjC1nv7GZ0EZMVjO4gk/ENXFqIYICjHgvgW9tCRe+goBlWQO+gonfwMP8VLC/gbDSP67EcbBx9bwE+NFQUNAOzchuzchuBmo43Db0HJL8rO2NmcTu5AZvb2+gBR4MCSi0NQmsXMJuT28irBkRF7S12KyWCcLRl2UG80sAX1cBcVe+rqBqIVxpgeQEjoSwmY9n+Ee5kNlFWNKw0DczX9F6rioGyoqEYnYLkIzgT+YiJwOv+Q7QHswhJMkpNFZuqjoLWgaTqKDVVbOTDkPwHIPkIJB/582c0EVdaRFiq4HOtjmBxC46UiOTVvb2XJR9B48UFWH6k/yl5ZY8FkXwE/wSGeQH2l2mMzEdw8O6jPoQxr/Pfsrnp0gBHPcTpHWIYhjERhmGYX1cvojf/ywBHAAAAAElFTkSuQmCC'
					},
					{
						name: '在线字典',
						url: 'http://www.chazidian.com/m/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABJElEQVQ4jY2TMWrEMBBFdQYJuU23BsM2gbQBFSl0AEsEs+CzxClETpALpEwbttjGJ9hiwXLh1uf4W81EcpRNBgTfo9HTeDQjlnmCk7q4xrbP1joErEPIfGJsezipsbWPt5eiTo0BJfOqwjJPAAAnNevUorE54Hw6ZoCSzmN2ENFY3jifjlkNurpBNDbTFAcAl/0DRFc3DEhrkeptNgRwUkNQ4H8BTurfAV5V6OoGz4/3nHZXN3BSIxrL+ibgryIWAVQY+r9bOo1nwOvB/6j+Vqc+ryrWwqsdtrbME74+3/l7HUKxkZzUEJf9U+ZMe2Eb7O9UBnJSf/fBMk/cLOntqa1DgJOaZ4NrQJNXSrMEoUszAL01vXc0FusQ+BCNL+1FYzG2Pa51VtKhEx+TOgAAAABJRU5ErkJggg=='
					},
				]
			},
			{
                name: '实用站点',
                childs: [
                    {
                        name: '淘宝',
                        url: 'http://m.taobao.com',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAqUlEQVQ4jaWTsRGAIAxFs4Gj0DgGtTtQOIY7sAO1EzCOOxgLiCQRUfTf/TtE/zPBCAAAGAPiMvU5BgQRJjkj1zfe7JAguEw5tKfQPBYAX5NWn/YzpADmsQRWLyHcdP8C0IGa+H4TUGtFgy8AZ2Tp3RVwgH7b6wpaLfw6g8cWuGpnwStErHxG/aA2Vw4XQAxpLBtj2xxl+h82OwgQXd/5DGudpX0VOtMVPgBRELV9pv7F+wAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '卓越',
                        url: 'http://www.amazon.cn/gp/aw/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABdElEQVQ4jZWTP0vDQBTAD2z6BRw1H0Cnmt1Js4uYfAPr7pAPIKJQEJQGVyGLXVoLLoKtu3qDg0LiYoc0BQctqTo49OdwMfZfaH3wOO7de7/35+4EkAeOgJDZJUxi8gI4HD0NggDHcdiyLCzbxvO8LFBJAJ1Bi5SSOU0jN6KO40wCdATQHbQUd3bIaRrrponv++l+UdcnAbpjgCiKkFLSbDa5qNexbDutYiZAEAQUDGOshZkBvxkLhkEURZRd93+AX+f9gwMAtovF1BbH8XRAYWUlDVg3zaEbKbtuBuAzSi1SShZ0nZymsaDrlF2XLdtmzTTpvXXo+x7c7SpNAZfL8O5P6nFYbjZV4MMenIsBQLsBFQG3u9CLsgEfbXipqmTV+ZEZtGoKUhFwtaqyPB3D4zE8ncDNhsraqkG7oc4TwN9Tfr1XjhWhnM8F/WTlcgnCa+X3HStNnnJprNR3H57P/ioIG1lNlQTqO58CX9OnmMpXEpP/AWTQTUDpCM9IAAAAAElFTkSuQmCC'
                    },
                    {
                        name: '京东',
                        url: 'http://m.jd.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAy0lEQVQ4jc3TIQqEUBDGcS/hBcQDyB5gwWyxvmI1bdxL2IxbtlpeNngCwbBgEAxbVFgwiDaD8N/0BEVYXIsDX5wfzDCjpbrBkWjnA16XK4UrSHWDwhWLZKb1G2iCEIBUN1jX1A80QbgPUA257dDFCQCfx3M/oKKQv4HS8wHmPe0GClccA963OwC57WwDXZww9cMmkJkWY1UzVvVyB5lpUXo+bSQBaCM5A20kKVxBE4SMVQ1A6flLQM019QNtJOeDWVcXJ/PsJ/6FvfkCxwFl51kLjdoAAAAASUVORK5CYII='
                    },
                    {
                        name: '招行',
                        url: 'http://m.cmbchina.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACTUlEQVQ4jXWTT0gVcRDHB5LIEg+Gmes+386sae8Pvp2hCII6VkgRHqJrEYSdwkN4KsxjkHUwsfxzeEWKlP0x08qIeuH+Bg/do0uHzhEUYfXedtg/Pp81MOxvh/19ZuY7OwA19sTKshKPGuKPSrymxGvReXQp3S213yc2DHa9QbmjxGVDckORvypJoK4EivzdEF9V4oqPPHHbsrb/6/I7JQkMyZ+F1kzakNxUkkBJAuPw5Fzb3p0G5ae6EhiS0gZImDnMZkieAQBMWl1dilxRV4IFO3sAAEBR7iVQ8qYAAOBB2HM5Brxu7z6xDuZXivwhfn+cyh6qaquykMrvA0M8pm4UJPn8BqDuDMA2AICX6XyvT3yh2NKyI4Yo8lMlXlXiVUXvEoQKR+UjX15xCkdXkM8BAJwC2DLbnGswyDODAHUAAG/T3kGDPGSQh4zjXQR1eS3K/ut9ii1D8kiJV+OMM6lMXpErpXShFwBgsKmp0ZA3ZYjvG/TuglICmDNt3bYh+a3IlcVUbn8k8EhYnbxItHG8kz7JoHH4StKCwcKRcNbro5ttzjUYkm9KEihyeWZXhwsAULSo3Xd4wHe4LxSR5NMs5LYa5C8xQFF++A4PRNVFGsm1KjGvG5TzMB2Ocfl5U0fjSMue49V+q9U9tiHWiocTAPHyfDojMW3cd7jvv/95jZWcwlkfeSIJ9INdryhLy6nC6aLd2VO0O3uKu6NnjS/a+V5FmR8Gu34DtT9eJuRy0netI1cUeXzT5WqbtrJsiMdq19kQjz20MpvW+S83Pjf+jbC+HQAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '工行',
                        url: 'http://wap.icbc.com.cn/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACv0lEQVQ4jT3T2W9UBQCF8fvH+uKTGo1IQiQkGClCWEzEkkJLMbRTDCKCLQUkbCpaFqVQbGtbKnQb6Ny5M3dffj4UfTjJycl3Hr9ATVNR5g0NadJHIctCJEgURYQCNQ1R2KMmiytBkaPZSZHlNKUmj5GIu2vkXSTyfkhTinv9//k0KQVxXmkQxzFNTV2It9ZE/yz6cXzY5Llh28vPqTLqQtqL1HWtG/VVCLpprEKaxlS5zfk5S/fvKpcXWFuRLTzl5Qq9bWtzs2QxaqVGjiBXK5WKvG/h8W9mr095PnlJNnOfxXmWFqW//2rl5rSZyxdV3TYKpVJUp4JcKS56SDy8dsXSjSkPTw9ZP3/eysiI1dGz5keG3Tj8hfWfb8leLVNG0iqWygW9ItJIqft6c0/MTYy5/ule/fFveTzLnfu2z475/sOPRPdua1aXRBvLyKQSQSMTddZMt0ZJusKpq54ePurJnv2aMy3hsUEL+w968NkAjx6xuuTmhTFVHqpkAnWi6G65PPQ1ay+ZndMdHTPz3m6GW9b3HbI2cEzvmwlWVmWPHrh65hRVLM+7AnVBmbk+coqttoVTI376YJfFfQe5dI3hCfN7D3j2+WFu3WV9w52Jc6rtNk0myDvbFIVm9YX+zAN/DA5pvfOu3miLm79w6ZreaMvk+x9bOHvOi6vTvG4TRSR9gV5MUbLdNXFgQHj7njdXpjw+8qXOxHc2R8ctnDxtdmjYq8lpg7s+oRNRlIqwK1CStjvktc6zvwzu3mPz9h0W/6bTIQyZe+7h2LjWwCHWt8hr2euQiqDoFVT0Nl5T1IqNDfP37vrh5FcunjjuwvEjWkcP2XjyJ0lCUau6MXmjTkuBekeMOqveSlLafLFEk9D0ScOdnic0pX7Y9d9HQ6AhiYudAW/etN+qm8nLUD9pI9PIRVEIkiTT1FQl/wIdXqICy5BdnQAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '去哪儿',
                        url: 'http://m.qunar.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACHElEQVQ4jZXQz0sTYBzH8c9ETcvKRE1Xf0WHCDpIh44d8tCpS0FQES4aQ4JISiOTQm3qdAtxTrfQ+QubuZxmpi2bYZpjZkUHO1heLA1WCe8OY2q2BD/wgofn+3yfh+8jScofmCs8OPiB7cgfmCuUJBn7ZyIH/LNsJa8/knDf2D8TkdEXRm2TqCWEml+x/1EYo29dRvc0O7qmkSuEXKF/6pI7xPvlKPGoKUhO9xS7OyaRY5SU9tdsjFrGyemeIq8nRmmecY4PzeJf+AbAyeFZVPWE5NaXJEqOdwK5XpDrnSDXO4GyPUGSnM9RbWDtUGjxe8LmeNJdY6S7Rsn2BFGWc4Qs5wi7GodRee+WjfGsRFdR1WOynCMo0xEgLsM+gG51ImsfJ3x/z3468Jal6Or6X1iayXQE0J7aPjZTWTtHPM8AOOYdQ5YmZGniy4+faxe0Rj6j8g6UUdnDRil3u9hbHRtlanGJHKsPQ0UnKnHjjsxzqHmIlV+rVIy/Qzceop132tko9XYbuuYEwP9xgYKWQXTTjS7UAGCs7qFy8E1sDLMDpZW62cxQ4kJnKwEoaPQjUz2HG3w8/fQVFdnQFTtdkfnYBanXnSSi89WxV4rq2Ffmjq1PlcVqF++zHP2NLtWg5KsP+B+du4eK7cjSgM5UxPaK7eSVujhq60VmGzKYbcEkSz3bIXMdMlkxmG1BSZJM1rDhcg3bIZM1LEl/AEUzpfWySDZbAAAAAElFTkSuQmCC'
                    },
                    {
                        name: '阿里旺旺',
                        url: 'http://webwwtb.im.alisoft.com/wangwang',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAC5UlEQVQ4jS3S20+WBQCA8fev6T/ooq2tbvSqlTe1NTtMr6orm3NWOqutMkZOMXXJLPFUYWhODcWQRARFHRAHBcFPBOHj8J1eeN/v/H6/LuIfeC6e5wkkCdUya3mKsQLSmK1lZC0JzSlYEqFYr1MpUMpQT8TFqiAp1ShXqJWR6J1J657NWEVBTaQsJxKiDMk6lZAGjQaBCtVyoqEmwjS2/XDS8a4R10eXZbCSkEGI7HpaLreoWKqrNwgk1LHaYBEParz+6WFbdrdpuTRjz5FuB8/fc3Fo3kTMCiJUUKoRlCurYjxDZ4b3jg/Y0Z7SfCPnwgRjZfoWOfVg3f4rj7QOzBsvs4bVOCOoWVLA9QJvHhvx1pEJ39+nY4FrK1ydp2+Nf0L2dS7bdeWF0+OxHCJZQcOKOYkdnWkv7e23q589/Xx3v6J1MvHxqdt+fFDwV56tP095Zf+gLYd6jORDJXlBRcHjYs2rTTdt7+ONc2lfjbFvMNTyKPbal60+ab/n3BJbz07Z/EvK5kO9br/IytVCQQ23U5FNx/ptG2h4/2bazoc5346v+2Zo2Qen/rapqc3x5yVv/3rHyy23vHNmWPvgnAjBWsTdOT48P273E3aOFnwxsaJpuqB1oWxb+zXvnvzD4ZkFuwYe234j5aNLk3qe1mWKBFGFx3k+73qmeZYDaQ4ulhxdyOkoVbWHOWeW004vZzWPz/usb96OjhHTxf9zBhWk6xzoSWkejvyS5QI6qg03cbmc1VWPXQwrWqdWtdxPa+mZttDYAJTUhPj93jNNXU/9NMXVBt24i4caehsVV7MNB3tntPXPGnxRkd84Mwhra0oYnl1xontMU++i1hl+Wyy5nI8Mo+N52omhBXvP9rjQ968Y8caRQZRUVdWtl0ODT1PaRlcdHStrHY2dHI8035j09Z+DDt+adPrOiFR6DkVhrSpX33AQFgsIxSqGEjrXuDjH+SdcnqYzRV+emSqJAjLycSzGfxOrhL76bprHAAAAAElFTkSuQmCC'
                    },
                    {
                        name: 'Web QQ',
                        url: 'http://web.qq.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADbUlEQVQ4jZXRbUzUdQDA8V9vXBFubbmW5DhgCcXOvzfFoFswEGNscKTWxdN4Pm6CgxM4Qm4kpzs4QQjiwUQUPXlQQx0nD1083cFu0h3kCUhiZNmDtMrpepiNOfj2olrrpS++7z7vvkIIIVRarVdJdVPwk6TSar2EEEJEqvO9jdap2UOD1/k345AH8/AsDfYFGu0LmIfnMA55+J+xTs1GqvO9RWp5dXDRZTe6Sy50l1wUX3FjGpxBW3EMZVQcoeExpJVUYhqYpuTKf67osht1eXWw2KM3yjU9TrK7neR0OznY50aVWkBoWDzy4BAkeQhBgXKUu+Ix9LnI+cdqepzs0RvlIqbQKE8640DdYSfVMkFuzSkCN79GS8tJ3tMf5Ki5liOHTfi+5E/6+3Wkn5tE3WEn6YyDmEKjXETnGSRV2yhxJ0ZIOetgt6YY2aZX0GTnU1a8H9MhPWmpGcg2BRCbmE1G5yRxJ0ZQtY0SnWeQRLhGL0U324hqspF5boLSVwNRBvvxWf0GVu6E8djpx5c163j79Y0UyTaisYyzs8lGdLONcI1eEtuSdZJkthJWP4CmrZ9Gn+f4NOBZKiQfmpN8aE/cQPXW57HL1vHhi+vJajyP8oNBJLOVbck6SQQl6yRZZS876vpRqtKJiYjl2s4Qlnyf4tHLgpXNgl/k65nbn8mu8Fh2vLmX0PoBZJW9BCXrJKFIOaDYWmsloXUQf78tJCXl8EN8BN9teYFvp6dZ9lzntwcPuP/rI95JzMLXN5CEk6NINVYUKQcUQplbqohqtbG3fZi39pWhzixg/ngrD6vLWV1dZW1tjT9XHnPj9vdk6MpR5ZWx+9QYUS02lLmlChGdZ5DUFgcpXROUWl1caNdSVbGPW9/8yM8P/2D5/u/MLd2jqTKTi+1Z6K0uUromedfi+PtCgs4oFfS5KL46jXn4cwbr3uCe5Wku5gVQZzpC/eEKrPn+/NTxDP01ERwd9VDSP01hn4sEnVESaYYquWlsllrHTVqvLdI5Zqer6zid3afpdc7w8YSL8xcsnO1ooHNknI+mFjk2cZOq8TnSDFVyEalWezeMuD2nZ5bovnEH6/wiQwuLfPLFXUaXlhn7ahnbrbvYFm5zdX6Rntmv6ZhZomHU7YlUq72FEEJsV6m8coxV8idpu0rlJYQQfwHpwVM0aLClJwAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '大众点评网',
                        url: 'http://m.dianping.com/guangzhou',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB0UlEQVQ4jZ2Tv2sTYRjHn72SNTh00UHcOjh0chHE2cW/wS2LIuIcpEs6lGYooUohCiFZSipn44GBMxxF2kSxBKciRTghd5eX/Ljz7j4Ob3LX1EwZvrzwvu/383yf9+UREZFxKc8qkrk5rOSY1mRBmALtTfh0F8xsb34eVnIaMi7ls819raCaA+czRAMS1Sf++gLq68S9LcLzYgpLAZiZOdwX+HAfIh+iAYSXJKrP+N09UBZxb4vhti6YAQyB+jphf5fooqEBkAE8m9HxU1AWk85znKKAcS1BUM2RqD4A4fc94t4WRANi94zJyWsYdUFZuAcbDLeXtDCtCcmXJ7pq5BO7Z0QXDf7+OoJRl8SzmdgvcYqzNpcBpjUhPH6kk4SXaf+MuoT9XdyDDdTejSWPaF35PkNXUM3HJJ6dVkdZ4LfAa8KPArTX/k+QrXdAWSSenZndjzMdgntI8uf9YgKMmbl1U19UFiiL4LTA4O1tnJLg1zcJz4spZBFgagg/n+mofovh0UOcHWH4JmtvWhOC08I1gD0DmKLpXpPpt1c4O4LfuHI2V3uN+HclAwTVnIZ0b6XxhuYDbbaXK6jOZqFjlFeaxHEpT8co64nsGGVWkYjIP84s8tIoadwUAAAAAElFTkSuQmCC'
                    },
                    {
                        name: '写字板工具',
                        url: 'http://www.yushufang.me/writer/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADGElEQVQ4jX3T3U/TdxTHcS72N+wvWHa1y2XJWrI1e3CPdExNnKgsRpaWgo4nRRiKMwMGq0KrgAq0hBZLoXVQ2lja/sJWXRciYMC1hpbpGC1tZ+kXjahroO9dbP6cWbKTnMvzyjk5+RQU/FN1B3a8WF3y1mtVu1TF+to9ZXZDTZ1VX3HS1Kptv3T6i3MW/eG+wW915qGOyvbqXapXC/5dKzct9mR4hM24m62MD4T0v+2znkqrVAUvyMB61HkPIZEMjzA3ZfjPwFbGT9DZxsPVSRASsRkTFZ8WviwDiV8uJxASblMT9fvfI744zFbGRy7t5c+Ul/u/TaBTK5kebeHBiotM1EFlcaFKBsLBC8kZ91m+1nxCZXEh1jNHaCh9H2NDKaZWLf3faNCplehrPyPk0rOd8XNs79s6GbjpPx/LRB1MXDrO0ZJ3QUhcu9KOTq0k+vMASz/18eXuN5n3GeWzuur3tclAyNUxh5BYnO7h8M43QEg4e4+hUysZaNGAkGj8/ANCE9/JgLld2y0DnsGmGYREJubE2FhKPhug6eCHuPobMbVqQUjYjTWEgxdlYPjMkT4ZGDtXO4mQyGcDxOfMPEq4mRo6yWZ8kidrHv4IXyYbHSO5YCG/HgAhYTNU2WWgt/lQ39/v8hH2nSUW7Cbi7yRz20Z83kzsWg8iNkZ2aZRc+ioIiRFj9bQMtFbs7Hy6WmJ+kNuSgV+v9/JkzUMk0MXjhJsFTwexYDeP1zwgJPzDpxZkoFytqMlnA9y/c4X4/CDJhSFWZ008uPs9qVtWEBKrNwZYnR1gfckOQuJHZ1viGVCkLNuMu9n83cXGsoNc+irZpVGy0VFyaS/bGT9i2cHDlXFyaS8IiSlLc1oGdEWKHanICAiJ2fEWUres5NJeUosWrg9/xZ3QBSKBTjaWHcTnzGyv+5myND/b4JD69Zd+sLdsIyQ2lh3P5eBexEY+G+BRwsPG3XEyUQdLoX56ThycfC6RlWqluqt+n+V8Y6nd0HDApq8rsXVU7bl4WqPuPLr3nePlRcqycrViv+ZjxW7tR4pXns79BU+yjRD+z0CqAAAAAElFTkSuQmCC'
                    },
                ]
            },
            {
                name: '其他',
                childs: [
                    {
                        name: 'hao123',
                        url: 'http://m.hao123.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAvElEQVQ4jaWS0RHEIAhEKcZmrgDLsBnLsACaoZi9D4XZEE3m5phhNJh9kI2CTXQb+GiN9SklVCJo9vzyKwAADLOrYcRRrp0BK0PstQXhRgFoVi8Hx3VTmwD9F3CaIH3WySvpDgBgZBqbePGAxAsw0KzO/PEXApiADOk2u3Ub0LVXGwi/KALgEBcXsqSQBSU9ixLAxVnEwOTlBGgaNQt8r9QgQEzlKVyUO98mAACjKXrqkq/C7Vpk8s6Tp/gCvDQkV4O+/+MAAAAASUVORK5CYII='
                    },
                    {
                        name: '天气预报',
                        url: 'http://wap.weather.com.cn/wap/weather/101280101.shtml',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACnElEQVQ4jXWT2UtUcRTH/Rdui8k1HaV1Kltsg3opeigKhIJKITXKoiSISCN7EMJosbQFLNJSsawMizYlkR7vuIyWWS7TqDmLM3d0Jkidae4s99PD4LVp6sAPfpzlwzlfzonjD/N9MzN89jzGVRswxOswzF2IUb+O/swc5NrHhH0+/ra4mY/9zl2GC4qw367AcukaoxcvY71cirW0HNuNW9iu32Tg0BHs5XdQg6FogPNhLZIgYr9dwcTL17jqG5DrngDgedeM414Vzgc1DJ05hySIDB4+DqoaAYR+TtKuW4YkiNrrTt+Cp7kFgB/vW+lO3xIVlwSR8WeNEcDEi1dRgf4D2YS9Xqa6PmLOP42nuYWQ10vf3syovC979kUA1is3NGdHqp6Ax8NUTy9+i422hFQcldWooRCBCTcdqXottz15aQRgKbmiOa1Xy5j+0kd74mLCfj8DWbn4TGas18pQxhzYSm9quYZ4HagqcY7Kas3pt1gZLS5BEkQU2cXQ6UIUp4zp6Em+F5egyC4M85KQBBGjPj3SwaSxG0kQ6VySBsDnHbsjAKeM6Vg+3gETw4UX6FqzGYCebTs1rQDi1HAY48r1dC5Jw9s3gGF+Mm0LUlADQXp3ZuB+24Rc8whJEJls76Q/KxdJEBmruD+7B8MFRTEKh/0KbeIiRoqK8VtsSHMSMcTrkASRtoRUFKc8C5ju6Y0CuJ4+50frh8isK9JRg0H6D2Zr8ZGi4thVHszJQxJEulZvQg0GMR05oRXIj57iMw9hiNfRkaIn4HbHAgLj43SlbcRxrwq/za61OyOwIrsYzMljvKHx38cE8GtkFPOpM3zevitmdT9t3YH7TdP/r3HGwoqCs7qOrxn76Vi0EsO8JIzL1+KqfxZTDPAbErj2EvvFq1YAAAAASUVORK5CYII='
                    },
                    {
                        name: '百度地图',
                        url: 'http://wapmap.baidu.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABPUlEQVQ4jZ2TvaqDMBiGvYhchOBtOOUGDmRy7JgrOEjnDt5Bhy7ByUkKhjN4FrN3UIRO1l0QXYT3DIcvGG2hdHhJyM+T50vUC6ICn4ZxBS+ICozz8lF8kT0HXK53MK5wud4xzgvyqoeIS7Td9B6A9HyRoe0mMK7AuIKIS2ddKLULMPVgJwiQV70FHE7mtcHhZMC4Qig1TD1AxCVMPaDtJoi4tCXkVe+YWgCdwriyG7elkVko9d5grT3OC5K0gS8yMK6QpI1zF4yrvQHpmXpAkjbOYoKIuLR30XbTPyCUGm032dBd0ClbCJVnAUFU7DaTEdXOuLIlHM+31wA6ifrr8fV8XvUugLToAzL18DTbV3IMTD1A/TwQSo2v71/bUp9e6Hi+WaBjQCHYOwmiAh7javebhlI7rS8y267DuMIfGyH1Cj0fcYcAAAAASUVORK5CYII='
                    },
                    {
                        name: '快递查询',
                        url: 'http://wap.kuaidi100.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADEElEQVQ4jY3T329TBRjG8f4PxJtKXDS7wYiJLpksyNZmg2SJJO5icVwskhBJjMluqAkabnCpRiNIswapE5jDIVtWkbVbkOKcGxAkQoF2/d216zln7VnLbNf2nPbstF8vjkIWbrx4rt73/eTNm7ymN0ajDM7LHH9U5stkjdFck4t5tsVXbOIrNvlF3uJ8SmHAJ7NnIgWagMk6nWHw9wI2f5m61sCVrD6HjOaaeAo67pzG+ZTCu3NrWKYy2JeSmLrdGQbnZQqbCiVVxx5Tcaxu4RR1zko6TlHndFrjVELlR6GGK1nlk782sExl6LgUNzY4tihQUnWCQp6ToSpfxGt8vVJ/GntMxeYvM5ZWccYqfPaw+AzYN7nKpqKhaA0+uvs3Nn+Zq8EUJVXnRKDCyVCVE4EKQ/eKOGMVvlre5NP7Rfb+lDaAPRNG88xjkff/eEJda1BSdf5MZrH5y9j8ZQLrFQ7dlKlrDZTaFkpti7bxFdrH4phaXVFKqs6BqyL9N3IoWgNNb3L09gZHb29weEEmKOQJCnkUrcHxu+soWoO3L4Z5/fsoppccQUqqzv6fRd7xSDSbUFJ11sp1qnWdkqrznjvCsUUBRWug/LthqyvKrnNhTC3f+FG1Jh2X01imMvRek8gWq5RUncT6Jj0/3MdyJcXH954wdKfAkDdAqyvKzpGwAbw5EUHTm+y+kKBtfIWOy2n2Ta5inc5gnc7QPhZn6E6BD2/lObKYp9udocUZwewIGUCXRySwXmH3hQQtZx6z61yYV7+L0T4WZ3Be5shinsMLModuyvTfyNE7J7Fj+MEzwOKV+PaRjMUr0TMrcfD6Gn2+LAM+Y2jAJ9Pny3Lw+ho9sxIWr0SXR8R8ZtkAOmdEPvg1gcUrbYt11gCtsxKvjSefq3d5RF4ZWcZkdoTYMfyAtispOmfEpw1vudO8fDbCi6cCmB0hXvj84ba6xSsx/FsE086RMGZH6H/nP6RzRjS+EU3AvpRk72SCbneG3jmJPl+W/gWZgVsy/QvGDXrnJPZfW6XjUhz7UhI0ATSBfwCpexjs7guJ/AAAAABJRU5ErkJggg=='
                    },
                    {
                        name: '手机查询',
                        url: 'http://m.showji.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABrUlEQVQ4jZXTTUtiURzH8bMLptfROphl0DaCmHbNzCKQckLINAe7PYxoNkaFTVher5SjDcO8hrBy8vH25DVpUb2BIFISJMntt4URc3GOwxz4wW9x/p8DfzhC/McZ/TTFPy8FIwm+qd9RtRiRaCuqFiMU3eWjxdYZCIRipPVznCcgwiAiLwnD51PI6EWWN+NyxBfUeGo0caab/KpgiivT5KnRxBfU5IBnJUyjXkdswO4tDB9BVwKECmILGvU6npWwHJgPhHisPSC24EMO3iRAbIPYaSGPtQfmAyE5oPjXqVUrCBW6f/wxvNPaRa1aQfGvywG3b43q3T1CAxEHkXhJHIQG1bt73L61DoB3lczZJaJn8685Oinj9q7KAdfCMoeFEgDJ7DHZU+O1pwpFABxzX+WAY3aJ38dl9tJnvHs/xkHeMPVkzmBK8cuBSbeXlH4BwEb0J/t5o63bXB45YHN9IaWX2cu0Xj0slEw9mS0yMb0gByYcc687cM4ucpBv7+OTM3LAalfQL27IFa+w2mcolK7N3bjCalc6f6ihEQu9fQO87R+kt2/A1IdGLG3Dz5JMobuivqr3AAAAAElFTkSuQmCC'
                    },
                    {
                        name: '火车票查询',
                        url: 'http://t.qunar.com',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACHElEQVQ4jZXQz0sTYBzH8c9ETcvKRE1Xf0WHCDpIh44d8tCpS0FQES4aQ4JISiOTQm3qdAtxTrfQ+QubuZxmpi2bYZpjZkUHO1heLA1WCe8OY2q2BD/wgofn+3yfh+8jScofmCs8OPiB7cgfmCuUJBn7ZyIH/LNsJa8/knDf2D8TkdEXRm2TqCWEml+x/1EYo29dRvc0O7qmkSuEXKF/6pI7xPvlKPGoKUhO9xS7OyaRY5SU9tdsjFrGyemeIq8nRmmecY4PzeJf+AbAyeFZVPWE5NaXJEqOdwK5XpDrnSDXO4GyPUGSnM9RbWDtUGjxe8LmeNJdY6S7Rsn2BFGWc4Qs5wi7GodRee+WjfGsRFdR1WOynCMo0xEgLsM+gG51ImsfJ3x/z3468Jal6Or6X1iayXQE0J7aPjZTWTtHPM8AOOYdQ5YmZGniy4+faxe0Rj6j8g6UUdnDRil3u9hbHRtlanGJHKsPQ0UnKnHjjsxzqHmIlV+rVIy/Qzceop132tko9XYbuuYEwP9xgYKWQXTTjS7UAGCs7qFy8E1sDLMDpZW62cxQ4kJnKwEoaPQjUz2HG3w8/fQVFdnQFTtdkfnYBanXnSSi89WxV4rq2Ffmjq1PlcVqF++zHP2NLtWg5KsP+B+du4eK7cjSgM5UxPaK7eSVujhq60VmGzKYbcEkSz3bIXMdMlkxmG1BSZJM1rDhcg3bIZM1LEl/AEUzpfWySDZbAAAAAElFTkSuQmCC'
                    },
                    {
                        name: 'Wolfram|Alpha',
                        url: 'http://m.wolframalpha.com/',
                        favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAByUlEQVQ4jZ2SP28TQRDFx0jIiRNsbmccHPtu506JcEMFUkCRUDqqFCkoKPINEEViCUhHgVLyGVKmQkIgN9R0hjZEPt/OmT8miSLkNJHiyJvC9iXCnIV40uvmNzNvdgEm6OvM3PobgOlJNYksQKYzXVr6NgSaANkYvZ8d8ldGNUJ8tzk7W0xtIg6/Fqf8KXRuPYkweCrE1pBfD9Ffi8nfFdLhlxyVUxvsF72HMflWiNNc/yv4CuBaU6l8pCqPBXU/rUFE+kNEQbVd8Bb2bpZ8AACIC9qJUO8I6mNBfS7Ett/9PWYhtoK6L6h7UZGPDmbm1y+vTUFVUL8fTTreeD7w5suBa1uXm6B7so/e2vgBp6YCUX53Qn4rxDZWencM7uRLS4b051FRagRiK8rttUivJvBhtrho0HtniH8J6l4SYfPFwLWtPyLoc4P6hyheTl4AADINKOciFTwyyGdp6xvieuh4d76ryoMw7y6ORQnnFpYFh1OITxMQuSvEtqW8t6mfCACgXahsG+K6Qfd+jO6zIbzXulG53Xa8bUO60QTIpvGZMDd/rwFwHQCgAeWcIe60yd8YFRhyVz4CFCZucVURBbWTLFX/GfgfXQA2JSG687sO8AAAAABJRU5ErkJggg=='
                    },
                ]
            },
		],

		makeButton: function (sitelist, parent) {
			var i,
				len = sitelist.length,
				item,
				btn,
				menu,
				menupopup,
				menuitem,
				frag = document.createDocumentFragment();
				insertpoint = document.querySelector('#sidebar-header .tabs-closebutton');
			for (i = 0; i < len; i++) {
				item = sitelist[i];
				if (item.childs) {
					if (!parent) {
						btn = frag.appendChild(document.createElement('toolbarbutton'));
						btn.setAttribute('tooltiptext', item.name);
						btn.setAttribute('type', 'menu');
						btn.setAttribute('style', getIconStyle(item));
						menupopup = btn.appendChild(document.createElement('menupopup'));
						SidebarMod.makeButton(item.childs, menupopup);
					} else {
						if (item === 'sep') {
							parent.appendChild(document.createElement('menuseparator'));
						} else {
							menu = parent.appendChild(document.createElement('menu'));
							menu.setAttribute('label', item.name);
							menu.setAttribute('class', 'menu-iconic');
							menu.setAttribute('style', getIconStyle(item));
							menupopup = menu.appendChild(document.createElement('menupopup'));
							SidebarMod.makeButton(item.childs, menupopup);
						}
					}
				} else if (parent) {
					if (item === 'sep') {
						parent.appendChild(document.createElement('menuseparator'));
					} else {
						menuitem = parent.appendChild(document.createElement('menuitem'));
						menuitem.setAttribute('label', item.name);
						menuitem.setAttribute('tooltiptext', item.name);
						menuitem.setAttribute('url', item.url);
						menuitem.setAttribute('class', 'menuitem-iconic');
						// menuitem.setAttribute('src', item.favicon);
                        menuitem.setAttribute('style', getIconStyle(item));
						menuitem.setAttribute('oncommand', 'openWebPanel(this.getAttribute("tooltiptext"), this.getAttribute("url"))');
                        menuitem.setAttribute('onclick', 'SidebarMod.itemClicked(event, this.getAttribute("url"));');
					}
				} else {
					btn = frag.appendChild(document.createElement('toolbarbutton'));
					btn.setAttribute('tooltiptext', item.name);
					btn.setAttribute('style', getIconStyle(item));
					btn.setAttribute('url', item.url);
					btn.setAttribute('onclick', 'openWebPanel(this.getAttribute("tooltiptext"), this.getAttribute("url"))');
				}
			}
			insertpoint.parentNode.insertBefore(frag, insertpoint);

            function getIconStyle(item){
                if(item.style){
                    return item.style;
                }else{
                    // 如果不存在则取第一个子条目的 favicon
                    if(!item.favicon){
                        return item.childs && getIconStyle(item.childs[0]);
                    }
                    return 'list-style-image: url("' + item.favicon + '")';
                }
            }
		},
		makeSplitter: function () {
			var sidebarBox = document.getElementById('sidebar-box'),
				splitter = sidebarBox.parentNode.insertBefore(document.createElement('splitter'), sidebarBox),
				sidebarBoxArrow;
			splitter.setAttribute('id', 'sidebar-box-splitter');
			splitter.setAttribute('onclick', 'toggleSidebar();');
			sidebarBoxArrow = splitter.appendChild(document.createElement('div'));
			sidebarBoxArrow.id = 'sidebar-box-arrow';
			sidebarBoxArrow.className = sidebarBox.hidden ? 'right' : '';
			//sidebarBoxArrow.className = sidebarBox.collapsed ? 'right' : '';
		},
		toggleSidebar: function (commandID, forceOpen) {
			var sidebarBox = document.getElementById("sidebar-box"),
				sidebar = document.getElementById("sidebar"),
				sidebarTitle = document.getElementById("sidebar-title"),
				sidebarSplitter = document.getElementById("sidebar-splitter"),
				sidebarBoxArrow = document.getElementById('sidebar-box-arrow'),
				lastcommand = commandID || sidebarBox.getAttribute('sidebarcommand') || sidebarBox.getAttribute('sidebarlastcommand') || 'viewBookmarksSidebar';

			//if (!commandID && sidebarBox.collapsed) {
			if (!commandID && sidebarBox.hidden) {
				if (sidebarBox.getAttribute('sidebarcommand') === '') {
					toggleSidebar(lastcommand, true);
					sidebarBox.setAttribute('sidebarlastcommand', lastcommand);
				} else {
					sidebarBox.hidden = false;
					sidebarSplitter.hidden = false;
					//setToolbarVisibility(sidebarSplitter, true);
					//setToolbarVisibility(sidebarBox, true);
					if (sidebarBoxArrow) sidebarBoxArrow.className = '';
				}
				return;
			}

			if (!commandID) commandID = sidebarBox.getAttribute("sidebarcommand");
			let sidebarBroadcaster = document.getElementById(commandID);

			if (sidebarBroadcaster.getAttribute("checked") == "true") {
				if (!forceOpen) {
					if (sidebarBox.getAttribute('sidebarcommand') !== 'viewWebPanelsSidebar') {
						sidebar.setAttribute("src", "about:blank");
						sidebar.docShell.createAboutBlankContentViewer(null);
						sidebarBox.setAttribute("sidebarcommand", "");
						sidebarTitle.value = "";
						sidebarBox.setAttribute('sidebarlastcommand', lastcommand);
					}
					sidebarBox.setAttribute("sidebarcommand", "");
					sidebarBox.setAttribute('sidebarlastcommand', lastcommand);
					sidebarBroadcaster.removeAttribute("checked");
					sidebarBox.hidden = true;
					sidebarSplitter.hidden = true;
					//setToolbarVisibility(sidebarSplitter, false);
					//setToolbarVisibility(sidebarBox, false);
					if (sidebarBoxArrow)sidebarBoxArrow.className = 'right';
					gBrowser.selectedBrowser.focus();
				} else {
					fireSidebarFocusedEvent();
				}
				return;
			}

			var broadcasters = document.getElementsByAttribute("group", "sidebar");
			for (let broadcaster of broadcasters) {
				if (broadcaster.localName != "broadcaster") continue;

				if (broadcaster != sidebarBroadcaster) broadcaster.removeAttribute("checked");
				else sidebarBroadcaster.setAttribute("checked", "true");
			}

			sidebarBox.hidden = false;
			sidebarSplitter.hidden = false;
			//setToolbarVisibility(sidebarSplitter, true);
			//setToolbarVisibility(sidebarBox, true);
			if (sidebarBoxArrow)sidebarBoxArrow.className = '';

			var url = sidebarBroadcaster.getAttribute("sidebarurl");
			var title = sidebarBroadcaster.getAttribute("sidebartitle");
			if (!title) title = sidebarBroadcaster.getAttribute("label");
			sidebar.setAttribute("src", url);
			sidebarBox.setAttribute("sidebarcommand", sidebarBroadcaster.id);
			if ( title &&  title !== '') sidebarTitle.value = title;
			sidebarBox.setAttribute("src", url);
			sidebarBox.setAttribute('sidebarlastcommand', lastcommand);

			if (sidebar.contentDocument.location.href != url) sidebar.addEventListener("load", sidebarOnLoad, true);
			else
			fireSidebarFocusedEvent();
		},
		modifySidebarClickBehaviour: function () {
			var sidebar = document.getElementById('sidebar');
			sidebar.addEventListener('DOMContentLoaded', function(){
				if (sidebar.contentDocument){
					sidebar.removeEventListener('DOMContentLoaded', arguments.callee, false);
					var wpb = sidebar.contentDocument.getElementById('web-panels-browser');
					if (wpb) {
						wpb.onclick = null;
					}
				}
			}, false);

			eval("window.asyncOpenWebPanel = " + window.asyncOpenWebPanel.toString().slice(0, -1) +
				'var wpb = sidebar.contentDocument.getElementById("web-panels-browser");' +
				'if (wpb) wpb.onclick = null;' + '}'
			);

			eval("window.openWebPanel = " + window.openWebPanel.toString().slice(0, -1) +
				'var wpb = sidebar.contentDocument.getElementById("web-panels-browser");' +
				'if (wpb) wpb.onclick = null;' + '}'
			);
		},
        itemClicked: function(e, url){
            if(e.button == 1){
                gBrowser.selectedTab = gBrowser.addTab(url);
            }
        },
        addEventListener: function(){
            var sidebarTitle = document.getElementById('sidebar-title');
            sidebarTitle.addEventListener("click", function(e){
                if(e.button == 1){
                    openSidebarURL();
                }
            }, false);

            function openSidebarURL(){
                var sidebar = document.getElementById('sidebar');
                var webPanel = sidebar.contentDocument.getElementById("web-panels-browser");
                var url;
                if(webPanel){
                    url = webPanel.contentDocument.URL;
                }else{
                    url = sidebar.getAttribute("src");
                }
                if(!url) return;
                gBrowser.selectedTab = gBrowser.addTab(url);
            }
        },
		init: function () {
			window.toggleSidebar = this.toggleSidebar;
			this.makeButton(this.sitelist);
			if (this.operaLikeToggler) {
				this.makeSplitter();
			}
			this.modifySidebarClickBehaviour();
			var css = ('\
			@-moz-document url(chrome://browser/content/browser.xul){\
				#sidebar-box-splitter {\
					background-color: #E8ECF6!important;\
					border-style: none!important;\
					cursor: default!important;\
					min-width: 0!important;\
					opacity: 0.8;\
				}\
				\
				#sidebar-box-splitter:hover {\
					background-color: #BFC4D2!important;\
				}\
				\
				#sidebar-box-arrow {\
					margin-top: -20px;\
				}\
				\
				#sidebar-box-arrow[class="right"] {\
					width: 0;\
					height: 0;\
					border-top: 4px solid transparent;\
					border-bottom: 4px solid transparent;\
					border-left: 2px solid #4B5660;\
				}\
				\
				#sidebar-box-arrow:not(.right) {\
					width: 0;\
					height: 0;\
					border-top: 4px solid transparent;\
					border-bottom: 4px solid transparent;\
					border-right: 2px solid #4B5660;\
				}\
			}\
			');
			var sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
			var uri = makeURI('data:text/css;charset=UTF=8,' + encodeURIComponent(css));
			if (!sss.sheetRegistered(uri, sss.AGENT_SHEET)) {
				sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);
			}

            this.addEventListener();
		}
	};

	SidebarMod.init();
}

})();
