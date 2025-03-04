import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

function Navbar() {
    return (
        <nav className="navbar is-light" style={styles.navbar}>
            <div id="navbarBasicExample" className="navbar-menu" style={styles.navbarMenu}>
                <div className="navbar-start" style={styles.navbarStart}>
                    {/* Home Link */}
                    <Link to="/" className="navbar-item">
                        Home
                    </Link>
                    {/* Group Link */}
                    <Link to="/groups" className="navbar-item">
                        Groups
                    </Link>
                    {/* Game Link */}
                    <Link to="/game" className="navbar-item">
                        Game
                    </Link>
                </div>
            </div>
        </nav>
    );
}

// Custom inline styles for fixed bottom navbar with reduced space
const styles = {
    navbar: {
        // position: 'fixed',
        // bottom: '0',
        // left: '0',
        // right: '0',
        zIndex: 1000, // Ensure it stays on top of content
    },
    navbarMenu: {
        display: 'flex',
        justifyContent: 'center', // Horizontally center the menu
        width: '100%',
    },
    navbarStart: {
        display: 'flex',
        justifyContent: 'center', // This will center the items
        alignItems: 'center', // Vertically center the items (useful for better alignment)
        gap: '15px', // Adjust space between links
        width: '100%', // Make sure the container spans the full width
    },
};

export default Navbar;
