import React from 'react';
import { GiArena } from "react-icons/gi";
import { MdGroups3 } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import { TbTriangleSquareCircleFilled } from "react-icons/tb";

function Navbar() {
    const navigate = useNavigate();
    return (
        <nav className="navbar" style={styles.navbar}>
            <div style={styles.navbarMenu}>
                <div className="navbar-start" style={styles.navbarStart}>
                    {/* Home Link */}
                    <Link to="/" className="navbar-item" style={{color: '#94a3b8'}}>
                        <TbTriangleSquareCircleFilled style={{fontSize: "25px", padding: "0px"}} />
                    </Link>
                    {/* Group Link */}
                    <Link to="/groups" className="navbar-item" style={{color: '#94a3b8'}}>
                        <MdGroups3 style={{fontSize: "30px", padding: "0px"}} />
                    </Link>
                     {/* Settings Button (Removed from HomePage) */}
                    <button 
                        onClick={() => navigate('/settings')} 
                        style={styles.settingsButton}
                        aria-label="Go to Account Settings"
                    >
                        <IoSettingsSharp size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        zIndex: 1000,
        padding: "0px",
        backgroundColor: "#1e293b",
        color: "#94a3b8",
    },
    navbarMenu: {
        display: 'flex',
        justifyContent: 'center', 
        width: '100%',
    },
    navbarStart: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center', 
        gap: '50px', 
        width: '100%',
    },

    settingsButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
        color: '#94a3b8',
    }
};

export default Navbar;
