# EduPortal Backend Startup Script
# Loads .env file and starts Spring Boot

$envFile = Join-Path $PSScriptRoot ".env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
        }
    }
    Write-Host "✅ Loaded .env" -ForegroundColor Green
} else {
    Write-Host "⚠️  No .env file found — using defaults from application.yml" -ForegroundColor Yellow
}

Write-Host "🚀 Starting EduPortal backend on http://localhost:8080 ..." -ForegroundColor Cyan

java -cp ".\.mvn\wrapper\maven-wrapper.jar" "-Dmaven.multiModuleProjectDirectory=." org.apache.maven.wrapper.MavenWrapperMain spring-boot:run "-Dspring-boot.run.profiles=dev"
