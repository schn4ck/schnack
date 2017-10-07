const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const moment = require('moment');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

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

    passport.use(new TwitterStrategy({
            consumerKey: config.oauth.twitter.consumer_key,
            consumerSecret: config.oauth.twitter.consumer_secret,
            callbackURL: '/auth/twitter/callback'
        }, (token, tokenSecret, profile, done) => {
            done(null, profile);
        }
    ));

    passport.serializeUser((user, done) => {
        db.get(queries.find_user, [user.provider, user.id], (err, row) => {
            if (row) return done(null, row); // welcome back
            // nice to meet you, new user!
            const c_args = [user.provider, user.id, user.displayName, user.username];
            db.run(queries.create_user, c_args, (err, res) => {
                if (err) console.log(err);
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

    app.get('/logout', (request, reply) => {
        delete request.session.passport;
        reply.send({ status: 'ok' });
    });

    app.post('/comments/:slug', (request, reply) => {
        const { slug } = request.params;
        const { comment } = request.body;
        const { user } = request.session.passport || {};

        if (!user) return error('access denied', request, reply, 403);
        db.run(queries.insert, [user.id, slug, comment], (err) => {
            if (error(err, request, reply)) return;
            reply.send({ status: 'ok' });
        });
    });

    app.get('/admin', passport.authenticate('twitter', { callbackURL: '/admin' }), (request, reply) => {
        console.log(request.url, request.user);
        if (config.admins.indexOf(request.user.id) > -1) {
            // render admin
            reply.send({ status: 'ok' });
        } else {
            reply.status(403).send({ error: 'access denied' });
        }
    });

    app.get('/auth/twitter',
        passport.authenticate('twitter')
    );

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/login'
        })
    );

    app.get('/', (request, reply) => {
        const { user } = request.session;
        reply.send({test: 'ok', user, session: request.session });
    });

    var server = app.listen(config.port || 3000, (err) => {
        if (err) throw err;
        console.log(`server listening on ${server.address().port}`);
    });
}

