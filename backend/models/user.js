const ACTIVE_TIMEOUT = 5 * 60 * 1000;


class User {
    constructor(username, password, id) {
        if (id) this.id = id;
        else this.id = User.newID.toString();
        this.username = username;
        this.password = password;
        this.generateNewSessionID = this.generateNewSessionID.bind(this);
        this.userLastActivity = +new Date();
        this.isActive = this.isActive.bind(this);
        this.makeActive = this.makeActive.bind(this);
    }
    isActive() {
        let x = (this.userLastActivity > +new Date() - ACTIVE_TIMEOUT)
        return x;
    }
    makeActive() {
        this.userLastActivity = +new Date();
    }
    generateNewSessionID() {
        return Math.floor(Math.random() * Math.pow(10, 6));
    }
    static get newID() {
        return User.idCounter++;
    }
}
module.exports = User;