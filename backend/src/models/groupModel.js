class Group {
    constructor(name, players = [], admin, adminId, sport) {
        this.name = name;
        this.players = players;
        this.admin = admin;
        this.adminId = adminId;
        this.sport = sport;
    }

    // Utility method to add a player to the group
    addPlayer(player) {
        this.players.push(player);
    }

    // Utility method to remove a player from the group
    removePlayer(playerId) {
        this.players = this.players.filter(player => player.id !== playerId);
    }

    // Convert class instance to a plain object (useful for Firestore storage)
    toObject() {
        return {
            name: this.name,
            players: this.players,
            admin: this.admin,
            adminId: this.adminId,
            sport: this.sport
        };
    }
}

module.exports = Group;
