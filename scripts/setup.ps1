# -----------------------------
# INVENTRA PROJECT STRUCTURE SETUP
# -----------------------------

Write-Host "Setting up production project structure..."

# Root folders
$folders = @(
"database",
"database/migrations",
"api",
"postman",
"docker",
"scripts",
".github",
".github/workflows"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

# -----------------------------
# Fix docs structure
# -----------------------------

New-Item -ItemType Directory -Force -Path "docs/diagrams" | Out-Null

if (Test-Path "diagrams") {
    Move-Item "diagrams/*" "docs/diagrams/" -Force
    Remove-Item "diagrams" -Recurse -Force
}

# -----------------------------
# Backend layered architecture
# -----------------------------

$backendPath = "backend/src/main/java/com/inventra/backend"

$backendFolders = @(
"$backendPath/controller",
"$backendPath/service",
"$backendPath/repository",
"$backendPath/model",
"$backendPath/dto",
"$backendPath/config",
"$backendPath/exception",
"$backendPath/util"
)

foreach ($folder in $backendFolders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

# -----------------------------
# Frontend improvements
# -----------------------------

if (Test-Path "frontend/src/component") {
    Rename-Item "frontend/src/component" "components"
}

$frontendFolders = @(
"frontend/src/services",
"frontend/src/hooks",
"frontend/src/utils",
"frontend/src/styles"
)

foreach ($folder in $frontendFolders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

# -----------------------------
# Database files
# -----------------------------

New-Item -ItemType File -Force -Path "database/schema.sql" | Out-Null
New-Item -ItemType File -Force -Path "database/seed.sql" | Out-Null

# -----------------------------
# API Spec
# -----------------------------

New-Item -ItemType File -Force -Path "api/openapi.yaml" | Out-Null

# -----------------------------
# Docker files
# -----------------------------

New-Item -ItemType File -Force -Path "docker/backend.Dockerfile" | Out-Null
New-Item -ItemType File -Force -Path "docker/frontend.Dockerfile" | Out-Null
New-Item -ItemType File -Force -Path "docker/docker-compose.yml" | Out-Null

# -----------------------------
# DevOps scripts
# -----------------------------

New-Item -ItemType File -Force -Path "scripts/build.sh" | Out-Null
New-Item -ItemType File -Force -Path "scripts/deploy.sh" | Out-Null

# -----------------------------
# CI/CD
# -----------------------------

New-Item -ItemType File -Force -Path ".github/workflows/ci.yml" | Out-Null

# -----------------------------
# Repo docs
# -----------------------------

New-Item -ItemType File -Force -Path "CONTRIBUTING.md" | Out-Null
New-Item -ItemType File -Force -Path "CHANGELOG.md" | Out-Null
New-Item -ItemType File -Force -Path "LICENSE" | Out-Null

Write-Host "Project structure successfully organized!"