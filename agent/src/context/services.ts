/**
 * Embedded knowledge from docs/services.md
 * This provides the agent with infrastructure knowledge without needing to read files
 */

export const SERVICES_CONTEXT = `
# Infrastructure Overview

## Network
- Subnet: 10.1.11.0/24
- Gateway: 10.1.11.1 (Eero mesh)
- Public IP: 107.193.185.12 (dynamic, Synology DDNS)

## Synology NAS (IRIS - DS1520+)
- IP: 10.1.11.98
- SSH: port 2222, user mike
- DSM: https://conant.synology.me:5001
- Docker: /var/packages/ContainerManager/target/usr/bin/docker

## Home Assistant
- Container: home_assistant
- Config: /volume3/docker/homeassistant/
- Internal: http://10.1.11.98:8123
- External: https://ha.conant.com (via DSM reverse proxy)

## SmartThings Hub
- Hub ID: 3545970a-9fcf-440d-930a-d25686b48d74
- IP: 10.1.11.174
- All locks use RBoy Universal Enhanced Z-Wave Lock driver

## Z-Wave Locks
| Lock | Device ID | Security | Battery Notes |
|------|-----------|----------|---------------|
| Front Door | a9a852ec-f357-4de0-a12b-240df0ade739 | S0_LEGACY | Higher drain due to S0 |
| Utility Door | 915d7c8b-b66f-414e-ae48-1fcfc9d53db5 | S2_ACCESS_CONTROL | Normal |
| Garage Door | b608437a-d821-41f9-b8f1-24b858477b2d | S2_ACCESS_CONTROL | Normal |

## Docker Containers (Expected)
| Container | Image | Port |
|-----------|-------|------|
| home_assistant | homeassistant/home-assistant | 8123 |
| portainer | portainer/portainer-ce | 9000 |
| watchtower | containrrr/watchtower | - |
| oznu-homebridge | oznu/homebridge | 8581 |

## Volume Thresholds
| Volume | Warning | Critical |
|--------|---------|----------|
| volume1 | >85% | >95% |
| volume2 | >85% | >95% |
| volume3 | >85% | >95% |

## Wildcard Certificate
- Domain: *.conant.com + conant.com
- Tool: acme.sh at /volume3/docker/acme.sh/
- Auto-renewal: daily 3 AM (does NOT auto-deploy to DSM)
- Manual re-import needed every ~60 days

## Key Services
| Service | Health Check |
|---------|--------------|
| Home Assistant | http://10.1.11.98:8123 |
| Portainer | http://10.1.11.98:9000 |
| Homebridge | http://10.1.11.98:8581 |
| DSM | https://10.1.11.98:5001 |
| HA External | https://ha.conant.com |
`;

export const DEVICE_IDS = {
  locks: {
    frontDoor: "a9a852ec-f357-4de0-a12b-240df0ade739",
    utilityDoor: "915d7c8b-b66f-414e-ae48-1fcfc9d53db5",
    garageDoor: "b608437a-d821-41f9-b8f1-24b858477b2d",
  },
  heaters: {
    rightHeater: "b0dca074-7167-4e36-95d5-4ccf067c2bb2",
    leftHeater: "421abfbc-410f-4d2c-911f-d585f104e725",
  },
  hub: "3545970a-9fcf-440d-930a-d25686b48d74",
};

export const NETWORK = {
  nasIp: "10.1.11.98",
  nasPort: 2222,
  smartthingsHubIp: "10.1.11.174",
  gatewayIp: "10.1.11.1",
  haInternalUrl: "http://10.1.11.98:8123",
  haExternalUrl: "https://ha.conant.com",
  dsmUrl: "https://conant.synology.me:5001",
};
