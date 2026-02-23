# Service Registry & CMDB

**Last updated:** 2026-02-21

Single source of truth for all systems, services, and their current configuration.

> See also: [Runbook](runbook.md) for operational procedures | [CHANGELOG](../CHANGELOG.md) for change history | [RECOVERY](../RECOVERY.md) for backup strategy & disaster recovery

---

## Hardware Inventory

| Asset | Model | IP / Location | Role | Notes |
|-------|-------|---------------|------|-------|
| IRIS | Synology DS1520+ | 10.1.11.98 | NAS, Docker host, backup server | DSM 7.3.2-86009, 3 volumes (15 + 2.9 + 19 TB) |
| SmartThings Hub | v3 | 10.1.11.174 | Z-Wave controller | Hub ID `3545970a-9fcf-440d-930a-d25686b48d74` |
| Eero mesh | (model TBD) | 10.1.11.1 (gateway) | Router, WiFi, DHCP | Public IP 107.193.185.12 (dynamic) |
| Enphase Envoy | (model TBD) | (IP TBD) | Solar monitoring | 59 devices in HA — needs documentation |
| Denon AVR | (model TBD) | (IP TBD) | A/V receiver | HEOS, 10 devices in HA — needs documentation |
| gala | Mac (model TBD) | DHCP | Mike's Mac | Time Machine → NAS |
| fuji | Mac (model TBD) | DHCP | Julia's Mac | TM stale since 2021 |

---

## Network

### Subnet
- **Network:** 10.1.11.0/24 (mask 255.255.255.0, broadcast 10.1.11.255)
- **Gateway:** 10.1.11.1 (Eero mesh)
- **DHCP:** Eero (range TBD)
- **Public IP:** 107.193.185.12 (dynamic, tracked by Synology DDNS)

### DNS
- **Registrar:** GoDaddy
- **ha.conant.com:** CNAME → `conant.synology.me` (follows Synology DDNS)
- **conant.synology.me:** Synology DDNS (auto-updated)

### Port Assignments

| Port | Service | Host |
|------|---------|------|
| 2222 | SSH | IRIS (10.1.11.98) |
| 5000 | DSM HTTP | IRIS |
| 5001 | DSM HTTPS | IRIS |
| 5432 | PostgreSQL (Supabase) | IRIS |
| 8123 | Home Assistant | IRIS |
| 8581 | Homebridge | IRIS |
| 9000 | Portainer HTTP | IRIS |
| 9443 | Portainer HTTPS | IRIS |
| 9999 | Supabase Auth (GoTrue) | IRIS |

### External Access
- **ha.conant.com** — DSM reverse proxy → localhost:8123 (WebSocket enabled)
- **conant.synology.me:5001** — DSM admin (HTTPS)

---

## Services — Home Automation

| Service | Platform | Status | Config Location | Health Check |
|---------|----------|--------|-----------------|--------------|
| Home Assistant | Docker on IRIS | Running | `/volume3/docker/homeassistant/` | http://10.1.11.98:8123 |
| SmartThings Integration | HA + Nabu Casa OAuth | Active | HA UI | 31 devices / 61 entities visible |
| Homebridge | Docker on IRIS | Running | `/volume3/docker/Homebridge/` | http://10.1.11.98:8581 |
| Lock Monitor Dashboard | HA | Active | HA UI + `dashboards/lock-monitor.yaml` | Dashboard loads, battery gauges show |
| Battery Alert Automation | HA | Active | HA UI + `automations.yaml` | < 20% triggers push notification |
| Enphase Envoy | HA integration | Active | HA UI | 59 devices visible — needs documentation |
| Denon AVR / HEOS | HA integration | Active | HA UI | 10 devices visible — needs documentation |
| Eero | NOT INSTALLED | Planned | — | Needs HACS first |

---

## Services — NAS & Infrastructure

| Service | Platform | Status | Schedule | Health Check | Runbook |
|---------|----------|--------|----------|--------------|---------|
| Hyper Backup → S3 | DSM | Active (~1.5+ TB scope) | Daily 2 AM | DSM → Hyper Backup → task status | [Backup verification](runbook.md#hyper-backup-verification) |
| Glacier Backup | DSM | Active (~160 GB scope) | Manual/monthly | DSM → Glacier Backup → task status | Cold archive for family media |
| Active Backup for M365 | DSM | Active | Continuous | DSM → Active Backup → task status | [M365 verification](runbook.md#active-backup-for-m365-verification) |
| Surveillance Station | DSM | Active | Continuous | DSM → Surveillance Station | Needs documentation |
| Wildcard Cert Renewal | acme.sh + DSM cron | Active | Daily 3 AM check | Cert expiry date in DSM | [Cert re-import](runbook.md#certificate-re-import-to-dsm) |
| Watchtower | Docker | Running | Daily 4 AM | Container logs | [Docker management](runbook.md#docker-container-management) |
| Portainer | Docker | Running | Always | http://10.1.11.98:9000 | — |
| Git Auto-Deploy | post-receive hook | Active | On push | `git push synology main` | — |
| Synology DDNS | DSM | Active | Automatic | `conant.synology.me` resolves | — |
| DSM Reverse Proxy | DSM | Active | Always | https://ha.conant.com loads | — |

---

## Services — Business (Cadence Group)

| Service | Platform | Status | Notes |
|---------|----------|--------|-------|
| Microsoft 365 | Cloud | Active | OneDrive, email, SharePoint |
| Active Backup for M365 | Synology | Active (continuous) | Local backup of M365 data, retention beyond 30-day OneDrive window |
| OneDrive Sync | PC | Active | PC data backed up to cloud |

---

## Services — Personal IT

| Service | Platform | Status | Notes |
|---------|----------|--------|-------|
| Time Machine (gala) | NAS volume3 | Active (last Oct 2025) | Needs verification — [procedure](runbook.md#time-machine-status) |
| Time Machine (fuji) | NAS volume2 | Stale (last 2021) | 2.6 TB on volume2 — deferred decision |
| GitHub repos | Cloud | Active | smart repo + others |
| OneDrive (personal) | Cloud | Active | Personal files |

---

## Z-Wave Device Registry

### Locks

| Device | Model | SmartThings ID | Z-Wave Security | Driver | Battery |
|--------|-------|----------------|-----------------|--------|---------|
| Front Door | Schlage BE469 | `a9a852ec-f357-4de0-a12b-240df0ade739` | S0_LEGACY | RBoy Universal Enhanced | Monitor — S0 drains faster |
| Utility Door | Schlage BE469ZP | `915d7c8b-b66f-414e-ae48-1fcfc9d53db5` | S2_ACCESS_CONTROL | RBoy Universal Enhanced | 34% — getting low |
| Garage Door | Schlage BE469ZP | `b608437a-d821-41f9-b8f1-24b858477b2d` | S2_ACCESS_CONTROL | RBoy Universal Enhanced | Warranty replacement, stable on RBoy |

All locks on **RBoy Universal Enhanced Z-Wave Lock** driver (`c8d6a4ae`).

### Switches

| Device | Model | SmartThings ID | Z-Wave Security | Role | Status |
|--------|-------|----------------|-----------------|------|--------|
| Right heater | Leviton DZPA1 | `b0dca074-7167-4e36-95d5-4ccf067c2bb2` | LEGACY_NON_SECURE | Mike Office heater | Working |
| Left heater | Minoston MP31ZP | `421abfbc-410f-4d2c-911f-d585f104e725` | S2_AUTHENTICATED | Mike Office heater | Commands fail at distance — replacing with DZPA1 |

### Unknown / Orphaned

| Device | SmartThings ID | Z-Wave Security | Status | Notes |
|--------|----------------|-----------------|--------|-------|
| Unknown | `dfaf98a0...` | S2_FAILED | OFFLINE | Needs physical identification |

---

## NAS Volume Summary

| Volume | Total | Used | Free | Usage | Primary Contents |
|--------|-------|------|------|-------|------------------|
| volume1 | 15 TB | 13 TB | 1.6 TB | 90% | Music, video, surveillance, web |
| volume2 | 2.9 TB | 2.6 TB | 308 GB | 90% | fuji Time Machine (2.6 TB) |
| volume3 | 19 TB | 9.9 TB | 8.3 TB | 55% | Photos, archive, backup, docker, homes |

**Warning:** Volumes 1 & 2 at 90%. Volume 3 cleaned up Feb 20 (was 72%, now 55%).

> Full data inventory and classification in [RECOVERY.md](../RECOVERY.md#data-inventory).

---

## Docker Containers

| Container | Image | Network | Status |
|-----------|-------|---------|--------|
| home_assistant | homeassistant/home-assistant:latest | host | Running |
| portainer | portainer/portainer-ce:latest | bridge (9000, 9443) | Running |
| watchtower | containrrr/watchtower:latest | bridge (--cleanup) | Running |
| oznu-homebridge | oznu/homebridge:latest | host | Running |
| supabase-db | supabase/postgres:15.8.1.085 | supabase (5432) | Running |
| supabase-auth | supabase/gotrue:v2.164.0 | supabase (9999) | Running |

Config: `/volume3/docker/docker-compose.yml`

---

## Supabase (Self-Hosted)

Self-hosted PostgreSQL database and authentication service for home projects.

| Setting | Value |
|---------|-------|
| PostgreSQL | `10.1.11.98:5432` (internal only) |
| GoTrue Auth | `http://10.1.11.98:9999` or `https://supabase.conant.com` |
| Data Directory | `/volume3/docker/supabase/postgres/` |
| Config | `/volume3/docker/supabase/` |
| Init Script | `supabase/init.sql` (run once after first start) |
| Backup | Daily pg_dump at 4 AM to `/volume3/docker/supabase/backups/` |

**Connection string for applications:**
```
postgresql://postgres:<password>@10.1.11.98:5432/postgres
```

**Environment variables required in `.env`:**
- `SUPABASE_POSTGRES_PASSWORD` - PostgreSQL password
- `SUPABASE_JWT_SECRET` - JWT signing secret (32 chars)

> First-time setup: After containers start, run `docker exec -i supabase-db psql -U postgres < /volume3/docker/supabase/init.sql`

---

## Installed DSM Packages

> Auto-generated snapshot in [docs/synology-config.md](synology-config.md). Key packages:

| Package | Status | Purpose |
|---------|--------|---------|
| ContainerManager | Active | Docker runtime |
| HyperBackup | Active | Offsite backup to S3 |
| ActiveBackup-Office365 | Active | M365 backup (Cadence Group) |
| SurveillanceStation | Active | Camera recording — needs documentation |
| VPNCenter | Installed | VPN — needs documentation |
| MailServer | Installed | Email — needs documentation |
| MediaServer | Installed | Media serving — needs documentation |
| MariaDB10 | Installed | Database — needs documentation |
| SynologyDrive | Installed | File sync |
| SynologyPhotos | Installed | Photo management |
| DownloadStation | Installed | Downloads |
| WebStation | Installed | Web hosting |
| CloudSync | Installed | Cloud sync |
| GlacierBackup | Installed (unused) | Legacy — superseded by Hyper Backup → S3 |

---

## Wildcard Certificate

| Setting | Value |
|---------|-------|
| Domain | `*.conant.com` + `conant.com` |
| Issuer | Let's Encrypt (ECC) |
| Tool | acme.sh v3.1.3 at `/volume3/docker/acme.sh/` |
| DNS challenge | GoDaddy API (DNS-01) |
| Auto-renewal | DSM Task Scheduler "Renew wildcard cert" daily 3 AM |
| Note | Renewal does NOT auto-deploy to DSM; manual re-import needed every ~60 days |

> Re-import procedure: [Runbook — Certificate re-import](runbook.md#certificate-re-import-to-dsm)
