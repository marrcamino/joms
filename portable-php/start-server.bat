@echo off
cd /d %~dp0
echo Starting PHP server on http://localhost:8080 ...
php -S localhost:8080 -t htdocs -c php.ini index.php
pause
