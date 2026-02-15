#!/bin/bash
# Daily battery logger for SmartThings locks
# Logs battery levels to CSV for tracking drain over time

LOG_FILE="$HOME/projects/smart/logs/battery-history.csv"
mkdir -p "$(dirname "$LOG_FILE")"

# Create header if file doesn't exist
if [ ! -f "$LOG_FILE" ]; then
    echo "timestamp,device_label,device_id,battery_pct,security,provisioning" > "$LOG_FILE"
fi

# Function to log a device
log_device() {
    local DEVICE_ID="$1"

    # Get device info
    local INFO=$(smartthings devices "$DEVICE_ID" -j 2>/dev/null)
    local STATUS=$(smartthings devices:status "$DEVICE_ID" -j 2>/dev/null)

    if [ -z "$INFO" ]; then
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ),ERROR,${DEVICE_ID},,,Failed to fetch" >> "$LOG_FILE"
        return
    fi

    local LABEL=$(echo "$INFO" | jq -r '.label // "unknown"')
    local SECURITY=$(echo "$INFO" | jq -r '.zwave.networkSecurityLevel // "unknown"')
    local PROV=$(echo "$INFO" | jq -r '.zwave.provisioningState // "unknown"')
    local BATTERY=$(echo "$STATUS" | jq -r '.components.main.battery.battery.value // "null"')

    local TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

    echo "${TIMESTAMP},${LABEL},${DEVICE_ID},${BATTERY},${SECURITY},${PROV}" >> "$LOG_FILE"
    echo "Logged: $LABEL - Battery: ${BATTERY}%"
}

echo "=== SmartThings Battery Logger ==="
echo "Date: $(date)"
echo ""

# Log both locks
log_device "946ebd78-beb2-4973-869e-ec00c4155c48"  # Front door
log_device "b0501125-5eb8-4060-851f-9d59fd38d664"  # Utility door

echo ""
echo "Log file: $LOG_FILE"
