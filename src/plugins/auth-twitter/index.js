const TwitterStrategy = require('passport-twitter').Strategy;

module.exports = {
    auth({ config, providers, passport, app, host }) {
        // twitter auth
        providers.push({ id: 'twitter', name: 'Twitter' });
        passport.use(
            new TwitterStrategy(
                {
                    consumerKey: config.consumer_key,
                    consumerSecret: config.consumer_secret,
                    callbackURL: `${host}/auth/twitter/callback`
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
};

module.exports = {};
