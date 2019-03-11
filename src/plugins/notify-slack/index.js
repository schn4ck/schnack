const request = require('request');

module.exports = ({ config, host, app, events }) => {
    return {
        notify({ page_url }) {
            events.on('new-comment', event => {
                try {
                    const post_url =
                        page_url.replace('%SLUG%', event.slug) + '#comment-' + event.id;
                    const comment = event.comment
                        .split(/\n+/)
                        .map(s => (s ? `> _${s}_` : '>'))
                        .join('\n>\n');
                    const text = `A <${post_url}|new comment> was posted by ${event.user
                        .display_name || event.user.name} under *${event.slug}*:\n\n${comment}`;
                    request({
                        url: config.webhook_url,
                        method: 'post',
                        json: true,
                        body: { text }
                    });
                } catch (error) {
                    console.error('Error sending slack notification:', error);
                }
            });
        }
    };
};
