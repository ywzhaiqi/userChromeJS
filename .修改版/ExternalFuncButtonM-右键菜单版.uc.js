// ==UserScript==
// @name           externalFuncButtonM.uc.js
// @description    External functions button
// @include        main
// @author         lastdream2013
// @charset        UTF-8
// @version        20130616.0.13 minor fix
// @version        20130511.0.11 tidy and merge moveable code
// @version        20130507 0.1 first release
// ==/UserScript==

var gExternalFuncButtonM = {
	autohideEmptySubDirs: true,  //自动隐藏没有一个子项目的子目录菜单
	moveSubDirstoBottom: false,  //把主菜单下的子目录移动到最下面
	moveablePositonOrInsertafter: false, //true : ToolbarPalette moveable button  false: insert appbutton in "insertafter" 
	insertafter: 'alltabs-button',  // useless if moveablePositonOrInsertafter is true;  urlbar-icons addon-bar TabsToolbar alltabs-button
	toolbar :
	{
		//在这里定义好主菜单下子目录的名字,以及图标  可在中间加{name: 'separator'}建立一个目录与目录之间的分隔线
		subdirs : [
			{
				name : 'firefox常用功能',
				image : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAADq0lEQVQ4jZXUW0wTZhTA8UNCYuBhiQmZNUwiUfF+t1wLvUFbWwqFVi4tK0ipQItFXKGFQEEMZE6iomLIyB7MDNFJjGwMMYQsJpvZ1MzFyECzzG0uQZoo2abP/z2I6+t4+D98D+eXnIfziYjEpas0hTka3UKOVs+K0ugW0lWaQhGJExGJz1RrFk4MXODyzVtcGZ9idOI21yanGZua4cZyY1MzXJucZnTiNlfGp7h88xYnBi6QqdYsiEi8iMiqjFw1JwdHaAh24gtFCHT00tTeQ1O4m0BH79t3uJum9h4CHb34QhEagp2cHBwhI1eNiKwSEUlQZqsI95/FE2jF2xLG09zKwKVPefholqWlv3j5aokHPz2if3AIT3Mr3pYQnkAr4f6zKLNViEiCiEji/swsjkf6cDcGcHr9XL1xk79fv2H+6S+MjU8wNj7B7Nw8/7x+w/Xxr3B6/bgbAxyP9LE/MwsRSRQRSdyjzMAX6sLhrqPn1AAvXy3x+dXr2JzVlLoOU+o6jK2ymv6BcywuRjl9fgiH24Mv1MUeZUYM2rXvAJ5AEIujkjvffsfdH+5jcVRg/7CW0qpayqq9OD2NlLk9lLpqKHQ4KXHW4AkE2bXvQAzavnsvrvqj5FtLmJ2b59LIZxhLyiitOoy1vIrf/njO78//5PzwCHX+ZqrqGjDby3HVH2X77r0xaMuOnRyqrkNtNHPv/gMuDo9QUFiCtcyFocjO3e/v4azxojcXk2+x0fvxabQmK4eq69iyY2cMStu6DVulm2ydgdGrXzB5exqN0YKp5BDag1YCwTZyDSbURgttnREePX5Mjt6IrdJN2tZtMWhD2mYsjkqyNHpq6/3c//EhrR1dqI0WtAetVB9p4JMzg8x8c4e5J08ZGh4hI0+HxVHJhrTNMSh14yZMNgc5OgPKHDXdvX38/OQJp86co7i8AlW+kSxtARl5OpTZeW9TaTDZHKRu3BSD1q1PxWyvQJVvIkdvRJmrobbex5dfT/Lrs2csRqOxFqO8WIySnqfDbK9g3frUGJSckkJZjRdDUSnGYjumYgd6czFaUyFakxWtyYrGWEiewUxugYm8AhNqo5myGi/JKSn/QQmK5OTFonIXR1pCNATb8bV14QtF8IciNIW78YcjNLZ2cuSjdrzHQtQ1B/Eea6Oo3IUiOTn67kRWrU5Kcq1RKKJr1q5lJb2vULxYnZTkene08SLynogoROSDFaZYno2X5U8pfllNWN73/5SwPBMvInH/AlIIOOfCXNavAAAAAElFTkSuQmCC"
			},
			{
				name : 'about',
				image : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAADe0lEQVQ4jZXUb0gUZhzA8Z8giAYKvQiLRWh2eDPNhKvAU8/TS+/yTwqJVJL4h5XKUMQdp3TzTwQqipDhG9EIK2aOxpxjbKDeeaemnt5dFiuRrcI7PXVbo6L25rsXnrs3vZgvPvA8DzxfeF78HhGRoOOVAzknqu56E6uH2IsTVXe9xysHckQkSEQkOOHqoLdsyIlpwkPjpIfrFi9m6zottnVa7Ru02jdosa1jtq5z3eKlcdKDacJD2ZCThKuDXhEJFhEJia/op/jBKrp2J1mdLvTdbs71PCHn1jK5vU/J7X1Kzq1lzvU8Qd/tJqvTha7dSfGDVeIr+hGREBGR0LjSPgruPCejzYHu5iJZ7U6yO50YulwYut07ulxkdzrJaneiu7lIRpuDgjvPiSvtQ0RCRUTClBd7yOt9RlrjHFrzPJktDnRtDjJbF9A2z6NtnifdPIfm+mMymx1ozfOkNc6R1/sM5cUeRCRMRCRMcaEDfYcbdf00acZZUr6aQd0wTfbXs4w+9rL15iO/b7yj69sVkuttpBlnUddPo+9wo7jQEQjFnL9BZssSZ2qsqKrG+aJnkb7RVSyuDXx/fcSz/QHPHx/Y+vsfmvrdnKqe4EyNlcyWJWLO3wiEog1mNCYHqsoJTpX/zMuN97zefM9v6+9YWXvLytpbXvj9YH9NUulPqCon0JgcRBvMgdARnZHkujnii8eo6ZhhaeVPll74rbzZ4d/P/7pNWaud+OIxkuvmOKIzBkKH02o5fW0GZf4jZlyb2J2b2N1bnzTt2mLa5UOZ/4jT12Y4nFYbCB1KrkJVbkOhv8+o5SWTCz4mHTssfrv7yQUfY9ZXKPT3UZXbOJRcFQhFqipIKpki5uw9Cqu/40frK+aWtz/pl5k1ir78npiz90gqmSJSVREIHUgsIfGyBYXhIUczBonW9BGl6SU6/TbRWr/02ztnmj6OagdQGB6SeNnCgcSSQGh/XBEnr4yjzB0hNneE2LxhlPnDfF7wDXGFw8QV7qyV+cPE5g0TmzuCMneEk1fG2R9X9F8oNOJY/kZC8SDqWgvqOgspDVZSjVNoTDa0TXa0TXY0JhupxilSGqyo6yyoay0kFA8ScSzPtzsiIfsOpl4Kj9b7IqIM7EV4lGF938HUS7tDGywi4SISKSKf7VGk/26w+D+lYH811P/e/yPUfydYRIL+BSkIj6JbQMVJAAAAAElFTkSuQmCC"
			},
		],

		//   在这里定义firefox的功能按钮, command就是一小段程序, 可以从firefox api, 小书签或鼠标手势中摘取;可选自定义图标;
		//    同样, 建议先写完上面想要定义, 分类在子目录下的程序,  之后从中摘出你最常用的, 去掉后面的subdir定义, 放在最下面
		configs : [
			{
				name : 'separator'
			},
			{
				name : 'about:firefox',
				subdir : 'about',
				command : "openAboutDialog();",
			},
			{
				name : 'about:about',
				subdir : 'about',
				command : "getBrowser().selectedTab = getBrowser().addTab ('about:about')",
			},
			{
				name : 'about:addons',
				subdir : 'about',
				command : "getBrowser().selectedTab = getBrowser().addTab ('about:addons')",
			},
			{
				name : 'about:cache',
				subdir : 'about',
				command : "getBrowser().selectedTab = getBrowser().addTab ('about:cache')",
			},
			{
				name : 'about:config',
				subdir : 'about',
				command : "getBrowser().selectedTab = getBrowser().addTab ('about:config')",
			},
			{
				name : 'about:memory',
				subdir : 'about',
				command : "getBrowser().selectedTab = getBrowser().addTab ('about:memory')",
			},
			{
				name : 'about:mozilla',
				subdir : 'about',
				command : "getBrowser().selectedTab = getBrowser().addTab ('about:mozilla')",
			},
			{
				name : 'about:plugins',
				subdir : 'about',
				command : "getBrowser().selectedTab = getBrowser().addTab ('about:plugins')",
			},
			{
				name : 'about:robots',
				subdir : 'about',
				command : "getBrowser().selectedTab = getBrowser().addTab ('about:robots')",
			},
			{
				name : 'about:support',
				subdir : 'about',
				command : "getBrowser().selectedTab = getBrowser().addTab ('about:support')",
			},
			{
				name : '选项',
				subdir : 'firefox常用功能',
				image : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADE0lEQVQ4jaXMTUhqaQDG8RfufmZ2bYpDSYkfCzlConCyz4XaIUQPBKVtMsjVDEjQIsl4tbA61GRGC4PatIo+IMvoSOmx9JxFQYtcFCG0nbu9cN/0mUXM4sJlYJgH/ruHHyGEEEmSviwuLv7yX5Ik6QshhJBIJGI5OjrSVVX9WqlU/lJV9eu/9c/n+PhYj0QiFiKK4lq9Xsfa2hoSiQQopaCUYnl5GclkEpRSpFIppFIpUEqRSCSwurqKer0OURTXSDAYlHVdb5pMpu+dnZ0tk8nU6u7ubrW1tbU4jmtxHNdqb29vdXR0tCwWS6urq6tlMpm+a5rWDAaDMgkEArKu63C73WxoaAgOhwOCIIBSitnZWWxubmJqagozMzOwWCwYGBhAf38/0zQNgUBAJn6/X9Y0DYODg8xut2N+fh5LS0t4enrCw8MDKpUKyuUy0uk0KKXweDzo6+tjuq7/CLjdbuZyuZBIJPDx8YGXlxdks1nEYjHs7+/j7e0Nl5eX4Hkevb29rFarwe/3y2RsbEzWdR08z7OFhQU8Pj7i+fkZk5OT4DgORqMRVqsVlFJkMhns7OwgHo+zUqn0CYiiKN/f38PlcrHp6WlomoatrS1wHIdcLgdN0zAyMgJZlvH6+or393ecnJywWq0GURQ/gUqlAqfTydbX13F7e4tYLIaenh5omoZGo4F4PI5yuYxms4m9vT2Mj4+zarUKn88nE5/PJ9/d3cHhcLCJiQmoqorDw0MYjUZIkoRoNIq5uTk0Gg3kcjkIgoBwOMxKpdIn4PV610ulEmw2GwuFQkgmk6hWq9jd3YXT6YTBYMDKygpubm4QDochSRJOT0+Zoijwer3rxOPx/KmqanN4ePibwWBgoVCIbWxssIODA3Z2dsZkWWbRaJTJsszS6TRzuVzMarV+U1W1OTo6ukkEQfg9n8+jUCigUCigWCzi/Pwc+XweiqLg+voaiqLg6uoKxWIRiqLg4uIC+XwegiD8QQghv5rN5pjdbs/yPJ+x2WzbPM9v8zy/bbPZflbGbrdnzWZzjBDyG/m/+xsCyiIj0Yng5AAAAABJRU5ErkJggg==",
				command : "openPreferences();",
			},
			{
				name : '书签管理',
				subdir : 'firefox常用功能',
				image : "chrome://browser/skin/places/allBookmarks.png",
				command : "PlacesCommandHook.showPlacesOrganizer('AllBookmarks');",
			},
			{
				name : '历史',
				subdir : 'firefox常用功能',
				image : "chrome://browser/content/abouthome/history.png",
				command : "PlacesCommandHook.showPlacesOrganizer('History');",
			},
			{
				name : 'separator',
				subdir : 'firefox常用功能',
			},
			{
				name : '重启(清除启动缓存)',
				subdir : 'firefox常用功能',
				command : "Services.appinfo.invalidateCachesOnRestart() || Application.restart();",
			},

			// 建议把要放在子目录下的功能按钮,定义在上面, 下面的定义放在主菜单下的最常用的功能按钮,
			{
				name : '破解右键限制',
				subdir : '',
				image :"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADXUlEQVQ4jW2Te0xTdxTHz723195721pKi7xu4bbcdtBWi3Wtijqr8TVwzOhQGYK6mVjnlk2WkaFEjQIZEvER4+YjbmSyxS0Dx8MxgYiDitIoYl1ggApxsqTs8ed0Lb+zPwybEL7J97/v93NOcnIApuikDEr/1oRVwY8d5Q/LXj7z4LDzs+4PzMUNWxJcAEBPzU9Sxxu6tYPF5r5QpUzGPonHUGn0c5fH4W+H4iM978X+ePH1ONu05a7sqMLHRTHhJ0VaHC2OwtEDCePDJUnPRvYm/jNaYiBPirT4uFCLg+9q/6zJSlgxqdy2WJ3zyKeJDPs0OLJbg8OFMeFja8y5voViom+BJH2aadp48y1DYGS3mjzcocZgvmasyivKAABQYQBN7wZhZDBPwKECFT7YrsZHOzWkOdtw1gugmBiyTQKuJVtXPZQvkF828qRxTXQtAADUO1X5fes50r+Bx4E8gQxsFnAgV8ChAoE0ro6eBNkjAt+Vpb7381oO777KPfsoXbRAy3yh+t4KJfa+xoWr3PHv316vDvWt47FvHY/9OTxpWKabBLnsnvlOcJUSe5expNJt3A5XPZz/TgaL7V7V7zl2mFHljPPcylSFgquVGFypxPtZSlKb8T/klCy4el5hx2/PZ/G0K6YMmuZy/kA6g20L+DE7wAwAgAq73tO5XAj1LGaxJ4PFu0tZcsmtPesFUJySWVfArRjvnsPgifTYcrhk4768kcZg5zxFeI8tyT6xaoVd77m+iAsFXArsdjIYmMeQGqfmwtc2obzLwaDfRpOSOclvw/EUVcFPaRTpsNF4xqE99+J5S616T4tLGbqRxmBnKo1+G0067DRpt9DY/BLz9M10swXyomHmd1bFr60yja02OnxU1u0CAGoCctCq91xxsKFrFhrbZBpbU2hsMVPkRKqu4b9cqaTd1GSmIs0mCpstdOS8zNccMWqW+GJh1sFEXvzcxH1xNYXCH0wUXpEo/MbE/rFttjX1xW2pMrOu+PtkKtyQTGGjRGGjCcYvS9Tf9SbqaZMEpD6JwnojkK8kxV87HaaV0/5DoRybfU5S9tcZgdQZKawVn7tOBPKtCJGjKVHtW+xW57TlCXkl4HZYxcx9FkPlYVl/8ZCsr/7QGrc/d7a8EACYqfl/ASscSowNpGaHAAAAAElFTkSuQmCC",
				command :
				function ()
				{
					gBrowser.loadURI("javascript:(function(){var%20doc=document;var%20bd=doc.body;bd.onselectstart=bd.oncopy=bd.onpaste=bd.onkeydown=bd.oncontextmenu=bd.onmousemove=bd.onselectstart=bd.ondragstart=doc.onselectstart=doc.oncopy=doc.onpaste=doc.onkeydown=doc.oncontextmenu=null;doc.onselectstart=doc.oncontextmenu=doc.onmousedown=doc.onkeydown=function%20(){return%20true;};with(document.wrappedJSObject||document){onmouseup=null;onmousedown=null;oncontextmenu=null;}var%20arAllElements=document.getElementsByTagName('*');for(var%20i=arAllElements.length-1;i&gt;=0;i--){var%20elmOne=arAllElements[i];with(elmOne.wrappedJSObject||elmOne){onmouseup=null;onmousedown=null;}}var%20head=document.getElementsByTagName('head')[0];if(head){var%20style=document.createElement('style');style.type='text/css';style.innerHTML=%22html,*{-moz-user-select:auto!important;}%22;head.appendChild(style);}void(0);})();")
				},
			},
			{
				name : '轻松下视频',
				subdir : '',
				image :"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADUElEQVQ4jSXMW09bBQDA8fM5TNh62tNzP225uAG938tCNhOCCj77oImvc4Dolokw67oMVkyhsCGXYZRyc4yBkA00U2fwY+iDGbABK7Q9fx/8fYCf0P1nN7HdBP7fkoR3Y6SfRUjtpIg/y5B6Gia2HSe9ESW6HSD2JE3ycYK2lQSJtSjdP3+AEN9N0LjchLluoG4o1D/2Ia8aKJs65rKKWfKilkzUkop3rhH5ewtz2sSa1oksphD8z+NY6wbWhoi5JmGsWsjrBo41J/KqibZooi3IGD+68c3UI80rmFMK3kmZSCmOEPs1hrbuxnrkwruqoy/7SC6l+OT5R/jmL+AuaZjzIuacG/NBA+4ZCc+kjDWmEZtPIGS2Q3h/sjBXLLRFD4mVdvaOXnDIP/Tt9GPNNeKadaFNe2m5H0eZ0nBNqsgFD/GZNoTUdgJlSUd5pJEsJfnr6AVV+5AKx+xzQt/WVXyTrYSLbfxysEtwyo+joKPlG8lMZhDiW21IKwrissjHux9yyN9UOeYNZ9RqcGK/ZGg7yx/7exyzz+XxFPqIgTfnJV2MIiQ3Y5g/6CgLBvUzTfRufsq+fYRtQ61SwbZtTjnhzD7jda3MlfFLmDkd/bZOy0QzQmArhuehhTWros0q1I/76Fm/xoF9SLViU+H/BLtKmde0T17GlVVwf+3EXwggpFcSaLMeXA9l5BkHxgMXDaMNDGze5NTe54wa1IAqlDnhSrEDaUDF/aVIaCSIkFmKYU1ZuKc1XN+pSGMm0cIlft/fo1w9BtuGM6BqU+YNncUupBsG52+6aB6JIARWwtQXDTxjGsqYxdv5IDsvn1K2X1GpVShzwJl9zCmHvOJf3pvoRPlMxfm5i2AujBBZSKAXDLSCgvKtGzWv0TTaQvBekujdNMHRDJl7HbQXOnmn2IWR9VLX76TuC5HWbAAhOpdCyZtoozLWXSdGzoH7joj4TR3Oobc4N3ge+bqMeF1C6lMR++uQekScvQ6igwGE5EwGzx0PRk5Hu63hvqUjDaiIAxKOIQfSjXNYvS5cfU6kHgXxWh3uqxLOPoXQV0GErtL7JCaihO+HaB4P4S/ECeXjhIaDBIYv0Dp8kWg2yMWcn5ZsBP+tZiKDYZoH/byb7+A/zBpdx7267WIAAAAASUVORK5CYII=",
				command :
				function ()
				{
					gBrowser.loadURI("javascript:if(typeof%20yXzyxe58==typeof%20alert)yXzyxe58();window.open('http://www.youtubexia.com/?url='%20+encodeURIComponent(document.location.href),'getA','toolbar=no,%20location=no,%20directories=no,%20status=no,%20menubar=no,%20scrollbars=yes,%20resizable=yes,%20copyhistory=yes,%20width=800,%20height=600');void(0);")
				},
			},
			{
				name : 'PrintWhatYouLike',
				subdir : '',
				image :"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABt0lEQVQ4jaWRwWsTYRDFf7tNrZjYVLNJl7RQotRrxTZBgqFiQy+tSPHuyb9AEE+SXgXxLCLEiwh6DRQlQhsIulBbqSkm2oDeCkpiEJFmv93xIF27blopPhj4eLw3b+Yb+E9ovcji8mVJjZiE9D6PEyB3+n5A7yMWn2RkdDjOqVHzwMxLZx56vtDu4/bjSRkY6GfEjNF1VMAmIqzWPvKl9c3H67sP5bgkEyexXUXXsQNVWX3Hy1dv2Wh84krBEN8ENx9NSKi/j3DkKLayA+lXzz7zrXrxhu410H+nOwweP4btKLo96m8s3/uhzd46Id4EynUIh49gO8H0a5lSz0u9uNPWYM8VHlRnRdf+aK9nn/uMa9WqjI2PE0skfHzP7ntRLpclMzXF02KRSCRCJpfDME0Gh4Y0b4X9cLdQkJ+dDh+2tnCUotlo8LnZZDKb9TSBBq9XVqReq7Gxvs6FmRm+bm9TXVqiXq8zbBhMpNNEo9H9G5yfntYArEpF3lgW7zc3+d5uk0wmyc/NoXZ26LRah/iDUknWLIuxVAojFkNcl/zCgufTDzID5OfntXPpNIl4HHHdf8kPj18pO7Iti9L4wwAAAABJRU5ErkJggg==",
				command :
				function ()
				{
					gBrowser.loadURI("javascript:(function(){if(window['ppw']&amp;&amp;ppw['bookmarklet']){ppw.bookmarklet.toggle();}else{window._pwyl_home='http://www.printwhatyoulike.com/';window._pwyl_pro_id=null;window._pwyl_bmkl=document.createElement('script');window._pwyl_bmkl.setAttribute('type','text/javascript');window._pwyl_bmkl.setAttribute('src',window._pwyl_home+'static/compressed/pwyl_bookmarklet_10.js');window._pwyl_bmkl.setAttribute('pwyl','true');document.getElementsByTagName('head')[0].appendChild(window._pwyl_bmkl);}})();")
				},
			},
			{
				name : '阅读助手',
				subdir : '',
				image :"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACE0lEQVQ4jaWTv0sbYRjHP+97l8slNVASEiMBk7qJIC0ScMjg0KE4NUsNhA7+DcWhW5WC+B9oFodaxK2bQwcXoaSNVHAJCB0CWqiSQqVJLnf3vh3uYpNGpz7j8+PL83y/30e8B81/hKnuKQgpEVICoJVCq7s7xwAEgJR4SuGHQwZgSAlKja07voEQuEqRnJ8nUyqB1vw4PqZ9dkZECND6HgAhQAg8pXiyscHjtTUitg1Av9vldGuL0/V1TCkDkBBI1EISNeAAs9UqT/f20FqjfT9oMgyEEHysVGgeHBAdnApIBfQBO59nolBgZmUFrRS+694S6bsuWilmKhUeFArY+Tx9QAHyN5AqFinX67xoNHAdJ7jNsm4BTMsCrfE8j0qjQbleJ7mwQA8wO0Bybo7E5CQAsUyGm8tL3F6PztUVAPF0mohtE8tkiKdSEM60Tk4wnsGb62YTBeQWF/l1cUGn3SaRyzExNUU8nUYYBtfn5wgpSWSzfNrc5Ov2Nvg+4m3I5w3wcn+fbLGIGYnwcHp6RK6frRbKdfler/OuWiUREmn2CVwngS87O5RLJT6srmJGoyMAnuPwfHeXz7UaUko8AoeK16GMCrBiMR4tLdE8PMQdkkoBFjC7vMy3oyP63S5yYJ9XQ8+kQ0mjQgR/MHCdEGilcLTGGgIGMF1GwzAMXN+H0ETDYRoG3j95c6ztjsG/pfHaH8m8z1R4EJkJAAAAAElFTkSuQmCC",
				command :
				function ()
				{
					gBrowser.loadURI("javascript:(function(){readStyle='style-newspaper';readSize='size-large';readMargin='margin-wide';_readability_script=document.createElement('SCRIPT');_readability_script.type='text/javascript';_readability_script.src='http://lab.arc90.com/experiments/readability/js/readability.js?x='+(Math.random());document.getElementsByTagName('head')%5B0%5D.appendChild(_readability_script);_readability_css=document.createElement('LINK');_readability_css.rel='stylesheet';_readability_css.href='http://lab.arc90.com/experiments/readability/css/readability.css';_readability_css.type='text/css';_readability_css.media='screen';document.getElementsByTagName('head')%5B0%5D.appendChild(_readability_css);_readability_print_css=document.createElement('LINK');_readability_print_css.rel='stylesheet';_readability_print_css.href='http://lab.arc90.com/experiments/readability/css/readability-print.css';_readability_print_css.media='print';_readability_print_css.type='text/css';document.getElementsByTagName('head')%5B0%5D.appendChild(_readability_print_css);})();")
				},
			},
			{
				name : 'separator',
			},
			{
				name : '下载管理',
				image : "chrome://browser/skin/places/downloads.png",
				command : "BrowserDownloadsUI();",
			},
			{
				name : '附加组件',
				image : "chrome://mozapps/skin/extensions/extensionGeneric-16.png",
				command : "getBrowser().selectedTab = getBrowser().addTab ('about:addons')",
			},
			{
				name : 'about:config',
				image : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABxElEQVQ4jZXQzYsScRzH8d/f16lTFCwRdOoSUYddtlrUaXTVEdR1xqfysLtUrC2EujNjbplPjIGtJIZB6YLMjqu105/w7tQhMB8+99f7C18hVpiiKGiaRjqdJplMsor5B6dSKWzbxnVdVFVdL6CqKuPxmMlkgmmaxOPx9QKapmHbNt1uF0VREEKISCRCOBxmd3d3eSyRSDAcDmk2m4RCIYLBIPl8nsFggCzLiwOyLBOLxej3+7TbbSqVCuVymVqtRqPRQJKk+QE5bSLnPhGNRrEsi06ng2VZtFot6vU61WoVn883Hz/TDLLmhOSJQ/j1N3q9HqVSiUAggCzLSJKE1+udjyXNIKs7VLq/KZ+5hI/HbGd6+P3+5c/yqQYp3eHdmcvL6pT900sK7V94Ds656/+4OOBN6CSLDuXPLocfpqjFC56bE45bP9nKjbjjNf8f2Eno7BUcjI7L4fspe4ULMrrDm8aMzRcjbnuMxde3ckP0zhX7p5fE3tqkTxzy9RmPsiM2dpZgIYS4r32n0L4iY0xIFh2O6jMeZkfceroCFkKIe4qF5+Cco9qMV9UZD1I/uPl4Rfx3G7LFdd9Xrj35wo3t9fAfyK1fDftrXK0AAAAASUVORK5CYII=",
				command : "getBrowser().selectedTab = getBrowser().addTab ('about:config')",
			},
			{
				name : '错误控制台',
				image : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAADbklEQVQ4jZXUS09TCRTA8UPShMBi1i7mQ7hhNcQMPmaiqVFDDDHER4ghWmxa+6BXevuilIulra0tfV36flFoeYmYGF3wCQQLOt+AGb/EfxaC3erivzy/5CzOEREZmLHYjLZZ5dTmesEvNauczlhsRhEZEBExWByzp7tv3/HpqMfh52MOeyccHX+hd/KV3sk/Z33l6PgLh70TDj8f8+mox+7bd1gcs6ciYhARGTTbHXw8OKCx3qXV2aS9uc3G9i6dnTd0d/fo7u7R2XnDxvYu7c1tWp1NGutdPh4cYLY7EJFBEZEhk/U5++8/UG60qLba1Nc7NDe+o2vdLda6W7Q6mzQ3utTXO1RbbcqNFvvvP2CyPkdEhkREhqdnzGzt7ZMtVdCrdYr1JqVGi0qrTXVtneraOpVWm1KjRbHeRK/WyZYqbO3tMz1jRkSGRUSGp56YaG/tkMjqpPQimUKZXKlKvlxDr9TRK3Xy5Rq5UpVMoUxKL5LI6rS3dph6YupDDx9PU2tvEI6niKUyxNM5ElmdZG6VVL5AKl8gmVslkdWJp3PEUhnC8RS19gYPH0/3oclHU5TqTRbCMbRYgnA8SeT1CtFkmlgqQyyVIZpME3m9QjieRIslWAjHKNWbTD6a6kMT9x+wUqqgLmj4tWWC4SihyCsWo3G0WAItlmAxGicUeUUwHMWvLaMuaKyUKkzcf9CHxu9NEknrOD0B5gIh1KCGN/QSv7ZMYClCYCmCX1vGG3qJGtSYC4RwegJE0jrj9yb70O27EyzG01gVFYfqx+UL8iIQwh3UUBeWUBeWcAc1XgRCuHxBHKofq6KyGE9z++5EHzLeGWd+OcEzh4JVUbG7fTg9gR/gOeD0BLC7fVgVlWcOhfnlBMY7433o+s1b+JeiPLXYMTsUrC439jkvTtXHrMfPrMePU/Vhn/NidbkxOxSeWuz4l6Jcv3mrD129YWQ+Esdkc2J2KlgVN3a3B6fqw+UN4PIGvkNuD1bFjdmpYLI5mY/EuXrD+AMaunTtr//m/EGS+QLpfIHsaolcsYJerlGo1ClU6ujlGrlihexqiXS+QDJfYM4f5NK1v7+dn8jgxZGRydE/x76Njl1hdOzyT3aFP8Yu/3txZGTy/GgNIvKbiFwQkd9/sQtnswY5e0qGM3XobN+faehsxiAiA/8DDnCW2sYeE5QAAAAASUVORK5CYII=",
				command : "toJavaScriptConsole();",
			},
		],
	},

	subdirPopupHash : [],
	subdirMenuHash : [],
	_externalFuncPopup : null,
	_isready : false,
	unescapeHTML : function(input) {
			return input.replace(/&amp;/g, '&')
		  .replace(/&quot;/g, '\"')
		  .replace(/&lt;/g, '<')
		  .replace(/&gt;/g, '>')
		  .replace(/&apos;/g, '\'')
		  .replace(/([^\\])\\([^\\])/g, '$1\\\\$2');
	},
	init : function () {

		// var ExternalFuncBtn = document.createElement('toolbarbutton');
		var ExternalFuncBtn = document.createElement('menu');
		ExternalFuncBtn.id = "ExternalFuncButtonM-ID";
		// ExternalFuncBtn.setAttribute("label", "扩展小功能按钮");
		ExternalFuncBtn.setAttribute("label", "扩展小功能");
		ExternalFuncBtn.setAttribute("class", "menu-iconic");
		ExternalFuncBtn.setAttribute("onclick", "event.preventDefault();event.stopPropagation();");
		ExternalFuncBtn.setAttribute("tooltiptext", "扩展小功能按钮,可以自定义小函数功能");
		// ExternalFuncBtn.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
		// ExternalFuncBtn.setAttribute("type", "menu");
		// ExternalFuncBtn.setAttribute("removable", "true");
		ExternalFuncBtn.setAttribute("image", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAYUlEQVQ4jWNgYPj/n5GRPMzA8P8/AyPjfyj4hx3/w4H/Qw2BGPDv/7SzRVjxU1FVrPj/v3//GRj+UWYAxS4YTgb8+///f8ruD1jx369pWPH//6MGUNcAPFkJrwwkR1KYnQHdFt9E917n4QAAAABJRU5ErkJggg==");

		var ExternalFuncPopup = document.createElement('menupopup');
		ExternalFuncPopup.setAttribute('onpopupshowing', 'event.stopPropagation();gExternalFuncButtonM.onpopupshowing();');
		this._externalFuncPopup = ExternalFuncPopup;
		ExternalFuncBtn.appendChild(ExternalFuncPopup);
		setTimeout(function () { //延时加载菜单，不对启动造成影响，也不影响第一次打开菜单时的响应速度
			gExternalFuncButtonM.loadSubMenu();
		}, 3000);

		var ins = document.getElementById("context-sharepage");
		ins.parentNode.insertBefore(ExternalFuncBtn, ins);

   //  	document.insertBefore(document.createProcessingInstruction('xml-stylesheet', 'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(
   //  	'\
			// #ExternalFuncButtonM-ID {\
			// -moz-appearance: none !important;\
			// border-style: none !important;\
			// border-radius: 0 !important;\
			// padding: 0 3px !important;\
			// margin: 0 !important;\
			// background: transparent !important;\
			// box-shadow: none !important;\
			// -moz-box-align: center !important;\
			// -moz-box-pack: center !important;\
			// min-width: 18px !important;\
			// min-height: 18px !important;\
			// }\
			// #ExternalFuncButtonM-ID > .toolbarbutton-icon {\
			// 	max-width: 18px !important;\
			// 	padding: 0 !important;\
			// 	margin: 0 !important;\
			// }\
			// #ExternalFuncButtonM-ID dropmarker{display: none !important;}\
   //  	') + '"'), document.documentElement);

		if (this.moveablePositonOrInsertafter) {
			var navigator = document.getElementById("navigator-toolbox");
			if (!navigator || navigator.palette.id !== "BrowserToolbarPalette")
				return;
			navigator.palette.appendChild(ExternalFuncBtn);
			this.updateToolbar();
		} else {
			var navigator = document.getElementById(this.insertafter);
			if (!navigator)
				return;
			navigator.parentNode.insertBefore(ExternalFuncBtn, navigator.previousSibling);
		}
	},
	loadSubMenu : function () {
		if (this._isready)
			return;
		if (this._externalFuncPopup == null)
			return;
		var ExternalFuncPopup = this._externalFuncPopup;
		for (var i = 0; i < this.toolbar.subdirs.length; i++) {
			if (this.toolbar.subdirs[i].name == 'separator') {
				ExternalFuncPopup.appendChild(document.createElement('menuseparator'));
			} else {
				var subDirItem = ExternalFuncPopup.appendChild(document.createElement('menu'));
				var subDirItemPopup = subDirItem.appendChild(document.createElement('menupopup'));
				subDirItem.setAttribute('class', 'menu-iconic');
				subDirItem.setAttribute('label', this.toolbar.subdirs[i].name);
				subDirItem.setAttribute('image', this.toolbar.subdirs[i].image);
				gExternalFuncButtonM.subdirPopupHash[this.toolbar.subdirs[i].name] = subDirItemPopup;
				gExternalFuncButtonM.subdirMenuHash[this.toolbar.subdirs[i].name] = subDirItem;
			}
		}

		for (var i = 0; i < this.toolbar.configs.length; i++) {
			var configItems;
			if (this.toolbar.configs[i].name == 'separator') {
				configItems = document.createElement('menuseparator');
			} else {
				configItems = ExternalFuncPopup.appendChild(document.createElement('menuitem'));
				configItems.setAttribute('class', 'menuitem-iconic');
				configItems.setAttribute('label', this.toolbar.configs[i].name);
				configItems.setAttribute('image', this.toolbar.configs[i].image);
				if (typeof this.toolbar.configs[i].command == 'function') {
					configItems.setAttribute('oncommand', this.unescapeHTML(this.toolbar.configs[i].command.toSource()) + '.call(this, event);');
				} else {
					configItems.setAttribute('oncommand', this.toolbar.configs[i].command);
				}
				configItems.setAttribute('tooltiptext', this.toolbar.configs[i].name);
			}
			if (this.toolbar.configs[i].subdir && gExternalFuncButtonM.subdirPopupHash[this.toolbar.configs[i].subdir])
				gExternalFuncButtonM.subdirPopupHash[this.toolbar.configs[i].subdir].appendChild(configItems);
			else
				ExternalFuncPopup.appendChild(configItems);
		}

		if (this.autohideEmptySubDirs) {
			for (let[name, popup]in Iterator(gExternalFuncButtonM.subdirPopupHash)) {
				if (popup.hasChildNodes()) {
					continue;
				} else {
					gExternalFuncButtonM.subdirMenuHash[name].setAttribute("hidden", "true");
				}
			}
		}

		if (this.moveSubDirstoBottom) {
			let i = ExternalFuncPopup.childNodes.length;
			while (ExternalFuncPopup.firstChild.getAttribute('class') != 'menuitem-iconic' && i-- != 0) {
				ExternalFuncPopup.appendChild(ExternalFuncPopup.firstChild);
			}
		}
		this._isready = true;
	},
	onpopupshowing : function () {
		if (!this._isready)
			this.loadSubMenu();
	},
	updateToolbar: function () {
		let toolbars = Array.slice(document.querySelectorAll('#navigator-toolbox > toolbar'));
		toolbars.forEach(function (toolbar) {
			var currentset = toolbar.getAttribute("currentset");
			if (currentset.split(",").indexOf("ExternalFuncButtonM-ID") < 0)
				return;
			toolbar.currentSet = currentset;
			try {
				BrowserToolboxCustomizeDone(true);
			} catch (ex) {}
		});
	}
};

    gExternalFuncButtonM.init();