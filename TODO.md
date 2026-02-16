# Smart Home Diagnostics - Project TODOs

## HomeIT Phase 1 (Active)

- [ ] **Configure Home Assistant SmartThings integration**
  - HA running on Synology IRIS (DS1520+) in Docker
  - Needs external URL for webhooks (Nabu Casa or Synology reverse proxy)
  - SmartThings PAT with device/location scopes
  - Expected: lock entities, battery sensors, switch entities

- [ ] **Build HA battery monitoring dashboard**
  - Battery gauge cards for all 3 locks
  - Lock status cards (locked/unlocked)
  - 30-day battery history graph (replaces battery-trend.sh for visual monitoring)
  - Lock event logbook

- [ ] **Create battery alert automation in HA**
  - Trigger on any lock battery < 20%
  - Persistent notification (mobile push later in Phase 3)

- [ ] **Sync git repo to Synology**
  - Clone to `/volume3/projects/smart`
  - Set up bare repo at `/volume3/git/smart.git` with post-receive hook
  - Add `synology` remote on Mac

## High Priority

- [ ] **Fix monitor-lock.sh null handling**
  - ~~Script errors when battery is null~~ Fixed: added null guard before numeric comparisons
  - Verify with a test run

- [ ] **Create code-monitor.sh script**
  - Track lock code changes
  - Alert on unexpected code additions/deletions
  - Log who unlocked (code name used)

## Medium Priority

- [ ] **Replace Left heater (Minoston MP31ZP)**
  - S2_AUTHENTICATED pairing succeeds but commands fail at distance from hub
  - Leviton DZPA1 ordered as replacement (non-secure, proven reliable)
  - When it arrives: exclude MP31ZP, pair DZPA1, update device ID in docs

- [ ] **Identify unknown Z-Wave Device (dfaf98a0)**
  - S2_FAILED, OFFLINE — needs physical identification
  - May be an old device that was never properly excluded

- [ ] **Monitor Utility door battery (34%)**
  - Getting low — plan for replacement
  - HA automation will alert when it drops below 20%

## Low Priority

- [ ] **Research BE469 replacement options**
  - Front door lock only supports S0_LEGACY (higher battery drain than S2)
  - BE469ZP supports S2 but requires new hardware
  - Not urgent — battery currently at 100% after re-pair

- [ ] **Add driver log monitoring**
  - `smartthings edge:drivers:logcat --hub 3545970a-9fcf-440d-930a-d25686b48d74`
  - Capture errors for diagnostics
  - Lower priority now that all locks stable on RBoy

## HomeIT Phase 2 (Future Roadmap)

- [ ] **HomeIT strategy document** — Map all services (HA, Surveillance Station, Hyper Backup, Active Backup M365, Homebridge, VPN, DNS)
- [ ] **Docker Compose migration** — Move standalone containers to declarative docker-compose.yml
- [ ] **Docker image cleanup** — 429 images / 438.8 GB. Prune unused, add `--cleanup` to Watchtower
- [ ] **Synology maintenance** — DSM 7.3.2 update, pending package updates, storage audit (Vol 1 & 2 at 89%)
- [ ] **Business continuity audit** — Verify Glacier backup coverage, test restore, document RTO/RPO, back up Docker configs
- [ ] **Synology DSM integration in HA** — NAS health monitoring dashboard
- [ ] **Surveillance Station in HA** — Camera feeds on same dashboard as locks
- [ ] **Evaluate Homebridge overlap** — HA has native HomeKit Bridge; Homebridge may be redundant

## HomeIT Phase 3 (Future Roadmap)

- [ ] Lock code tracking automations (which code unlocked which door)
- [ ] Auto-lock if unlocked > 10 minutes
- [ ] Nightly "all doors locked" check
- [ ] HA Companion App for mobile push notifications
- [ ] Unified dashboard: locks + cameras + climate + NAS health
- [ ] Actionable notifications ("Front door unlocked — lock it?")
- [ ] NAS health automations — alerts on disk failures, high temps, low storage

## Completed

- [x] Re-pair Front door lock (fixed NONFUNCTIONAL -> PROVISIONED) — Feb 15
- [x] Re-pair Utility door lock — Feb 15
- [x] Re-pair Garage Door lock (2 attempts, Explorer intercepted first) — Feb 15
- [x] Re-pair Right heater, renamed from "Heater whiteR" — Feb 15
- [x] Re-pair Left heater x3 (S2 commands still fail from office) — Feb 15
- [x] Switch all 3 Schlage locks to RBoy Universal Enhanced Z-Wave Lock driver — Feb 15
- [x] Remove unused drivers (Z-Wave Lock stock, PH, PH BETA, Explorer) — Feb 15
- [x] Document BE469 programming instructions
- [x] Document exclusion/re-pair process
- [x] Identify driver compatibility (philh30 abandoned, RBoy recommended)
- [x] Move SmartThings hub closer to locks
- [x] Update all device IDs after re-pair
- [x] Add Garage Door to log-battery.sh and monitor-lock.sh
- [x] Add Garage Door to battery-trend.sh — Feb 15
- [x] Document all Z-Wave devices in README and portal findings
- [x] Document cron job setup for battery logging
- [x] Fix monitor-lock.sh null battery handling — Feb 15
