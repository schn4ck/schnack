# schnack.js

Forked from schn4ck/schnack, for detailed documentation, please refer there.

This is a docker friendly version with their changes.

I am trying to make it up-to-date as much as possible.

[Schnack](https://dict.leo.org/englisch-deutsch/schnack) is a simple Disqus-like drop-in commenting system written in JavaScript.

-   [Documentation](https://schnack.cool/)
-   [Say hello to Schnack.js](https://www.vis4.net/blog/2017/10/hello-schnack/)
-   Follow [@schnackjs](https://twitter.com/schnackjs) on Twitter

## What the schnack?

Features:

-   Tiny! It takes only ~**8 KB!!!** to embed Schnack.
-   **Open source** and **self-hosted**.
-   Ad-free and Tracking-free. Schnack will **not disturb your users**.
-   It's simpy to moderate, with a **minimal** and **slick UI** to allow/reject comments or trust/block users.
-   **[webpush protocol](https://tools.ietf.org/html/draft-ietf-webpush-protocol-12) to notify the site owner** about new comments awaiting for moderation.
-   **Third party providers for authentication** like Github, Twitter, Google and Facebook. Users are not required to register a new account on your system and you don't need to manage a user management system.

### Quickstart

*Note: If you are updating Schnack from a 0.x version check out the separate [upgrade instructions](docs/migrating-to-schnack-1.md).*

This is the fastest way to setup _schnack_.

**Requirements**:

-   Node.js (>= v8)
-   npm (>= v6)

Create a new folder for schnack and change into it:

```bash
mkdir schnack
cd schnack
npm init schnack
```

if there is no `schnack.json` in this folder, the init script copied over the default config and ask you if you want to configure your server interactively.

alternatively you can just edit the config file according to [configuration](https://schnack.cool/#configuration) section:

```bash
vim schnack.json                 # or open with any editor of your choice
```

Finally, run `npm init schnack` again to finish installation:

```bash
npm init schnack
```

Run the server:

```bash
npm start
```

If you want to try out Schnack on localhost (without authentication), run

```bash
npm start -- --dev
```

Embed in your HTML page:

```html
<div class="comments-go-here"></div>
<script
    src="https://comments.example.com/embed.js"
    data-schnack-slug="post-slug"
    data-schnack-target=".comments-go-here"
></script>
```

**or** initialize _schnack_ programmatically:

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

### Plugins

Authentication and notification providers can be added via plugins.

```sh
npm install @schnack/plugin-auth-github  @schnack/plugin-auth-google @schnack/plugin-notify-slack
```

To enable the plugins you need to add them to the `plugins` section of your `schnack.json`:

```js
{
    // ...
    "plugins": {
        "auth-github": {
            "client_id": "xxxxx",
            "client_secret": "xxxxx"
        },
        "auth-google": {
            "client_id": "xxxxx",
            "client_secret": "xxxxx"
        },
        "notify-slack": {
            "webhook_url": "xxxxx"
        }
    }
}
```

if you want to write your own plugins you need to install them and specify their package name in the `schnack.json`. Otherwise Schnack would try to load as from `@schnack/plugin-my-plugin`.

```js
{
    // ...
    "plugins": {
        "my-plugin": {
            "pkg": "my-schnack-plugin",
            // ...
        }
    }
}
```

Feel free to open a PR on [schnack-plugins](https://github.com/schn4ck/schnack-plugins) with your plugin if you want to add it to the "official" repository.

### Who is behind Schnack?

Schnack is [yet another](https://github.com/gka/canvid/) happy collaboration between [Webkid](https://webkid.io/) and [Gregor Aisch](https://www.vis4.net), with amazing contributions from:

* [Jerram Digital](https://jerram.co.uk/)
* [Levi Wheatcroft](https://github.com/leviwheatcroft)

### Who is using Schnack?

Schnack will never track who is using it, so we don't know! If you are a Schnack user, [let us know](https://twitter.com/schnackjs) and we'll add your website here. So far Schnack is being used on:

-   https://schnack.cool (scroll all the day down)
-   https://vis4.net/blog
-   https://blog.datawrapper.de
-   https://blog.webkid.io

### Related projects

This is not a new idea, so there are a few projects that are doing almost the same thing:

-   [CoralProject Talk](https://github.com/coralproject/talk) - Node + MongoDB + Redis
-   [Discourse](https://github.com/discourse/discourse) - Ruby on Rails + PostgreSQL + Redis
-   [Commento](https://github.com/adtac/commento) - Go + Node
-   [Isso](https://github.com/posativ/isso/) - Python + SQLite3
-   [Mouthful](https://mouthful.dizzy.zone) – Go + Preact

### Developer notes

If you want to run your Schnack server on https on localhost, add the following section to your `schnack.json`:

```js
{
    "ssl": {
        "certificate_path": "./certs/local.crt",
        "certificate_key": "./certs/local.key"
    }
}
```

To test changes on the `embed.js` and `client.js` templates you can open a local test server with minimal styles and by-passed authentication using

```bash
npm run dev
```

We're veIf you want to contribute additional **plugins**, check out the source code for the existing plugins first. We happily accept pull requests on [schnack-plugins](https://github.com/schn4ck/schnack-plugins).

This project used [Conventional Commits](https://www.conventionalcommits.org/).
