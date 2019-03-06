const fs = require('fs');
const countBy = require('lodash.countby');
const queries = require('./db/queries');

const { send_file, send_string, error, loadPlugin } = require('./helper');
const events = require('./events');
const config = require('./config');
const pluginConfig = config.get('plugins');

const notify = config.get('notify');
const schnack_host = config.get('schnack_host');

function init(app, db, awaiting_moderation) {
    // push notification apps
    const notifier = [];

    // initialize notify plugins
    Object.keys(pluginConfig).forEach(pluginId => {
        const plugin = loadPlugin(pluginId);

        if (plugin && typeof plugin.notify === 'function') {
            // eslint-disable-next-line no-console
            console.log(`successfully loaded plugin ${pluginId}`);
            plugin.notify({
                events,
                notifier,
                config: pluginConfig[pluginId],
                host: schnack_host,
                page_url: config.get('page_url'),
                db,
                queries
            });
        }
    });

    setInterval(() => {
        let bySlug;
        if (awaiting_moderation.length) {
            bySlug = countBy(awaiting_moderation, 'slug');
            next();
            awaiting_moderation.length = 0;
        }
        function next(err) {
            const k = Object.keys(bySlug)[0];
            if (!k || err) return;
            db.get(queries.get_settings, 'notification', (err, row) => {
                if (err) console.error(err.message);
                const cnt = bySlug[k];
                const msg = {
                    message: `${cnt} new comment${
                        cnt > 1 ? 's' : ''
                    } on "${k}" are awaiting moderation.`,
                    url: config.get('page_url').replace('%SLUG%', k),
                    sound: !row.active ? 'pushover' : 'none'
                };
                delete bySlug[k];
                setTimeout(() => {
                    notifier.forEach(f => f(msg, next));
                }, 1000);
            });
        }
    }, config.get('notification_interval'));

    // serve static js files
    app.use('/embed.js', send_file('build/embed.js'));
    app.use('/client.js', send_file('build/client.js'));
    app.use(
        '/push.js',
        send_string(
            fs
                .readFileSync('src/embed/push.js', 'utf-8')
                .replace('%VAPID_PUBLIC_KEY%', notify.webpush.vapid_public_key)
                .replace('%SCHNACK_HOST%', schnack_host),
            true
        )
    );

    // push notifications
    app.post('/subscribe', (request, reply) => {
        const { endpoint, publicKey, auth } = request.body;

        db.run(queries.subscribe, endpoint, publicKey, auth, err => {
            if (error(err, request, reply)) return;
            reply.send({ status: 'ok' });
        });
    });

    app.post('/unsubscribe', (request, reply) => {
        const { endpoint } = request.body;

        db.run(queries.unsubscribe, endpoint, err => {
            if (error(err, request, reply)) return;
            reply.send({ status: 'ok' });
        });
    });
}

module.exports = {
    init
};
