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
				name: '信息',
				childs: [
					{
						name: 'Wikipedia',
						url: 'http://zh.m.wikipedia.org/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABS0lEQVQ4jcWTwY3EIAxFR6MUETpwDaPcQwekBVICOUIRLiGUQBqYlAAdhB6I/h5GQZPdaLXSrrQHDljW8/e3fSt7wW/e7f8BYQlQg4LsJcISUPYCP3vIXsJMBjFFlL3ATAZqUIgpIqYIPWqoQb0UOOtARBVQ9gLZSxARYorIW4azDsyMshfkLUOPGsz8AsQUIVoBPWrkLaPsBcwM0Qr42WN9rtCjrvADcPJADQqiFVifKw7oocJZBz/7CghLqP/be1C0As66msjMaO4N1KBO1Z11td3TFGQvIXtZjYspont0kL2sOTFFmMlcj9FZh+beVHkH4N1gZq5mXu4BEUENCnnL8LOHHjW6R1dNc9ZVoy8Bzjp0jw5mMvCzr5KJCMx88ugS4GcPIgIR1VbCEmrsmNK3q/zZzLIX6FGDiH52C2EJXyrFFE+b+mfH9AGWL1wAegygIwAAAABJRU5ErkJggg=='
					},
					{
						name: '百度知道',
						url: 'http://wapiknow.baidu.com',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACoklEQVQ4jZ2T6UuUURSHzz9QRhCpJJVZERUFmVmp7bZYZiUttpiEVliEtCctJtGHPgQGEm1EUbQHUlCBWSI1NbagJfheX3XG1LSmhWL0NTtPH6ZmEulLF86XcznPPb/7O0eksAYprEEK3iKHqpED1Uj+a2TvK2TXC2SHG8lzIVufILkVyKZyJLsMySpF1t1HpLCG/z2ScQ+Rgre9LqzaTj1S0K7VVR0KYKxOtY2jvQAr7iBysLpH0nGUPTvaGBVTp5kZzWobh2mTGzVljldt4/QEpJcgsr8qmPj8qRuAXXltTB7fQE5mC26Xn7hx9cyd4cHt8vcEpN1GZN9rADyNXWxY26y5Oa1668ZXcjJbKC7yAVBc5KO4yIfb5cfr6QoBFt1EZPdLAK5d+sKQgZYmxjUogG0cOjtCsm3jsGrZO1YuadLWlh8BwPxriOysBOC5y09CbANLFzZxt+QbtnHYvKGFvC2t2Mbh2NGPTBpfT0ykwe3yK4DMvYLI9mcAdHfDjatftbjIp7ZxSE326ogoo2NibNYsf6e2cViW6iVtvlcb6gOOyKxLiGx7Gmyzo+MntnFIm+dlZJTR6HDDn1ixuElt4/D44XfltzKZfhGR3Iog4E1VJymzvYwYVMffxdHhhnHDbbIymrHrQlZK4nlENpUDoAqH89t18ACjQweaXoDBA4yOHWbzqPR78Gdl6jlEssuCgKMFHzS8r6WR/SwiwywN71OrEWEWUf0tHdTf0mERhssXvoQA8WcRySoNtuRp7GJLdivJSR7SU5o4cdzHieM+Zk1tJHZ0PRvXN9P2/kdIQtxpRNY9+Hu4FKgEnvwjKntM4sRTiKy+F1iK9BJkyW0k9Say4HrA49mXkZkXkaQLSMJ5ZMo5JP5M4OXYU8iEk/wC6ZkDX3ssK20AAAAASUVORK5CYII='
					},
					{
						name: 'sina微博',
						url: 'http://weibo.cn/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACbUlEQVQ4jb1SW0gUYRQ+TAsSZA+xL5Lu7R9nptBIzJJQKCFKicAHo4cowi5gkBCtbMXiPvQQbJnrziAVCUW91IN0ISiCTXYLglYSfIkC3ZnFWt3LjLZ5a/+vB1stCiGCDhwO/Od83/l+zkf0v0IPUlU2RCfTIWqNdNC6vyawVLpmqTRqaZS1VJrKqrT/j4N9RCUJJh3VPYo6zqTm4nuASMhq1JC5ShWWRt3TGs2memnLL+BxJ9utM3lM90jcEBUkmPSx2Bs6tLbCDNGwqZKZDVGDpdJjK0y3l8GGW243RGXREBUUU2fKqCFKxw1RfmBI0otkneOgeVnoslS6Z4WpY1qjESIiSrjlNoPJheLmVeq7SW/JvlyYOk2VLlgqvaLhMrfTEOVpQ1SQ3FqLrL8b+SdPMfc2jtloDNb1G/i0p3lJkagMfdixYT0R0UQPbTPD1EQJJt/UPRKfPHIM36bSPJfLQdM0HggEEI/HOQDwhQWeOdf1Q4k8Ne5kO1f+LirpiYZdKOTzSKVScLlcICIIggCbzYZYLAYAKMx8gbGpuqjk5YpBRGU+0+XjABAMBnljYyP6+/t5S0sLiIj7/X5wzjlfXESyumbpOh7p+U8E8qPPB1rBCwUMDAzA6/UiEonAZrNBEAREo1EAwMydu0vXYXJhzCXuXSZ4XV6+UffI7zPnL2LBtLjP50NlZSWvr6/H4OAgL+S/wupTuSFtRoLJ8wkmnfjNfQ/t9lKdyZeSNdtT6c6zMHt6YV7pQfr0GSRr6qCL8pwhyvdHKljVqn5vI1rzrMxRG3e4D8cd7NSw093+xsmabtntpasC/yW+A9uHY8MWzyGVAAAAAElFTkSuQmCC'
					},
					{
						name: 'Twitter',
						url: 'https://mobile.twitter.com/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABtElEQVQ4jc2SsUsbURzHf+DQRbxF19zSQSg0B67FbCVbF+f4HzR19wpdKqEaSofSg4AcBtNQQ6YmYBKFKgSOloRwxmDwLMlpQLn3Qi5Hohm+HRo1Vy/q2AdfePD9fb783pdH9F8cxphwnxfOVqKB9f3dxXRpvcq5eO1VORdJM7nkV/bKXiGMMcGv7JVJ0UHqCShWg/Ah3w5nK1H/l91SqtZaoPyJFaR4E+Knwm/N5NJowGrxeIniTdAWu1XyHKTomEqa9mL2KEEG6z6nLQZKtECRAkbXfFs0oy54ROFf9lcAs1QwrJdvSs63GzNWA73fhvhx2/BtHDTHBQB4SkREP886L0jR7w4lWn/lAUu5dv3mnQAmXRs8Qq81lnC1bfDevKw7qpC27McEGLw37wpo2faMlDw8oOT5g3BI62YAPHEFAJgAMBc77kdCWjczDpZy7fqFczXn+eM0k0tysbHm26yfjoN5bxAAMOEC5Z3Dd8LKd0aRAuhz+U7zQtqyZd1RPeHh+qLVHwRTjctlWXfUV/udHyGtm5F1R001Lpet/iAIQPSE/+lgejj4DMDs8D59L0hEfwC1m8lBvoNIXAAAAABJRU5ErkJggg=='
					}

				]
			},
			{
				name: '购物',
				childs: [
					{
						name: '淘宝网',
						url: 'http://m.taobao.com',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAqUlEQVQ4jaWTsRGAIAxFs4Gj0DgGtTtQOIY7sAO1EzCOOxgLiCQRUfTf/TtE/zPBCAAAGAPiMvU5BgQRJjkj1zfe7JAguEw5tKfQPBYAX5NWn/YzpADmsQRWLyHcdP8C0IGa+H4TUGtFgy8AZ2Tp3RVwgH7b6wpaLfw6g8cWuGpnwStErHxG/aA2Vw4XQAxpLBtj2xxl+h82OwgQXd/5DGudpX0VOtMVPgBRELV9pv7F+wAAAABJRU5ErkJggg=='
					},
					{
						name: '京东',
						url: 'http://m.jd.com/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAy0lEQVQ4jc3TIQqEUBDGcS/hBcQDyB5gwWyxvmI1bdxL2IxbtlpeNngCwbBgEAxbVFgwiDaD8N/0BEVYXIsDX5wfzDCjpbrBkWjnA16XK4UrSHWDwhWLZKb1G2iCEIBUN1jX1A80QbgPUA257dDFCQCfx3M/oKKQv4HS8wHmPe0GClccA963OwC57WwDXZww9cMmkJkWY1UzVvVyB5lpUXo+bSQBaCM5A20kKVxBE4SMVQ1A6flLQM019QNtJOeDWVcXJ/PsJ/6FvfkCxwFl51kLjdoAAAAASUVORK5CYII='
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
				name: '其他',
				childs: [
					{
						name: '豆瓣电台',
						url: 'http://douban.fm/partner/sidebar',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZElEQVQ4jWNgYGBgmF9h9p8czADTfGtn9f+fD1aQhG/trIYYMr/CjGTNMIxhwNntnUThUQPwGEBxLFDVgP8/3/3///////8/32HlEzbg////8yvMIHqw8GnvApLCgKLMRGl2BgAcEBr6B9RuCQAAAABJRU5ErkJggg=='
					},
					{
						name: '1g1g',
						url: 'http://www.1g1g.com/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABIElEQVQ4jc3OvU7CUACG4WNre/p36OodODh6Aw46G5GiYviRYrEQQUAEL8U7cCJxdfICTEycSExMnEhcSVxfN8VQtTEMfvObJ58Q/26IwMZpreN2CqjeENW/InNxT2bwin85/R1wmlPcFnhtUB1QPVDnY1T/EX9ACiAGuzFENreQ8erns8gn008B2PXECBH5qG4KwKp9D3hnKQB5lAy4jRXc058BRGBjlr5EyLCNVb/FiSc4zWQALeii74/QC88Yhx8RIvCQIVg1sCOwT+YBxIaHlgM9D/oeLB/MAj5mBWQVrBCs4yRg00fLgpYDLQA9PwuYGMUXjPIDZuUaWekmAGsmYnuC2BmzlB0hduejRQ+zfIOsPv0dMIpvGKW7hbx5B+TOnoWB2G7ZAAAAAElFTkSuQmCC'
					},
					{
						name: 'google阅读器',
						url: 'https://www.google.com/reader/i/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACFUlEQVQ4jX3Sz2vaYBwG8Ng4et+hSAvCGD0Vdlltoaf2st291UsPAw+1jDkG7joLjm77AwrubxgDd5EV2gjWzWiM0TQ2XbJU46+IQW0qhWQ8OwTj1LoXntv7fL68X16CmDrG0T6Mo33okQA6B350DvxQd3dQ2VpzMrwoY7o3UW4fH04g6u4O5OdPUdlaQ+nJI2S9nvmAZRq4G+q4G+oYpL5CjwRmAGZ1ZT4wKt/eaBj0G+g1RNTfvXQAZnUFWa8HisTMIvqnV2gU004G/QZ6ehVdTcbv1y+c6efLS6gp7BhZjJn4Nw/eqhPxRWlclfMobG8i6/VMAovv/8wtu8MiyBADMpiBL0qjfXyI8+WlKSBmwjINXLV7+PxTx+OPnXsBMphBUy07gCIx+CXSNjC9uA/fa3CHxRlAveZQ2N6cBSiWh6BI483rVVAsj4dvOKdMBjPgYhGw/mcOIFz8sIFRkWJ51Oqys/l40p6+sHcCMpjB6cY6TjfWwSW/oavJKHFpGxhN7elVFC95FC95aC0RWkuEL0pjYe8ErkAC7VYVtboMyzRwe6OBK6RAuMMiKJYHxfLoajK6mgyat4GmWkY8ycAVSMAVSMAyDQz6DVimAcs07CeQIcYpUux48pdUFk21DPWac4ASl0aJSyOfO0M+d2Z/IjLEQFAkCIoEmueRqwgQFAnxJOM8ZwTc+/8JgiBGF/6Xed2/El5+8KbNu3wAAAAASUVORK5CYII='
					},
					{
						name: 'webQQ',
						url: 'http://web.qq.com/',
						favicon: 'data:image/png;base64,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'
					},
					{
						name: '爱写字|愚书房',
						url: 'http://www.yushufang.me/writer/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAgElEQVQ4jWNgoBH4jwN/I1YjMh+XHEk2I2OiDCiB4v8MDAwBpLhgNQHbmxgYGDgYGBhYcdm+AIumjwwMDL+J8Qq6YB4OhTi9gS6By0aSDMAG3uIygGKgxMDAEI1kOwyrIrnmGi7N35AUwTS+gvKZ0OSwgv9oijbgUUcV8IhqhgEAh6BN+g0rrRoAAAAASUVORK5CYII='
					},
					{
						name: '股市迷你面板',
						url: 'http://stockapp.finance.qq.com/panel/index.php',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACuUlEQVQ4jX2TW0iTYRjHX6mrIOgiCLopuurghRVURBcVESWRN94oBNaoLFpkhiFlaiFmrqOYWti0YRSZYWWWZuS5PGC6qdPmPOSmc+ft2+cM/X5dzFaK9Ic/vPC+/x/Pw/M+QiySMqYCvQh7Q/l2zjRe4IG+gLapTha/X6DgiAYGowiM3GDSYsYyIRFbe5oN5duJqY4lreUaj3q1S0OUqRz4mYBs1WKzS7jcEj6vF51Bx9GaeLZV7uXk59OUGErJMxQthCiOh+DMZ86ajtM+il+a4V+ZHQbuduURUxtPUsNFKgZfozU+I9yz4noMtnSmLY8WBN9/t5L+1sjLThuzv4K0j7dxufUKmV8z0fbp6Hb2IuasEeDRoYypCNgbwmH1GyMrsj4hMmsQV99T3mUF4IdtkIxv18luy+aVqXIeMHUTxXwU2WsEoKrPwfI7TYjbDYh7TYiceuJe9ITh+vEeUptTyWzPmgeMxKGYDjAjDQNwvG4MkddBRGEnEYWdiPwONhZ3hQEBv0xxTzGq+rMI9AIGIlEGI0EewuSYZVWxgQhtH6Lkj/tZVtBNRb8TUAhKMzQONXLsy6l5gF7AwGZmvN3Y/LNk1I8hnpoQZSMh64ZJqDIz7A5NR5aCtJhaUbekhADB/iimzYnhEj+P+tlVaWH/ByuHaibYWWklv9cXvvc7vbwzfqSo/wlCaq5j8kkB424fLp+MLMt/5zg3Fz7+ck3g097HE70P3/lzqFtSSKpNDv0FWZPLZEYqkzYLiyW7HUjNdXjOqnCtWYtz5Wrs69aHyv9XAfUZXEf2YS/Jw179ElfVc9zau3guqPAc3INnRySe6N24dm9BunNr6X2QNbl4tm7Ce3gr/sQYAsnxBNJOIGmSCNxUI11KIFj+7P8bKYQQwYoy5Mcapgs1TBfdQy59SPDd6yWDvwFbc6OSqZLwaQAAAABJRU5ErkJggg=='
					},
					{
						name: 'hao123',
						url: 'http://m.hao123.com/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAvElEQVQ4jaWS0RHEIAhEKcZmrgDLsBnLsACaoZi9D4XZEE3m5phhNJh9kI2CTXQb+GiN9SklVCJo9vzyKwAADLOrYcRRrp0BK0PstQXhRgFoVi8Hx3VTmwD9F3CaIH3WySvpDgBgZBqbePGAxAsw0KzO/PEXApiADOk2u3Ub0LVXGwi/KALgEBcXsqSQBSU9ixLAxVnEwOTlBGgaNQt8r9QgQEzlKVyUO98mAACjKXrqkq/C7Vpk8s6Tp/gCvDQkV4O+/+MAAAAASUVORK5CYII='
					},
					{
						name: 'Wolfram|Alpha',
						url: 'http://m.wolframalpha.com/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAByUlEQVQ4jZ2SP28TQRDFx0jIiRNsbmccHPtu506JcEMFUkCRUDqqFCkoKPINEEViCUhHgVLyGVKmQkIgN9R0hjZEPt/OmT8miSLkNJHiyJvC9iXCnIV40uvmNzNvdgEm6OvM3PobgOlJNYksQKYzXVr6NgSaANkYvZ8d8ldGNUJ8tzk7W0xtIg6/Fqf8KXRuPYkweCrE1pBfD9Ffi8nfFdLhlxyVUxvsF72HMflWiNNc/yv4CuBaU6l8pCqPBXU/rUFE+kNEQbVd8Bb2bpZ8AACIC9qJUO8I6mNBfS7Ett/9PWYhtoK6L6h7UZGPDmbm1y+vTUFVUL8fTTreeD7w5suBa1uXm6B7so/e2vgBp6YCUX53Qn4rxDZWencM7uRLS4b051FRagRiK8rttUivJvBhtrho0HtniH8J6l4SYfPFwLWtPyLoc4P6hyheTl4AADINKOciFTwyyGdp6xvieuh4d76ryoMw7y6ORQnnFpYFh1OITxMQuSvEtqW8t6mfCACgXahsG+K6Qfd+jO6zIbzXulG53Xa8bUO60QTIpvGZMDd/rwFwHQCgAeWcIe60yd8YFRhyVz4CFCZucVURBbWTLFX/GfgfXQA2JSG687sO8AAAAABJRU5ErkJggg=='
					},
					{
						name: '快递查询',
						url: 'http://wap.kuaidi100.com/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADEElEQVQ4jY3T329TBRjG8f4PxJtKXDS7wYiJLpksyNZmg2SJJO5icVwskhBJjMluqAkabnCpRiNIswapE5jDIVtWkbVbkOKcGxAkQoF2/d216zln7VnLbNf2nPbstF8vjkIWbrx4rt73/eTNm7ymN0ajDM7LHH9U5stkjdFck4t5tsVXbOIrNvlF3uJ8SmHAJ7NnIgWagMk6nWHw9wI2f5m61sCVrD6HjOaaeAo67pzG+ZTCu3NrWKYy2JeSmLrdGQbnZQqbCiVVxx5Tcaxu4RR1zko6TlHndFrjVELlR6GGK1nlk782sExl6LgUNzY4tihQUnWCQp6ToSpfxGt8vVJ/GntMxeYvM5ZWccYqfPaw+AzYN7nKpqKhaA0+uvs3Nn+Zq8EUJVXnRKDCyVCVE4EKQ/eKOGMVvlre5NP7Rfb+lDaAPRNG88xjkff/eEJda1BSdf5MZrH5y9j8ZQLrFQ7dlKlrDZTaFkpti7bxFdrH4phaXVFKqs6BqyL9N3IoWgNNb3L09gZHb29weEEmKOQJCnkUrcHxu+soWoO3L4Z5/fsoppccQUqqzv6fRd7xSDSbUFJ11sp1qnWdkqrznjvCsUUBRWug/LthqyvKrnNhTC3f+FG1Jh2X01imMvRek8gWq5RUncT6Jj0/3MdyJcXH954wdKfAkDdAqyvKzpGwAbw5EUHTm+y+kKBtfIWOy2n2Ta5inc5gnc7QPhZn6E6BD2/lObKYp9udocUZwewIGUCXRySwXmH3hQQtZx6z61yYV7+L0T4WZ3Be5shinsMLModuyvTfyNE7J7Fj+MEzwOKV+PaRjMUr0TMrcfD6Gn2+LAM+Y2jAJ9Pny3Lw+ho9sxIWr0SXR8R8ZtkAOmdEPvg1gcUrbYt11gCtsxKvjSefq3d5RF4ZWcZkdoTYMfyAtispOmfEpw1vudO8fDbCi6cCmB0hXvj84ba6xSsx/FsE086RMGZH6H/nP6RzRjS+EU3AvpRk72SCbneG3jmJPl+W/gWZgVsy/QvGDXrnJPZfW6XjUhz7UhI0ATSBfwCpexjs7guJ/AAAAABJRU5ErkJggg=='
					},
					{
						name: '天气预报',
						url: 'http://wap.weather.com.cn/wap/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACnElEQVQ4jXWT2UtUcRTH/Rdui8k1HaV1Kltsg3opeigKhIJKITXKoiSISCN7EMJosbQFLNJSsawMizYlkR7vuIyWWS7TqDmLM3d0Jkidae4s99PD4LVp6sAPfpzlwzlfzonjD/N9MzN89jzGVRswxOswzF2IUb+O/swc5NrHhH0+/ra4mY/9zl2GC4qw367AcukaoxcvY71cirW0HNuNW9iu32Tg0BHs5XdQg6FogPNhLZIgYr9dwcTL17jqG5DrngDgedeM414Vzgc1DJ05hySIDB4+DqoaAYR+TtKuW4YkiNrrTt+Cp7kFgB/vW+lO3xIVlwSR8WeNEcDEi1dRgf4D2YS9Xqa6PmLOP42nuYWQ10vf3syovC979kUA1is3NGdHqp6Ax8NUTy9+i422hFQcldWooRCBCTcdqXottz15aQRgKbmiOa1Xy5j+0kd74mLCfj8DWbn4TGas18pQxhzYSm9quYZ4HagqcY7Kas3pt1gZLS5BEkQU2cXQ6UIUp4zp6Em+F5egyC4M85KQBBGjPj3SwaSxG0kQ6VySBsDnHbsjAKeM6Vg+3gETw4UX6FqzGYCebTs1rQDi1HAY48r1dC5Jw9s3gGF+Mm0LUlADQXp3ZuB+24Rc8whJEJls76Q/KxdJEBmruD+7B8MFRTEKh/0KbeIiRoqK8VtsSHMSMcTrkASRtoRUFKc8C5ju6Y0CuJ4+50frh8isK9JRg0H6D2Zr8ZGi4thVHszJQxJEulZvQg0GMR05oRXIj57iMw9hiNfRkaIn4HbHAgLj43SlbcRxrwq/za61OyOwIrsYzMljvKHx38cE8GtkFPOpM3zevitmdT9t3YH7TdP/r3HGwoqCs7qOrxn76Vi0EsO8JIzL1+KqfxZTDPAbErj2EvvFq1YAAAAASUVORK5CYII='
					},
					{
						name: '火车票查询',
						url: 'http://t.qunar.com',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACHElEQVQ4jZXQz0sTYBzH8c9ETcvKRE1Xf0WHCDpIh44d8tCpS0FQES4aQ4JISiOTQm3qdAtxTrfQ+QubuZxmpi2bYZpjZkUHO1heLA1WCe8OY2q2BD/wgofn+3yfh+8jScofmCs8OPiB7cgfmCuUJBn7ZyIH/LNsJa8/knDf2D8TkdEXRm2TqCWEml+x/1EYo29dRvc0O7qmkSuEXKF/6pI7xPvlKPGoKUhO9xS7OyaRY5SU9tdsjFrGyemeIq8nRmmecY4PzeJf+AbAyeFZVPWE5NaXJEqOdwK5XpDrnSDXO4GyPUGSnM9RbWDtUGjxe8LmeNJdY6S7Rsn2BFGWc4Qs5wi7GodRee+WjfGsRFdR1WOynCMo0xEgLsM+gG51ImsfJ3x/z3468Jal6Or6X1iayXQE0J7aPjZTWTtHPM8AOOYdQ5YmZGniy4+faxe0Rj6j8g6UUdnDRil3u9hbHRtlanGJHKsPQ0UnKnHjjsxzqHmIlV+rVIy/Qzceop132tko9XYbuuYEwP9xgYKWQXTTjS7UAGCs7qFy8E1sDLMDpZW62cxQ4kJnKwEoaPQjUz2HG3w8/fQVFdnQFTtdkfnYBanXnSSi89WxV4rq2Ffmjq1PlcVqF++zHP2NLtWg5KsP+B+du4eK7cjSgM5UxPaK7eSVujhq60VmGzKYbcEkSz3bIXMdMlkxmG1BSZJM1rDhcg3bIZM1LEl/AEUzpfWySDZbAAAAAElFTkSuQmCC'
					},
					{
						name: '百度地图',
						url: 'http://wapmap.baidu.com/',
						favicon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABPUlEQVQ4jZ2TvaqDMBiGvYhchOBtOOUGDmRy7JgrOEjnDt5Bhy7ByUkKhjN4FrN3UIRO1l0QXYT3DIcvGG2hdHhJyM+T50vUC6ICn4ZxBS+ICozz8lF8kT0HXK53MK5wud4xzgvyqoeIS7Td9B6A9HyRoe0mMK7AuIKIS2ddKLULMPVgJwiQV70FHE7mtcHhZMC4Qig1TD1AxCVMPaDtJoi4tCXkVe+YWgCdwriyG7elkVko9d5grT3OC5K0gS8yMK6QpI1zF4yrvQHpmXpAkjbOYoKIuLR30XbTPyCUGm032dBd0ClbCJVnAUFU7DaTEdXOuLIlHM+31wA6ifrr8fV8XvUugLToAzL18DTbV3IMTD1A/TwQSo2v71/bUp9e6Hi+WaBjQCHYOwmiAh7javebhlI7rS8y267DuMIfGyH1Cj0fcYcAAAAASUVORK5CYII='
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
            if(sidebarTitle){
                sidebarTitle.addEventListener("click", function(e){
                    if(e.button == 1){
                        var sidebar = document.getElementById('sidebar');
                        if (sidebar.contentDocument){
                            var url = sidebar.contentDocument.URL;
                            gBrowser.selectedTab = gBrowser.addTab(url);
                        }
                    }
                }, false);
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
					border-left: 4px solid #4B5660;\
				}\
				\
				#sidebar-box-arrow:not(.right) {\
					width: 0;\
					height: 0;\
					border-top: 4px solid transparent;\
					border-bottom: 4px solid transparent;\
					border-right: 4px solid #4B5660;\
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
