REM 这是一个自动打包成 xpi 的命令，需要有 7z 命令的支持

CD src
7z a 1.zip *
MOVE 1.zip ..
CD ..
DEL InspectElementModY.xpi
RENAME 1.zip InspectElementModY.xpi