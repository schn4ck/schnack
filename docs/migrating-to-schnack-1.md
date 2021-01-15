### Migrating to Schnack 1.0

Two major things have changed in version 1.0: the way Schnack is being installed and the name and format of the config file.

-   create a new folder for schnack
-   copy your old `schnack.db` to the new folder
-   copy your old `config.json` to the new folder
-   rename `config.json` to `schnack.json`
-   in the config file you need to move the config sections for the auth and notify providers into the new `plugins` section.

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
