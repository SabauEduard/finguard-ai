#!/bin/bash

# Script pentru screenshot full-page cu Chrome
# Calculează înălțimea automată

html_file="$1"
output_file="$2"
width="${3:-1400}"

if [ -z "$html_file" ] || [ -z "$output_file" ]; then
    echo "Usage: $0 <html_file> <output_file> [width]"
    exit 1
fi

# Convertește la path absolut
html_path="file://$(cd "$(dirname "$html_file")" && pwd)/$(basename "$html_file")"

echo "📸 Generating full-page screenshot..."
echo "   Source: $html_file"
echo "   Output: $output_file"
echo "   Width: ${width}px"

# Folosim AppleScript pentru a deschide în Chrome și face screenshot
# sau folosim Chrome headless cu dimensiune mare
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless \
  --disable-gpu \
  --screenshot="$output_file" \
  --window-size=${width},10000 \
  --virtual-time-budget=10000 \
  --hide-scrollbars \
  "$html_path" 2>&1 | grep "bytes written"

if [ -f "$output_file" ]; then
    size=$(ls -lh "$output_file" | awk '{print $5}')
    dimensions=$(file "$output_file" | grep -o '[0-9]* x [0-9]*')
    echo "✓ Screenshot generated: $size ($dimensions)"
    open "$output_file"
else
    echo "✗ Failed to generate screenshot"
    exit 1
fi
