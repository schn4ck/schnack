const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const moment = require('moment');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
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
        `SELECT user_id, user.name, comment.created_at, comment
        FROM comment INNER JOIN user ON (user_id=user.id)
        WHERE NOT user.blocked AND NOT comment.rejected
        AND (comment.approved OR user.trusted) AND slug = ?
        ORDER BY comment.created_at DESC`,
    insert:
        `INSERT INTO comment
        (user_id, slug, comment, created_at, approved, rejected)
        VALUES (?,?,?,datetime(),0,0)`,
};

function init(next) {
    db.all("SELECT name FROM sqlite_master WHERE type = 'table'", (err, rows) => {
        if (err) return console.error(err.message);
        if (!rows.length) db.exec(fs.readFileSync('./src/schema.sql', 'utf-8'), next);
        else next();
    });
}

function error(err, request, reply) {
    if (err) {
        request.log.error(err.message);
        reply.status(500).send({ error: err.message });
    }
}

function run(err, res) {
    if (err) return console.error(err.message);

    app.use(session({secret: config.oauth.secret}));
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
        done(null, user.id);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    app.use(cors({
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
        const { slug }  = request.params;
        db.all(queries.select, [slug], (err, comments) => {
            if (error(err, request, reply)) return;
            comments.forEach((c) => {
                const m = moment.utc(c.created_at);
                c.created_at_s = config.date_format ? m.format(config.date_format) : m.fromNow();
            });
            reply.send({ slug, comments });
        });
    });

    app.get('/login', (request, reply) => {

    });

    app.post('/comments/:slug', (request, reply) => {
        const { slug } = request.params;
        const { comment } = request.body;

        authenticate((err, res) => {
            if (error(err, request, reply)) return;
            db.run(queries.insert, [res.user_id, slug, comment], (err) => {
                if (error(err, request, reply)) return;
                reply.send({ status: 'ok' });
            });
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

    app.get('/auth/twitter', passport.authenticate('twitter'));

    app.get('/auth/twitter/callback', passport.authenticate(
        'twitter', { successRedirect: '/', failureRedirect: '/login' }
    ));

    app.get('/', (request, reply) => {
        console.log(request.user);
        reply.send({test: 'ok'});
    });

    var server = app.listen(config.port || 3000, (err) => {
        if (err) throw err;
        console.log(`server listening on ${server.address().port}`);
    });
}

