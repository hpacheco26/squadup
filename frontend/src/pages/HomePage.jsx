import { Link, useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi'; // Import settings icon

function HomePage() {
  const navigate = useNavigate(); // Hook to navigate programmatically

  return (
    <div className="hero is-flex is-justify-content-center is-align-items-center">
      <div className="container has-text-centered">
        <h1 className="title is-2" style={{ marginBottom: '20px' }}>Welcome to SquadUp</h1>
        <p className="subtitle is-4">The best place to manage your sports groups</p>

        {/* Vertically centered Enter button */}
        <div className="is-flex is-justify-content-center is-align-items-center" style={{ height: '50vh' }}>
          <Link to="/groups" className="button is-primary is-large">
            Enter
          </Link>
        </div>
      </div>

      {/* Account Settings Button - Fixed at Top Right */}
      <button 
        onClick={() => navigate('/settings')} 
        className="settings-button button is-info"
      >
        <FiSettings size={24} /> {/* Settings Icon */}
      </button>

      {/* Inline styles for positioning */}
      <style>
        {`
          .settings-button {
            position: fixed;
            top: 20px;
            right: 20px;
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
