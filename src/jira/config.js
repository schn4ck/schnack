const config = require("../config");
const notifyConfig  = config.get("notify");
const JiraClient = require('jira-connector');

let JiraInit;

if (notifyConfig.jira) {
    JiraInit = new JiraClient({
        host: notifyConfig.jira.host,
        basic_auth: {
            base64: notifyConfig.jira.basic_auth.base64
        }
    });
}

exports.notifyConfig = notifyConfig;
exports.jira = JiraInit;
