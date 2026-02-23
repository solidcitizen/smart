# RDP to Hobbs (Windows PC)

## Machine Info
- **Name:** hobbs
- **IP:** 10.1.11.22 (reserved)
- **Auth:** Entra ID (mike@cadencegroup.com), passwordless
- **RDP Port:** 3389 (confirmed open)
- **RDP from Windows laptop:** works fine with Entra credentials

## Root Cause

Entra ID RDP on a LAN uses **PKU2U authentication** (X.509 certificates from Azure AD
device registration). Windows clients handle this natively. Third-party clients must use
the `enablerdsaadauth` web-based login flow, which requires:
- Connecting by **hostname** (not IP address) — must match the device name in Entra ID
- RDP properties `enablerdsaadauth:i:1` and `targetisaadjoined:i:1`

## Mac Prerequisites

### DNS: hostname must resolve
Add to `/etc/hosts` on the Mac:
```
10.1.11.22    hobbs
```
Verify: `ping hobbs` should resolve to 10.1.11.22.

### Hobbs: ensure Entra user is in Remote Desktop Users
```powershell
net localgroup "Remote Desktop Users" /add "AzureAD\mike@cadencegroup.com"
```

## Option 1: Windows App (Recommended)

### Install / Update
- Install from Mac App Store: [Windows App](https://apps.apple.com/app/windows-app/id1295203466)
- **Update to v11.3.2+** — v11.3.1 fixed multiple crashes including .rdp file import issues

### Connect via .rdp file
Open `hobbs.rdp` (in this folder) — it contains the required Entra auth properties.
You should get a web-based Entra ID login prompt with MFA support.

### Connect manually (if .rdp files still crash)
1. Open Windows App
2. Click "+", select "Add PC"
3. PC name: `hobbs` (NOT the IP address)
4. User: mike@cadencegroup.com
5. Connect — should trigger Entra web auth flow

### Troubleshooting Windows App crashes (macOS 26.x)
1. Update to latest version from App Store
2. Clean reinstall: delete app, clear `~/Library/Caches`, reinstall
3. Try disabling macOS firewall temporarily (System Settings > Network > Firewall)
4. Check Full Disk Access permissions

## Option 2: FreeRDP (Limited)

FreeRDP does **not** support Entra/PKU2U auth for on-premises machines. The `/sec:aad`
flag in FreeRDP 3.x only works for Azure-hosted VMs/AVD, not local Entra-joined PCs.

FreeRDP can only connect to hobbs if:
- A **local account** exists on hobbs, OR
- NLA is disabled on hobbs and you use the `AzureAD\` prefix

### Install
```bash
brew install freerdp        # provides xfreerdp3 (FreeRDP 3.x)
brew install --cask xquartz # required for X11 backend
```

### Connect with local account (if created)
```bash
export DISPLAY=:0
xfreerdp3 /v:10.1.11.22 /u:localuser /size:1920x1080 /bpp:32 /sound /dynamic-resolution /cert:tofu
```

### Connect with NLA disabled on hobbs
```bash
export DISPLAY=:0
xfreerdp3 /v:10.1.11.22 '/u:AzureAD\mike@cadencegroup.com' /sec:nla:off /size:1920x1080 /bpp:32 /sound /dynamic-resolution /cert:tofu
```

To disable NLA on hobbs: Settings > System > Remote Desktop > uncheck
"Require devices to use Network Level Authentication"
(Security trade-off: full RDP session is established before authentication)

## Option 3: Jump Desktop ($30, Alternative)

- Supports Entra auth with username format: `AzureAD\mike@cadencegroup.com`
- Disable NLA in connection settings (right-click > Edit > Advanced > uncheck NLA)
- [Jump Desktop Azure AD docs](https://support.jumpdesktop.com/hc/en-us/articles/360028935711)

## Fallback: Local RDP Account on Hobbs

If all Entra approaches fail from the Mac, create a dedicated local account:
```powershell
net user rdp YourPasswordHere /add
net localgroup administrators rdp /add
net localgroup "Remote Desktop Users" rdp /add
```
Then connect with any RDP client using `rdp` / `YourPasswordHere`.
