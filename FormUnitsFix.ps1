$useOpt = $false

# Check if $args[0] is empty
if (-not $args) {
    Write-Host "Usage: .\formUnitsFix.ps1 `"form file.zip`" [`"operational template.opt`"]"
    exit
} elseif (-not $args[1]) {
    Write-Host "No operational template given as argument. Continuing using only units.json as reference."
} else {
    Write-Host "Using both the operational template and units.json for reference. In case of conflicts, the opt is preferred."
    $useOpt = $true
}

$formZipPath = $args[0]
$testFlag = $args[2]

$unitsFilePath = Join-Path $PSScriptRoot "units.json"

# Check if the form file exists
if (-not (Test-Path $formZipPath -PathType Leaf)) {
    Write-Host "Error: File '$formZipPath' not found."
    exit 1
}

# Check if the form file has a .zip extension
if (-not ($formZipPath -match '\.zip$')) {
    Write-Host "Error: The forms file must have a .zip extension."
    exit 1
}

# Check if units file exists
if (-not (Test-Path -Path $unitsFilePath -PathType Leaf)) {
    Write-Host "Error: The file $unitsFilePath does not exist."
    exit 1
}

# Initialize the units dictionary
$units = @()

# Check if the opt file exists, and load units from it if it does
if ($useOpt) {
    $optFilePath = $args[1]
    if (-not (Test-Path $optFilePath -PathType Leaf)) {
        Write-Host "Error: File '$optFilePath' not found."
        exit 1
    }

    $optContent = Get-Content -Raw -Path $optFilePath -encoding "UTF8"

    # Check if units were loaded successfully
    if (-not $optContent) {
        Write-Host "Error: Failed to load OPT file"
        exit 1
    } else {
        Write-Host "Successfully loaded OPT file"
    }

    # Define the regex pattern for matching
    $optRegexPattern = '<term_definitions code="(?:(?!at\d{4}\b)(?!::))(.*)">\n?[ \t]*<items id="text">(.+)<\/items>\n?[ \t]*<items id="description">(.+)<\/items>\n?[ \t]*<\/term_definitions>'

    # Find matches in $optContent using regex
    $optRegexMatches = [regex]::Matches($optContent, $optRegexPattern)

    foreach ($match in $optRegexMatches) {

        $unitEntry = New-Object PSObject -Property @{
            'value'  = $match.Groups[1].Value
            'label'  = $match.Groups[2].Value
        }

        # Check if a similar unit already exists in $units (based on both value and label)
        $overlap = $units | Where-Object { $_.value -eq $unitEntry.value -and $_.label -eq $unitEntry.label }

        if (-not $overlap) {
            $units += $unitEntry
        }
    }
}


# Load the units file as a dictionary
$unitsFileContent = Get-Content -Raw -Path $unitsFilePath -encoding "UTF8" | ConvertFrom-Json

# Check if units were loaded successfully
if (-not $unitsFileContent) {
    Write-Host "Error: Failed to load units.json."
    exit 1
} else {
    Write-Host "Successfully loaded units.json"
}

# For non-overlapping units, add units from units.json to $units
foreach ($newUnit in $unitsFileContent) {
    $overlap = $units | Where-Object { $_.value -eq $newUnit.value }

    if (-not $overlap) {
        $units += $newUnit
    }
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
foreach ($match in $regexMatches | Get-Unique) {

    # Extract captured values from the regex match
    $value = $match.Groups[1].Value
    $label = $match.Groups[2].Value

    # Check if the value or label exists in $units
    $unitMatch = $units | Where-Object { ($_.value -eq $value -or $_.label -eq $label) -or ($_.label -eq $value -or $_.value -eq $label) }

    if ($unitMatch) {
        # Replace the match in $formDescription
        $replacement = "{`"suffix`":`"unit`",`"type`":`"CODED_TEXT`",`"list`":[{`"value`":`"$($unitMatch.value)`",`"label`":`"$($unitMatch.label)`""
        $formDescription = $formDescription -replace [regex]::Escape($match.Value), $replacement

        # Output a message indicating a match and replacement
        Write-Host "Match found: Label: $label - Value: $value. Replaced with: Label: $($unitMatch.label) - Value: $($unitMatch.value)"
        $matchesFound = $true
    } else {
        Write-Host "Match found: Label: $label - Value: $value - Not matching any units from OPT or units.json, no action."
    }

}

if (-not $testFlag -eq "test") {

    # Check if no matches were found
    if (-not $matchesFound) {
        Write-Host "No matches found with units.json. Cleaning up temporary files and exiting script."
        # Remove the temporary directory
        Remove-Item -Path $tempDir -Recurse -Force
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

} else {
    Write-Host "Test run complete. No changes made to files. Removing temporary files and exiting."
    # Remove the temporary directory
    Remove-Item -Path $tempDir -Recurse -Force
}