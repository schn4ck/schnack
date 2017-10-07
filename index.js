const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const moment = require('moment');
const countBy = require('lodash.countby');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const RSS = require('rss');
const Pushover = require('node-pushover');

const db = new sqlite3.Database('./comments.db', (err) => {
    if (err) return console.error(err.message);
    console.log('connected to db.');
    init(run);
});

const embedJS = fs.readFileSync('./build/embed.js', 'utf-8');

const config = JSON.parse(fs.readFileSync('./config.json'));

const queries = {
    select:
        `SELECT user_id, user.name, user.display_name, comment.created_at, comment
        FROM comment INNER JOIN user ON (user_id=user.id)
        WHERE NOT user.blocked AND NOT comment.rejected
        AND (comment.approved OR user.trusted) AND slug = ?
        ORDER BY comment.created_at DESC`,
    awaiting_moderation:
        `SELECT comment.id, slug, comment.created_at FROM comment
         INNER JOIN user ON (user_id=user.id)
        WHERE NOT user.blocked AND NOT user.trusted AND
         NOT comment.rejected AND NOT comment.approved
         ORDER BY comment.created_at DESC LIMIT 20`,
    insert:
        `INSERT INTO comment
        (user_id, slug, comment, created_at, approved, rejected)
        VALUES (?,?,?,datetime(),0,0)`,
    find_user:
        `SELECT id,name,display_name,provider,provider_id FROM user
         WHERE provider = ? AND provider_id = ?`,
    create_user:
        `INSERT INTO user
        (provider, provider_id, display_name, name,
         created_at, trusted, blocked)
        VALUES (?, ?, ?, ?, datetime(), 0, 0)`
};

const awaiting_moderation = [];

function init(next) {
    db.all("SELECT name FROM sqlite_master WHERE type = 'table'", (err, rows) => {
        if (err) return console.error(err.message);
        if (!rows.length) db.exec(fs.readFileSync('./src/schema.sql', 'utf-8'), next);
        else next();
    });
}

function error(err, request, reply, code) {
    if (err) {
        request.log.error(err.message);
        reply.status(code || 500).send({ error: err.message });
    }
}

function run(err, res) {
    if (err) return console.error(err.message);

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
        const { user } = request.session.passport || {};

        db.all(queries.select, [slug], (err, comments) => {
            if (error(err, request, reply)) return;
            comments.forEach((c) => {
                const m = moment.utc(c.created_at);
                c.created_at_s = config.date_format ? m.format(config.date_format) : m.fromNow();
            });
            reply.send({ user, slug, comments });
        });
    });

    app.get('/test', (req, reply) => {
        awaiting_moderation.push({ slug: ['foo', 'bar', 'mooo'][Math.floor(Math.random()*2.9)] });
        reply.send('ok');
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

    // admin UI
    app.get('/admin', passport.authenticate('twitter', { callbackURL: '/admin' }), (request, reply) => {
        console.log(request.url, request.user);
        if (config.admins.indexOf(request.user.id) > -1) {
            // render admin
            reply.send({ status: 'ok' });
        } else {
            reply.status(403).send({ error: 'access denied' });
        }
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
        const { user } = request.session;
        reply.send({test: 'ok', user, session: request.session });
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
            notifier.forEach((f) => f(msg, next));
        }
    }, 10000);

    var server = app.listen(config.port || 3000, (err) => {
        if (err) throw err;
        console.log(`server listening on ${server.address().port}`);
    });
}

