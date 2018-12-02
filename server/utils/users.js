class UsersList {
    constructor() {
        this.users = [];
    }
    addUser(id, phone) {
        var user = {id, phone};
        this.users.push(user);
        return user;
    }
    removeUser(id) {
        var user = this.getUser(id);

        if (user) {
            this.users = this.users.filter((user) => user.id !== id);
        }

        return user;
    }
    getUser(id) {
        return this.users.filter((user) => user.id === id)[0];
    }
    getUserByPhone(phone) {
        return this.users.filter((user) => user.phone === phone)[0];
    }
    getUserList() {
        var phonesArray = this.users.map((user) => user.phone);

        return phonesArray;
    }
}

module.exports = {UsersList};