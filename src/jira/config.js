const config = require("../config");
const notifyConfig  = config.get("notify");
const JiraClient = require('jira-connector');

exports.notifyConfig = notifyConfig;
exports.JiraClient = JiraClient;