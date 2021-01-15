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
            const plugin = loadPlugin(pluginId, pluginConfig[pluginId]);
            if (typeof plugin === 'function') {
                // eslint-disable-next-line no-console
                console.log(`successfully loaded plugin ${pluginId}`);
                plugins.push(
                    plugin({
                        config: pluginConfig[pluginId],
                        host: schnackHost,
                        app,
                        db,
                        queries,
                        events
                    })
                );
            }
        });
    },
    plugins
};

function loadPlugin(pluginId, cfg) {
    if (fs.existsSync(path.join(__dirname, `./plugins/${pluginId}/index.js`))) {
        // local plugin
        return require(`./plugins/${pluginId}`);
    } else {
        // npm require (plugin need to be installed via npm first)
        try {
            const packageName = cfg.pkg || `@schnack/plugin-${pluginId}`;
            return require(packageName);
        } catch (err) {
            console.warn(`could not load plugin ${pluginId}`);
        }
    }
}
