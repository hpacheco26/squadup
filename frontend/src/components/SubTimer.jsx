import React, { useState, useEffect } from 'react';
import { Button, Card } from 'react-bulma-components';
import PlayerCardMini from './PlayerCardMini'; // Mini player card
import SubTimerModal from './SubTimerModal'; // Import the SubTimerModal component

const SubTimer = ({ team1, team2, onSubstitution }) => {
    const initialTime = 1; // (game?.subTime || 5) * 60; // Convert subTime to seconds
    const [timer, setTimer] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const startTimer = () => {
        setTimer(initialTime);
        setIsRunning(true);
    };

    const stopTimer = () => {
        setIsRunning(false);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimer(initialTime);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <>
            <Card className="mb-4">
                <Card.Content className="has-text-centered">
                    <h2 className="title is-3">Sub Timer</h2>
                    <p className="subtitle is-1">{formatTime(timer)}</p>
                    <Button className="is-primary" onClick={startTimer} disabled={isRunning}>
                        Start
                    </Button>
                    <Button className="is-danger mx-2" onClick={stopTimer} disabled={!isRunning}>
                        Stop
                    </Button>
                    <Button className="is-warning" onClick={resetTimer}>
                        Reset
                    </Button>
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
