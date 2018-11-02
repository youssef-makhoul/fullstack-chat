class User {
    constructor(username, password) {
        this.id = User.newID.toString();
        this.username = username;
        this.password = password;
        this.generateNewSessionID = this.generateNewSessionID.bind(this);
    }
    generateNewSessionID() {
        return Math.floor(Math.random() * Math.pow(10,6));
    }
    static get newID() {
        return User.idCounter++;
    }
}
module.exports = User;