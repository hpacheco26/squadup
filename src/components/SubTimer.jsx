import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Card } from 'react-bulma-components';
import SubTimerModal from './modals/SubTimerModal';
import useHoverEffect from '../hooks/useHoverEffect';
import useGameStore from '../store/gameStore';

const SubTimer = ({ team1, team2, onSubstitution }) => {
    const { game } = useGameStore();
    const initialTime = (game?.subTime || 5) * 60;
    const [timer, setTimer] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [showStripes, setShowStripes] = useState(false); // Toggle between styles

    const { handleMouseEnter, handleMouseLeave, getStyle } = useHoverEffect();

    useEffect(() => {
        let interval;
        if (isRunning && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsRunning(false);
            clearInterval(interval);
            setIsModalOpen(true);
        }
        return () => clearInterval(interval);
    }, [isRunning, timer]);

    const startStopTimer = () => {
        setIsClicked(!isClicked);
        setShowStripes(!showStripes); 
        if (!isRunning) {
            // setTimer(initialTime);
            setIsRunning(true);
        } else {
            setIsRunning(false);
        }
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimer(initialTime);
        setIsClicked(false);
        setShowStripes(false);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Triangle styles
    const triangleStyles = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '0',
        height: '0',
        borderLeft: '60px solid transparent',
        borderRight: '60px solid transparent',
        borderTop: '60px solid green',
        opacity: 0.2,
        transform: 'translate(-50%, -50%) rotate(-90deg)',
    };

    // Vertical stripes styles
    const stripeStyles = {
        position: 'absolute',
        top: '50%',
        left: '40%',
        width: '20px',
        height: '110px',
        backgroundColor: 'green',
        opacity: 0.2,
        transform: 'translate(-50%, -50%)',
    };

    const secondStripeStyles = {
        ...stripeStyles,
        left: 'calc(50% + 25px)',
    };

    return (
        <>
            <Card
                className="mb-4 clickable-card"
                onClick={startStopTimer}
                onMouseEnter={() => handleMouseEnter('subtimer')}
                onMouseLeave={handleMouseLeave}
                style={getStyle('subtimer')}
            >
                <Card.Content>
                    <h2 className="title is-3">Sub Timer</h2>
                    <p className="subtitle is-1">{formatTime(timer)}</p>
                </Card.Content>

                {/* Show triangle or stripes based on state */}
                {showStripes ? (
                    <>
                        <div style={stripeStyles}></div>
                        <div style={secondStripeStyles}></div>
                    </>
                ) : (
                    <div style={triangleStyles}></div>
                )}
            </Card>

            <SubTimerModal
                team1={team1}
                team2={team2}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAcceptSub={() => {
                    onSubstitution();
                    setIsModalOpen(false);
                    resetTimer();
                }}
            />
        </>
    );
};

export default SubTimer;

SubTimer.propTypes = {
    team1: PropTypes.array,
    team2: PropTypes.array,
    onSubstitution: PropTypes.func,
};
