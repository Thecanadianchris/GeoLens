import { NavLink } from "react-router-dom";
import { FiMap, FiPlusCircle, FiBell, FiUser } from "react-icons/fi";

// Shared bottom navigation, shown on every main app screen
function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/home" className="bottom-nav__item">
        <FiMap />
        <span>Home</span>
      </NavLink>



      <NavLink to="/upload" className="bottom-nav__item">
        <FiPlusCircle />
        <span>Upload</span>
      </NavLink>



      <NavLink to="/alerts" className="bottom-nav__item">
        <FiBell />
        <span>Alerts</span>
      </NavLink>



      <NavLink to="/profile" className="bottom-nav__item">
        <FiUser />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}



export default BottomNav;