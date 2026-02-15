# Smart Home Diagnostics - Project TODOs

## High Priority

- [ ] **Integrate with SmartThings Advanced Portal**
  - Portal: https://my.smartthings.com/location/f0c377e0-0c15-4e09-affc-02dd44141080
  - Add scripts to fetch device data via API
  - Automate Z-Wave network health checks

- [ ] **Fix monitor-lock.sh null handling**
  - Script errors when battery is null
  - Add proper null checks for all JSON fields

- [ ] **Investigate S2 locks + Guest Access App issue**
  - Utility and Garage show "unknown" in Guest Access
  - Likely SmartThings Beta driver bug (Oct 2025)
  - Test switching S2 locks to philh30 driver

## Medium Priority

- [ ] **Add Garage Door lock to log-battery.sh**
  - Currently only logs Front door and Utility door
  - Device ID: f29eb0c7-a6ea-4740-b9a3-79d0eab3a512

- [ ] **Create code-monitor.sh script**
  - Track lock code changes
  - Alert on unexpected code additions/deletions
  - Log who unlocked (code name used)

- [ ] **Document all Z-Wave devices**
  - Add other Z-Wave devices to README
  - Track devices with NONFUNCTIONAL or S2_FAILED states
  - Heater whiteR, Heaternew L, Z-Wave Device need attention

## Low Priority

- [ ] **Set up cron job for battery logging**
  - Currently documented but not implemented
  - Add to system crontab

- [ ] **Add driver log monitoring**
  - `smartthings edge:drivers:logcat --hub <hub-id>`
  - Capture errors for diagnostics

- [ ] **Research BE469 replacement options**
  - Current lock only supports S0_LEGACY (3x battery drain)
  - BE469ZP supports S2 but requires new hardware

## Completed (Feb 15, 2026)

- [x] Re-pair Front door lock (fixed NONFUNCTIONAL → PROVISIONED)
- [x] Document BE469 programming instructions
- [x] Document exclusion/re-pair process
- [x] Identify driver compatibility (philh30 vs ST Beta)
- [x] Confirm SmartThings Beta driver missing BE469 non-ZP fingerprint
- [x] Move SmartThings hub closer to locks
- [x] Update device IDs after re-pair
