const { jira } = require('./config.js');

if (jira) {
    jira.board.getAllBoards({}, function callback(empty, data, response) {

        if ((data != null) && (data != undefined) && (typeof data !== "undefined")) {
            console.log(data.values);
        } else {
            console.log(response);
            console.log("")
            console.log("NOTICE: Could not retrieve a list of boards. Above is the response received from Jira.");
        }
    });
} else {
    console.log("NOTICE: Jira does not appear to be configured. Please check the README for instructions on how to setup Jira Notifications.");
}