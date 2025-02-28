import React from "react";
import RankCard from "./RankCard"; 
import {  useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import useGroupStore from "../store/groupStore";
import useAuthStore from '../store/authStore';

const RankList = () => {
const navigate = useNavigate(); // Hook to navigate programmatically
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
    <div className="rank-scroll-container">
      <div className="rank-list">
        {Array.isArray(ranks) && ranks.length > 0 ? (
          ranks.map((rank) => (
            <div className="rank-item" key={rank.groupId || rank.groupName}>
              <RankCard 
                rank={rank.groupRank} 
                groupName={rank.groupName || "Unknown Group"} 
                stats={rank.stats}
                isAnimated={false}
              />
            </div>
          ))
        ) : (
          <p>No groups available.</p>
        )}
      </div>

      {/* Styles */}
      <style>
        {`
          /* Horizontal Scroll Container */
          .rank-scroll-container {
            overflow-x: auto; 
            white-space: nowrap;
            padding: 10px;
            margin-top: 20px;
          }

          /* Rank List - Flexbox for horizontal scrolling */
          .rank-list {
            display: flex;
            gap: 20px; /* Space between RankCards */
            padding-bottom: 10px;
            scroll-snap-type: x mandatory;
          }

          /* Each RankCard Container */
          .rank-item {
            flex: 0 0 auto;
            width: 300px; /* Adjust based on your card size */
            scroll-snap-align: start;
          }

          /* Hide scrollbar for better UX */
          .rank-scroll-container::-webkit-scrollbar {
            display: none; /* Hides scrollbar for Chrome, Safari */
          }
        `}
      </style>
    </div>
  );
};

export default RankList;
