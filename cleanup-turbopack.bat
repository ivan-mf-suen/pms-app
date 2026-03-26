REM Delete Turbopack cache safely
cd /d C:\Users\ivan.mf.suen\Documents\Project\PMS\pms-app

REM Try to delete with del command
echo Deleting Turbopack cache...
if exist ".next\dev\cache\turbopack" (
    for /d /r ".next\dev\cache\turbopack" %%X in (*) do (
        del /s /q "%%X\*.*" 2>nul
        rmdir "%%X" 2>nul
    )
    del /s /q ".next\dev\cache\turbopack\*.*" 2>nul
    rmdir /s /q ".next\dev\cache\turbopack" 2>nul
    echo Turbopack cache deleted
) else (
    echo Turbopack cache not found
)

echo Done
pause
