@echo off 
cd /d %~dp0
::更新视频播放器
REM set dd=wget.exe -N -P ..\swf\
set dd=wget.exe -N -P ..\swf\ -e "http_proxy=http://127.0.0.1:8087"

::youku
%dd% http://haoutil.googlecode.com/svn/trunk/player/testmod/player.swf
%dd% http://haoutil.googlecode.com/svn/trunk/player/testmod/loader.swf

::ku6
%dd% http://haoutil.googlecode.com/svn/trunk/player/ku6.swf
%dd% http://haoutil.googlecode.com/svn/trunk/player/ku6_out.swf

::iqiyi
%dd% http://haoutil.googlecode.com/svn/trunk/player/testmod/iqiyi.swf
%dd% http://haoutil.googlecode.com/svn/trunk/player/testmod/iqiyi5.swf
%dd% http://haoutil.googlecode.com/svn/trunk/player/testmod/iqiyi_out.swf

::tudou
%dd% http://haoutil.googlecode.com/svn/trunk/player/testmod/tudou.swf
%dd% http://haoutil.googlecode.com/svn/trunk/player/testmod/sp.swf
%dd% http://haoutil.googlecode.com/svn/trunk/player/testmod/olc_8.swf

::letv
%dd% http://haoutil.googlecode.com/svn/trunk/player/testmod/letv.swf
%dd% http://player.letvcdn.com/p/201403/05/1456/newplayer/1/SLetvPlayer.swf

::pplive
%dd% http://haoutil.googlecode.com/svn/trunk/player/pplive.swf
%dd% http://haoutil.googlecode.com/svn/trunk/player/pplive_live.swf

::Sohu
%dd% http://haoutil.googlecode.com/svn/trunk/player/testmod/sohu.swf

::pps
%dd% http://haoutil.googlecode.com/svn/trunk/player/testmod/pps.swf

::17173