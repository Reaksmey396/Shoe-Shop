import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const navigation = [
  ["Home", "fa-house"],
  ["Category", "fa-table-cells-large"],
  ["Product", "fa-cube"],
  ["Order", "fa-clipboard-list"],
  ["User", "fa-users"],
];

export default function Sidebar({ active, onActiveChange }) {
  const { logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // =====================================================
  // CHANGE MENU
  // =====================================================

  const handleNavigation = (name) => {
    onActiveChange(name);
  };

  // =====================================================
  // OPEN LOGOUT MODAL
  // =====================================================

  const handleLogoutClick = () => {
    if (loggingOut) {
      return;
    }

    setShowLogoutModal(true);
  };

  // =====================================================
  // CANCEL LOGOUT
  // =====================================================

  const cancelLogout = () => {
    if (loggingOut) {
      return;
    }

    setShowLogoutModal(false);
  };

  // =====================================================
  // CONFIRM LOGOUT
  // =====================================================

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
      {/* =====================================================
          DESKTOP SIDEBAR
          Show on lg and above
      ===================================================== */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-100 bg-white lg:flex">

        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/admin"
          className="px-9 py-6 text-3xl font-extrabold tracking-[-1.5px] text-red-600"
        >
          SoleStyle
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav className="mt-6 space-y-2 px-[18px]">

          {navigation.map(([name, icon]) => (
            <button
              key={name}
              type="button"
              onClick={() => handleNavigation(name)}
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

        {/* =================================================
            DESKTOP LOGOUT
        ================================================= */}

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


      {/* =====================================================
          MOBILE + TABLET HEADER
          Show below lg
      ===================================================== */}

      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white lg:hidden">

        {/* =================================================
            TOP HEADER
        ================================================= */}

        <div className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6">

          {/* LOGO */}

          <Link
            to="/admin"
            className="text-xl font-extrabold tracking-[-1px] text-red-600 sm:text-2xl"
          >
            SoleStyle
          </Link>


          {/* LOGOUT ICON */}

          <button
            type="button"
            onClick={handleLogoutClick}
            disabled={loggingOut}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:w-9"
            title="Logout"
          >

            <i className="fa-solid fa-arrow-right-from-bracket text-sm sm:text-base" />

          </button>

        </div>


        {/* =================================================
            MOBILE / TABLET HORIZONTAL MENU
        ================================================= */}

        <div className="border-t border-slate-100">

          <nav
            className="
              flex
              items-center
              gap-1.5
              overflow-x-auto
              px-3
              py-2
              sm:justify-center
              sm:gap-2
              sm:px-5
            "
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >

            {navigation.map(([name, icon]) => (
              <button
                key={name}
                type="button"
                onClick={() => handleNavigation(name)}
                className={`
                  flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-lg
                  px-2.5
                  py-2
                  text-[10px]
                  font-medium
                  transition
                  sm:gap-2
                  sm:px-3.5
                  sm:py-2.5
                  sm:text-xs
                  md:px-4
                  md:text-sm
                  ${
                    active === name
                      ? "bg-red-50 text-red-500"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }
                `}
              >

                <i
                  className={`
                    fa-solid
                    ${icon}
                    text-[10px]
                    sm:text-xs
                    md:text-sm
                    ${
                      active === name
                        ? "text-red-500"
                        : "text-slate-400"
                    }
                  `}
                />

                <span>
                  {name}
                </span>

              </button>
            ))}

          </nav>

        </div>

      </div>


      {/* =====================================================
          SMALL LOGOUT MODAL
      ===================================================== */}

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">

          {/* =================================================
              MODAL
          ================================================= */}

          <div className="w-full max-w-[300px] overflow-hidden rounded-xl bg-white shadow-xl">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex items-center gap-2.5 px-4 py-3">

              {/* ICON */}

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">

                <i className="fa-solid fa-arrow-right-from-bracket text-xs" />

              </div>


              {/* TITLE */}

              <div className="min-w-0">

                <h2 className="text-sm font-bold text-slate-900">
                  Leave Account?
                </h2>

                <p className="text-[10px] text-slate-400">
                  Please confirm before logging out.
                </p>

              </div>

            </div>


            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="px-4 pb-3">

              <p className="text-[11px] leading-4 text-slate-600">
                Do you want to leave from this account?
              </p>


              {/* INFO */}

              <div className="mt-2.5 rounded-lg bg-red-50 px-3 py-2">

                <div className="flex items-start gap-2">

                  <i className="fa-solid fa-circle-info mt-0.5 shrink-0 text-[10px] text-red-500" />

                  <p className="text-[10px] leading-3.5 text-red-600">
                    You will need to log in again to access
                    your admin account.
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 px-4 py-3">

              {/* CANCEL */}

              <button
                type="button"
                onClick={cancelLogout}
                disabled={loggingOut}
                className="h-9 rounded-lg border border-slate-200 px-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>


              {/* LEAVE ACCOUNT */}

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="h-9 rounded-lg bg-red-600 px-2 text-[11px] font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >

                {loggingOut ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-1" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-arrow-right-from-bracket mr-1 text-[10px]" />
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