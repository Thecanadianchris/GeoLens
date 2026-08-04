import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiUser } from "react-icons/fi";
import api from "../api/axios";
import "./EditProfile.scss";

function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await api.get(`/users/${userId}`);
        const user = response.data;

        setUsername(user.username || "");
        setTitle(user.title || "");
        setLocation(user.location || "");
        setBio(user.bio || "");
        setAvatarPreview(user.profilePhoto || null);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setServerError("");

    try {
      const userId = localStorage.getItem("userId");
      const formData = new FormData();
      formData.append("username", username);
      formData.append("title", title);
      formData.append("location", location);
      formData.append("bio", bio);

      if (avatarFile) {
        formData.append("profilePhoto", avatarFile);
      }

      await api.put(`/users/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/profile");
    } catch (error) {
      console.log(error);
      setServerError(error.response?.data?.error || "Something went wrong");
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="page edit-profile">Loading...</div>;
  }

  return (
    <div className="page edit-profile">
      <header className="edit-profile__header">
        <button type="button" className="edit-profile__back" onClick={() => navigate("/profile")}>
          <FiChevronLeft />
        </button>
        <h1>Edit Profile</h1>
      </header>

      <div className="edit-profile__avatar-row">
        <label className="edit-profile__avatar" htmlFor="avatarInput">
          {avatarPreview ? <img src={avatarPreview} alt="Avatar preview" /> : <FiUser />}
        </label>
        <div>
          <label className="edit-profile__avatar-change" htmlFor="avatarInput">
            Change photo
          </label>
          <input
            id="avatarInput"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            hidden
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="username">Username</label>
        <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          placeholder="e.g. Landscape photographer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="location">Location</label>
        <input
          id="location"
          placeholder="e.g. Bristol, UK"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="bio">Bio</label>
        <textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      {serverError && <p className="error">{serverError}</p>}

      <button type="button" className="btn btn--primary" disabled={saving} onClick={handleSave}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

export default EditProfile;