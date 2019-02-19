const { notifyConfig, jira } = require('../jira/config.js');

if (notifyConfig.jira) {

    const config = require("../config");
    const schnackEvents = require('../events');

    schnackEvents.on('new-comment', (event) => {
        try {
            const post_url = config.get('page_url').replace('%SLUG%', event.slug)+'#comment-'+event.id;
            const comment = `\n\n----\n\n` + event.comment;
            const description = `A [new comment|${post_url}] was posted by ${event.user.display_name || event.user.name} under *${event.slug}*:\n\n${comment}`;

            const issue = {
                "fields": {
                    "project":{
                        "key": notifyConfig.jira.project_key
                    },
                    "summary": `Comment for Moderation (${event.user.display_name || event.user.name})`,
                    "description": description,
                    "issuetype": {
                        "name": notifyConfig.jira.issue_type
                    }
                }
            }

            jira.issue.createIssue(issue, function callback(no, data, response) {
                if ((data == null) || (data == undefined) || (typeof data === "undefined")) {
                    console.log('Error sending Jira notification:', response.body.errors);
                }
            });
        } catch (error) {
            console.error('Error sending Jira notification:', error);
        }
    });
}
