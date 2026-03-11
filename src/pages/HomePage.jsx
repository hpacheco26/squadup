import RankList from "../components/lists/RankList";
import GameList from "../components/lists/GameList";
import HeaderBar from "../components/bars/HeaderBar";

function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <HeaderBar />
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
          <GameList />
        </div>
        <div style={{ width: "100%", flex: 1, minHeight: 0 }}>
          <RankList />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
