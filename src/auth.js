const passport = require('passport');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const queries = require('./db/queries');
const config = require('../config.json');

const providers = [];

function init(app, db, domain) {
    app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: config.oauth.secret,
        cookie: { domain: `.${domain}` },
        store: new SQLiteStore({ db: 'sessions.db' })
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => {
        db.get(queries.find_user, [user.provider, user.id], (err, row) => {
            if (row) return done(null, row); // welcome back
            // nice to meet you, new user!
            // check if id shows up in auto-trust config
            var trusted = config.trust &&
                    config.trust[user.provider] &&
                    config.trust[user.provider].indexOf(user.id) > -1 ? 1 : 0;
            const c_args = [user.provider, user.id, user.displayName, user.username, trusted];
            db.run(queries.create_user, c_args, (err, res) => {
                if (err) return console.error(err);
                db.get(queries.find_user, [user.provider, user.id], (err, row) => {
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

    // twitter auth
    if (config.oauth.twitter) {
        providers.push({ id: 'twitter', name: 'Twitter' });
        passport.use(new TwitterStrategy({
            consumerKey: config.oauth.twitter.consumer_key,
            consumerSecret: config.oauth.twitter.consumer_secret,
            callbackURL: `${config.schnack_host}/auth/twitter/callback`
        }, (token, tokenSecret, profile, done) => {
            done(null, profile);
        }));

        app.get('/auth/twitter',
            passport.authenticate('twitter')
        );

        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                failureRedirect: '/login'
            }), (request, reply) => {
                reply.redirect('/success');
            }
        );
    }

    // github auth
    if (config.oauth.github) {
        providers.push({ id: 'github', name: 'Github' });
        passport.use(new GitHubStrategy({
            clientID: config.oauth.github.client_id,
            clientSecret: config.oauth.github.client_secret,
            callbackURL: `${config.schnack_host}/auth/github/callback`
        }, (accessToken, refreshToken, profile, done) => {
            done(null, profile);
        }));

        app.get('/auth/github',
            passport.authenticate('github', {
                scope: ['user:email']
            })
        );

        app.get('/auth/github/callback',
            passport.authenticate('github', {
                failureRedirect: '/login'
            }), (request, reply) => {
                reply.redirect('/success');
            }
        );
    }
}

function getAuthorUrl(comment) {
    switch (comment.provider) {
        case 'twitter': return 'https://twitter.com/'+comment.name;
        case 'github': return 'https://github.com/'+comment.name;
        default: return;
    }
}

module.exports = {
    init,
    providers,
    getAuthorUrl
};
