# Backup Folder Audit Report

**Location:** `/volume3/backup/`
**Audit Date:** 2026-02-21
**Total Size:** ~5.8 TB (including 324 GB active Time Machine)

---

## Executive Summary

The `/volume3/backup/` folder contains 46 top-level items accumulated over 15+ years. Analysis reveals:

- **~3+ TB in duplicate/stale data** that can likely be deleted
- **mike/** folder alone is 2.3 TB — needs investigation (likely HOBBS backup remnants)
- **#recycle** contains 204 GB of deleted files not yet purged
- **hobbs/** is 169 GB (not empty as initially appeared — contains Windows.old)
- **Significant organizational debt** — same data copied multiple times with different folder names

### Key Findings (Updated with Full Sizes)

1. **mike/** (2.3 TB) — Largest folder! Contains HOBBS and FUJI-onedrivestuff. HOBBS likely has massive duplicates
2. **octagon** (1.3 TB) contains massive Outlook PST files that overlap with `/volume3/archive/mail/`
3. **OneDriveMike** (653 GB) — Much larger than expected. Has 3 identical "Apps" folders + 36 GB video + 19 GB snagit
4. **#recycle** (204 GB) — Deleted files not purged. Can be emptied immediately
5. **hobbs/** (169 GB) — Contains Windows.old backup
6. **imazing** (164 GB) — iPhone backups, larger than expected
7. **synoreport** (76 GB) — Synology reports, unexpectedly large
8. **Dank** (28 GB) is 2011 photos that should move to `/volume3/photo/`

---

## Folder Inventory

### Tier 1: Active / Keep (Current Time Machine)

| Folder | Size | Contents | Dates | Recommendation |
|--------|------|----------|-------|----------------|
| **gala.sparsebundle** | 324 GB | Mike's Mac Time Machine backup (active) | 2025 | **KEEP** — Active TM, included in S3 backup |

---

### Top 15 Folders by Size

| Rank | Folder | Size | Status |
|------|--------|------|--------|
| 1 | mike/ | 2.3 TB | **AUDIT** — HOBBS backup remnants? |
| 2 | octagon/ | 1.3 TB | **AUDIT** — PST duplicates |
| 3 | OneDriveMike/ | 653 GB | **DEDUPE** — 3x Apps copies |
| 4 | PRIME/ | 339 GB | Keep (has VMs) |
| 5 | gala.sparsebundle | 324 GB | **KEEP** — Active Time Machine |
| 6 | juli/ | 242 GB | **AUDIT** — iPhoto2.zip |
| 7 | WindowsImageBackup/ | 236 GB | **REVIEW** — May duplicate PRIME |
| 8 | #recycle/ | 204 GB | **PURGE** — Empty recycle bin |
| 9 | hobbs/ | 169 GB | **AUDIT** — Windows.old |
| 10 | imazing/ | 164 GB | Keep (iPhone backups) |
| 11 | synoreport/ | 76 GB | **REVIEW** — Why so large? |
| 12 | Virtual Machines/ | 52 GB | **DELETE** — 10+ year old VMs |
| 13 | FMCBackup-9-26/ | 43 GB | Keep (newer) |
| 14 | FMCBackup-7-22/ | 42 GB | **DELETE** — Older duplicate |
| 15 | juli liveoak mac 2022/ | 40 GB | **REVIEW** — May overlap juli/ |

---

### Tier 2: Large Legacy Data — Review Required

| Folder | Size | Contents | Dates | Recommendation |
|--------|------|----------|-------|----------------|
| **mike/** | 2.3 TB | HOBBS and FUJI-onedrivestuff subfolders. HOBBS likely contains massive backup duplicates. | 2021–2023 | **AUDIT** — Investigate contents. Potential 2+ TB savings if duplicated |
| **octagon** | 1.3 TB | Outlook PST files and email archives from PRIME-era PC. Contains mike@connet.techupside.com folder. | 2012–2013 | **AUDIT** — Compare with `/volume3/archive/mail/`. If duplicated, DELETE |
| **OneDriveMike** | 653 GB | OneDrive sync backup. Desktop, Documents, Apps (3 identical copies!), snagit (19 GB), video (36 GB). | 2020–2024 | **DEDUPE** — Delete Apps (1), Apps_old (saves 46 GB). Review for other duplicates |
| **PRIME** | 339 GB | Full Windows PC backup from 2011-2013. Contains VMs, user data, system files. User files already extracted to `/volume3/archive/PRIME-restore/`. | 2011–2013 | **KEEP for now** — Contains VMs |
| **juli** | 242 GB | Julia's data including iPhoto2.zip (180 GB), old iPhoto Library, MacProBackup, juli2024 | 2012, 2024 | **AUDIT** — iPhoto2.zip may duplicate `/volume3/photo/` |
| **WindowsImageBackup** | 236 GB | Windows system image backup from PRIME PC (Jan 2013). Full disk image. | 2013 | **REVIEW** — If PRIME folder has same data, this is redundant |
| **#recycle** | 204 GB | Deleted files not yet purged from recycle bin | Various | **PURGE** — Empty recycle bin immediately |
| **hobbs** | 169 GB | Contains Windows.old folder (old Windows installation backup) | 2022 | **AUDIT** — What's in Windows.old? Likely deletable |
| **imazing** | 164 GB | iPhone backups (2 device folders) — full device backups from iMazing app | 2023–2024 | **KEEP** — iPhone backups. Review if devices still exist |
| **synoreport** | 76 GB | Synology Storage Analyzer reports | 2025 | **REVIEW** — Unexpectedly large. Check retention settings |
| **Virtual Machines** | 52 GB | VMware VM images (V8 folder) from 2014 | 2014 | **DELETE** — 10+ year old VMs. Unlikely needed |
| **FMCBackup-7-22** | 42 GB | FMC work files backup from July 2022. SharePoint/Teams content. | 2022 | **DELETE** — Older duplicate of 9-26 version |
| **FMCBackup-9-26** | 43 GB | FMC work files backup from Sept 2022. Same structure as above. | 2022–2023 | **KEEP** — This is newer |
| **juli liveoak mac 2022** | 40 GB | Julia's Mac backup from 2022. Desktop, Documents, Downloads, Pictures. | 2022 | **REVIEW** — May overlap with juli/ folder |
| **vicd** | 33 GB | Single VMDK file (vicd-BACKUP.vmdk) — old VM disk image | 2013 | **DELETE** — 10+ year old VM disk |
| **Dank** | 28 GB | Photos organized by date (2011-01-17 through 2011-05-xx). JPG files from camera. | 2011 | **MOVE** — Consolidate into `/volume3/photo/2011/` |
| **apple** | 23 GB | iPad backup archive from 2018 (backup archive ipad proag) | 2018 | **REVIEW** — Delete if device no longer exists |
| **octet** | 15 GB | Email folder (mike@connet.techupside.com) from 2014 | 2014 | **AUDIT** — Compare with octagon and archive/mail |
| **caelan** | 8.3 GB | User data backup for caelan. Various files. | 2014 | **REVIEW** — Ask if still needed |

---

### Tier 3: Small/Medium Utility Backups

| Folder | Size | Contents | Dates | Recommendation |
|--------|------|----------|-------|----------------|
| **LocalBackup** | 5.9 GB | Synology local backup data (@app, cs folders) | 2011–2013 | **DELETE** — Very old Synology backup. No longer relevant |
| **rogbackup** | 4.3 GB | ROGER-PC Windows backup | 2013 | **REVIEW** — Old PC backup. Ask if needed |
| **quicken** | 4.3 GB | Quicken data files and backups | 2024 | **KEEP** — Recent financial data. Already consolidated? |
| **mail** | 3.2 GB | Pre-2006 email PST files | 2006–2012 | **AUDIT** — Compare with `/volume3/archive/mail/`. May be source or duplicate |
| **cdbackups** | 3.2 GB | CD/DVD ISO images or ripped content | 2023 | **REVIEW** — What CDs? Keep if irreplaceable |
| **sheila** | 2.2 GB | User data backup for sheila | 2024 | **KEEP** — Recent. Ask owner |
| **googleworkspacebackup202823** | 1.9 GB | Google Workspace export (mike folder) | 2023 | **KEEP** — Recent Google data export |
| **snape** | 847 MB | Windows Easy Transfer migration file from snape PC | 2015 | **DELETE** — 10+ year old PC migration. Data long since migrated |
| **BeerSmith2-hobby-beer** | 668 MB | Beer recipe files and archives | 2014 | **CONSOLIDATE** — Merge with BeerSmith2 and hobbies/beer |
| **GDrive** | 616 MB | Google Drive backup | 2021 | **REVIEW** — May overlap with googleworkspacebackup |
| **webbackup** | 558 MB | Web server backup from Dec 2022 (web-12-22-2022) | 2022 | **KEEP** — Web config backup |
| **hobbies** | 531 MB | Beer hobby files | 2014 | **CONSOLIDATE** — Merge with BeerSmith folders |
| **onedrivelibrary** | 372 MB | OneDrive app library data | 2023 | **REVIEW** — App metadata, likely not needed |
| **oldgoogledrive** | 212 MB | Old Google Drive sync data | 2020 | **DELETE** — Superseded by googleworkspacebackup |
| **wccases** | 75 MB | Strapi/postgres backup from Sept 2023 | 2023 | **KEEP** — App backup |
| **imazing** | Large | iPhone backups (2 devices). Very large due to full device backups. | 2023–2024 | **REVIEW** — Keep if devices still exist. Large storage consumer |
| **paas** | 328 KB | Password export files (Firefox, CSV) | 2018 | **DELETE** — Old password exports. Security risk if not encrypted |
| **claude_files** | 1.3 MB | Claude AI analysis files | 2024 | **KEEP** — Recent work files |

---

### Tier 4: Standalone Files (Root Level)

| File | Size | Contents | Date | Recommendation |
|------|------|----------|------|----------------|
| **CaptureData_*.dmg.zip** | 585 MB | Mac diagnostic capture from May 2023 | 2023 | **DELETE** — One-time diagnostic. No longer needed |
| **conant*.QDF-backup** (11 files) | ~1.1 GB total | Quicken backup files from 2011–2012 | 2011–2012 | **CONSOLIDATE** — Move to quicken/ folder or delete if superseded |
| **MediaID.bin** | 528 B | Windows Media ID file | 2011 | **DELETE** — System artifact |

---

### Tier 5: Empty/Minimal/System Folders

| Folder | Size | Contents | Recommendation |
|--------|------|----------|----------------|
| **AVOCET** | 0 | Empty | **DELETE** |
| **New folder** | 0 | Empty | **DELETE** |
| **CGSGitHub** | 0 | Empty | **DELETE** |
| **CGSGitHub_old** | 7 MB | Old GitHub backup | **REVIEW** — Delete if repos exist on GitHub |
| **CGSGHcopy** | 1.1 MB | GitHub copy | **REVIEW** — Consolidate with above |
| **CGSGHcopy-multi** | 56 KB | Another GitHub copy | **DELETE** |
| **hobbs** | ~0 | Just Windows.old folder | **DELETE** — Empty remnant |
| **BeerSmith2** | 2.7 MB | BeerSmith app data | **CONSOLIDATE** — Merge with BeerSmith2-hobby-beer |
| **LinkedIn** | 3 MB | LinkedIn data export | **KEEP** — Small, harmless |
| **synoreport** | Small | Synology reports | **KEEP** — System folder |
| **#recycle** | Variable | Recycle bin | **PURGE** — Empty recycle bin |

---

## Identified Duplicates & Consolidation Opportunities

### 1. Email/PST Archives (Potential ~1+ TB savings)

| Location | Size | Status |
|----------|------|--------|
| `/volume3/archive/mail/` | ~38 GB | **Canonical** — consolidated PSTs |
| `/volume3/backup/octagon/` | 1.3 TB | **AUDIT** — likely massive overlap |
| `/volume3/backup/octet/` | 15 GB | **AUDIT** — likely duplicate |
| `/volume3/backup/mail/` | 3.2 GB | **AUDIT** — may be source files |

**Action:** Compare octagon contents with archive/mail. If duplicated, delete octagon for 1+ TB savings.

### 2. OneDrive Copies (69 GB immediate savings)

| Folder | Size | Status |
|--------|------|--------|
| OneDriveMike/Apps | 23 GB | Keep |
| OneDriveMike/Apps (1) | 23 GB | **DELETE** — exact duplicate |
| OneDriveMike/Apps_old | 23 GB | **DELETE** — exact duplicate |

### 3. FMC Work Backups (42 GB savings)

| Folder | Size | Status |
|--------|------|--------|
| FMCBackup-9-26 | 43 GB | **KEEP** — newer |
| FMCBackup-7-22 | 42 GB | **DELETE** — older duplicate |

### 4. Photo Collections (should consolidate to /volume3/photo/)

| Folder | Size | Content |
|--------|------|---------|
| Dank | 28 GB | 2011 photos |
| juli/iPhoto2.zip | 180 GB | Julia's photos (verify not duplicate) |
| juli liveoak mac 2022/Pictures | ? | 2022 photos |

### 5. Beer/Hobby Data (should consolidate)

| Folder | Size |
|--------|------|
| BeerSmith2 | 2.7 MB |
| BeerSmith2-hobby-beer | 668 MB |
| hobbies/beer | 531 MB |

---

## Recommended Action Plan

### Phase 1: Quick Wins (Immediate, ~330 GB savings)

1. **Empty #recycle bin** — saves 204 GB
2. **Delete empty folders:** AVOCET, New folder, CGSGitHub
3. **Delete OneDriveMike duplicates:** Apps (1), Apps_old — saves 46 GB
4. **Delete FMCBackup-7-22** — saves 42 GB (keep 9-26 version)
5. **Delete standalone files:** CaptureData dmg, MediaID.bin — saves 585 MB
6. **Delete snape** Windows Easy Transfer — saves 847 MB
7. **Delete vicd** VM disk — saves 33 GB

### Phase 2: Audit & Consolidate (Requires verification)

1. **Audit mike/** — Investigate HOBBS and FUJI-onedrivestuff contents. Potential 2+ TB savings
2. **Audit octagon** — Compare PST files with `/volume3/archive/mail/`. If duplicates confirmed, delete for 1+ TB savings
3. **Audit hobbs/** — Check Windows.old contents. Likely deletable for 169 GB savings
4. **Audit octet and mail** — Same as octagon
5. **Move Dank photos** to `/volume3/photo/2011/` — consolidates photo collection
6. **Review juli/iPhoto2.zip** — Extract and compare with `/volume3/photo/`. If duplicate, delete for 180 GB savings
7. **Audit synoreport/** — Why is it 76 GB? Check retention settings
8. **Consolidate BeerSmith folders** into single location
9. **Move Quicken .QDF files** into quicken/ folder

### Phase 3: Review with Stakeholders

1. **julia's data:** Coordinate on juli/, juli liveoak mac 2022/ — what to keep?
2. **caelan's data:** Still needed?
3. **sheila's data:** Recent, ask owner
4. **Virtual Machines, PRIME, WindowsImageBackup:** Confirm VMs and system images no longer needed

---

## Potential Savings Summary

| Category | Potential Savings |
|----------|-------------------|
| mike/ folder (if HOBBS duplicates confirmed) | ~2.0–2.3 TB |
| Email/PST deduplication (octagon, octet) | ~1.0–1.3 TB |
| #recycle bin purge | 204 GB |
| hobbs/ Windows.old | 169 GB |
| OneDrive duplicates (Apps copies) | 46 GB |
| FMC duplicate backup | 42 GB |
| Old VMs (vicd, Virtual Machines) | 85 GB |
| Old Windows backups (snape, LocalBackup) | 7 GB |
| **Total Potential** | **~3.5–4.0 TB** |

The mike/ folder (2.3 TB) is the biggest unknown. If it contains HOBBS backup duplicates as suspected, this could reduce `/volume3/backup/` from ~5.8 TB to under 2 TB.

---

## Next Steps

1. **Investigate mike/ folder** — This is the biggest unknown (2.3 TB). Run: `ls -la /volume3/backup/mike/` and `du -sh /volume3/backup/mike/*/`
2. **Verify octagon contents** — Second biggest win. Run: `ls -la /volume3/backup/octagon/Outlook*/` to see what PST files exist
3. **Empty #recycle bin** — Quick 204 GB win via DSM File Station
4. **Get julia's input** on her data folders (juli/, juli liveoak mac 2022/)
5. **Execute Phase 1 deletions** after review
6. **Update RECOVERY.md** with new backup folder structure after cleanup
