const fs = require('fs');
const path = require('path');
const sqlite = require('sqlite');
const queries = require('./db/queries');
const xml2js = require('xml2js');
const toMarkdown = require('to-markdown');
const dbPromise = sqlite.open('./comments.db', { Promise });

const filename = process.argv.slice(2, 3).pop();
if (!filename) {
    console.error('Pass the filepath to your XML file as argument');
    process.exit(1);
}

function run() {
    const parser = new xml2js.Parser({explicitArray: false});
    const xmlFilePath = path.resolve(__dirname, '..', filename);
    fs.readFile(xmlFilePath, (err, data) => 
        parser.parseString(data, async function (err, result) {
            if (err) console.error(`Error parsing the XML file '${xmlFilePath}':`, err);
            const db = await dbPromise;

            // for each post save it and store the id
            // for each post that is a reply replace reply_to with the stored id
            const threads = result.disqus.thread;
            const posts = result.disqus.post.map(comment => importComment(threads, comment));

            for (post of posts) {
                const newComment = await saveComment(post);
                post.new_id = newComment;
            }

            for (post of posts) {
                const replies = posts.filter(p => p.comment[3] === post.id); // replies to current post
                if (replies) {
                    for (reply of replies) {
                        const { id, new_id } = post;
                        const res = await db.run(`UPDATE comment SET reply_to = ? WHERE reply_to = ?`, [new_id, id]);
                    }
                }
            }
        })
    );    
};

async function saveComment(post) {
    const db = await dbPromise;
    const { comment, author } = post;

    if (!author.username) {
        author.username = 'Anonymous Guest';
    }
    const user = [
        'disqus',
        author.username,
        author.name,
        author.username,
        0
    ];

    try {
        await db.run(queries.create_user, user);
        const newUser = await db.get(queries.find_user, ['disqus', author.username]);
        if (newUser.id) comment.unshift(newUser.id); // push user_id to the front
        const res = await db.run(`INSERT INTO comment
        (user_id, slug, comment, reply_to, created_at, approved, rejected)
        VALUES (?,?,?,?,?,?,0)`, comment);
        return res.lastID;
    } catch (err) {
        console.error(`Error saving the comment for the slug ${comment[0]}:`, err);
    }
};

function importComment(threads, comment) {
    const { author } = comment;    
    const thread = threads.filter(thread => thread.$['dsq:id'] === comment.thread.$['dsq:id'])[0].id
    const reply_to = comment.parent ? comment.parent.$['dsq:id'] : null;
    const message = toMarkdown(comment.message.trim());
    const timestamp = comment.createdAt;
    const approved = (comment.isDeleted === "true" || comment.isSpam === "true") ? 0 : 1;

    return {
        comment: [
            thread,
            message,
            reply_to,
            timestamp,
            approved
        ],
        id: comment.$['dsq:id'],
        author
    };
};

run();
