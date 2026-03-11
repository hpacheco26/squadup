import { create } from 'zustand';
import GameService from '../api/gameService';

const useGameStore = create((set) => ({
    games: [],
    game: null,
    upcomingGames: [],
    loading: false,
    error: null,

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
    setIsRunning: (val) => set({ isRunning: typeof val === 'function' ? val(useGameStore.getState().isRunning) : val }),

    // Reset game session state (goals, timer, running)
    resetGameSession: () => set({
        team1Goals: 0,
        team2Goals: 0,
        timer: null,
        isRunning: false,
    }),

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
            set((state) => ({ games: [...state.games, newGame], loading: false }));
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

            return {
                game: {
                    ...game,
                    playersIn: updatedPlayersIn,
                    playersOut: updatedPlayersOut,
                    playersInvited: updatedPlayersInvited
                }
            };
        });

        const { game } = useGameStore.getState();
        if (game) {
            await GameService.updateGame(gameId, {
                playersIn: game.playersIn,
                playersOut: game.playersOut,
                playersInvited: game.playersInvited
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

            return {
                game: {
                    ...game,
                    playersIn: updatedPlayersIn,
                    playersInvited: updatedPlayersInvited,
                    playersOut: updatedPlayersOut
                }
            };
        });

        const { game } = useGameStore.getState();
        if (game) {
            await GameService.updateGame(gameId, {
                playersIn: game.playersIn,
                playersInvited: game.playersInvited,
                playersOut: game.playersOut
            });
        }
    },

}));

export default useGameStore;
