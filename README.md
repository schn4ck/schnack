# schnack.js

[Schnack](https://dict.leo.org/englisch-deutsch/schnack) is a simple Disqus-like drop-in commenting system written in JavaScript.

* [Documentation](https://schnack.cool/)
* [Say hello to Schnack.js](https://www.vis4.net/blog/2017/10/hello-schnack/)
* Follow [@schnackjs](https://twitter.com/schnackjs) on Twitter

## What the schnack?

Features:
- Tiny! It takes only ~**8 KB!!!** to embed Schnack.
- **Open source** and **self-hosted**.
- Ad-free and Tracking-free. Schnack will **not disturb your users**.
- It's simpy to moderate, with a **minimal** and **slick UI** to allow/reject comments or trust/block users.
- **[webpush protocol](https://tools.ietf.org/html/draft-ietf-webpush-protocol-12) to notify the site owner** about new comments awaiting for moderation.
- **Third party providers for authentication** like Github, Twitter, Google and Facebook. Users are not required to register a new account on your system and you don't need to manage a user management system.

### Quickstart

This is the fastest way to setup *schnack*.

**Requirements**:
- Node.js (>= v6)
- npm (>= v5)

Clone or download schnack:

```bash
git clone https://github.com/schn4ck/schnack
```

Go to the schnack directory:
```bash
cd schnack
```

Install dependencies:
```bash
npm install
```

Copy and edit the config file according to [configuration](https://schnack.cool/#configuration) section:

```bash
cp config.tpl.json config.json
vim config.json                 # or open with any editor of your choice
```

Run the server:
```bash
npm start
```

Embed in your HTML page:

```html
<div class="comments-go-here"></div>
<script src="https://comments.example.com/embed.js"
    data-schnack-slug="post-slug"
    data-schnack-target=".comments-go-here">
</script>
```

**or** initialize *schnack* programmatically:

```html
<div class="comments-go-here"></div>

<script src="http://comments.example.com/client.js"></script>
<script>
    new Schnack({
        target: '.comments-go-here',
        slug: 'post-slug',
        host: 'http://comments.example.com'
    });
</script>
```

You will find further information on the [schnack page](https://schnack.cool/).

### Configuration

**Notify Providers:**

* pushover
* webpush
* slack
* rss
* sendmail
* [Jira](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)

#### Setting up Jira

The implementation of the Jira notifier (using the `jira-connector` package) creates a new job in the board of your choice, whenever a new comment is submitted. This allows your team to assign a workflow to the moderation / approval process.

**1: Generate an RSA Public / Private Key Pair**

Run these commands in _Terminal_ or _Bash_, **individually**; following all on-screen propmpts:

```
openssl genrsa -out jira_privatekey.pem 1024
```
```
openssl req -newkey rsa:1024 -x509 -key jira_privatekey.pem -out jira_publickey.cer -days 365
```
```
openssl pkcs8 -topk8 -nocrypt -in jira_privatekey.pem -out jira_privatekey.pcks8
```
```
openssl x509 -pubkey -noout -in jira_publickey.cer  > jira_publickey.pem
```

**2: Copy the certificate**

Copy the contents of the private key file, `_privatekey.pcks8`, to the `notify.jira.oauth.private_key` property, in the `confg.json` file, in the root folder of this application. An example can be found in `config.tpl.json`.

**3: Add a host name**

Add / copy / insert the your Jira host name to the `notify.jira.host` property, in the `confg.json` file, in the root folder of this application. An example can be found in `config.tpl.json`.

**4: Setup the Application in Jira**

1. Log into Jira using a privileged account, then visit [Atlassian Account API Token Manager](https://id.atlassian.com/manage/api-tokens)
1. Click _Create API Token_ and enter a label
1. When the [Your new API token](https://confluence.atlassian.com/cloud/files/938839638/938839639/1/1507010022324/Screen+Shot+2017-09-25+at+5.09.09+pm.png) modal is shown, click the _Copy to clipboard_ button
1. Using [your favourite Base64 Encoding tool](https://www.base64decode.org/), create the Base64 encoded string `my-email@example.com:my-copied-atlassian-token`
1. Copy the resulting string to the `notify.jira.basic_auth.base64` property

**5: Assign a board to receive notifications**

1. Collect a list of the boards available by running `npm run jira-boards`
2. Find the board you'd like to push notifications to, and note the `id`
3. Add the `id` to the `notify.jira.board_id`

### Who is behind Schnack?

Schnack is [yet another](https://github.com/gka/canvid/) happy collaboration between [Webkid](https://webkid.io/) and [Gregor Aisch](https://www.vis4.net), with a few minor additions from [Jerram Digital](https://jerram.co.uk/).

### Who is using Schnack?

Schnack will never track who is using it, so we don't know! If you are a Schnack user, [let us know](https://twitter.com/schnackjs) and we'll add your website here. So far Schnack is being used on:

* https://schnack.cool (scroll all the day down)
* https://vis4.net/blog
* https://blog.datawrapper.de
* https://blog.webkid.io

### Related projects

This is not a new idea, so there are a few projects that are doing almost the same thing:

* [CoralProject Talk](https://github.com/coralproject/talk) - Node + MongoDB + Redis
* [Discourse](https://github.com/discourse/discourse) - Ruby on Rails + PostgreSQL + Redis
* [Commento](https://github.com/adtac/commento) - Go + Node
* [Isso](https://github.com/posativ/isso/) - Python + SQLite3
* [Mouthful](https://mouthful.dizzy.zone) – Go + Preact
