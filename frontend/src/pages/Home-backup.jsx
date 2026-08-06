import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
// import "./Home.scss";
import {
  Bell,
  Settings,
  Search,
  Star,
  MapPin,
  Plus,
  Camera,
  User,
  ChevronRight,
  Sunrise,
  Moon,
  CloudFog,
} from "lucide-react";
 

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const categories = ["Coastal", "Landscape", "Urban", "Wildlife", "Night", "People"];

const weatherConditions = [
  "Clear",
  "Partly Cloudy",
  "Overcast",
  "Clouds",
  "Rain",
  "Drizzle",
  "Snow",
  "Fog",
  "Thunderstorm",
];

const counties = [
  "Bedfordshire", "Berkshire", "Bristol", "Buckinghamshire", "Cambridgeshire",
  "Cheshire", "City of London", "Cornwall", "County Durham", "Cumbria",
  "Derbyshire", "Devon", "Dorset", "East Sussex", "Essex",
  "Gloucestershire", "Greater London", "Greater Manchester", "Hampshire", "Herefordshire",
  "Hertfordshire", "Kent", "Lancashire", "Leicestershire", "Lincolnshire",
  "Merseyside", "Norfolk", "North Yorkshire", "Northamptonshire", "Northumberland",
  "Nottinghamshire", "Oxfordshire", "Pembrokeshire", "Shropshire", "Somerset",
  "South Yorkshire", "Staffordshire", "Suffolk", "Surrey", "Tyne and Wear",
  "Warwickshire", "West Midlands", "West Sussex", "West Yorkshire", "Wiltshire", "Worcestershire",
];

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

  const [showFilters, setShowFilters] = useState(false);

  // Applied filters (what's actually being used right now)
  const [county, setCounty] = useState("");
  const [category, setCategory] = useState("");
  const [weather, setWeather] = useState("");
  const [sortBy, setSortBy] = useState("distance");

  // Draft filters (what's being picked inside the open panel, not applied yet)
  const [draftCounty, setDraftCounty] = useState("");
  const [draftCategory, setDraftCategory] = useState("");
  const [draftWeather, setDraftWeather] = useState("");
  const [draftSortBy, setDraftSortBy] = useState("distance");

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

  const openFilters = () => {
    // Start the panel with whatever is currently applied
    setDraftCounty(county);
    setDraftCategory(category);
    setDraftWeather(weather);
    setDraftSortBy(sortBy);
    setShowFilters(true);
  };

  const applyFilters = () => {
    setCounty(draftCounty);
    setCategory(draftCategory);
    setWeather(draftWeather);
    setSortBy(draftSortBy);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setDraftCounty("");
    setDraftCategory("");
    setDraftWeather("");
    setDraftSortBy("distance");
  };

  const matchesFilters = (photo, countyValue, categoryValue, weatherValue) => {
    if (countyValue && !photo.location?.toLowerCase().includes(countyValue.toLowerCase())) {
      return false;
    }
    if (categoryValue && photo.category !== categoryValue) {
      return false;
    }
    if (weatherValue && photo.weatherCondition !== weatherValue) {
      return false;
    }
    return true;
  };

  const sortPhotos = (list, sortValue) => {
    const sorted = [...list];
    if (sortValue === "rating") {
      sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    } else if (sortValue === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortValue === "distance" && position) {
      sorted.sort((a, b) => {
        const distA =
          a.latitude && a.longitude
            ? getDistanceKm(position.lat, position.lng, a.latitude, a.longitude)
            : Infinity;
        const distB =
          b.latitude && b.longitude
            ? getDistanceKm(position.lat, position.lng, b.latitude, b.longitude)
            : Infinity;
        return distA - distB;
      });
    }
    return sorted;
  };

  const filteredPhotos = sortPhotos(
    photos.filter((photo) => matchesFilters(photo, county, category, weather)),
    sortBy
  );

  const draftResultCount = photos.filter((photo) =>
    matchesFilters(photo, draftCounty, draftCategory, draftWeather)
  ).length;

  const photosWithCoords =
  sortBy === "rating"
    ? filteredPhotos.filter((photo) => photo.latitude && photo.longitude).slice(0, 10)
    : filteredPhotos.filter((photo) => photo.latitude && photo.longitude);

  const recentlyAdded = [...filteredPhotos]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const bestSpots = [...filteredPhotos]
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

  const locationGroups = filteredPhotos.reduce((groups, photo) => {
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
    ? filteredPhotos.filter(
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
      <img src="/logo.png" alt="GEOLens" className="login__logo" />

      <input
        type="text"
        className="home__search"
        placeholder="Search location, landmark, or county..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="home__filter-row">
        <button
          type="button"
          className={county ? "home__filter-chip active" : "home__filter-chip"}
          onClick={openFilters}
        >
          County{county ? `: ${county}` : ""}
        </button>
        <button
          type="button"
          className={category ? "home__filter-chip active" : "home__filter-chip"}
          onClick={openFilters}
        >
          Category{category ? `: ${category}` : ""}
        </button>
        <button
          type="button"
          className={weather ? "home__filter-chip active" : "home__filter-chip"}
          onClick={openFilters}
        >
          Weather{weather ? `: ${weather}` : ""}
        </button>
        <button
          type="button"
          className={sortBy === "rating" ? "home__filter-chip active" : "home__filter-chip"}
          onClick={() => setSortBy(sortBy === "rating" ? "distance" : "rating")}
        >
          Top 10 pics ♥
        </button>
      </div>

      {showFilters && (
        <div className="home__filter-overlay">
          <div className="home__filter-panel">
            <div className="home__filter-header">
              <h2>Filters</h2>
              <button type="button" className="home__filter-reset" onClick={resetFilters}>
                Reset
              </button>
            </div>

            <label className="home__filter-label">County</label>
            <select
              className="home__filter-select"
              value={draftCounty}
              onChange={(e) => setDraftCounty(e.target.value)}
            >
              <option value="">All Counties</option>
              {counties.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label className="home__filter-label">Category</label>
            <select
              className="home__filter-select"
              value={draftCategory}
              onChange={(e) => setDraftCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label className="home__filter-label">Weather</label>
            <select
              className="home__filter-select"
              value={draftWeather}
              onChange={(e) => setDraftWeather(e.target.value)}
            >
              <option value="">Any</option>
              {weatherConditions.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>

            <label className="home__filter-label">Sort by</label>
            <div className="home__filter-radio-group">
              {[
                { key: "distance", label: "Distance" },
                { key: "rating", label: "Most Liked" },
                { key: "newest", label: "Newest" },
              ].map((option) => (


                <label key={option.key} className="home__filter-radio">
                  <input
                    type="radio"
                    name="sortBy"
                    checked={draftSortBy === option.key}
                    onChange={() => setDraftSortBy(option.key)}
                  />
                  {option.label}
                </label>
              ))}
            </div>

            <button type="button" className="btn btn--primary home__filter-apply" onClick={applyFilters}>
              Show {draftResultCount} Results
            </button>
          </div>
        </div>
      )}

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