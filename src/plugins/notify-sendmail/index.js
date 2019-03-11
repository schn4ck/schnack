const { spawn } = require('child_process');

module.exports = ({ config, host, app, events }) => {
    return {
        notify({ page_url }) {
            events.on('new-comment', event => {
                const body = createEmailBody(config, page_url, event);
                try {
                    const sendmail = spawn('sendmail', [config.to]);
                    sendmail.stdin.write(body);
                    sendmail.stdin.end();
                } catch (error) {
                    console.error('Error sending sendmail notification:', error);
                }
            });
        }
    };
};

function createEmailBody(config, page_url, event) {
    const postUrl = page_url.replace('%SLUG%', event.slug);
    const user = event.user.display_name || event.user.name;
    const body = `
To: Schnack Admin <${config.to}>
From: ${user} <${config.from}>
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
