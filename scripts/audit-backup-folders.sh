#!/bin/bash
# audit-backup-folders.sh
# Collects comprehensive data for each folder in /volume3/backup/
# Output format: TSV (tab-separated) for easy parsing

BACKUP_DIR="/volume3/backup"

# Function to get file type sizes
get_file_types() {
    local folder="$1"

    # Movies (video files)
    movies=$(find "$folder" -type f \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.avi" -o -iname "*.mkv" -o -iname "*.wmv" -o -iname "*.m4v" -o -iname "*.flv" \) -exec du -cb {} + 2>/dev/null | tail -1 | cut -f1)
    movies=${movies:-0}

    # Pictures (image files)
    pictures=$(find "$folder" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.heic" -o -iname "*.bmp" -o -iname "*.tiff" -o -iname "*.tif" -o -iname "*.raw" \) -exec du -cb {} + 2>/dev/null | tail -1 | cut -f1)
    pictures=${pictures:-0}

    # Documents (office/text files)
    documents=$(find "$folder" -type f \( -iname "*.doc" -o -iname "*.docx" -o -iname "*.pdf" -o -iname "*.xls" -o -iname "*.xlsx" -o -iname "*.ppt" -o -iname "*.pptx" -o -iname "*.txt" -o -iname "*.rtf" -o -iname "*.odt" -o -iname "*.ods" \) -exec du -cb {} + 2>/dev/null | tail -1 | cut -f1)
    documents=${documents:-0}

    echo "$movies|$pictures|$documents"
}

# Function to format bytes to human readable
human_readable() {
    local bytes=$1
    if [ "$bytes" -ge 1099511627776 ]; then
        echo "$(echo "scale=1; $bytes/1099511627776" | bc)T"
    elif [ "$bytes" -ge 1073741824 ]; then
        echo "$(echo "scale=1; $bytes/1073741824" | bc)G"
    elif [ "$bytes" -ge 1048576 ]; then
        echo "$(echo "scale=1; $bytes/1048576" | bc)M"
    elif [ "$bytes" -ge 1024 ]; then
        echo "$(echo "scale=1; $bytes/1024" | bc)K"
    else
        echo "${bytes}B"
    fi
}

# Header
echo -e "Folder\tSize\tEarliest\tLatest\tMovies\tPictures\tDocuments"

# Process each folder (or specific folders if provided as arguments)
if [ $# -gt 0 ]; then
    folders="$@"
else
    folders=$(ls -1 "$BACKUP_DIR" | grep -v "^@" | grep -v "^#")
fi

for folder in $folders; do
    full_path="$BACKUP_DIR/$folder"

    # Skip if not a directory
    [ ! -d "$full_path" ] && continue

    # Get size
    size=$(du -sh "$full_path" 2>/dev/null | cut -f1)

    # Get earliest and latest file dates
    dates=$(find "$full_path" -type f -printf "%T+\n" 2>/dev/null | sort)
    earliest=$(echo "$dates" | head -1 | cut -d'+' -f1)
    latest=$(echo "$dates" | tail -1 | cut -d'+' -f1)

    # Get file type breakdown
    types=$(get_file_types "$full_path")
    movies_bytes=$(echo "$types" | cut -d'|' -f1)
    pictures_bytes=$(echo "$types" | cut -d'|' -f2)
    documents_bytes=$(echo "$types" | cut -d'|' -f3)

    movies_hr=$(human_readable "$movies_bytes")
    pictures_hr=$(human_readable "$pictures_bytes")
    documents_hr=$(human_readable "$documents_bytes")

    # Output
    echo -e "$folder\t$size\t$earliest\t$latest\t$movies_hr\t$pictures_hr\t$documents_hr"
done
