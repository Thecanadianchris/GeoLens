import { Link } from "react-router-dom";
import Logo from '../components/Logo'; // Import your logo component
// import "./Landing.scss";

function Landing() {
  return (
    <div className="page landing">
      <div className="landing__content">
        <Logo altText="GEOLens Logo" />
        <p className="landing__tagline">Find the perfect light near you</p>

        <Link to="/login" className="btn btn--primary">
          Log In
        </Link>

        <Link to="/register" className="btn btn--secondary">
          Get started
        </Link>
      </div>
    </div>
  );
}

export default Landing;