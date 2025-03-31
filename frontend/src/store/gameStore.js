import { create } from 'zustand';
import GameService from '../api/gameService';

const useGameStore = create((set) => ({
    games: [],
    game: null,
    loading: false,
    error: null,

    // Fetch all games
    fetchGames: async () => {
        set({ loading: true, error: null });
        try {
            const games = await GameService.getAllGames();
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
            set({ game, loading: false });
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

        await GameService.updateGame(gameId, {
            playersIn: updatedPlayersIn,
            playersOut: updatedPlayersOut,
            playersInvited: updatedPlayersInvited
        });
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

        await GameService.updateGame(gameId, {
            playersIn: updatedPlayersIn,
            playersInvited: updatedPlayersInvited,
            playersOut: updatedPlayersOut
        });
    },

}));

export default useGameStore;
