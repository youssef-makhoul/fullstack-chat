class Message {
    constructor(userId, username, messageBody) {
        this.userId = userId;
        this.username = username;
        this.messageBody = messageBody;
        this.timestamp = +new Date();
        this.getFormatedSubmiteTime = this.getFormatedSubmiteTime.bind(this);
    }
    getFormatedSubmiteTime() {
        let date = new Date(this.timestamp);
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    }
}
module.exports = Message;