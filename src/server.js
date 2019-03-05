const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');

const RSS = require('rss');
const marked = require('marked');

const dbHandler = require('./db');
const queries = require('./db/queries');
const auth = require('./auth');
const pushHandler = require('./push');
const schnackEvents = require('./events');
const {
    error,
    getUser,
    isAdmin,
    checkOrigin,
    checkValidComment,
    getSchnackDomain
} = require('./helper');

const config = require('./config');

const awaiting_moderation = [];

marked.setOptions({ sanitize: true });

dbHandler
    .init()
    .then(db => run(db))
    .catch(err => console.error(err.message));

function run(db) {
    app.use(
        cors({
            credentials: true,
            origin: checkOrigin
        })
    );

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // init session + passport middleware and auth routes
    auth.init(app, db, getSchnackDomain());
    pushHandler.init(app, db, awaiting_moderation);

    app.get('/comments/:slug', (request, reply) => {
        const { slug } = request.params;
        const user = getUser(request);
        const providers = user ? null : auth.providers;

        let query = queries.get_comments;
        let args = [slug, user ? user.id : -1];

        if (isAdmin(user)) {
            user.admin = true;
            query = queries.admin_get_comments;
            args.length = 1;
        }

        const date_format = config.get('date_format');
        db.all(query, args, (err, comments) => {
            if (error(err, request, reply)) return;
            comments.forEach(c => {
                const m = moment.utc(c.created_at);
                c.created_at_s = date_format ? m.format(date_format) : m.fromNow();
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
        const { slug } = request.params;
        const { comment, replyTo } = request.body;
        const user = getUser(request);

        if (!user) return error('access denied', request, reply, 403);
        checkValidComment(db, slug, user.id, comment, replyTo, err => {
            if (err) return reply.send({ status: 'rejected', reason: err });
            let stmt = db
                .prepare(queries.insert, [user.id, slug, comment, replyTo ? +replyTo : null])
                .run(err => {
                    if (err) return error(err, request, reply);
                    if (!user.blocked && !user.trusted) {
                        awaiting_moderation.push({ slug });
                    }
                    schnackEvents.emit('new-comment', {
                        user: user,
                        slug,
                        id: stmt.lastID,
                        comment,
                        replyTo
                    });
                    reply.send({ status: 'ok', id: stmt.lastID });
                });
        });
    });

    // trust/block users or approve/reject comments
    app.post(
        /\/(?:comment\/(\d+)\/(approve|reject))|(?:user\/(\d+)\/(trust|block))/,
        (request, reply) => {
            const user = getUser(request);
            if (!isAdmin(user)) return reply.status(403).send(request.params);
            const action = request.params[1] || request.params[3];
            const target_id = +(request.params[0] || request.params[2]);
            db.run(queries[action], target_id, err => {
                if (error(err, request, reply)) return;
                reply.send({ status: 'ok' });
            });
        }
    );

    app.get('/success', (request, reply) => {
        const schnackDomain = getSchnackDomain();
        reply.send(`<script>
            document.domain = '${schnackDomain}';
            window.opener.__schnack_wait_for_oauth();
        </script>`);
    });

    app.get('/', (request, reply) => {
        reply.send({ test: 'ok' });
    });

    // rss feed of comments in need of moderation
    app.get('/feed', (request, reply) => {
        const user = getUser(request);
        if (!isAdmin(user)) return reply.status(403).send({ error: 'Forbidden' });
        var feed = new RSS({
            title: 'Awaiting moderation',
            site_url: config.get('schnack_host')
        });
        db.each(
            queries.awaiting_moderation,
            (err, row) => {
                if (err) console.error(err.message);
                feed.item({
                    title: `New comment on "${row.slug}"`,
                    description: `A new comment on "${row.slug}" is awaiting moderation`,
                    url: row.slug + '/' + row.id,
                    guid: row.slug + '/' + row.id,
                    date: row.created_at
                });
            },
            err => {
                console.error(err);
                reply.send(feed.xml({ indent: true }));
            }
        );
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
        db.run(queries.set_settings, [property, setting], err => {
            if (error(err, request, reply)) return;
            reply.send({ status: 'ok' });
        });
    });

    if (config.get('dev')) {
        // create dev user for testing purposes
        db.run(
            'INSERT OR IGNORE INTO user (id,name,blocked,trusted,created_at) VALUES (1,"dev",0,1,datetime())'
        );
    }

    var server = app.listen(config.get('port'), config.get('host'), err => {
        if (err) throw err;
        console.error(`server listening on ${server.address().port}`);
    });
}
