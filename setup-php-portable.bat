@echo off
setlocal enabledelayedexpansion
title Portable PHP Environment Setup

REM ============================================================
REM  Portable PHP Environment Installer
REM  - Downloads and configures PHP 8.3 (x64)
REM  - Creates a portable web server setup with SQLite support
REM ============================================================

set PHP_VERSION=8.4.13
set PHP_ZIP=php-%PHP_VERSION%-nts-Win32-vs17-x64.zip
set PHP_URL=https://windows.php.net/downloads/releases/%PHP_ZIP%
set TARGET_DIR=portable-php

REM === COLORS ===
for /f "tokens=2 delims==" %%a in ('"prompt $H & for %%b in (1) do rem"') do set "BS=%%a"
set "COL_GREEN=[92m"
set "COL_YELLOW=[93m"
set "COL_RED=[91m"
set "COL_RESET=[0m"

echo.
echo %COL_YELLOW%=== Checking Internet Connection... ===%COL_RESET%
ping -n 1 windows.php.net >nul 2>&1
if errorlevel 1 (
    echo %COL_RED%[ERROR] No internet connection detected.%COL_RESET%
    pause
    exit /b
)

REM === 1. Download PHP ZIP ===
echo.
echo %COL_YELLOW%Downloading PHP %PHP_VERSION%...%COL_RESET%
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Invoke-WebRequest -Uri '%PHP_URL%' -OutFile '%PHP_ZIP%' -UseBasicParsing"

if not exist "%PHP_ZIP%" (
    echo %COL_RED%[ERROR] Failed to download PHP ZIP.%COL_RESET%
    pause
    exit /b
)

REM === 2. Extract PHP ===
echo.
echo %COL_YELLOW%Extracting PHP to %TARGET_DIR%...%COL_RESET%
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$zip = Resolve-Path '%PHP_ZIP%'; $dest = Resolve-Path .; Expand-Archive -Force $zip ($dest.Path + '\%TARGET_DIR%')"

if %errorlevel% neq 0 (
    echo %COL_RED%[ERROR] Extraction failed.%COL_RESET%
    pause
    exit /b
)

REM === 3. Create folder structure ===
echo.
echo %COL_YELLOW%Setting up project folders...%COL_RESET%
mkdir "%TARGET_DIR%\htdocs" >nul 2>&1
mkdir "%TARGET_DIR%\data" >nul 2>&1

REM === 4. Create php.ini ===
echo.
echo %COL_YELLOW%Creating php.ini configuration...%COL_RESET%
(
    echo [PHP]
    echo extension_dir=ext
    echo extension=pdo_sqlite
    echo extension=sqlite3
    echo display_errors=On
    echo error_reporting=E_ALL
) > "%TARGET_DIR%\php.ini"

REM === 5. Create start-server.bat ===
echo.
echo %COL_YELLOW%Creating start-server.bat...%COL_RESET%
(
    echo @echo off
    echo cd /d %%~dp0
    echo echo Starting PHP server on http://localhost:8080 ...
    echo php -S localhost:8080 -t htdocs -c php.ini
    echo pause
) > "%TARGET_DIR%\start-server.bat"

REM === 6. Create example index.php ===
echo.
echo %COL_YELLOW%Creating example index.php...%COL_RESET%
(
    echo ^<?php
    echo echo "PHP Portable Server is running! SQLite version: " . sqlite3_libversion();
    echo ?^>
) > "%TARGET_DIR%\htdocs\index.php"

REM === 7. Cleanup ===
echo.
echo %COL_YELLOW%Cleaning up temporary files...%COL_RESET%
del "%PHP_ZIP%" >nul 2>&1

echo.
echo %COL_GREEN%=== Setup completed successfully! ===%COL_RESET%
echo.
echo Run %COL_YELLOW%start-server.bat%COL_RESET% inside %COL_GREEN%%TARGET_DIR%%COL_RESET% to start the server.
pause
exit /b
