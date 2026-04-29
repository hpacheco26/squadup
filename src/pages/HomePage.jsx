import RankList from "../components/lists/RankList";
import GameList from "../components/lists/GameList";
import AppHeaderBar from "../components/bars/AppHeaderBar";
import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppHeaderBar variant="logo" rightIcon={FiUser} onRightClick={() => navigate('/settings')} />
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          padding: "8px 0",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div style={{ width: "100%", flex: 'none' }}>
          <RankList />
        </div>
        <div style={{ width: "100%", flex: 1, minHeight: 0, overflow: 'auto' }}>
          <GameList />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
