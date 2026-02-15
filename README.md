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

## Devices

### Front Door Lock

| Property | Value |
|----------|-------|
| Model | Schlage BE469 (non-ZP) |
| Part# | 12385868-017 |
| Model# | 23685159 |
| Firmware | 0.8.0 (01/11/2019) |
| Z-Wave Security | S0_LEGACY only (S2 not supported) |
| SmartThings ID | 946ebd78-beb2-4973-869e-ec00c4155c48 |

**Note:** BE469 (original) only supports S0 security. The newer BE469**ZP** supports S2.

Credentials stored in `credentials/front-door.txt` (gitignored).

Programming instructions: <https://instructions.allegion.com/instr/146/32418>

### Utility Door Lock

| Property | Value |
|----------|-------|
| SmartThings ID | b0501125-5eb8-4060-851f-9d59fd38d664 |
| Z-Wave Security | S2_ACCESS_CONTROL |

### Garage Door Lock

| Property | Value |
|----------|-------|
| SmartThings ID | f29eb0c7-a6ea-4740-b9a3-79d0eab3a512 |
| Z-Wave Security | S2_ACCESS_CONTROL |

## Background

Created to diagnose Schlage BE469 Z-Wave lock battery drain issues. Key findings:
- `ZWAVE_S0_LEGACY` encryption uses ~3x more messages than S2
- `provisioningState: NONFUNCTIONAL` causes failed Z-Wave retries
- Re-pairing the device can fix provisioning issues

## Known Issues (Feb 2026)

### Smart Lock Guest Access App

- Shows S2 locks (Utility, Garage) as "unknown" status
- Works with S0_LEGACY locks (Front door)
- Likely bug in SmartThings Beta Z-Wave Lock driver (2025-10-22)

### Driver Compatibility

| Driver                   | S0 Locks | S2 Locks | Guest Access |
|--------------------------|----------|----------|--------------|
| Z-Wave Lock PH (philh30) | Works    | ?        | Works        |
| Z-Wave Lock (ST Beta)    | ?        | Works    | Broken       |

philh30 driver: Enhanced for Schlage 468/469, community supported.

### Front Door Provisioning

- Frequently shows `NONFUNCTIONAL` provisioning state
- Z-Wave commands return `lock.lock = null` (failures)
- Manual keypad operation works; SmartThings control unreliable
- May require exclude/re-pair to fix
