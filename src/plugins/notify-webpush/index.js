const fs = require('fs');
const path = require('path');
const webpush = require('web-push');
const { sendString, error } = require('../../helper');

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

            notifier.push(async msg => {
                await db.each(
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
                    }
                );
            });

            app.use(
                '/push.js',
                sendString(
                    fs
                        .readFileSync(path.resolve(__dirname, '../../embed/push.js'), 'utf-8')
                        .replace('%VAPID_PUBLIC_KEY%', config.vapid_public_key)
                        .replace('%SCHNACK_HOST%', host),
                    true
                )
            );

            // push notifications
            app.post('/subscribe', async (request, reply) => {
                const { endpoint, publicKey, auth } = request.body;

                try {
                    await db.run(queries.subscribe, endpoint, publicKey, auth);
                    reply.send({ status: 'ok' });
                } catch (err) {
                    error(err, request, reply);
                }
            });

            app.post('/unsubscribe', async (request, reply) => {
                const { endpoint } = request.body;

                try {
                    await db.run(queries.unsubscribe, endpoint);
                    reply.send({ status: 'ok' });
                } catch (err) {
                    error(err, request, reply);
                }
            });
        }
    };
};
