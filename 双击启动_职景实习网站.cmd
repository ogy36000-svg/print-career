@echo off
chcp 65001 >nul
node "%~dp0scripts\local-launch.mjs" %*
if errorlevel 1 pause
