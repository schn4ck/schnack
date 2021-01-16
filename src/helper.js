const fs = require('fs');
const { URL } = require('url');
const queries = require('./db/queries');
const config = require('./config');

const schnack_domain = getSchnackDomain();
function sendFile(file, adminOnly, devMode) {
    return devMode ? function(request, reply, next) {
            if (adminOnly) {
                const user = getUser(request) || {};
                if (!user.admin) return next();
            }
            if (request.baseUrl.endsWith('.js')) {
                reply.header('Content-Type', 'application/javascript');
            }
            reply.send(fs.readFileSync(file, 'utf-8'));
        } : sendString(fs.readFileSync(file, 'utf-8'), adminOnly);
}

function sendString(body, adminOnly) {
    return function(request, reply, next) {
        if (adminOnly) {
            const user = getUser(request) || {};
            if (!user.admin) return next();
        }
        if (request.baseUrl.endsWith('.js')) {
            reply.header('Content-Type', 'application/javascript');
        }
        reply.send(body);
    };
}

function error(err, request, reply, code) {
    if (err) {
        console.error(err.message);
        reply.status(code || 500).send({ error: err.message });

        return true;
    }

    return false;
}

function getUser(request) {
    if (config.get('dev'))
        return { id: 1, name: 'Dev', display_name: 'Dev', admin: true, trusted: 1 };
    const { user } = request.session.passport || {};
    return user;
}

function isAdmin(user) {
    return user && user.id && config.get('admins').indexOf(user.id) > -1;
}

function checkOrigin(origin, callback) {
    // origin is allowed
    if (
        typeof origin === 'undefined' ||
        `.${new URL(origin).hostname}`.endsWith(`.${schnack_domain}`)
    ) {
        return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
}

async function checkValidComment(db, slug, user_id, comment, replyTo) {
    if (comment.trim() === '') throw new Error("the comment can't be empty");
    // check duplicate comment
    try {
        const row = await db.get(queries.get_last_comment, [slug]);
        if (row && row.comment.trim() === comment && row.user_id === user_id) {
            throw new Error('the exact comment has been entered before');
        }
    } catch (err) {
        throw err;
    }
}

function getSchnackDomain() {
    const schnack_host = config.get('schnack_host');
    try {
        const schnack_url = new URL(schnack_host);

        if (schnack_url.hostname === 'localhost') {
            return schnack_url.hostname;
        } else {
            const schnack_domain = schnack_url.hostname
                .split('.')
                .slice(1)
                .join('.');
            return schnack_domain;
        }
    } catch (error) {
        console.error(
            `The schnack_host value "${schnack_host}" doesn't appear to be a proper URL. Did you forget "http://"?`
        );
        process.exit(-1);
    }
}

module.exports = {
    sendFile,
    sendString,
    error,
    getUser,
    isAdmin,
    checkOrigin,
    checkValidComment,
    getSchnackDomain
};
