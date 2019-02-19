const config = require("../config");
const notifyConfig  = config.get("notify");
const JiraClient = require('jira-connector');

if (notifyConfig.jira) {
    const JiraInit = new JiraClient({
        host: notifyConfig.jira.host,
        basic_auth: {
            base64: notifyConfig.jira.basic_auth.base64
        }
    });
    exports.jira = JiraInit;
}

exports.notifyConfig = notifyConfig;
