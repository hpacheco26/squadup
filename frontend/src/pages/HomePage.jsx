import { Link, useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi'; // Import settings icon

function HomePage() {
  const navigate = useNavigate(); // Hook to navigate programmatically

  return (
    <div className="hero is-flex is-justify-content-center is-align-items-center" style={{ minHeight: "100vh", textAlign: "center" }}>
      <div className="container">
        <h1 className="title is-2 mb-4">Welcome to SquadUp</h1>
        <p className="subtitle is-4">The best place to manage your sports groups</p>

        {/* Centered Enter button */}
        <div className="is-flex is-justify-content-center is-align-items-center mt-5">
          <Link to="/groups" className="button is-primary is-large">
            Enter
          </Link>
        </div>
      </div>

      {/* Account Settings Button - Fixed at Top Right */}
      <button 
        onClick={() => navigate('/settings')} 
        className="settings-button button is-info"
        aria-label="Go to Account Settings"
      >
        <FiSettings size={24} />
      </button>

      {/* Styles */}
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
            transition: background 0.2s ease-in-out;
          }

          .settings-button:hover {
            background: #209cee; /* Lighter blue for hover effect */
          }
        `}
      </style>
    </div>
  );
}

export default HomePage;
