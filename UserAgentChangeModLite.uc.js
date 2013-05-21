// ==UserScript==
// @name        UserAgentChangeModLite.uc.js
// @namespace   http://www.sephiroth-j.de/mozilla/
// @charset     utf-8
// @note        modify by lastdream2013 at 20130515 mino fix
// @note        modify by lastdream2013 at 20130409 sitelist : change SITELIST idx to Name
// @note        modify by lastdream2013 for navigator.userAgent https://g.mozest.com/thread-43428-1-2
// @include     chrome://browser/content/browser.xul
// ==/UserScript==

var ucjs_UAChanger = {
    toolbarId: "addon-bar",   // urlbar-icons

	DISPLAY_TYPE : 1, // 0显示列表为radiobox, 1显示为ua图标列表

	//----讲解开始----
	//（1）在url后面添加网站，注意用正则表达式

	//正则表达式简单教程：先把网址里的/换成\/
	//然后把.换成\.
	//比如 www.google.com/for.com 就是 www\.google\.com\/for\.com

    /*
    有误：. 代表除换行符外的所有字符，* 代表 0个或多个

	*代表任意位数的字母数字，推荐看http://msdn.microsoft.com/zh-cn/library/cc295435.aspx
	所以要通吃 http和 https 可以用 http*: 或者https?: 或者 http+:
	要通吃www.google.com/reader/2.html和 www.google.com/music/2.html,就用www\.google\.com\/*\/2\.html
    */

	// www.google.com/chrome.exe 一般通配符就可以写成2种（.*包含了所有后缀名）
	// 即 www\.google\.com\/.exe或者www\.google\.com\/.*
	// 添加网站开始，不想要的前面添加 //

	SITE_LIST : [

		// 在 http://www.google.co.jp/m 伪装成日本DoCoMo手机
		{
			url : "http://www\\.google\\.co\\.jp/m/",
			Name : "iPhone"
		}, //此处添加你需要的useragent的名称
		{
			url : "https?://www\\.icbc\\.com\\.cn/",
			Name : "Firefox10.0"
		}, {
			url : "https?://(?:mybank1?|b2c1)\\.icbc\\.com\\.cn/",
			Name : "Firefox10.0"
		},{
			url : "http://vod\\.kankan\\.com/v/",
			Name : "Safari - Mac"
		}, //直接可以看kankan视频，无需高清组件

		//添加网站到此结束
	],

	//现有版本firefox的图标
	NOW_UA_IMG : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADfklEQVQ4jW2TfUzUBRzGH+6444477o1TkXfZUUwJLwh72a6Dxk2wkBcPUSBAl6Ye0Cx0iIkk1AGyapO1AmbQKF+CTGm5DAySKOXFwIQJpkecTd2wabyk/O6e/sgaq56/vn88z3fPH88H+K9ksuDYHFNhdUvB+229+1q+7Ml9t+mw78r4dAAeDz0eC24AgAQA4OmfsMRSfqmwf5bfkXSQnCA5TrJ2dIqpJTW9oaERcQtyfz0pMeleKokPPymPKniQVNbDpqoyV1dHq9A188DV/ducq31qVrCP33Vv+aSPnZ01LE+PPgpACUAEAGiIlX18Z+si9m6PEPqyw1xfrQ9n9S03j98n2+/Ns+raXeZ+46Tp4EVXZ2epMDuQx33WiOZ/apy2+vQ6MxXCaLJMGLUqeM4awPN7k9l65G2+cUPgfscMbaMzXPXhJAtqKsixNMHRseb+smWyEDy/wmv17XwVh+K83AMJSv6Yqqaj6BFert1E28FmZnRPM/WzCZoarjCs+GsaN9p5+4yFdCQyw6y24FCar/3GejX7ExTCcJqGgxv86Nhv5Lrazxl5+BbjG0e4vKiNIVkfUJlUx11lO3nvbLzrj/Nm2hODmlBn0dRdW6viUJpa6FqtYUuwiKaUPdS/1sOA0gvU7e6nPr+V/omVhLGcFRXZ5FiscP1kDF9NMZxG7Uqv6svxSg5l+gpnzQr+8AR49BULn7W9x6wdZWy0b2PS7noqn3qdkuVF/OitOLq/jRB+bwvigY0KO56W45nuSBkvvKB1j+RoOWH15HCylMNZGjo3y/hpbhTjcioJQynDjcmcPhLA6WNL3DcPSOeilyIGACR1es+fvnhU5h7coBeublvM0U2+3BMTQUNYNuFfSujyqAvM5CHbKs43a+gsl7pPpQdNAVABAMxyZLT4iHnCqJgfzl7MsR1+HN8ZyPrMGNqeDGe5yYcDL8t5p0rLyTKVMFasZWVe1Km/hyQCgDyZqLFBIeaJx+RCX4rGPZKn5+RWFW9uV9K5RcWrm5XuX3YphZl3tOzeqxgMXQS/hTx4APBZKxcfr1eL2B4m5ffPKXnJquLYi0pez/fmrzZv/ly4lHUW9UUAwQ9zooVAiQAEGqR4s1jncaUpRDx35nEJz5k92bFGMtuSKptcF6k6BiD6/2hcKDEAg0qMpCAJ8v0kyPUWIwnACgDSf5v/BEdntiMaVZDwAAAAAElFTkSuQmCC",
	//其他版本firefox的图标
	EXT_FX_LIST_IMG : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADaUlEQVQ4jW1TX0xbdRj9MaKoJMYoTJiOja0t/XPbrrSU9T/QS2lvV1oYHVJK2diETGkwrCHKDOvIio4Y2MbAVbpB2s0YVDZT0HZEWKwCokYi2dRoYhbNYpZlD5poZL33+KAiQ8/T930557yc7xDyFzKCweAmQkjG3zuJx+NPJZPJ0kTiQ3Uikcj/576R9x9kPviIa0tBwQwlV9yt9uyHwcJwfBF1J2+b4H1CiG0d9V8Tz/StbY5XL9uys7JOFRUJYGScoN1N8D33Ajyt7Sg1mKCvaYapIwxtR2xEFkhm32dSHJjz2nqn4Og4BkfnCbb5/NW01XuQo2126Gkr9OYqrsRoThfX+tN0aAllPQspUdtV/pqB1DvYeXzxNkLLv/zR+9VveDa2gFKLFxU1XlQwTtDVdTBa7KAoEZRm96qh6xpEBz+YIoQQMjExkdk4sbLQNvkt1/LmCts6+Q2aIvNoHPkCrsAgDOZKaCqqsKtUBx3NQKU1cuoDb7AC37u3gxcXHyWxT3+S61++xtac/RzOs5+hKvQRHKdvoL4njLLKSuyusIIvlqCQX4RijR67NCaoDkS5ne7z7GuxeRcZvvK1Q/n8NCzHU5w19Akaxm/A0jkMZZkLmjIaGpMZlEKJgh08bOfxQGksUDWPpQv3nEb/+GwXiSS/by5ui0Ppm2T39C/h8MzPUNgPgccXQFKig7a2BeISPXLz8pGT+zhE1iNQNMW4reZenBydqSUXUjd3qNqnfpU6o9C1T3O+yzexu/0SZJ5RMIPLqI9eB2WtR/bDDyFn8xMQM92Q7XsdW/Rdv78SeY9HCCGEPjmfkNeOcZRjNK3zx2HqngP1zBDEdj/yCgqRlUnwWM6TEJQfhsjZz4qYEJev9qfWYqw8s2wxd89A5gqvCukBSKvPQeEdw3btfmylypEvNEJQdRTyhgsQ2vpW+eVdyJU2udf/NrEPfDluemkWysboPZk7wkpsZ6DwvAV5QxRSdxiSvUOsiOm7t9MUQJHBf2W9NoMEg5uUreEHTMcWYvoXU9AemYXq0NuQ7TsHiWsAQuYEhEwfBHQPhOajcZklkE0Iua9Ua4OiLVkna3lnVuq7dFdcH+GEe4dZce3IHXnN0Jy67pTvf8u0odKEEELmFr97en75R/XHK7dUS9d/yNsgXBP/CaqqlOsrHyplAAAAAElFTkSuQmCC",

	//自己在底下添加ua
	UA_LIST : [
        {
			name : "分隔线",
		}, {
			name : "Firefox10.0",
			ua : "Mozilla/5.0 (Windows NT 6.1; rv:10.0.6) Gecko/20120716 Firefox/10.0.6",
			label : "Firefox10.0",
			img : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADiklEQVQ4jV2Tf1DTdRjHP2pwV+Y348KUozGswYRlhECCGv5Iwx8zNhhQEXGpgIi6pBCQ8EfC6LgGnvJLL5ER4l0dQv5CLIQIaMeGMGQ4lMXmd8N5/JRCD/b5vvtDIeP553n+eL/ueZ6795uQ/2rusz5PItkuTcvJK2R2l1x+Ka6kxlH8tYLwVq56TjuPzKqnMM9v1bnrf7YBQF3fKILPGyG+yGJ1hRExP96gW5P31zAMI3jGzJmG56TLRIdOZcQVRqnaJ8u1LEYaiulR1UV7fHUv3abqospGk33EqMX4H1/AdG3jaOR7TNT/FlfFirQjZ2PQXbyDM+ZuoT8dliGo/C/ILvQgtFSDSvVdVGuMGLTdm5pgs4DOj5AsfjV1+oIFrenB5uHSGLutUEZHT4eh6eAHKM6QIznvB6RV30KD3oz7Q48w/AQwsw/pWEsCbHXrRhiGOBH5BteUv8uiwZ4Mo5aTElgKpLAqgtF/JglJ+SoUNdxBZbMe1271oUptwGWNHoafP+amWkO5EL+X15KqOO/64SIJWOVW+uCUGNYT2/Awyx/S42cR9H0TWm7fQ35tB+SqRvzaZUKncQCmS+EUunDkSF7JJTU7320dLAiFVbmR6tPW4ZfNIoQnfgPPA2VQXOrAoB2wjD3Gg9FxNOpZ3Lx6AdZza+1ol+JErFsBqVjvrh7M3wT2uzX094h30BzigpR9iXhrzxkcyTsNU20pdDodeqxD6GT/geFGCsZKl9u5+hDIP+XtJan8hUpbhj/MOYH2u/uXo/+zJWiPcsP1MC+0yfgoCvVFZnYeeoefoE7TD23t55go88FEywYa5M/4E5GDg1935DLKZvtQ81FfWA56oWsnH2kfrkZgSDyIOBdL95Sj7bYemsJoWCsDqP3mGq7zykodIeQFQgghCqHb+fs73kZfpteU+bAIA8e8oTm0ApkJEkR+Eo2vdkXAoAjAULYLbCWiSXS8j32S1xJmbOxMyOLaFUJrj8wTul2CScNeD86SuhSPMnkYyxJgPIuPgSOu1HTMfZKrEKLpuLuaEOI47cS5hBDiPd/B54qvm6l7/RvQbHKFNoIHXfybtOdLT86YLsDQtzxMKXmoP+DS7DyfLJ4VwKfD64QsSvVwUl4NcurXbHHm7sTyYZQL0Zvi8fi33a7qpGAmcebv58I0O87EiRAmYNGLgdsFC6WbhQvEoiWOy2ZpZ+B/AT1n+R4PGm8BAAAAAElFTkSuQmCC"
		}, {
			name : "分隔线",
		},

        //伪装 IE8 - Windows7
        {
			name : "IE8 - Win7", //此处文字显示在右键菜单上，中文字符请转换成javascript编码，否则乱码(推荐http://rishida.net/tools/conversion/)
			ua : "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)",
			label : "IE8", //此处文字显示在状态栏上，如果你设置状态栏不显示图标
			img : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADL0lEQVQ4jYWTa0iTURjHj61NoyghuyBiRRZNgtQ3nbNs5jT1i/RB0DIFQ8UUiUmrKLrKQryQVjrHnNSmqGlheL+Q8zZ1ur2a7VbN65q5pvMWXta7pw/TZZH0wIHD8z//HzyXg9CfsQ39P7Z8sy5gZOSVGu0akV1Cv1bc7ZcskLhG5IiQz/XLCGHkrSDWhG+K14lEoaKoYQhUk0bQGRdAZ1yA4VED8OoG4WSScAj5sE7/DbFezqad8mJVrOBfvppGDHMTTfi4uVqqhWqpFpoGx3/2aKbMzXIt+LEr5pEf22PdS0IIITvkQt/hGCcck2p08t7P07Ks2kEQdmgWJZ+mZWKFXsFtVRLPGodB0KZcy6/D4WC8SIncwuwRQnZWTvDdGP57dblUa6hJFkrgafPHbwRBsAEgAQDiRr/PF9yulBG3Xw9Y0qtl5mBOLaDQR5c2SiA5XX3u/BYfuxEj6IRIQbclo0X1Qa4zpfeMGvP6x2ZyeseNuUnlAz9iXkosia961kIz6wnSFV7ZBsAOhd85cDqnzRTKFVtCeN3EeZ4EfAu6gM6VWE9BFzAKu+BcfjswX7QBxqkFcqJQ/nsEqeUlB+7VgPczsfnUi07w4/ctMkW47kIJrg8uxb8Gi2T68FL5yEWRVBspkn45fP+dhpRS9toGoLAq32y/W0Psy2hdcczugLg6dT0AOC6urlLnV1aOLS8vH+qZnA9rnzCF8/snA1wf12Ionn/EBiAlcKMoHDGQnrxfI+VILHt58plixZT7hp4t04c45PWZyVldBHrQtEp62AqUZEH07x64hdmT83AlJasD9hTKzDv5Q2DPww1RLaO8yKaRIgoPn9vFH4LdBf1mh0wxUHJlKhQQ4LAxRusipXI9EV9jcinVAL1KZaZVqYFargRqmRJ8qtTgW6n66VyiBlSoMKG0V56bF8kGOR6Vwtyf1bB0pnEKEqWzcAufJW7KZ4mEvhmgN+rBKbN+iXo5Nehvsw2CYYjsz2Cw3WNZuAdHZAgqalkKLGpZ8uCIDNRYFu7PYLAxDCP/6zPZ+oFhGDkQw476e3syaTRaBI1Gi/D39mQGYtjRdbPdZsMvtAyiG2p6whQAAAAASUVORK5CYII="
		}, {
			name : "分隔线",
		},

		// 伪装 Chrome22.0.1219.0 - Windows7
		{
			name : "Chrome - Win7",
			ua : "Mozilla/5.0 (Windows NT 6.1;) AppleWebKit/537.3 (KHTML, like Gecko) Chrome/22.0.1219.0 Safari/537.3",
			label : "Chrome Win7",
			img : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACOklEQVQ4jY3Sz2vTYBjA8QeEwkBsU2iTJW+Cdnkz19r546Jr3Vh7E08DR8GT4F+gIMybh0JhUGkt7Zt/wEsPngbzoqmehkwt2rTdUuZhHWt3EGVQKCR9vNhuqavsgc/tfb/wwAMwNp2laLSTjBa6ieh2JzHf6ybnf3UT0e1O8lpufzmijr8fjRmJeNqL4ezBUsQ+WIrgJPuLkfUywIWxz+DZu61t/Lgzi+ejbboi1etEatwMHTdvhfC86jeupAEAQMyHFLk4k/pylaxVwwSrYYLVObL3eU5MfbocECbuPBxFp+syo+3Vx8S/NRO0tlR+j2kLkjdmpLmY0eZiRtsbM9JGeVlwakHLqfE4ZNf4AiiMmoquIWFa5gPhHn6U/A+4uJHh4hV0MzL29+CKY/I4UuNNkBntKbqGiq71xXxIKQN4fPHK0XjAF68c/dzmvI4p4EhN6IOia/2/AZQZfQ0AMCnw27zkd+oCjpj8MciMWsOAomuoFEN3z1xh4f26XedTg8Y0jtQFE2RGS64Ao6bw/F7AF6tkubhxyMWNQ1+skl1dfTI1aIjfBk0Rh5z6dA4EXQ3LOrXdEa1JmLZCXpIp4ZUaCBQDF+2G8GiwI+KJabvf4KMAACAzteAKnCIzapXfEv9gR2oPdiUccnal3MkxvACPzOibswJSid7HHTGDFsFTNtEEz79HxdQ19zp0A1sBFS3SxxZBbJEeWtLT/16mmA8ppESfKUx7R4ozKrbIBlrkK1pyFpvi7Pj7PzASq+Abn5PIAAAAAElFTkSuQmCC"
		}, {
			name : "分隔线",
		},

		//伪装 Opera 10.60
		{
			name : "Opera",
			ua : "Opera/9.80 (Windows NT 6.1; U) Presto/2.6.30 Version/10.60",
			label : "Opera",
			img : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADbElEQVQ4jW2SX0hbdxTHf1FWBhuIpQnkYR34MKRZt0JcXw2UyfQSNIYQd5tax3RRVJS6VVMZJSvUbSkpltY5IrTXtVqwbF3dFvXqbVozTdC7mOr1ahvaqfmjSW6axja58Sb37EXDKv0+HM7D93POF85B6HXl7TUymezjQqm0QiqXf1ZQUFD0Js9+5SGEUHFxcanh1CnHhfPnU9d7eqDv4kVoP3MmXlVVdUsul7+/681/I1xSUvL51b6+7CpNQ9zlAj/DZLdoOrs1Owv2sTFoaGjYKCoqOro/yd5mpcViefmYZbPR0VFhmSSFB24375yZ4QMjI9mg08nbSRK+OH16WavVFu+yklypNRiGRu7eFXx2e3rdaoXp8fHYFEVFJhyO8OLgYHK9t1ek3e5oZ1dX0mAw/KZWqw/l8mu12o++M5t9xNCQ/2l//85jk0l46HCs3qcodmp6eokmiMBaezvM37u39sPly97Os2d9OI5X5waYzebWW8PDz34dHh5f0GqTTEvLqwWPh6Ln5iZphrF779z5h1GpYLa7e/53khwavHGDbWxs/FahUBxACCHJ1StXvvcyjGttZcXmyMvLzJeWhp5vb9uiW1vX46lU/8bo6J9TCMFSU5OLSyYtix7P/Y6Ojh8xDCtECoXigM1m640nEjM7L1788iA/X6SPHw8BwABkMoMAYOPs9rFxhOBpd7cHAH5+znFTJpPJolarDyGVSvW21Wq1pnh+VeB50imT8XPHjiUAgBQFgQKAic2bNxcnJBIIXLu2LIriWCwS8ba2tpoxDCtESqXyrba2to4YxwVFUXzkPXEi4ZRKBVEQliCbXQJR9K5brUESIYi73U9EUWRWWfYRjuNNZWVl7yCEENLpdJ86KGoBALgAQUQohIAPhTbFTMYPABvLtbWvZg8fFjLp9DoAxAYGBv6orq7Gcs9UXl4ubW5uvhCLxeIAkHIdObLj6+xMAUA8HQ4nHh48mAndvr0NAOlFr3elpqbmXGVl5Xt7V5Tspjh6rqvrpyjHvYTNTWA1GvBfupR9Ul8PUYIAAACWZZ/V1dX14Diu/D+bG6TRaD4wGo1f2ycn/w4Eg5zf6UxHfD7+33A4RBDEX3q9/hv9yZOf7Adfk0qlehfDsA9xHK+sb2n5st5o/KpGp9NXVFSUaDQa2X7/f7oO8ld2yvCoAAAAAElFTkSuQmCC"
		}, {
			name : "分隔线",
		},

		//伪装 Safari - Mac OS X
		{
			name : "Safari - Mac",
			ua : "Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_8; ja-jp) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16",
			label : "Safari",
			img : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADCUlEQVQ4jX2T70uTARDHL2sJwUNI/gdhWtkPQrMSlH44KbLIepWVGSauzDRr5SSI1H7IqF5kZRbOtbJsqWWa5dbSMnQ2dVtu89mz5lxNl85FQqF73LcX6Qiz7tXB3efDcdwR/R1ziGgewzChEonkuFgszmYYJpSIBFO1/0bQdMIwzCKZTHZPrlDIGYZZNFvPrHBISMjCU2fO5DY1PH819GUAbpcTjfV1TWKxOJuImH9JgoiINgmFcdY+i+2bx42Oj3aotKy/Wcv6O3v7MeYdhsXUy8bHb14/UxJERBQbGxs1OuL+YTRzOC03TOyQGvjdVw1IvqLHvhsm/oLS5DNaPsEz7B6LiYlZOcXOnV7a/LetLb0WzoEMGetLumbGtgs6JBZ3Qlj8AWm3TEi9aUaewuzj7E5o1KquKfj3FBsTEnZ8dTmQ/8DIJ2U9Qfrld4gvdeCE0onztf04ImNRUG3DofI+3Giw8q4BOzbExQkDCzh2LPu6wcz5N10y+FJK3uPK/gJUpJ1F/cte1HaP4lydA5mVVmRWsDha2eczWTj/ofQMaUAgEh2p1Ro57C018IdlLEpaPDAUXkRrugiqj0N4w47hlNKBlFI9chQsrzdxyMgUVQUEu5L3VLV06LHnpsUnkrMoahqEkuPxsK0fOvMnOD67IH31Bal3WeQ8tPNt2h4k7UyuCAiWRa7Or6t7hlzlgO+A3I5ilRuSF4Oot/7EI+N3SOrtKG1mce6pDdLmIb768RMsXb4iNyAQCBZE5ebk+Z+1s5OFao+/UDOMAo0HJe3fINV+R77GixONbuQ8daGhvW/yaNZxXiAQrP7zkIIjIlfV3L9fhWa9c+Jsi9cvNYzjZOMg8hoHUaIfx/lWr7+hy+mrrFQgLGJ5FREFT8PTD7IiYev27tdqDbqsTtSYRyYfm0b5atMoX2Memey2OqFWqbF5y9ZOIoqcwQaSxdFr15XfKS/39uh0sHFW2DgrenQfcLuszLMmKrqMiBbPhGdKiIjCw8LD04SJiUVCYWJRWFjEQSJaMlvvLwJ0xKwgmMgDAAAAAElFTkSuQmCC"
		}, {
			name : "分隔线",
		},

		//伪装 iPhone，查询http://www.zytrax.com/tech/web/mobile_ids.html
		{
			name : "iPhone",
			ua : "Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_1_2 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7D11 Safari/528.16",
			label : "iPhone",
			img : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAADLSURBVCiRddA/C0FRGMfxc4UyGdQNpQzIKzDhFViNZvKn7y5loow3Ay/AaLQpeQUMkkWhjBbFonQM13X9efRM5/l9zjlPj9Lqu4hSJeycfuMUKy5E/wB8TNEM3I4beTHxE+HIiBjBD4BBhSVH1lj0mbDlwJgMhlZKKzw00ULNMG2Q4yzEOxLPL2iL91uvGRiKoOSCjggsFxS5C+BCAY8NYizFN26UnT3URHAi74AAcwE03lZNkg0azZ4F168hnyRNjypxQmTpUsdr9x/STR736IkaIQAAAABJRU5ErkJggg=="
		}, {
			name : "分隔线",
		},

		//伪装 Apple iPad 2
		{
			name : "Apple iPad 2",
			ua : "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25",
			label : "Apple iPad 2",
			img : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADG0lEQVQ4jW3R708TdxwH8HPGB0fLj0TguN5dCxkLiUSDOrLExDAXf8RHOjKJmTEKrcUftKUdlLrVWQwI18QZ2Nwsa7vatBRaaHtnqdIqFIzgZtzOLtb4wGV/h7lv33uwLIuh7z/glc/7/aGof7Otq6vrF4NeX2rmeaVFEIoCpyt+fuJE0Ts5WbzmdhfdV13FEeeQ4rDbSy6XK+LxeD6g/ks8Ht8ucFyplmHR1L4bDR+1YeeHbdhz8FOM3boN9/gEnNc9sLu/Rb/FAqPR+Nbn8+14D+B1uj+Omy6VZ5Zy6mg0UZ7KyGVvMlWOrq2XpY2NsvT8RTn/8pU65vOXu0+eLG0BdCyrfNl/GbnlHAnML2JubgaR2D3IhSyevVhB/skaXhafk/Hb0/js0KHXWwCWZRXboAOp5QKJLspISmkkMzIyS6tYX/sN+fVNFH4tkQnRi086O7cCDMsqww47Ftb/JDG5gHQijGQ6hmxiBfn5x5BWn2Jh8y8yNjqKXe3tlQBGcdhHUHgYJXImguXlVeTyjyDJElL37yObXMTjWJhc99xAc7OhUgVGGfpqBIn4PJEWQ0iml5B9kMXcXByhcBSZRAKZoJ98/c018DxfeQPLgAW53ApJxFOQ0hLSqRRkWYaUlrCQTCFfeEJs1kFwlQCdTqcY+0y4e9dHfvj+DkKhewgGgwgEAggEgpiZ+Rmz0RgxGk2VL+A4Tunu/gI/3vmJTEyK8Hq9EEUvRFHEpOjFzfEJTE1Nk1OneqDX6ysDhw8fgcvpJDarDVaLBTabFTbbICwWKwasVjiGRsjRI8dgMFQYURAEZW9HBy5ZnaTn9Bn0mi7iXJ8ZvefPwnShD2dO92BooJ907N0HQ6UvcBz/+8cde9SLwdy73uFRdco/q96YDqk3x4dV8TuP6nGcU1dD5nf7Ow+oer3wagvQ0tLyRqvVoJFtAtPEgGEY8IIAXtBjZ0MjGpkGsLpGVFdXo7W19W+z2fw/QFEUpdVqr9TW1vo1VVV+mqbDNE1HampqonV1dRENTUdoWhOuqtL4NRqNv76+3k5R1DaKoqh/AOus3HSfnM0iAAAAAElFTkSuQmCC"
		}, {
			name : "分隔线",
		},

		//伪装 Google 爬虫
		{
			name : "Googlebot",
			ua : "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
			label : "Googlebot",
			img : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACxklEQVQ4jb2TW0hTARjHj1j0kiXdL/YSCdJDF4qECsGSQJOeWgVFrCItug260LrASaY2llvbWm6i6damZbZZbEuns9Uu7tY2d87Z2c7Z2XrxIaiwl6DA/j1Uq4guT/1fvpf///d9H3wfQfwHFfWYTK4Rt2fS5XKVK5XK5X90kyRZo9Foyq4rFAdUqtsrT5yRViYoBrzwcspqtS6SyWQbfwldukSuEYslpSRJrhoYsJ3xj4dedXUHIWsdmNq2XTe1ZasdbTeHPvb32zaYzGZJa6ty1Y8dZ5AkOc/nD5k9Xh8diSffmSyJt3v2qcDyOQSjHErmWmDoegp/KPomwWQQo1mtSCQqbmw8XU5YLJaV32CO4RFlRngJydkg6uo1YLN5sNk8anYM4NzFW2D4PBguj2Q6+2nY/cwh12qXEcbe3jVGo6Var++s6uq5a0tl89B1+DGntAlDYwnQXA519So8fOwClckhmckhmRbeaDTOWYU1RCJRscM1xtJcDjSXB83lcEPdB/ERNXbu6oWm/R4mWAETaQGJtIAEK+CJ61ldAaDW3VYEY9T09w45TKQFBOMcFiy+ioOH+xClecTYLGKpLF6ksgjEaDQ3q5YSBEEU9w/aJ3+kO0YYSM514FqLGRcu67BoyTEcONSBKMMjyvCIfKl0YQL70Gh1OMlGYqksnodZrFt/Eg63txC4/8iHshX74YsxCFM8QhQ/7XtBnf/pFrQGQ4V91Bt/aA9jdsleDA4FEKZ5hKjMa3eAel9bfwr+OItQkhO6u22l+k5LlVwuLykApNKWhQ8eDw+HKA6Np+SoWC3C8dMqyBRmtfjwlaNmq1Pmjafehhle+tszbmhomGkw9VU6PYGwJ0J9eDTqg30s0EQQBNGsUi1t0+jXEgRR9Mdf+Kqiuw8GN7uej2+5Z3PWtncaN+nvmHffMhrn/0v4J9DfDJ8BKCTDLoGbeskAAAAASUVORK5CYII="
		}, {
			name : "分隔线",
		},
		// 添加ua，到此结束
	],

	UANameIdxHash : [],

	// ----- 下面设置开始 -----
	// defautl: ステータスバーの右端に表示する
	TARGET : null, // 定义一个target，用来调整状态栏顺序,null为空

	PANEL_TYPE : true, // true:状态栏显示图标  false:显示文字

	ADD_OTHER_FX : true, // true:自动添加其他版本firefox的ua  false:不添加

	WIDE_WIDTH : 38, // 追加其他版本firefox状态栏宽度
	NARROW_WIDTH : 26, // 不追加时状态栏宽度

	//2种版本firefox，下面请勿修改
	EXT_FX_LIST : [
        {
			name : "Firefox4.0",
			ua : "Mozilla/5.0 (Windows; Windows NT 6.1; rv:2.0b2) Gecko/20100720 Firefox/4.0b2",
			label : "Fx4.0",
			img : ""
		}, {
			name : "Firefox3.6",
			ua : "Mozilla/5.0 (Windows; U; Windows NT 5.1; rv:1.9.2.8) Gecko/20100722 Firefox/3.6.8",
			label : "Fx3.6",
			img : ""
		},
	],
	// ----------------------
	// UA リストのインデックス
	def_idx : 0,
	Current_idx : 0,

	// 初期化
	init : function () {
		this.mkData(); // UA データ(UA_LIST)を作る
		this.mkPanel(); // パネルとメニューを作る
		this.setSiteIdx();
		// Observer 登録
		var os = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
		os.addObserver(this, "http-on-modify-request", false);
		os.addObserver(this.onDocumentCreated, "content-document-global-created", false);
		// イベント登録
		var contentArea = document.getElementById("appcontent");
		contentArea.addEventListener("load", this, true);
		contentArea.addEventListener("select", this, false);
		var contentBrowser = this.getContentBrowser();
		contentBrowser.tabContainer.addEventListener("TabClose", this, false);
		window.addEventListener("unload", this, false);
	},
	onDocumentCreated : function (aSubject, aTopic, aData) {
		var aChannel = aSubject.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation).QueryInterface(Ci.nsIDocShell).currentDocumentChannel;
		if (aChannel instanceof Ci.nsIHttpChannel) {
			var navigator = aSubject.navigator;
			var userAgent = aChannel.getRequestHeader("User-Agent");
			if (navigator.userAgent != userAgent)
				Object.defineProperty(XPCNativeWrapper.unwrap(navigator), "userAgent", {
					value : userAgent,
					enumerable : true
				});
		}
	},
	// UA データを作る
	mkData : function () {
		var ver = this.getVer(); // 現在使っている Firefox のバージョン
		// 現在使っている Firefox のデータを作る
		var tmp = [];
		tmp.name = "Firefox" + ver;
		tmp.ua = "";
		tmp.img = this.NOW_UA_IMG;
		tmp.label = "Fx" + (this.ADD_OTHER_FX ? ver : "");
		this.UA_LIST.unshift(tmp);
		// Fx のバージョンを見て UA を追加する
		if (this.ADD_OTHER_FX) {
			if (ver == 3.6) { // Fx3.6 の場合 Fx4 を追加する
				this.EXT_FX_LIST[0].img = this.EXT_FX_LIST_IMG;
				this.UA_LIST.push(this.EXT_FX_LIST[0]);
			} else { // Fx3.6 以外では Fx3.6 を追加する
				this.EXT_FX_LIST[1].img = this.EXT_FX_LIST_IMG;
				this.UA_LIST.push(this.EXT_FX_LIST[1]);
			}
		}
		// 起動時の UA を 初期化 (general.useragent.override の値が有るかチェック 07/03/02)
		var preferencesService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("");
		if (preferencesService.getPrefType("general.useragent.override") != 0) {
			for (var i = 0; i < this.UA_LIST.length; i++) {
				if (preferencesService.getCharPref("general.useragent.override") == this.UA_LIST[i].ua) {
					this.def_idx = i;
					break;
				}
			}
		}
	},
	// UA パネルを作る
	mkPanel : function () {
		var uacPanel = document.createElement("toolbarbutton");
		uacPanel.setAttribute("id", "uac_statusbar_panel");
		if (this.PANEL_TYPE) {
			uacPanel.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
			uacPanel.setAttribute("type", "menu");
            uacPanel.setAttribute("removable", "true");
		} else {
            uacPanel.setAttribute("style", "min-width: " + (this.ADD_OTHER_FX ? this.WIDE_WIDTH : this.NARROW_WIDTH) + "px; text-align: center; padding: 0px;");
        }
        this.setImage(this.def_idx, uacPanel);

        var toolbar = document.getElementById(this.toolbarId);
		if (this.TARGET != null) { // default から書き換えている場合
			this.TARGET = document.getElementById(this.TARGET);
		}
		toolbar.insertBefore(uacPanel, this.TARGET);
		// UA パネルのコンテクストメニューを作る
		var PopupMenu = document.createElement("menupopup");
		PopupMenu.setAttribute("id", "uac_statusbar_panel_popup");
		for (var i = 0; i < this.UA_LIST.length; i++) {
			if (this.UA_LIST[i].name == "分隔线") {
				var mi = document.createElement("menuseparator");
				PopupMenu.appendChild(mi);
			} else {
				var mi = document.createElement("menuitem");

				mi.setAttribute('label', this.UA_LIST[i].name);
				mi.setAttribute('tooltiptext', this.UA_LIST[i].ua);
				mi.setAttribute('oncommand', "ucjs_UAChanger.setUA(" + i + ");");

				if (this.DISPLAY_TYPE) {
					mi.setAttribute('class', 'menuitem-iconic');
					mi.setAttribute('image', this.UA_LIST[i].img);
				} else {
					mi.setAttribute("type", "radio");
					mi.setAttribute("checked", i == this.def_idx);
				}
				if (i == this.def_idx) {
					mi.setAttribute("style", 'font-weight: bold;');
					mi.style.color = 'red';
				} else {
					mi.setAttribute("style", 'font-weight: normal;');
					mi.style.color = 'black';
				}
				mi.setAttribute("uac-generated", true);
				PopupMenu.appendChild(mi);
			}
		}
		uacPanel.addEventListener("popupshowing", this, false);
		uacPanel.appendChild(PopupMenu);

		// パネルの変更を可能にする
		uacPanel.setAttribute("context", "uac_statusbar_panel_popup");
		uacPanel.setAttribute("onclick", "event.stopPropagation();");

        if (this.PANEL_TYPE) {
            /* 更新按鈕到 Toolbar，可移动按钮 */
            var toolbars = document.querySelectorAll("toolbar");
            Array.slice(toolbars).forEach(function(toolbar) {
                var currentset = toolbar.getAttribute("currentset");
                if (currentset.split(",").indexOf("uac_statusbar_panel") < 0) return;
                toolbar.currentSet = currentset;
                try {
                    BrowserToolboxCustomizeDone(true);
                } catch (ex) {}
            });
        }
	},
	// URL 指定で User-Agent の書き換え(UserAgentSwitcher.uc.js より)
	observe : function (subject, topic, data) {
		if (topic != "http-on-modify-request")
			return;
		var http = subject.QueryInterface(Ci.nsIHttpChannel);
		for (var i = 0; i < this.SITE_LIST.length; i++) {
			if (http.URI && (new RegExp(this.SITE_LIST[i].url)).test(http.URI.spec)) {
				var idx = this.SITE_LIST[i].idx;
				http.setRequestHeader("User-Agent", this.UA_LIST[idx].ua, false);
			}
		}
	},
	// イベント・ハンドラ
	handleEvent : function (aEvent) {
		var contentBrowser = this.getContentBrowser();
		var uacPanel = document.getElementById("uac_statusbar_panel");
		var uacMenu = document.getElementById("uac_statusbar_panel_popup");
		switch (aEvent.type) {
		case "popupshowing": // コンテクスト・メニュー・ポップアップ時にチェック・マークを更新する
			var menu = aEvent.target;
			for (var i = 0; i < menu.childNodes.length; i++) {
				if (i == ucjs_UAChanger.Current_idx) {
					menu.childNodes[i].setAttribute("style", 'font-weight: bold;');
					menu.childNodes[i].style.color = 'red';
					if (!this.DISPLAY_TYPE)
						menu.childNodes[i].setAttribute("checked", true);
				} else {
					menu.childNodes[i].setAttribute("style", 'font-weight: normal;');
					menu.childNodes[i].style.color = 'black';
				}
			}
			break;
		case "load": // SITE_LIST に登録された URL の場合
		case "select":
		case "TabClose":
			for (var i = 0; i < ucjs_UAChanger.SITE_LIST.length; i++) {
				if ((new RegExp(this.SITE_LIST[i].url)).test(contentBrowser.currentURI.spec)) {
					var idx = this.SITE_LIST[i].idx;
					this.setImage(idx);
					return;
				}
			}
			this.setImage(this.def_idx);

			break;
		case "unload": // 終了処理
			var os = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
			os.removeObserver(this, "http-on-modify-request");
			os.removeObserver(this.onDocumentCreated, "content-document-global-created");
			var contentArea = document.getElementById("appcontent");
			contentArea.removeEventListener("load", this, true);
			contentArea.removeEventListener("select", this, false);
			if (contentBrowser)
				contentBrowser.tabContainer.removeEventListener("TabClose", this, false);
			uacMenu.removeEventListener("popupshowing", this, false);
			window.removeEventListener("unload", this, false);
			break;
		}
	},
	// 番号を指定して UA を設定
	setUA : function (i) {
		var preferencesService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("");
		if (i == 0) { // オリジナル UA にする場合
			// 既にオリジナル UA の場合は何もしない
			if (preferencesService.getPrefType("general.useragent.override") == 0)
				return;
			preferencesService.clearUserPref("general.useragent.override");
		} else { // 指定した UA にする場合
			preferencesService.setCharPref("general.useragent.override", this.UA_LIST[i].ua);
		}
		this.def_idx = i;
		this.setImage(i);
	},
	// UA パネル画像とツールチップを設定
	setImage : function (i, uacPanel) {
		var uacPanel = uacPanel || document.getElementById("uac_statusbar_panel");
		if (this.PANEL_TYPE) {
			uacPanel.setAttribute("image", this.UA_LIST[i].img);
			uacPanel.style.padding = "0px 2px";
		} else
			uacPanel.setAttribute("label", this.UA_LIST[i].label);
		uacPanel.setAttribute("tooltiptext", "User Agent(" + this.UA_LIST[i].name + ")");
		this.Current_idx = i;
	},
	// アプリケーションのバージョンを取得する(Alice0775 氏のスクリプトから頂きました。)
	getVer : function () {
		var info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
		var ver = parseInt(info.version.substr(0, 3) * 10, 10) / 10;
		return ver;
	},
	setSiteIdx : function () {
		for (let i = 0; i < this.UA_LIST.length; i++) {
			this.UANameIdxHash[this.UA_LIST[i].name] = i;
		}
		for (let j = 0; j < this.SITE_LIST.length; j++) {
			var uaName = this.SITE_LIST[j].Name;
			if (this.UANameIdxHash[uaName]) {
				this.SITE_LIST[j].idx = this.UANameIdxHash[uaName];

			} else {
				this.SITE_LIST[j].idx = this.def_idx;

			}
		}
	},
	// 現在のブラウザオブジェクトを得る。
	getContentBrowser : function () {
		var windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"]
			.getService(Ci.nsIWindowMediator);
		var topWindowOfType = windowMediator.getMostRecentWindow("navigator:browser");
		if (topWindowOfType)
			return topWindowOfType.document.getElementById("content");
		return null;
	}
}
ucjs_UAChanger.init();