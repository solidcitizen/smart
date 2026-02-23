# HomeIT Project Configuration

## Network
- Subnet: 10.1.11.0/24 (mask 255.255.255.0, broadcast 10.1.11.255)
- Router/Gateway: Eero mesh network
- Public IP: 107.193.185.12 (dynamic, tracked by Synology DDNS)

## Synology NAS (IRIS - DS1520+)
- IP: 10.1.11.98
- DSM URL: https://conant.synology.me:5001
- DSM Version: 7.3.2-86009
- SSH: port 2222, user mike
- Docker path: /var/packages/ContainerManager/target/usr/bin/docker
- Volumes: /volume1, /volume2, /volume3

## Home Assistant
- Container: home_assistant (Docker, host networking)
- Config: /volume3/docker/homeassistant/
- External URL: https://ha.conant.com
- Internal URL: http://10.1.11.98:8123
- Reverse proxy: DSM (ha.conant.com:443 -> localhost:8123, WebSocket enabled)

## Wildcard Certificate
- Domain: *.conant.com + conant.com
- Issuer: Let's Encrypt (ECC)
- Tool: acme.sh v3.1.3 at /volume3/docker/acme.sh/
- DNS challenge: GoDaddy API
- Auto-renewal: DSM Task Scheduler "Renew wildcard cert" daily 3 AM
- Note: Renewal does NOT auto-deploy to DSM; manual re-import needed every ~60 days

## DNS (GoDaddy)
- ha.conant.com: CNAME -> conant.synology.me (follows Synology DDNS)
- supabase.conant.com: CNAME -> conant.synology.me (for GoTrue auth)

## Supabase (Self-Hosted)
- PostgreSQL: 10.1.11.98:5432 (internal only)
- GoTrue Auth: http://10.1.11.98:9999 (internal) / https://supabase.conant.com (external)
- Data: /volume3/docker/supabase/postgres/
- Config: /volume3/docker/supabase/
- Containers: supabase-db, supabase-auth
- Backup: Daily pg_dump at 4 AM, 7-day rotation

## SmartThings
- Hub ID: 3545970a-9fcf-440d-930a-d25686b48d74
- Hub IP: 10.1.11.174
- All locks on RBoy Universal Enhanced Z-Wave Lock driver

## Git Remotes
- origin: GitHub (solidcitizen/smart)
- synology: ssh://mike@10.1.11.98:2222/volume3/docker/git/smart.git

## Key Integrations (in HA)
- SmartThings: 31 devices (Z-Wave locks, heaters)
- Enphase Envoy: 59 devices (solar)
- Denon AVR / HEOS: 10 devices
- Mobile App: 2 devices
- Eero: NOT YET INSTALLED (needs HACS)
