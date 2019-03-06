const fs = require('fs');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const queries = require('./db/queries');
const config = require('./config');
const pluginConfig = config.get('plugins');
const authConfig = config.get('oauth');
const trustConfig = config.get('trust');
const schnack_host = config.get('schnack_host');

const providers = [];

function init(app, db, domain) {
    app.use(
        session({
            resave: false,
            saveUninitialized: false,
            secret: authConfig.secret,
            cookie: { domain: `.${domain}` },
            store: new SQLiteStore({ db: config.get('database').sessions })
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => {
        db.get(queries.find_user, [user.provider, user.id], (err, row) => {
            if (err) return console.error('could not find user', err);
            if (row) return done(null, row); // welcome back
            // nice to meet you, new user!
            // check if id shows up in auto-trust config
            var trusted =
                trustConfig &&
                trustConfig[user.provider] &&
                trustConfig[user.provider].indexOf(user.id) > -1
                    ? 1
                    : 0;
            const c_args = [
                user.provider,
                user.id,
                user.displayName,
                user.username || user.displayName,
                user.profileUrl || '',
                trusted
            ];
            db.run(queries.create_user, c_args, (err, res) => {
                if (err) return console.error('could not create user', err);
                db.get(queries.find_user, [user.provider, user.id], (err, row) => {
                    if (err) return console.error('could not find user', err);
                    if (row) return done(null, row);
                    console.error('no user found after insert');
                });
            });
        });
    });

    passport.deserializeUser((user, done) => {
        done(null, {
            provider: user.provider,
            id: user.provider_id
        });
    });

    // initialize auth plugins
    Object.keys(pluginConfig).forEach(pluginId => {
        let plugin;
        if (fs.existsSync(path.join(__dirname, `./plugins/${pluginId}/index.js`))) {
            // local plugin
            plugin = require(`./plugins/${pluginId}`);
        } else {
            // npm requrie
            try {
                plugin = require(`schnack-plugin-${pluginId}`);
            } catch (err) {
                console.warn(`could not load plugin ${pluginId}`);
            }
        }
        if (plugin && typeof plugin.auth === 'function') {
            // eslint-disable-next-line no-console
            console.log(`successfully loaded plugin ${pluginId}`);
            plugin.auth({
                providers,
                passport,
                config: pluginConfig[pluginId],
                app,
                host: schnack_host,
                db,
                queries
            });
        }
    });
}

function getAuthorUrl(comment) {
    if (comment.user_url) return comment.user_url;
    switch (comment.provider) {
        case 'mastodon':
            return 'https://twitter.com/' + comment.name;
        case 'twitter':
            return 'https://twitter.com/' + comment.name;
        case 'github':
            return 'https://github.com/' + comment.name;
    }
}

module.exports = {
    init,
    providers,
    getAuthorUrl
};
