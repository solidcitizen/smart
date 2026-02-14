#!/bin/bash
# SmartThings Lock Health Monitor
# Usage: ./monitor-lock.sh [device-id]
# Default: Front Door lock

FRONT_DOOR_ID="39cba0dc-cfca-4fb9-a1c5-d384e33c1acd"
UTILITY_DOOR_ID="b0501125-5eb8-4060-851f-9d59fd38d664"

DEVICE_ID="${1:-$FRONT_DOOR_ID}"
LOG_DIR="$HOME/projects/smart/logs"
LOG_FILE="$LOG_DIR/lock-health-$(date +%Y%m%d).json"

mkdir -p "$LOG_DIR"

echo "============================================"
echo "SmartThings Lock Health Monitor"
echo "Date: $(date)"
echo "Device: $DEVICE_ID"
echo "============================================"
echo

# Get device info
echo "=== Device Info ==="
DEVICE_INFO=$(smartthings devices "$DEVICE_ID" -j 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "Error: Could not fetch device info. Are you authenticated?"
    exit 1
fi

LABEL=$(echo "$DEVICE_INFO" | jq -r '.label')
SECURITY=$(echo "$DEVICE_INFO" | jq -r '.zwave.networkSecurityLevel')
PROV_STATE=$(echo "$DEVICE_INFO" | jq -r '.zwave.provisioningState')

echo "Label: $LABEL"
echo "Security: $SECURITY"
echo "Provisioning: $PROV_STATE"
echo

# Get current status
echo "=== Current Status ==="
STATUS=$(smartthings devices:status "$DEVICE_ID" -j 2>/dev/null)
BATTERY=$(echo "$STATUS" | jq -r '.components.main.battery.battery.value')
BATTERY_TS=$(echo "$STATUS" | jq -r '.components.main.battery.battery.timestamp')
LOCK_STATE=$(echo "$STATUS" | jq -r '.components.main.lock.lock.value')
LOCK_TS=$(echo "$STATUS" | jq -r '.components.main.lock.lock.timestamp')

echo "Battery: ${BATTERY}%"
echo "Battery Updated: $BATTERY_TS"
echo "Lock State: $LOCK_STATE"
echo "Lock Updated: $LOCK_TS"
echo

# Get health
echo "=== Health Status ==="
HEALTH=$(smartthings devices:health "$DEVICE_ID" -j 2>/dev/null)
STATE=$(echo "$HEALTH" | jq -r '.state')
LAST_UPDATED=$(echo "$HEALTH" | jq -r '.lastUpdatedDate')

echo "State: $STATE"
echo "Last Updated: $LAST_UPDATED"
echo

# Get recent events
echo "=== Recent Events (last 24h) ==="
YESTERDAY=$(date -u -v-1d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "1 day ago" +%Y-%m-%dT%H:%M:%SZ)
HISTORY=$(smartthings devices:history "$DEVICE_ID" --after "$YESTERDAY" -j 2>/dev/null)
EVENT_COUNT=$(echo "$HISTORY" | jq 'length')

echo "Event Count: $EVENT_COUNT"
echo "$HISTORY" | jq -r '.[] | "\(.time) - \(.capability).\(.attribute)"' 2>/dev/null | head -10
echo

# Summary assessment
echo "=== Assessment ==="
if [ "$SECURITY" = "ZWAVE_S2_ACCESS_CONTROL" ]; then
    echo "[OK] Using S2 security (efficient)"
else
    echo "[WARN] Using $SECURITY (battery drain risk)"
fi

if [ "$PROV_STATE" = "PROVISIONED" ]; then
    echo "[OK] Provisioning state is healthy"
else
    echo "[WARN] Provisioning state: $PROV_STATE (needs re-pairing)"
fi

if [ "$BATTERY" -gt 50 ]; then
    echo "[OK] Battery level: ${BATTERY}%"
elif [ "$BATTERY" -gt 20 ]; then
    echo "[WARN] Battery level: ${BATTERY}% (getting low)"
else
    echo "[CRITICAL] Battery level: ${BATTERY}% (replace soon)"
fi

if [ "$EVENT_COUNT" -lt 50 ]; then
    echo "[OK] Event frequency normal ($EVENT_COUNT events/24h)"
else
    echo "[WARN] High event frequency ($EVENT_COUNT events/24h) - possible polling issue"
fi

# Log to file
echo
echo "=== Logging ==="
LOG_ENTRY=$(jq -n \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg device "$LABEL" \
    --arg device_id "$DEVICE_ID" \
    --arg security "$SECURITY" \
    --arg prov_state "$PROV_STATE" \
    --arg battery "$BATTERY" \
    --arg lock_state "$LOCK_STATE" \
    --arg health_state "$STATE" \
    --arg event_count "$EVENT_COUNT" \
    '{timestamp: $ts, device: $device, device_id: $device_id, security: $security, provisioning: $prov_state, battery: ($battery | tonumber), lock_state: $lock_state, health: $health_state, events_24h: ($event_count | tonumber)}')

# Append to log file (create array if new, append if exists)
if [ -f "$LOG_FILE" ]; then
    # Append to existing array
    jq --argjson entry "$LOG_ENTRY" '. += [$entry]' "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
else
    # Create new array
    echo "[$LOG_ENTRY]" > "$LOG_FILE"
fi

echo "Logged to: $LOG_FILE"
echo
echo "============================================"
echo "Run this script daily to track battery drain"
echo "Compare both locks:"
echo "  ./monitor-lock.sh  (Front Door - default)"
echo "  ./monitor-lock.sh $UTILITY_DOOR_ID  (Utility door)"
echo "============================================"
