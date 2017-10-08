const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');
const countBy = require('lodash.countby');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const RSS = require('rss');
const Pushover = require('node-pushover');
const marked = require('marked');

const dbHandler = require('./db');
const queries = require('./db/queries');

const embedJS = fs.readFileSync(path.resolve(__dirname, '../build/embed.js'), 'utf-8');
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config.json')));
const awaiting_moderation = [];

marked.setOptions({
  sanitize: true
});

function error(err, request, reply, code) {
    if (err) {
        console.error(err.message);
        reply.status(code || 500).send({ error: err.message });
    }
}

function isAdmin(user) {
    return user && user.id && config.admins.indexOf(user.id) > -1;
}

dbHandler.init()
    .then(db => run(db))
    .catch(err => console.error(err.message));

function run(db) {
    app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: config.oauth.secret,
        cookie: {
            domain: config.cookie_domain
        },
        store: new SQLiteStore({ db: 'sessions.db' })
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    if (config.oauth.twitter) {
        passport.use(new TwitterStrategy({
                consumerKey: config.oauth.twitter.consumer_key,
                consumerSecret: config.oauth.twitter.consumer_secret,
                callbackURL: '/auth/twitter/callback'
            }, (token, tokenSecret, profile, done) => {
                done(null, profile);
            }
        ));
    }

    if (config.oauth.github) {
        passport.use(new GitHubStrategy({
                consumerKey: config.oauth.github.client_id,
                consumerSecret: config.oauth.github.client_secret,
                callbackURL: '/auth/github/callback'
            }, (token, tokenSecret, profile, done) => {
                done(null, profile);
            }
        ));
    }

    passport.serializeUser((user, done) => {
        db.get(queries.find_user, [user.provider, user.id], (err, row) => {
            if (row) return done(null, row); // welcome back
            // nice to meet you, new user!
            const c_args = [user.provider, user.id, user.displayName, user.username];
            db.run(queries.create_user, c_args, (err, res) => {
                if (err) console.error(err);
                db.get(queries.find_user, [user.provider, user.id], (err, row) => {
                    if (row) return done(null, row);
                    console.error('no user found after insert');
                });
            });
        });
    });

    passport.deserializeUser((user, done) => {
        done(null, { provider: user.provider, id: user.provider_id });
    });

    app.use(cors({
        credentials: true,
        origin: (origin, callback)  => {
            if (typeof origin === 'undefined' || config.allow_origin.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    }));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/embed.js', (request, reply) => {
        reply.type('application/javascript').send(embedJS);
    });

    app.get('/comments/:slug', (request, reply) => {
        const { slug } = request.params;
        const { user } = request.session.passport || {};

        let query = queries.get_comments;
        let args = [slug, user ? user.id : -1];

        if (isAdmin(user)) {
            user.admin = true;
            query = queries.admin_get_comments;
            args.length = 1;
        }

        db.all(query, args, (err, comments) => {
            if (error(err, request, reply)) return;
            comments.forEach((c) => {
                const m = moment.utc(c.created_at);
                c.created_at_s = config.date_format ? m.format(config.date_format) : m.fromNow();
                c.comment = marked(c.comment.trim());
            });
            reply.send({ user, slug, comments });
        });
    });

    app.get('/logout', (request, reply) => {
        delete request.session.passport;
        reply.send({ status: 'ok' });
    });

    // POST new comment
    app.post('/comments/:slug', (request, reply) => {
        const { slug } = request.params;
        const { comment } = request.body;
        const { user } = request.session.passport || {};

        if (!user) return error('access denied', request, reply, 403);
        db.run(queries.insert, [user.id, slug, comment], (err) => {
            if (error(err, request, reply)) return;
            if (!user.blocked && !user.trusted) {
                awaiting_moderation.push({slug});
            }
            reply.send({ status: 'ok' });
        });
    });

    // trust/block users or approve/reject comments
    app.post(/\/(?:comment\/(\d+)\/(approve|reject))|(?:user\/(\d+)\/(trust|block))/, (request, reply) => {
        const { user } = request.session.passport || {};
        if (!isAdmin(user)) return reply.status(403).send(request.params);
        const action = request.params[1] || request.params[3];
        const target_id = +(request.params[0] || request.params[2]);
        db.run(queries[action], target_id, (err) => {
            if (error(err, request, reply)) return;
            reply.send({ status: 'ok' });
        });
    });

    // twitter auth
    if (config.oauth.twitter) {
        app.get('/auth/twitter',
            passport.authenticate('twitter')
        );

        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect: '/',
                failureRedirect: '/login'
            })
        );
    }

    // github auth
    if (config.oauth.github) {
        app.get('/auth/github',
            passport.authenticate('github', { scope: [ 'user:email' ] })
        );

        app.get('/auth/github/callback',
            passport.authenticate('github', {
                failureRedirect: '/login'
            }, (request, reply) => {
                reply.redirect('/');
            })
        );
    }

    app.get('/', (request, reply) => {
        reply.send({test: 'ok' });
    });

    // rss feed of comments in need of moderation
    app.get('/feed', (request, reply) => {
        var feed = new RSS({
            title: 'Awaiting moderation',
            site_url: config.allow_origin[0]
        });
        db.each(queries.awaiting_moderation, (err, row) => {
            if (err) console.error(err.message);
            feed.item({
                title: `New comment on "${row.slug}"`,
                description: `A new comment on "${row.slug}" is awaiting moderation`,
                url: row.slug+'/'+row.id,
                guid: row.slug+'/'+row.id,
                date: row.created_at
            });
        }, (err) => {
            reply.send(feed.xml({indent: true}));
        });
    });

    // push notification apps
    const notifier = [];

    // each notification app could hook into the
    // the notifier array
    if (config.notify.pushover) {
        const push = new Pushover({
            token: config.notify.pushover.app_token,
            user: config.notify.pushover.user_key
        });
        notifier.push((msg, callback) => push.send(null, msg, callback) );
    }

    // check for new comments in need of moderation
    setInterval(() => {
        var bySlug;
        if (awaiting_moderation.length) {
            bySlug = countBy(awaiting_moderation, 'slug');
            next();
            awaiting_moderation.length = 0;
        }
        function next(err) {
            var k = Object.keys(bySlug)[0];
            if (!k || err) return;
            var cnt = bySlug[k],
                msg = `${cnt} new comment${cnt>1?'s':''} on "${k}" are awaiting moderation.`;
            delete bySlug[k];
            setTimeout(() => {
                notifier.forEach((f) => f(msg, next));
            }, 1000);
        }
    }, 60000);

    var server = app.listen(config.port || 3000, (err) => {
        if (err) throw err;
        console.log(`server listening on ${server.address().port}`);
    });
}

