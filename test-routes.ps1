#!/usr/bin/env pwsh

# Test various routes by making requests to the dev server
$baseUrl = "http://localhost:3000"
$routes = @("/", "/properties", "/inventory", "/login", "/admin", "/work-orders")

Write-Host "Testing Next.js app routes..." -ForegroundColor Cyan

foreach ($route in $routes) {
    try {
        $url = "$baseUrl$route"
        $request = [System.Net.HttpWebRequest]::Create($url)
        $request.Timeout = 5000
        $response = $request.GetResponse()
        $statusCode = $response.StatusCode
        $response.Close()
        
        if ($statusCode -eq 200) {
            Write-Host "✓ $route - OK (200)" -ForegroundColor Green
        } else {
            Write-Host "✗ $route - Status $statusCode" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "✗ $route - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Route testing complete." -ForegroundColor Cyan
