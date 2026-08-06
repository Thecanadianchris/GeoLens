import { NavLink } from "react-router-dom";
import { FiMap, FiPlusCircle, FiBell, FiUser, FiSettings } from "react-icons/fi";
import "../styles/components/_bottom_nav.scss";

// Shared bottom navigation, shown on every main app screen
function BottomNav() {
  const linkClass = ({ isActive }) =>
    `bottom-nav__item${isActive ? " active" : ""}`;



  return (
    <nav className="bottom-nav top-0 px-4 pt-4 pb-4">
      <NavLink to="/home" className={linkClass}>
        <FiMap />
        <span>Home</span>
      </NavLink>



      <NavLink to="/upload" className={linkClass}>
        <FiPlusCircle />
        <span>Upload</span>
      </NavLink>
      


      <NavLink to="/alerts" className={linkClass}>
        <FiBell />
        <span>Alerts</span>
      </NavLink>

      

      <NavLink to="/profile" className={linkClass}>
        <FiUser />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;