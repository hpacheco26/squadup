class Player {
    constructor(id, firstName, lastName, userId, groups = []) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.userId = userId;
        this.groups = groups;
    }

    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}

module.exports = Player; 