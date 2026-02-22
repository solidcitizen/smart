/**
 * Embedded knowledge from docs/runbook.md
 * This provides the agent with operational procedures
 */

export const RUNBOOK_CONTEXT = `
# Operational Procedures

## Docker Container Management
\`\`\`bash
ssh mike@10.1.11.98 -p 2222
docker=/var/packages/ContainerManager/target/usr/bin/docker

# Check status
$docker ps -a

# Restart a container
$docker restart <container_name>

# View logs (last 50 lines)
$docker logs --tail 50 <container_name>

# Redeploy from compose
cd /volume3/docker && $docker compose up -d

# Manual image cleanup
$docker image prune -a --filter "until=168h"
\`\`\`

## Certificate Re-Import to DSM
When cert expires or DSM shows warning:
1. SSH into IRIS
2. Check cert files exist: ls -la /volume3/docker/acme.sh/*.conant.com_ecc/
3. In DSM: Control Panel → Security → Certificate
4. Select wildcard cert → re-import:
   - Certificate: fullchain.cer
   - Private Key: *.conant.com.key
5. Verify: https://ha.conant.com loads without warning

## Lock Re-Pair Procedure (NONFUNCTIONAL state)
1. SmartThings app → Hub → Z-Wave Utilities → Z-Wave Exclusion
2. Trigger exclusion on physical lock
3. Wait for "device excluded"
4. Z-Wave Utilities → Scan nearby → pair device
5. Accept S2 security if prompted
6. Assign RBoy Universal Enhanced Z-Wave Lock driver
7. Update device ID in services.md and README.md
NOTE: Re-pairing changes SmartThings device ID

## Incident Response

### NAS Unresponsive
1. Check: ping 10.1.11.98
2. Try DSM: https://conant.synology.me:5001
3. Try SSH: ssh mike@10.1.11.98 -p 2222
4. If all fail: physical power cycle
5. After reboot: verify Docker containers (docker ps -a)

### Home Assistant Down
1. Check container: docker ps -a | grep home_assistant
2. If stopped: docker start home_assistant
3. If crashing: docker logs --tail 100 home_assistant
4. Verify: curl http://10.1.11.98:8123

### Certificate Expired
1. Test renewal: /volume3/docker/acme.sh/acme.sh --cron --home /volume3/docker/acme.sh
2. If success: re-import to DSM
3. If fail: check GoDaddy API credentials

### Volume Full
1. Identify consumers: sudo du -sh /volumeN/*/ | sort -rh | head -20
2. volume1: check Surveillance Station retention
3. volume2: fuji Time Machine (2.6 TB, stale since 2021)
4. volume3: Docker cleanup, stale downloads
5. Docker cleanup: docker system prune -a --filter "until=168h"

### Lock Offline
1. Check SmartThings app → Device → status
2. Try Z-Wave Repair (fixes routing, not provisioning)
3. If NONFUNCTIONAL: exclude and re-pair (see procedure above)

## Health Check Thresholds
| Check | Warning | Critical |
|-------|---------|----------|
| Volume space | >85% | >95% |
| Lock battery | ≤35% | ≤20% |
| Cert expiry | ≤30 days | ≤14 days |
| Container restarts | Any | Restart loop |
`;

export const THRESHOLDS = {
  volume: {
    warn: 85,
    critical: 95,
  },
  battery: {
    warn: 35,
    critical: 20,
  },
  certDays: {
    warn: 30,
    critical: 14,
  },
};
