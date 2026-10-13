# Publish n8n Agency Automation master workflow
# Run after importing workflows: powershell -File scripts/n8n-publish.ps1

$env:N8N_ENCRYPTION_KEY = if ($env:N8N_ENCRYPTION_KEY) { $env:N8N_ENCRYPTION_KEY } else { "nexus-n8n-encryption-key-dev" }

$workflowId = sqlite3 "$env:USERPROFILE\.n8n\database.sqlite" "SELECT id FROM workflow_entity WHERE name LIKE '%Master Router%' LIMIT 1;"

if (-not $workflowId) {
  Write-Host "Master Router workflow not found. Import n8n/workflows/01-master-router.json first." -ForegroundColor Red
  exit 1
}

Write-Host "Publishing workflow: $workflowId"
npx n8n publish:workflow --id=$workflowId

Write-Host ""
Write-Host "Restart n8n if it is already running (required for webhook to register):" -ForegroundColor Yellow
Write-Host "  1. Stop the n8n terminal (Ctrl+C)"
Write-Host "  2. npx n8n start"
Write-Host ""
Write-Host "Webhook URL: http://localhost:5678/webhook/agency-automation" -ForegroundColor Green
