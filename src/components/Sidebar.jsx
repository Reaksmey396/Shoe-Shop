import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const navigation = [
  ["Home", "fa-house"],
  ["Category", "fa-table-cells-large"],
  ["Product", "fa-cube"],
  ["Order", "fa-clipboard-list"],
];

export default function Sidebar({ active, onActiveChange }) {
  const { logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ==========================================
  // OPEN LOGOUT MODAL
  // ==========================================

  const handleLogoutClick = () => {
    if (loggingOut) {
      return;
    }

    setShowLogoutModal(true);
  };

  // ==========================================
  // CANCEL LOGOUT
  // ==========================================

  const cancelLogout = () => {
    if (loggingOut) {
      return;
    }

    setShowLogoutModal(false);
  };

  // ==========================================
  // CONFIRM LOGOUT
  // ==========================================

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      await logout();

      setShowLogoutModal(false);

      console.log("Admin logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);

      alert(`Logout failed: ${error.message}`);

      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-slate-100 bg-white lg:flex">

        {/* ==========================================
            LOGO
        ========================================== */}

        <Link
          to="/admin"
          className="px-9 py-6 text-3xl font-extrabold tracking-[-1.5px] text-red-600"
        >
          SoleStyle
        </Link>

        {/* ==========================================
            NAVIGATION
        ========================================== */}

        <nav className="mt-6 space-y-2 px-[18px]">
          {navigation.map(([name, icon]) => (
            <button
              key={name}
              type="button"
              onClick={() => onActiveChange(name)}
              className={`flex w-full items-center gap-4 rounded-xl px-[18px] py-[14px] text-left text-[15px] font-medium transition ${
                active === name
                  ? "bg-red-50 text-red-500"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <i
                className={`fa-solid ${icon} w-4 text-lg ${
                  active === name
                    ? "text-red-500"
                    : "text-slate-500"
                }`}
              />

              {name}
            </button>
          ))}
        </nav>

        {/* ==========================================
            LOGOUT
        ========================================== */}

        <button
          type="button"
          onClick={handleLogoutClick}
          disabled={loggingOut}
          className="mt-auto flex items-center gap-4 px-9 py-10 text-left text-[15px] text-slate-700 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <i className="fa-solid fa-arrow-right-from-bracket text-slate-500" />

          Logout
        </button>
      </aside>

      {/* ==========================================
          LOGOUT CONFIRMATION MODAL
      ========================================== */}

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <i className="fa-solid fa-arrow-right-from-bracket" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Leave Account?
                </h2>

                <p className="text-xs text-slate-400">
                  Please confirm before logging out.
                </p>
              </div>

            </div>

            {/* ==========================================
                CONTENT
            ========================================== */}

            <div className="px-5 py-6">

              <p className="text-sm leading-6 text-slate-600">
                Do you want to leave from this account?
              </p>

              <div className="mt-4 rounded-xl bg-red-50 p-4">

                <div className="flex items-start gap-3">

                  <i className="fa-solid fa-circle-info mt-0.5 text-red-500" />

                  <p className="text-sm leading-5 text-red-600">
                    You will need to log in again to access
                    your admin account.
                  </p>

                </div>

              </div>

            </div>

            {/* ==========================================
                BUTTONS
            ========================================== */}

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 px-5 py-4">

              {/* CANCEL */}

              <button
                type="button"
                onClick={cancelLogout}
                disabled={loggingOut}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {loggingOut ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-arrow-right-from-bracket mr-2" />
                    Leave Account
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}