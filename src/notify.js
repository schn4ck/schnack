const path = require('path');
const countBy = require('lodash.countby');
const queries = require('./db/queries');

const { send_file } = require('./helper');
const config = require('./config');
const { plugins } = require('./plugins');

function init(app, db, awaiting_moderation) {
    // push notification apps
    const notifier = [];

    // initialize notify plugins
    plugins.forEach(plugin => {
        if (typeof plugin.notify === 'function') {
            plugin.notify({
                notifier,
                page_url: config.get('page_url')
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
        async function next(err) {
            const k = Object.keys(bySlug)[0];
            if (!k || err) return;
            try {
                const row = await db.get(queries.get_settings, 'notification');
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
            } catch (err) {
                console.error(err.message);
            }
        }
    }, config.get('notification_interval'));

}

module.exports = {
    init
};
