import React from 'react';



const HeaderBar = () => {
    
    
    return (
        <header style={styles.header}>
            {/* App Name */}
            <h1 style={styles.title}>SquadUp</h1>
            
           
        </header>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    
};

export default HeaderBar;
