import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";  
import "swiper/css/pagination";  
import { Pagination } from "swiper/modules";
import RankCard from "../cards/RankCard"; 
import { useNavigate } from 'react-router-dom';
import useGroupStore from "../../store/groupStore";
import useAuthStore from '../../store/authStore';
import CreateGroupModal from '../modals/GroupModal';

const RankList = () => {
  const navigate = useNavigate();
  const { user, playerData } = useAuthStore();
  const { ranks, fetchGroupsByPlayer } = useGroupStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '4px', textAlign: 'center' }}>
        My Groups
      </p>
      {Array.isArray(ranks) && ranks.length > 0 ? (
        <Swiper
          modules={[Pagination]} 
          spaceBetween={15} 
          slidesPerView={1.2} 
          centeredSlides={true}
          breakpoints={{
            640: { slidesPerView: 2, centeredSlides: true },  
            1024: { slidesPerView: 3, centeredSlides: true } 
          }}
          pagination={{ clickable: true }} 
          style={{ paddingBottom: "30px", cursor: 'grab' }} 
        >
          {ranks.map((rank) => (
            <SwiperSlide key={rank.groupId || rank.groupName} style={{ height: 'auto' }}>
              <RankCard 
                rank={rank.groupRank} 
                groupName={rank.groupName || "Unknown Group"} 
                stats={rank.stats}
                isAnimated={false}
                onClick={() => navigate(`/groups/${rank.groupId}`)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '8px' }}>No groups yet</p>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5b7bb3', fontSize: '1rem', fontWeight: '600', textDecoration: 'underline', padding: 0 }}
          >
            Create First Group
          </button>
          <CreateGroupModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
        </div>
      )}
    </div>
  );
};

export default RankList;
