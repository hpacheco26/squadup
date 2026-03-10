import React from 'react';
import logo from '../../assets/logo.png';



const HeaderBar = () => {
    
    
    return (
        <header style={styles.header}>
            {/* App Logo */}
            <img src={logo} alt="SquadUp" style={styles.logo} />
            
           
        </header>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
    },
    logo: {
        height: '36px',
    },
    
};

export default HeaderBar;
