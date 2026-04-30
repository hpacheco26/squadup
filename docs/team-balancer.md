# Team Balancer & Ranking

## Balancer — [src/utils/teamBalancer.js](../src/utils/teamBalancer.js)

`balanceTeams(players, playersPerTeam)` returns `{ team1, team2 }` where each array is **starters first, bench last**.

Algorithm:
1. Shuffle (so equal-rank players don't always end up on the same side).
2. Sort by `rank` desc.
3. Greedy fill: assign the next player to the side with fewer starters; once both sides hit `playersPerTeam`, overflow goes to the lighter bench.

`getCaptain(team)` returns the highest-ranked player in a team.

## Ranking — [src/utils/groupRank.js](../src/utils/groupRank.js)

Elo-style tier computation derived from `wins / losses / goals` per group.

## My status — [src/utils/myInviteStatus.js](../src/utils/myInviteStatus.js)

Returns `'in' | 'out' | 'invited' | null` for a given game and user id.
