import React from "react";
import { motion } from "framer-motion";

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

const RankCard = ({ rank, groupName, stats, isAnimated }) => {
  const shape = shapes[rank] || null;

  if (!shape) return <p className="title has-text-centered">Loading...</p>;

  return (
    <div className="box has-text-centered">
      {/* Shape (Animated or Static) */}
      {isAnimated ? (
        <motion.div
          style={{
            width: "150px",
            height: "150px",
            backgroundColor: "#00d1b2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            ...shape.styles,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: 360 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ) : (
        <div
          style={{
            width: "150px",
            height: "150px",
            backgroundColor: "#00d1b2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            ...shape.styles,
          }}
        />
      )}

      {/* Group Name */}
      <h2 className="title is-4">{groupName}</h2>

      {/* Player Stats */}
      <div className="box">
        <h3 className="title is-5">Player Stats</h3>
        <p><strong>Wins:</strong> {stats?.wins || 0}</p>
        <p><strong>Losses:</strong> {stats?.losses || 0}</p>
        <p><strong>Draws:</strong> {stats?.draws || 0}</p>
      </div>
    </div>
  );
};

export default RankCard;
