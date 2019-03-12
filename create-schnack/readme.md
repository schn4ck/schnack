# create-schnack

You can use this script to setup Schnack.

```bash
mkdir my-schnack
cd my-schnack
npm init schnack
```

### What does it do?

* check if a Schnack config file (called `schnack.json` from now on) exists
* if it doesn't exist, copy the `schnack.tpl.json` to `schnack.json` and exit with a message asking the user to edit the config file and then run `npm init schnack` again
* if the config file exists, the init script installs `schnack` and the configured schnack plugins
