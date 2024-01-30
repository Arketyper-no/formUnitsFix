# Check if $args[0] is empty
if (-not $args) {
    Write-Error "Error: Please provide a filename as a command-line argument."
    exit
}

$formZipPath = $args[0]

$unitsFilePath = Join-Path $PSScriptRoot "units.json"

# Define file paths
#$unitsFilePath = "units.json"

# Check if the file exists
if (-not (Test-Path $formZipPath -PathType Leaf)) {
    Write-Host "Error: File '$formZipPath' not found."
    exit 1
}

# Check if the file has a .zip extension
if (-not ($formZipPath -match '\.zip$')) {
    Write-Host "Error: The file must have a .zip extension."
    exit 1
}

# Check if units file exists
if (-not (Test-Path -Path $unitsFilePath -PathType Leaf)) {
    Write-Host "Error: The file $unitsFilePath does not exist."
    exit 1
}

# Load the units file as a dictionary
$units = Get-Content -Raw -Path $unitsFilePath -encoding "UTF8" | ConvertFrom-Json

# Check if units were loaded successfully
if (-not $units) {
    Write-Host "Error: Failed to load units.json."
    exit 1
} else {
    Write-Host "Successfully loaded units.json"
}

# Create a temporary directory to extract the contents of the zip file
$tempDir = Join-Path $env:TEMP "TempZipFolder"
# Check if the temporary directory exists
if ((Test-Path $tempDir)) {
    # If it exists, remove it
    Remove-Item -Path $tempDir -Recurse -Force
}

# Create the new temp directory
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Extract the contents of the zip file
Expand-Archive -Path $formZipPath -DestinationPath $tempDir -Force | Out-Null

# Finding the directory name in the temp folder
# Remove the file extension
$filenameWithoutExtension = (Get-Item $formZipPath).BaseName

# Replace non-alphanumeric characters with underscores
$directoryName = $filenameWithoutExtension -replace '[^a-zA-Z0-9]', '_'

# Path to the JSON file within the extracted contents
$formDescriptionPath = Join-Path $tempDir "$directoryName/form_description.json"

# Check if form_description file exists
if (-not (Test-Path -Path $formDescriptionPath -PathType Leaf)) {
    Write-Host "Error: The file $formDescriptionPath does not exist."
    exit 1
}

# Load the form description file as a string
$formDescription = Get-Content -Raw -Path $formDescriptionPath -Encoding "UTF8"

# Check if the content has more than one line
if (($formDescription -split "`n" | Measure-Object -Line).Lines -gt 1) {
    Write-Host "Error: The form description file must be a single-line file. Exiting."
    exit
}

# Check if form_description was loaded successfully
if (-not $formDescription) {
    Write-Host "Error: Failed to load $formDescriptionPath as a string."
    exit 1
} else {
    Write-Host "Successfully loaded form_description.json"
}

# Define the regex pattern for matching
$regexPattern = '\{"suffix":"unit","type":"CODED_TEXT","list":\[\{"value":"(.+)","label":"(\1)"'

# Find matches in $formDescription using regex
$regexMatches = [regex]::Matches($formDescription, $regexPattern)

# Check if there are any matches
if ($regexMatches.Count -eq 0) {
    Write-Host "No matches found in form description. Cleaning up temporary files and exiting script."
    Remove-Item -Path $tempDir -Recurse -Force
    exit
}

# Flag to check if any unit matches were found
$matchesFound = $false

# Iterate through each match
foreach ($match in $regexMatches) {

    # Extract captured values from the regex match
    $value = $match.Groups[1].Value
    $label = $match.Groups[2].Value

    # Check if the value or label exists in $units
    $unitMatch = $units | Where-Object { ($_.value -contains $value -or $_.label -contains $label) -or ($_.label -contains $value -or $_.value -contains $label) }

    if ($unitMatch) {
        # Replace the match in $formDescription
        $replacement = '{"suffix":"unit","type":"CODED_TEXT","list":[{"value":"'+$unitMatch.value+'","label":"'+$unitMatch.label+'"}]'
        $formDescription = $formDescription -replace [regex]::Escape($match.Value), $replacement

        # Output a message indicating a match and replacement
        Write-Host "Match found: Label: $label - Value: $value. Replaced with: Label: $($unitMatch.label) - Value: $($unitMatch.value)"
        $matchesFound = $true
    } else {
        Write-Host "Match found: Label: $label - Value: $value - No match in units.json, no action."
    }
}

# Check if no matches were found
if (-not $matchesFound) {
    Write-Host "No matches found with units.json. Cleaning up temporary files and exiting script."
    exit
}

# Check if the .bak file already exists
$backupFilePath = "$formZipPath.bak"
$counter = 1

while (Test-Path $backupFilePath) {
    $backupFilePath = "{0}.{1}.bak" -f $formZipPath, $counter
    $counter++
}

# Move the original file to the backup file path
Move-Item $formZipPath $backupFilePath
Write-Host "Original form file backed up as $backupFilePath"

$formDescription | Set-Content -Path $formDescriptionPath -encoding "UTF8"
Write-Host "Modified content written to form_descrition.json"

# Re-zip the modified contents
Write-Host "Rezipping modified form definitions"
Compress-Archive -Path $tempDir\* -DestinationPath $formZipPath -Force

# Remove the temporary directory
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Script completed. Updated form description saved to $formZipPath"
