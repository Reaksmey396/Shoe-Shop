import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";

import { auth } from "../lib/firebase";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [oobCode, setOobCode] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [resetting, setResetting] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================================================
  // VERIFY RESET CODE
  // =========================================================

  useEffect(() => {
    const code =
      searchParams.get("oobCode");

    console.log(
      "Reset oobCode:",
      code
    );

    if (!code) {
      setError(
        "Reset Password link មិនត្រឹមត្រូវ ឬបាត់ Reset Code។"
      );

      setLoading(false);

      return;
    }

    setOobCode(code);

    const checkCode = async () => {
      try {
        console.log(
          "Checking Firebase reset code..."
        );

        const accountEmail =
          await verifyPasswordResetCode(
            auth,
            code
          );

        console.log(
          "Reset code valid for:",
          accountEmail
        );

        setEmail(accountEmail);

      } catch (err) {
        console.error(
          "Verify reset code error:",
          err
        );

        let message =
          "Reset Password link មិនត្រឹមត្រូវ។";

        switch (err.code) {

          case "auth/expired-action-code":
            message =
              "Reset Password link បានផុតកំណត់។ សូមស្នើ Reset Password ថ្មី។";
            break;

          case "auth/invalid-action-code":
            message =
              "Reset Password link មិនត្រឹមត្រូវ ឬត្រូវបានប្រើរួចហើយ។";
            break;

          case "auth/user-disabled":
            message =
              "គណនីនេះត្រូវបានបិទ។";
            break;

          case "auth/user-not-found":
            message =
              "រកមិនឃើញគណនីនេះទេ។";
            break;

          default:
            message =
              err.message
                ?.replace("Firebase: ", "")
                || message;
        }

        setError(message);

      } finally {
        setLoading(false);
      }
    };

    checkCode();

  }, [searchParams]);

  // =========================================================
  // RESET PASSWORD
  // =========================================================

  const handleResetPassword =
    async (e) => {

      e.preventDefault();

      setError("");

      // CODE

      if (!oobCode) {
        setError(
          "Reset Code មិនត្រឹមត្រូវ។"
        );
        return;
      }

      // PASSWORD LENGTH

      if (newPassword.length < 6) {
        setError(
          "Password ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ។"
        );
        return;
      }

      // PASSWORD MATCH

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          "Password ទាំងពីរមិនដូចគ្នាទេ។"
        );
        return;
      }

      setResetting(true);

      try {

        console.log(
          "Changing password..."
        );

        await confirmPasswordReset(
          auth,
          oobCode,
          newPassword
        );

        console.log(
          "Password changed successfully!"
        );

        setSuccess(true);

        setNewPassword("");
        setConfirmPassword("");

        // Remove oobCode from URL

        setSearchParams(
          {},
          {
            replace: true,
          }
        );

      } catch (err) {

        console.error(
          "Reset password error:",
          err
        );

        let message =
          "មិនអាច Reset Password បានទេ។";

        switch (err.code) {

          case "auth/expired-action-code":
            message =
              "Reset Password link បានផុតកំណត់។ សូមស្នើ Link ថ្មី។";
            break;

          case "auth/invalid-action-code":
            message =
              "Reset Password link មិនត្រឹមត្រូវ ឬត្រូវបានប្រើរួចហើយ។";
            break;

          case "auth/weak-password":
            message =
              "Password ខ្សោយពេក។ សូមប្រើយ៉ាងហោចណាស់ 6 តួអក្សរ។";
            break;

          default:
            message =
              err.message
                ?.replace("Firebase: ", "")
                || message;
        }

        setError(message);

      } finally {

        setResetting(false);

      }
    };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 px-5">

        <img
          src="https://i.pinimg.com/736x/1b/36/7f/1b367f03faeca7953f4504fdcb0ee5bb.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 rounded-3xl border border-white/20 bg-gray-900/85 p-10 text-center shadow-2xl backdrop-blur-md">

          <i className="fa-solid fa-spinner fa-spin text-4xl text-orange-400" />

          <p className="mt-5 text-gray-300">
            កំពុងពិនិត្យ Reset Link...
          </p>

        </div>

      </main>
    );
  }

  // =========================================================
  // INVALID LINK
  // =========================================================

  if (error && !email) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 px-5">

        <img
          src="https://i.pinimg.com/736x/1b/36/7f/1b367f03faeca7953f4504fdcb0ee5bb.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-gray-900/85 p-8 text-center shadow-2xl backdrop-blur-md">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">

            <i className="fa-solid fa-link-slash text-2xl text-red-400" />

          </div>

          <h1 className="mt-5 text-2xl font-bold text-white">
            Reset Link មិនត្រឹមត្រូវ
          </h1>

          <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-4 text-left text-sm leading-6 text-red-300">
            {error}
          </div>

          <Link
            to="/forgot-password"
            className="mt-6 block w-full rounded-2xl bg-orange-500 py-3.5 font-bold text-white transition hover:bg-orange-600"
          >
            Request New Reset Link
          </Link>

          <Link
            to="/login"
            className="mt-5 block text-sm font-medium text-gray-400 hover:text-white"
          >
            <i className="fa-solid fa-arrow-left mr-2" />
            Back to Login
          </Link>

        </div>

      </main>
    );
  }

  // =========================================================
  // SUCCESS
  // =========================================================

  if (success) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 px-5">

        <img
          src="https://i.pinimg.com/736x/1b/36/7f/1b367f03faeca7953f4504fdcb0ee5bb.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-gray-900/85 p-8 text-center shadow-2xl backdrop-blur-md">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">

            <i className="fa-solid fa-circle-check text-4xl text-green-400" />

          </div>

          <h1 className="mt-6 text-3xl font-bold text-white">
            Password Reset!
          </h1>

          <p className="mt-3 text-gray-300">
            Password របស់អ្នកត្រូវបានផ្លាស់ប្តូរជោគជ័យ។
          </p>

          <p className="mt-2 text-sm text-gray-400">
            ឥឡូវអ្នកអាច Login ជាមួយ Password ថ្មីបាន។
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            className="mt-7 w-full rounded-2xl bg-orange-500 py-3.5 font-bold text-white transition hover:bg-orange-600"
          >

            <i className="fa-solid fa-right-to-bracket mr-2" />

            Go to Login

          </button>

        </div>

      </main>
    );
  }

  // =========================================================
  // RESET FORM
  // =========================================================

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 px-5 py-10">

      {/* BACKGROUND */}

      <img
        src="https://i.pinimg.com/736x/1b/36/7f/1b367f03faeca7953f4504fdcb0ee5bb.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* OVERLAY */}

      <div className="absolute inset-0 bg-black/60" />

      {/* CARD */}

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-gray-900/85 p-8 shadow-2xl backdrop-blur-md">

        {/* HEADER */}

        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20">

            <i className="fa-solid fa-lock text-2xl text-orange-400" />

          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            Create New Password
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-300">
            បង្កើត Password ថ្មីសម្រាប់គណនីរបស់អ្នក។
          </p>

        </div>

        {/* ACCOUNT */}

        <div className="mt-6 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3">

          <p className="text-xs text-gray-400">
            Account
          </p>

          <p className="mt-1 break-all text-sm font-medium text-gray-200">
            {email}
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300">

            <i className="fa-solid fa-circle-exclamation mr-2" />

            {error}

          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleResetPassword}
          className="mt-6 space-y-5"
        >

          {/* NEW PASSWORD */}

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-200">
              New Password
            </label>

            <div className="relative">

              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(
                    e.target.value
                  );
                  setError("");
                }}
                placeholder="Enter new password"
                className="w-full rounded-2xl border border-gray-600 bg-gray-800 px-5 py-3.5 pr-12 text-white outline-none placeholder:text-gray-500 transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />

              <i className="fa-solid fa-lock absolute right-5 top-1/2 -translate-y-1/2 text-gray-500" />

            </div>

          </div>

          {/* CONFIRM PASSWORD */}

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-200">
              Confirm New Password
            </label>

            <div className="relative">

              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(
                    e.target.value
                  );
                  setError("");
                }}
                placeholder="Confirm new password"
                className="w-full rounded-2xl border border-gray-600 bg-gray-800 px-5 py-3.5 pr-12 text-white outline-none placeholder:text-gray-500 transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />

              <i className="fa-solid fa-lock absolute right-5 top-1/2 -translate-y-1/2 text-gray-500" />

            </div>

          </div>

          {/* INFO */}

          <p className="text-xs leading-5 text-gray-400">
            Password ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ។
          </p>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={
              resetting ||
              newPassword.length < 6 ||
              confirmPassword.length < 6
            }
            className="w-full rounded-2xl bg-orange-500 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {resetting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2" />
                Resetting Password...
              </>
            ) : (
              <>
                <i className="fa-solid fa-key mr-2" />
                Reset Password
              </>
            )}

          </button>

        </form>

        {/* BACK */}

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