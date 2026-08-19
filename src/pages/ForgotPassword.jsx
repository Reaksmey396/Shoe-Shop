import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";

import { auth } from "../lib/firebase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSendResetEmail = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("សូមបញ្ចូល Gmail របស់អ្នក។");
      return;
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(cleanEmail)) {
      setError(
        "សូមបញ្ចូល Gmail ដែលត្រឹមត្រូវ។ ឧទាហរណ៍: example@gmail.com"
      );
      return;
    }

    setLoading(true);

    try {
      console.log("Sending password reset email...");
      console.log("Email:", cleanEmail);

      await sendPasswordResetEmail(
        auth,
        cleanEmail
      );

      console.log(
        "Password reset email sent successfully."
      );

      setSuccess(true);

    } catch (err) {
      console.error(
        "Password reset error:",
        err
      );

      console.error(
        "Firebase error code:",
        err?.code
      );

      let message =
        "មិនអាចផ្ញើ Password Reset Email បានទេ។";

      switch (err?.code) {
        case "auth/invalid-email":
          message =
            "Gmail មិនត្រឹមត្រូវទេ។";
          break;

        case "auth/user-not-found":
          message =
            "មិនមាន Account ដែលប្រើ Gmail នេះទេ។";
          break;

        case "auth/too-many-requests":
          message =
            "អ្នកបានស្នើ Reset Password ច្រើនពេក។ សូមរង់ចាំបន្តិច។";
          break;

        case "auth/operation-not-allowed":
          message =
            "Email/Password Authentication មិនទាន់បាន Enable ក្នុង Firebase ទេ។";
          break;

        case "auth/network-request-failed":
          message =
            "មិនអាចភ្ជាប់ទៅ Firebase បានទេ។ សូមពិនិត្យ Internet។";
          break;

        default:
          message =
            err?.message ||
            "មានបញ្ហាក្នុងការផ្ញើ Password Reset Email។";
      }

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 px-5 py-10">

        <img
          src="https://i.pinimg.com/736x/1b/36/7f/1b367f03faeca7953f4504fdcb0ee5bb.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-gray-900/90 p-8 text-center shadow-2xl backdrop-blur-md">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
            <i className="fa-solid fa-envelope-circle-check text-4xl text-green-400" />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-white">
            Check Your Gmail
          </h1>

          <p className="mt-4 text-sm leading-7 text-gray-300">
            Password Reset Email ត្រូវបានស្នើ
            ពី Firebase រួចរាល់។
          </p>

          <div className="mt-5 rounded-2xl border border-green-400/30 bg-green-500/10 px-5 py-4">

            <p className="text-xs text-green-300">
              Reset Email
            </p>

            <p className="mt-2 break-all font-bold text-green-200">
              {email.trim().toLowerCase()}
            </p>

          </div>

          <div className="mt-5 rounded-2xl bg-gray-800 px-5 py-4 text-left">

            <p className="text-sm font-semibold text-gray-200">
              សូមពិនិត្យ៖
            </p>

            <div className="mt-3 space-y-2 text-sm text-gray-400">

              <p>
                • Gmail Inbox
              </p>

              <p>
                • Spam
              </p>

              <p>
                • Promotions
              </p>

              <p>
                • Updates
              </p>

              <p>
                • All Mail
              </p>

            </div>

          </div>

          <div className="mt-5 rounded-2xl border border-orange-400/20 bg-orange-500/10 px-5 py-4">

            <p className="text-sm leading-6 text-orange-200">
              <i className="fa-solid fa-circle-info mr-2" />

              Search Gmail ដោយពាក្យ
              <strong> Password Reset </strong>
              ឬ
              <strong> Firebase </strong>
            </p>

          </div>

          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setError("");
            }}
            className="mt-6 w-full rounded-2xl border border-gray-700 bg-gray-800 py-3.5 font-semibold text-gray-200 transition hover:bg-gray-700"
          >
            <i className="fa-solid fa-rotate-right mr-2" />

            Send Again
          </button>

          <Link
            to="/login"
            className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white"
          >
            <i className="fa-solid fa-arrow-left" />

            Back to Login
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 px-5 py-10">

      <img
        src="https://i.pinimg.com/736x/1b/36/7f/1b367f03faeca7953f4504fdcb0ee5bb.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-gray-900/90 p-8 shadow-2xl backdrop-blur-md">

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20">

            <i className="fa-solid fa-lock text-2xl text-orange-400" />

          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            Forgot Password?
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-300">
            បញ្ចូល Gmail របស់អ្នក
            ដើម្បីទទួលបាន Password Reset Email
            ពី Firebase។
          </p>

        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4">

            <div className="flex items-start gap-3">

              <i className="fa-solid fa-circle-exclamation mt-1 text-red-400" />

              <p className="text-sm leading-6 text-red-300">
                {error}
              </p>

            </div>

          </div>
        )}

        <form
          onSubmit={handleSendResetEmail}
          className="mt-7"
        >

          <label className="mb-2 block text-sm font-semibold text-gray-200">
            Gmail Address
          </label>

          <div className="relative">

            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="example@gmail.com"
              className="w-full rounded-2xl border border-gray-600 bg-gray-800 px-5 py-4 pr-12 text-white outline-none placeholder:text-gray-500 transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />

            <i className="fa-solid fa-envelope absolute right-5 top-1/2 -translate-y-1/2 text-gray-500" />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" />
                Sending Email...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane" />
                Send Reset Email
              </>
            )}

          </button>

        </form>

        <div className="mt-6 rounded-2xl bg-gray-800 px-5 py-4">

          <div className="flex items-start gap-3">

            <i className="fa-solid fa-circle-info mt-1 text-orange-400" />

            <p className="text-sm leading-6 text-gray-400">
              Firebase ជាអ្នកផ្ញើ Password Reset Email
              ដោយផ្ទាល់។ មិនប្រើ SMTP ឬ Cloud Functions ទេ។
            </p>

          </div>

        </div>

        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white"
        >

          <i className="fa-solid fa-arrow-left" />

          Back to Login

        </Link>

      </div>

    </main>
  );
}