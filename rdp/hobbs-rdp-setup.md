# RDP to Hobbs (Windows PC)

## Machine Info
- **Name:** hobbs
- **IP:** 10.1.11.22 (reserved)
- **Auth:** Entra ID (mike@cadencegroup.com), passwordless
- **RDP Port:** 3389 (confirmed open)

## Mac Client Setup

### FreeRDP (installed)
```bash
brew install freerdp
```
Requires XQuartz (installed, needs logout for auto-DISPLAY):
```bash
brew install --cask xquartz
```

### Connect via FreeRDP
```bash
export DISPLAY=:0  # until next login
xfreerdp /v:10.1.11.22 /u:mike@cadencegroup.com /size:1920x1080 /bpp:32 /sound /dynamic-resolution /cert:tofu
```

Bypass NLA (lets Windows login screen handle auth):
```bash
xfreerdp /v:10.1.11.22 /u:mike@cadencegroup.com /size:1920x1080 /bpp:32 /sound /dynamic-resolution /cert:tofu /sec:tls
```

### Windows App (installed, v11.3.0)
- Location: /Applications/Windows App.app
- Crashes when opening .rdp files (macOS 26.3 issue), but launches fine directly
- Supports Entra/Azure AD auth natively (unlike FreeRDP)
- Add PC: 10.1.11.22, user: mike@cadencegroup.com

## Current Issue
Authentication fails with "The user name or password is incorrect" for Entra credentials. Likely needs configuration on hobbs.

## Things to Check on Hobbs
1. **Settings > System > Remote Desktop** — confirm enabled
2. **Remote Desktop Users** — ensure mike@cadencegroup.com is listed
3. **NLA setting** — Entra accounts can be blocked by Network Level Authentication
4. Consider creating a local RDP account as fallback:
   ```powershell
   net user rdp YourPasswordHere /add
   net localgroup administrators rdp /add
   net localgroup "Remote Desktop Users" rdp /add
   ```
