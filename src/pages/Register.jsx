import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await register(
        username,
        email,
        password
      );

      // New users go to Home
      navigate("/");
    } catch (err) {
      console.error(
        "Register error:",
        err
      );

      let message =
        "មិនអាចបង្កើត Account បានទេ។";

      switch (err.code) {
        case "auth/email-already-in-use":
          message =
            "Email នេះមាន Account រួចហើយ។ សូម Login។";
          break;

        case "auth/invalid-email":
          message =
            "Email មិនត្រឹមត្រូវ។";
          break;

        case "auth/weak-password":
          message =
            "Password ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ។";
          break;

        case "permission-denied":
          message =
            "Firestore មិនអនុញ្ញាតឲ្យបង្កើត User ទេ។ សូមពិនិត្យ Firestore Rules។";
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
    <main className="relative min-h-screen flex items-center justify-center px-5 overflow-hidden">

      {/* Background */}
      <img
        className="absolute w-full h-full object-cover"
        src="https://i.pinimg.com/736x/df/85/75/df8575ca1876dd76147b16c08056e74f.jpg"
        alt=""
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md backdrop-blur-sm bg-black/20 border border-white/20 rounded-3xl shadow-2xl p-5">

        {/* Header */}
        <div className="text-center mb-8">

          <i className="fa-solid fa-shoe-prints text-5xl text-white" />

          <h1 className="text-4xl font-bold text-gray-50 mt-4">
            Create Account
          </h1>

          <p className="text-gray-200 mt-2">
            Join the SoleStyle community
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Error */}
          {error && (
            <div className="text-sm font-medium text-red-100 bg-red-500/30 border border-red-300/50 px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="relative">

            <input
              required
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="Enter your username..."
              className="login-input w-full py-3 px-5 pr-12 rounded-full text-white placeholder:text-gray-300 border border-white/40 outline-none focus:border-orange-500"
            />

            <i className="fa-regular fa-user absolute right-5 top-1/2 -translate-y-1/2 text-white" />

          </div>

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
              className="login-input w-full py-3 px-5 pr-12 rounded-full text-white placeholder:text-gray-300 border border-white/40 outline-none focus:border-orange-500"
            />

            <i className="fa-solid fa-envelope absolute right-5 top-1/2 -translate-y-1/2 text-white" />

          </div>

          {/* Password */}
          <div className="relative">

            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password..."
              className="login-input w-full py-3 px-5 pr-12 rounded-full text-white placeholder:text-gray-300 border border-white/40 outline-none focus:border-orange-500"
            />

            <i className="fa-solid fa-lock absolute right-5 top-1/2 -translate-y-1/2 text-white" />

          </div>

          {/* Remember */}
          <div className="flex justify-between text-sm text-gray-200">

            <label className="flex gap-2">
              <input
                type="checkbox"
                className="accent-orange-500"
              />
              Remember Me
            </label>

            <button
              type="button"
              className="hover:text-gray-300"
            >
              Forgot Password?
            </button>

          </div>

          {/* Register */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Creating account..."
              : "Register"}
          </button>

        </form>

        {/* Login */}
        <p className="text-center text-gray-200 mt-6">

          Already have an account?{" "}

          <Link
            to="/login"
            className="text-red-500 hover:text-red-400"
          >
            Login
          </Link>

        </p>

      </div>
    </main>
  );
}