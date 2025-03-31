export default function getMyInviteStatus(game, myId) {
    // Check if myId is in playersGoing array
    if (game.playersIn.some(player => player.id === myId)) {
        return 'in';
    }

    // Check if myId is in playersNotGoing array
    if (game.playersOut.some(player => player.id === myId)) {
        return 'out';
    }

    // Check if myId is in invitedPlayers array
    if (game.playersInvited.some(player => player.id === myId)) {
        return 'invited';
    }

    // If not found in any list, return null or unknown status
    return null;
}
