import { Link } from "react-router-dom";
import "./Login.scss";

function Login() {
  return (
    <div className="page login">
      <img src="/logo.png" alt="GEOLens" className="login__logo" />

      <form>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="name@example.com" />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="Enter your password" />
        </div>

        <Link to="/reset-password" className="login__forgot">
          Forgot password
        </Link>

        <button type="submit" className="btn btn--primary">
          Log In
        </button>
      </form>

      <div className="divider">OR</div>

      <button type="button" className="btn btn--secondary">
        Sign in with Google
      </button>

      <button type="button" className="btn btn--secondary login__apple">
        Sign in with Apple
      </button>

      <Link to="/register" className="text-link login__register">
        No Account? Register
      </Link>
    </div>
  );
}

export default Login;