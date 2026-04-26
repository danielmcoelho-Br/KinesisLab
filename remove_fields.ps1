$path = "src/data/questionnaires.ts"
$content = Get-Content $path
# Using line numbers is safer if there are encoding issues with matching strings
# Line 2229 corresponds to index 2228, line 2230 to index 2229
$newContent = $content[0..2227] + $content[2230..($content.Count-1)]
Set-Content $path $newContent -Encoding UTF8
