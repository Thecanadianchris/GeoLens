import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header"; 

// import "./Settings.scss";

const accountRows = [
  { label: "Edit profile", path: "/profile" },
  { label: "Email & password", path: "/reset-password" },
];

const preferenceRows = [
  { label: "Units", value: "METRIC" },
  { label: "Default filters" },
  { label: "Notifications", value: "ON" },
];

const aboutRows = [{ label: "Privacy policy" }, { label: "Terms" }];

function SettingsRow({ label, value, onClick }) {
  return (
    <button type="button" className="settings__row" onClick={onClick}>
      <span>{label}</span>
      <span className="settings__row-right">
        {value && <span className="settings__row-value">{value}</span>}
        <FiChevronRight />
      </span>
    </button>
  );
}

function Settings() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <div className="page settings">
      <Header />
      <div className="px-4 pt-4 pb-4">
        <header className="settings__header">
          <button type="button" className="settings__back" onClick={handleBack}>
            <FiChevronLeft />
          </button>
          <h1>Settings</h1>
        </header>

        <section className="settings__section">
          <h2 className="settings__section-title">Account</h2>
          {accountRows.map((row) => (
            <SettingsRow
              key={row.label}
              label={row.label}
              onClick={() => row.path && navigate(row.path)}
            />
          ))}
        </section>

        <section className="settings__section">
          <h2 className="settings__section-title">Preferences</h2>
          {preferenceRows.map((row) => (
            <SettingsRow key={row.label} label={row.label} value={row.value} />
          ))}
        </section>

        <section className="settings__section">
          <h2 className="settings__section-title">About</h2>
          {aboutRows.map((row) => (
            <SettingsRow key={row.label} label={row.label} />
          ))}
        </section>

        <button type="button" className="settings__logout" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

export default Settings;