import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <div className="page">
      <h1>Home</h1>
      <p>The map goes here.</p>

      <button type="button" className="btn btn--secondary" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}

export default Home;