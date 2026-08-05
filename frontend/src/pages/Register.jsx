import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Logo from "../components/Logo"; // Import your logo component

// import "./Register.scss";

function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Used to check the two passwords match
  const password = watch("password");

  const onSubmit = async (formData) => {
    setServerError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      navigate("/login");
    } catch (error) {
      console.log(error);
      setServerError(error.response?.data?.error || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="page register">
      <Link to="/" className="register__back">
        &lt; Back
      </Link>
      <Logo altText="GEOLens Logo" />
      <h1 className="register__title">Register</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your first and last name"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && <p className="error">{errors.name.message}</p>}
        </div>

        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Choose a username"
            {...register("username", {
              required: "Username is required",
              minLength: { value: 3, message: "At least 3 characters" },
            })}
          />
          {errors.username && <p className="error">{errors.username.message}</p>}
        </div>

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
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "At least 6 characters" },
            })}
          />
          {errors.password && <p className="error">{errors.password.message}</p>}
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Enter your password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === password || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword.message}</p>
          )}
        </div>

        <label className="register__terms">
          <input
            type="checkbox"
            {...register("terms", { required: "You must accept the terms" })}
          />
          I agree to the terms and privacy policy
        </label>
        {errors.terms && <p className="error">{errors.terms.message}</p>}

        {serverError && <p className="error">{serverError}</p>}

        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <div className="divider">OR</div>

      <button type="button" className="btn btn--secondary">
        Continue with Google
      </button>

      <button type="button" className="btn btn--secondary register__apple">
        Continue with Apple
      </button>

      <Link to="/" className="text-link register__cancel">
        Cancel
      </Link>
    </div>
  );
}

export default Register;