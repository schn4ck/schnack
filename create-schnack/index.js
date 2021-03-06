#! /usr/bin/env node
/* eslint no-console: "off" */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const setup = require('./setup');
const { white, green } = require('chalk');

const CWD = process.env.INIT_CWD || process.cwd();
let tag = process.argv.find(arg => arg.includes('--tag')) || '--tag=latest';
tag = tag.split('=')[1];

async function main() {
    const configPath = path.join(CWD, 'schnack.json');

    if (!fs.existsSync(configPath)) {
        await setup();
    }

    const { plugins, schnack_host } = require(configPath);

    // create package.json file if it doesn't exist
    if (!fs.existsSync(path.join(CWD, 'package.json'))) {
        console.log(`[init] Initialize ${green('package.json')} file.`);
        const pkg = {
            name: schnack_host.replace(/https?:\/\//, ''),
            version: '1.0.0',
            private: true,
            scripts: {
                start: 'schnack'
            }
        };
        fs.writeFileSync(path.join(CWD, 'package.json'), JSON.stringify(pkg, null, 4), {
            encoding: 'utf-8'
        });
    }

    const packages = Object.keys(plugins || {})
        .filter(id => id !== 'notify-webpush')
        .map(id => `${plugins[id].pkg || `@schnack/plugin-${id}`}@latest`);

    console.log('[npm] Start package installation.');
    const npm = spawn('npm', ['install', '-SE', '--production', `schnack@${tag}`].concat(packages));

    npm.stdout.on('data', data => process.stdout.write(data));
    npm.stderr.on('data', data => process.stderr.write(data));

    npm.on('close', () => {
        console.log(`\nrun ${white('npm start')} to start your Schnack server.`);
    });
}

main();
