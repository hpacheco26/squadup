import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";  
import "swiper/css/pagination";  
import { Pagination } from "swiper/modules";
import RankCard from "../cards/RankCard"; 
import { useNavigate } from 'react-router-dom';
import useGroupStore from "../../store/groupStore";
import useAuthStore from '../../store/authStore';

const RankList = () => {
  const navigate = useNavigate();
  const { user, playerData } = useAuthStore();
  const { ranks, fetchGroupsByPlayer } = useGroupStore();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (playerData?.id) {
      fetchGroupsByPlayer(playerData.id);
    }
  }, [user, playerData?.id, navigate]);

  return (
    <div className="rank-carousel-container">
      {Array.isArray(ranks) && ranks.length > 0 ? (
        <Swiper
          modules={[Pagination]} 
          spaceBetween={15} 
          slidesPerView={1.2} 
          centeredSlides={true}  // This will center the active slide
          breakpoints={{
            640: { slidesPerView: 2, centeredSlides: true },  
            1024: { slidesPerView: 3, centeredSlides: true } 
          }}
          pagination={{ clickable: true }} 
          style={{ paddingBottom: "30px" }} 
        >
          {ranks.map((rank) => (
            <SwiperSlide key={rank.groupId || rank.groupName}>
              <RankCard 
                rank={rank.groupRank} 
                groupName={rank.groupName || "Unknown Group"} 
                stats={rank.stats}
                isAnimated={false}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p>No groups available.</p>
      )}
    </div>
  );
};

export default RankList;
