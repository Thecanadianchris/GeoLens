import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import "./Profile.scss";
import { FiUser } from "react-icons/fi";

const savedLocations = [
  { id: 1, name: "Cheddar Gorge", distance: "20 KM" },
  { id: 2, name: "Dartmoor", distance: "55 KM" },
  { id: 3, name: "Lulworth Cove", distance: "14 KM" },
];

const tabs = [
  { key: "portfolio", label: "Portfolio" },
  { key: "map", label: "Map" },
  { key: "saved", label: "Saved" },
  { key: "settings", label: "Settings" },
];

function Profile() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await api.get(`/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleTabClick = (tabKey) => {
    if (tabKey === "settings") {
      navigate("/settings");
      return;
    }
    setActiveTab(tabKey);
  };

  if (loading) {
    return <div className="page profile">Loading...</div>;
  }

  return (
    <div className="page profile">
      <header className="profile__header">
        <h1>{user?.username}</h1>
        <button type="button" className="profile__edit" onClick={() => navigate("/profile/edit")}>
          Edit
        </button>
      </header>

      <div className="profile__info">
        <div className="profile__avatar">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.username} />
          ) : (
            <FiUser />
          )}
        </div>
        <div>
          <p className="profile__username">@{user?.username}</p>
          <p className="profile__meta">
            {user?.location || "No location set"} &middot; {user?.photos?.length || 0} photos
          </p>
        </div>
      </div>

      <nav className="profile__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "profile__tab active" : "profile__tab"}
            onClick={() => handleTabClick(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "portfolio" && (
        <div className="profile__grid">
          {(user?.photos?.length ? user.photos : new Array(12).fill(null)).map((photo, index) => (
            <div
              key={photo?.id ?? index}
              className="profile__grid-item"
              onClick={() => photo?.id && navigate(`/photos/${photo.id}`)}
              style={{ cursor: photo?.id ? "pointer" : "default" }}
            >
              {photo?.imageUrl && (
                <img src={photo.imageUrl} alt={photo.title || "Photo"} />
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "map" && <div className="profile__map-placeholder" />}

      {activeTab === "saved" && (
        <ul className="profile__saved-list">
          {savedLocations.map((location) => (
            <li key={location.id} className="profile__saved-item">
              <span>{location.name}</span>
              <span>{location.distance}</span>
            </li>
          ))}
        </ul>
      )}

      <BottomNav />
    </div>
  );
}

export default Profile;