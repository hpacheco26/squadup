import React, { useState, useEffect } from 'react';
import { Card } from 'react-bulma-components';
import SubTimerModal from './SubTimerModal'; // Import the SubTimerModal component
import useHoverEffect from '../hooks/useHoverEffect'; // Import the hover effect hook

const SubTimer = ({ team1, team2, onSubstitution }) => {
    const initialTime = 1; // (game?.subTime || 5) * 60; // Convert subTime to seconds
    const [timer, setTimer] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClicked, setIsClicked] = useState(false); // To toggle the background color when clicked

    const { handleMouseEnter, handleMouseLeave, getStyle } = useHoverEffect(); // Use the hover effect

    useEffect(() => {
        let interval;
        if (isRunning && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsRunning(false);
            clearInterval(interval);
            setIsModalOpen(true); // Open the modal when the timer ends
        }
        return () => clearInterval(interval);
    }, [isRunning, timer]);

    const startStopTimer = () => {
        setIsClicked(!isClicked); // Toggle the clicked state to change background color
        if (!isRunning) {
            setTimer(initialTime);
            setIsRunning(true);
        } else {
            setIsRunning(false);
        }
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimer(initialTime);
        setIsClicked(false); // Reset the background color when reset
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <>
            <Card
                className="mb-4 clickable-card"
                onClick={startStopTimer}
                onMouseEnter={() => handleMouseEnter('subtimer')}
                onMouseLeave={handleMouseLeave}
                style={getStyle('subtimer')} // Apply the hover effect style
            >
                <Card.Content
                    className={`has-text-centered ${isClicked ? 'has-background-primary' : ''}`} // Change background color on click
                >
                    <h2 className="title is-3">Sub Timer</h2>
                    <p className="subtitle is-1">{formatTime(timer)}</p>
                </Card.Content>
            </Card>

            {/* Substitution Modal - Using SubTimerModal Component */}
            <SubTimerModal
                team1={team1}
                team2={team2}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAcceptSub={() => {
                    onSubstitution(); // Call the function passed from the parent
                    setIsModalOpen(false); // Close the modal after accepting
                    resetTimer(); // Optionally reset the timer
                }}
            />
        </>
    );
};

export default SubTimer;
