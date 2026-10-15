$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
$env:PYTHONPATH = "services/api"
& "services/api/venv/Scripts/uvicorn.exe" app.main:app --host 0.0.0.0 --port 8000 --reload
