# Operational Runbook

**Last updated:** 2026-02-20

Step-by-step instructions for routine operations, health checks, and incident response.

> See also: [Service Registry](services.md) for what's running | [CHANGELOG](../CHANGELOG.md) for change history | [RECOVERY](../RECOVERY.md) for backup strategy & disaster recovery

---

## Routine Operations

### Daily Checks

No mandatory daily actions — automated systems handle it. Optionally glance at:
- HA dashboard (https://ha.conant.com) — lock status, battery levels
- DSM notifications (https://conant.synology.me:5001) — any warnings

### Certificate Re-Import to DSM

The acme.sh renewal runs daily at 3 AM and renews the cert ~every 60 days, but does **not** auto-deploy to DSM. When DSM shows a cert expiry warning (or roughly every 60 days):

1. SSH into IRIS: `ssh mike@10.1.11.98 -p 2222`
2. Check cert files exist:
   ```bash
   ls -la /volume3/docker/acme.sh/*.conant.com_ecc/
   ```
3. In DSM: **Control Panel → Security → Certificate**
4. Select the wildcard cert → **Settings** or re-import:
   - **Certificate:** `fullchain.cer`
   - **Private Key:** `*.conant.com.key`
5. Apply and verify: https://ha.conant.com loads without cert warning

**Future improvement:** Configure acme.sh deploy hook to auto-import to DSM.

### Docker Container Management

```bash
ssh mike@10.1.11.98 -p 2222
docker=/var/packages/ContainerManager/target/usr/bin/docker

# Check status
$docker ps -a

# Restart a container
$docker restart home_assistant

# View logs (last 50 lines)
$docker logs --tail 50 home_assistant

# Redeploy from compose
cd /volume3/docker
$docker compose up -d

# Manual image cleanup (Watchtower handles this automatically)
$docker image prune -a --filter "until=168h"
```

### SmartThings Device Troubleshooting

**Re-pair procedure** (when a device shows NONFUNCTIONAL or is unresponsive):

1. Open SmartThings app → Hub → Z-Wave Utilities → Z-Wave Exclusion
2. Trigger exclusion on the physical device (for locks: follow programming button sequence)
3. Wait for "device excluded" confirmation
4. Z-Wave Utilities → Scan nearby → pair the device
5. Accept S2 security if prompted
6. Assign the RBoy Universal Enhanced Z-Wave Lock driver in SmartThings app
7. Update the device ID in [services.md](services.md#z-wave-device-registry) and README.md

**Note:** Re-pairing changes the SmartThings device ID. HA entities will need re-mapping.

**Driver change procedure:**
1. SmartThings app → Device → three-dot menu → Driver → select new driver
2. **Warning:** Changing drivers on Z-Wave locks can cause NONFUNCTIONAL state (except RBoy, which handles transitions safely)

### Lock Code Management

**Programming codes** (via physical keypad):
- See Schlage programming instructions: https://instructions.allegion.com/instr/146/32418
- Credentials stored in `credentials/front-door.txt` (gitignored)

**Adding/removing user codes via SmartThings:**
1. SmartThings app → Lock device → Settings → Lock Codes
2. Or via HA: device page → Lock Codes (if exposed by RBoy driver)

---

## Health Checks

### Hyper Backup Verification

**Frequency:** Quarterly (or after any backup config change)

1. DSM → **Hyper Backup** → select the S3 task
2. Check "Last backup time" — should be within 24 hours
3. Check "Status" — should be "Successful"
4. Review backup log for any warnings
5. **Test restore** (quarterly): Restore a small folder to `/tmp/` to verify encryption password works

```bash
# Check S3 bucket size from Mac
aws s3 ls s3://iris-synology-backup/ --recursive --summarize
```

### Active Backup for M365 Verification

**Frequency:** Quarterly

1. DSM → **Active Backup for Microsoft 365** → Task List
2. Verify continuous backup is running
3. Check last sync time and status
4. Review any failed items

### Volume Space Check

**Frequency:** Quarterly (or when DSM warns)

```bash
ssh mike@10.1.11.98 -p 2222 "df -h /volume1 /volume2 /volume3"
```

| Volume | Warning | Critical |
|--------|---------|----------|
| volume1 | > 85% | > 95% |
| volume2 | > 85% | > 95% |
| volume3 | > 85% | > 95% |

**If volume full:** See [Incident Response — Volume Full](#volume-full).

### Docker Health

**Frequency:** Monthly

```bash
ssh mike@10.1.11.98 -p 2222
docker=/var/packages/ContainerManager/target/usr/bin/docker

# All containers should be "Up"
$docker ps -a

# Check for excessive dangling images (Watchtower should clean these)
$docker image ls --filter "dangling=true"
```

Verify all 4 containers from [services.md](services.md#docker-containers) are running.

### Certificate Expiry Check

**Frequency:** Monthly

1. DSM → **Control Panel → Security → Certificate**
2. Check expiry date on the wildcard cert
3. If expiring within 14 days: run the [re-import procedure](#certificate-re-import-to-dsm)

Or from the command line:
```bash
echo | openssl s_client -connect ha.conant.com:443 -servername ha.conant.com 2>/dev/null | openssl x509 -noout -dates
```

### Time Machine Status

**Frequency:** Quarterly

**gala (Mike's Mac):**
1. On gala: System Settings → General → Time Machine
2. Confirm NAS target is configured and connected
3. Check "Latest Backup" date — should be recent
4. If stale: trigger a manual backup

**fuji (Julia's Mac):**
- Last backup: 2021 — deferred decision (see [RECOVERY.md](../RECOVERY.md))

### Battery Monitoring

**Frequency:** Monthly (HA automation alerts at < 20%)

1. Check HA Lock Monitor dashboard → battery gauges
2. Or run: `./battery-trend.sh` for historical drain rates

**Battery replacement:**
- Schlage BE469 uses 4x AA batteries
- Access via interior cover plate
- After replacement: verify lock responds in SmartThings and HA

---

## Incident Response

### NAS Unresponsive

1. Check network: `ping 10.1.11.98`
2. Try DSM web UI: https://conant.synology.me:5001
3. Try SSH: `ssh mike@10.1.11.98 -p 2222`
4. If all fail: physical power cycle (hold power button 4 sec, wait 30 sec, press again)
5. After reboot: verify Docker containers restarted (`docker ps -a`)
6. If DSM won't boot: see [RECOVERY.md — Full NAS Recovery](../RECOVERY.md#full-nas-recovery-hardware-failure)

### Home Assistant Down

1. Check container status:
   ```bash
   ssh mike@10.1.11.98 -p 2222
   docker=/var/packages/ContainerManager/target/usr/bin/docker
   $docker ps -a | grep home_assistant
   ```
2. If stopped: `$docker start home_assistant`
3. If crashing (restart loop): check logs: `$docker logs --tail 100 home_assistant`
4. If config corrupted: restore from Hyper Backup (see [RECOVERY.md — HA Recovery](../RECOVERY.md#home-assistant-recovery))
5. Verify: `curl http://10.1.11.98:8123` returns HTML

### Certificate Expired

1. SSH to IRIS and test renewal:
   ```bash
   /volume3/docker/acme.sh/acme.sh --cron --home /volume3/docker/acme.sh
   ```
2. If renewal succeeds: re-import to DSM (see [re-import procedure](#certificate-re-import-to-dsm))
3. If renewal fails: check GoDaddy API credentials, DNS propagation
4. Emergency: issue a new cert:
   ```bash
   /volume3/docker/acme.sh/acme.sh --issue -d "*.conant.com" -d "conant.com" --dns dns_gd --home /volume3/docker/acme.sh
   ```

### Lock Offline / NONFUNCTIONAL

1. Check SmartThings app → Device → status
2. Try: SmartThings app → Hub → Z-Wave Utilities → Z-Wave Repair (fixes routing, not provisioning)
3. If still NONFUNCTIONAL: exclude and re-pair (see [re-pair procedure](#smartthings-device-troubleshooting))
4. After re-pair: update device ID in [services.md](services.md#z-wave-device-registry) and README.md
5. Re-map HA entities if device ID changed

### S3 Backup Failing

1. DSM → **Hyper Backup** → check error message
2. Common causes:
   - **IAM credentials expired/revoked:** Check AWS Console → IAM → `synology-backup` user
   - **Bucket access denied:** Verify `SynologyHyperBackup` policy on the IAM user
   - **Network issue:** Check NAS internet connectivity
3. Test from Mac:
   ```bash
   aws s3 ls s3://iris-synology-backup/ --profile mikebackup
   ```
4. If credentials need rotation: create new access key in AWS Console, update in DSM Hyper Backup task

### Volume Full

1. Identify consumers:
   ```bash
   ssh mike@10.1.11.98 -p 2222
   sudo du -sh /volumeN/*/ | sort -rh | head -20
   ```
2. **volume1:** Usually surveillance — check Surveillance Station retention settings
3. **volume2:** fuji Time Machine — only option is to delete stale bundle (2.6 TB)
4. **volume3:** Check for Docker image bloat, stale downloads, unexpected growth
5. Docker cleanup:
   ```bash
   docker=/var/packages/ContainerManager/target/usr/bin/docker
   $docker system prune -a --filter "until=168h"
   ```
6. See [RECOVERY.md — Cleanup Plan](../RECOVERY.md#cleanup-plan--phase-1) for past cleanup procedures

---

## Quarterly Audit Checklist

Perform every 3 months. Next due: **May 2026**.

- [ ] Verify all services in [service registry](services.md) are running
- [ ] Check volume utilization — flag any > 85%
- [ ] Review S3 costs in AWS Console (Billing → Cost Explorer)
- [ ] Verify Hyper Backup integrity — [test restore procedure](#hyper-backup-verification)
- [ ] Check Active Backup for M365 sync status
- [ ] Check all Time Machine clients — [procedure](#time-machine-status)
- [ ] Review Docker container health — [procedure](#docker-health)
- [ ] Check certificate expiry — [procedure](#certificate-expiry-check)
- [ ] Review DSM package updates (Control Panel → Update & Restore)
- [ ] Run `scripts/synology-export.sh`, diff against previous snapshot

---

## Annual Audit Checklist

Perform every February. Next due: **February 2027**.

- [ ] Full data audit: review all shared folders, identify new data, prune stale data
- [ ] Volume utilization deep dive — flag anything over 85%
- [ ] Verify Hyper Backup: full test restore of at least one folder from S3
- [ ] Spot-check S3 bucket — confirm data is present and recent
- [ ] Review S3 costs — adjust storage class if costs are unexpected
- [ ] Check all Time Machine clients
- [ ] Review all installed DSM packages — remove unused, update where needed
- [ ] Run `scripts/synology-export.sh`, compare with previous year
- [ ] Review this document and [services.md](services.md) — update sizes, add new services
- [ ] Update [RECOVERY.md](../RECOVERY.md) — verify backup coverage map is accurate
- [ ] Review and clean up Docker images and stopped containers
- [ ] Check DDNS and DNS records still resolve correctly
- [ ] Verify Smart Recycle rotation is working (check backup versions in Hyper Backup)
- [ ] Set calendar reminder for next annual audit
