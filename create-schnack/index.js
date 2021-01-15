#! /usr/bin/env node
/* eslint no-console: "off" */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CWD = process.env.INIT_CWD || process.cwd();
let tag = process.argv.find(arg => arg.includes('--tag')) || '--tag=latest';
tag = tag.split('=')[1];

const pkg = {
    name: 'schnack.example.com',
    version: '1.0.0',
    private: true,
    scripts: {
        schnack: 'schnack'
    }
};

async function main() {
    const configPath = path.join(CWD, 'schnack.json');

    if (!fs.existsSync(configPath)) {
        console.log(`
❌ No schnack.json found!

   Aborting Schnack initialization.
   Please follow the setup instructions for schnack.

   https://github.com/schn4ck/schnack#readme
`);
        process.exit(1);
    }

    const { plugins } = require(configPath);

    const packages = Object.keys(plugins || {}).map(id => plugins[id].pkg || `@schnack/plugin-${id}`);

    fs.writeFileSync(path.join(CWD, 'package.json'), JSON.stringify(pkg, null, 4), {
        encoding: 'utf-8'
    });

    console.log('[npm] Start package installation.');
    const npm = spawn('npm', ['install', '-SE', '--production', `schnack@${tag}`].concat(packages));

    npm.stdout.on('data', data => process.stdout.write(data));
    npm.stderr.on('data', data => process.stderr.write(data));

    npm.on('close', () => {
        console.log('\nrun `npm run schnack` to start schnack');
    });
}

main();
