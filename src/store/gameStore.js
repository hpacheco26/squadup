import { create } from 'zustand';
import GameService from '../api/gameService';

const useGameStore = create((set) => ({
    games: [],
    game: null,
    upcomingGames: [],
    loading: false,
    error: null,

    // Internal unsubscribe references
    _unsubGame: null,
    _unsubGames: null,
    _unsubUpcoming: [],

    // Game session state (persists across tab switches)
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

    // Reset game session state (goals, timer, running)
    resetGameSession: () => set({
        team1Goals: 0,
        team2Goals: 0,
        timer: null,
        isRunning: false,
    }),

    // 🔴 Real-time subscriptions

    subscribeToGame: (gameId) => {
        const prev = useGameStore.getState()._unsubGame;
        if (prev) prev();

        const unsub = GameService.subscribeToGame(gameId, (game) => {
            set({ game, loading: false });
        });
        set({ _unsubGame: unsub, loading: true });
        return unsub;
    },

    unsubscribeGame: () => {
        const unsub = useGameStore.getState()._unsubGame;
        if (unsub) unsub();
        set({ _unsubGame: null });
    },

    subscribeToGamesByGroup: (groupId) => {
        const prev = useGameStore.getState()._unsubGames;
        if (prev) prev();

        const unsub = GameService.subscribeToGamesByGroup(groupId, (games) => {
            // Deduplicate by game ID to prevent duplicate key warnings
            const seen = new Set();
            const unique = games.filter(g => {
                if (seen.has(g.id)) return false;
                seen.add(g.id);
                return true;
            });
            set({ games: unique, loading: false });
        });
        set({ _unsubGames: unsub, loading: true });
        return unsub;
    },

    unsubscribeGames: () => {
        const unsub = useGameStore.getState()._unsubGames;
        if (unsub) unsub();
        set({ _unsubGames: null });
    },

    subscribeToUpcomingGames: (groups) => {
        const prev = useGameStore.getState()._unsubUpcoming;
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
        set({ loading: true, error: null });
        try {
            const newGame = await GameService.createGame(gameData);
            set({ game: newGame, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Update an existing game
    updateGame: async (gameId, updatedData) => {
        set({ loading: true, error: null });
        try {
            const updatedGame = await GameService.updateGame(gameId, updatedData);
            set((state) => ({
                games: state.games.map(game => game.id === gameId ? updatedGame : game),
                game: updatedGame,
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Delete a game
    deleteGame: async (gameId) => {
        set({ loading: true, error: null });
        try {
            await GameService.deleteGame(gameId);
            set((state) => ({
                games: state.games.filter(game => game.id !== gameId),
                game: null,
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    handlePlayerIn: async (gameId, playerId) => {
        set((state) => {
            const { game } = state;
            if (!game) return state;

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
        }
    },

    handlePlayerOut: async (gameId, playerId) => {
        set((state) => {
            const { game } = state;
            if (!game) return state;

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
        }
    },

    togglePayment: async (gameId, playerId) => {
        const state = useGameStore.getState();
        // Find the game in either single game or games list
        const targetGame = (state.game?.id === gameId ? state.game : null)
            || (state.games || []).find(g => g.id === gameId);
        if (!targetGame) return;

        const payments = { ...(targetGame.payments || {}) };
        const newValue = !payments[playerId];
        payments[playerId] = newValue;

        // Update local state
        if (state.game?.id === gameId) {
            set({ game: { ...state.game, payments } });
        }
        const updatedGames = (state.games || []).map(g =>
            g.id === gameId ? { ...g, payments } : g
        );
        set({ games: updatedGames });

        // Use atomic dot-notation update to avoid overwriting other players' payments
        await GameService.updateGame(gameId, { [`payments.${playerId}`]: newValue });

        // If game is ended and all in-game players are effectively paid, clean it up
        if (targetGame.status === 'ended') {
            const allPlayers = [...(targetGame.team1 || []), ...(targetGame.team2 || []), ...(targetGame.injured || [])];
            const treasuryId = targetGame.treasuryPlayerId || null;
            const allPaid = allPlayers.length > 0 && allPlayers.every(p => {
                if (p.id === treasuryId) return true;
                if (p.guest && p.addedBy === treasuryId) return true;
                if (payments[p.id]) return true;
                if (p.guest && p.addedBy && payments[p.addedBy]) return true;
                return false;
            });
            if (allPaid) {
                await GameService.deleteGame(gameId);
                set({ games: updatedGames.filter(g => g.id !== gameId) });
            }
        }
    },

}));

export default useGameStore;
