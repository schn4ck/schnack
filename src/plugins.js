const fs = require('fs');
const path = require('path');
const config = require('./config');
const queries = require('./db/queries');
const events = require('./events');

const pluginConfig = config.get('plugins');
const schnackHost = config.get('schnack_host');
const plugins = [];

module.exports = {
    loadPlugins({ db, app }) {
        // load plugins
        Object.keys(pluginConfig).forEach(pluginId => {
            // eslint-disable-next-line no-console
            console.log(`successfully loaded plugin ${pluginId}`);
            plugins.push(
                loadPlugin(pluginId)({
                    config: pluginConfig[pluginId],
                    host: schnackHost,
                    app,
                    db,
                    queries,
                    events
                })
            );
        });
    },
    plugins
};

function loadPlugin(pluginId) {
    if (fs.existsSync(path.join(__dirname, `./plugins/${pluginId}/index.js`))) {
        // local plugin
        return require(`./plugins/${pluginId}`);
    } else {
        // npm require (plugin need to be installed via npm first)
        try {
            return require(`schnack-plugin-${pluginId}`);
        } catch (err) {
            console.warn(`could not load plugin ${pluginId}`);
        }
    }
}
