const FacebookStrategy = require('passport-facebook').Strategy;

module.exports = ({ config, host, app }) => {
    return {
        auth({ providers, passport }) {
            providers.push({ id: 'facebook', name: 'Facebook' });
            passport.use(
                new FacebookStrategy(
                    {
                        clientID: config.client_id,
                        clientSecret: config.client_secret,
                        callbackURL: `${host}/auth/facebook/callback`
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
    };
};
