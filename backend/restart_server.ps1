# Force restart the backend server
Write-Host "Stopping any running servers..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.Path -and (Get-Content $_.Path -ErrorAction SilentlyContinue | Select-String "uvicorn")} | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "`nStarting fresh server..." -ForegroundColor Green
python -m uvicorn main:app --reload


