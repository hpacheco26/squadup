import React from "react";
import { motion } from "framer-motion";

const shapes = {
  0: { name: "Circle", styles: { borderRadius: "50%" } },
  1: { name: "Triangle", styles: { 
      width: 0, height: 0, 
      borderLeft: "50px solid transparent",
      borderRight: "50px solid transparent",
      borderBottom: "100px solid #f0c832",
      background: "none"
  }},
  2: { name: "Square", styles: { borderRadius: "5px" } },
  3: { name: "Pentagon", styles: { clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" } },
  4: { name: "Hexagon", styles: { clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" } },
};

const rankColors = {
  0: '#b0b8c4', 
  1: '#cd7f32', 
  2: '#9b59b6', 
  3: '#f0c832', 
  4: '#a8b4d4', 
};

const rankGradients = {
  0: 'linear-gradient(135deg, #c0c8d4, #b0b8c4, #a0a8b4)',
  1: 'linear-gradient(135deg, #e0944a, #cd7f32, #b06a28)',
  2: 'linear-gradient(135deg, #b06ec8, #9b59b6, #8344a0)',
  3: 'linear-gradient(135deg, #f5dc78, #f0c832, #d4a017)',
  4: 'linear-gradient(135deg, #c8d0e8, #a8b4d4, #8898c0, #a8b4d4, #c8d0e8)',
};

const rankGlow = {
  0: 'none',
  1: '0 0 8px rgba(205, 127, 50, 0.4)',
  2: '0 0 12px rgba(155, 89, 182, 0.5), 0 0 24px rgba(155, 89, 182, 0.2)',
  3: '0 0 16px rgba(240, 200, 50, 0.5), 0 0 32px rgba(240, 200, 50, 0.25)',
  4: '0 0 20px rgba(136, 152, 192, 0.6), 0 0 40px rgba(168, 180, 212, 0.3), 0 0 60px rgba(136, 152, 192, 0.2)',
};


const RankCard = ({ rank, groupName, stats, isAnimated }) => {
  const shape = shapes[rank] || null;
  const color = rankColors[rank] || '#d4c5a0';
  const isTriangle = rank === 1;

  const shapeBaseStyle = {
    width: "150px",
    height: "150px",
    background: isTriangle ? 'none' : (rankGradients[rank] || color),
    boxShadow: isTriangle ? 'none' : (rankGlow[rank] || 'none'),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    position: 'relative',
    ...shape.styles,
  };

  const shimmerOverlay = rank >= 3 && !isTriangle ? (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 55%, transparent 60%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 3s ease-in-out infinite',
      pointerEvents: 'none',
      ...shape.styles,
    }} />
  ) : null;

  if (!shape) return <p className="title has-text-centered">Loading...</p>;

  return (
    <div className="box has-text-centered">
      {/* Shape (Animated or Static) */}
      {isAnimated ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <motion.div
            style={shapeBaseStyle}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 360 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          {shimmerOverlay}
        </div>
      ) : (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={shapeBaseStyle} />
          {shimmerOverlay}
        </div>
      )}

      {/* Group Name */}
      <h2 className="title is-4">{groupName}</h2>

      {/* Player Stats */}
      <div className="box rank-stats">
        {/* <h3 className="title is-5">Player Stats</h3> */}
        <p><strong>Wins:</strong> {stats?.wins || 0}</p>
        <p><strong>Losses:</strong> {stats?.losses || 0}</p>
        <p><strong>Draws:</strong> {stats?.draws || 0}</p>
      </div>

      {/* Styles */}
      <style>
        {`
          .rank-stats {
            box-shadow:none;
            border-top: solid #e2e8f0;
            border-radius: 0px;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}  
      </style>
    </div>


  );
};

export default RankCard;
