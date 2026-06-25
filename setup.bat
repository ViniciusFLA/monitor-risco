@echo off
chcp 65001 >nul
cls
echo.
echo ╔══════════════════════════════════════════════╗
echo ║  MONITOR DE RISCO - Configuracao Inicial     ║
echo ╚══════════════════════════════════════════════╝
echo.
echo Configurando o ambiente pela primeira vez...
echo.

echo [1/2] Instalando dependencias (pode demorar 2 min)...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ERRO: Falha ao instalar dependencias.
    echo  Verifique se o Node.js esta instalado:
    echo  https://nodejs.org (baixe a versao LTS)
    echo.
    pause
    exit /b 1
)
echo.

echo [2/2] Login no Vercel...
echo Uma janela do navegador vai abrir.
echo Escolha "Continue with GitHub" e faca login.
echo.
call npx vercel login
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ERRO: Falha no login do Vercel.
    echo  Verifique se voce foi adicionado ao time.
    echo.
    pause
    exit /b 1
)
echo.

echo ╔══════════════════════════════════════════════╗
echo ║  PRONTO!                                    ║
echo ║                                            ║
echo ║  Agora execute update.bat para atualizar   ║
echo ║  os dados e publicar no site.              ║
echo ║                                            ║
echo ║  https://monitor-risco.vercel.app          ║
echo ╚══════════════════════════════════════════════╝
echo.
pause
