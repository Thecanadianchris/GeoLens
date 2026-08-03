import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
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

const categories = ["Coastal", "Landscape", "Urban", "Wildlife", "Night"];

function Upload() {
  const [step, setStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [position, setPosition] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [category, setCategory] = useState("");
  const [locating, setLocating] = useState(false);
  const [weather, setWeather] = useState(null);
  const [cameraLens, setCameraLens] = useState("");
  const [cameraSettings, setCameraSettings] = useState("");
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
          setLocating(false);
        }
      );
    }
  }, [step, position]);

  useEffect(() => {
    if (step === 3 && position && !weather) {
      const fetchWeather = async () => {
        try {
          const response = await api.get(`/weather?lat=${position.lat}&lon=${position.lng}`);
          setWeather(response.data);
        } catch (error) {
          console.log(error);
        }
      };

      fetchWeather();
    }
  }, [step, position, weather]);

  const handleMarkerDrag = (e) => {
    const marker = e.target;
    const newPosition = marker.getLatLng();
    setPosition({ lat: newPosition.lat, lng: newPosition.lng });
    reverseGeocode(newPosition.lat, newPosition.lng);
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
          <p className="upload__section-title">Weather (auto-filled)</p>
          {weather ? (
            <div className="upload__weather-grid">
              <div className="upload__weather-item">{weather.temperature}° {weather.condition}</div>
              <div className="upload__weather-item">Wind {weather.windSpeed} mph</div>
              <div className="upload__weather-item">Sunset {weather.sunset}</div>
            </div>
          ) : (
            <p className="upload__label">Loading weather...</p>
          )}

          <p className="upload__section-title">Camera details</p>
          <input
            type="text"
            className="upload__input"
            placeholder="Camera / lens (e.g. Sony A7 IV · 24-70mm)"
            value={cameraLens}
            onChange={(e) => setCameraLens(e.target.value)}
          />
          <input
            type="text"
            className="upload__input"
            placeholder="Settings (e.g. f/8 · 1/125 · ISO 100)"
            value={cameraSettings}
            onChange={(e) => setCameraSettings(e.target.value)}
          />

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