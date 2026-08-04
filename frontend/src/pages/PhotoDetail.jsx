import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import "./PhotoDetail.scss";
import { FiShare2 } from "react-icons/fi";

const categories = ["Coastal", "Landscape", "Urban", "Wildlife", "Night", "People"];
const OTHER_VALUE = "__other__";

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
  const [editDate, setEditDate] = useState("");

  const [editWeather, setEditWeather] = useState(null);
  const [editWeatherLoading, setEditWeatherLoading] = useState(false);

  const [lensOptions, setLensOptions] = useState([]);
  const [settingsOptions, setSettingsOptions] = useState([]);
  const [cameraLens, setCameraLens] = useState("");
  const [cameraSettings, setCameraSettings] = useState("");
  const [showLensOther, setShowLensOther] = useState(false);
  const [showSettingsOther, setShowSettingsOther] = useState(false);
  const [customLensInput, setCustomLensInput] = useState("");
  const [customSettingsInput, setCustomSettingsInput] = useState("");

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const currentUserId = Number(localStorage.getItem("userId"));
  const isOwner = photo && photo.userId === currentUserId;

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await api.get(`/photos/${id}`);
        setPhoto(response.data);
        setTitle(response.data.title || "");
        setDescription(response.data.description || "");
        setLocation(response.data.location || "");
        setCategory(response.data.category || "");
        setEditDate(
          response.data.dateTaken || new Date(response.data.createdAt).toISOString().split("T")[0]
        );

        const parts = (response.data.cameraDetails || "").split(" · ");
        setCameraLens(parts[0] || "");
        setCameraSettings(parts.slice(1).join(" · ") || "");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [id]);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await api.get(`/likes/photo/${id}`);
        setLikeCount(response.data.length);
        setIsLiked(response.data.some((like) => like.userId === currentUserId));
      } catch (error) {
        console.log(error);
      }
    };

    fetchLikes();
  }, [id, currentUserId]);

  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        const response = await api.get(`/comments/photo/${id}`);
        setComments(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [id]);

  useEffect(() => {
    if (isEditing) {
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
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && photo?.latitude && photo?.longitude && editDate) {
      const fetchWeather = async () => {
        setEditWeatherLoading(true);
        try {
          const response = await api.get(
            `/weather?lat=${photo.latitude}&lon=${photo.longitude}&date=${editDate}`
          );
          setEditWeather(response.data);
        } catch (error) {
          console.log(error);
          setEditWeather(null);
        } finally {
          setEditWeatherLoading(false);
        }
      };

      fetchWeather();
    }
  }, [isEditing, editDate, photo]);

  const handleToggleLike = async () => {
    setLikeLoading(true);

    try {
      if (isLiked) {
        await api.delete(`/likes/${id}`);
        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        await api.post("/likes", { photoId: id });
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    }

    setLikeLoading(false);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out this photo on GeoLens: ${photo.title || "Untitled"}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: photo.title || "GeoLens Photo", text: shareText, url: shareUrl });
      } catch (error) {
        console.log(error);
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, "_blank");
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;

    setPostingComment(true);

    try {
      const response = await api.post("/comments", { content: commentText, photoId: id });
      setComments((prev) => [
        ...prev,
        { ...response.data, User: { id: currentUserId, username: "You" } },
      ]);
      setCommentText("");
    } catch (error) {
      console.log(error);
    }

    setPostingComment(false);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.log(error);
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

  const handleSave = async () => {
    setSaving(true);

    const cameraDetails = [cameraLens, cameraSettings].filter(Boolean).join(" · ");

    try {
      const response = await api.put(`/photos/${id}`, {
        title,
        description,
        location,
        category,
        cameraDetails,
        dateTaken: editDate,
        weatherCondition: editWeather?.condition || photo.weatherCondition,
        weatherRating: editWeather ? 90 : photo.weatherRating,
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

        {!isEditing && isOwner && (
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
            {photo.dateTaken && <p className="photo-detail__category">Taken {photo.dateTaken}</p>}
          </div>


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

          <div className="photo-detail__actions-row">
            <button
              type="button"
              className={isLiked ? "photo-detail__like active" : "photo-detail__like"}
              onClick={handleToggleLike}
              disabled={likeLoading}
            >
              {isLiked ? "♥" : "♡"} {isLiked ? "Liked" : "Like"} &middot; {likeCount}
            </button>

            <button type="button" className="photo-detail__share" onClick={handleShare}>
              <FiShare2 />
              Share
            </button>

            {isOwner && (
              <button
                type="button"
                className="photo-detail__delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete photo"}
              </button>
            )}
          </div>

          <div className="photo-detail__section">
            <p className="photo-detail__section-title">
              Comments {comments.length > 0 && `(${comments.length})`}
            </p>

            {commentsLoading && <p className="photo-detail__label">Loading comments...</p>}

            {!commentsLoading && comments.length === 0 && (
              <p className="photo-detail__label">No comments yet.</p>
            )}

            {!commentsLoading &&
              comments.map((comment) => (
                <div key={comment.id} className="photo-detail__comment">
                  <div>
                    <p className="photo-detail__comment-username">
                      @{comment.User?.username || "user"}
                    </p>
                    <p className="photo-detail__comment-text">{comment.content}</p>
                  </div>
                  {comment.userId === currentUserId && (
                    <button
                      type="button"
                      className="photo-detail__comment-delete"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}

            <div className="photo-detail__comment-form">
              <input
                type="text"
                className="photo-detail__input"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                type="button"
                className="photo-detail__add-btn"
                onClick={handlePostComment}
                disabled={postingComment}
              >
                {postingComment ? "..." : "Post"}
              </button>
            </div>
          </div>
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

          <label className="photo-detail__label">Date photo was taken</label>
          <input
            type="date"
            className="photo-detail__input"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />

          <label className="photo-detail__label">Weather (auto-filled)</label>
          {editWeatherLoading && <p className="photo-detail__label">Loading weather...</p>}
          {!editWeatherLoading && editWeather && (
            <div className="photo-detail__weather">
              <span>{editWeather.temperature}° {editWeather.condition}</span>
              <span>Wind {editWeather.windSpeed} mph</span>
              <span>Sunset {editWeather.sunset}</span>
            </div>
          )}
          {!editWeatherLoading && !editWeather && (
            <p className="photo-detail__label">No weather data available for this date.</p>
          )}

          <label className="photo-detail__label">Camera / lens</label>
          <select
            className="photo-detail__input"
            value={showLensOther ? OTHER_VALUE : cameraLens}
            onChange={handleLensChange}
          >
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
            <div className="photo-detail__other-row">
              <input
                type="text"
                className="photo-detail__input"
                placeholder="Type new camera / lens"
                value={customLensInput}
                onChange={(e) => setCustomLensInput(e.target.value)}
              />
              <button type="button" className="photo-detail__add-btn" onClick={handleAddLens}>
                Add
              </button>
            </div>
          )}

          <label className="photo-detail__label">Settings</label>
          <select
            className="photo-detail__input"
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
            <div className="photo-detail__other-row">
              <input
                type="text"
                className="photo-detail__input"
                placeholder="Type new settings"
                value={customSettingsInput}
                onChange={(e) => setCustomSettingsInput(e.target.value)}
              />
              <button type="button" className="photo-detail__add-btn" onClick={handleAddSettings}>
                Add
              </button>
            </div>
          )}

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