$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
& "services/api/venv/Scripts/python.exe" services/api/app/scripts/seed.py
