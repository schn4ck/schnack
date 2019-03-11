const GitHubStrategy = require('passport-github2').Strategy;

module.exports = ({ config, host, app }) => {
    return {
        auth({ providers, passport }) {
            providers.push({ id: 'github', name: 'Github' });
            passport.use(
                new GitHubStrategy(
                    {
                        clientID: config.client_id,
                        clientSecret: config.client_secret,
                        callbackURL: `${host}/auth/github/callback`
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
    };
};
