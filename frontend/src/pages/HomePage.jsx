import RankList from "../components/RankList"; 

function HomePage() {
  return (
    <div 
      className="container is-justify-content-center "
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Rank List - Centered Vertically */}
      <RankList />
    </div>
  );
}

export default HomePage;
