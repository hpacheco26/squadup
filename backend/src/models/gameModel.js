class Game {
    constructor(id, date, time, location, maxPlayers, minPlayers, playersInvited = [], playersIn = [], playersOut = [], subTime, groupId, teamA, teamB) {
        this.id = id;
        this.date = date;
        this.time = time;
        this.location = location;
        this.maxPlayers = maxPlayers;
        this.minPlayers = minPlayers;
        this.playersInvited = playersInvited;
        this.playersIn = playersIn;
        this.playersOut = playersOut;
        this.teamA = teamA;
        this.teamB = teamB;
        this.subTime = subTime;
        this.groupId = groupId;
    }

    // Utility method to add a player to the invited players list
    addInvitedPlayer(playerId) {
        if (!this.playersInvited.includes(playerId)) {
            this.playersInvited.push(playerId);
        }
    }

    // Utility method to remove a player from the invited players list
    removeInvitedPlayer(playerId) {
        this.playersInvited = this.playersInvited.filter(player => player !== playerId);
    }

    // Utility method to add a player to the "players going" list
    markPlayerAsIn(playerId) {
        if (!this.playersIn.includes(playerId)) {
            this.playersIn.push(playerId);
        }
        this.playersOut = this.playersOut.filter(player => player !== playerId); // Remove from 'not going' list if present
    }

    // Utility method to add a player to the "players not going" list
    markPlayerAsOut(playerId) {
        if (!this.playersOut.includes(playerId)) {
            this.playersOut.push(playerId);
        }
        this.playersIn = this.playersIn.filter(player => player !== playerId); // Remove from 'going' list if present
    }

    // Convert class instance to a plain object (useful for Firestore storage)
    toObject() {
        return {
            id: this.id,
            date: this.date,
            time: this.time,
            location: this.location,
            maxPlayers: this.maxPlayers,
            minPlayers: this.minPlayers,
            invitedPlayers: this.invitedPlayers,
            playersIn: this.playersIn,
            playersOut: this.playersOut,
            subTime: this.subTime,
            groupId: this.groupId,
            teamA: this.teamA,
            teamB: this.teamB,
        };
    }
}

module.exports = Game;
