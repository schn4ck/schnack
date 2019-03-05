const { spawn } = require('child_process');
const config = require('../config');
const schnackEvents = require('../events');

const notify = config.get('notify');

function createEmailBody(config, event) {
    const postUrl = config.get('page_url').replace('%SLUG%', event.slug);
    const user = event.user.display_name || event.user.name;
    const body = `
To: Schnack Admin <${notify.sendmail.to}>
From: ${user} <${notify.sendmail.from}>
Subject: New comment on your post ${postUrl}

New comment on your post ${postUrl}

Author: ${user}

${event.comment}

You can see all comments on this post here:
${postUrl}#comments

Permalink: ${postUrl}#comment-${event.id}
`
        .split(/\n/)
        .join('\r\n')
        .trim();

    return body;
}

if (notify.sendmail) {
    schnackEvents.on('new-comment', event => {
        const body = createEmailBody(config, event);
        try {
            const sendmail = spawn('sendmail', [notify.sendmail.to]);
            sendmail.stdin.write(body);
            sendmail.stdin.end();
        } catch (error) {
            console.error('Error sending sendmail notification:', error);
        }
    });
}
