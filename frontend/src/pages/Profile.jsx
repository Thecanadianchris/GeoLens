import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header"; 
  
// import "./Profile.scss";
import { FiUser } from "react-icons/fi";

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const fallbackCenter = { lat: 50.6212, lng: -2.2761 };

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

  const photosWithCoords = (user?.photos || []).filter(
    (photo) => photo.latitude && photo.longitude
  );

  const mapCenter = photosWithCoords.length
    ? { lat: photosWithCoords[0].latitude, lng: photosWithCoords[0].longitude }
    : fallbackCenter;

  return (
    <div className="page profile">
      <Header />
      <div className="px-4 pt-4 pb-4">
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
            {user?.bio && <p className="profile__bio">{user.bio}</p>}
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

        {activeTab === "map" && (
          <div className="profile__map">
            <MapContainer center={mapCenter} zoom={9} style={{ height: "360px", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {photosWithCoords.map((photo) => (
                <Marker key={photo.id} position={{ lat: photo.latitude, lng: photo.longitude }}>
                  <Popup>
                    <div className="profile__map-popup" onClick={() => navigate(`/photos/${photo.id}`)}>
                      <img src={photo.imageUrl} alt={photo.title} className="profile__map-popup-image" />
                      <p className="profile__map-popup-title">{photo.title}</p>
                      <p className="profile__map-popup-meta">{photo.category}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {photosWithCoords.length === 0 && (
              <p className="profile__map-empty">No photos with a location yet.</p>
            )}
          </div>
        )}

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
        </div>

      <BottomNav />
    </div>
  );
}

export default Profile;