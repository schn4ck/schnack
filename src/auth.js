const passport = require('passport');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const MastodonStrategy = require('passport-mastodon').Strategy;
const fetch = require('node-fetch');

const queries = require('./db/queries');
const config = require('./config');
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

    // twitter auth
    if (authConfig.twitter) {
        providers.push({ id: 'twitter', name: 'Twitter' });
        passport.use(
            new TwitterStrategy(
                {
                    consumerKey: authConfig.twitter.consumer_key,
                    consumerSecret: authConfig.twitter.consumer_secret,
                    callbackURL: `${schnack_host}/auth/twitter/callback`
                },
                (token, tokenSecret, profile, done) => {
                    done(null, profile);
                }
            )
        );

        app.get('/auth/twitter', passport.authenticate('twitter'));

        app.get(
            '/auth/twitter/callback',
            passport.authenticate('twitter', {
                failureRedirect: '/login'
            }),
            (request, reply) => {
                reply.redirect('/success');
            }
        );
    }

    // github auth
    if (authConfig.github) {
        providers.push({ id: 'github', name: 'Github' });
        passport.use(
            new GitHubStrategy(
                {
                    clientID: authConfig.github.client_id,
                    clientSecret: authConfig.github.client_secret,
                    callbackURL: `${schnack_host}/auth/github/callback`
                },
                (accessToken, refreshToken, profile, done) => {
                    done(null, profile);
                }
            )
        );

        app.get(
            '/auth/github',
            passport.authenticate('github', {
                scope: ['user:email']
            })
        );

        app.get(
            '/auth/github/callback',
            passport.authenticate('github', {
                failureRedirect: '/login'
            }),
            (request, reply) => {
                reply.redirect('/success');
            }
        );
    }

    // google oauth
    if (authConfig.google) {
        providers.push({ id: 'google', name: 'Google' });
        passport.use(
            new GoogleStrategy(
                {
                    clientID: authConfig.google.client_id,
                    clientSecret: authConfig.google.client_secret,
                    callbackURL: `${schnack_host}/auth/google/callback`
                },
                (accessToken, refreshToken, profile, done) => {
                    done(null, profile);
                }
            )
        );

        app.get(
            '/auth/google',
            passport.authenticate('google', {
                scope: ['https://www.googleapis.com/auth/plus.login']
            })
        );

        app.get(
            '/auth/google/callback',
            passport.authenticate('google', {
                failureRedirect: '/login'
            }),
            (request, reply) => {
                reply.redirect('/success');
            }
        );
    }

    // facebook oauth
    if (authConfig.facebook) {
        providers.push({ id: 'facebook', name: 'Facebook' });
        passport.use(
            new FacebookStrategy(
                {
                    clientID: authConfig.facebook.client_id,
                    clientSecret: authConfig.facebook.client_secret,
                    callbackURL: `${schnack_host}/auth/facebook/callback`
                },
                (accessToken, refreshToken, profile, done) => {
                    done(null, profile);
                }
            )
        );

        app.get('/auth/facebook', passport.authenticate('facebook'));

        app.get(
            '/auth/facebook/callback',
            passport.authenticate('facebook', {
                failureRedirect: '/login'
            }),
            (request, reply) => {
                reply.redirect('/success');
            }
        );
    }

    // mastodon oauth
    if (authConfig.mastodon) {
        providers.push({ id: 'mastodon', name: 'Mastodon' });

        app.get('/auth/mastodon/d/:domain', (request, reply) => {
            const { domain } = request.params;
            const mastodonAuth = ({ domain, client_id, client_secret }) => {
                // register strategy with passport
                passport.use(
                    new MastodonStrategy(
                        {
                            clientID: client_id,
                            clientSecret: client_secret,
                            domain: domain,
                            callbackURL: `${schnack_host}/auth/mastodon/callback`
                        },
                        (accessToken, refreshToken, profile, done) => {
                            done(null, profile);
                        }
                    )
                );

                // and pass request to passport
                passport.authenticate('mastodon').call(passport, request, reply);
            };
            // check if that domain is already known
            db.get(queries.find_oauth_provider, ['mastodon', domain], (err, row) => {
                if (err) return console.error('could not find oauth provider', err);
                if (row) {
                    // we know this domain already, let's re-use the existing app!
                    mastodonAuth(row);
                } else {
                    // this is a new domain, we need to create an app
                    fetch(`https://${domain}/api/v1/apps`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            client_name: authConfig.mastodon.app_name,
                            website: authConfig.mastodon.app_website,
                            redirect_uris: `${schnack_host}/auth/mastodon/callback`,
                            scopes: 'read'
                        })
                    })
                        .then(res => res.json())
                        .then(res => {
                            if (!res.client_id) return console.error('could not create app', res);
                            // store client_key and client_secret away in db
                            db.get(
                                queries.create_oauth_provider,
                                ['mastodon', domain, res.id, res.client_id, res.client_secret],
                                (err, row) => {
                                    if (err) return console.error(err);
                                    mastodonAuth({
                                        domain,
                                        client_id: res.client_id,
                                        client_secret: res.client_secret
                                    });
                                }
                            );
                        });
                }
            });
        });

        app.get(
            '/auth/mastodon/callback',
            passport.authenticate('mastodon', {
                failureRedirect: '/login'
            }),
            (request, reply) => {
                reply.redirect('/success');
            }
        );
    }
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
