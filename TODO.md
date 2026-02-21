# Smart Home Diagnostics - Project TODOs

## HomeIT Phase 1 (Complete)

All Phase 1 items completed — see Completed section below.

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
- [ ] **Wildcard cert auto-deploy to DSM** — Renewal script renews in acme.sh store but doesn't re-import to DSM. Need to configure acme.sh deploy hook with DSM credentials, or script the Synology certificate API
- [x] **Docker Compose migration** — Created docker-compose.yml with Watchtower --cleanup
- [ ] **Docker image cleanup** — Run scripts/docker-cleanup.sh to prune (deploy compose first)
- [ ] **Synology maintenance** — ~~DSM 7.3.2 update~~ Done (7.3.2-86009), storage audit (Vol 1 & 2 at 90%), clean up deprecated packages (PHP 7.3/7.4/8.0, Node.js v16)
- [x] **Business continuity audit** — Glacier stale (Sep 2023), HyperBackup not configured, RTO/RPO documented in RECOVERY.md
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
- [x] Configure HA SmartThings integration (Nabu Casa OAuth, 31 devices / 61 entities) — Feb 15
- [x] Build Lock Monitor dashboard (battery gauges, lock controls, history graph, logbook) — Feb 15
- [x] Create battery alert automation (< 20% → persistent notification + iPhone push) — Feb 15
- [x] Sync git repo to Synology (bare repo + post-receive auto-deploy) — Feb 15
- [x] Issue Let's Encrypt wildcard cert (`*.conant.com`) via acme.sh + GoDaddy DNS-01 — Feb 15
- [x] Configure DSM reverse proxy: `https://ha.conant.com` → `http://localhost:8123` — Feb 15
- [x] Set up DNS: CNAME `ha` → `conant.synology.me` on GoDaddy — Feb 15
- [x] Configure HA `http` (trusted_proxies) and `homeassistant` (external/internal URLs) — Feb 15
- [x] Set up cert auto-renewal in DSM Task Scheduler — Feb 15
- [x] Update DSM to 7.3.2-86009 — Feb 15
