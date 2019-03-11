const MastodonStrategy = require('passport-mastodon').Strategy;
const fetch = require('node-fetch');

module.exports = ({ config, host, app, db, queries }) => {
    return {
        auth({ providers, passport }) {
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
                                callbackURL: `${host}/auth/mastodon/callback`
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
                                client_name: config.app_name,
                                website: config.app_website,
                                redirect_uris: `${host}/auth/mastodon/callback`,
                                scopes: 'read'
                            })
                        })
                            .then(res => res.json())
                            .then(res => {
                                if (!res.client_id)
                                    return console.error('could not create app', res);
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
    };
};
