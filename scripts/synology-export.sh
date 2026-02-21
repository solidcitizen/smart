#!/bin/bash
# synology-export.sh - Export Synology DSM configuration for version control
# Run locally: ./scripts/synology-export.sh
# Output: docs/synology-config.md (auto-generated)

set -e

SSH_CMD="ssh mike@10.1.11.98 -p 2222"
OUTPUT_DIR="$(dirname "$0")/../docs"
OUTPUT_FILE="$OUTPUT_DIR/synology-config.md"

mkdir -p "$OUTPUT_DIR"

echo "Exporting Synology configuration..."

cat > "$OUTPUT_FILE" << 'HEADER'
# Synology DSM Configuration Export

> **Auto-generated** by `scripts/synology-export.sh`
> Do not edit manually — changes will be overwritten
> Last updated: TIMESTAMP

HEADER

# Replace timestamp
sed -i.bak "s/TIMESTAMP/$(date '+%Y-%m-%d %H:%M:%S')/" "$OUTPUT_FILE" && rm -f "$OUTPUT_FILE.bak"

# System Info
echo "## System Info" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
$SSH_CMD "cat /etc.defaults/VERSION; echo; hostname; echo; uname -a" >> "$OUTPUT_FILE" 2>/dev/null
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Installed Packages
echo "## Installed Packages" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
$SSH_CMD "/usr/syno/bin/synopkg list --name" >> "$OUTPUT_FILE" 2>/dev/null
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Volume Status
echo "## Volume Status" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
$SSH_CMD "df -h | grep volume" >> "$OUTPUT_FILE" 2>/dev/null
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Scheduled Tasks (crontab)
echo "## Scheduled Tasks (crontab)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
$SSH_CMD "cat /etc/crontab | grep -v '^#' | grep -v '^$' | grep -v '^MAILTO' | grep -v '^PATH'" >> "$OUTPUT_FILE" 2>/dev/null
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Docker Containers
echo "## Docker Containers" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
$SSH_CMD "/var/packages/ContainerManager/target/usr/bin/docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'" >> "$OUTPUT_FILE" 2>/dev/null
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Docker Images (top 10 by size)
echo "## Docker Images (top 10 by size)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
$SSH_CMD "/var/packages/ContainerManager/target/usr/bin/docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}' | head -11" >> "$OUTPUT_FILE" 2>/dev/null
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Reverse Proxy (if accessible)
echo "## Reverse Proxy Rules" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "*Note: Reverse proxy config requires DSM UI export or manual documentation.*" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "| Source | Destination | WebSocket |" >> "$OUTPUT_FILE"
echo "|--------|-------------|-----------|" >> "$OUTPUT_FILE"
echo "| https://ha.conant.com | http://localhost:8123 | Enabled |" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Network Info
echo "## Network" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
$SSH_CMD "ip addr show eth0 | grep 'inet ' | awk '{print \$2}'" >> "$OUTPUT_FILE" 2>/dev/null
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Shared Folders
echo "## Shared Folders" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
$SSH_CMD "ls -la /volume1 /volume2 /volume3 2>/dev/null | grep -E '^d' | grep -v '@' | head -20" >> "$OUTPUT_FILE" 2>/dev/null
echo '```' >> "$OUTPUT_FILE"

echo "Export complete: $OUTPUT_FILE"
