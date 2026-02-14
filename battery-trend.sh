#!/bin/bash
# Show battery drain trend for SmartThings locks

LOG_FILE="$HOME/projects/smart/logs/battery-history.csv"

if [ ! -f "$LOG_FILE" ]; then
    echo "No battery history yet. Run log-battery.sh first."
    exit 1
fi

echo "=== Battery Drain Trend ==="
echo ""

# Front door history
echo "Front door:"
grep "Front door" "$LOG_FILE" | tail -14 | while IFS=, read -r ts label id battery security prov; do
    date_only=$(echo "$ts" | cut -d'T' -f1)
    printf "  %s: %s%%\n" "$date_only" "$battery"
done

echo ""

# Utility door history
echo "Utility door:"
grep "Utility door" "$LOG_FILE" | tail -14 | while IFS=, read -r ts label id battery security prov; do
    date_only=$(echo "$ts" | cut -d'T' -f1)
    printf "  %s: %s%%\n" "$date_only" "$battery"
done

echo ""
echo "---"

# Calculate drain rate for Front door (if enough data)
FRONT_DATA=$(grep "Front door" "$LOG_FILE" | grep -v "null" | tail -2)
if [ $(echo "$FRONT_DATA" | wc -l) -ge 2 ]; then
    FIRST=$(echo "$FRONT_DATA" | head -1)
    LAST=$(echo "$FRONT_DATA" | tail -1)

    FIRST_BAT=$(echo "$FIRST" | cut -d',' -f4)
    LAST_BAT=$(echo "$LAST" | cut -d',' -f4)
    FIRST_DATE=$(echo "$FIRST" | cut -d',' -f1 | cut -d'T' -f1)
    LAST_DATE=$(echo "$LAST" | cut -d',' -f1 | cut -d'T' -f1)

    if [ "$FIRST_BAT" != "$LAST_BAT" ] && [ "$FIRST_BAT" != "null" ] && [ "$LAST_BAT" != "null" ]; then
        DRAIN=$((FIRST_BAT - LAST_BAT))
        echo "Front door drain: ${DRAIN}% from $FIRST_DATE to $LAST_DATE"
    fi
fi

echo ""
echo "Log file: $LOG_FILE"
echo "Total entries: $(wc -l < "$LOG_FILE")"
