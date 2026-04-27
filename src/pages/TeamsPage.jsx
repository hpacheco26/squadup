import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { balanceTeams, getCaptain } from '../utils/teamBalancer';
import PlayerCardMini from '../components/cards/PlayerCardMini';
import SwipeTeamPlayer from '../components/SwipeTeamPlayer';
import RankIcon from '../components/RankIcon';
import RankTierList from '../components/RankTierList';
import TeamPowerCard from '../components/TeamPowerCard';
import useGameStore from '../store/gameStore';
import useGroupStore from '../store/groupStore';
import { FiSettings } from 'react-icons/fi';
import { ShieldBan, Shuffle, Swords } from 'lucide-react';
import GameModal from '../components/modals/GameModal';
import useLanguageStore from '../store/languageStore';

const getPlayerRoleLabelKey = (index) => {
    if (index < 4) return 'roleField';
    if (index === 4) return 'roleKeeper';
    return 'roleBench';
};

const TeamsPage = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { game, subscribeToGame, updateGame, loading } = useGameStore();
    const { group, subscribeToGroup } = useGroupStore();
    const { t } = useLanguageStore();
    const [pressed, setPressed] = useState(false);
    const [isGameModalOpen, setIsGameModalOpen] = useState(false);
    const [shuffling, setShuffling] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        if (gameId) {
            const unsub = subscribeToGame(gameId);
            return unsub;
        }
    }, [gameId, subscribeToGame]);

    useEffect(() => {
        if (loading) return;
        if (!game) {
            const gId = group?.id;
            if (gId) navigate(`/groups/${gId}`, { replace: true });
            else navigate('/', { replace: true });
            return;
        }
        if (game.status && game.status !== 'open' && game.status !== 'confirmed') {
            navigate(`/groups/${game.groupId}`, { replace: true });
        }
    }, [game, loading, group?.id, navigate]);

    useEffect(() => {
        if (game?.groupId) {
            const unsub = subscribeToGroup(game.groupId);
            return unsub;
        }
    }, [game?.groupId, subscribeToGroup]);

    const handleSquadUp = async () => {
        if (game?.playersIn?.length > 0) {
            setShuffling(true);
            setAnimateIn(false);
            await new Promise(r => setTimeout(r, 700));
            const { team1, team2 } = balanceTeams(game.playersIn);
            await updateGame(gameId, { team1, team2 });
            setShuffling(false);
            setAnimateIn(true);
            setTimeout(() => setAnimateIn(false), 800);
        }
    };

    const hurricaneStyle = (i, total) => {
        const angle = (360 / total) * i;
        const rad = angle * (Math.PI / 180);
        const radius = 60;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const spin = 360 + angle;
        return {
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease',
            transform: shuffling
                ? `translate(${x}px, ${y}px) rotate(${spin}deg) scale(0.7)`
                : 'translate(0, 0) rotate(0deg) scale(1)',
            opacity: shuffling ? 0.3 : 1,
        };
    };

    const settleStyle = (index, direction) => {
        const delay = index * 0.06;
        return {
            transition: `transform ${0.4 + delay}s cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${0.3 + delay}s ease`,
            transform: animateIn
                ? 'translateY(0) rotate(0deg) scale(1)'
                : (shuffling ? `translateY(${direction * 50}px) rotate(${direction * 180}deg) scale(0.5)` : 'translateY(0) rotate(0deg) scale(1)'),
            opacity: shuffling ? 0 : 1,
        };
    };

    if (!game) return <p>{t('loadingTeams')}</p>;

    const playersIn = game.playersIn || [];
    const hasTeams = game.team1?.length > 0 || game.team2?.length > 0;
    const captain1 = getCaptain(game.team1);
    const captain2 = getCaptain(game.team2);
    const team1Name = `${captain1?.firstName || 'Team'}'s Squad`;
    const team2Name = `${captain2?.firstName || 'Team'}'s Squad`;
    const canSquadUp = playersIn.length > 1 && !shuffling;

    const sortTeamPlayers = (players = [], captainId) => {
        return [...players].sort((a, b) => {
            if (a.id === captainId) return -1;
            if (b.id === captainId) return 1;

            const rankA = Number.isFinite(a?.rank) ? a.rank : Number(a?.rank) || 0;
            const rankB = Number.isFinite(b?.rank) ? b.rank : Number(b?.rank) || 0;

            if (rankB !== rankA) return rankB - rankA;

            const nameA = `${a?.firstName || ''} ${a?.lastName || ''}`.trim();
            const nameB = `${b?.firstName || ''} ${b?.lastName || ''}`.trim();
            return nameA.localeCompare(nameB);
        });
    };

    const sortedTeam1 = sortTeamPlayers(game.team1 || [], captain1?.id);
    const sortedTeam2 = sortTeamPlayers(game.team2 || [], captain2?.id);

    const handleSwitchTeam = async (player, fromTeamKey) => {
        const team1 = [...(game.team1 || [])];
        const team2 = [...(game.team2 || [])];

        if (fromTeamKey === 'team1') {
            await updateGame(gameId, {
                team1: team1.filter(p => p.id !== player.id),
                team2: [...team2, player],
            });
            return;
        }

        await updateGame(gameId, {
            team1: [...team1, player],
            team2: team2.filter(p => p.id !== player.id),
        });
    };

    const handleInjurePlayer = async (player, fromTeamKey) => {
        const team1 = [...(game.team1 || [])];
        const team2 = [...(game.team2 || [])];
        const injured = [...(game.injured || [])];
        const injuredPlayer = { ...player, fromTeam: fromTeamKey };

        if (fromTeamKey === 'team1') {
            await updateGame(gameId, {
                team1: team1.filter(p => p.id !== player.id),
                injured: [...injured, injuredPlayer],
            });
            return;
        }

        await updateGame(gameId, {
            team2: team2.filter(p => p.id !== player.id),
            injured: [...injured, injuredPlayer],
        });
    };

    const handleRecoverPlayer = async (player) => {
        const fromTeamKey = player?.fromTeam === 'team2' ? 'team2' : 'team1';
        const team1 = [...(game.team1 || [])];
        const team2 = [...(game.team2 || [])];
        const injured = [...(game.injured || [])];
        const recoveredPlayer = { ...player };
        delete recoveredPlayer.fromTeam;

        if (fromTeamKey === 'team1') {
            await updateGame(gameId, {
                team1: [...team1, recoveredPlayer],
                injured: injured.filter(p => p.id !== player.id),
            });
            return;
        }

        await updateGame(gameId, {
            team2: [...team2, recoveredPlayer],
            injured: injured.filter(p => p.id !== player.id),
        });
    };

    const renderTeamPlayerCard = (player, index, teamKey, captainId, injured = false) => {
        const roleKey = injured ? 'injured' : getPlayerRoleLabelKey(index);
        const roleLabel = t(roleKey);
        const isCaptain = captainId === player.id;
        const teamAccent = teamKey === 'team2' ? 'rgba(225, 29, 72, 0.4)' : 'rgba(13, 148, 136, 0.4)';

        return (
            <SwipeTeamPlayer
                player={player}
                roleLabel={roleLabel}
                team={teamKey}
                isCaptain={isCaptain}
                compactName
                mode={injured ? 'injured' : 'team'}
                onSwipe={injured ? undefined : () => handleSwitchTeam(player, teamKey)}
                onInjury={injured ? undefined : () => handleInjurePlayer(player, teamKey)}
                onRecover={injured ? () => handleRecoverPlayer(player) : undefined}
                accentColor={teamAccent}
            />
        );
    };

    return (
        <>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Swords size={20} color="#5b7bb3" />
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                        {group?.name || t('teams')}
                    </h1>
                </div>
                <button onClick={() => setIsGameModalOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', color: '#94a3b8' }} aria-label="Game Settings">
                    <FiSettings size={22} />
                </button>
            </header>
            <GameModal isOpen={isGameModalOpen} setIsOpen={setIsGameModalOpen} group={group} game={game} />
            <div className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflow: 'hidden' }}>
                {/* Rank Tier List — Always visible */}
                <RankTierList />

                {/* Game Power Card — Show only when teams are balanced */}
                {hasTeams && (
                    <TeamPowerCard
                        leftTeamName={team1Name}
                        rightTeamName={team2Name}
                        leftPlayers={game.team1 || []}
                        rightPlayers={game.team2 || []}
                    />
                )}

                {/* Main Content */}
                <div style={{ flex: 1, overflowY: shuffling ? 'hidden' : 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '2px' }}>
                    {!hasTeams ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {playersIn.map((player, i) => (
                                <div
                                    key={player.id}
                                    style={hurricaneStyle(i, playersIn.length)}
                                >
                                    <PlayerCardMini player={player} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
                            <div style={{
                                position: 'absolute',
                                top: '8px',
                                bottom: '8px',
                                left: '50%',
                                width: '1px',
                                transform: 'translateX(-0.5px)',
                                background: 'linear-gradient(to bottom, transparent 0%, rgba(91,123,179,0.28) 12%, rgba(91,123,179,0.45) 50%, rgba(91,123,179,0.28) 88%, transparent 100%)',
                                pointerEvents: 'none',
                                zIndex: 0,
                            }} />
                            {/* Team 1 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px' }}>
                                {sortedTeam1.map((player, index) => (
                                    <div key={player.id} style={settleStyle(index, -1)}>
                                        {renderTeamPlayerCard(player, index, 'team1', captain1?.id)}
                                    </div>
                                ))}
                                {sortedTeam1.length === 0 && (
                                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', margin: '8px 0 6px' }}>
                                        {t('noPlayersYet')}
                                    </p>
                                )}
                            </div>

                            {/* Team 2 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px' }}>
                                {sortedTeam2.map((player, index) => (
                                    <div key={player.id} style={settleStyle(index, 1)}>
                                        {renderTeamPlayerCard(player, index, 'team2', captain2?.id)}
                                    </div>
                                ))}
                                {sortedTeam2.length === 0 && (
                                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', margin: '8px 0 6px' }}>
                                        {t('noPlayersYet')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Injured section — full width below */}
                    {(game.injured?.length > 0) && (
                        <div style={{ gridColumn: '1 / -1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                                <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, #f59e0b, transparent)' }} />
                                <ShieldBan size={12} color="#f59e0b" strokeWidth={2.5} />
                                <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: '600', letterSpacing: '0.5px' }}>{t('injured')}</span>
                                <ShieldBan size={12} color="#f59e0b" strokeWidth={2.5} />
                                <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to left, #f59e0b, transparent)' }} />
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {game.injured.map((player, index) => (
                                    <div key={player.id} style={{ flex: '1 1 calc(50% - 4px)' }}>
                                        {renderTeamPlayerCard(player, index, player.fromTeam || 'team1', undefined, true)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {!hasTeams && (
                    <button
                        onClick={handleSquadUp}
                        disabled={!canSquadUp}
                        onPointerDown={() => setPressed(true)}
                        onPointerUp={() => setPressed(false)}
                        onPointerLeave={() => setPressed(false)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            padding: '14px 24px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: canSquadUp ? '#fff' : '#94a3b8',
                            background: !canSquadUp
                                ? '#e2e8f0'
                                : pressed
                                ? 'linear-gradient(135deg, #4a6694, #3d5580)'
                                : 'linear-gradient(135deg, #5b7bb3, #4a6694)',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: canSquadUp ? 'pointer' : 'not-allowed',
                            flexShrink: 0,
                            boxShadow: !canSquadUp
                                ? 'none'
                                : pressed
                                ? '0 1px 3px rgba(91,123,179,0.3)'
                                : '0 4px 12px rgba(91,123,179,0.35)',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            transform: pressed && canSquadUp ? 'scale(0.97)' : 'scale(1)',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            opacity: canSquadUp ? 1 : 0.9,
                        }}
                    >
                        <Shuffle size={18} strokeWidth={2.5} />
                        {t('squadUp')}
                    </button>
                )}
            </div>
        </>
    );
};

export default TeamsPage;
