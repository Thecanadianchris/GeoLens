import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import "./Upload.scss";

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const categories = ["Coastal", "Landscape", "Urban", "Wildlife", "Night", "People"];
const OTHER_VALUE = "__other__";

// Recenters the map whenever position changes from outside (e.g. an address search),
// since react-leaflet only uses the `center` prop on the very first render
function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return null;
}

function Upload() {
  const [step, setStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [position, setPosition] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [category, setCategory] = useState("");
  const [locating, setLocating] = useState(false);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split("T")[0]);

  const [addressQuery, setAddressQuery] = useState("");
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

  const [lensOptions, setLensOptions] = useState([]);
  const [settingsOptions, setSettingsOptions] = useState([]);
  const [cameraLens, setCameraLens] = useState("");
  const [cameraSettings, setCameraSettings] = useState("");
  const [showLensOther, setShowLensOther] = useState(false);
  const [showSettingsOther, setShowSettingsOther] = useState(false);
  const [customLensInput, setCustomLensInput] = useState("");
  const [customSettingsInput, setCustomSettingsInput] = useState("");

  const [caption, setCaption] = useState("");
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      setLocationName(data.display_name || "Unknown location");
    } catch (error) {
      console.log(error);
      setLocationName("Unknown location");
    }
  };

  useEffect(() => {
    if (step === 2 && !position) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (result) => {
          const coords = { lat: result.coords.latitude, lng: result.coords.longitude };
          setPosition(coords);
          reverseGeocode(coords.lat, coords.lng);
          setLocating(false);
        },
        (error) => {
          console.log(error);
          const fallback = { lat: 50.6212, lng: -2.2761 };
          setPosition(fallback);
          reverseGeocode(fallback.lat, fallback.lng);
          setLocating(false);
        }
      );
    }
  }, [step, position]);

  useEffect(() => {
    if (step === 3 && position && photoDate) {
      const fetchWeather = async () => {
        setWeatherLoading(true);
        try {
          const response = await api.get(
            `/weather?lat=${position.lat}&lon=${position.lng}&date=${photoDate}`
          );
          setWeather(response.data);
        } catch (error) {
          console.log(error);
          setWeather(null);
        } finally {
          setWeatherLoading(false);
        }
      };

      fetchWeather();
    }
  }, [step, position, photoDate]);

  useEffect(() => {
    if (step === 3) {
      const fetchOptions = async () => {
        try {
          const [lensResponse, settingsResponse] = await Promise.all([
            api.get("/camera-options/lens"),
            api.get("/camera-options/settings"),
          ]);
          setLensOptions(lensResponse.data);
          setSettingsOptions(settingsResponse.data);
        } catch (error) {
          console.log(error);
        }
      };

      fetchOptions();
    }
  }, [step]);

  const handleMarkerDrag = (e) => {
    const marker = e.target;
    const newPosition = marker.getLatLng();
    setPosition({ lat: newPosition.lat, lng: newPosition.lng });
    reverseGeocode(newPosition.lat, newPosition.lng);
  };

  const handleAddressSearch = async () => {
    if (!addressQuery.trim()) return;

    setSearchingAddress(true);
    setAddressError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}`
      );
      const results = await response.json();

      if (!results.length) {
        setAddressError("No matching location found.");
        return;
      }

      const match = results[0];
      const coords = { lat: parseFloat(match.lat), lng: parseFloat(match.lon) };
      setPosition(coords);
      setLocationName(match.display_name);
    } catch (error) {
      console.log(error);
      setAddressError("Could not search that address.");
    } finally {
      setSearchingAddress(false);
    }
  };

  const handleAddressKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddressSearch();
    }
  };

  const handleLensChange = (e) => {
    const value = e.target.value;
    if (value === OTHER_VALUE) {
      setShowLensOther(true);
      setCameraLens("");
    } else {
      setShowLensOther(false);
      setCameraLens(value);
    }
  };

  const handleSettingsChange = (e) => {
    const value = e.target.value;
    if (value === OTHER_VALUE) {
      setShowSettingsOther(true);
      setCameraSettings("");
    } else {
      setShowSettingsOther(false);
      setCameraSettings(value);
    }
  };

  const handleAddLens = async () => {
    if (!customLensInput.trim()) return;

    try {
      await api.post("/camera-options", { type: "lens", value: customLensInput });
      setLensOptions((prev) => [...new Set([...prev, customLensInput])]);
      setCameraLens(customLensInput);
      setShowLensOther(false);
      setCustomLensInput("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddSettings = async () => {
    if (!customSettingsInput.trim()) return;

    try {
      await api.post("/camera-options", { type: "settings", value: customSettingsInput });
      setSettingsOptions((prev) => [...new Set([...prev, customSettingsInput])]);
      setCameraSettings(customSettingsInput);
      setShowSettingsOther(false);
      setCustomSettingsInput("");
    } catch (error) {
      console.log(error);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);

    const cameraDetails = [cameraLens, cameraSettings].filter(Boolean).join(" · ");

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", locationName || "Untitled");
        formData.append("description", caption);
        formData.append("location", locationName);
        formData.append("category", category);
        formData.append("cameraDetails", cameraDetails);
        formData.append("weatherCondition", weather?.condition || "");
        formData.append("weatherRating", weather ? 90 : "");
        formData.append("latitude", position.lat);
        formData.append("longitude", position.lng);
        formData.append("dateTaken", photoDate);

        await api.post("/photos", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/profile");
    } catch (error) {
      console.log(error);
    }

    setPublishing(false);
  };

  return (
    <div className="page upload">
      <header className="upload__header">
        <button type="button" className="upload__back" onClick={() => navigate(-1)}>
          &larr;
        </button>
        <h1>Upload &middot; {step} of 3</h1>
      </header>

      {step === 1 && (
        <>
          <div className="upload__section-title">
            <span>Recent</span>
          </div>

          <label className="upload__picker">
            Choose photos
            <input type="file" accept="image/*" multiple onChange={handleFileChange} hidden />
          </label>

          {selectedFiles.length > 0 && (
            <div className="upload__grid">
              {selectedFiles.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`Selected ${index + 1}`}
                  className="upload__grid-item"
                />
              ))}
            </div>
          )}

          <button
            type="button"
            className="btn btn--primary upload__continue"
            disabled={selectedFiles.length === 0}
            onClick={() => setStep(2)}
          >
            Continue &middot; ({selectedFiles.length}) Selected
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <p className="upload__label">Search address or postcode</p>
          <div className="upload__other-row">
            <input
              type="text"
              className="upload__input"
              placeholder="e.g. Durdle Door, or BH20 5PU"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              onKeyDown={handleAddressKeyDown}
            />
            <button
              type="button"
              className="upload__add-btn"
              onClick={handleAddressSearch}
              disabled={searchingAddress}
            >
              {searchingAddress ? "..." : "Search"}
            </button>
          </div>
          {addressError && <p className="upload__label">{addressError}</p>}

          <p className="upload__label">Detected location (GPS)</p>
          <p className="upload__location-name">
            {locating ? "Locating..." : locationName || "Location unavailable"}
          </p>

          {position && (
            <div className="upload__map">
              <MapContainer center={position} zoom={14} style={{ height: "220px", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={position} draggable eventHandlers={{ dragend: handleMarkerDrag }} />
                <RecenterMap position={position} />
              </MapContainer>
              <p className="upload__map-hint">Drag the pin to adjust</p>
            </div>
          )}

          <p className="upload__label">Category</p>
          <div className="upload__category-list">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={category === cat ? "upload__category active" : "upload__category"}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn--primary upload__continue"
            disabled={!position || !category}
            onClick={() => setStep(3)}
          >
            Continue
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <p className="upload__label">Date photo was taken</p>
          <input
            type="date"
            className="upload__input"
            value={photoDate}
            onChange={(e) => setPhotoDate(e.target.value)}
          />

          <p className="upload__section-title">Weather (auto-filled)</p>
          {weatherLoading && <p className="upload__label">Loading weather...</p>}
          {!weatherLoading && weather && (
            <div className="upload__weather-grid">
              <div className="upload__weather-item">{weather.temperature}° {weather.condition}</div>
              <div className="upload__weather-item">Wind {weather.windSpeed} mph</div>
              <div className="upload__weather-item">Sunset {weather.sunset}</div>
            </div>
          )}
          {!weatherLoading && !weather && (
            <p className="upload__label">No weather data available for this date.</p>
          )}

          <p className="upload__section-title">Camera details</p>

          <select className="upload__select" value={showLensOther ? OTHER_VALUE : cameraLens} onChange={handleLensChange}>
            <option value="" disabled>
              Select camera / lens
            </option>
            {lensOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value={OTHER_VALUE}>Other (add new)</option>
          </select>

          {showLensOther && (
            <div className="upload__other-row">
              <input
                type="text"
                className="upload__input"
                placeholder="Type new camera / lens"
                value={customLensInput}
                onChange={(e) => setCustomLensInput(e.target.value)}
              />
              <button type="button" className="upload__add-btn" onClick={handleAddLens}>
                Add
              </button>
            </div>
          )}

          <select
            className="upload__select"
            value={showSettingsOther ? OTHER_VALUE : cameraSettings}
            onChange={handleSettingsChange}
          >
            <option value="" disabled>
              Select settings
            </option>
            {settingsOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value={OTHER_VALUE}>Other (add new)</option>
          </select>

          {showSettingsOther && (
            <div className="upload__other-row">
              <input
                type="text"
                className="upload__input"
                placeholder="Type new settings (e.g. f/8 · 1/125 · ISO 100)"
                value={customSettingsInput}
                onChange={(e) => setCustomSettingsInput(e.target.value)}
              />
              <button type="button" className="upload__add-btn" onClick={handleAddSettings}>
                Add
              </button>
            </div>
          )}

          <p className="upload__section-title">Photo caption (optional)</p>
          <textarea
            className="upload__textarea"
            placeholder="Add a short note about timing, setup, or camera settings..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          <button
            type="button"
            className="btn btn--primary upload__continue"
            disabled={publishing}
            onClick={handlePublish}
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </>
      )}

      <BottomNav />
    </div>
  );
}

export default Upload;