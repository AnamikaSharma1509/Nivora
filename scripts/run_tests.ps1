$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "Running Backend Pytest Suite..." -ForegroundColor Cyan
& "services/api/venv/Scripts/pytest.exe" services/api/tests/test_api.py -v

Write-Host "`nRunning Frontend Next.js Typecheck & Build..." -ForegroundColor Cyan
Set-Location "apps/web"
npm run build
Set-Location "../.."
