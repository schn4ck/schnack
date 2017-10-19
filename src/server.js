const fs = require('fs');
const url = require('url');
const path = require('path');

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');
const countBy = require('lodash.countby');

const RSS = require('rss');
const Pushover = require('pushover-notifications');
const webpush = require('web-push');
const marked = require('marked');

const dbHandler = require('./db');
const queries = require('./db/queries');
const auth = require('./auth');

const config = require('../config.json');
const awaiting_moderation = [];

marked.setOptions({ sanitize: true });

dbHandler.init()
    .then(db => run(db))
    .catch(err => console.error(err.message));

const schnack_url = url.parse(config.schnack_host);
if (!schnack_url.hostname) {
    console.error(`"${config.schnack_host}" doesn't appear to be a proper URL. Did you forget "http://"?`);
    process.exit(-1);
}
const schnack_domain = schnack_url.hostname.split('.').slice(1).join('.');

function send_file(file, admin_only) {
    return send_string(fs.readFileSync(file, 'utf-8'), admin_only);
}

function send_string(body, admin_only) {
    return function(request, reply, next) {
        if (admin_only) {
            const user = getUser(request);
            if (!user.admin) return next();
        }
        if (request.baseUrl.endsWith('.js')) {
            reply.header("Content-Type", "application/javascript");
        }
        reply.send(body);
    };
}

function run(db) {
    app.use(cors({
        credentials: true,
        origin: checkOrigin
    }));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // init session + passport middleware and auth routes
    auth.init(app, db, schnack_domain);

    // serve static js files
    app.use('/embed.js', send_file('build/embed.js'));
    app.use('/sw.js', send_file('src/embed/sw.js', true));
    app.use('/push.js', send_string(fs.readFileSync('src/embed/push.js', 'utf-8')
        .replace('%VAPID_PUBLIC_KEY%', config.notify.webpush.vapid_public_key), true));

    app.get('/comments/:slug', (request, reply) => {
        const { slug } = request.params;
        const user = getUser(request);
        const providers = user ? null : auth.providers;

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
                c.author_url = auth.getAuthorUrl(c);
            });
            reply.send({ user, auth: providers, slug, comments });
        });
    });

    app.get('/signout', (request, reply) => {
        delete request.session.passport;
        reply.send({ status: 'ok' });
    });

    // POST new comment
    app.post('/comments/:slug', (request, reply) => {
        const { slug } = request.params;
        const { comment } = request.body;
        const user = getUser(request);

        if (!user) return error('access denied', request, reply, 403);
        checkValidComment(db, slug, user.id, comment, (err) => {
            if (err) return reply.send({ status: 'rejected', reason: err });
            db.run(queries.insert, [user.id, slug, comment], (err) => {
                if (error(err, request, reply)) return;
                if (!user.blocked && !user.trusted) {
                    awaiting_moderation.push({slug});
                }
                reply.send({ status: 'ok' });
            });
        });
    });

    // trust/block users or approve/reject comments
    app.post(/\/(?:comment\/(\d+)\/(approve|reject))|(?:user\/(\d+)\/(trust|block))/, (request, reply) => {
        const user = getUser(request);
        if (!isAdmin(user)) return reply.status(403).send(request.params);
        const action = request.params[1] || request.params[3];
        const target_id = +(request.params[0] || request.params[2]);
        db.run(queries[action], target_id, (err) => {
            if (error(err, request, reply)) return;
            reply.send({ status: 'ok' });
        });
    });

    app.get('/success', (request, reply) => {
        reply.send(`<script>
            document.domain = document.domain.split('.').slice(1).join('.');
            window.opener.__schnack_wait_for_oauth();
        </script>`);
    });

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

    // for markdown preview
    app.post('/markdown', (request, reply) => {
        const { comment } = request.body;
        reply.send({ html: marked(comment.trim()) });
    });

    // settings
    app.post('/setting/:property/:value', (request, reply) => {
        const { property, value } = request.params;
        const user = getUser(request);
        if (!isAdmin(user)) return reply.status(403).send(request.params);
        const setting = value ? 1 : 0;
        db.run(queries.set_settings, [property, setting], (err) => {
            if (error(err, request, reply)) return;
            reply.send({ status: 'ok' });
        });
    });

    // push notifications
    app.post('/subscribe', (request, reply) => {
        const { endpoint, publicKey, auth } = request.body;

        db.run(queries.subscribe, endpoint, publicKey, auth, (err) => {
            if (error(err, request, reply)) return;
            reply.send({ status: 'ok' });
        });
    });

    app.post('/unsubscribe', (request, reply) => {
        const { endpoint } = request.body;

        db.run(queries.unsubscribe, endpoint, (err) => {
            if (error(err, request, reply)) return;
            reply.send({ status: 'ok' });
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
        notifier.push((msg, callback) => push.send(msg, callback));
    }

    if (config.notify.webpush) {
        webpush.setVapidDetails(
            config.schnack_host,
            config.notify.webpush.vapid_public_key,
            config.notify.webpush.vapid_private_key
        );

        notifier.push((msg, callback) => {
            db.each(queries.get_subscriptions, (err, row) => {
                if (error(err)) return;

                const subscription = {
                    endpoint: row.endpoint,
                    keys: {
                        p256dh: row.publicKey,
                        auth: row.auth
                    }
                };
                webpush.sendNotification(subscription, JSON.stringify({title: 'schnack', message: msg.message, clickTarget: msg.url}));
            }, callback);
        });
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
            db.get(queries.get_settings, 'notification', (err, row) => {
                if (err) console.error(err.message);
                var cnt = bySlug[k],
                    msg = {
                        message: `${cnt} new comment${cnt>1?'s':''} on "${k}" are awaiting moderation.`,
                        url: `/${k}`,
                        sound: !!row.active ? 'pushover' : 'none'
                    };
                delete bySlug[k];
                setTimeout(() => {
                    notifier.forEach((f) => f(msg, next));
                }, 1000);
            });
        }
    }, config.notification_interval || 300000); // five minutes

    var server = app.listen(config.port || 3000, (err) => {
        if (err) throw err;
        console.log(`server listening on ${server.address().port}`);
    });
}

// helper functions

function error(err, request, reply, code) {
  if (err) {
      console.error(err.message);
      reply.status(code || 500).send({ error: err.message });

      return true;
  }

  return false;
}

function getUser(request) {
    if (config.dev) return { id: 1, name: 'Dev', display_name: 'Dev', admin: true, trusted: 1};
    const { user } = request.session.passport || {};
    return user;
}

function isAdmin(user) {
  return user && user.id && config.admins.indexOf(user.id) > -1;
}

function checkOrigin(origin, callback) {
    // origin is allowed
    if (typeof origin === 'undefined' || `.${url.parse(origin).hostname}`.endsWith(`.${schnack_domain}`)) {
        return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
}

function checkValidComment(db, slug, user_id, comment, callback) {
    if (comment.trim() === '') return callback('the comment can\'t be empty');
    // check duplicate comment
    db.get(queries.get_last_comment, [slug], (err, row) => {
        if (err) return callback(err);
        if (row && row.comment.trim() == comment && row.user_id == user_id) {
            return callback('the exact comment has been entered before');
        }
        callback(null);
    });
}