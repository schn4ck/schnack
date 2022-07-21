const nconf = require('nconf');
const crypto = require('crypto');

nconf
    .argv()
    .file({ file: './config/schnack.json' })
    .env()
    .defaults({
        admins: [1],
        schnack_host: `http://localhost`,
        database: {
            comments: 'comments.db',
            sessions: 'sessions.db'
        },
        port: 3000,
        plugins: {},
        template: {
            login_status:
                '(signed in as %USER% :: <a class="schnack-signout" href="#">sign out</a>)'
        },
        date_format: 'MMMM DD, YYYY - h:mm a',
        notification_interval: 300000,
        oauth: {
            secret: crypto.randomBytes(64).toString('hex')
        }
    });

module.exports = nconf;
