const fs = require('fs');
const fastify = require('fastify')();
const moment = require('moment');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./comments.db', (err) => {
	if (err) console.error(err.message);
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
		(user_id, slug, comment, created_at)
		VALUES (?,?,?,datetime())`,
};

function init(next) {
	db.all("SELECT name FROM sqlite_master WHERE type = 'table'", (err, rows) => {
		if (err) console.error(err.message);
		if (!rows.length) db.exec(fs.readFileSync('./src/schema.sql', 'utf-8'), next);
		else next();
	});
}

function authenticate(callback) {
	// todo
	callback(null, { user_id: 1 });
}

function error(err, request, reply) {
	if (err) {
		request.log.error(err.message);
		reply.code(500).send({ error: err.message });
	}
}

function run(err, res) {
	if (err) console.error(err.message);

	// todo: limit cors to trusted domains
	fastify.use(require('cors')());

	fastify.get('/embed.js', (request, reply) => {
		reply.type('application/javascript').send(embedJS);
	});

	fastify.get('/comments/:slug', (request, reply) => {
		var slug = request.params.slug;
		db.all(queries.select, [slug], (err, comments) => {
			if (error(err, request, reply)) return;
			comments.forEach((c) => c.created_at_s = moment(c.created_at).format(config.date_format || 'MMM DD, YYYY'))
			reply.send({ slug, comments });
		});
	});

	fastify.post('/comments/:slug', (request, reply) => {
		var slug = request.params.slug,
			comment = request.body;
		authenticate((err, res) => {
			if (error(err, request, reply)) return;
			db.run(queries.insert, [res.user_id, slug, comment], (err) => {
				if (error(err, request, reply)) return;
				reply.send({ status: 'ok' });
			});
		});
	});

	fastify.get('/admin', (request, reply) => {
		authenticate((err, res) => {
			if (error(err, request, reply)) return;
			if (config.admins.indexOf(res.user_id) > -1) {
				// render admin
				reply.send({ status: 'ok' });
			} else {
				reply.code(403).send({ error: 'access denied' });
			}
		});
	});

	fastify.listen(3000, (err) => {
	 	if (err) throw err;
	  	console.log(`server listening on ${fastify.server.address().port}`);
	});
}

