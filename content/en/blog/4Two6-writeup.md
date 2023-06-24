---
author: "Jann Moon"
title: "FourAndSix2 Writeup"
date: 2022-07-13
description: "FourAndSix2 Vulnhub Writeup"
tags: ["CTF", "vulnhub"]
thumbnail: floral6.jpg
---

This is a older-than-brand-new machine from October 2018 that I am resurrecting solely because I rolled the dice and grabbed a random machine from a random page. I know there are other write-ups but I bet none are newer than mine (DISCLAIMER: AT TIME OF WRITING)!

Created by [“Fred Wemeijer”]("https://www.vulnhub.com/author/fred-wemeijer,595/"), for the FourAndSix series (and no, of course, I have not tried any others.. yet.), the description simply drop ominous and eerie instructions: “Task is to become root and read /root/flag.txt.” It’s pretty fucked up, but let’s fire off some automated tools, fellow skids. ;)

![nmap](/426/1.jpg)
If you aren’t starting with nmap are you really starting at all?
Right away, I started to get pissed because there was no port 80 and I don’t like surprises. Since SSH is a fairly secure and ancient protocol, trying to break it is akin eat hot garbage at record speed. Hitting rpc and nfs for clues, I dropped some commands and hit some useful nuggets

```sh
rpcclient -U “” -N <IP> && showmount -e <IP>

NFS Export: /home/user/storage []
program vers proto   port  service
    100000    2   tcp    111  portmapper
    100000    2   udp    111  portmapper
    100005    1   udp    709  mountd
    100005    3   udp    709  mountd
    100005    1   tcp    718  mountd
    100005    3   tcp    718  mountd
    100003    2   udp   2049  nfs
    100003    3   udp   2049  nfs
    100003    2   tcp   2049  nfs
    100003    3   tcp   2049  nfs
Export list for 192.168.1.19:
/home/user/storage (everyone)
```

Since trying to mount /home and /home/storage gets rejected, you gotta mount the full path that it gives you, bro. You can mkdir a folder as a mount point for the NFS share and explore it as you please. Once in the folder, the only cool part was the backup.7z file. Very unrealistically, it is actually password-protected, unlike 99.9% of backups worldwide. But obviously, because there’s something wicked important in it.

Found this tool, even though I’m pretty sure that john or hashcat can already do this, but getting a binary unnecessarily is pretty fucking cool so I am gonna go ahead and drop the link to that.

https://github.com/philsmd/7z2hashcat/releases

Since I suck and it’s an .exe, I had to open it in Windows and then send it back again to Kali.


`.\7z2hashcat64–1.4.exe .\backup.7z`

Take that long ass string of alphanumeric migraine spellcasting and save it to a .txt file for you to crack. Then, crack it with John because like myself, hashcat neglects your graphics card as well and pretends it doesn’t exist.

```sh
john --format=7z hash.txt
```
The password is:: <do it yourself! 😃 >

So once we open this forsaken file, we get the ssh keys. This would be awesome, except after dropping them into our .ssh folder and renaming `id_rsa` to `authorized_keys`, this box still has the nerve to request a password from us.

I tried to write something in python real quick but it quickly turned into an abortive mess of spaghetti and mutated de-functions so I quickly hit up my good boy, github.com for some help. It came in the form of the first google link I tried and worked wonderfully. Big ups to the guy below who could do what I couldn’t so elegantly.


https://github.com/himadriganguly/ssh-password-cracker

```sh
python sshDictionaryAttack.py <IP_ADDRESS> user /root/wordlists/passwords/weaksauce.txt

```
The password for the ssh was: <do it yourself! 😃 >


Great OSINT skills, the password is only available to eagle eyes like yourself

Finally kicking through the front door after beating it down with all them weaksauce passwords
Like a dummy, it took me a couple mins of trying and failing with wget and curl to move files onto the box, until I realized I can just dump them into that mounted NFS share and get ’em poppin’.

Linpeas is my GOAT tool, so I always start with that, and if everything goes well, I don’t need anything more than that, which happened to be the case this time. I really dig how the tool highlights your best chance of attack (with backups) with excellent accuracy.

```sh
[+] checking /etc/doas.conf

permit nopass keepenv user as root cmd /usr/bin/less args /var/log/authlog
permit nopass keepenv root as root
```


To break this down, `doas.conf` is a configuration file that allows use to run `less` (a command that reads files bit by bit, like cat but a slow controlled dribble instead of the usual terminal vomit) on `/var/log/authlog`, as the root user. Well, `less` has a function I figured was kinda useless until now, where you can press “v” to bounce over to Vim (time to learn the commands, boy. Just kidding, I always use nano just like **you** unless I’m forced to use vim). Once in this vim screen, you can type `:sh` to bounce out of vim and into a basic bash shell.


And the final step, is to move to `/root/`and read the flag.txt.

Thanks for reading, till next time, skids!

## <!--more-->

## YouTube Privacy Enhanced Shortcode

{{< youtube ZJthWmvUzzc >}}

<br>

---

## Twitter Simple Shortcode

{{< twitter_simple 1085870671291310081 >}}

<br>

---

## Vimeo Simple Shortcode

{{< vimeo_simple 48912912 >}}
