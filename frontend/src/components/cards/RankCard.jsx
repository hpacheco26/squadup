import React from "react";
import { motion } from "framer-motion";

const shapes = {
  0: { name: "Circle", styles: { borderRadius: "50%" } },
  1: { name: "Triangle", styles: { 
      width: 0, height: 0, 
      borderLeft: "50px solid transparent",
      borderRight: "50px solid transparent",
      borderBottom: "100px solid #a67c00",
      background: "none"
  }},
  2: { name: "Square", styles: { borderRadius: "5px" } },
  3: { name: "Pentagon", styles: { clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" } },
  4: { name: "Hexagon", styles: { clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" } },
};

const rankColors = {
  0: '#d4c5a0', 
  1: '#c9a84c', 
  2: '#b8922e', 
  3: '#a67c00', 
  4: '#8b6914', 
};

const rankGradients = {
  0: 'linear-gradient(135deg, #d4c5a0, #c2b48e)',
  1: 'linear-gradient(135deg, #e0c35a, #c9a84c, #b8922e)',
  2: 'linear-gradient(135deg, #d4ab3a, #b8922e, #a67c00)',
  3: 'linear-gradient(135deg, #d4a017, #a67c00, #8b6914)',
  4: 'linear-gradient(135deg, #c9a84c, #8b6914, #6b5010, #8b6914, #c9a84c)',
};

const rankGlow = {
  0: 'none',
  1: '0 0 8px rgba(201, 168, 76, 0.3)',
  2: '0 0 12px rgba(184, 146, 46, 0.4)',
  3: '0 0 16px rgba(166, 124, 0, 0.5), 0 0 30px rgba(166, 124, 0, 0.2)',
  4: '0 0 20px rgba(139, 105, 20, 0.6), 0 0 40px rgba(201, 168, 76, 0.3), 0 0 60px rgba(139, 105, 20, 0.15)',
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
