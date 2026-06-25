@echo off
chcp 65001 >nul
cls
echo.
echo ╔══════════════════════════════════════════════╗
echo ║     MONITOR DE RISCO - Atualizador           ║
echo ╚══════════════════════════════════════════════╝
echo.
echo   [1] Exportar dados do Azure SQL
echo   [2] Publicar no Vercel
echo.
echo   Certifique-se de estar na rede do escritorio.
echo.

echo ==============================================
echo ETAPA 1/2: Exportando dados do Azure SQL...
echo ==============================================
node scripts\export-data.mjs
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ERRO: Falha ao conectar no Azure SQL.
    echo  Verifique:
    echo    - Esta na rede do escritorio?
    echo    - IP liberado no firewall do Azure?
    echo.
    pause
    exit /b 1
)
echo.

echo ==============================================
echo ETAPA 2/2: Deploy no Vercel...
echo ==============================================
call npx vercel --prod --yes
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ERRO: Falha no deploy.
    echo  Execute setup.bat primeiro para configurar o Vercel.
    echo.
    pause
    exit /b 1
)
echo.

echo ╔══════════════════════════════════════════════╗
echo ║  PRONTO! Dados atualizados com sucesso.     ║
echo ║  https://monitor-risco.vercel.app           ║
echo ╚══════════════════════════════════════════════╝
echo.
pause
