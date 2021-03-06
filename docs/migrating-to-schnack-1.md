# Migrating from Schnack 0.x to 1.x

Two major things have changed in version 1.0: the way Schnack is being installed and the name and format of the config file. Also all the authentication and notification providers are now [plugins](https://github.com/schn4ck/schnack-plugins/)!

Here's how you migrate your existing Schnack server to the new setup:

-   Create a new folder for schnack
-   Copy your old database files to the new folder (e.g., `comments.db` and `sessions.db`)
-   Copy your old `config.json` to the new folder
-   Rename `config.json` to `schnack.json`
-   In the config file you need to move the config sections for the auth and notify providers into the new `plugins` section (see below)
-   Then run `npm init schnack` in your new folder to install Schnack and the plugins
-   Now start schnack with `npm start`

Before:

```js
{
    "auth": {
        "twitter": {
            "consumer_key": "xxxxx",
            "consumer_secret": "xxxxx"
        }
    }
}
```

After:

```js
{
    "plugins": {
        "auth-twitter": {
            "consumer_key": "xxxxx",
            "consumer_secret": "xxxxx"
        }
    }
}
```

Here's the full list of all changed config paths

```
auth.facebook --> plugins.auth-facebook
auth.github --> plugins.auth-github
auth.google --> plugins.auth-google
auth.mastodon --> plugins.auth-mastodon
auth.twitter --> plugins.auth-twitter
notify.webpush --> plugins.notify-webpush
notify.pushover --> plugins.notify-pushover
notify.sendmail --> plugins.notify-sendmail
notify.slack --> plugins.notify-slack
```
