# Synology Backup Audit & Recovery Guide

**Audit Date:** February 20, 2026
**NAS:** Synology DS1520+ (IRIS)
**IP:** 10.1.11.98:2222 (SSH)

## Volume Status

| Volume | Total | Used | Free | Usage |
|--------|-------|------|------|-------|
| volume1 | 15 TB | 13 TB | 1.6 TB | 90% |
| volume2 | 2.9 TB | 2.6 TB | 308 GB | 90% |
| volume3 | 19 TB | 13 TB | 5.2 TB | 72% |

**Warning:** Volumes 1 & 2 at 90% - cleanup recommended.

## Backup Packages Installed

| Package | Status | Purpose |
|---------|--------|---------|
| HyperBackup | Installed | General backup to local/cloud |
| GlacierBackup | Installed | AWS Glacier archive (429 MB local cache) |
| ActiveBackup-Office365 | Installed | Microsoft 365 backup |
| HyperBackupVault | Installed | Receive backups from other devices |

## Docker Containers

### Running (5)

| Container | Image | Uptime |
|-----------|-------|--------|
| home_assistant | homeassistant/home-assistant:latest | 4 days |
| portainer | portainer/portainer-ce:latest | 4 days |
| watchtower | containrrr/watchtower:latest | 4 days |
| oznu-homebridge | oznu/homebridge:latest | 4 days |
| ubuntu1 | ubuntu:latest | 2 days |

### Stopped (4) - Candidates for removal

| Container | Image | Status |
|-----------|-------|--------|
| mariadb-reader | mariadb:jammy | Exited 2 years ago |
| strapi02-strapi-1 | naskio/strapi | Exited 2 years ago |
| strapi02-db-1 | postgres | Exited 2 years ago |
| python1 | python:latest | Exited 2 years ago |

## Critical Data Sizes (Tier 1)

| Path | Size | Notes |
|------|------|-------|
| `/volume3/docker/homeassistant/` | 102 MB | HA config, automations, dashboards |
| `/volume3/docker/Homebridge/` | 89 MB | Homebridge config and plugins |
| `/volume3/docker/acme.sh/` | 2.1 MB | Let's Encrypt certs, GoDaddy API creds |
| `/volume3/docker/portainer/` | 8 MB | Portainer data |
| `/volume3/docker/git/` | 216 KB | Git bare repositories |
| **Total Tier 1** | **~210 MB** | Easily backed up to Glacier |

## Docker Image Problem

Watchtower auto-updates containers but does NOT prune old images.

**Top 20 images are all 2+ GB each, mostly dangling:**

- ~20 old homeassistant images: ~40 GB wasted
- Old strapi images: ~4 GB wasted

**Fix:** Add `--cleanup` flag to Watchtower or run periodic prune:

```bash
docker=/var/packages/ContainerManager/target/usr/bin/docker
$docker image prune -a --filter "until=168h"  # Remove images older than 7 days
```

## Backup Recommendations

### Tier 1: Critical (Daily, offsite to Glacier)

- `/volume3/docker/homeassistant/`
- `/volume3/docker/acme.sh/`
- `/volume3/docker/git/`
- DSM System Configuration

**Estimated Glacier cost:** ~$0.01/month (210 MB at $1/TB/month)

### Tier 2: Important (Weekly, local only)

- `/volume3/docker/Homebridge/`
- `/volume3/docker/portainer/`
- Surveillance Station database

### Tier 3: Not needed

- Docker images (re-pull from registries)
- Old/stopped containers (delete them)
- Surveillance recordings > 30 days

## Recovery Procedures

### Full NAS Recovery

1. Replace hardware / install DSM
2. Install packages: ContainerManager, HyperBackup, GlacierBackup
3. Restore system config from Hyper Backup
4. Restore `/volume3/docker/` from Glacier
5. Start containers: `docker-compose up -d` (if created) or via Portainer
6. Verify: HA dashboard, certs, git push

### Home Assistant Recovery

```bash
# SSH to Synology
ssh mike@10.1.11.98 -p 2222

# Stop container
docker=/var/packages/ContainerManager/target/usr/bin/docker
$docker stop home_assistant

# Restore config from backup
# (use Hyper Backup restore or manual copy)

# Start container
$docker start home_assistant

# Verify
curl http://localhost:8123
```

### Certificate Recovery

```bash
# Restore acme.sh from backup to /volume3/docker/acme.sh/
# Test renewal
/volume3/docker/acme.sh/acme.sh --cron --home /volume3/docker/acme.sh

# Re-import to DSM if needed
# DSM > Security > Certificate > Add > Import
```

## Immediate Actions Needed

1. **Configure Hyper Backup task** for `/volume3/docker/` → Glacier
2. **Clean up stopped containers** (4 containers, 2+ years old)
3. **Add `--cleanup` to Watchtower** to prevent image bloat
4. **Create docker-compose.yml** to codify container definitions
5. **Test restore** from existing Glacier backup (if any)
6. **Storage cleanup** on volumes 1 & 2 (at 90%)

## Next Steps

After this audit, proceed with:

1. Verify what's currently IN the Glacier backup (via DSM UI)
2. Configure Hyper Backup task if not already done
3. Create docker-compose.yml for reproducible deployments
4. Set up backup verification cron job
5. Define RTO/RPO targets formally
