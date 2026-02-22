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

1. **mike/** (2.3 TB) — **CONFIRMED**: Windows File History backup from HOBBS PC (~2.2 TB). Last updated Nov 2024. Backs up C:\Users\mike\ including OneDrive files
2. **octagon** (1.3 TB) contains massive Outlook PST files that overlap with `/volume3/archive/mail/`
3. **OneDriveMike** (653 GB) — Much larger than expected. Has 3 identical "Apps" folders + 36 GB video + 19 GB snagit
4. **#recycle** (204 GB) — Deleted files not purged. Can be emptied immediately
5. **hobbs/** (169 GB) — Contains Windows.old backup
6. **imazing** (164 GB) — iPhone backups, larger than expected
7. **synoreport** (76 GB) — Synology reports, unexpectedly large
8. **Dank** (28 GB) is 2011 photos that should move to `/volume3/photo/`

---

## Complete Folder Data

| Folder | Size | Earliest | Latest | Movies | Pictures | Documents | Recommendation |
|--------|------|----------|--------|--------|----------|-----------|----------------|
| mike/ | 2.3 TB | 2021 | 2024-11 | * | * | * | **KEEP** — Active HOBBS backup |
| octagon/ | 1.3 TB | 2012-11 | 2014-07 | 0 | 0 | ~20 GB PST | **DELETE** — Retired OCTET PC |
| OneDriveMike/ | 653 GB | 2020 | 2024 | 36 GB | * | * | **DEDUPE** — Delete Apps dupes |
| PRIME/ | 339 GB | 2011 | 2013 | * | * | * | Keep (has VMs) |
| gala.sparsebundle | 324 GB | 2025 | 2025 | * | * | * | **KEEP** — Active Time Machine |
| juli/ | 242 GB | 2012 | 2024 | * | 180 GB | * | **AUDIT** — iPhoto2.zip |
| WindowsImageBackup/ | 236 GB | 2013-01 | 2013-01 | 0 | 0 | 0 | **REVIEW** — System image |
| #recycle/ | 204 GB | * | * | * | * | * | **PURGE** — Empty immediately |
| hobbs/ | 169 GB | 2022-05 | 2022-12 | * | * | * | **DELETE** — Windows.old |
| imazing/ | 164 GB | 2023 | 2024 | * | * | * | Keep (iPhone backups) |
| synoreport/ | 76 GB | 2025 | 2025 | 0 | 0 | 0 | **REVIEW** — Large reports |
| Virtual Machines/ | 52 GB | 2014 | 2014 | 0 | 0 | 0 | **DELETE** — Old VMs |
| FMCBackup-9-26 | 43 GB | 2012-03 | 2023-04 | 2.4 GB | 810 MB | 3.8 GB | Keep (newer) |
| FMCBackup-7-22 | 42 GB | 2012-03 | 2022-09 | 2.4 GB | 690 MB | 1.0 GB | **DELETE** — Older copy |
| juli liveoak mac 2022/ | 40 GB | 2022 | 2022 | * | * | * | **REVIEW** — May overlap juli/ |
| vicd/ | 33 GB | 2013-05 | 2013-05 | 0 | 0 | 0 | **DELETE** — Old VM disk |
| Dank/ | 28 GB | 2008-04 | 2021-09 | 9.8 GB | 70 MB | 0 | **MOVE** — To /volume3/photo/ |
| apple/ | 23 GB | 2018 | 2018 | * | * | * | **REVIEW** — iPad backup |
| octet/ | 15 GB | 2014 | 2014 | 0 | 0 | * | **DELETE** — Duplicate PSTs |
| caelan/ | 8.3 GB | 2014 | 2014 | * | * | * | **REVIEW** — User backup |
| LocalBackup/ | 5.9 GB | 2002-08 | 2021-09 | 0 | 48 MB | 571 MB | **DELETE** — Old Synology |
| rogbackup/ | 4.3 GB | 2013 | 2013 | * | * | * | **REVIEW** — Old PC backup |
| quicken/ | 4.3 GB | 2024 | 2024 | 0 | 0 | * | Keep (financial) |
| mail/ | 3.2 GB | 2006 | 2012 | 0 | 0 | * | **AUDIT** — Compare archive |
| cdbackups/ | 3.2 GB | 2023 | 2023 | * | * | * | **REVIEW** — CD ISOs |
| sheila/ | 2.2 GB | 2024 | 2024 | * | * | * | Keep (recent) |
| googleworkspacebackup202823/ | 1.9 GB | 2023 | 2023 | 0 | * | * | Keep (Google export) |
| snape/ | 847 MB | 2015-01 | 2015-01 | 0 | 0 | 0 | **DELETE** — Old migration |
| BeerSmith2-hobby-beer/ | 668 MB | 2012-08 | 2014-01 | 0 | 0 | 0 | **CONSOLIDATE** |
| GDrive/ | 616 MB | 2011-12 | 2021-09 | 457 MB | 9 MB | 86 MB | **REVIEW** |
| webbackup/ | 558 MB | 2022 | 2022 | 0 | 0 | * | Keep (web config) |
| hobbies/ | 531 MB | 2014 | 2014 | 0 | 0 | 0 | **CONSOLIDATE** — Beer data |
| onedrivelibrary/ | 372 MB | 2023 | 2023 | * | * | * | **REVIEW** |
| oldgoogledrive/ | 212 MB | 2020 | 2020 | * | * | * | **DELETE** |
| wccases/ | 75 MB | 2023-09 | 2023-09 | 0 | 0 | 0 | Keep (app backup) |
| CGSGitHub_old/ | 7 MB | 2024-11 | 2024-11 | 0 | 0 | 0 | **REVIEW** |
| LinkedIn/ | 3 MB | 2020-01 | 2021-09 | 0 | 0 | 0 | Keep |
| BeerSmith2/ | 2.7 MB | 2014-01 | 2014-01 | 0 | 0 | 0 | **CONSOLIDATE** |
| claude_files/ | 1.3 MB | 2024 | 2024 | 0 | 0 | * | Keep |
| CGSGHcopy/ | 1.1 MB | 2024-11 | 2024-11 | 0 | 0 | 1.1 MB | **REVIEW** |
| paas/ | 328 KB | 2018-08 | 2021-09 | 0 | 0 | 0 | **DELETE** — Old password exports |
| CGSGHcopy-multi/ | 56 KB | 2024-11 | 2024-11 | 0 | 0 | 13 KB | **DELETE** |
| AVOCET/ | 0 | — | — | 0 | 0 | 0 | **DELETE** — Empty |
| CGSGitHub/ | 0 | — | — | 0 | 0 | 0 | **DELETE** — Empty |
| New folder/ | 0 | — | — | 0 | 0 | 0 | **DELETE** — Empty |

*Note: `*` indicates data not collected (large folder scan incomplete)*

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
| 1 | mike/ | 2.3 TB | **KEEP** — Active Windows File History for HOBBS (main PC) |
| 2 | octagon/ | 1.3 TB | **DELETE** — OCTET PC backup (2012-2014) + duplicate PSTs |
| 3 | OneDriveMike/ | 653 GB | **DEDUPE** — 3x Apps copies |
| 4 | PRIME/ | 339 GB | Keep (has VMs) |
| 5 | gala.sparsebundle | 324 GB | **KEEP** — Active Time Machine |
| 6 | juli/ | 242 GB | **AUDIT** — iPhoto2.zip |
| 7 | WindowsImageBackup/ | 236 GB | **REVIEW** — May duplicate PRIME |
| 8 | #recycle/ | 204 GB | **PURGE** — Empty recycle bin |
| 9 | hobbs/ | 169 GB | **DELETE** — Windows.old from Dec 2022 upgrade |
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
| **mike/** | 2.3 TB | **HOBBS/** (2.2 TB): Windows File History backup of HOBBS PC (main home PC). Includes Music, Videos, Pictures, OneDrive folders. Last updated Nov 2024. **FUJI-onedrivestuff/** (92 MB): OneDrive fragments. | 2021–2024 | **KEEP** — Active backup for primary home PC. May have overlap with OneDriveMike/ but provides local backup redundancy |
| **octagon** | 1.3 TB | **PST files** (~20 GB): Duplicated in `/volume3/archive/mail/`. **OCTET Windows Backup** (~1.28 TB): Windows File History from retired "OCTET" PC. 10+ years old. | 2012–2014 | **DELETE** — PSTs are duplicates, OCTET PC is retired. Confirm no unique data before deleting for 1.3 TB savings |
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

### 3. HOBBS + OneDrive Overlap (Potential 1+ TB savings)

**HOBBS backup** (mike/HOBBS/) contains FOUR OneDrive folder copies from the HOBBS PC:

| OneDrive Folder in HOBBS | Likely Overlap |
|--------------------------|----------------|
| OneDrive | Personal OneDrive |
| OneDrive - Cadence Group | Work OneDrive (in OneDriveMike?) |
| OneDrive - Michael Sullivan & Associates | Legacy work account |
| OneDrive - aptosbarrelclub.com | Club account |

**Potential overlap with:**

- `/volume3/backup/OneDriveMike/` (653 GB) — likely contains same Cadence Group data
- Current cloud OneDrive — if HOBBS PC is retired, this data is in the cloud

**Action:** Determine if HOBBS PC is still active. If retired, compare OneDrive folders for duplicates before deleting.

### 4. FMC Work Backups (42 GB savings)

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

| Category | Savings | Status |
|----------|---------|--------|
| mike/ folder | 0 | **KEEP** — Active HOBBS backup |
| octagon/ (OCTET backup + PST dupes) | 1.3 TB | **CONFIRMED DELETE** — OCTET retired |
| #recycle bin purge | 204 GB | Ready to purge |
| hobbs/ Windows.old | 169 GB | **CONFIRMED DELETE** — Dec 2022 upgrade remnant |
| OneDrive duplicates (Apps copies) | 46 GB | Ready to delete |
| FMC duplicate backup | 42 GB | Ready to delete |
| Old VMs (vicd, Virtual Machines) | 85 GB | Ready to delete |
| Old Windows backups (snape, LocalBackup) | 7 GB | Ready to delete |
| **Total Confirmed Savings** | **~2.0 TB** | |

---

## Next Steps

1. **Investigate mike/ folder** — This is the biggest unknown (2.3 TB). Run: `ls -la /volume3/backup/mike/` and `du -sh /volume3/backup/mike/*/`
2. **Verify octagon contents** — Second biggest win. Run: `ls -la /volume3/backup/octagon/Outlook*/` to see what PST files exist
3. **Empty #recycle bin** — Quick 204 GB win via DSM File Station
4. **Get julia's input** on her data folders (juli/, juli liveoak mac 2022/)
5. **Execute Phase 1 deletions** after review
6. **Update RECOVERY.md** with new backup folder structure after cleanup
