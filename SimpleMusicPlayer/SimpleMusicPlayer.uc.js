// ==UserScript==
// @name           SimpleMusicPlayer.uc.js
// @author         ywzhaiqi
// @contributor    defpt、boy3510817、卡饭网友
// @namespace      https://github.com/ywzhaiqi
// @description    简单音乐播放面板，支持多个站点，参考了百度随心听播放栏UC脚本。
// @include        main
// @charset        UTF-8
// @version        2015.8.18 修正样式重复添加的bug
// @version        2015.8.17 更新部分站点样式
// @version        2015.1.26 简单更新修复按钮失效，更新部分站点样式
// @version        2014.10.13
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS/tree/master/SimpleMusicPlayer
// @homepageURL    boy3510817 卡饭页面：http://bbs.kafan.cn/thread-1805934-1-1.html
// @downloadURL    https://github.com/ywzhaiqi/userChromeJS/raw/master/SimpleMusicPlayer/SimpleMusicPlayer.uc.js
// @startup        window.SimpleMusicPlayer.init();
// @shutdown       window.SimpleMusicPlayer.uninit();
// ==/UserScript==

(function(){

    var Config = {
        isUrlBar: 1,     // 0 为可移动按钮，1 为地址栏
        addAutoPopup: 0, // 1 为添加鼠标移过自动弹出面板功能，0 为不添加。注意：启用后会有误触发。
        iframeStyle: {
            normal: "width: 960px; height: 600px;",
            mobile: "width: 320px; height: 480px;",
        },
        logo: {  // 感谢 defpt 提供图标
            //main: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEtSURBVDhPYyAFSElJyWpqapYZGxtf1NXVnQgVxg/4+fkFVVVVU42MjA4ANf4F4v8grK+vvxqqBBPIy8tzKCoqhhgaGq4HKv4B0wTDQMN+6+nprYIqRwUSEhKaQAVv0TUB8VNtbe1eSUlJY5BmnAYA/RkG0wQ06CNQ4Xw5OTkXoBQTRAUDA14DpKWlQ0GaVVRUQmVkZDihwiiAkAEhIAOgXKxgiBsgKCgoa2BgsINkA8TFxcWA6WIvUO4fSB6rAUDT+dXU1AqxGQC0dTtIHIaBKXERVAoCdHR0WoAS8FQHFYYDZDkg/qugoOAGlWJgAMZ5EpIkKAF9h0rBAdCCZqD4J6D8NaD6YKgwBABz1mJkA4D+mwWVIg4AnWMPNP0xUPMroGHdQCE2iAwhwMAAAP8QgByLBig2AAAAAElFTkSuQmCC",
            main: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABQUlEQVQ4jdWRMUpkQRRFn4KRCxBMDNTADbiIYQwMFX7y61NV52zCzMxZQm9AlyFmCqYOiJnxDE6DaHdP8kdmitbEaC4UFLfuva/eexENUkpbwKn6HXgFXsf7aUppq9X/g1rrvnqlztRH4BK4VB9H7qrWur/UnHPeVq/VqfpN3eu6br3runV1b+Sm6nXOebv1rwBnwLzWepJzXltSYK3WegLMgbOIWHl77Pt+E7gDbodh2HivxWEYNoBb4K7v+82/ez8EnoFJRKx+MKZVYAI811oPIyJCPVDv1YX6AExKKbuts5SyC0zUh1F7rx4EcDMSf86slHK0JOBo3MSbFrgJ9aUh58BxGwAcA/Om2Es0xEKdvRfQ/kBdhPr0iYCnUM8/0cJ5pJR2gAvg12j+WWv9umSIX9Qfo3EKXKSUdj5Y+f+C332LB/3Wwm2DAAAAAElFTkSuQmCC",
            playPause: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACOSURBVDhPYxg8wNjY+D8Ig9h6enqtCgoKdmAJYgGaAauA7L9AeqqwsDAvWAEhgMUAMB/IfqisrOwBVoQP4DIAiv8BxRbw8fEJgRVjAzDFIDYWA8BYX1//uYqKSjBYAzqAKQKxcRkAw0CDVoM1IQOYJIhNyABDQ0PyDKDEC+QHIpBNdjRSlJBIT8oDBBgYAPBVgtchO+kXAAAAAElFTkSuQmCC",
            play: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACtSURBVDhPY6AakJKSMpCXlzeEckkH0tLSIUZGRn/09PRmiYuLi0GFiQcgA4yNjf9D8QctLa1ioDArRJYIgGYAGANddENVVdUbqgQ/wGYADBsaGm6TlJTUgCrFDvAZAMJA1/wChk8/Pz+/AFQLKiBkABJ+BQyfdKAWJohOKCDFAHV1ddINAHlBR0eHPC+QHYhAjTcUFRXJisYPQH+SnpAoSsqgzATE5Gcm8gADAwC38IBnl19y/AAAAABJRU5ErkJggg==",
            pause: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAuSURBVDhPYxg8wNjY+D8y1tPTWwWVYgCx0eWhUgiArmDUgFEDQHgIGjBAgIEBAAR/teH6mMe/AAAAAElFTkSuQmCC",
            stop: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABQSURBVDhPzYuxCQBBEIS2p+2/tvtEmGQQLvoTzHTeYXfPjWyhRSZbaJHJFlpksoUWmWyhRSZbaJHJFlpksoUWmWyhRSZbaJHJFlpksv3OzAefL+WBsAnFhQAAAABJRU5ErkJggg==",
            love: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEtSURBVDhPxZBNaoRAEIU7BHKIXMJ/ERWUICLuwgiSXEDEI2Q3e8GtSm/deYNhYA7gzt3gFbKZ3UxCp5/pJiGBkEUgDwq7qt5XVUj+R4yxK0rpveM4e8/zjnme02mabhFZllHXdY++7+/hgVdghNR1vTFN80XXdWZZFjMMg4VhuARBsOBt2zbjfdRfm6bZCIyQJEkOaGiaxgDjCwBDPg9TVZVFUXRYoXmeb3hjnQwDILlBDsEbNXh4LGBWOI7jnZwIEwbgjRpAeQnyNE13KwQNw3DHjRe5QZrkmfISnl/gFdi7qqraft2KHCcCQl4UxVbYP8R/83VZlk/cdIZRnomtiqKc0YNH2L+r67oHvvUkQb7p1Pf9o2j/rLZtAw48IzgUivLvNI6jghDpX4mQN0pht/gL6DzGAAAAAElFTkSuQmCC",
            loved:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAH4SURBVDhPtVI9axRRFD3zPu6bUqy0EtJoQLFMGhERC+tU2uYP+AMCIcHCwt8QRNwqjaliEIWgaGMSJCR+4LomuxqD0Y2u7mQyuzOeyz4VEUFBLxzefeedc++8dwf/MuQ0cGgaOHoWGDoCHCCXKDRX7ipw7BRwWLVq+B40pvPGXKiHsLQh0ntp7ccXItfPAyfOAcefOHetGcJuK4Re3ZjlO95fVE+0AzesPVN3rvU5Tauu91VG7IpUz5LkVt37+W1rq45zVT+Eap/YovYmPdEOrIvMvKGgYIGC5oqiHgt8CqHc8b4smFc8U76vPLFm7Uy0A6vGLO7wcI+inAV6RKEdo7GvRXXlPiP/gWiILEY78DSE2jYFHe2gRSj41lGL7XNfMi/J7bFIm/mac7VoB26LjPGhSv2KNu+bq5HImOuVtOsXBXNt0kzT8q61Y9EO6JiW+NIN5wreuWpT3OGq3fRBtWCX3d+R3xQpVBvH/CMmgOHH3i80RXJ9UJ1Cl8YOV53OW3K8Zk7zwhWR4Wj7KcyUcyPLHNsrkaxFw3t2165bXJ87l63wbAoYUe3A8muYSedGH4Uwt25t9prGpn52mmYraTp3GRhVzUD6+zAT3p+8lySzjRByxQPnZqfJ6dlA8gdxif/+fWtrD4nJEIYi/XcxDhxUxO3/COArvGHuCMKxXyMAAAAASUVORK5CYII=",
            hate: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADvSURBVDhPtZIxDoJAEEUXjJWFNhRewVh4BC9hr3ewMJZegIbensARjGjDBbTmANZGO31DdjcoQgjqT15mlpn5mQXUP9SBOZzgIjiOcyYuQGof1YUJTGEGKUN7otGOc0qUmvRIr8xYDcDXQwkc4PjGgXqie3yQGStZbQRLCGmKiDExlqjzCELyNYyhdB2PhoD4KOK67kuELQyhJA8CTDI5MCBXMcpznkmt3gDkjSu9rpHJpdbMAFmDglm9gX4HlQZcod0GqNkG8N0VINBrilpvkH9GZH9lNjB5Rl5p0IMVXOEusE2OOcMNgw2xD7+QUk+VU05gl8hXVwAAAABJRU5ErkJggg==",
            next: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABtSURBVDhPzZFLDoAwCAVZeRlWhPtfyr1Ra8BP4Rl0o5OQtK8DC0r/QVVnO15AeaCJmYzygIu9LCJjach5gMkDyHN60WWUBzIRFTNP1naQiajKA+7ygD/61tfo/RIt2nj8jXbdKTU3kFRq/hCiBafvhYDu6vWBAAAAAElFTkSuQmCC",
            prev: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABtSURBVDhPzZFBCsAwCAQ99TOexP9/qveSYlAag1tCC6UDgTBMPET6N6ra/JpAPmFRFSKfiEhEdled8LcDxmgIN+AzcxQh8glmPqoQHX928XqAgULkS0DYP9G2MvmaiB6tMUDh8gADhcsDPoDoBCM+hYBu7USzAAAAAElFTkSuQmCC",
            rptOne: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGpSURBVDhPzVI9a8JQFH2lDo528F8YNBpdRXHwIw6CuLg5RFDESQSNmQSJQkDQUQfBX+DipEu7+gOEVlxdsjv4es8j0VbbrUMPPPJy77nn3S/2/8E5f65Wq+PBYNB0TD/jcDh4l8tlnoiN4/H4QoEe2DVNm4bD4Us6nd7out4FB1wR5GK32/mTyeSroihclmXe7/c1y7Jy8IVCIU4CHF/4otEoT6VSb/v93i+CAVVVZyAkEomPdrtt2LbtQ+rwlUqlCQSKxeKWMjDBiUQiHDEiGCDlE71+Xq/XQcd0BYTK5bLV6/Vq+F+tVsFAIHCmcxIEAGnRsak2n2P6BhJ5cjMChzKwUa5wAhCgLH4V+ApXADGOiTHUSOcqgNfwqnDewRVAQx0TY5TOSZKkaw86nU6Nmmfh7qbuAhxwY7HYrQeZTGYGxXg8jimYhUJhi3/q/AR+iGAyrVbLIM47fNls9jYFzBR7gFIwItSHseIO/2g0ytGCafSq2IWHPQCoNu98Ps8bhtGlGW+IeKnX61P4KAMPtnM4HDYWi8XjJt7DNM1mpVIZ437fgz8GY5/djO3Z6MitVwAAAABJRU5ErkJggg==",
            collect: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFqSURBVDhPtVK9asJgFE1/pi59gkqHgksiGhOXWAnoZtTncMjgC4iP4yASEohLI3SViEvoIm7mFZyMn/fY+5XatGChPfCRe88953zXROVfsVqtHnG4/R2EEDeO48x7vd4cNdOXw/O8lqqq+1KptJ9MJi2mLwPdeN3pdF5M0xS6rgvU4HicB4Zpmt5FUVScTqdOv98fkfFQrVYFhxxc1x1hNpvNitCeBQ4Gg2GlUtlJA9WiVqsJwzBOG6BHDQ6acrm8o8Ah2xVluVw+WZa15uFJjCDU4BCAgzD0tm2v4WH7O+I4LlDIm7xRivFEmNwMGmjZdo4kSQr1en39eQuEYHWYcfOPZgn69q9yC7k+eoRixrLvgbdLpu3X34+et9hCw/I8FovFAwkzrK9p2r7b7YY4qBFCfAYNy/Pwfb9JN2ftdjsaj8cN+tZXOPRPbICjjbIwDJssz2Oz2dwHQfBMplumPgAOM2iY+gsoyhFeL+x13CQQrQAAAABJRU5ErkJggg==",
            reset: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACKSURBVDhPzZLBCoAgEES9efdqZ/Gq/lj/6a2f6VgOrlipEWxQDwbEnRF3VfwSaa2dQwjRe79CWGMPtWwZoLWenHNLCmw9oQYP2RvkXbgIHnhz5ABduxu6ito5k3qNPfNAkWIVGlbP3AheilXeOIDXgjGGN8QE7xmBUor1kQoS7WAmGBbp2Vf+ACF2Voi36iQAv+wAAAAASUVORK5CYII=",
        },
        names: {
            // 命令：[菜单名称，accesskey]
            playPause: ["播放/暂停", "a"],
            play: ["播放", "a"],
            pause: ["暂停", "s"],
            stop: ["停止", "d"],
            love: ["喜欢", "f"],
            hate: ["讨厌", "g"],
            next: ["下一首", "e"],
            prev: ["上一首", "r"],
            reset: ["重置", "t"],
            rptOne: ["单曲循环", "q"],
            collect: ["收藏", "f"],
            reset: ["重置", ""],
        },
        mobileUAString: 'Mozilla/5.0 (Android; Mobile; rv:29.0) Gecko/29.0 Firefox/29.0',
    };


    var Sites = [
        {
            name: "百度随心听（手机版）",
            url: "http://fm.baidu.com/",
            changeUA: true,
            iframeStyle: "width: 320px; height: 440px;",
            css: "#ad { display:none !important; }",
            control: {
                playPause: function(win) {
                    var player = win.player;
                    if (player.getState() == 'play') {
                        player.pause();
                    } else {
                        player.play();
                    }
                },
                // play: "win.player.play()",
                // pause: "win.player.pause()",
                // stop: "win.player.stop()",
                love: "#playerpanel-btnlove",
                hate: "#playerpanel-btnhate",
                next: "#playerpanel-btnskip",
                // reset: "win.player.reset()",
            },
            state: {
                isPlaying: "return win.$('#playerpanel-coverimg').hasClass('pause')",
                // isPlaying: "return win.player.getState() == 'play'",
                isLoved: "return win.$('#playerpanel-btnlove').hasClass('loved')",
            }
        },
        {
            name: "百度随心听",
            url: "http://fm.baidu.com/",
            iframeStyle: "width: 670px; height: 500px;",
            // 来自样式 http://userstyles.org/styles/101925/fm-baidu-com
            css: ".fm-header .fm-logo { display: none }.page-tip { display: none }#fm-panel .fm-footer { display: none }.fm-main { top:10px !important; }.fm-userbar { top:10px !important; }.fm-aside { padding-left: 10px !important; top:40px !important; height:100% !important; width:100% !important;}.fm-channel { left: 30px; top:-7px }.fm-player { left: 30px }.fm-main .fm-lrc { left: 290px }#fm-panel .fm-main, #fm-panel .fm-aside, #fm-panel .fm-content { top: 70px; }.page-fm-channel .scene-panel li { margin-right: 5px; }.page-fm-channel .scene-panel li, .page-fm-channel .channel-panel li { width: 100px;}.page-fm-channel .channel { width: 100px; margin: 0px 5px -15px 0px }.page-fm-channel .channel.special .channel-item.private i,.page-fm-channel .channel.special .channel-item.heart i,.page-fm-channel .channel.special .channel-item.musician i { margin-left: -20px; }#fm-panel .fm-page { width: 640px; }#fm-panel .next-page, #fm-panel .prev-page { width: 70px; }#fm-panel .next-page .arrow { margin: 0px -30px 0px 0 }#fm-panel .prev-page .arrow { margin: 0px 0px 0px -30px }.page-fm-channel .scene-panel, .page-fm-channel .channel-panel { margin-right: 0 }.page-fm-channel .scene-panel { margin-bottom: 10px }.page-fm-channel .channel li { margin-bottom: 4px; height: 24px; line-height: 24px }#fm-panel .fm-page { margin-bottom: 0 }.prev-page { left: -53px !important; }.next-page { right: -53px !important; }",
            control: {
                playPause: ".fm-play > .play",
                //play: ".play.stop",
                love: ".fm-favor > A",
                hate: ".fm-trashcan > A",
                next: ".fm-next > A",
            },
            state: {
                isPlaying: "return !win.$('.fm-play > .play').hasClass('stop')",
                isLoved: "return win.$('.fm-favor > A').hasClass('collected')",
            },
        },
        {
            name: "百度音乐盒",
            url: "http://play.baidu.com/",
            iframeStyle: "width: 960px; height: 600px;",
            //css: ".down-mobile,.m-client-product,.column4,#pauseAd{display:none!important}#lrcCol{right:0!important}.mb-layout-bd.column2{margin-right:-165px!important}",
            control: {
                playPause: ".play.wg-button",
                love: ".icons > .favor",
                next: ".next > .wg-button",
                prev: ".prev > .wg-button"
            },
            state: {
                isPlaying: "return !win.$('.play.wg-button').hasClass('stop')",
                isLoved: "return win.$('.icons > .favor').hasClass('unfavor')",
            },
        },
        {
            name: "豆瓣FM（私人版）",
            url: "http://douban.fm/partner/firefox",
            iframeStyle: "width: 360px; height: 290px;",
            css: "DIV#promotion{ display:none !important; }",
            control: {
                play: ".bn-play",
                pause: ".bn-pause",
                love: ".bn-love",
                hate: ".bn-ban",
                next: ".bn-skip",
            },
            state: {
                isPlaying: "return doc.querySelector('#pause_layer').style.display == 'none';",
                isLoved: "return win.$('.bn-love').hasClass('bn-love-active');",
            },
        },
        {
            name: "Jing+ Music",
            url: "http://jing.fm/",
            iframeStyle: "width: 1000px; height: 600px;",
            control: {
                playPause: "#playCtl",
                love: "#playerLove",
                hate: "#playerHate",
                rptOne: "#playerRptOne",
                next: "#playerNext"
            },
            state: {
                isPlaying: "return win.$('#playCtl').hasClass('pause')",
                isLoved: "return win.$('#playerLove').hasClass('selected')",
            }
        },
        {
            name: "网易云音乐",
            url: "http://music.163.com/",
            iframeStyle: "width: 980px; height: 600px;",
            control: {
                playPause: "#g_player .ply",
                next: "#g_player .nxt",
                prev: "#g_player .prv",
            },
            state: {
                isPlaying: "return doc.querySelector('#g_player .ply').classList.contains('pas')",
            }
        },
        {    
            name: "网易云音乐FM",
            url: "http://music.163.com/demo/fm",
            iframeStyle: "width: 330px; height: 410px;",
            css: "body{width:330px;overflow:hidden;}.m-top,.m-demofm h2{display:none!important}.m-demofm{margin-left:-330px!important;margin-right:-330px!important;margin-top:-40px!important;margin-bottom:-280px!important;}",
            control: {
                playPause: ".play-pause",
                love: ".f-fr > .j-flag",
                hate: ".icon-hate",
                next: ".icon-next",
            },
            state: {
                isLoved: "return win.$('.f-fr > .j-flag').hasClass('icon-liked');",
            }
        },

        /*
            下面两个在 iframe 无法点击播放？
         */
        {
			name: "豆瓣FM（手机版）（窗口）",
			url: "http://douban.fm/partner/sidebar",
			isWindow: true,
			windowFeatures: 'width=265px,height=520px,resizable',
        },
        {
			name: "豆瓣FM（窗口）",
			url: "http://douban.fm/",
			isWindow: true,
			windowFeatures: 'width=1200px,height=626px,resizable,scrollbars=yes',
            css: "#fm-section-app-entry,#ft-ads-slot,#fm-footer {display:none !important;}"
        },
        {
            name: "虾米猜（窗口）",
            url: "http://www.xiami.com/radio",
            isWindow: true,
            windowFeatures: 'width=1200px,height=740px,resizable,scrollbars=yes',
        },
        {
            name: "心理FM",
            url: "http://fm.xinli001.com/",
            control: {
                playPause: ".playbtn",
                love: "#favoriteA",
                next: ".next",
                prev: ".pre",
            },
            state: {
                isPlaying: "return win.$('.playbtn').hasClass('pause')",
                isLoved: "return win.$('#favoriteA').hasClass('collected')",
            }
        },
        {
            name: "落网电台",
            url: "http://www.luoo.net/music",
            iframeStyle: "width: 300px; height: 525px;",
            // 该样式为 defpt 修改版，http://bbs.kafan.cn/forum.php?mod=redirect&goto=findpost&ptid=1738389&pid=31590846
            css: "body{width:360px;}.player-large,.cover.rounded.PLCover{position:fixed;top:20px;left:0;width:300px;height:300px;}#playerCt{position:fixed;top:-5px;left:0;width:300px;height:300px;z-index:999;background: black !important;opacity: 0.6 !important;}#lyricWrapper{position:fixed;top:15px;left:0;width:300px;height:300px;z-index:999;background: black !important;opacity: 0.8 !important;}.vol-tags{position:fixed;left:0px;top:0px;width: 300px;}.pagenav-wrapper{position:fixed;left:10px;top:0px;z-index:998;width: 280px !important;text-align:center;text-indent: -0.5em;background: black !important;opacity: 0.8 !important;}.item.actived{position:fixed;left:120px;top:80px;height:25px;z-index:999;background: black !important;opacity: 0.8 !important;}#luooPlayerPlaylist > UL{overflow-y:scroll;overflow-x:hidden;position:fixed;top: 325px !important;width:300px;height:200px;}.article{ position:fixed;overflow-x:hidden;left:0px;top:0px;width: 300px;height:525px;}.cover.rounded{overflow-x:hidden; width: 300px;height: 200px;}.header,.vol-name,.vol-cover,#widgetHotVol,.vol-desc,.relative-vol,#comment,.footer,.vol-meta,.thanks-block{display:none;}",
            control: {
                playPause: [".jp-play", ".jp-pause"],
                love: ".btn-action-like",
                next: ".jp-previous",
                prev: ".jp-next",
                rptOne: [".jp-repeatone", ".jp-repeatone-off"]
            }
        },
        {
            name: "蜻蜓fm",
            url: "http://qingting.fm/",
            openLinkInsided: true,
            iframeStyle: "width: 1000px; height: 600px;",
            control: {
                playPause: ".play.playable-play",
            },
            state: {
                isPlaying: "return !win.$('.play.playable-play').hasClass('play')",
            },
        },
        {
            name: "倾听网络收音机",
            url: "http://www.qingtin.com/app/",
            iframeStyle: "width:470px; height:410px;",
            css: "#cue { display:none; }"
        },
        {
            name: "FIFM.CN",
            url: "http://www.fifm.cn/",
            iframeStyle: "width: 990px; height: 600px;",
            css: "#bdshare,.headerbg, #favorite_table_box div[style*='overflow:hidden']{display:none;}",
        },
        {
            name: "萌否电台",
            url: "http://moefm.ccloli.com/",
            // iframeStyle: "width:";
            control: {
                play: ".c_play",
                pause:".c_pause",
                next: ".c_next",
                prev: ".c_previous",
            },
        },
        // {
        // 	name: "AOP音乐网址导航",
        // 	enable: false,
        // 	url: "http://www.aopmusic.com/"
        // }
    ];

    /* library */

    // 来自 User Agent Overrider 扩展
    const ToolbarManager = (function() {

        /**
         * Remember the button position.
         * This function Modity from addon-sdk file lib/sdk/widget.js, and
         * function BrowserWindow.prototype._insertNodeInToolbar
         */
        let layoutWidget = function(document, button, isFirstRun) {

            // Add to the customization palette
            let toolbox = document.getElementById('navigator-toolbox');
            toolbox.palette.appendChild(button);

            // Search for widget toolbar by reading toolbar's currentset attribute
            let container = null;
            let toolbars = document.getElementsByTagName('toolbar');
            let id = button.getAttribute('id');
            for (let i = 0; i < toolbars.length; i += 1) {
                let toolbar = toolbars[i];
                if (toolbar.getAttribute('currentset').indexOf(id) !== -1) {
                    container = toolbar;
                }
            }

            // if widget isn't in any toolbar, default add it next to searchbar
            if (!container) {
                if (isFirstRun) {
                    container = document.getElementById('nav-bar');
                } else {
                    return;
                }
            }

            // Now retrieve a reference to the next toolbar item
            // by reading currentset attribute on the toolbar
            let nextNode = null;
            let currentSet = container.getAttribute('currentset');
            let ids = (currentSet === '__empty') ? [] : currentSet.split(',');
            let idx = ids.indexOf(id);
            if (idx !== -1) {
                for (let i = idx; i < ids.length; i += 1) {
                    nextNode = document.getElementById(ids[i]);
                    if (nextNode) {
                        break;
                    }
                }
            }

            // Finally insert our widget in the right toolbar and in the right position
            container.insertItem(id, nextNode, null, false);

            // Update DOM in order to save position
            // in this toolbar. But only do this the first time we add it to the toolbar
            if (ids.indexOf(id) === -1) {
                container.setAttribute('currentset', container.currentSet);
                document.persist(container.id, 'currentset');
            }
        };

        let addWidget = function(window, widget, isFirstRun) {
            try {
                layoutWidget(window.document, widget, isFirstRun);
            } catch(error) {
                trace(error);
            }
        };

        let removeWidget = function(window, widgetId) {
            try {
                let widget = window.document.getElementById(widgetId);
                widget.parentNode.removeChild(widget);
            } catch (error) {
                trace(error);
            }
        };

        let exports = {
            addWidget: addWidget,
            removeWidget: removeWidget,
        };
        return exports;
    })();

    // 来自 User Agent Overrider 扩展
    const Pref = function(branchRoot) {

        const supportsStringClass = Cc['@mozilla.org/supports-string;1'];
        const prefService = Cc['@mozilla.org/preferences-service;1']
                               .getService(Ci.nsIPrefService);

        const new_nsiSupportsString = function(data) {
            let string = supportsStringClass.createInstance(Ci.nsISupportsString);
            string.data = data;
            return string;
        };

        let branch = prefService.getBranch(branchRoot);

        let setBool = function(key, value) {
            try {
                branch.setBoolPref(key, value);
            } catch(error) {
                branch.clearUserPref(key)
                branch.setBoolPref(key, value);
            }
        };
        let getBool = function(key, defaultValue) {
            let value;
            try {
                value = branch.getBoolPref(key);
            } catch(error) {
                value = defaultValue || null;
            }
            return value;
        };

        let setInt = function(key, value) {
            try {
                branch.setIntPref(key, value);
            } catch(error) {
                branch.clearUserPref(key)
                branch.setIntPref(key, value);
            }
        };
        let getInt = function(key, defaultValue) {
            let value;
            try {
                value = branch.getIntPref(key);
            } catch(error) {
                value = defaultValue || null;
            }
            return value;
        };

        let setString = function(key, value) {
            try {
                branch.setComplexValue(key, Ci.nsISupportsString,
                                       new_nsiSupportsString(value));
            } catch(error) {
                branch.clearUserPref(key)
                branch.setComplexValue(key, Ci.nsISupportsString,
                                       new_nsiSupportsString(value));
            }
        };
        let getString = function(key, defaultValue) {
            let value;
            try {
                value = branch.getComplexValue(key, Ci.nsISupportsString).data;
            } catch(error) {
                value = defaultValue || null;
            }
            return value;
        };

        let reset = function(key) {
            branch.clearUserPref(key);
        };

        let addObserver = function(observer) {
            try {
                branch.addObserver('', observer, false);
            } catch(error) {
                trace(error);
            }
        };
        let removeObserver = function(observer) {
            try {
                branch.removeObserver('', observer, false);
            } catch(error) {
                trace(error);
            }
        };

        let exports = {
            setBool: setBool,
            getBool: getBool,
            setInt: setInt,
            getInt: getInt,
            setString: setString,
            getString: getString,
            reset: reset,
            addObserver: addObserver,
            removeObserver: removeObserver
        }
        return exports;
    };

    // 来自 User Agent Overrider 扩展
    let UAManager = (function() {

        // There are a bug since Firefox 17, was fixed at Firefox 23
        // https://bugzilla.mozilla.org/show_bug.cgi?id=814379

        let hackingWay = function() {
            // this way work only at Firefox 17 - 24

            Cu.import('resource://gre/modules/UserAgentOverrides.jsm');

            // Orignal UA selector function, a method of UserAgentOverrides.
            // Keep it for revert to default.
            let orignalGetOverrideForURI = UserAgentOverrides.getOverrideForURI;

            let revert = function() {
                UserAgentOverrides.getOverrideForURI = orignalGetOverrideForURI;
            };

            let change = function(uastring) {
                UserAgentOverrides.getOverrideForURI = function() uastring;
            };

            let exports = {
                revert: revert,
                change: change,
            };
            return exports;
        };

        let normalWay = function() {
            // this way work only at Firefox 23+

            let pref = Pref('general.useragent.');

            let revert = function() {
                pref.reset('override');
            };

            let change = function(uastring) {
                pref.setString('override', uastring);
            };

            let exports = {
                revert: revert,
                change: change,
            };
            return exports;
        }

        const appInfo = Cc['@mozilla.org/xre/app-info;1']
                           .getService(Components.interfaces.nsIXULAppInfo);
        let mainVersion = parseInt(appInfo.version.split('.')[0]);
        if (mainVersion < 23) {
            return hackingWay();
        } else {
            return normalWay();
        }
    })();

    /* main */

    if (window.SimpleMusicPlayer) {  // 修改调试用，重新载入无需重启
        window.SimpleMusicPlayer.uninit();
        delete window.SimpleMusicPlayer;
    }

    function Player(doc, info) {
        this.init.apply(this, arguments);
    }
    Player.prototype = {
        init: function(doc, info) {
            this.doc = doc;
            this.win = this.doc.defaultView;
            this.unsafeWindow = this.win.wrappedJSObject

            this.info = info;
            this.control = this.info.control || {};
            this.state = this.info.state || {};
        },
        isPlaying: function() {
            var func = this.state.isPlaying;
            if (func) {
                return this.commondDo(func);
            }
        },
        isLoved: function() {
            var func = this.state.isLoved;
            if (func) {
                return this.commondDo(func);
            }
        },
        love: function() {
            this.commondDo('love');

            this.setLoveStyle();
        },
        setLoveStyle: function() {
            // 需要延时？
            var isLoved = this.isLoved();
            if (isLoved == undefined) return;  // 该站点并不存在 isLoved 参数

            // 改变菜单的图标和名称？
            var loveMenu = document.querySelector('.SimpleMusicPlayer-icon-love');
            if (!loveMenu) return;

            if (isLoved) {
                loveMenu.setAttribute('loved', 'true');
            } else {
                loveMenu.removeAttribute('loved');
            }
        },
        do: function(action) {
            if (typeof(this[action]) == 'function') {
                this[action]();
            } else {
                var func = this.control[action];
                if (func) {
                    this.commondDo(func);
                }
            }
        },
        commondDo: function(func) {
            // 文字 function ？
            if (typeof(func) == 'string' && func.match(/^(return|win|doc)/)) {
                func = new Function("win", "doc", func);
            }

            if (typeof(func) == 'function') {
                try {
                    return func.apply(this.unsafeWindow, [this.unsafeWindow, this.doc]);
                } catch(ex) {}
            } else {
                var button = this.doc.querySelector(func);
                if (button) {
                    clickOrTap(button);
                }
            }
        },

        //--- 辅助函数 ----
        clickOrTap: function (selector) {
            if (!selector) return;

            var button = this.doc.querySelector(selector);
            if (!button) return;

            if (this.info.changeUA) {
                this.fireEvent(button, 'tap');
            } else {
                button.click();
            }
        },
        fireEvent: function (el, type) {
            var e = this.doc.createEvent('HTMLEvents');
            e.initEvent(type, true, true);
            return !el.dispatchEvent(e);　
        },
    };

    window.SimpleMusicPlayer = {
        get prefs () Pref('userChromeJS.SimpleMusicPlayer.'),
        get curSiteIndex() this.prefs.getInt("curSiteIndex") || 0,
        set curSiteIndex(num) {
            this.prefs.setInt("curSiteIndex", num);
        },

        init: function() {
            var self = this;

            this.addCSS();

            this.addIcon();

            if (Config.addAutoPopup) {
                this.addAutoPopup();
            }
        },
        uninit: function() {
            ["SimpleMusicPlayer", "SimpleMusicPlayer-popup", "SimpleMusicPlayer-panel"].forEach(function(id){
                var elem = $(id);
                if (elem) {
                    elem.parentElement.removeChild(elem);
                }
            });
            this.style && this.style.parentNode.removeChild(this.style);
        },
        addCSS: function() {
            var css = '\
				#SimpleMusicPlayer {\
					-moz-appearance: none !important;\
					border-style: none !important;\
					border-radius: 0 !important;\
					padding: 0 0 !important;\
					margin: 0 !important;\
					background: transparent !important;\
					box-shadow: none !important;\
					-moz-box-align: center !important;\
					-moz-box-pack: center !important;\
					min-width: 18px !important;\
					min-height: 18px !important;\
				}\
				#SimpleMusicPlayer > .toolbarbutton-icon {\
					max-width: 18px !important;\
					padding: 0 !important;\
					margin: 0 !important;\
					border: 0 !important;\
					background-image: none !important;\
					background-color: transparent !important;\
					box-shadow: none !important;\
					-moz-transition: none !important;\
				}\
				#SimpleMusicPlayer dropmarker { display:none; }\
                #SimpleMusicPlayer { list-style-image: url(' + Config.logo.main + ') }\
				.SimpleMusicPlayer-icon-playPause { list-style-image: url(' + Config.logo.playPause + ') }\
				.SimpleMusicPlayer-icon-play { list-style-image: url(' + Config.logo.play + ') }\
				.SimpleMusicPlayer-icon-pause { list-style-image: url(' + Config.logo.pause + ') }\
				.SimpleMusicPlayer-icon-stop { list-style-image: url(' + Config.logo.stop + ') }\
				.SimpleMusicPlayer-icon-love { list-style-image: url(' + Config.logo.love + ') }\
				.SimpleMusicPlayer-icon-love[loved="true"] { list-style-image: url(' + Config.logo.loved + ') }\
				.SimpleMusicPlayer-icon-hate { list-style-image: url(' + Config.logo.hate + ') }\
				.SimpleMusicPlayer-icon-next { list-style-image: url(' + Config.logo.next + ') }\
				.SimpleMusicPlayer-icon-prev { list-style-image: url(' + Config.logo.prev + ') }\
				.SimpleMusicPlayer-icon-rptOne { list-style-image: url(' + Config.logo.rptOne + ') }\
				.SimpleMusicPlayer-icon-collect { list-style-image: url(' + Config.logo.collect + ') }\
				.SimpleMusicPlayer-icon-reset { list-style-image: url(' + Config.logo.reset + ') }\
				'.replace(/[\r\n\t]/g, '');;
            this.style = addStyle(css);
        },
        addIcon: function() {
            var button = $C("toolbarbutton", {
                id: "SimpleMusicPlayer",
                class: "toolbarbutton-1",
                label: "简单音乐播放面板",
                tooltiptext: "简单音乐播放面板（左键弹出播放面板，右键控制和切换）",
                context: "SimpleMusicPlayer-popup",
                onclick: "if (event.button != 2) SimpleMusicPlayer.iconClick(event);",
                removable: true,
            });

            if (Config.isUrlBar) {
                $("urlbar-icons").appendChild(button);
            } else {
                ToolbarManager.addWidget(window, button, false);
            }

            this.icon = $('SimpleMusicPlayer');

            // 右键菜单
            var menuPopup = $C("menupopup", {
                id: "SimpleMusicPlayer-popup",
                // position: "after_start",
                position: "bottomcenter topright",
                onpopupshowing: "SimpleMusicPlayer.onPopupShowing(event);"
            });

            // 添加关闭按钮
            menuPopup.appendChild($C("menuitem", {
                label: "关闭",
                accesskey: "C",
                oncommand: "SimpleMusicPlayer.close()",
            }));

            menuPopup.appendChild($C("menuseparator"));

            // 根据站点添加菜单
            Sites.forEach(function(site, index){
                menuPopup.appendChild($C('menuitem', {
                    label: site.name,
                    class: "SimpleMusicPlayer-site",
                    type: "radio",
                    checked: self.curSiteIndex == index,
                    disabled: (site.enable == undefined ? false : site.enable),
                    oncommand: "SimpleMusicPlayer.changeSite(" + index + ");",
                    onclick: "SimpleMusicPlayer.siteMenuClick(event);",
                    url: site.url,
                }));
            });

            // panel
            var panel = $C("panel", {
                id: "SimpleMusicPlayer-panel",
                type: "arrow",
                flip: "slide",
                // side: "top",
                consumeoutsideclicks: "false",
                noautofocus: "false",
                panelopen: "true",
            });

            // panel 里添加 iframe
            var iframe = panel.appendChild($C("iframe", {
                id: "SimpleMusicPlayer-iframe",
                type: "content",
                flex: "1",
                transparent: "transparent",
                style: Config.iframeStyle.mobile,
                context: "contentAreaContextMenu",
            }));

            var mainPopupSet = $("mainPopupSet");
            this.menuPopup = mainPopupSet.appendChild(menuPopup);
            this.panel = mainPopupSet.appendChild(panel);
            this.iframe = iframe;
        },
        addAutoPopup: function() {
            var self = this;
            this.icon.addEventListener('mouseover', function(){
                if (self.hideTimer) {
                    clearTimeout(self.hideTimer);
                    self.hideTimer = null;
                }
                self.popupTimer = setTimeout(self.openPanel.bind(self), 200);
            }, false);
            this.icon.addEventListener('mouseout', function(){
                if (self.popupTimer) {
                    clearTimeout(self.popupTimer);
                    self.popupTimer = null;
                }
                self.hideTimer = setTimeout(function(){
                    self.panel.hidePopup();
                }, 500);
            }, false);

            this.panel.addEventListener('mouseover', function(){
                if (self.hideTimer) {
                    clearTimeout(self.hideTimer);
                    self.hideTimer = null;
                }
            }, false);
            this.panel.addEventListener('mouseout', function(){
                self.hideTimer = setTimeout(function(){
                    self.panel.hidePopup();
                }, 500);
            }, false);
        },
        iconClick: function(event) {
            this.openPanel();
        },
        changeSite: function(siteIndex) {
            // 如果是窗口的情况，则 doc 不正确
            var iframe = $("SimpleMusicPlayer-iframe");
            var doc = iframe.contentDocument;

            this.curSiteIndex = siteIndex;

            this.rebuildControls();

            this.player = new Player(doc, Sites[siteIndex]);

            this.openPanel(siteIndex);
        },
        siteMenuClick: function(event) {
            if (event.button == 2) {
                event.stopPropagation();
                event.preventDefault();

                var url = event.target.getAttribute('url');
                openLinkIn(url, 'tab', { inBackground: false });

                var popupMenu = event.target.parentNode;
                popupMenu.hidePopup();
            }
        },
        onPopupShowing: function(event) {
            this.player && this.player.setLoveStyle();
        },
        openPanel: function(siteIndex) {
            var self = this;
            var icon = $('SimpleMusicPlayer'),
                panel = $("SimpleMusicPlayer-panel"),
                iframe = $("SimpleMusicPlayer-iframe");

            var openPopup = function() {
                panel.openPopup(icon, "after_end", 0, 0, false, null, null);
            };

            // 已经在播放的页面直接打开
            if (siteIndex == undefined) {
                if (this.newWindow) {
                    try {
                        this.newWindow.focus();
                        return;
                    } catch(ex) {
                        this.newWindow = null;
                    }
                } else if (iframe.src) {
                    openPopup();
                    return;
                }
            }

            // 先设为空白，加快速度？
            this.setIframeSrc("about:blank", iframe);

            if (siteIndex === undefined) {
                siteIndex = this.curSiteIndex;
            }

            var curSite = Sites[this.curSiteIndex],
                url = curSite.url;
            this.curSite = curSite;

            // 打开新窗口的
            if (curSite.isWindow) {
                if (this.newWindow) {
                    // 如果是当前选中的激活，否则关闭上一个窗口，打开新窗口。
                    if (this.curSiteIndex == siteIndex) {
                        try {
                            this.newWindow.focus();
                            return;
                        } catch(ex) {
                            this.newWindow = null;
                        }
                    } else {
                        this.close();
                    }
                }

                this.newWindow = window.open(curSite.url, '', curSite.windowFeatures);

                // 向窗口插入 css
                var addStyle = function (css, doc) {
                    var style = doc.createElement("style");
                    style.textContent = css;
                    doc.head.appendChild(style);
                };
                if (curSite.css) {
                    setTimeout(function(){
                        addStyle(curSite.css, self.newWindow.document)
                    }, 500);
                }

                this.curSiteIndex = siteIndex;
                this.rebuildControls();
                return;
            }

            this.curSiteIndex = siteIndex;
            this.rebuildControls();

            // set iframe style
            var iStyle = curSite.iframeStyle;
            if (iStyle) {
                if (iStyle == "mobile") {
                    iStyle = Config.iframeStyle.mobile;
                }
            } else {
                iStyle = curSite.changeUA ? Config.iframeStyle.mobile : Config.iframeStyle.normal;
            }
            iframe.setAttribute("style", iStyle);

            // 强制链接在 iframe 里打开
            var onclick = curSite.openLinkInsided ?
                    "SimpleMusicPlayer.openLinkInIframe(event);" : "";
            iframe.setAttribute("onclick", onclick)

            // 设置 UA
            if (curSite.changeUA) {
                UAManager.change(Config.mobileUAString);
            }

            this.setIframeSrc(url, iframe);

            iframe.removeEventListener("DOMContentLoaded", this.iframeOnload, false);
            iframe.addEventListener("DOMContentLoaded", this.iframeOnload, false);

            openPopup();

            // 还原 UA
            if (curSite.changeUA) {
                UAManager.revert();
            }
        },
        iframeOnload: function(event) {  // this 非 SimpleMusicPlayer
            var doc = event.originalTarget;
            if (doc.location.href == "about:blank") return;

             var curSite = SimpleMusicPlayer.curSite;

            // 添加样式
            var style = doc.createElement("style");
            style.textContent = curSite.css;
            doc.head.appendChild(style);
        },
        close: function() {
            if (this.newWindow) {
                try { // 可能是 dead object
                    this.newWindow.close();
                } catch (ex) {}
                this.newWindow = null;
            } else {
                this.resetIframe();
            }
        },
        setIframeSrc: function(url, iframe) {
            if (!iframe) {
                iframe = $('SimpleMusicPlayer-iframe');
            }

            // 两个地址都要改?mdc是按照第二个写的,真正有效的也是第二个,第一个是以后用来比较用的
            iframe.src = url;
            iframe.contentDocument.location.href = url;
        },
        resetIframe: function() {
            var iframe = $('SimpleMusicPlayer-iframe');
            iframe.setAttribute('style', Config.iframeStyle.mobile);
            this.setIframeSrc('about:blank', iframe);
        },
        rebuildControls: function(menuPopup){
            var site = Sites[this.curSiteIndex];

            if (!menuPopup) {
                menuPopup = $('SimpleMusicPlayer-popup');
            }

            // 移除原有菜单
            var menuitems = menuPopup.querySelectorAll('.control');
            for (var i = menuitems.length - 1; i >= 0; i--) {
                menuitems[i].parentNode.removeChild(menuitems[i]);
            }

            if (!site.control) {
                return;
            }

            var ins = menuPopup.querySelector('.SimpleMusicPlayer-site');

            // 添加新的菜单
            for (let [action, ] in Iterator(site.control)) {
                let menuitem = $C('menuitem', {
                    label: Config.names[action][0] || action,
                    accesskey: Config.names[action][1],
                    class: 'menuitem-iconic control ' + 'SimpleMusicPlayer-icon-' + action,
                    oncommand: "SimpleMusicPlayer.doAction('" + action + "')",
                    onclick: "if(event.button != 0) {event.stopPropagation();event.preventDefault();" +
                        "SimpleMusicPlayer.doAction('" + action + "');}",
                });

                menuPopup.insertBefore(menuitem, ins);
            }

            menuPopup.insertBefore(
                $C('menuseparator', { class: 'control'}),
                ins);
        },
        doAction: function(action) {
            if (!action) return;

            var iframe = $('SimpleMusicPlayer-iframe');
            if (!iframe) return;

            var
                site = Sites[this.curSiteIndex],
                win = iframe.contentWindow,
                doc = iframe.contentDocument,
                unsafeWindow = win.wrappedJSObject
            ;

            var doAction = site.control[action];
            switch(true) {
                case typeof(doAction) == 'function':
                    doAction.apply(unsafeWindow, [unsafeWindow, doc]);
                    break;
                case Array.isArray(doAction):  // 播放盒暂停、收藏和取消收藏等2个按钮和一的行为
                    var btn1 = doc.querySelector(doAction[0]),
                        btn2 = doc.querySelector(doAction[1]);
                    if (btn1 && btn2) {
                        var getState = function() {
                            var style = btn1.getAttribute('style');
                            return style && style.indexOf('display: none') != -1;
                        };
                        var oldState = getState();

                        clickOrTap(oldState ? btn2 : btn1);

                        // 检测是否成功？
                        var newState = getState();
                        if (newState != oldState) {
                            console.log(action + ' 状态切换成功')
                        } else {
                            console.log(action + ' 状态切换失败')
                        }
                    }
                    break;
                case typeof(doAction) != 'string':
                    return;
                case doAction.startsWith('win'):
                    new Function("win", doAction).apply(unsafeWindow, [unsafeWindow, doc]);
                    break;
                default:
                    var button = doc.querySelector(doAction);
                    if (button) {
                        clickOrTap(button);
                    }
                    break;
            }

            function clickOrTap(button) {
                if (site.changeUA) {
                    fireEvent(button, 'tap');
                } else {
                    button.click();
                }
            }

            function fireEvent(el, type) {
                var e = doc.createEvent('HTMLEvents');
                e.initEvent(type, true, true);
                return !el.dispatchEvent(e);　
            }
        },
        openLinkInIframe: function(event) {
            var findLink = function (element) {
                switch (element.tagName) {
                    case 'A': return element;

                    case 'B': case 'I': case 'SPAN': case 'SMALL':
                    case 'STRONG': case 'EM': case 'BIG': case 'SUB':
                    case 'SUP': case 'IMG': case 'S':
                        var parent = element.parentNode;
                        return parent && findLink(parent);

                    default:
                        return null;
                }
            };
            var link = findLink(event.target);
            if(!link) return;

            var href = link.href;

            if (href && href.match(/^(https?|ftp):\/\//)) {
                event.preventDefault();
                event.stopPropagation();
                SimpleMusicPlayer.setIframeSrc(href);
            }
        }
    };


    window.SimpleMusicPlayer.init();

    function $(id, doc) (doc || document).getElementById(id);
    function $C(name, attr) {
        var el = document.createElement(name);
        if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
        return el;
    }

    function addStyle(css) {
        var pi = document.createProcessingInstruction(
            'xml-stylesheet',
            'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"'
        );
        return document.insertBefore(pi, document.documentElement);
    }
})()
