const passport = require('passport');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const queries = require('./db/queries');
const config = require('./config');
const authConfig = config.get('oauth');
const trustConfig = config.get('trust');
const { plugins } = require('./plugins');

const providers = [];

const authPlugins = [];

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

    passport.serializeUser(async (user, done) => {
        const existingUser = await db.get(queries.find_user, [user.provider, user.id]).catch(err => {
            console.error('could not find user', err);
            throw err;
        });

        if (existingUser) return done(null, existingUser); // welcome back
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
        await db.run(queries.create_user, c_args).catch(err => {
            console.error('could not create user', err);
            throw err;
        });
        const newUser = await db.get(queries.find_user, [user.provider, user.id]).catch(err => {
            console.error('could not find user after insert', err);
            throw err;
        });
        if (newUser) {
            return done(null, newUser);
        }
        console.error('no user found after insert');
    });

    passport.deserializeUser((user, done) => {
        done(null, {
            provider: user.provider,
            id: user.provider_id
        });
    });

    // initialize auth plugins
    plugins.forEach(plugin => {
        if (typeof plugin.auth === 'function') {
            authPlugins.push(
                plugin.auth({
                    providers,
                    passport,
                    app
                })
            );
        }
    });
}

function getAuthorUrl(comment) {
    if (comment.user_url) return comment.user_url;
    for (let i = 0; i < authPlugins.length; i++) {
        if (typeof authPlugins[i].getAuthorUrl === 'function') {
            const url = authPlugins[i].getAuthorUrl(comment);
            if (url) return url;
        }
    }
    return false;
}

module.exports = {
    init,
    providers,
    getAuthorUrl
};
