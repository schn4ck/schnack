const { notifyConfig, JiraClient } = require('./config.js');

const jira = new JiraClient({
    host: notifyConfig.jira.host,
    basic_auth: {
        base64: notifyConfig.jira.basic_auth.base64
    }
});

const issue = {
    "fields": {
        "project":{
            "key": notifyConfig.jira.project_key
        },
        "summary": "Test from Schnack",
        "description": "Congratulations, you have successfully configured Schnack to create a new task when a comment is posted.\n\nNice work :-)",
        "issuetype": {
            "name": notifyConfig.jira.issue_type
        }
    }
};

jira.issue.createIssue(issue, function callback(empty, data, response) {

    if ((data != null) && (data != undefined) && (typeof data !== "undefined")) {
        console.log("It worked! Please check the Jira Project's backlog for a new ticket");
        console.log(data);
    } else {
        console.log("NOTICE: Could not create new issue.");
        console.log("Jira Errors:", response.body.errors);
    }
});