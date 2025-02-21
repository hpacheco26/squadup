import { create } from "zustand";
import { persist } from "zustand/middleware";
import PlayerService from "../api/playerService";

const usePlayerStore = create(
  persist(
    (set) => ({
      players: [],
      loading: false,
      error: null,

      fetchPlayers: async () => {
        set({ loading: true, error: null });
        try {
          const data = await PlayerService.getAllPlayers();
          set({ players: data, loading: false });
        } catch (error) {
          set({ error: "Failed to fetch players", loading: false });
          console.error("Error fetching players:", error);
        }
      },

      fetchPlayerById: async (id) => {
        set({ loading: true, error: null });
        try {
          const player = await PlayerService.getPlayerById(id);
          set((state) => ({
            players: state.players.some((p) => p.id === id)
              ? state.players.map((p) => (p.id === id ? player : p))
              : [...state.players, player],
            loading: false,
          }));
        } catch (error) {
          set({ error: "Failed to fetch player by ID", loading: false });
          console.error("Error fetching player by ID:", error);
        }
      },

      addPlayer: async (playerData) => {
        set({ error: null });
        try {
          const newPlayer = await PlayerService.createPlayer(playerData);
          set((state) => ({
            players: [...state.players, newPlayer],
            error: null,
          }));
        } catch (error) {
          set({ error: "Failed to create player" });
          console.error("Error creating player:", error);
        }
      },

      updatePlayer: async (id, updatedData) => {
        set({ error: null });
        try {
          await PlayerService.updatePlayer(id, updatedData);
          set((state) => ({
            players: state.players.map((p) =>
              p.id === id ? { ...p, ...updatedData } : p
            ),
          }));
        } catch (error) {
          set({ error: "Failed to update player" });
          console.error("Error updating player:", error);
        }
      },

      deletePlayer: async (id) => {
        set({ error: null });
        try {
          await PlayerService.deletePlayer(id);
          set((state) => ({
            players: state.players.filter((p) => p.id !== id),
          }));
        } catch (error) {
          set({ error: "Failed to delete player" });
          console.error("Error deleting player:", error);
        }
      },
    }),
    {
      name: "player-storage", // Key for localStorage
      getStorage: () => localStorage, // Use localStorage for persistence
    }
  )
);

export default usePlayerStore;
