import RankList from "../components/RankList"; 

function HomePage() {
  return (
    <div 
      className="container is-justify-content-center "
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* Rank List - Centered Vertically */}
      <RankList />
    </div>
  );
}

export default HomePage;
