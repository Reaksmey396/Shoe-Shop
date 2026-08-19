import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithPopup,
} from "firebase/auth";

import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // =========================================================
  // LOGIN STATE
  // =========================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // =========================================================
  // GOOGLE LOGIN STATE
  // =========================================================

  const [googleLoading, setGoogleLoading] = useState(false);

  // =========================================================
  // FORGOT PASSWORD STATE
  // =========================================================

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");

  // =========================================================
  // NORMAL EMAIL LOGIN
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const credential = await login(
        email.trim(),
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

      if (credential.user.role === "admin") {
        navigate("/admin");
        return;
      }

      navigate("/");
    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      let message = "Login មិនជោគជ័យ។";

      switch (err.code) {
        case "auth/invalid-credential":
          message =
            "Email ឬ Password មិនត្រឹមត្រូវ។";
          break;

        case "auth/user-not-found":
          message =
            "រកមិនឃើញគណនីនេះទេ។";
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

        case "auth/user-disabled":
          message =
            "គណនីនេះត្រូវបានបិទ។";
          break;

        case "auth/network-request-failed":
          message =
            "មិនអាចភ្ជាប់ទៅ Firebase បានទេ។ សូមពិនិត្យ Internet របស់អ្នក។";
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

  // =========================================================
  // GOOGLE LOGIN
  // =========================================================

  const handleGoogleLogin = async () => {
    if (googleLoading || submitting) {
      return;
    }

    setError("");
    setGoogleLoading(true);

    try {
      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result =
        await signInWithPopup(
          auth,
          provider
        );

      const user = result.user;

      console.log(
        "Google login successful"
      );

      console.log(
        "Name:",
        user.displayName
      );

      console.log(
        "Email:",
        user.email
      );

      console.log(
        "UID:",
        user.uid
      );

      console.log(
        "Provider:",
        user.providerData
      );

      navigate("/");
    } catch (err) {
      console.error(
        "Google login error:",
        err
      );

      let message =
        "Google Login មិនជោគជ័យ។";

      switch (err.code) {
        case "auth/popup-closed-by-user":
          message =
            "អ្នកបានបិទ Google Login។";
          break;

        case "auth/popup-blocked":
          message =
            "Browser បានរារាំង Google Login។ សូមអនុញ្ញាត Popup រួចព្យាយាមម្ដងទៀត។";
          break;

        case "auth/cancelled-popup-request":
          message =
            "Google Login ត្រូវបានលុបចោល។";
          break;

        case "auth/account-exists-with-different-credential":
          message =
            "Email នេះមានគណនីរួចហើយជាមួយ Login ផ្សេង។ សូម Login ដោយវិធីដើមរបស់អ្នក។";
          break;

        case "auth/network-request-failed":
          message =
            "មិនអាចភ្ជាប់ទៅ Google បានទេ។ សូមពិនិត្យ Internet របស់អ្នក។";
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
      setGoogleLoading(false);
    }
  };

  // =========================================================
  // OPEN FORGOT PASSWORD
  // =========================================================

  const handleForgotPasswordClick = () => {
    setError("");
    setResetError("");
    setResetSuccess("");

    setResetEmail(email);

    setShowForgotModal(true);
  };

  // =========================================================
  // CLOSE FORGOT PASSWORD
  // =========================================================

  const closeForgotModal = () => {
    if (resetLoading) {
      return;
    }

    setShowForgotModal(false);

    setResetError("");
    setResetSuccess("");
  };

  // =========================================================
  // SEND PASSWORD RESET EMAIL
  // =========================================================

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (resetLoading) {
      return;
    }

    setResetError("");
    setResetSuccess("");

    const cleanEmail =
      resetEmail.trim();

    if (!cleanEmail) {
      setResetError(
        "សូមបញ្ចូល Email របស់អ្នក។"
      );

      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(
        auth,
        cleanEmail
      );

      setResetSuccess(
        "បានផ្ញើ Link សម្រាប់ Reset Password ទៅ Email របស់អ្នកហើយ។ សូមចូល Gmail របស់អ្នក ហើយចុច Link ដើម្បីប្តូរ Password ថ្មី។"
      );
    } catch (err) {
      console.error(
        "Password reset error:",
        err
      );

      let message =
        "មិនអាចផ្ញើ Reset Password Email បានទេ។";

      switch (err.code) {
        case "auth/user-not-found":
          message =
            "រកមិនឃើញគណនីដែលប្រើ Email នេះទេ។";
          break;

        case "auth/invalid-email":
          message =
            "Email មិនត្រឹមត្រូវ។";
          break;

        case "auth/too-many-requests":
          message =
            "មានការស្នើ Reset Password ច្រើនពេក។ សូមព្យាយាមម្ដងទៀតនៅពេលក្រោយ។";
          break;

        case "auth/network-request-failed":
          message =
            "មិនអាចភ្ជាប់ទៅ Firebase បានទេ។ សូមពិនិត្យ Internet របស់អ្នក។";
          break;

        default:
          message =
            err.message?.replace(
              "Firebase: ",
              ""
            ) || message;
      }

      setResetError(message);
    } finally {
      setResetLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      {/* =====================================================
          LOGIN PAGE
      ===================================================== */}

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 px-5 py-6">

        {/* BACKGROUND */}

        <img
          src="https://i.pinimg.com/736x/1b/36/7f/1b367f03faeca7953f4504fdcb0ee5bb.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* DARK OVERLAY */}

        <div className="absolute inset-0 bg-black/50" />

        {/* LOGIN CARD */}

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-black/30 px-7 py-6 shadow-2xl backdrop-blur-md sm:px-8 sm:py-7">

          {/* HEADER */}

          <div className="mb-5 text-center">

            <i className="fa-solid fa-shoe-prints text-4xl text-gray-100" />

            <h1 className="mt-2 text-3xl font-bold text-gray-100">
              Welcome Back
            </h1>

            <p className="mt-1 text-sm text-gray-300">
              Sign in to your SoleStyle account
            </p>

          </div>

          {/* LOGIN ERROR */}

          {error && !showForgotModal && (
            <div className="mb-4 rounded-xl border border-red-300/30 bg-red-500/20 px-4 py-2.5 text-center text-sm font-medium text-red-100">
              {error}
            </div>
          )}

          {/* GOOGLE LOGIN */}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={
              googleLoading ||
              submitting
            }
            className="flex w-full items-center justify-center gap-3 rounded-full bg-white py-2.5 font-semibold text-gray-800 shadow-md transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {googleLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" />
                Connecting to Google...
              </>
            ) : (
              <>
                <i className="fa-brands fa-google text-red-500" />
                Continue with Google
              </>
            )}

          </button>

          {/* OR */}

          <div className="my-4 flex items-center gap-4">

            <div className="h-px flex-1 bg-white/30" />

            <span className="text-xs font-medium uppercase text-white/70">
              OR
            </span>

            <div className="h-px flex-1 bg-white/30" />

          </div>

          {/* LOGIN FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* EMAIL */}

            <div className="relative">

              <input
                required
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email..."
                autoComplete="email"
                className="login-input w-full rounded-full border border-white/40 bg-transparent px-5 py-2.5 pr-12 text-white outline-none placeholder:text-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />

              <i className="fa-solid fa-envelope absolute right-5 top-1/2 -translate-y-1/2 text-white" />

            </div>

            {/* PASSWORD */}

            <div className="relative">

              <input
                required
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password..."
                autoComplete="current-password"
                className="login-input w-full rounded-full border border-white/40 bg-transparent px-5 py-2.5 pr-12 text-white outline-none placeholder:text-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />

              <i className="fa-solid fa-lock absolute right-5 top-1/2 -translate-y-1/2 text-white" />

            </div>

            {/* REMEMBER + FORGOT */}

            <div className="flex items-center justify-between gap-3 text-sm text-white">

              <label className="flex cursor-pointer items-center gap-2">

                <input
                  type="checkbox"
                  className="h-4 w-4 accent-orange-500"
                />

                <span>
                  Remember Me
                </span>

              </label>

              <button
                type="button"
                onClick={
                  handleForgotPasswordClick
                }
                className="font-medium text-white transition hover:text-orange-300"
              >
                Forgot Password?
              </button>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={
                submitting ||
                googleLoading
              }
              className="w-full rounded-full bg-orange-500 py-2.5 font-bold text-gray-100 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}

            </button>

          </form>

          {/* REGISTER */}

          <p className="mt-4 text-center text-sm text-white">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-orange-500 transition hover:text-orange-300"
            >
              Register
            </Link>

          </p>

        </div>

      </main>

      {/* =====================================================
          FORGOT PASSWORD MODAL
      ===================================================== */}

      {showForgotModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !resetLoading
            ) {
              closeForgotModal();
            }
          }}
        >

          {/* MODAL */}

          <div className="w-full max-w-sm rounded-2xl bg-gray-100 p-5 shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">

                  <i className="fa-solid fa-key text-orange-500" />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-gray-900">
                    Forgot Password?
                  </h2>

                  <p className="text-xs text-gray-500">
                    Reset your account password
                  </p>

                </div>

              </div>

              {/* CLOSE */}

              <button
                type="button"
                onClick={closeForgotModal}
                disabled={resetLoading}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
              >

                <i className="fa-solid fa-xmark" />

              </button>

            </div>

            {/* DESCRIPTION */}

            <p className="mt-4 text-sm leading-5 text-gray-600">

              Enter the Gmail or email connected to your
              SoleStyle account. Firebase will send you a
              secure password reset link.

            </p>

            {/* SUCCESS */}

            {resetSuccess && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-3">

                <div className="flex items-start gap-2">

                  <i className="fa-solid fa-circle-check mt-0.5 text-green-600" />

                  <p className="text-xs leading-5 text-green-700">
                    {resetSuccess}
                  </p>

                </div>

              </div>
            )}

            {/* ERROR */}

            {resetError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3">

                <div className="flex items-start gap-2">

                  <i className="fa-solid fa-circle-exclamation mt-0.5 text-red-600" />

                  <p className="text-xs leading-5 text-red-700">
                    {resetError}
                  </p>

                </div>

              </div>
            )}

            {/* RESET FORM */}

            {!resetSuccess && (
              <form
                onSubmit={
                  handlePasswordReset
                }
                className="mt-4 space-y-3"
              >

                {/* EMAIL */}

                <div className="relative">

                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(
                        e.target.value
                      );

                      setResetError("");
                    }}
                    placeholder="Enter your Gmail..."
                    autoComplete="email"
                    className="reset-input w-full rounded-xl border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                  <i className="fa-solid fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />

                </div>

                {/* SEND */}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
                >

                  {resetLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane mr-2" />
                      Send Reset Link
                    </>
                  )}

                </button>

              </form>
            )}

            {/* BOTTOM BUTTON */}

            <button
              type="button"
              onClick={closeForgotModal}
              disabled={resetLoading}
              className="mt-3 w-full rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {resetSuccess
                ? "Back to Login"
                : "Cancel"}

            </button>

          </div>

        </div>
      )}
    </>
  );
}