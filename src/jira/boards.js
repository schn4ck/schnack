const config = require("../config");
const notifyConfig  = config.get("notify");
var JiraClient = require('jira-connector');

var jira = new JiraClient( {
    host: notifyConfig.jira.host,
    basic_auth: {
        base64: notifyConfig.jira.basic_auth.base64
    }
});

jira.board.getAllBoards({}, function callback(no, data, response) {
    if (data.values) {
        console.log(data.values);
    } else {
        console.log(response);
    }
});