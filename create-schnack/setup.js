/* eslint no-console: "off" */
const fetch = require('node-fetch');
const { prompt, Confirm } = require('enquirer');
const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid');
const { white, green } = require('chalk');

const CWD = process.env.INIT_CWD || process.cwd();

async function setup() {
    // load default config from github
    const res = await fetch(
        'https://raw.githubusercontent.com/schn4ck/schnack/feature/plugins/schnack.tpl.json'
    );
    const defaultConfig = await res.json();

    console.log(`No ${green('schnack.json')} found in this directory. Copying default config from Github...`);

    const configureNow = await (new Confirm({
        message: `Do you want to configure your Schnack server now?`
    })).run();

    if (configureNow) {
        const response = await prompt([
            {
                type: 'input',
                name: 'schnack_host',
                message: 'Under what hostname will your Schnack server be running under?',
                initial: defaultConfig.schnack_host
            }, {
                type: 'input',
                name: 'port',
                message: 'Under what port will your Schnack server be reachable?',
                initial: defaultConfig.port
            }, {
                type: 'input',
                name: 'page_url',
                message: 'How does the URL pattern for your pages look like (use %SLUG%)?',
                hint: 'Use the placeholder %SLUG% for your page permalinks',
                initial: defaultConfig.page_url
            }, {
                type: 'multiselect',
                name: 'plugins',
                message: 'Select which plugins you want to enable',
                hint: 'Use [space] to select multiple plugins',
                choices: Object.keys(defaultConfig.plugins)
            }
        ]);

        Object.keys(response).forEach(key => {
            if (key === 'oauth_secret')
            if (key !== 'plugins') defaultConfig[key] = response[key];
            if (key !== 'plugins') defaultConfig[key] = response[key];
        })

        defaultConfig.oauth.secret = nanoid()

        const { plugins } = defaultConfig;
        defaultConfig.plugins = {};

        for (var i = 0; i < response.plugins.length; i++) {
            const plugin = response.plugins[i];
            const configureNow = await (new Confirm({
                message: `Do you want to configure ${white(plugin)} now?`
            })).run();
            if (configureNow) {
                const res = await prompt(Object.keys(plugins[plugin]).map(key => ({
                    type: 'input',
                    name: key,
                    message: `Enter the value for ${plugin}.${white(key)}:`,
                    initial: plugins[plugin][key]
                })));
                defaultConfig.plugins[plugin] = res;
            } else {
                defaultConfig.plugins[plugin] = plugins[plugin];
            }
        }
    }

    fs.writeFileSync(path.join(CWD, 'schnack.json'), JSON.stringify(defaultConfig, null, 4), {
        encoding: 'utf-8'
    });

    console.log(`Wrote ${green('schnack.json')}.`);

    if (!configureNow) {
        console.log(`Please edit ${green('schnack.json')} and then run ${white('npm init schnack')} again.`);
        process.exit();
    }

}

module.exports = setup;

