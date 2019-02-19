const config = require("../config");
const notifyConfig  = config.get("notify");
const schnackEvents = require('../events');

if (notifyConfig.jira) {

    var JiraClient = require('jira-connector');
    var jira = new JiraClient({
        host: notifyConfig.jira.host,
        basic_auth: {
            base64: notifyConfig.jira.basic_auth.base64
        }
    });

    schnackEvents.on('new-comment', (event) => {
        try {
            const post_url = config.get('page_url').replace('%SLUG%', event.slug)+'#comment-'+event.id;
            const comment = `\n\n----\n\n` + event.comment;
            const description = `A [new comment|${post_url}] was posted by ${event.user.display_name || event.user.name} under *${event.slug}*:\n\n${comment}`;

            var issue = {
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
