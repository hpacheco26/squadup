import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import useGroupStore from "../../store/groupStore";
import useAuthStore from "../../store/authStore";
import useGameStore from "../../store/gameStore";
import useLanguageStore from '../../store/languageStore';
import GameCard from "../cards/GameCard";
import fieldImage from "../../assets/field.png";

const GameList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { groups } = useGroupStore();
  const { upcomingGames, subscribeToUpcomingGames } = useGameStore();
  const { t } = useLanguageStore();

  useEffect(() => {
    if (user && groups && groups.length > 0) {
      console.log('[GameList] useEffect subscribing to upcoming, groups:', groups.map(g => g.id));
      const unsub = subscribeToUpcomingGames(groups);
      return unsub;
    }
  }, [user, groups, subscribeToUpcomingGames]);

  console.log('[GameList] render, upcomingGames:', upcomingGames.map(g => ({ id: g.id, groupId: g.groupId })));

  if (!upcomingGames.length) return null;

  return (
    <div>
      <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '2px', textAlign: 'center' }}>
        {t('upcomingGames')}
      </p>
      <p style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center', marginBottom: '4px' }}>
        {t('tapGameToEnter')}
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
              style={{ cursor: 'pointer', height: '100%' }}
            >
              <GameCard game={game} t={t} backgroundImage={fieldImage} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default GameList;
