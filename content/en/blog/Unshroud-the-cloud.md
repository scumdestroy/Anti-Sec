---
author: Jann Moon
title: Unshroad the Cloud - Atmospheric CyberWarfare Against Cloudflare
date: 2020-16-14
description: Cloudflare WAF Bypassing Experiments
math: true
thumbnail: floral4.jpg
---

# Unshroad the Cloud - Atmospheric CyberWarfare Against Cloudflare

### **Finding a website's real IP address**

Finding the IP address of a website can help you in finding vulnerabilities, performing accurate port scans and enumerating your target's surface and other hidden goods obscured and protected by a WAF or remote proxy.  In many cases, Cloudflare personifies this barrier to a smooth and simple penetration test, though through my research, I have discovered times where it can be eluded.  I've heard the statement that nothing can truly be completely safe, tamper-proof or untouchable but you can put enough inconveniences in your attacker's path to dissuade them towards an easier target.  I often feel like CloudFlare was built on the "Eureka!" moment upon hearing that phrase and decided to invest severe capital in hassling people trying to take a peek below the surface and tinker a little.  

It honestly doesn't matter because there are some options you have at your disposal to bypass the hassler (though only sometimes):  
  
First, this beautiful website keeps track of DNS and IP records sites may have had before signing up with cloudflare.  If they haven't switched servers or moved to a cloud network, only added the Cloudflare service, you're in luck.

 [http://crimeflare.org:82/cfs.html](http://crimeflare.org:82/cfs.html)  

 ### Update 2023
There's a gang of tools available now and obvious methods I somehow didn't think of when originally writing this article.  Here's a quick list:
- https://github.com/christophetd/CloudFlair
- https://search.censys.io/
- https://shodan.io/
- https://github.com/vincentcox/bypass-firewalls-by-DNS-history
- https://rhinosecuritylabs.com/cloud-security/cloudflare-bypassing-cloud-security/
- https://blog.christophetd.fr/bypassing-cloudflare-using-internet-wide-scan-data/

  
You can also see DNS history on  
[netcraft.com](https://toolbox.netcraft.com)  
[viewdns.info](https://viewdns.info)  
[securitytrails.com](https://securitytrails.com)  
  
If time permits, extensive OSINT and recon will aid any campaign, so commonly doing the usual web target recon and enumeration for finding subdomains, MX records and other assets with the usual tools can give you more IPs, connect to other domains horizontally and provide more clues.


Inching towards "Active Recon" methods, try sending an e-mail to a fake address at the domain you are trying to uncover (for example, bignastyfaker@cloudops.com) and check the raw e-mail response for originating IP.  



