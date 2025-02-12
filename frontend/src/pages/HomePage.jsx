import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function HomePage() {
  const { logout } = useAuthStore(); // Get logout function from Zustand store

  return (
    <div className="container has-text-centered">
      <h1 className="title is-1">Welcome to SquadUp</h1>
      <p className="subtitle is-3">The best place to manage your sports groups</p>
      
      <div className="buttons is-centered">
        <Link to="/groups" className="button is-primary is-large">
          View Groups
        </Link>
        <button onClick={logout} className="button is-danger is-large">
          Logout
        </button>
      </div>
    </div>
  );
}

export default HomePage;
