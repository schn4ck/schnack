const { notifyConfig, jira } = require('./config.js');

if (notifyConfig.jira) {
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
} else {
    console.log("NOTICE: Jira does not appear to be configured. Please check the README for instructions on how to setup Jira Notifications.");
}
