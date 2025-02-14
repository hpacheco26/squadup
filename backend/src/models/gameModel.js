class Game {
    constructor(id, date, time, location, maxPlayers, minPlayers, invitedPlayers = [], playersGoing = [], playersNotGoing = [], subTime, groupId) {
        this.id = id;
        this.date = date;
        this.time = time;
        this.location = location;
        this.maxPlayers = maxPlayers;
        this.minPlayers = minPlayers;
        this.invitedPlayers = invitedPlayers;
        this.playersGoing = playersGoing;
        this.playersNotGoing = playersNotGoing;
        this.subTime = subTime;
        this.groupId = groupId;
    }

    // Utility method to add a player to the invited players list
    addInvitedPlayer(playerId) {
        if (!this.invitedPlayers.includes(playerId)) {
            this.invitedPlayers.push(playerId);
        }
    }

    // Utility method to remove a player from the invited players list
    removeInvitedPlayer(playerId) {
        this.invitedPlayers = this.invitedPlayers.filter(player => player !== playerId);
    }

    // Utility method to add a player to the "players going" list
    markPlayerAsGoing(playerId) {
        if (!this.playersGoing.includes(playerId)) {
            this.playersGoing.push(playerId);
        }
        this.playersNotGoing = this.playersNotGoing.filter(player => player !== playerId); // Remove from 'not going' list if present
    }

    // Utility method to add a player to the "players not going" list
    markPlayerAsNotGoing(playerId) {
        if (!this.playersNotGoing.includes(playerId)) {
            this.playersNotGoing.push(playerId);
        }
        this.playersGoing = this.playersGoing.filter(player => player !== playerId); // Remove from 'going' list if present
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
            playersGoing: this.playersGoing,
            playersNotGoing: this.playersNotGoing,
            subTime: this.subTime,
            groupId: this.groupId,
        };
    }
}

module.exports = Game;
