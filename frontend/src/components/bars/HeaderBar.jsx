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
        backgroundColor: '#f8f9fa', // Light background
        borderBottom: '1px solid #ddd',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    
};

export default HeaderBar;
