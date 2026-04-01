import { create } from 'zustand';
import GameService from '../api/gameService';
import NotificationService from '../api/notificationService';

const useGameStore = create((set) => ({
    games: [],
    game: null,
    upcomingGames: [],
    loading: false,
    error: null,

    // Internal unsubscribe references
    _unsubGame: null,
    _subscribedGameId: null,
    _unsubGames: null,
    _subscribedGroupId: null,
    _unsubUpcoming: [],

    // Game session state
    _activeGameId: null,
    team1Goals: 0,
    team2Goals: 0,
    timer: null,
    isRunning: false,

    setTeam1Goals: (updater) => set((state) => ({
        team1Goals: typeof updater === 'function' ? updater(state.team1Goals) : updater,
    })),
    setTeam2Goals: (updater) => set((state) => ({
        team2Goals: typeof updater === 'function' ? updater(state.team2Goals) : updater,
    })),
    setTimer: (updater) => set((state) => ({
        timer: typeof updater === 'function' ? updater(state.timer) : updater,
    })),
    setIsRunning: (val) => set((state) => ({
        isRunning: typeof val === 'function' ? val(state.isRunning) : val,
    })),

    // Initialize session for a game — only resets if switching to a different game
    initGameSession: (gameId) => {
        const state = useGameStore.getState();
        if (state._activeGameId === gameId) return; // same game, keep state
        console.log('[gameStore] initGameSession: switching from', state._activeGameId, 'to', gameId);
        set({
            _activeGameId: gameId,
            team1Goals: 0,
            team2Goals: 0,
            timer: null,
            isRunning: false,
        });
    },

    // Reset game session state (goals, timer, running)
    resetGameSession: () => {
        console.log('[gameStore] resetGameSession called');
        set({
            _activeGameId: null,
            team1Goals: 0,
            team2Goals: 0,
            timer: null,
            isRunning: false,
        });
    },

    // 🔴 Real-time subscriptions

    subscribeToGame: (gameId) => {
        const state = useGameStore.getState();
        // Skip if already subscribed to this game
        if (state._subscribedGameId === gameId && state._unsubGame) {
            return () => {};
        }

        if (state._unsubGame) state._unsubGame();

        const unsub = GameService.subscribeToGame(gameId, (game) => {
            set({ game, loading: false });
        });
        set({ _unsubGame: unsub, _subscribedGameId: gameId, loading: true });
        return () => {};
    },

    unsubscribeGame: () => {
        const unsub = useGameStore.getState()._unsubGame;
        if (unsub) unsub();
        set({ _unsubGame: null, _subscribedGameId: null });
    },

    subscribeToGamesByGroup: (groupId) => {
        // Skip if already subscribed to this group
        const state = useGameStore.getState();
        if (state._subscribedGroupId === groupId && state._unsubGames) {
            console.log('[gameStore] subscribeToGamesByGroup DEDUP skip for', groupId);
            return () => {};
        }

        // Clean up previous subscription
        if (state._unsubGames) {
            console.log('[gameStore] subscribeToGamesByGroup cleaning up previous sub for', state._subscribedGroupId);
            state._unsubGames();
        }

        console.log('[gameStore] subscribeToGamesByGroup NEW listener for', groupId);
        const unsub = GameService.subscribeToGamesByGroup(groupId, (games) => {
            console.log('[gameStore] subscribeToGamesByGroup callback fired, games:', games.map(g => g.id));
            // Deduplicate by game ID to prevent duplicate key warnings
            const seen = new Set();
            const unique = games.filter(g => {
                if (seen.has(g.id)) return false;
                seen.add(g.id);
                return true;
            });
            if (unique.length !== games.length) {
                console.warn('[gameStore] DUPLICATES detected in Firestore callback!', games.length, '->', unique.length);
            }
            set({ games: unique });
        });
        set({ _unsubGames: unsub, _subscribedGroupId: groupId });
        // Return no-op — store manages the subscription lifecycle
        return () => {};
    },

    unsubscribeGames: () => {
        const unsub = useGameStore.getState()._unsubGames;
        if (unsub) unsub();
        set({ _unsubGames: null, _subscribedGroupId: null });
    },

    subscribeToUpcomingGames: (groups) => {
        const prev = useGameStore.getState()._unsubUpcoming;
        console.log('[gameStore] subscribeToUpcomingGames called, groups:', groups?.map(g => g.id), 'prev unsubs:', prev.length);
        if (prev.length) prev.forEach(fn => fn());

        if (!groups || groups.length === 0) {
            set({ upcomingGames: [], _unsubUpcoming: [] });
            return () => {};
        }

        const gamesByGroup = {};

        const unsubs = groups.map(group =>
            GameService.subscribeToGamesByGroup(group.id, (games) => {
                gamesByGroup[group.id] = games
                    .filter(g => g.status === 'open' || g.status === 'confirmed')
                    .map(g => ({ ...g, groupName: group.name }));
                const allGames = Object.values(gamesByGroup).flat();
                allGames.sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
                    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
                    return dateA - dateB;
                });
                console.log('[gameStore] subscribeToUpcomingGames callback for group', group.id, 'upcomingGames:', allGames.map(g => g.id));
                set({ upcomingGames: allGames });
            })
        );

        set({ _unsubUpcoming: unsubs });
        return () => unsubs.forEach(fn => fn());
    },

    unsubscribeUpcoming: () => {
        const unsubs = useGameStore.getState()._unsubUpcoming;
        unsubs.forEach(fn => fn());
        set({ _unsubUpcoming: [] });
    },

    // Fetch all games
    fetchGames: async () => {
        set({ loading: true, error: null });
        try {
            const games = await GameService.getGames();
            set({ games, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Fetch a single game by ID
    fetchGameById: async (gameId) => {
        set({ loading: true, error: null });
        try {
            const game = await GameService.getGameById(gameId);
            set({ game, team1Goals: 0, team2Goals: 0, timer: null, isRunning: false, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Fetch games by group ID
    fetchGamesByGroup: async (groupId) => {
        set({ loading: true, error: null });
        try {
            const fetchedGames = await GameService.getGamesByGroup(groupId);
            set({ games: fetchedGames, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch games for this group', loading: false });
        }
    },

    // Fetch upcoming games across all groups (skips if already loaded)
    fetchUpcomingGames: async (groups) => {
        if (useGameStore.getState().upcomingGames.length > 0) return;
        if (!groups || groups.length === 0) return;
        try {
            const results = await Promise.all(
                groups.map(group =>
                    GameService.getGamesByGroup(group.id).then(games =>
                        games.map(g => ({ ...g, groupName: group.name }))
                    )
                )
            );
            const allGames = results.flat();
            allGames.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
                const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
                return dateA - dateB;
            });
            set({ upcomingGames: allGames });
        } catch (error) {
            console.error('Failed to fetch upcoming games:', error);
        }
    },

    // Create a new game
    createGame: async (gameData) => {
        if (useGameStore.getState().loading) return;
        set({ loading: true, error: null });
        console.log('[gameStore] createGame called with groupId:', gameData.groupId);
        try {
            const newGame = await GameService.createGame(gameData);
            console.log('[gameStore] createGame SUCCESS, new game id:', newGame.id);
            set({ game: newGame, loading: false });

            // Notify all invited players
            const recipientIds = (gameData.playersInvited || [])
                .filter(p => p.userId && p.userId !== gameData.adminId)
                .map(p => p.userId);
            if (recipientIds.length > 0) {
                NotificationService.send({
                    type: 'game_created',
                    groupId: gameData.groupId,
                    gameId: newGame.id,
                    senderName: gameData._senderName || 'Someone',
                    senderId: gameData.adminId,
                    recipientIds,
                    data: { groupName: gameData._groupName || '', gameDate: gameData.date || '' },
                }).catch(() => {});
            }
        } catch (error) {
            console.error('[gameStore] createGame ERROR:', error);
            set({ error: error.message, loading: false });
        }
    },

    // Update an existing game
    updateGame: async (gameId, updatedData) => {
        set({ error: null });
        try {
            const updatedGame = await GameService.updateGame(gameId, updatedData);
            set((state) => ({
                games: state.games.map(game => game.id === gameId ? updatedGame : game),
            }));
        } catch (error) {
            set({ error: error.message });
        }
    },

    // Delete a game
    deleteGame: async (gameId, notifContext) => {
        console.log('[gameStore] deleteGame called for', gameId);
        try {
            // Send cancellation notification before deleting
            if (notifContext) {
                const recipientIds = (notifContext.allPlayers || [])
                    .filter(p => p.userId && p.userId !== notifContext.senderId)
                    .map(p => p.userId);
                if (recipientIds.length > 0) {
                    NotificationService.send({
                        type: 'game_cancelled',
                        groupId: notifContext.groupId,
                        gameId,
                        senderName: notifContext.senderName,
                        senderId: notifContext.senderId,
                        recipientIds,
                        data: { groupName: notifContext.groupName || '', gameDate: notifContext.gameDate || '' },
                    }).catch(() => {});
                }
            }
            await GameService.deleteGame(gameId);
            set((state) => ({
                games: state.games.filter(game => game.id !== gameId),
                upcomingGames: state.upcomingGames.filter(game => game.id !== gameId),
                game: null,
            }));
            console.log('[gameStore] deleteGame SUCCESS');
        } catch (error) {
            console.error('[gameStore] deleteGame ERROR:', error);
            set({ error: error.message });
        }
    },

    handlePlayerIn: async (gameId, playerId, notifContext) => {
        let previousStatus = null;
        set((state) => {
            const { game } = state;
            if (!game) return state;
            previousStatus = game.status;

            let updatedPlayersIn = [...game.playersIn];
            let updatedPlayersOut = [...game.playersOut];
            let updatedPlayersInvited = [...game.playersInvited];

            if (updatedPlayersOut.some(player => player.id === playerId)) {
                const player = updatedPlayersOut.find(player => player.id === playerId);
                updatedPlayersOut = updatedPlayersOut.filter(player => player.id !== playerId);
                updatedPlayersIn.push(player);
            } else if (updatedPlayersInvited.some(player => player.id === playerId)) {
                const player = updatedPlayersInvited.find(player => player.id === playerId);
                updatedPlayersInvited = updatedPlayersInvited.filter(player => player.id !== playerId);
                updatedPlayersIn.push(player);
            }

            const newStatus = updatedPlayersIn.length >= (game.minPlayers || 10) ? 'confirmed' : 'open';

            return {
                game: {
                    ...game,
                    playersIn: updatedPlayersIn,
                    playersOut: updatedPlayersOut,
                    playersInvited: updatedPlayersInvited,
                    status: newStatus
                }
            };
        });

        const { game } = useGameStore.getState();
        if (game) {
            await GameService.updateGame(gameId, {
                playersIn: game.playersIn,
                playersOut: game.playersOut,
                playersInvited: game.playersInvited,
                status: game.status
            });

            // Send player_in notification
            if (notifContext) {
                const allPlayers = [...(game.playersIn || []), ...(game.playersOut || []), ...(game.playersInvited || [])];
                const recipientIds = allPlayers
                    .filter(p => p.userId && p.userId !== notifContext.senderId)
                    .map(p => p.userId);
                if (recipientIds.length > 0) {
                    NotificationService.send({
                        type: 'player_in',
                        groupId: notifContext.groupId,
                        gameId,
                        senderName: notifContext.senderName,
                        senderId: notifContext.senderId,
                        recipientIds,
                        data: { groupName: notifContext.groupName || '', gameDate: notifContext.gameDate || '' },
                    }).catch(() => {});

                    // If status changed to confirmed, send an extra notification
                    if (previousStatus === 'open' && game.status === 'confirmed') {
                        NotificationService.send({
                            type: 'game_confirmed',
                            groupId: notifContext.groupId,
                            gameId,
                            senderName: notifContext.senderName,
                            senderId: notifContext.senderId,
                            recipientIds,
                            data: { groupName: notifContext.groupName || '', gameDate: notifContext.gameDate || '' },
                        }).catch(() => {});
                    }
                }
            }
        }
    },

    handlePlayerOut: async (gameId, playerId, notifContext) => {
        let previousStatus = null;
        set((state) => {
            const { game } = state;
            if (!game) return state;
            previousStatus = game.status;

            let updatedPlayersIn = game.playersIn.filter(player => player.id !== playerId);
            let updatedPlayersInvited = game.playersInvited.filter(player => player.id !== playerId);
            let updatedPlayersOut = [...game.playersOut];

            if (game.playersIn.some(player => player.id === playerId)) {
                updatedPlayersOut.push(game.playersIn.find(player => player.id === playerId));
            } else if (game.playersInvited.some(player => player.id === playerId)) {
                updatedPlayersOut.push(game.playersInvited.find(player => player.id === playerId));
            }

            const newStatus = updatedPlayersIn.length >= (game.minPlayers || 10) ? 'confirmed' : 'open';

            return {
                game: {
                    ...game,
                    playersIn: updatedPlayersIn,
                    playersInvited: updatedPlayersInvited,
                    playersOut: updatedPlayersOut,
                    status: newStatus
                }
            };
        });

        const { game } = useGameStore.getState();
        if (game) {
            await GameService.updateGame(gameId, {
                playersIn: game.playersIn,
                playersInvited: game.playersInvited,
                playersOut: game.playersOut,
                status: game.status
            });

            // Send player_out notification
            if (notifContext) {
                const allPlayers = [...(game.playersIn || []), ...(game.playersOut || []), ...(game.playersInvited || [])];
                const recipientIds = allPlayers
                    .filter(p => p.userId && p.userId !== notifContext.senderId)
                    .map(p => p.userId);
                if (recipientIds.length > 0) {
                    NotificationService.send({
                        type: 'player_out',
                        groupId: notifContext.groupId,
                        gameId,
                        senderName: notifContext.senderName,
                        senderId: notifContext.senderId,
                        recipientIds,
                        data: { groupName: notifContext.groupName || '', gameDate: notifContext.gameDate || '' },
                    }).catch(() => {});

                    // If status changed from confirmed to open, warn players
                    if (previousStatus === 'confirmed' && game.status === 'open') {
                        NotificationService.send({
                            type: 'game_needs_players',
                            groupId: notifContext.groupId,
                            gameId,
                            senderName: notifContext.senderName,
                            senderId: notifContext.senderId,
                            recipientIds,
                            data: { groupName: notifContext.groupName || '', gameDate: notifContext.gameDate || '' },
                        }).catch(() => {});
                    }
                }
            }
        }
    },

}));

export default useGameStore;
