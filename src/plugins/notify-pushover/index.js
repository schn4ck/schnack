const Pushover = require('pushover-notifications');

module.exports = {
	notify({ notifier, events, config, page_url }) {
		const push = new Pushover({
			token: config.app_token,
			user: config.user_key
		});
		notifier.push((msg, callback) => push.send(msg, callback));
	}
};
