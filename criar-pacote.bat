@echo off
chcp 65001 >nul
echo Criando pacote para distribuicao...
echo.

set OUT=monitor-risco-pacote.zip

if exist %OUT% del %OUT%

powershell -Command "Compress-Archive -Path @(
  'package.json','package-lock.json','tsconfig.json','next.config.ts',
  'postcss.config.mjs','eslint.config.mjs','components.json',
  'playwright.config.ts','discover-schema.mjs',
  'public','src','scripts','tests',
  'setup.bat','update.bat','LEIA-ME.txt','.env.local','.vercel'
) -DestinationPath '%OUT%' -Force"

echo.
echo Pacote criado: %OUT%
echo.
echo ╔══════════════════════════════════════════════╗
echo ║  ANTES DE ENVIAR:                           ║
echo ║  1. Adicione o amigo ao time do Vercel:     ║
echo ║     vercel.com/viniciusflas-projects         ║
echo ║     Settings -%OUT% Members                       ║
echo ║  2. Envie %OUT% para ele                    ║
echo ║  3. Ele extrai e roda setup.bat             ║
echo ╚══════════════════════════════════════════════╝
pause
