import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header"; 

// import "./Notifications.scss";

const timeAgo = (dateString) => {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const getMessage = (notification) => {
  const username = notification.fromUser?.username || "Someone";
  if (notification.type === "like") return `${username} liked your photo`;
  if (notification.type === "comment") return `${username} commented on your photo`;
  if (notification.type === "follow") return `${username} started following you`;
  return `${username} interacted with your photo`;
};

const getIcon = (type) => {
  if (type === "like") return "♥";
  if (type === "comment") return "💬";
  if (type === "follow") return "＋";
  return "•";
};

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        setNotifications(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await api.put(`/notifications/${notification.id}`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
      } catch (error) {
        console.log(error);
      }
    }

    if (notification.photoId) {
      navigate(`/photos/${notification.photoId}`);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);

    try {
      await Promise.all(unread.map((n) => api.put(`/notifications/${n.id}`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.log(error);
    }
  };

  const today = notifications.filter(
    (n) => new Date(n.createdAt).toDateString() === new Date().toDateString()
  );
  const earlier = notifications.filter(
    (n) => new Date(n.createdAt).toDateString() !== new Date().toDateString()
  );

  if (loading) {
    return <div className="page notifications">Loading...</div>;
  }

  return (
    <div className="page notifications">
      <Header onOpenNotifications={() => {}} onOpenSettings={() => {}} />
      <div className="px-4 pt-4 pb-4">

        <header className="notifications__header">
          <h1>Notifications</h1>
          {notifications.some((n) => !n.read) && (
            <button type="button" className="notifications__mark-read" onClick={handleMarkAllRead}>
              Mark read
            </button>
          )}
        </header>

        {notifications.length === 0 && (
          <p className="notifications__empty">No notifications yet.</p>
        )}

        {today.length > 0 && (
          <div className="notifications__section">
            <p className="notifications__section-title">Today</p>
            {today.map((notification) => (
              <div
                key={notification.id}
                className={
                  notification.read
                    ? "notifications__item"
                    : "notifications__item notifications__item--unread"
                }
                onClick={() => handleNotificationClick(notification)}
              >
                <span className="notifications__icon">{getIcon(notification.type)}</span>
                <span className="notifications__message">{getMessage(notification)}</span>
                <span className="notifications__time">{timeAgo(notification.createdAt)}</span>
              </div>
            ))}
          </div>
        )}

        {earlier.length > 0 && (
          <div className="notifications__section">
            <p className="notifications__section-title">Earlier</p>
            {earlier.map((notification) => (
              <div
                key={notification.id}
                className={
                  notification.read
                    ? "notifications__item"
                    : "notifications__item notifications__item--unread"
                }
                onClick={() => handleNotificationClick(notification)}
              >
                <span className="notifications__icon">{getIcon(notification.type)}</span>
                <span className="notifications__message">{getMessage(notification)}</span>
                <span className="notifications__time">{timeAgo(notification.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
        </div>

      <BottomNav />
    </div>
  );
}

export default Notifications;