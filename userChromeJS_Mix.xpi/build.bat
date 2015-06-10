REM 这是一个自动打包成 xpi 的命令，需要有 7z 命令的支持

SET filename="userChromeJS_Mix.xpi"

CD src
7za a 1.zip *
MOVE 1.zip ..
CD ..
DEL %filename%
RENAME 1.zip %filename%