# IRIS NAS — Data Management & Backup Guide

**NAS:** Synology DS1520+ (IRIS)
**Last Audit:** February 21, 2026

> See also: [Service Registry](docs/services.md) for hardware, services, and current config | [Runbook](docs/runbook.md) for operational procedures | [CHANGELOG](CHANGELOG.md) for change history

---

## Data Inventory

### Volume 1 — Media & Services (15 TB, 90% used)

| Shared Folder | Est. Size | Contents |
|---------------|-----------|----------|
| `/volume1/music/` | ~10 TB | Music library |
| `/volume1/video/` | ~1.5 TB | Video content (includes `familyvideos/` ~47 GB) |
| `/volume1/surveillance/` | Variable | Surveillance Station recordings (auto-recycled) |
| `/volume1/web/` | Small | Web Station files |
| `/volume1/web_packages/` | Small | Web Station packages |
| `/volume1/public/` | Small | Public shared folder |
| `/volume1/NetBackup/` | Unknown | Legacy NetBackup data |
| `/volume1/hobbsimage/` | Unknown | Image files |

### Volume 2 — Mac Backup (2.9 TB, 90% used)

| Shared Folder | Est. Size | Contents |
|---------------|-----------|----------|
| `/volume2/fujibackup/` | ~2.6 TB | fuji Time Machine — still in use but stale (last backup 2021) |

### Volume 3 — Core Data (19 TB, 55% used after Phase 1 cleanup)

| Shared Folder | Est. Size | Contents |
|---------------|-----------|----------|
| `/volume3/photo/` | ~113 GB | Family photos 1970s–2019 |
| `/volume3/archive/` | ~1.2 TB | Documents, financial, ancestry, work history |
| `/volume3/backup/` | ~3 TB | Time Machine bundles, Windows images, PRIME data |
| `/volume3/docker/` | ~210 MB | Container configs (HA, Homebridge, acme.sh, Portainer, git) |
| `/volume3/homes/` | ~78 GB | User home directories |
| `/volume3/Downloads/` | Variable | Download Station target |
| `/volume3/CadenceMS365backup/` | Unknown | Active Backup for M365 data |

---

## Data Classification

| Class | Data | Location | Backup Destination | Priority |
|-------|------|----------|--------------------|----------|
| **Irreplaceable** | Family photos (~113 GB, 1970s–2019) | `/volume3/photo/` | S3 Standard-IA (Hyper Backup) | Critical |
| **Irreplaceable** | Family videos (~47 GB) | `/volume1/video/familyvideos/` | S3 Standard-IA (Hyper Backup) | Critical |
| **Irreplaceable** | Archive (~1.2 TB — docs, financial, ancestry, work) | `/volume3/archive/` | S3 Standard-IA (Hyper Backup) | Critical |
| **Irreplaceable** | Email PST archives (~38 GB unique) | `/volume3/archive/mail/` (consolidation target) | S3 Standard-IA (Hyper Backup) | Critical |
| **Important** | Docker configs (HA, certs, git) | `/volume3/docker/` | S3 Standard-IA (Hyper Backup) | High |
| **Important** | User home directories | `/volume3/homes/` | S3 Standard-IA (Hyper Backup) | High |
| **Important** | Mac Time Machine — gala (active) | `/volume3/backup/` | S3 Standard-IA (Hyper Backup) | High |
| **Important** | Mac Time Machine — fuji (stale) | `/volume2/fujibackup/` | Deferred — see Phase 1e | Medium |
| **Protected elsewhere** | PC data (OneDrive) | OneDrive | Microsoft cloud | N/A |
| **Protected elsewhere** | Git repos | GitHub + Synology bare repo | GitHub | N/A |
| **Important** | Cadence Group M365 (OneDrive, email) | Active Backup for M365 (continuous) | Synology local | High |
| **Ephemeral** | Surveillance recordings | `/volume1/surveillance/` | None (auto-recycled) | Low |
| **Ephemeral** | Downloads | `/volume3/Downloads/` | None | Low |
| **Redundant** | Old Windows image backups | `/volume3/backup/WindowsImageBackup*` | Delete after verification | Cleanup |
| **Redundant** | Stale Time Machine bundles (mike) | `/volume3/backup/` | Delete | Cleanup |
| **Redundant** | Stale Time Machine bundles (Julia) | `/volume3/backup/` | Coordinate with Julia | Cleanup |

---

## Cleanup Plan — Phase 1

Remove stale and redundant data before expanding offsite backup.

### 1a. Delete mike-owned stale Time Machine bundles — DONE

| Bundle | Size | Last Used | Status |
|--------|------|-----------|--------|
| V3Q1YFVQ41.sparsebundle | 181 GB | Sep 2022 | Deleted Feb 20 |
| walle.sparsebundle | 548 GB | May 2017 | Deleted Feb 20 |

### 1b. Delete Julia's stale Time Machine bundles — DONE

| Bundle | Size | Last Used | Status |
|--------|------|-----------|--------|
| Julia's MacBook Pro.backupbundle | 904 GB | Nov 2021 | Deleted Feb 20 |
| Julia's MacBook Pro.sparsebundle | 563 MB | Sep 2021 | Deleted Feb 20 |
| Julia's Mac mini (2).backupbundle | 482 GB | Aug 2020 | Deleted Feb 20 |
| LOSD-FVFGQ4KPQ6LR.sparsebundle | 255 GB | Sep 2023 | Deleted Feb 20 |

**Total reclaimed (1a + 1b): ~2.37 TB.** Volume3: 72% → 64% (further reduced to 55% after all cleanup).

### 1c. Remove redundant PRIME Windows Image Backups

Three overlapping full-system images of the same PRIME PC:

| Path | Size | Date | Action |
|------|------|------|--------|
| `/volume3/backup/WindowsImageBackup/` | 236 GB | Jan 2013 | **KEEP** (newest) |
| `/volume3/backup/WindowsImageBackup-8-Jul-12/` | 254 GB | Jul 2012 | **DELETE** |
| `/volume3/backup/PRIME/` | 339 GB | 2011–2013 | **KEEP** (has VMs) |

The user's actual files (including PSTs) are already extracted in `/volume3/archive/PRIME-restore/` (125 GB).

```bash
sudo rm -rf "/volume3/backup/WindowsImageBackup-8-Jul-12/"
```

- [x] Deleted WindowsImageBackup-8-Jul-12 (~254 GB saved) — Feb 20

### 1d. Consolidate PST email archives

8,002 PST files exist on the NAS. ~7,900 are junk (HOBBS backup versioned a 6.1 MB file hourly). The remaining ~100 are real but heavily duplicated across 6 locations. `/volume3/archive/mail/` already exists as a prior partial consolidation — build on it.

**Source locations (in priority order):**

| Location | Contents | Status |
|----------|----------|--------|
| `/volume3/archive/mail/` | ~22 unique PSTs, prior consolidation | **Canonical — extend this** |
| `/volume3/archive/Agilent/AgilentC/` | Agilent work laptop image (3 subdirs with dupes) | Copy unique to mail/ |
| `/volume3/archive/PRIME-restore/C/Users/mike.CONNET/` | PRIME PC restore (Docs + AppData) | Already in mail/ |
| `/volume3/backup/mail/` | Pre-2006 ancient email (4 PSTs) | Copy to mail/ |
| `/volume3/backup/OneDriveMike/` | 3 identical dir trees (Documents, Documents (1), Documents_old) | Check for unique |
| `/volume3/archive/cadence/` | Mirrors OneDriveMike content | Check for unique |
| `/volume3/backup/mike/HOBBS/` | ~7,900 versioned copies of 6.1 MB file | **DELETE** (~48 GB junk) |

**Canonical PSTs (in `/volume3/archive/mail/` or to be added):**

| PST | Size | Era | Content |
|-----|------|-----|---------|
| A2014.pst | 8.7 GB | Agilent | Main work email through 2014 |
| archive.pst | 3.7 GB | Agilent | Older work email archive |
| migration 2014.pst | 2.2 GB | Agilent | Migration export |
| archive2013.pst | 534 MB | Agilent | 2013 archive |
| archive-12-Apr-05.pst | 2.0 GB | PRIME | Archive through Apr 2005 |
| archive-LIFE.pst | 1.3 GB | PRIME | Life Technologies email |
| archive-EMC.pst | 1.2 GB | PRIME | EMC-era email |
| emc-archive2013.pst | 652 MB | PRIME | EMC 2013 archive |
| archiveLIFE.pst | 377 MB | PRIME | Life Tech (older copy) |
| mike2007.pst | 282 MB | PRIME | 2007-era email |
| archive1-jan-07tbd.pst | 450 MB | PRIME | Jan 2007 archive |
| archive8.pst | 211 MB | PRIME | Archive segment |
| archive.pst | 137 MB | PRIME | Small archive |
| o365-migrate.pst | 125 MB | PRIME | O365 migration export |
| archiveo365.pst | 1.2 GB | PRIME | O365 archive |
| DeletedItems07.pst | 6.1 GB | PRIME | Deleted items (keep?) |
| sentitems07.pst | 1.6 GB | PRIME | Sent items (keep?) |
| GMS-mike@conant.com-*.pst | 6.4 GB | Google | Google Apps Sync export |
| mike27-Aug-01.pst | 508 MB | Pre-2006 | **Oldest — from backup/mail/** |
| archive27-Aug-2001.pst | 539 MB | Pre-2006 | **Oldest — from backup/mail/** |
| archive17-Jul-02.pst | 218 MB | Pre-2006 | **Oldest — from backup/mail/** |
| google mike at conant.com.pst | 41 MB | Cadence | Google workspace export |
| conant contacts backup.pst | 45 MB | Recent (Jun 2025) | **Contacts — from OneDriveMike** |
| old/archive.pst | 835 MB | Cadence | Older archive |

**Estimated unique data: ~38 GB** (plus ~6 GB DeletedItems/SentItems if kept)

**Steps:**

```bash
ssh mike@10.1.11.98 -p 2222

# 1. Copy pre-2006 PSTs from backup/mail/ to archive/mail/
sudo cp /volume3/backup/mail/mike27-Aug-01.pst /volume3/archive/mail/
sudo cp /volume3/backup/mail/archive27-Aug-2001.pst /volume3/archive/mail/
sudo cp /volume3/backup/mail/archive17-Jul-02.pst /volume3/archive/mail/

# 2. Copy Agilent PSTs (largest versions) if not already in archive/mail/
# Source: /volume3/archive/Agilent/AgilentC/Documents/Agilent/Outlook Files/

# 3. Copy unique Cadence/OneDrive PSTs
# - conant contacts backup.pst (45 MB, Jun 2025) — only in OneDriveMike
# - google mike at conant.com.pst (41 MB)
# - old/archive.pst (835 MB)

# 4. Delete HOBBS versioned junk (~48 GB)
sudo rm -rf "/volume3/backup/mike/HOBBS/Data/C/Users/mike/OneDrive/Documents/Outlook Files/"

# 5. Create README.txt index in /volume3/archive/mail/
```

- [x] Verified `/volume3/archive/mail/` had all PSTs from PRIME-restore — Feb 20
- [x] Copied pre-2006 PSTs from `/volume3/backup/mail/` (5 files) — Feb 20
- [x] Copied Agilent PSTs: A2014.pst (8.7 GB), agilent-archive.pst (3.7 GB) — Feb 20
- [x] Copied unique Cadence/OneDrive PSTs: contacts backup, google export, cadence-archive — Feb 20
- [ ] Decide whether to keep DeletedItems07.pst (6.1 GB) and sentitems07.pst (1.6 GB)
- [x] Deleted HOBBS versioned Outlook copies (13 GB) — Feb 20
- [x] Created README.txt index in `/volume3/archive/mail/` — Feb 20
- [ ] Verify: no unique PSTs remain only in backup/duplicate dirs (spot-check remaining sources)

### 1e. fuji Time Machine — Deferred

fuji (Julia's Mac) is still in use but hasn't backed up since 2021 (2.6 TB on volume2). Decision on whether to delete the stale bundle and start fresh, or keep it, to be made separately. This is the primary consumer of volume2 (90% full).

**Options:**
1. Delete bundle, reconfigure Time Machine on fuji → frees volume2
2. Keep as-is (volume2 stays at 90%)
3. Move fuji TM target to volume3 (has more headroom)

### Phase 1 Savings

| Action | Space Saved | Status |
|--------|-------------|--------|
| mike TM bundles (1a) | **729 GB** | Done |
| Julia TM bundles (1b) | **1.64 TB** | Done |
| PRIME Jul 2012 image (1c) | **254 GB** | Done |
| HOBBS PST junk copies (1d) | **13 GB** | Done |
| **Total reclaimed** | **~2.63 TB** | **Volume3: 72% → 55%** |

---

## Offsite Backup — Phase 2

### Current Hyper Backup → S3 Task

**Status:** Expanded Feb 21, 2026 — backing up all irreplaceable and valuable data (~1.5+ TB). Initial Docker-only task created Feb 20.

### Expanded Backup Scope

Add all irreplaceable and valuable data to the existing Hyper Backup → S3 task.

**How:** DSM → Hyper Backup → Edit S3 task → Add folders

| Folder | Est. Size | Contents | Status |
|--------|-----------|----------|--------|
| `/volume3/docker/` | ~210 MB | Container configs | Included since Feb 20 |
| `/volume3/photo/` | ~113 GB | Family photos 1970s–2019 | **Added Feb 21** |
| `/volume3/archive/` | ~1.2 TB | Documents, financial, ancestry, work history, PSTs | **Added Feb 21** |
| `/volume1/video/familyvideos/` | ~47 GB | Family video recordings | **Added Feb 21** |
| `/volume3/homes/` | ~78 GB | User home directories | **Added Feb 21** |
| `/volume3/backup/` | Large (TM gala, VMs, PRIME data) | TM (gala), VMs, PRIME data (after cleanup) | **Added Feb 21** |

**Estimated total offsite: ~1.5+ TB** (archive is 1.2 TB, significantly larger than initial 77 GB estimate)

### S3 Cost Estimate (after expansion)

| Item | Amount | Monthly Cost |
|------|--------|-------------|
| S3 Standard-IA storage | ~1.5+ TB | $15–22 |
| PUT requests (daily incremental) | ~100/day | $0.15 |
| **Total** | | **~$15–22/month** |

Previous Docker-only cost was ~$0.02/month. The increase is justified by protecting irreplaceable data (photos, archive, videos, email) that previously had no offsite copy. Archive alone is 1.2 TB (larger than initial 77 GB estimate due to full contents including PRIME-restore, Agilent images, etc.).

**Note:** The first backup after adding these folders will take significant time (initial upload of ~1 TB). Subsequent daily runs will be incremental and fast.

- [x] Added `/volume3/photo/` to Hyper Backup task — Feb 21
- [x] Added `/volume3/archive/` to Hyper Backup task — Feb 21
- [x] Added `/volume1/video/familyvideos/` to Hyper Backup task — Feb 21
- [x] Added `/volume3/homes/` to Hyper Backup task — Feb 21
- [x] Added `/volume3/backup/` to Hyper Backup task — Feb 21
- [ ] Initial backup completed
- [ ] Verified with `aws s3 ls s3://iris-synology-backup/ --recursive --summarize`

---

## Verification — Phase 3

### 3a. Check gala Time Machine

gala's last backup was October 2025 — 4 months ago. Verify on the Mac:

1. System Settings → General → Time Machine → confirm NAS target is configured
2. Check that the NAS share is mounted / accessible
3. Trigger a manual backup if needed

- [ ] gala Time Machine verified and running

### 3b. Audit Checklists

See [Runbook — Quarterly Audit](docs/runbook.md#quarterly-audit-checklist) and [Runbook — Annual Audit](docs/runbook.md#annual-audit-checklist).

---

## Hyper Backup → S3 Configuration

### Task Details

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

**Why S3 Standard-IA instead of Glacier:** Hyper Backup needs to read previous backup data for daily incrementals and integrity checks. Glacier objects require 3–5 hour retrieval, which breaks this. Standard-IA provides instant access at a modest storage premium.

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

---

## Backup Coverage Map

| Data | On NAS | Hyper Backup → S3 | Glacier Deep Archive | Other Offsite | Status |
|------|--------|-------------------|---------------------|---------------|--------|
| Docker configs (HA, certs, git) | volume3 | **Yes** (since Feb 20) | No | Git → GitHub | Covered |
| Family photos (1970s–2019) | volume3 | **Yes** (since Feb 21) | **Yes** (Feb 22) | None | Covered (2 tiers) |
| Family videos | volume1 | **Yes** (since Feb 21) | **Yes** (Feb 22) | None | Covered (2 tiers) |
| Archive (docs, financial, ancestry) | volume3 | **Yes** (since Feb 21) | No | None | Covered |
| Email PSTs (~38 GB unique) | volume3 | **Yes** (since Feb 21, within archive/) | No | None | Covered |
| User home dirs | volume3 | **Yes** (since Feb 21) | No | None | Covered |
| gala Time Machine (324 GB) | volume3 | **Yes** (since Feb 21, within backup/) | No | None | Covered |
| fuji Time Machine (2.6 TB) | volume2 | No (deferred) | No | None | Deferred |
| Music library (~10 TB) | volume1 | No (too large) | No | Rippable from CDs/purchased | Accepted risk |
| Surveillance recordings | volume1 | No | No | None | Ephemeral |
| PC data | — | — | — | OneDrive | Covered |
| Git repos | volume3 | Yes (in docker) | No | GitHub | Covered |
| Cadence Group M365 | volume3 | No | No | Active Backup for M365 (continuous, local) | Covered |

---

## Recovery Procedures

### Full NAS Recovery (Hardware Failure)

1. Replace hardware, install DSM 7.x
2. Install packages: ContainerManager, HyperBackup
3. Create shared folders to match original volume layout
4. Open Hyper Backup → create restore task → S3 Storage → `iris-synology-backup` bucket, `IRIS_1` directory
5. Enter encryption password → restore all folders
6. Restore Docker: `cd /volume3/docker && docker compose up -d`
7. Re-import wildcard certificate to DSM (Security → Certificate → Import)
8. Reconfigure reverse proxy: `ha.conant.com:443` → `localhost:8123`
9. Verify: HA dashboard, certs, git push, photo access

**RTO:** 8–48 hours (depends on S3 download speed for ~1.5+ TB)
**RPO:** 24 hours (daily backup)

### Home Assistant Recovery

```bash
ssh mike@10.1.11.98 -p 2222
docker=/var/packages/ContainerManager/target/usr/bin/docker
$docker stop home_assistant
# Restore config from Hyper Backup or manual copy
$docker start home_assistant
curl http://localhost:8123
```

### Certificate Recovery

```bash
# Restore acme.sh from backup to /volume3/docker/acme.sh/
# Test renewal:
/volume3/docker/acme.sh/acme.sh --cron --home /volume3/docker/acme.sh
# Re-import to DSM: Security > Certificate > Add > Import
```

### Photo / Archive / Video Recovery

1. Open DSM → Hyper Backup → select S3 task
2. Click Restore → choose version (by date)
3. Select the folder(s) to restore (`photo/`, `archive/`, `video/familyvideos/`)
4. Enter encryption password
5. Restore to original location or alternate path

### Time Machine Recovery (gala)

The gala Time Machine bundle is included in the `/volume3/backup/` Hyper Backup scope. To recover:

1. Restore `/volume3/backup/` from Hyper Backup (or the specific `.backupbundle`)
2. Re-share the backup folder via SMB in DSM
3. On the Mac: System Settings → Time Machine → re-select the NAS target

### Email PST Recovery

After consolidation (Phase 1d), all unique PSTs live in `/volume3/archive/mail/` with a README.txt index. This folder is backed up as part of `/volume3/archive/` to S3. ~38 GB of unique email spanning pre-2001 through 2025.

To access PSTs: mount the archive share or restore from S3, then open in Outlook or a PST viewer.

---

---

> Docker containers and DSM packages are tracked in [services.md](docs/services.md#docker-containers). Operational schedules and audit checklists are in the [Runbook](docs/runbook.md).

---

## RTO/RPO Targets

| System | RPO (Max Data Loss) | RTO (Max Downtime) | Justification |
|--------|---------------------|--------------------|--------------------|
| Home Assistant | 24 hours | 4 hours | Daily S3 backup; restore from config |
| Certificates | 7 days | 1 hour | Re-issue from acme.sh if needed |
| Photos / Archive | 24 hours | 8–24 hours | Daily S3 backup; large restore |
| Family Videos | 24 hours | 8–24 hours | Daily S3 backup; large restore |
| Email PSTs | 24 hours | 8–24 hours | Daily S3 backup (after consolidation) |
| Git repos | 0 (realtime) | 1 hour | Mirrored to GitHub |
| Surveillance | 30 days | 24 hours | Recordings are ephemeral |
| Cadence Group M365 | Continuous | 1 hour | Active Backup for M365 — retention beyond OneDrive's 30-day deletion window |

**Recovery Priority Order:**
1. Network connectivity (Eero, Synology)
2. Home Assistant (smart home control)
3. Certificates (external access)
4. Photos and irreplaceable data
5. Surveillance Station
6. Other services

---

## Glacier Backup (Cold Archive) — Phase 2b

### Task Details

| Setting | Value |
|---------|-------|
| **Destination** | AWS S3 Glacier Deep Archive |
| **Purpose** | Long-term cold storage for irreplaceable family media |
| **Schedule** | Manual or monthly (rarely changes) |

### Scope

| Folder | Volume | Est. Size | Contents |
|--------|--------|-----------|----------|
| `/volume1/video/familyvideos/` | volume1 | ~47 GB | Irreplaceable family video recordings |
| `/volume3/photo/` | volume3 | ~113 GB | Family photos 1970s–2019 |
| **Total** | | **~160 GB** | |

### Why Glacier for This Data

- **Rarely accessed** — family media is viewed occasionally, not daily
- **Must be preserved forever** — irreplaceable memories
- **Cost optimization** — Glacier Deep Archive is ~$1/TB/month vs $12.50/TB for Standard-IA
- **Already in S3 Standard-IA** — this provides a second-tier cold copy for disaster recovery

### Glacier vs S3 Standard-IA

| Feature | S3 Standard-IA (Hyper Backup) | Glacier Deep Archive |
|---------|-------------------------------|---------------------|
| Storage cost | $12.50/TB/month | $0.99/TB/month |
| Retrieval time | Instant | 12–48 hours |
| Use case | Active backups, daily incrementals | Cold archive, disaster recovery |
| Min storage | 30 days | 180 days |

**Note:** The same data is in both tiers. S3 Standard-IA provides fast restore for daily operations; Glacier provides ultra-low-cost long-term preservation.

- [x] Selected folders for Glacier backup — Feb 22
- [ ] Create Glacier Backup task in DSM
- [ ] Initial upload completed
- [ ] Verify with AWS Console

---

## Hyper Backup → S3 Setup Reference

Initial setup Feb 20, 2026. Expanded to full scope Feb 21, 2026. Kept here for rebuild/reconfiguration.

### DSM Hyper Backup Task Setup

1. Destination: S3 Storage → `s3.us-west-2.amazonaws.com`
2. Bucket: `iris-synology-backup` → Directory: `IRIS_1`
3. Storage class: Standard-IA
4. Folders: select all folders listed in Phase 2 scope
5. Schedule: Daily 2:00 AM, integrity check monthly
6. Rotation: Smart Recycle
7. Client-side encryption: Enabled

### Restore Procedure

1. Open DSM → **Hyper Backup** → select the S3 task
2. Click **Restore** → choose version (by date)
3. Select files/folders to restore
4. Enter the encryption password

For a full NAS rebuild: install Hyper Backup first, then create a "restore task" pointing to `iris-synology-backup` bucket, directory `IRIS_1`.

---

## Open Action Items

> Completed items are tracked in [CHANGELOG.md](CHANGELOG.md). General TODOs in [TODO.md](TODO.md).

### Phase 1 — Cleanup
- [ ] **1e.** Decide on fuji TM bundle (2.6 TB on volume2) — deferred
- [ ] Decide whether to keep DeletedItems07.pst (6.1 GB) and sentitems07.pst (1.6 GB)
- [ ] Verify: no unique PSTs remain only in backup/duplicate dirs

### Phase 2 — Expand Offsite Backup
- [x] Add `/volume3/photo/`, `/volume3/archive/`, `/volume1/video/familyvideos/`, `/volume3/homes/`, `/volume3/backup/` to Hyper Backup S3 task — Feb 21
- [ ] Run initial full backup (~1.5+ TB upload)
- [ ] Verify backup with `aws s3 ls s3://iris-synology-backup/ --recursive --summarize`

### Phase 3 — Verify & Maintain
- [ ] Check gala Time Machine — trigger manual backup if needed
- [ ] Verify first expanded S3 backup
- [ ] Delete old root access key in AWS Console (security hygiene)
- [ ] Set annual calendar reminder for data audit (February)

### Verification Commands

```bash
# Check volume free space
ssh mike@10.1.11.98 -p 2222 "df -h /volume1 /volume2 /volume3"

# Check S3 backup size
aws s3 ls s3://iris-synology-backup/ --recursive --summarize
```
