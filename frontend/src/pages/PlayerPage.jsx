import { useEffect, useState } from 'react';
import usePlayerStore from '../store/playerStore';

function PlayersPage() {
  const { players, fetchPlayers } = usePlayerStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchPlayers();
      } catch (err) {
        setError('Failed to load players');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchPlayers]);

  if (loading) return <div className="notification is-primary">Loading players...</div>;
  if (error) return <div className="notification is-danger">{error}</div>;

  return (
    <div className="container">
      <h1 className="title is-2">Players</h1>
      <ul>
        {players.length > 0 ? (
          players.map((player) => (
            <li key={player.id} className="box">
              <strong>{player.firstName} {player.lastName}</strong>
            </li>
          ))
        ) : (
          <li className="notification is-warning">No players available</li>
        )}
      </ul>
    </div>
  );
}

export default PlayersPage;
