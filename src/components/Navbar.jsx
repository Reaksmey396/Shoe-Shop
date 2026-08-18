import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

/*
=========================================================
NAV ITEMS
=========================================================
*/

const navItems = [
  {
    to: "/",
    label: "Home",
    icon: "fa-house",
  },
  {
    to: "/services",
    label: "Services",
    icon: "fa-cogs",
  },
  {
    to: "/about",
    label: "About",
    icon: "fa-info-circle",
  },
  {
    to: "/contact",
    label: "Contact",
    icon: "fa-envelope",
  },
];

/*
=========================================================
NAV LINK STYLE
=========================================================
*/

const linkClass = ({ isActive }) =>
  `nav-link border-b-2 pb-1 hover:text-red-800 hover:border-b-red-600 ${
    isActive
      ? "text-red-800 border-b-red-600"
      : "border-transparent"
  }`;

/*
=========================================================
NAVBAR
=========================================================
*/

export default function Navbar() {
  const navigate = useNavigate();

  /*
  =======================================================
  NAVBAR STATE
  =======================================================
  */

  const [mobileOpen, setMobileOpen] = useState(false);

  /*
  =======================================================
  LOGOUT STATE
  =======================================================
  */

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  /*
  =======================================================
  SEARCH STATE
  =======================================================
  */

  const [search, setSearch] = useState("");

  const [products, setProducts] = useState([]);

  const [searchLoading, setSearchLoading] =
    useState(true);

  const searchRef = useRef(null);

  /*
  =======================================================
  ORDER NOTIFICATION STATE
  =======================================================
  */

  const [showOrderHistory, setShowOrderHistory] =
    useState(false);

  const [orders, setOrders] = useState([]);

  const [ordersLoading, setOrdersLoading] =
    useState(false);

  const [ordersError, setOrdersError] =
    useState("");

  /*
  =======================================================
  CART + AUTH
  =======================================================
  */

  const { totalItems, setCartOpen } = useCart();

  const { user, logout } = useAuth();

  /*
  =========================================================
  LOAD PRODUCTS FROM FIREBASE
  =========================================================
  */

  useEffect(() => {
    if (!db) {
      setProducts([]);
      setSearchLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "products"),

      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setProducts(data);
        setSearchLoading(false);
      },

      (error) => {
        console.error(
          "Navbar search Firebase error:",
          error
        );

        setProducts([]);
        setSearchLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /*
  =========================================================
  LOAD USER ORDERS FROM FIREBASE
  =========================================================

  IMPORTANT:

  Your orders should contain:

  userId: user.uid

  This allows each logged-in customer to see
  only their own order history.
  =========================================================
  */

  useEffect(() => {
    if (!user || !db) {
      setOrders([]);
      setOrdersLoading(false);
      setOrdersError("");
      return;
    }

    setOrdersLoading(true);
    setOrdersError("");

    const ordersQuery = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      ordersQuery,

      (snapshot) => {
        const orderData = snapshot.docs.map(
          (item) => ({
            id: item.id,
            ...item.data(),
          })
        );

        /*
        Newest orders first
        */

        orderData.sort((a, b) => {
          const dateA =
            a.createdAt?.toMillis?.() || 0;

          const dateB =
            b.createdAt?.toMillis?.() || 0;

          return dateB - dateA;
        });

        setOrders(orderData);
        setOrdersLoading(false);
        setOrdersError("");
      },

      (error) => {
        console.error(
          "Navbar orders Firebase error:",
          error
        );

        setOrders([]);
        setOrdersLoading(false);

        setOrdersError(
          error.message ||
            "Cannot load order history."
        );
      }
    );

    return () => unsubscribe();
  }, [user]);

  /*
  =========================================================
  NORMALIZE PRODUCTS
  =========================================================
  */

  const normalizedProducts = useMemo(() => {
    return products.map((product) => {
      const title =
        product.title ||
        product.name ||
        product.productName ||
        "Untitled Product";

      const description =
        product.description ||
        product.details ||
        product.shortDescription ||
        "";

      const category =
        product.category ||
        product.categoryName ||
        product.categoryTitle ||
        "General";

      const image =
        product.image ||
        product.imageUrl ||
        product.photoURL ||
        product.thumbnail ||
        "";

      const price =
        product.price ??
        product.unitPrice ??
        product.amount ??
        0;

      return {
        ...product,
        id: product.id,
        title,
        description,
        category,
        image,
        price,
      };
    });
  }, [products]);

  /*
  =========================================================
  SEARCH RESULTS
  =========================================================
  */

  const searchResults = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return normalizedProducts.filter((product) => {
      const title = String(
        product.title || ""
      ).toLowerCase();

      const description = String(
        product.description || ""
      ).toLowerCase();

      const category = String(
        product.category || ""
      ).toLowerCase();

      return (
        title.includes(value) ||
        description.includes(value) ||
        category.includes(value)
      );
    });
  }, [search, normalizedProducts]);

  /*
  =========================================================
  FORMAT PRICE
  =========================================================
  */

  const formatPrice = (price) => {
    if (
      typeof price === "string" &&
      price.includes("$")
    ) {
      return price;
    }

    const number =
      Number(
        String(price).replace(
          /[^0-9.]/g,
          ""
        )
      ) || 0;

    return `$${number.toFixed(2)}`;
  };

  /*
  =========================================================
  FORMAT ORDER DATE
  =========================================================
  */

  const formatOrderDate = (timestamp) => {
    if (!timestamp) {
      return "Date unavailable";
    }

    try {
      let date;

      if (
        typeof timestamp.toDate === "function"
      ) {
        date = timestamp.toDate();
      } else if (
        timestamp instanceof Date
      ) {
        date = timestamp;
      } else if (
        typeof timestamp === "number"
      ) {
        date = new Date(timestamp);
      } else if (
        typeof timestamp === "string"
      ) {
        date = new Date(timestamp);
      } else {
        return "Date unavailable";
      }

      if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
      }

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error(
        "ORDER DATE FORMAT ERROR:",
        error
      );

      return "Date unavailable";
    }
  };

  /*
  =========================================================
  ORDER STATUS STYLE
  =========================================================
  */

  const getOrderStatusClass = (status) => {
    const value = String(
      status || "pending"
    ).toLowerCase();

    if (
      value === "completed" ||
      value === "complete" ||
      value === "delivered"
    ) {
      return "bg-emerald-50 text-emerald-600";
    }

    if (
      value === "cancelled" ||
      value === "canceled" ||
      value === "rejected"
    ) {
      return "bg-red-50 text-red-600";
    }

    if (
      value === "processing" ||
      value === "in progress"
    ) {
      return "bg-blue-50 text-blue-600";
    }

    return "bg-amber-50 text-amber-600";
  };

  /*
  =========================================================
  ORDER STATUS TEXT
  =========================================================
  */

  const getOrderStatusText = (status) => {
    if (!status) {
      return "Pending";
    }

    return String(status)
      .charAt(0)
      .toUpperCase() +
      String(status).slice(1);
  };

  /*
  =========================================================
  OPEN CART
  =========================================================
  */

  const openCart = () => {
    setCartOpen(true);
    setMobileOpen(false);
    setSearch("");
    setShowOrderHistory(false);
  };

  /*
  =========================================================
  OPEN ORDER HISTORY
  =========================================================
  */

  const openOrderHistory = () => {
    setShowOrderHistory(true);
    setMobileOpen(false);
    setSearch("");
  };

  /*
  =========================================================
  CLOSE ORDER HISTORY
  =========================================================
  */

  const closeOrderHistory = () => {
    setShowOrderHistory(false);
  };

  /*
  =========================================================
  OPEN PRODUCT FROM SEARCH
  =========================================================
  */

  const openProduct = (productId) => {
    setSearch("");
    setMobileOpen(false);

    navigate(`/services/${productId}`);
  };

  /*
  =========================================================
  CLEAR SEARCH
  =========================================================
  */

  const clearSearch = () => {
    setSearch("");
  };

  /*
  =========================================================
  LOGOUT
  =========================================================
  */

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
      setShowOrderHistory(false);
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      alert(
        `Logout failed: ${
          error.message ||
          "Unknown error"
        }`
      );
    } finally {
      setLoggingOut(false);
    }
  };

  /*
  =========================================================
  RENDER
  =========================================================
  */

  return (
    <>
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <aside className="fixed left-0 top-0 z-50 flex w-full items-center border-b border-red-100 bg-white/95 shadow-sm backdrop-blur">

        <nav className="mx-auto flex min-h-[72px] w-full max-w-7xl items-center justify-between px-5 md:px-6">

          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            to="/"
            onClick={() => setSearch("")}
            className="text-clifford text-2xl font-bold md:text-3xl"
          >
            SoleStyle
          </Link>

          {/* =================================================
              DESKTOP
          ================================================= */}

          <div className="hidden items-center justify-center gap-6 lg:flex">

            {/* ===============================================
                NAV LINKS
            =============================================== */}

            <ul className="mt-1 flex items-center justify-center gap-8 text-sm font-medium text-gray-500">

              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={linkClass}
                    end={item.to === "/"}
                    onClick={() =>
                      setSearch("")
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}

            </ul>

            {/* ===============================================
                SEARCH
            =============================================== */}

            <div
              ref={searchRef}
              className="relative ml-auto w-72"
            >

              <div className="relative">

                <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search products..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-9 text-sm font-sans text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white"
                />

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    aria-label="Clear search"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}

              </div>

              {/* =============================================
                  SEARCH RESULTS
              ============================================= */}

              {search.trim() && (
                <div className="absolute left-0 right-0 top-full z-[200] mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white font-sans shadow-2xl">

                  {searchLoading ? (
                    <div className="px-5 py-7 text-center">

                      <i className="fa-solid fa-spinner fa-spin text-xl text-orange-600" />

                      <p className="mt-2 text-xs font-medium text-gray-500">
                        Searching products...
                      </p>

                    </div>
                  ) : searchResults.length >
                    0 ? (
                    <div className="max-h-[420px] overflow-y-auto">

                      {searchResults.map(
                        (product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() =>
                              openProduct(
                                product.id
                              )
                            }
                            className="flex w-full gap-3 border-b border-gray-100 p-3 text-left font-sans transition last:border-b-0 hover:bg-gray-50"
                          >

                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">

                              {product.image ? (
                                <img
                                  src={
                                    product.image
                                  }
                                  alt={
                                    product.title
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="grid h-full w-full place-items-center">
                                  <i className="fa-solid fa-image text-xl text-gray-300" />
                                </div>
                              )}

                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="truncate text-sm font-bold text-gray-900">
                                {
                                  product.title
                                }
                              </p>

                              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                                {
                                  product.category
                                }
                              </p>

                              <p className="mt-1 text-sm font-bold text-orange-600">
                                {formatPrice(
                                  product.price
                                )}
                              </p>

                            </div>

                            <div className="flex items-center">

                              <i className="fa-solid fa-chevron-right text-xs text-gray-400" />

                            </div>

                          </button>
                        )
                      )}

                    </div>
                  ) : (
                    <div className="px-5 py-8 text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">

                        <i className="fa-solid fa-box-open text-xl text-gray-400" />

                      </div>

                      <p className="mt-3 text-sm font-bold text-gray-800">
                        No products found
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        No product matching "
                        {search}" exists on
                        this website.
                      </p>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* ===============================================
                NOTIFICATION
            =============================================== */}

            <button
              type="button"
              onClick={openOrderHistory}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-gray-600 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Order history"
              title="Order history"
            >

              <i className="fa-solid fa-bell text-xl" />

              {/* NOTIFICATION NUMBER */}

              {orders.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                  {orders.length >
                  99
                    ? "99+"
                    : orders.length}
                </span>
              )}

            </button>

            {/* ===============================================
                CART / ORDER ICON
            =============================================== */}

            <button
              type="button"
              onClick={openCart}
              className="shop-btn relative flex cursor-pointer items-center border-0 bg-transparent p-0"
              aria-label="Open cart products"
              title="Cart"
            >

              <i className="fa-solid fa-bag-shopping text-2xl text-red-500" />

              <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-orange-500 text-center text-xs font-medium leading-5 text-white">
                {totalItems}
              </span>

            </button>

            {/* ===============================================
                AUTH
            =============================================== */}

            {user ? (
              <button
                type="button"
                onClick={
                  handleLogoutClick
                }
                className="rounded-md bg-gray-100 px-4 py-2 font-sans text-sm font-medium text-gray-700 transition hover:bg-gray-200"
              >
                Log Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() =>
                  setSearch("")
                }
                className="rounded-md bg-blue-600 px-6 py-2 font-sans text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Log In
              </Link>
            )}

          </div>

          {/* =================================================
              MOBILE
          ================================================= */}

          <div className="flex items-center gap-5 lg:hidden">

            {/* ===============================================
                MOBILE SEARCH
            =============================================== */}

            <div className="relative hidden w-72 md:block">

              <div className="relative">

                <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search products..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-9 text-sm font-sans text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white"
                />

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    aria-label="Clear search"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}

              </div>

              {/* MOBILE SEARCH RESULTS */}

              {search.trim() && (
                <div className="absolute right-0 top-full z-[200] mt-2 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white font-sans shadow-2xl">

                  {searchLoading ? (
                    <div className="px-5 py-7 text-center">

                      <i className="fa-solid fa-spinner fa-spin text-xl text-orange-600" />

                      <p className="mt-2 text-xs font-medium text-gray-500">
                        Searching products...
                      </p>

                    </div>
                  ) : searchResults.length >
                    0 ? (
                    <div className="max-h-[420px] overflow-y-auto">

                      {searchResults.map(
                        (product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() =>
                              openProduct(
                                product.id
                              )
                            }
                            className="flex w-full gap-3 border-b border-gray-100 p-3 text-left font-sans transition last:border-b-0 hover:bg-gray-50"
                          >

                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">

                              {product.image ? (
                                <img
                                  src={
                                    product.image
                                  }
                                  alt={
                                    product.title
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="grid h-full w-full place-items-center">
                                  <i className="fa-solid fa-image text-lg text-gray-300" />
                                </div>
                              )}

                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="truncate text-sm font-bold text-gray-900">
                                {
                                  product.title
                                }
                              </p>

                              <p className="mt-1 text-[10px] font-bold uppercase text-orange-600">
                                {
                                  product.category
                                }
                              </p>

                              <p className="mt-1 text-sm font-bold text-orange-600">
                                {formatPrice(
                                  product.price
                                )}
                              </p>

                            </div>

                          </button>
                        )
                      )}

                    </div>
                  ) : (
                    <div className="px-5 py-8 text-center">

                      <i className="fa-solid fa-box-open text-xl text-gray-400" />

                      <p className="mt-3 text-sm font-bold text-gray-800">
                        No products found
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        This product does
                        not exist on this
                        website.
                      </p>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* ===============================================
                MOBILE NOTIFICATION
            =============================================== */}

            <button
              type="button"
              onClick={
                openOrderHistory
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-gray-600 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Order history"
              title="Order history"
            >

              <i className="fa-solid fa-bell text-xl" />

              {orders.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                  {orders.length >
                  99
                    ? "99+"
                    : orders.length}
                </span>
              )}

            </button>

            {/* ===============================================
                MOBILE CART
            =============================================== */}

            <button
              type="button"
              onClick={openCart}
              className="shop-btn relative flex cursor-pointer items-center border-0 bg-transparent p-0"
              aria-label="Open cart products"
              title="Cart"
            >

              <i className="fa-solid fa-bag-shopping text-2xl text-red-500" />

              <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-orange-500 text-center text-xs font-medium leading-5 text-white">
                {totalItems}
              </span>

            </button>

            {/* ===============================================
                MOBILE MENU
            =============================================== */}

            <button
              type="button"
              onClick={() =>
                setMobileOpen(true)
              }
              className="border-0 bg-transparent p-0"
              aria-label="Open menu"
            >

              <i className="fa-solid fa-bars cursor-pointer text-3xl" />

            </button>

          </div>

        </nav>

      </aside>

      {/* =====================================================
          ORDER HISTORY OVERLAY
      ===================================================== */}

      {showOrderHistory && (
        <div
          className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[1px]"
          onClick={closeOrderHistory}
        />
      )}

      {/* =====================================================
          ORDER HISTORY SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed right-0 top-0 z-[90] flex h-screen w-full max-w-md flex-col bg-white font-sans shadow-2xl transition-transform duration-300 ${
          showOrderHistory
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >

        {/* =================================================
            SIDEBAR HEADER
        ================================================= */}

        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">

              <i className="fa-solid fa-bell text-lg" />

            </div>

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Order History
              </h2>

              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Your orders and order status
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={closeOrderHistory}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close order history"
          >

            <i className="fa-solid fa-xmark text-xl" />

          </button>

        </div>

        {/* =================================================
            SIDEBAR CONTENT
        ================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-4">

          {/* NOT LOGGED IN */}

          {!user && (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">

                <i className="fa-solid fa-lock text-2xl text-slate-300" />

              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-800">
                Login Required
              </h3>

              <p className="mt-2 max-w-xs text-sm font-medium leading-6 text-slate-500">
                Please login to see your
                order history.
              </p>

              <Link
                to="/login"
                onClick={() =>
                  setShowOrderHistory(false)
                }
                className="mt-5 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Log In
              </Link>

            </div>
          )}

          {/* LOADING */}

          {user && ordersLoading && (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

              <i className="fa-solid fa-spinner fa-spin text-2xl text-red-500" />

              <p className="mt-3 text-sm font-medium text-slate-500">
                Loading your orders...
              </p>

            </div>
          )}

          {/* ERROR */}

          {user &&
            !ordersLoading &&
            ordersError && (
              <div className="rounded-xl border border-red-100 bg-white p-5 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">

                  <i className="fa-solid fa-triangle-exclamation text-red-500" />

                </div>

                <h3 className="mt-3 text-sm font-semibold text-slate-800">
                  Cannot load orders
                </h3>

                <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
                  {ordersError}
                </p>

              </div>
            )}

          {/* EMPTY */}

          {user &&
            !ordersLoading &&
            !ordersError &&
            orders.length === 0 && (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">

                  <i className="fa-solid fa-box-open text-2xl text-slate-300" />

                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-800">
                  No Orders Yet
                </h3>

                <p className="mt-2 max-w-xs text-sm font-medium leading-6 text-slate-500">
                  You have not placed any
                  orders yet.
                </p>

                <Link
                  to="/services"
                  onClick={() =>
                    setShowOrderHistory(false)
                  }
                  className="mt-5 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  Browse Services
                </Link>

              </div>
            )}

          {/* =================================================
              ORDER LIST
          ================================================= */}

          {user &&
            !ordersLoading &&
            !ordersError &&
            orders.length > 0 && (
              <div className="space-y-4">

                {orders.map((order) => {

                  /*
                  Get product name
                  */

                  const productName =
                    order.productName ||
                    order.product ||
                    order.name ||
                    "Service Order";

                  /*
                  Get category
                  */

                  const productCategory =
                    order.productCategory ||
                    order.category ||
                    "General";

                  /*
                  Get service plan
                  */

                  const servicePlan =
                    order.servicePlan ||
                    "Free";

                  /*
                  Get total
                  */

                  const totalPrice =
                    order.totalPrice ??
                    0;

                  /*
                  Get phone
                  */

                  const phone =
                    order.customerPhone ||
                    order.phoneNumber ||
                    order.phone ||
                    "-";

                  /*
                  Get location
                  */

                  const location =
                    order.location ||
                    "-";

                  /*
                  Get quantity
                  */

                  const quantity =
                    order.quantity || 1;

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                    >

                      {/* =================================
                          ORDER TOP
                      ================================= */}

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-2">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">

                              <i className="fa-solid fa-bag-shopping text-sm" />

                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-slate-900">
                                {productName}
                              </p>

                              <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                                {productCategory}
                              </p>

                            </div>

                          </div>

                        </div>

                        <span
                          className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] font-semibold ${getOrderStatusClass(
                            order.status
                          )}`}
                        >
                          {getOrderStatusText(
                            order.status
                          )}
                        </span>

                      </div>

                      {/* =================================
                          ORDER ID
                      ================================= */}

                      <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2">

                        <div className="flex items-center justify-between gap-3">

                          <span className="shrink-0 text-[11px] font-medium text-slate-400">
                            Order ID
                          </span>

                          <span className="min-w-0 truncate text-right text-[11px] font-semibold text-slate-600">
                            {order.id}
                          </span>

                        </div>

                      </div>

                      {/* =================================
                          ORDER INFORMATION
                      ================================= */}

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        {/* PLAN */}

                        <div>

                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Plan
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                            {servicePlan}
                          </p>

                        </div>

                        {/* QUANTITY */}

                        <div>

                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Quantity
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {quantity}
                          </p>

                        </div>

                        {/* PHONE */}

                        <div>

                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Phone
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                            {phone}
                          </p>

                        </div>

                        {/* TOTAL */}

                        <div>

                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Total
                          </p>

                          <p className="mt-1 text-sm font-bold text-red-500">
                            {formatPrice(
                              totalPrice
                            )}
                          </p>

                        </div>

                      </div>

                      {/* =================================
                          LOCATION
                      ================================= */}

                      <div className="mt-4">

                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Location
                        </p>

                        <div className="mt-1 flex items-start gap-2">

                          <i className="fa-solid fa-location-dot mt-0.5 text-xs text-red-400" />

                          <p className="text-sm font-medium leading-5 text-slate-700">
                            {location}
                          </p>

                        </div>

                      </div>

                      {/* =================================
                          NOTE
                      ================================= */}

                      {order.note && (
                        <div className="mt-4">

                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Note
                          </p>

                          <p className="mt-1 rounded-lg bg-slate-50 p-3 text-xs font-medium leading-5 text-slate-600">
                            {order.note}
                          </p>

                        </div>
                      )}

                      {/* =================================
                          DATE
                      ================================= */}

                      <div className="mt-4 border-t border-slate-100 pt-3">

                        <div className="flex items-center gap-2">

                          <i className="fa-regular fa-clock text-xs text-slate-400" />

                          <p className="text-[11px] font-medium text-slate-400">
                            {formatOrderDate(
                              order.createdAt
                            )}
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

        </div>

        {/* =================================================
            SIDEBAR FOOTER
        ================================================= */}

        {user && orders.length > 0 && (
          <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Total Orders
                </p>

                <p className="mt-0.5 text-base font-semibold text-slate-800">
                  {orders.length}
                </p>

              </div>

              <Link
                to="/services"
                onClick={() =>
                  setShowOrderHistory(false)
                }
                className="rounded-lg bg-red-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-600"
              >
                New Order
              </Link>

            </div>

          </div>
        )}

      </aside>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      <div
        className={`fixed left-0 top-0 z-[60] h-screen w-[80%] max-w-xs bg-white font-sans shadow-lg ${
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
              onClick={() =>
                setMobileOpen(false)
              }
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
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
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

          {/* =================================================
              MOBILE ORDER HISTORY BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={openOrderHistory}
            className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600"
          >

            <span className="relative flex h-5 w-5 items-center justify-center">

              <i className="fa-solid fa-bell" />

              {orders.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                  {orders.length >
                  99
                    ? "99+"
                    : orders.length}
                </span>
              )}

            </span>

            <span>
              Order History
            </span>

          </button>

          {/* =================================================
              MOBILE AUTH
          ================================================= */}

          {user ? (

            <button
              type="button"
              onClick={
                handleLogoutClick
              }
              className="mt-6 block w-full rounded-lg bg-gray-100 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
              Log Out
            </button>

          ) : (

            <Link
              to="/login"
              onClick={() =>
                setMobileOpen(false)
              }
              className="mt-6 block w-full rounded-lg bg-blue-500 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-600"
            >
              Log In
            </Link>

          )}

        </div>

      </div>

      {/* =====================================================
          LOGOUT MODAL
      ===================================================== */}

      {showLogoutModal && user && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-sm rounded-2xl bg-white font-sans shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">

                <i className="fa-solid fa-arrow-right-from-bracket" />

              </div>

              <h2 className="text-lg font-bold text-slate-900">
                Leave Account?
              </h2>

            </div>

            {/* QUESTION */}

            <div className="px-5 py-7">

              <p className="text-center text-base font-medium text-slate-700">
                Do you want to leave from
                this account?
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