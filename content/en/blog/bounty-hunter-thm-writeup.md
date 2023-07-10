---
author: "Jann Moon"
title: "Bounty Hunter Write-up (TryHackMe)"
date: 2022-07-15
description: "Write-Up for Bounty Hunter on TryHackMe"
tags: ["tryhackme", "writeups", "ctf"]
thumbnail: floral2.jpg
---

This is a write-up for a recently released room called “Bounty Hunter” created by Sevuhl on excellent CTF platform, TryHackMe. This room contains basic FTP enumeration, using Hydra with SSH and abuse of sudo for privilege escalation on an Ubuntu, Linux OS. I thought it was going to a bug bounty related room based on the name, but I guess it is Cowboy Bebop themed, though I am really clueless on that. I am not that kind of nerd, I guess.
https://tryhackme.com/room/cowboyhacker

## Enumeration
Right off the rip, as most all infosec minded individuals know, is to run the most ruthless and noisy nmap scan you can, since no blue teams are on the horn.

```sh
nmap -sV -A -O 10.10.84.81 -vv
````

As ftp allows anonymous access, that was my first place to attack. At first it appeared empty but moving to the parent folder ftp > cd .. shows two text files, one containing passwords and one containing a memo. For a while, I thought the internet service on my end or on the machine was funky, even trying to access ftp via a browser, but I couldn’t download the files, I think due to the syntax of where they are located or something else intentional by the box’s creator. Still not sure what it was, by I circumvented the challenge via accessing the file in the browser, by typing `ftp://10.10.84.81/..%2Ftasks.txt` and `ftp://10.10.84.81..%2Flocks.txt` (%2F is / in URL encoding).

On port 80, after running Nikto, ffuf for directory bruteforcing with a few lists and a couple more quick enumeration tools, there wasn’t really anything vulnerable or interesting (or really anything besides the one static index page). I thought the reason for it existing was to provide you with a list of users for password spraying, though in retrospect, it only served thematic purposes.

So armed with my abundant user list farmed from port 80 and the FTP file, I ran hydra on the SSH port, as options were limited.

```sh
hydra -L ./users.txt -P /root/ctf/bountyhunter/pass.txt 10.10.84.81 -t 4 ssh
```
Eventually, you get to result and you login as **REDACTED** via the password **REDACTED**.

## Privilege Escalation
Right after I read the user flag, but before I bounce to /tmp to start sending myself linPeas.sh and its contemporaries, I always check `sudo -l` , as its probably the most common privilege escalation vector among CTFs. The gods smiled upon me this day, as a welcome response embellished itself across my terminal.

```sh
User lin may run the following commands on bountyhacker:
  (root) /bin/tar

```

Shooting over to GTFObins (https://gtfobins.github.io/gtfobins/tar/) to check on `tar` as a privilege escalation vector gave me the following command, which worked immediately, resulting in a very speedy win to root.

```sh
sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh
```

Like every box, I had fun and this is a great beginner box provided by a great platform. I almost always learn something worthwhile, and this time was no exception (%2F to bypass wonky FTP naming conventions). Thanks for reading and shoot me some handclaps if this helped you!
