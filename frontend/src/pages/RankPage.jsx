import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import useGroupStore from "../store/groupStore";
import { useNavigate } from "react-router-dom";
import RankCard from "../components/cards/RankCard"; 

const RankPage = () => {
  const { myPlayer, group } = useGroupStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (myPlayer) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.7 },
      });
    }
  }, [myPlayer]);

  if (!myPlayer) return <p className="title has-text-centered">Loading...</p>;

  return (
    <div className="container is-flex is-flex-direction-column is-align-items-center is-justify-content-center" style={{ textAlign: "center" }}>
      <RankCard 
        rank={myPlayer.rank} 
        groupName={group?.name || "Unknown Group"} 
        stats={myPlayer.stats}
        isAnimated={true}
      />

      {/* Continue Button */}
      <button className="button is-primary is-large" onClick={() => group?.id && navigate(`/groups/${group.id}`)}>
        Continue
      </button>
    </div>
  );
};

export default RankPage;
