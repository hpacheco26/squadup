import RankList from "../components/lists/RankList"; 
import HeaderBar from "../components/bars/HeaderBar";

function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <HeaderBar />
      <div 
        className="container is-fluid"
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          flex: 1,
          overflow: "hidden"
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <RankList />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
