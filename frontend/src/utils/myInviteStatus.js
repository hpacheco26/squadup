export default function getMyInviteStatus(game, myId) {
    // Check if myId is in playersGoing array
    if (game.playersGoing.some(player => player.id === myId)) {
        return 'in';
    }

    // Check if myId is in playersNotGoing array
    if (game.playersNotGoing.some(player => player.id === myId)) {
        return 'out';
    }

    // Check if myId is in invitedPlayers array
    if (game.invitedPlayers.some(player => player.id === myId)) {
        return 'invited';
    }

    // If not found in any list, return null or unknown status
    return null;
}
