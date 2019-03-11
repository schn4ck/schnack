const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = ({ config, host, app }) => {
    return {
        auth({ providers, passport }) {
            // google oauth
            providers.push({ id: 'google', name: 'Google' });
            passport.use(
                new GoogleStrategy(
                    {
                        clientID: config.client_id,
                        clientSecret: config.client_secret,
                        callbackURL: `${host}/auth/google/callback`
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
    };
};

module.exports = {};
