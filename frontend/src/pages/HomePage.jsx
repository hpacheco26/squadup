import { Link } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi'; // Import logout icon
import useAuthStore from '../store/authStore';

function HomePage() {
  const { logout } = useAuthStore();

  return (
    <div className="hero is-fullheight is-flex is-justify-content-center is-align-items-center">
      <div className="container has-text-centered">
        <h1 className="title is-2" style={{ marginBottom: '20px' }}>Welcome to SquadUp</h1> {/* Custom margin-bottom */}
        <p className="subtitle is-4">The best place to manage your sports groups</p>

        {/* Vertically centered Enter button */}
        <div className="is-flex is-justify-content-center is-align-items-center" style={{ height: '50vh' }}>
          <Link to="/groups" className="button is-primary is-large">
            Enter
          </Link>
        </div>
      </div>

      {/* Logout button fixed at the bottom-left */}
      <button 
        onClick={logout} 
        className="logout-button button is-danger"
      >
        <FiLogOut size={24} /> {/* Logout Icon */}
      </button>

      {/* Inline styles for positioning */}
      <style>
        {`
          .logout-button {
            position: fixed;
            bottom: 20px;
            left: 20px;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}
      </style>
    </div>
  );
}

export default HomePage;
