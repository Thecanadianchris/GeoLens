import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Login.scss";

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData) => {
    setServerError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      // Save the token so the user stays logged in
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);

      navigate("/");
    } catch (error) {
      console.log(error);
      setServerError(error.response?.data?.error || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="page login">
      <img src="/logo.png" alt="GEOLens" className="login__logo" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <p className="error">{errors.email.message}</p>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && <p className="error">{errors.password.message}</p>}
        </div>

        <Link to="/reset-password" className="login__forgot">
          Forgot password
        </Link>

        {serverError && <p className="error">{serverError}</p>}

        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
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