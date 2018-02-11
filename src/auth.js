const passport = require('passport');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const queries = require('./db/queries');
const path = require('path');
const config = require(path.resolve(process.cwd(), 'config.json'));

const providers = [];

function init(app, db, domain) {
    app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: config.oauth.secret,
        cookie: { domain: `.${domain}` },
        store: new SQLiteStore({ db: config.database.sessions || 'sessions.db' })
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
            const c_args = [user.provider, user.id, user.displayName, user.username || user.displayName, trusted];
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

    // google oauth
    if (config.oauth.google) {
        providers.push({ id: 'google', name: 'Google' });
        passport.use(new GoogleStrategy({
            clientID: config.oauth.google.client_id,
            clientSecret: config.oauth.google.client_secret,
            callbackURL: `${config.schnack_host}/auth/google/callback`
        }, (accessToken, refreshToken, profile, done) => {
            done(null, profile);
        }));

        app.get('/auth/google',
            passport.authenticate('google', {
                scope: ['https://www.googleapis.com/auth/plus.login']
            })
        );

        app.get('/auth/google/callback',
            passport.authenticate('google', {
                failureRedirect: '/login'
            }), (request, reply) => {
                reply.redirect('/success');
            }
        );
    }

    // facebook oauth
    if (config.oauth.facebook) {
        providers.push({ id: 'facebook', name: 'Facebook' });
        passport.use(new FacebookStrategy({
            clientID: client.oauth.facebook.client_id,
            clientSecret: config.oauth.facebook.client_secret,
            callbackURL: `${config.schnack_host}/auth/facebook/callback`
        }, (accessToken, refreshToken, profile, done) => {
              done(null, profile);
        }));

        app.get('/auth/facebook',
            passport.authenticate('facebook')
        );

        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                failureRedirect: '/login'
            }), (request, reply) => {
                reply.redirect('/success')
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
