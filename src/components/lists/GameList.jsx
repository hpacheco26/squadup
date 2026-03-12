import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, UserX, Clock } from "lucide-react";
import useGroupStore from "../../store/groupStore";
import useAuthStore from "../../store/authStore";
import useGameStore from "../../store/gameStore";
import theme from "../../theme";

const GameList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { groups } = useGroupStore();
  const { upcomingGames, subscribeToUpcomingGames } = useGameStore();

  useEffect(() => {
    if (user && groups && groups.length > 0) {
      const unsub = subscribeToUpcomingGames(groups);
      return unsub;
    }
  }, [user, groups, subscribeToUpcomingGames]);

  if (!upcomingGames.length) return null;

  return (
    <div>
      <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '2px', textAlign: 'center' }}>
        Upcoming Games
      </p>
      <p style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center', marginBottom: '4px' }}>
        Tap a game to enter
      </p>
      <Swiper
        modules={[Pagination]}
        spaceBetween={15}
        slidesPerView={1.2}
        centeredSlides={true}
        breakpoints={{
          640: { slidesPerView: 2, centeredSlides: true },
          1024: { slidesPerView: 3, centeredSlides: true },
        }}
        pagination={{ clickable: true }}
        style={{ paddingBottom: "30px" }}
      >
        {upcomingGames.map((game) => {
          const inCount = (game.playersIn || []).length;
          const outCount = (game.playersOut || []).length;
          const invitedCount = (game.playersInvited || []).length;
          const maxPlayers = game.maxPlayers || 0;
          const fillPercent = maxPlayers > 0 ? Math.min((inCount / maxPlayers) * 100, 100) : 0;
          const isFull = maxPlayers > 0 && inCount >= maxPlayers;

          return (
            <SwiperSlide key={game.id} style={{ height: 'auto' }}>
              <div
                onClick={() => navigate(`/pregame/${game.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{
                  background: '#fff',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  height: '100%',
                  border: `1px solid ${theme.border}`,
                }}>
                  {/* Top accent bar */}
                  <div style={{
                    height: '4px',
                    background: isFull
                      ? `linear-gradient(90deg, ${theme.success}, ${theme.success})`
                      : `linear-gradient(90deg, ${theme.primary} ${fillPercent}%, ${theme.border} ${fillPercent}%)`,
                  }} />

                  <div style={{ padding: 'clamp(10px, 2dvh, 16px)' }}>
                    {/* Group badge + status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px',
                        color: theme.primary, background: theme.primaryLight, padding: '2px 8px', borderRadius: '10px',
                      }}>
                        {game.groupName}
                      </span>
                      {isFull && (
                        <span style={{
                          fontSize: '0.6rem', fontWeight: '600', color: theme.success,
                          background: theme.successLight, padding: '2px 8px', borderRadius: '10px',
                        }}>
                          Full
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <MapPin size={14} color={theme.primary} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.95rem', fontWeight: '700', color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {game.location || 'TBD'}
                      </span>
                    </div>

                    {/* Date & Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                      <Calendar size={12} color={theme.textMuted} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem', color: theme.textSecondary }}>
                        {game.date} · {game.time || '--:--'}
                      </span>
                    </div>

                    {/* Player counts */}
                    <div style={{
                      display: 'flex', gap: '6px', borderTop: `1px solid ${theme.border}`, paddingTop: '10px',
                    }}>
                      <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        background: theme.successLight, borderRadius: '8px', padding: '6px 0',
                      }}>
                        <Users size={13} color={theme.success} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: theme.success }}>{inCount}</span>
                        {maxPlayers > 0 && (
                          <span style={{ fontSize: '0.65rem', color: theme.textMuted }}>/{maxPlayers}</span>
                        )}
                      </div>
                      <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        background: theme.dangerLight, borderRadius: '8px', padding: '6px 0',
                      }}>
                        <UserX size={13} color={theme.danger} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: theme.danger }}>{outCount}</span>
                      </div>
                      <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        background: theme.warningLight, borderRadius: '8px', padding: '6px 0',
                      }}>
                        <Clock size={13} color={theme.warning} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: theme.warning }}>{invitedCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default GameList;
