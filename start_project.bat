@echo off
echo ==========================================
echo Starting ConnectiFy Project...
echo ==========================================

echo Checking if Docker is running...
docker info >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Docker is not running. Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Waiting for Docker to initialize...
    :WAIT_LOOP
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    IF %ERRORLEVEL% NEQ 0 GOTO WAIT_LOOP
    echo Docker started successfully.
)

echo [1/3] Starting Redis Container...
docker start redis-server
IF %ERRORLEVEL% NEQ 0 (
    echo Redis container 'redis-server' not found or failed to start.
    echo attempting to run a new one...
    docker run -d --name redis-server -p 6379:6379 redis
)

timeout /t 2 /nobreak >nul

echo [2/3] Starting Backend Server...
start "ConnectiFy Server" cmd /k "cd Server && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Frontend Client...
start "ConnectiFy Client" cmd /k "cd Client && npm run dev"

echo ==========================================
echo All services are launching in new windows.
echo ==========================================
pause