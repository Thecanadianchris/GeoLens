import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import "./PhotoDetail.scss";

const categories = ["Coastal", "Landscape", "Urban", "Wildlife", "Night"];

function PhotoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [cameraDetails, setCameraDetails] = useState("");

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await api.get(`/photos/${id}`);
        setPhoto(response.data);
        setTitle(response.data.title || "");
        setDescription(response.data.description || "");
        setLocation(response.data.location || "");
        setCategory(response.data.category || "");
        setCameraDetails(response.data.cameraDetails || "");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await api.put(`/photos/${id}`, {
        title,
        description,
        location,
        category,
        cameraDetails,
        weatherCondition: photo.weatherCondition,
        weatherRating: photo.weatherRating,
      });
      setPhoto(response.data);
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this photo? This can't be undone.");
    if (!confirmed) return;

    setDeleting(true);

    try {
      await api.delete(`/photos/${id}`);
      navigate("/profile");
    } catch (error) {
      console.log(error);
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="page photo-detail">Loading...</div>;
  }

  if (!photo) {
    return (
      <div className="page photo-detail">
        <p>Photo not found.</p>
        <button type="button" className="btn btn--secondary" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="page photo-detail">
      <header className="photo-detail__header">
        <button type="button" className="photo-detail__back" onClick={() => navigate(-1)}>
          &larr;
        </button>
        <h1>{isEditing ? "Edit photo" : photo.title || "Photo"}</h1>

        {!isEditing && (
          <button type="button" className="photo-detail__edit" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        )}
      </header>

      <img src={photo.imageUrl} alt={photo.title || "Photo"} className="photo-detail__hero" />

      {!isEditing && (
        <>
          <div className="photo-detail__meta">
            <p className="photo-detail__location">{photo.location}</p>
            <p className="photo-detail__category">{photo.category}</p>
          </div>

          {photo.weatherCondition && (
            <div className="photo-detail__weather">
              <span>{photo.weatherCondition}</span>
              {photo.weatherRating && <span>Score {photo.weatherRating}%</span>}
            </div>
          )}

          {photo.cameraDetails && (
            <div className="photo-detail__section">
              <p className="photo-detail__section-title">Camera details</p>
              <p>{photo.cameraDetails}</p>
            </div>
          )}

          {photo.description && (
            <div className="photo-detail__section">
              <p className="photo-detail__section-title">Caption</p>
              <p>{photo.description}</p>
            </div>
          )}

          <button
            type="button"
            className="photo-detail__delete"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete photo"}
          </button>
        </>
      )}

      {isEditing && (
        <div className="photo-detail__form">
          <label className="photo-detail__label">Title</label>
          <input
            type="text"
            className="photo-detail__input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="photo-detail__label">Location</label>
          <input
            type="text"
            className="photo-detail__input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <label className="photo-detail__label">Category</label>
          <select
            className="photo-detail__input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label className="photo-detail__label">Camera details</label>
          <input
            type="text"
            className="photo-detail__input"
            value={cameraDetails}
            onChange={(e) => setCameraDetails(e.target.value)}
          />

          <label className="photo-detail__label">Caption</label>
          <textarea
            className="photo-detail__textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="photo-detail__form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setIsEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="button" className="btn btn--primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default PhotoDetail;