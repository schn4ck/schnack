const webpush = require('web-push');
const { error } = require('../helper');

module.exports = ({ config, host, app, db, queries, events }) => {
    return {
        notify({ notifier, page_url }) {
            webpush.setVapidDetails(host, config.vapid_public_key, config.vapid_private_key);

            notifier.push((msg, callback) => {
                db.each(
                    queries.get_subscriptions,
                    (err, row) => {
                        if (error(err)) return;

                        const subscription = {
                            endpoint: row.endpoint,
                            keys: {
                                p256dh: row.publicKey,
                                auth: row.auth
                            }
                        };
                        webpush.sendNotification(
                            subscription,
                            JSON.stringify({
                                title: 'schnack',
                                message: msg.message,
                                clickTarget: msg.url
                            })
                        );
                    },
                    callback
                );
            });
        }
    };
};
