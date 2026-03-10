import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import useGroupStore from "../../store/groupStore";
import useAuthStore from "../../store/authStore";
import useGameStore from "../../store/gameStore";

const GameList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { groups } = useGroupStore();
  const { upcomingGames, fetchUpcomingGames } = useGameStore();

  useEffect(() => {
    if (user && groups && groups.length > 0) {
      fetchUpcomingGames(groups);
    }
  }, [user, groups, fetchUpcomingGames]);

  if (!upcomingGames.length) return null;

  return (
    <div>
      <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '8px', textAlign: 'center' }}>
        Upcoming Games
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
        {upcomingGames.map((game) => (
          <SwiperSlide key={game.id} style={{ height: 'auto' }}>
            <div
              onClick={() => navigate(`/pregame/${game.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                height: '100%',
              }}>
                {/* Group name */}
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  {game.groupName}
                </p>

                {/* Location */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                  {game.location || 'TBD'}
                </h3>

                {/* Date & Time */}
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '12px' }}>
                  {game.date} · {game.time || '--:--'}
                </p>

                {/* Player counts */}
                <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#16a34a' }}>{(game.playersIn || []).length}</p>
                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>In</p>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ef4444' }}>{(game.playersOut || []).length}</p>
                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Out</p>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f59e0b' }}>{(game.playersInvited || []).length}</p>
                    <p style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Invited</p>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default GameList;
