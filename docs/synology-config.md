# Synology DSM Configuration Export

> **Auto-generated** by `scripts/synology-export.sh`
> Do not edit manually — changes will be overwritten
> Last updated: 2026-02-20 16:02:30

## System Info

```
majorversion="7"
minorversion="3"
major="7"
minor="3"
micro="2"
buildphase="GM"
buildnumber="86009"
smallfixnumber="0"
nano="0"
base="86009"
productversion="7.3.2"
os_name="DSM"
builddate="2025/11/26"
buildtime="19:15:01"

IRIS

Linux IRIS 4.4.302+ #86009 SMP Wed Nov 26 18:19:17 CST 2025 x86_64 GNU/Linux synology_geminilake_1520+
```

## Installed Packages

```
SupportService
HyperBackupVault
WebStation
HybridShare
SecureSignIn
VPNCenter
phpMyAdmin
QuickConnect
CodecPack
TextEditor
UniversalViewer
GlacierBackup
MailServer
DNSServer
Python2
OAuthService
StorageAnalyzer
SMBService
ActiveBackup-Office365
Spreadsheet
ScsiTarget
Node.js_v18
Node.js_v20
Apache2.4
DirectoryServer
SynoOnlinePack_v2
SynologyDrive
ContainerManager
StorageManager
AIConsole
SynologyApplicationService
SynoAnalytics
LogCenter
SynologyPhotos
HyperBackup
ReplicationService
DownloadStation
Perl
Virtualization
WebDAVServer
CloudSync
SurveillanceVideoExtension
PHP8.2
SurveillanceStation
ProxyServer
MediaServer
SynoFinder
git
MariaDB10
FileStation
ActiveInsight
```

## Volume Status

```
/dev/mapper/cachedev_1  2.9T  2.6T  308G  90% /volume2
/dev/mapper/cachedev_0   15T   13T  1.6T  90% /volume1
/dev/mapper/cachedev_2   19T   13T  5.2T  72% /volume3
/volume3/@backup@        19T   13T  5.2T  72% /volume3/backup
/dev/mapper/cachedev_2   19T   13T  5.2T  72% /volume3/@appdata/ContainerManager/all_shares/archive
/dev/mapper/cachedev_2   19T   13T  5.2T  72% /volume3/@appdata/ContainerManager/all_shares/CadenceMS365backup
/dev/mapper/cachedev_2   19T   13T  5.2T  72% /volume3/@appdata/ContainerManager/all_shares/docker
/dev/mapper/cachedev_2   19T   13T  5.2T  72% /volume3/@appdata/ContainerManager/all_shares/Downloads
/dev/mapper/cachedev_2   19T   13T  5.2T  72% /volume3/@appdata/ContainerManager/all_shares/homes
/dev/mapper/cachedev_2   19T   13T  5.2T  72% /volume3/@appdata/ContainerManager/all_shares/photo
```

## Scheduled Tasks (crontab)

```
0	0	*	*	*	root	/var/packages/GlacierBackup/target/bin/synoglaciertool -e
0	0	*	*	*	root	/var/packages/MailServer/target/bin/syno_clean_junk --clean
0	1	*	*	*	root	/var/packages/MailServer/target/bin/MailScanner/clean.quarantine
0	3	*	*	*	root	/usr/syno/bin/synoschedtask --run id=8
0	0	14	9	*	root	/usr/syno/bin/synoschedtask --run id=3
0	19	*	*	*	root	/usr/syno/bin/synoschedtask --run id=7
30	0	*	*	1	root	/usr/syno/bin/synoschedtask --run id=1
0	3	*	*	0	root	/usr/syno/bin/synoschedtask --run id=4
```

## Docker Containers

```
NAMES             IMAGE                                 STATUS
home_assistant    homeassistant/home-assistant:latest   Up 6 minutes
portainer         portainer/portainer-ce:latest         Up 6 minutes
watchtower        containrrr/watchtower:latest          Up 6 minutes (healthy)
oznu-homebridge   oznu/homebridge:latest                Up 6 minutes
```

## Docker Images (top 10 by size)

```
REPOSITORY                     TAG       SIZE
homeassistant/home-assistant   latest    2.29GB
ubuntu                         latest    78.1MB
portainer/portainer-ce         latest    183MB
homeassistant/home-assistant   <none>    2.29GB
homeassistant/home-assistant   <none>    2.29GB
homeassistant/home-assistant   <none>    2.27GB
homeassistant/home-assistant   <none>    2.26GB
ubuntu                         <none>    78.1MB
homeassistant/home-assistant   <none>    2.27GB
homeassistant/home-assistant   <none>    2.26GB
```

## Reverse Proxy Rules

*Note: Reverse proxy config requires DSM UI export or manual documentation.*

| Source | Destination | WebSocket |
|--------|-------------|-----------|
| https://ha.conant.com | http://localhost:8123 | Enabled |

## Network

```
```

## Shared Folders

```
drwxr-xr-x   41 root                root                     4096 Feb 16 08:29 .
drwxr-xr-x   25 root                root                     4096 Feb 15 22:20 ..
drwxrwxrwx    3 root                root                     4096 Mar  9  2020 NetBackup
drwxrwxrwx+   7 root                root                     4096 Sep 13  2021 hobbsimage
drwxrwxrwx+ 157               10000 root                    12288 Sep  8  2021 music
drwxrwxrwx+   8 root                root                     4096 Jul  5  2019 public
drwxrwxrwx   14 root                root                     4096 Mar  9  2025 surveillance
drwxrwxrwx+   9 root                root                     4096 Oct 23  2022 video
drwxrwxrwx    7 root                root                     4096 Apr 23  2025 web
drwxrwxrwx+   5 root                root                     4096 Feb 16 08:17 web_packages
drwxr-xr-x   8 root root  4096 Feb 15 22:05 .
drwxr-xr-x  25 root root  4096 Feb 15 22:20 ..
drwxrwxrwx+  7 root root  4096 Jul 16  2023 fujibackup
drwxr-xr-x   1 root       root         650 Feb 16 08:18 .
drwxr-xr-x  25 root       root        4096 Feb 15 22:20 ..
drwxrwxrwx+  1 root       root          84 May 21  2024 CadenceMS365backup
drwxrwxrwx+  1 root       root         410 Jun 27  2024 Downloads
drwxrwxrwx+  1 root       root        4790 Oct 29  2024 archive
drwxrwxrwx+  1 root       root       13920 Oct 11 09:29 backup
drwxrwxrwx+  1 root       root         330 Feb 20 15:53 docker
```
