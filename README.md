# Smart Home Diagnostics

Tools for monitoring and diagnosing SmartThings smart home devices.

## Setup

Requires the SmartThings CLI:
```bash
brew install smartthingscommunity/smartthings/smartthings
```

## Scripts

| Script | Description |
|--------|-------------|
| `monitor-lock.sh` | Full device diagnostics for Z-Wave locks |
| `log-battery.sh` | Log battery levels to CSV (run via cron) |
| `battery-trend.sh` | View battery drain history |

## Usage

```bash
# Full diagnostics on Front door lock
./monitor-lock.sh

# Check a specific device
./monitor-lock.sh <device-id>

# View battery drain trend
./battery-trend.sh

# Manual battery log
./log-battery.sh
```

## Cron Setup

Daily battery logging at 8 AM:
```bash
0 8 * * * /path/to/smart/log-battery.sh >> /path/to/smart/logs/cron.log 2>&1
```

## Background

Created to diagnose Schlage BE469 Z-Wave lock battery drain issues. Key findings:
- `ZWAVE_S0_LEGACY` encryption uses ~3x more messages than S2
- `provisioningState: NONFUNCTIONAL` causes failed Z-Wave retries
- Re-pairing the device can fix provisioning issues
