const Pushover = require('pushover-notifications');

module.exports = ({ config, host, app, events }) => {
	return {
		notify({ notifier, page_url }) {
			const push = new Pushover({
				token: config.app_token,
				user: config.user_key
			});
			notifier.push((msg, callback) => push.send(msg, callback));
		}
	};
};
