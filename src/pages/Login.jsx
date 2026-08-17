import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const credential =
        await login(
          email,
          password
        );

      console.log(
        "Login successful:",
        credential.user.email
      );

      console.log(
        "Role:",
        credential.user.role
      );

      // =====================================
      // ADMIN
      // =====================================

      if (
        credential.user.role ===
        "admin"
      ) {
        navigate("/admin");
        return;
      }

      // =====================================
      // NORMAL USER
      // =====================================

      navigate("/");

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      let message =
        "Login មិនជោគជ័យ។";

      switch (err.code) {
        case "auth/invalid-credential":
          message =
            "Email ឬ Password មិនត្រឹមត្រូវ។";
          break;

        case "auth/user-not-found":
          message =
            "រកមិនឃើញ User នេះទេ។";
          break;

        case "auth/wrong-password":
          message =
            "Password មិនត្រឹមត្រូវ។";
          break;

        case "auth/invalid-email":
          message =
            "Email មិនត្រឹមត្រូវ។";
          break;

        case "auth/too-many-requests":
          message =
            "មានការព្យាយាម Login ច្រើនពេក។ សូមព្យាយាមម្ដងទៀតនៅពេលក្រោយ។";
          break;

        default:
          message =
            err.message?.replace(
              "Firebase: ",
              ""
            ) || message;
      }

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5">

      {/* Background */}
      <img
        className="absolute h-full w-full object-cover"
        src="https://i.pinimg.com/736x/1b/36/7f/1b367f03faeca7953f4504fdcb0ee5bb.jpg"
        alt=""
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-black/20 p-8 shadow-2xl backdrop-blur-sm">

        {/* Header */}
        <div className="mb-8 text-center">

          <i className="fa-solid fa-shoe-prints text-5xl text-gray-100" />

          <h1 className="mt-4 text-4xl font-bold text-gray-100">
            Welcome Back
          </h1>

          <p className="mt-2 text-gray-200">
            Sign in to your SoleStyle account
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-300/50 bg-red-500/30 px-4 py-3 text-center text-sm font-medium text-red-100">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Email */}
          <div className="relative">

            <input
              required
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email..."
              className="login-input w-full rounded-full border border-white/40 px-5 py-3 pr-12 text-white outline-none placeholder:text-orange-200 focus:border-orange-500"
            />

            <i className="fa-solid fa-envelope absolute right-5 top-1/2 -translate-y-1/2 text-white" />

          </div>

          {/* Password */}
          <div className="relative">

            <input
              required
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password..."
              className="login-input w-full rounded-full border border-white/40 px-5 py-3 pr-12 text-white outline-none placeholder:text-orange-200 focus:border-orange-500"
            />

            <i className="fa-solid fa-lock absolute right-5 top-1/2 -translate-y-1/2 text-white" />

          </div>

          {/* Remember */}
          <div className="flex justify-between text-sm text-white">

            <label className="flex cursor-pointer gap-2">

              <input
                type="checkbox"
                className="accent-orange-500"
              />

              Remember Me

            </label>

            <button
              type="button"
              className="hover:text-red-300"
            >
              Forgot Password?
            </button>

          </div>

          {/* Login */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-orange-500 py-3 font-bold text-gray-100 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* Register */}
        <p className="mt-6 text-center text-white">

          Don't have an account?{" "}

          <Link
            to="/register"
            className="text-orange-500 hover:text-orange-300"
          >
            Register
          </Link>

        </p>

      </div>

    </main>
  );
}