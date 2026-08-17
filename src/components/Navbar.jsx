import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import SiteSearch from "./SiteSearch";

const navItems = [
  { to: "/", label: "Home", icon: "fa-house" },
  { to: "/services", label: "Services", icon: "fa-cogs" },
  { to: "/about", label: "About", icon: "fa-info-circle" },
  { to: "/contact", label: "Contact", icon: "fa-envelope" },
];

const linkClass = ({ isActive }) =>
  `nav-link border-b-2 pb-1 hover:text-red-800 hover:border-b-red-600 ${
    isActive
      ? "text-red-800 border-b-red-600"
      : "border-transparent"
  }`;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { totalItems, setCartOpen } = useCart();
  const { user, logout } = useAuth();

  const openCart = () => {
    setCartOpen(true);
    setMobileOpen(false);
  };

  const handleLogoutClick = () => {
    if (loggingOut) {
      return;
    }

    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    if (loggingOut) {
      return;
    }

    setShowLogoutModal(false);
  };

  const confirmLogout = async () => {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      await logout();

      setShowLogoutModal(false);
      setMobileOpen(false);
    } catch (error) {
      console.error("Logout error:", error);

      alert(
        `Logout failed: ${
          error.message || "Unknown error"
        }`
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* =========================
          NAVBAR
      ========================= */}

      <aside className="fixed top-0 left-0 z-50 flex w-full items-center border-b border-red-100 bg-white/95 shadow-sm">

        <nav className="mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between px-5 md:px-6">

          {/* LOGO */}

          <Link
            to="/"
            className="text-clifford text-2xl font-bold md:text-3xl"
          >
            SoleStyle
          </Link>

          {/* =========================
              DESKTOP
          ========================= */}

          <div className="hidden items-center justify-center gap-6 lg:flex">

            {/* NAV LINKS */}

            <ul className="mt-1 flex items-center justify-center gap-8 text-sm font-medium text-gray-500">

              {navItems.map((item) => (
                <li key={item.to}>

                  <NavLink
                    to={item.to}
                    className={linkClass}
                    end={item.to === "/"}
                  >
                    {item.label}
                  </NavLink>

                </li>
              ))}

            </ul>

            {/* SEARCH */}

            <SiteSearch className="ml-auto w-72" />

            {/* CART */}

            <button
              type="button"
              onClick={openCart}
              className="shop-btn relative flex cursor-pointer items-center border-0 bg-transparent p-0"
              aria-label="Open cart products"
            >

              <i className="fa-solid fa-bag-shopping text-2xl text-red-500" />

              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-orange-500 text-center text-xs font-medium leading-5 text-white">
                {totalItems}
              </span>

            </button>

            {/* =========================
                AUTH
            ========================= */}

            {user ? (

              <button
                type="button"
                onClick={handleLogoutClick}
                className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200"
              >
                Log Out
              </button>

            ) : (

              <Link
                to="/login"
                className="rounded-md bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
              >
                Log In
              </Link>

            )}

          </div>

          {/* =========================
              MOBILE
          ========================= */}

          <div className="flex items-center gap-7 lg:hidden">

            <SiteSearch className="ml-auto hidden w-72 md:block" />

            {/* CART */}

            <button
              type="button"
              onClick={openCart}
              className="shop-btn relative flex cursor-pointer items-center border-0 bg-transparent p-0"
              aria-label="Open cart products"
            >

              <i className="fa-solid fa-bag-shopping text-2xl text-red-500" />

              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-orange-500 text-center text-xs font-medium leading-5 text-white">
                {totalItems}
              </span>

            </button>

            {/* MENU */}

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="border-0 bg-transparent p-0"
              aria-label="Open menu"
            >

              <i className="fa-solid fa-bars cursor-pointer text-3xl" />

            </button>

          </div>

        </nav>

      </aside>

      {/* =========================
          MOBILE MENU
      ========================= */}

      <div
        className={`fixed top-0 left-0 z-[60] h-screen w-[80%] max-w-xs bg-white shadow-lg ${
          mobileOpen ? "" : "hidden"
        }`}
      >

        <div className="p-6">

          {/* MOBILE HEADER */}

          <div className="flex items-center justify-between">

            <h1 className="text-clifford text-2xl font-bold">
              SoleStyle
            </h1>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="border-0 bg-transparent p-0"
              aria-label="Close menu"
            >

              <i className="fa-solid fa-xmark cursor-pointer text-2xl text-gray-700 hover:text-gray-500" />

            </button>

          </div>

          <hr className="my-4 border-red-200" />

          {/* MOBILE NAV */}

          <ul className="flex flex-col gap-2">

            {navItems.map((item) => (

              <li
                key={item.to}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-red-50 hover:text-red-600"
              >

                <i
                  className={`fa-solid ${item.icon}`}
                />

                <NavLink
                  to={item.to}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                >
                  {item.label}
                </NavLink>

              </li>

            ))}

          </ul>

          {/* =========================
              MOBILE AUTH
          ========================= */}

          {user ? (

            <button
              type="button"
              onClick={handleLogoutClick}
              className="mt-6 block w-full rounded-lg bg-gray-100 py-2 text-center text-gray-700 transition hover:bg-gray-200"
            >
              Log Out
            </button>

          ) : (

            <Link
              to="/login"
              onClick={() =>
                setMobileOpen(false)
              }
              className="mt-6 block w-full rounded-lg bg-blue-500 py-2 text-center text-white transition hover:bg-blue-600"
            >
              Log In
            </Link>

          )}

        </div>

      </div>

      {/* =========================
          LOGOUT MODAL
      ========================= */}

      {showLogoutModal && user && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">

                <i className="fa-solid fa-arrow-right-from-bracket" />

              </div>

              <h2 className="text-lg font-bold text-slate-900">
                Leave Account?
              </h2>

            </div>

            {/* =========================
                ONLY QUESTION
            ========================= */}

            <div className="px-5 py-7">

              <p className="text-center text-base font-medium text-slate-700">
                Do you want to leave from this account?
              </p>

            </div>

            {/* BUTTONS */}

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

              {/* LEAVE ACCOUNT */}

              <button
                type="button"
                onClick={confirmLogout}
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