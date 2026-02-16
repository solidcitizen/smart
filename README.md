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
| SmartThings ID | a9a852ec-f357-4de0-a12b-240df0ade739 |

**Note:** BE469 (original) only supports S0 security. The newer BE469**ZP** supports S2.

Credentials stored in `credentials/front-door.txt` (gitignored).

Programming instructions: <https://instructions.allegion.com/instr/146/32418>

### Utility Door Lock

| Property | Value |
|----------|-------|
| SmartThings ID | 915d7c8b-b66f-414e-ae48-1fcfc9d53db5 |
| Z-Wave Security | S2_ACCESS_CONTROL |

### Garage Door Lock

| Property | Value |
|----------|-------|
| Model | Schlage BE469ZP (warranty replacement) |
| SmartThings ID | b608437a-d821-41f9-b8f1-24b858477b2d |
| Z-Wave Security | S2_ACCESS_CONTROL |
| Notes | Warranty replacement unit — was flaky on prior drivers, stable on RBoy |

### Office Heaters

| Property | Right heater | Left heater |
|----------|-------------|-------------|
| Model | Leviton DZPA1 | Minoston MP31ZP (replacing with DZPA1) |
| SmartThings ID | b0dca074-7167-4e36-95d5-4ccf067c2bb2 | 421abfbc-410f-4d2c-911f-d585f104e725 |
| Z-Wave Security | LEGACY_NON_SECURE | S2_AUTHENTICATED |
| Room | Mike Office | Mike Office |
| Status | Working | Commands fail from office — S2 issue |

**Note:** MP31ZP has S2 command delivery issues at distance from hub. Replacing with Leviton DZPA1 which works reliably as non-secure.

## Background

Created to diagnose Schlage BE469 Z-Wave lock battery drain issues. Key findings:
- `ZWAVE_S0_LEGACY` encryption uses ~3x more messages than S2
- `provisioningState: NONFUNCTIONAL` causes failed Z-Wave retries
- Re-pairing the device can fix provisioning issues
- Driver changes on locks cause NONFUNCTIONAL — only fix is exclude/re-pair
- Z-Wave Repair does NOT fix provisioning state

## Known Issues (Feb 2026)

### Lock Driver — RBoy Universal Enhanced Z-Wave Lock

All three Schlage locks now use the **RBoy Universal Enhanced Z-Wave Lock** driver (`c8d6a4ae`).

- **Source:** [RBoy Apps](https://smartthings.rboyapps.com/) (paid, actively maintained)
- **Profile:** schlage-lock with schlage-be469 device name
- **Features:** 33 commands, firmware update, Schlage-specific settings (alarm controls, pin code length, auto-lock, vacation mode)
- **Key advantage:** Driver change from philh30/stock did NOT cause NONFUNCTIONAL provisioning — RBoy properly handles `driverChanged` transitions

### Driver Compatibility

| Driver | S0 Locks | S2 Locks | Guest Access | Driver Change Safe | Status |
|--------|----------|----------|--------------|-------------------|--------|
| RBoy Universal Enhanced | ✅ Works | ✅ Works | TBD | ✅ Yes | Actively maintained |
| Z-Wave Lock PH (philh30) | ✅ Works | ? | Works | ❌ Causes NONFUNCTIONAL | Abandoned (author moved to HA, Jan 2023) |
| Z-Wave Lock (stock Samsung) | ? | Works | Broken (S2 shows "unknown") | ❌ Causes NONFUNCTIONAL | Samsung-maintained |

### Provisioning State Issues

- Driver changes on Z-Wave locks cause NONFUNCTIONAL provisioning (stock Samsung and philh30 drivers)
- **Exception:** RBoy driver handles `driverChanged` properly — switching to RBoy fixed Garage Door from NONFUNCTIONAL to PROVISIONED without re-pair
- Z-Wave Repair does not fix provisioning — only rebuilds routing tables
- For non-RBoy drivers, exclude/re-pair is the only known fix (each re-pair changes device ID)

### Minoston MP31ZP S2 Issues

- S2_AUTHENTICATED pairing succeeds but commands fail at distance
- Power metering reports work (device→hub) but switch commands fail (hub→device)
- SmartThings does not offer option to skip S2 on this device
- Works fine close to hub; fails from office (~30+ ft through walls)
- Replacing with Leviton DZPA1 (non-secure, proven reliable)
