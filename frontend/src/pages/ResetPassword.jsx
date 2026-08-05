import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
// import "./ResetPassword.scss";

function ResetPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const password = watch("newPassword");

  const onSubmit = async (formData) => {
    setServerError("");
    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        email: formData.email,
        newPassword: formData.newPassword,
      });

      setSuccess(true);
    } catch (error) {
      console.log(error);
      setServerError(error.response?.data?.error || "Something went wrong");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="page reset-password">
        <h1 className="reset-password__title">Password reset</h1>
        <p className="reset-password__success">
          Your password has been updated. You can log in with your new password now.
        </p>
        <button type="button" className="btn btn--primary" onClick={() => navigate("/login")}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="page reset-password">
      <h1 className="reset-password__title">Reset your password</h1>
      <p className="reset-password__subtitle">
        Enter your account email and choose a new password.
      </p>

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
          <label htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            type="password"
            placeholder="Enter a new password"
            {...register("newPassword", {
              required: "New password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" },
            })}
          />
          {errors.newPassword && <p className="error">{errors.newPassword.message}</p>}
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your new password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === password || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}
        </div>

        {serverError && <p className="error">{serverError}</p>}

        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <Link to="/login" className="text-link reset-password__back">
        Back to Login
      </Link>
    </div>
  );
}

export default ResetPassword;