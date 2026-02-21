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
| **Total Tier 1** | **~210 MB** | Backed up to S3 Standard-IA via Hyper Backup |

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

### Tier 1: Critical (Daily, offsite to S3) ✅ CONFIGURED

- `/volume3/docker/homeassistant/`
- `/volume3/docker/acme.sh/`
- `/volume3/docker/git/`
- `/volume3/docker/docker-compose.yml`

**Estimated S3 Standard-IA cost:** ~$0.003/month (210 MB)

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
2. Install packages: ContainerManager, HyperBackup
3. Open Hyper Backup → create restore task → S3 Storage → `iris-synology-backup` bucket, `IRIS_1` directory
4. Enter encryption password → restore `/volume3/docker/`
5. Start containers: `cd /volume3/docker && docker-compose up -d`
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

## Current Backup Status

| System | Status | Last Run | Notes |
|--------|--------|----------|-------|
| Hyper Backup → S3 | **ACTIVE** | Feb 20, 2026 | Daily 2 AM, S3 Standard-IA, Smart Recycle, encrypted |
| Glacier Backup pkg | Unused | Never | Legacy package; not needed — Hyper Backup handles offsite |
| Active Backup M365 | Unknown | — | Needs verification in DSM UI |

### Hyper Backup S3 Task Details

| Setting | Value |
|---------|-------|
| **Destination** | S3 Storage (not Glacier — see note below) |
| **S3 Bucket** | `iris-synology-backup` (us-west-2) |
| **Directory** | `IRIS_1` |
| **Storage Class** | Standard-IA |
| **IAM User** | `synology-backup` (scoped to bucket only) |
| **AWS Account** | 846957706554 |
| **Schedule** | Daily 2:00 AM |
| **Integrity Check** | Monthly |
| **Rotation** | Smart Recycle (7 daily, 4 weekly, 6 monthly) |
| **Client-side Encryption** | Enabled (password required for restore) |
| **Compression** | Enabled |
| **Transfer Encryption** | Enabled (HTTPS) |

**Backed-up folders:** `/volume3/docker/` contents (homeassistant, Homebridge, acme.sh, portainer, git, docker-compose.yml)

**Why S3 Standard-IA instead of Glacier:** Hyper Backup needs to read previous backup data for daily incrementals and integrity checks. Glacier objects require 3-5 hour retrieval, which breaks this. For ~210 MB, Standard-IA costs ~$0.003/month — essentially free. Restores are instant.

## Immediate Actions Needed

1. ~~**Create docker-compose.yml**~~ ✅ Done
2. ~~**Add `--cleanup` to Watchtower**~~ ✅ Done
3. ~~**Deploy docker-compose.yml**~~ ✅ Done - 4 containers migrated (Feb 20)
4. ~~**Clean up stopped containers**~~ ✅ Done - removed 5 old containers
5. ~~**Configure Hyper Backup → S3**~~ ✅ Done — S3 Standard-IA, daily 2 AM (Feb 20)
6. **Storage cleanup** on volumes 1 & 2 (at 90%)

## Hyper Backup → S3 Setup Reference

Setup completed Feb 20, 2026. Kept here for rebuild/reconfiguration.

### AWS Resources

Created via CLI (`aws configure` profile on Mac as `mikebackup`):

- **S3 Bucket:** `iris-synology-backup` (us-west-2, public access blocked, SSE-S3 encryption)
- **IAM User:** `synology-backup` (programmatic access only)
- **IAM Policy:** `SynologyHyperBackup` (inline, scoped to bucket)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListBuckets",
      "Effect": "Allow",
      "Action": "s3:ListAllMyBuckets",
      "Resource": "*"
    },
    {
      "Sid": "SynologyHyperBackup",
      "Effect": "Allow",
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts",
        "s3:RestoreObject",
        "s3:GetBucketVersioning",
        "s3:PutBucketVersioning"
      ],
      "Resource": [
        "arn:aws:s3:::iris-synology-backup",
        "arn:aws:s3:::iris-synology-backup/*"
      ]
    }
  ]
}
```

### DSM Hyper Backup Task

Configured via DSM UI → Hyper Backup → S3 Storage:

1. Destination: S3 Storage → `s3.us-west-2.amazonaws.com`
2. Bucket: `iris-synology-backup` → Directory: `IRIS_1`
3. Storage class: Standard-IA
4. Folders: `/volume3/docker/` contents
5. Schedule: Daily 2:00 AM, integrity check monthly
6. Rotation: Smart Recycle
7. Client-side encryption: Enabled

### Cost Estimate

| Item | Amount | Monthly Cost |
|------|--------|-------------|
| S3 Standard-IA storage (~210 MB) | 0.21 GB | $0.003 |
| PUT requests (daily incremental) | ~10/day | $0.015/mo |
| **Total** | | **~$0.02/month** |

Retrieval: instant (Standard-IA, no Glacier delay).

### Restore Procedure

1. Open DSM → **Hyper Backup** → Select the S3 task
2. Click **Restore** → Choose version (by date)
3. Select files/folders to restore
4. Enter the encryption password

For a full NAS rebuild: install Hyper Backup first, then create a "restore task" pointing to `iris-synology-backup` bucket, directory `IRIS_1`.

## RTO/RPO Targets

| System | RPO (Data Loss) | RTO (Downtime) | Justification |
|--------|-----------------|----------------|---------------|
| Home Assistant | 24 hours | 4 hours | Daily backup sufficient; restore from config |
| Certificates | 7 days | 1 hour | Re-issue from acme.sh if needed |
| Git repos | 0 (realtime) | 1 hour | Mirrored to GitHub |
| Surveillance | 30 days | 24 hours | Recordings are archival, not critical |
| M365 Backup | Per Active Backup | — | Managed by Synology package |

**Recovery Priority Order:**
1. Network connectivity (Eero, Synology)
2. Home Assistant (smart home control)
3. Certificates (external access)
4. Surveillance Station
5. Other services

## Next Steps

~~1. Verify what's currently IN the Glacier backup~~ ✅ Empty — old task deleted
~~2. Create docker-compose.yml~~ ✅ Created in repo
~~3. Define RTO/RPO targets~~ ✅ Documented above
~~4. Deploy docker-compose.yml~~ ✅ Done (Feb 20)

**Remaining:**

1. ~~**Create AWS S3 bucket**~~ ✅ Done — `iris-synology-backup` (us-west-2)
2. ~~**Create IAM user**~~ ✅ Done — `synology-backup` with scoped S3 policy
3. ~~**Configure Hyper Backup → S3**~~ ✅ Done — daily 2 AM, Standard-IA, encrypted
4. ~~**Run first backup**~~ ✅ Running (Feb 20)
5. **Verify first backup** in DSM + AWS Console
6. **Storage cleanup** on volumes 1 & 2 (at 90%)
7. **Delete old root access key** in AWS Console (security hygiene)
