import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import "bulma/css/bulma.min.css";
import useGroupStore from "../store/groupStore";
import { useNavigate } from "react-router-dom";
import RankCard from "../components/RankCard"; 

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
      <button className="button is-primary is-large" onClick={() => navigate(`/groups/${group.id}`)}>
        Continue
      </button>
    </div>
  );
};

export default RankPage;
