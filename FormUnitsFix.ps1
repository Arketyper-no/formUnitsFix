param(
    [string]$zipFileName
)

# Check if the zip file exists
if (-not (Test-Path $zipFileName -PathType Leaf)) {
    Write-Host "Error: Zip file not found."
    exit 1
}

# Create a temporary directory to extract the contents of the zip file
$tempDir = Join-Path $env:TEMP "TempZipFolder"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Extract the contents of the zip file
Write-Host "Extracting files from $zipFileName..."
Expand-Archive -Path $zipFileName -DestinationPath $tempDir -Force

# Path to the JSON file within the extracted contents
$jsonFilePath = Join-Path $tempDir "path/to/your/file.json"

# Load the JSON lookup table
$lookupTable = Get-Content -Path "path/to/your/lookupTable.json" | ConvertFrom-Json

$matchRegex = '{"suffix":"unit","type":"CODED_TEXT","list":\[{"value":"(.+)","label":"\1"'

# Modify the content of the JSON file using a regex pattern and lookup table
(Get-Content -Path $jsonFilePath) | ForEach-Object {
    $_ -replace $matchRegex, { $lookupTable[$matches[1]] }
} | Set-Content -Path $jsonFilePath

# Re-zip the modified contents
$newZipFileName = [System.IO.Path]::ChangeExtension($zipFileName, "modified.zip")
Write-Host "Creating modified zip file: $newZipFileName..."
Compress-Archive -Path $tempDir\* -DestinationPath $newZipFileName -Force

# Remove the temporary directory
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Modification completed successfully. Modified files are in $newZipFileName."
