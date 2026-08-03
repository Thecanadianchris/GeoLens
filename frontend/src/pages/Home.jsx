import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import "./Home.scss";

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Rough distance between two lat/lon points, in KM (haversine formula)
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

function Home() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({ lat: result.coords.latitude, lng: result.coords.longitude });
      },
      () => {
        setPosition({ lat: 50.6212, lng: -2.2761 }); // Durdle Door, Dorset fallback
      }
    );
  }, []);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await api.get("/photos");
        const photosData = response.data;

        const withLikes = await Promise.all(
          photosData.map(async (photo) => {
            try {
              const likesResponse = await api.get(`/likes/photo/${photo.id}`);
              return { ...photo, likeCount: likesResponse.data.length };
            } catch (error) {
              console.log(error);
              return { ...photo, likeCount: 0 };
            }
          })
        );

        setPhotos(withLikes);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const photosWithCoords = photos.filter((photo) => photo.latitude && photo.longitude);

  const recentlyAdded = [...photos]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const bestSpots = [...photos]
    .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
    .slice(0, 3);

  const nearbyPhotos = position
    ? [...photosWithCoords]
        .map((photo) => ({
          ...photo,
          distance: getDistanceKm(position.lat, position.lng, photo.latitude, photo.longitude),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5)
    : [];

  const locationGroups = photos.reduce((groups, photo) => {
    if (!photo.location) return groups;
    if (!groups[photo.location]) {
      groups[photo.location] = { location: photo.location, photos: [] };
    }
    groups[photo.location].photos.push(photo);
    return groups;
  }, {});

  const popularLocations = Object.values(locationGroups)
    .map((group) => {
      const totalLikes = group.photos.reduce((sum, p) => sum + (p.likeCount || 0), 0);
      const first = group.photos[0];
      const distance =
        position && first.latitude && first.longitude
          ? getDistanceKm(position.lat, position.lng, first.latitude, first.longitude)
          : null;
      return { location: group.location, totalLikes, distance };
    })
    .sort((a, b) => b.totalLikes - a.totalLikes)
    .slice(0, 4);

  const searchResults = searchQuery.trim()
    ? photos.filter(
        (photo) =>
          photo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          photo.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  if (loading || !position) {
    return <div className="page home">Loading...</div>;
  }

  return (
    <div className="page home">
      <input
        type="text"
        className="home__search"
        placeholder="Search location, landmark, or county..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="home__filter-row">
        <button type="button" className="home__filter-chip">County</button>
        <button type="button" className="home__filter-chip">Category</button>
        <button type="button" className="home__filter-chip">Weather</button>
        <button type="button" className="home__filter-chip">Top pics ★</button>
      </div>

      {searchResults ? (
        <div className="home__search-results">
          <p className="home__section-title">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
          </p>
          {searchResults.map((photo) => (
            <div
              key={photo.id}
              className="home__search-result"
              onClick={() => navigate(`/photos/${photo.id}`)}
            >
              <img src={photo.imageUrl} alt={photo.title} className="home__search-result-image" />
              <div>
                <p className="home__search-result-title">{photo.title}</p>
                <p className="home__search-result-location">{photo.location}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="home__map">
            <MapContainer center={position} zoom={9} style={{ height: "440px", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {photosWithCoords.map((photo) => (
                <Marker key={photo.id} position={{ lat: photo.latitude, lng: photo.longitude }}>
                  <Popup>
                    <div className="home__map-popup" onClick={() => navigate(`/photos/${photo.id}`)}>
                      <img src={photo.imageUrl} alt={photo.title} className="home__map-popup-image" />
                      <p className="home__map-popup-title">{photo.title}</p>
                      <p className="home__map-popup-meta">
                        {photo.category} &middot; ♥ {photo.likeCount || 0}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {bestSpots.length > 0 && (
            <div className="home__section">
              <p className="home__section-title">Today's best photography spots</p>
              {bestSpots.map((photo) => (
                <div
                  key={photo.id}
                  className="home__best-row"
                  onClick={() => navigate(`/photos/${photo.id}`)}
                >
                  <p className="home__best-location">{photo.location}</p>
                  <p className="home__best-meta">♥ {photo.likeCount || 0}</p>
                </div>
              ))}
            </div>
          )}

          {nearbyPhotos.length > 0 && (
            <div className="home__section">
              <div className="home__section-header">
                <p className="home__section-title">Nearby Photos</p>
              </div>
              <div className="home__card-row">
                {nearbyPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="home__card"
                    onClick={() => navigate(`/photos/${photo.id}`)}
                  >
                    <img src={photo.imageUrl} alt={photo.title} className="home__card-image" />
                    <p className="home__card-location">{photo.location}</p>
                    <p className="home__card-score">♥ {photo.likeCount || 0}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {popularLocations.length > 0 && (
            <div className="home__section">
              <p className="home__section-title">Popular locations</p>
              {popularLocations.map((item) => (
                <div key={item.location} className="home__popular-row">
                  <p className="home__popular-location">{item.location}</p>
                  <p className="home__popular-meta">
                    ♥ {item.totalLikes}
                    {item.distance !== null ? ` · ${Math.round(item.distance)} KM` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}

          {recentlyAdded.length > 0 && (
            <div className="home__section">
              <div className="home__section-header">
                <p className="home__section-title">Recently Added Photos</p>
              </div>
              <div className="home__card-row">
                {recentlyAdded.map((photo) => (
                  <div
                    key={photo.id}
                    className="home__card"
                    onClick={() => navigate(`/photos/${photo.id}`)}
                  >
                    <img src={photo.imageUrl} alt={photo.title} className="home__card-image" />
                    <p className="home__card-location">{photo.location}</p>
                    <p className="home__card-score">{photo.category}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <BottomNav />
    </div>
  );
}

export default Home;