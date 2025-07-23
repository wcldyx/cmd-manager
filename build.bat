@echo off
echo 开始构建CMD命令管理器...
cd /d "%~dp0"

echo 1. 安装依赖...
call npm install

echo 2. 构建Web应用...
call npm run build:web

echo 3. 构建Electron应用...
call npm run build:electron

echo 构建完成！可执行文件位于 release 目录中。
pause