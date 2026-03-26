#!/usr/bin/env pwsh

# Wait a moment for connections to close
Start-Sleep -Seconds 2

# Try multiple methods to terminate the process
try {
    Write-Host "Attempting to terminate process 24796..."
    
    # Method 1: Try Stop-Process
    Stop-Process -Id 24796 -Force -ErrorAction Continue
    Start-Sleep -Seconds 1
}
catch {
    Write-Host ("Caught exception: " + $_.Exception.Message)
}

# Method 2: Try killing via PowerShell job/background
try {
    # Use Get-Process and pipe to a function
    Get-Process -Id 24796 | ForEach-Object { $_.CloseMainWindow() } | Out-Null
    Start-Sleep -Seconds 1
}
catch {  
    Write-Host ("Caught exception: " + $_.Exception.Message)
}

# Check if process still exists
$proc = Get-Process -Id 24796 -ErrorAction SilentlyContinue
if ($proc) {
    Write-Host "Process 24796 still running"
} else {
    Write-Host "Process 24796 successfully terminated"
}
