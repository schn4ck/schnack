const mailgun = require('mailgun-js');
const config = require('../config');
const schnackEvents = require('../events');

const notify = config.get('notify');



if (notify.mailgun) {
    const client = mailgun({
      apiKey: notify.mailgun.api_key,
      domain: notify.mailgun.domain
    })
    schnackEvents.on('new-comment', (event) => {
      const postUrl = config.get('page_url').replace('%SLUG%', event.slug);
      const user = event.user.display_name || event.user.name;
      const from = `${user} <${notify.mailgun.from}>`
      const to = `Schnack Admin <${notify.mailgun.to}>`
      const subject = `New comment: ${postUrl}`;
      const text =
      `
      New comment on your post ${postUrl}

      Author: ${user}

      ${event.comment}

      You can see all comments on this post here:
      ${postUrl}#comments

      Permalink: ${postUrl}#comment-${event.id}
      `.split(/\n/).join('\r\n').trim();
      client.messages().send({ from, to, subject, text }, function (err, body) {
        console.log(err);
        console.log(body);
      });
    });
}
