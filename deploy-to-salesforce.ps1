# Quick Deployment Script for Salesforce LWC

Write-Host "🚀 HR Agent Bot - Salesforce LWC Deployment Helper" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Salesforce CLI is installed
$sfdxInstalled = Get-Command sfdx -ErrorAction SilentlyContinue

if (-not $sfdxInstalled) {
    Write-Host "❌ Salesforce CLI (sfdx) is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Salesforce CLI first:" -ForegroundColor Yellow
    Write-Host "  npm install -g @salesforce/cli" -ForegroundColor White
    Write-Host ""
    Write-Host "Or download from: https://developer.salesforce.com/tools/sfdxcli" -ForegroundColor White
    exit 1
}

Write-Host "✅ Salesforce CLI detected" -ForegroundColor Green
Write-Host ""

# Navigate to LWC directory
$lwcPath = Join-Path $PSScriptRoot "salesforce-lwc"
if (-not (Test-Path $lwcPath)) {
    Write-Host "❌ LWC directory not found at: $lwcPath" -ForegroundColor Red
    exit 1
}

Set-Location $lwcPath
Write-Host "📁 Working directory: $lwcPath" -ForegroundColor Cyan
Write-Host ""

# Show deployment options
Write-Host "Choose deployment method:" -ForegroundColor Yellow
Write-Host "  1. Deploy to authenticated org (recommended)" -ForegroundColor White
Write-Host "  2. Authenticate with new org first" -ForegroundColor White
Write-Host "  3. Show deployment instructions only" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔄 Deploying to Salesforce..." -ForegroundColor Cyan
        sfdx force:source:deploy -p . --json
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Deployment successful!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Yellow
            Write-Host "  1. Configure Remote Site Settings in Salesforce" -ForegroundColor White
            Write-Host "     Setup - Security - Remote Site Settings" -ForegroundColor Gray
            Write-Host "     Add: https://deploy-hr-agent-bot-1.onrender.com" -ForegroundColor Gray
            Write-Host ""
            Write-Host "  2. Add component to your Lightning page" -ForegroundColor White
            Write-Host "     Setup - Lightning App Builder" -ForegroundColor Gray
            Write-Host "     Find HR Agent Bot in custom components" -ForegroundColor Gray
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "❌ Deployment failed!" -ForegroundColor Red
            Write-Host "Please check the error messages above." -ForegroundColor Yellow
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "🔐 Authenticating with Salesforce..." -ForegroundColor Cyan
        Write-Host "A browser window will open for authentication." -ForegroundColor Yellow
        Write-Host ""
        
        $orgAlias = Read-Host "Enter an alias for this org (e.g., WinfomiOrg)"
        sfdx auth:web:login -a $orgAlias
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Authentication successful!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Now deploying..." -ForegroundColor Cyan
            sfdx force:source:deploy -p . -u $orgAlias --json
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Deployment successful!" -ForegroundColor Green
            }
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "📋 Manual Deployment Instructions" -ForegroundColor Cyan
        Write-Host "==================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Option A: Using Salesforce CLI" -ForegroundColor Yellow
        Write-Host "  1. Authenticate: sfdx auth:web:login -a WinfomiOrg" -ForegroundColor White
        Write-Host "  2. Deploy: sfdx force:source:deploy -p . -u WinfomiOrg" -ForegroundColor White
        Write-Host ""
        Write-Host "Option B: Using VS Code" -ForegroundColor Yellow
        Write-Host "  1. Install Salesforce Extension Pack" -ForegroundColor White
        Write-Host "  2. Right-click salesforce-lwc folder" -ForegroundColor White
        Write-Host "  3. Select SFDX: Deploy Source to Org" -ForegroundColor White
        Write-Host ""
        Write-Host "Option C: Manual Upload" -ForegroundColor Yellow
        Write-Host "  1. Open Developer Console in Salesforce" -ForegroundColor White
        Write-Host "  2. File - New - Lightning Component" -ForegroundColor White
        Write-Host "  3. Copy each file content manually" -ForegroundColor White
        Write-Host ""
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📚 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   - SALESFORCE_INTEGRATION.md" -ForegroundColor White
Write-Host "   - salesforce-lwc/README.md" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Bot URL: https://deploy-hr-agent-bot-1.onrender.com" -ForegroundColor Green
Write-Host ""
