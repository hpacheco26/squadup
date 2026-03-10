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
          overflowY: "auto",
          padding: "16px 0",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div style={{ width: "100%" }}>
          <GameList />
        </div>
        <div style={{ width: "100%" }}>
          <RankList />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
