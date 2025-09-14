@echo off
echo === 初始化Git仓库并部署到GitHub ===
echo.

REM 检查git是否安装
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Git未安装，请先安装git
    exit /b
)

REM 初始化git仓库
echo 正在初始化Git仓库...
git init

REM 添加所有文件
echo.
echo 添加文件到暂存区...
git add .

REM 初始提交
echo.
echo 创建初始提交...
git commit -m "Initial commit"

REM 添加远程仓库
echo.
echo 添加GitHub远程仓库...
git remote add origin https://github.com/git2968/SCHEDULE-IMPORT.git

REM 创建main分支
echo.
echo 创建main分支...
git branch -M main

echo.
echo 即将推送到GitHub...
echo 可能需要输入GitHub凭证
echo.

REM 推送到GitHub
echo 推送代码到GitHub...
git push -u origin main

echo.
echo 完成!
echo 仓库已推送到: https://github.com/git2968/SCHEDULE-IMPORT
echo GitHub Pages将在几分钟后可用: https://git2968.github.io/SCHEDULE-IMPORT/
pause 