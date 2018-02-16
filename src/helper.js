const fs = require('fs');
const url = require('url');
const queries = require('./db/queries');

const schnack_domain = getSchnackDomain();
function send_file(file, admin_only) {
    return send_string(fs.readFileSync(file, 'utf-8'), admin_only);
}

function send_string(body, admin_only) {
    return function(request, reply, next) {
        if (admin_only) {
            const user = getUser(request) || {};
            if (!user.admin) return next();
        }
        if (request.baseUrl.endsWith('.js')) {
            reply.header("Content-Type", "application/javascript");
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

function checkValidComment(db, slug, user_id, comment, replyTo, callback) {
    if (comment.trim() === '') return callback('the comment can\'t be empty');
    // check duplicate comment
    db.get(queries.get_last_comment, [slug], (err, row) => {
        if (err) return callback(err);
        if (row && row.comment.trim() == comment && row.user_id == user_id) {
            return callback('the exact comment has been entered before');
        }
        // @todo: check for cyclic replies
        callback(null);
    });
}

function getSchnackDomain() {
    const schnack_url = url.parse(config.schnack_host);
    if (!schnack_url.hostname) {
        console.error(`"${config.schnack_host}" doesn't appear to be a proper URL. Did you forget "http://"?`);
        process.exit(-1);
    }

    if (schnack_url.hostname === 'localhost') {
        return schnack_url.hostname;
    } else {
        const schnack_domain = schnack_url.hostname.split('.').slice(1).join('.');
        return schnack_domain;
    }
}

module.exports = {
    send_file,
    send_string,
    error,
    getUser,
    isAdmin,
    checkOrigin,
    checkValidComment,
    getSchnackDomain
}
