import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import "bulma/css/bulma.min.css";
import useGroupStore from "../store/groupStore";
import { useNavigate } from "react-router-dom"; // Importing useHistory for navigation

// Rank to Shape Mapping
const shapes = {
  0: { name: "Circle", styles: { borderRadius: "50%" } },
  1: { name: "Triangle", styles: { 
      width: 0, height: 0, 
      borderLeft: "50px solid transparent",
      borderRight: "50px solid transparent",
      borderBottom: "100px solid #00d1b2",
      background: "none"
  }},
  2: { name: "Square", styles: { borderRadius: "5px" } },
  3: { name: "Pentagon", styles: { clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" } },
  4: { name: "Hexagon", styles: { clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" } },
};

const RankPage = () => {
  const { myPlayer, group } = useGroupStore();
  const [shape, setShape] = useState(null);
  const navigate = useNavigate(); // Initialize history for navigation

  useEffect(() => {
    if (!myPlayer || myPlayer.rank === undefined) return;

    setShape(shapes[myPlayer.rank] || null);

    // 🎉 Always trigger confetti on page load 🎉
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.7 },
    });
  }, [myPlayer?.rank]);

  if (!shape) return <p className="title has-text-centered">Loading...</p>;

  // Navigate to the group page on button click
  const handleContinue = () => {
    navigate(`/groups/${group.id}`)
  };

  return (
    <div className="container is-flex is-flex-direction-column is-align-items-center is-justify-content-center" style={{ height: "100vh", textAlign: "center" }}>
      
      <motion.div
        style={{
          width: "200px",
          height: "200px",
          backgroundColor: "#00d1b2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
          ...shape.styles, // Apply shape-specific styles dynamically
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: 360 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      <h1 className="title">Your Rank: {myPlayer.rank}</h1>
      <p className="subtitle">You are a {shape.name}!</p>

      {/* Player Stats Section */}
      <div className="box has-text-centered">
        <h2 className="title is-4">Player Stats</h2>
        <p><strong>Wins:</strong> {myPlayer.stats?.wins || 0}</p>
        <p><strong>Losses:</strong> {myPlayer.stats?.losses || 0}</p>
        <p><strong>Draws:</strong> {myPlayer.stats?.draws || 0}</p> {/* Draws added here */}
      </div>

      {/* Continue Button */}
      <button className="button is-primary is-large" onClick={handleContinue}>
        Continue
      </button>

    </div>
  );
};

export default RankPage;
