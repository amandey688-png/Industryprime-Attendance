# Run backend pytest from repo root.
# Usage (from C:\HRIS-APP): .\scripts\run-backend-tests.ps1
# Uses backend\.venv if present; otherwise python on PATH.

$ErrorActionPreference = "Stop"
$backend = (Resolve-Path (Join-Path $PSScriptRoot "..\backend")).Path
Set-Location $backend

$env:JWT_SECRET = "ci-test-jwt-secret-minimum-32-characters-long"
$env:ALLOW_LOCAL_AUTH_FALLBACK = "1"

$venvPy = Join-Path $backend ".venv\Scripts\python.exe"
if (Test-Path $venvPy) {
    & $venvPy -m pip install -q -r requirements.txt -r requirements-dev.txt
    & $venvPy -m pytest tests/ -v --cov=. --cov-config=.coveragerc --cov-report=term-missing
} else {
    Write-Host "No backend\.venv - using python on PATH. Tip: cd backend; python -m venv .venv" -ForegroundColor Yellow
    python -m pip install -q -r requirements.txt -r requirements-dev.txt
    python -m pytest tests/ -v --cov=. --cov-config=.coveragerc --cov-report=term-missing
}
