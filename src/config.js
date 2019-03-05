const nconf = require('nconf');
const crypto = require('crypto');
const webpush = require('web-push');

// VAPID keys should only be generated only once.
const vapidKeys = webpush.generateVAPIDKeys();

nconf
    .argv()
    .file({ file: './config.json' })
    .env()
    .defaults({
        admins: [1],
        schnack_host: `http://localhost`,
        database: {
            comments: 'comments.db',
            sessions: 'sessions.db'
        },
        port: 3000,
        template: {
            login_status:
                '(signed in as %USER% :: <a class="schnack-signout" href="#">sign out</a>)'
        },
        date_format: 'MMMM DD, YYYY - h:mm a',
        notification_interval: 300000,
        oauth: {
            secret: crypto.randomBytes(64).toString('hex')
        },
        notify: {
            webpush: {
                vapid_public_key: vapidKeys.publicKey,
                vapid_private_key: vapidKeys.privateKey
            }
        }
    });

module.exports = nconf;
