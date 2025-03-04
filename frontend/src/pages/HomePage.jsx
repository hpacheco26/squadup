import RankList from "../components/lists/RankList"; 
import HeaderBar from "../components/bars/HeaderBar";

function HomePage() {
  return (
    <>
      <HeaderBar />
      <div 
        className="container is-justify-content-center"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Rank List - Centered Vertically */}
        <RankList />
      </div>
    </>
  );
}

export default HomePage;
