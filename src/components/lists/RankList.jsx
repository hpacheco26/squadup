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
import GroupService from '../../api/groupService';
import useLanguageStore from '../../store/languageStore';
import GeometricSpinner from '../GeometricSpinner';

const RankList = () => {
  const navigate = useNavigate();
  const { user, playerData, selectedGroupId, setSelectedGroupId } = useAuthStore();
  const { ranks, ranksLoading, subscribeToGroupsByPlayer } = useGroupStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const { t } = useLanguageStore();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (playerData?.id) {
      const unsub = subscribeToGroupsByPlayer(playerData.id);
      return () => unsub();
    }
  }, [user, playerData?.id, navigate]);

  useEffect(() => {
    if (user?.uid) {
      GroupService.canCreateGroup(user.uid).then(setCanCreate);
    }
  }, [user?.uid]);

  return (
    <div className="rank-carousel-container" style={ranksLoading ? { height: '100%', display: 'flex', flexDirection: 'column' } : {}}>
      {!ranksLoading && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          margin: '4px 0 12px',
        }}>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #cbd5e1)' }} />
          <h2 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#1e293b',
          }}>
            {t('myRanks')}
          </h2>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, #cbd5e1)' }} />
        </div>
      )}
      {Array.isArray(ranks) && ranks.length > 0 ? (
        <Swiper
          modules={[Pagination]} 
          spaceBetween={15} 
          slidesPerView={1.2} 
          centeredSlides={true}
          initialSlide={Math.max(0, ranks.findIndex(r => r.groupId === selectedGroupId))}
          onSlideChange={(swiper) => {
            const next = ranks[swiper.activeIndex];
            if (next?.groupId && next.groupId !== selectedGroupId) {
              setSelectedGroupId(next.groupId);
            }
          }}
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
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : ranksLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GeometricSpinner size={40} color="#5b7bb3" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '8px' }}>{t('noGroupsYet')}</p>
          {canCreate && (
            <>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5b7bb3', fontSize: '1rem', fontWeight: '600', textDecoration: 'underline', padding: 0 }}
              >
                {t('createFirstGroup')}
              </button>
              <CreateGroupModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RankList;
