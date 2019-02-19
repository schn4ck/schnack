const { notifyConfig, JiraClient } = require('./config.js');

const jira = new JiraClient({
    host: notifyConfig.jira.host,
    basic_auth: {
        base64: notifyConfig.jira.basic_auth.base64
    }
});

jira.board.getAllBoards({}, function callback(empty, data, response) {

    if ((data != null) && (data != undefined) && (typeof data !== "undefined")) {
        console.log(data.values);
    } else {
        console.log(response);
        console.log("")
        console.log("NOTICE: Could not retrieve a list of boards. Above is the response received from Jira.");
    }
});