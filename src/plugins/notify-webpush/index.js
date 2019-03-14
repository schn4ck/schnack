const fs = require('fs');
const webpush = require('web-push');
const { send_string, error } = require('../../helper');

module.exports = ({ config, host, app, db, queries, events }) => {
    if (!config.vapid_public_key) {
        // VAPID keys should only be generated only once.
        const vapidKeys = webpush.generateVAPIDKeys();
        config = {
            vapid_public_key: vapidKeys.publicKey,
            vapid_private_key: vapidKeys.privateKey
        };
        // eslint-disable-next-line no-console
        console.log(
            'please insert the following keys into \nyour `notify-webpush` config section:\n',
            config
        );
    }
    return {
        notify({ notifier, page_url }) {
            webpush.setVapidDetails(host, config.vapid_public_key, config.vapid_private_key);

            notifier.push((msg, callback) => {
                db.each(
                    queries.get_subscriptions,
                    (err, row) => {
                        if (err) return console.error(err);

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

            app.use(
                '/push.js',
                send_string(
                    fs
                        .readFileSync('src/embed/push.js', 'utf-8')
                        .replace('%VAPID_PUBLIC_KEY%', config.vapid_public_key)
                        .replace('%SCHNACK_HOST%', host),
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
    };
};
