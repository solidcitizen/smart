# Configuration Change Log

Dated record of significant system configuration changes. Every SSH config change, DSM UI change, or service modification gets logged here.

> See also: [Service Registry](docs/services.md) for current state | [Runbook](docs/runbook.md) for procedures | [RECOVERY](RECOVERY.md) for backup strategy

---

## 2026-02-21

### Backup & Storage
- Expanded Hyper Backup → S3 task to cover all irreplaceable data (was Docker configs only):
  - Added `/volume3/photo/` (~113 GB — family photos 1970s–2019)
  - Added `/volume3/archive/` (~1.2 TB — documents, financial, ancestry, work history, PSTs)
  - Added `/volume1/video/familyvideos/` (~47 GB — family videos)
  - Added `/volume3/homes/` (~78 GB — user home directories)
  - Added `/volume3/backup/` (Time Machine gala, VMs, PRIME data)
- **Total offsite backup scope: ~1.5+ TB** (up from ~210 MB Docker-only)
- Updated S3 cost estimate: ~$15–22/month (was ~$0.02/month)
- Corrected data sizes from SSH audit: archive is 1.2 TB (was estimated 77 GB), photos 113 GB (was 87 GB)
- Volume3 now at 55% used (was reported as 62%)

### Documentation
- Created ITSM operations framework:
  - `docs/services.md` — Service registry & CMDB (hardware, network, all services, Z-Wave devices, DSM packages)
  - `docs/runbook.md` — Operational procedures, health checks, incident response, quarterly/annual audit checklists
  - `CHANGELOG.md` — Configuration change log with backfilled entries
- Deduplicated RECOVERY.md: removed Docker, maintenance, and package sections now covered by services.md/runbook.md; added cross-references
- Added service onboarding backlog to TODO.md (12 undocumented services)
- Added related documentation index to README.md

## 2026-02-20

### Backup & Storage
- Configured Hyper Backup → S3 offsite backup (`iris-synology-backup` bucket, us-west-2, Standard-IA, daily 2 AM, encrypted, Smart Recycle rotation)
- Created AWS resources: S3 bucket, IAM user `synology-backup`, scoped policy `SynologyHyperBackup`
- Deleted 6 stale Time Machine bundles from volume3 (2.37 TB reclaimed):
  - mike: V3Q1YFVQ41.sparsebundle (181 GB), walle.sparsebundle (548 GB)
  - Julia: MacBook Pro.backupbundle (904 GB), MacBook Pro.sparsebundle (563 MB), Mac mini (2).backupbundle (482 GB), LOSD-FVFGQ4KPQ6LR.sparsebundle (255 GB)
- Deleted WindowsImageBackup-8-Jul-12 (254 GB) — redundant PRIME PC image
- Consolidated 32 PST email archives into `/volume3/archive/mail/` (~38 GB unique data)
- Deleted HOBBS versioned Outlook copies (~13 GB junk)
- Created README.txt index in `/volume3/archive/mail/`
- **Total reclaimed: ~2.63 TB** (volume3 72% → 62%)
- Verified Active Backup for M365 running (continuous, Cadence Group)

### Docker
- Created docker-compose.yml for all 4 containers (HA, Portainer, Watchtower, Homebridge)
- Deployed via `docker compose up -d` — migrated from standalone containers
- Added `--cleanup` flag to Watchtower for automatic image pruning
- Removed 5 stopped containers (mariadb-reader, strapi02-*, python1)

### Infrastructure
- Added Synology config export script (`scripts/synology-export.sh`) and initial snapshot
- Created RECOVERY.md with data inventory, classification, cleanup plan, and backup expansion plan
- Documented RTO/RPO targets for all systems

### Documentation
- Added comprehensive data management strategy (RECOVERY.md)
- Documented Hyper Backup → S3 configuration (bucket, IAM, policy, restore procedures)
- Documented backup coverage map with gap analysis

## 2026-02-15

### Home Automation
- Configured Home Assistant SmartThings integration (Nabu Casa OAuth, 31 devices / 61 entities)
- Built Lock Monitor dashboard (battery gauges, lock/unlock controls, 30-day history graph, tamper status, logbook)
- Created battery alert automation: < 20% → persistent notification + iPhone push
- Re-paired all 3 Schlage locks to SmartThings with RBoy Universal Enhanced Z-Wave Lock driver:
  - Front Door (BE469, S0_LEGACY)
  - Utility Door (BE469ZP, S2_ACCESS_CONTROL)
  - Garage Door (BE469ZP, S2_ACCESS_CONTROL)
- Re-paired both office heaters (Right: Leviton DZPA1, Left: Minoston MP31ZP)
- Removed unused Z-Wave drivers (stock Samsung, philh30, philh30 BETA, Explorer)
- Fixed monitor-lock.sh null battery handling
- Added Garage Door to battery-trend.sh

### Infrastructure
- Updated DSM to 7.3.2-86009
- Issued Let's Encrypt wildcard certificate (`*.conant.com` + `conant.com`) via acme.sh + GoDaddy DNS-01
- Configured DSM reverse proxy: `https://ha.conant.com:443` → `http://localhost:8123` (WebSocket enabled)
- Set up Synology DDNS (`conant.synology.me`)
- Set up DNS: CNAME `ha` → `conant.synology.me` on GoDaddy
- Configured HA `http` (trusted_proxies) and `homeassistant` (external/internal URLs)
- Set up cert auto-renewal in DSM Task Scheduler (daily 3 AM)
- Created git bare repo at `/volume3/docker/git/smart.git` with post-receive auto-deploy hook

### Documentation
- Added HomeIT section to README documenting HA architecture on Synology
- Updated all device IDs after Z-Wave re-pair
- Documented driver compatibility (RBoy recommended, philh30 abandoned)
- Documented BE469 programming instructions and exclusion/re-pair process

## 2026-02-14

### Initial Setup
- Created smart repo with SmartThings CLI lock monitoring tools
- Scripts: monitor-lock.sh (device diagnostics), log-battery.sh (battery CSV), battery-trend.sh (drain history)
- Documented all Z-Wave devices and known issues
