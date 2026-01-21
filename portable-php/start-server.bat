@echo off
cd /d %~dp0
echo Starting PHP server on http://localhost:8080 ...
"%~dp0php.exe" -S localhost:8080 -t "%~dp0htdocs" -c "%~dp0php.ini" index.php
pause
