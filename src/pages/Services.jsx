import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

const INITIAL_LIMIT = 6;

export default function Services() {
  const navigate = useNavigate();

  /*
  =========================================================
  AUTHENTICATION
  =========================================================
  */

  const { user } = useAuth();

  /*
  =========================================================
  STATE
  =========================================================
  */

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [activeFilter, setActiveFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  =========================================================
  LOGIN MODAL
  =========================================================
  */

  const [showLoginModal, setShowLoginModal] = useState(false);

  /*
  =========================================================
  LOAD PRODUCTS
  =========================================================
  */

  useEffect(() => {
    setLoading(true);
    setError("");

    /*
    If Firebase is not configured,
    stop here instead of crashing the page.
    */

    if (!db) {
      setError(
        "Firebase is not configured. Please check your Firebase settings."
      );

      setLoading(false);

      return;
    }

    const productsQuery = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeProducts = onSnapshot(
      productsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setProducts(data);
        setLoading(false);
      },

      (firebaseError) => {
        console.error(
          "Products Firebase error:",
          firebaseError
        );

        setError(
          "Unable to load services. Please check your Firebase connection."
        );

        setLoading(false);
      }
    );

    return () => unsubscribeProducts();
  }, []);

  /*
  =========================================================
  LOAD CATEGORIES
  =========================================================
  */

  useEffect(() => {
    if (!db) {
      return;
    }

    const unsubscribeCategories = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setCategories(data);
      },

      (firebaseError) => {
        console.error(
          "Categories Firebase error:",
          firebaseError
        );
      }
    );

    return () => unsubscribeCategories();
  }, []);

  /*
  =========================================================
  NORMALIZE PRODUCT DATA
  =========================================================
  */

  const normalizedProducts = useMemo(() => {
    return products.map((product) => {
      const category =
        product.category ||
        product.categoryName ||
        product.categoryTitle ||
        "General";

      const title =
        product.title ||
        product.name ||
        product.productName ||
        "Untitled Service";

      const description =
        product.description ||
        product.details ||
        product.shortDescription ||
        "No description available.";

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

      const time =
        product.time ||
        product.duration ||
        product.turnaround ||
        "3-5 Days";

      const features = Array.isArray(product.features)
        ? product.features
        : [];

      return {
        ...product,
        id: product.id,
        title,
        category,
        description,
        image,
        price,
        time,
        features,
      };
    });
  }, [products]);

  /*
  =========================================================
  CATEGORY FILTERS
  =========================================================
  */

  const filters = useMemo(() => {
    const categoryNames = [];

    /*
    Categories from Firebase categories collection
    */

    categories.forEach((category) => {
      const name =
        category.name ||
        category.title ||
        category.categoryName;

      if (name) {
        categoryNames.push(name);
      }
    });

    /*
    Also include categories from products
    */

    normalizedProducts.forEach((product) => {
      if (
        product.category &&
        product.category !== "General"
      ) {
        categoryNames.push(product.category);
      }
    });

    /*
    Remove duplicate categories
    */

    const uniqueCategories = [
      ...new Set(categoryNames),
    ];

    return [
      {
        key: "all",
        label: "All",
      },

      ...uniqueCategories.map((category) => ({
        key: category,
        label: category,
      })),
    ];
  }, [categories, normalizedProducts]);

  /*
  =========================================================
  FILTER PRODUCTS
  =========================================================
  */

  const filtered = useMemo(() => {
    if (activeFilter === "all") {
      return normalizedProducts;
    }

    return normalizedProducts.filter(
      (product) =>
        String(product.category).toLowerCase() ===
        String(activeFilter).toLowerCase()
    );
  }, [activeFilter, normalizedProducts]);

  /*
  =========================================================
  VISIBLE PRODUCTS
  =========================================================
  */

  const visible = showAll
    ? filtered
    : filtered.slice(0, INITIAL_LIMIT);

  const hasMore =
    filtered.length > INITIAL_LIMIT && !showAll;

  /*
  =========================================================
  BADGE COLORS
  =========================================================
  */

  const getBadgeColor = (category) => {
    const value = String(category || "").toLowerCase();

    if (value.includes("new")) {
      return "bg-blue-700";
    }

    if (
      value.includes("trend") ||
      value.includes("tranding")
    ) {
      return "bg-orange-600";
    }

    if (value.includes("modern")) {
      return "bg-gray-950";
    }

    return "bg-gray-950";
  };

  /*
  =========================================================
  PRICE FORMAT
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
        String(price).replace(/[^0-9.]/g, "")
      ) || 0;

    return `$${number.toFixed(2)}`;
  };

  /*
  =========================================================
  CHANGE FILTER
  =========================================================
  */

  const changeFilter = (filter) => {
    setActiveFilter(filter);
    setShowAll(false);
  };

  /*
  =========================================================
  HANDLE DETAIL
  =========================================================
  */

  const handleDetail = (serviceId) => {
    /*
    If user is NOT logged in,
    show login modal.
    */

    if (!user) {
      setShowLoginModal(true);
      return;
    }

    /*
    If user is logged in,
    go directly to service detail.
    */

    navigate(`/services/${serviceId}`);
  };

  /*
  =========================================================
  GO TO LOGIN
  =========================================================
  */

  const handleLogin = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  /*
  =========================================================
  RENDER
  =========================================================
  */

  return (
    <main className="pt-[72px] bg-[#f7f8fc] text-gray-950">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20">

          {/* HERO TEXT */}

          <div>
            <span className="inline-block bg-gray-950 px-3 py-1 text-[11px] font-bold uppercase text-white">
              Professional Care
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Elevate Your
              <br />
              Rotation.
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-gray-600 md:text-base">
              From deep industrial cleaning to bespoke
              artistic redesigns. We treat your footwear
              with technical precision and artisanal
              passion.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">

              <button
                type="button"
                onClick={() => navigate("/about")}
                className="inline-flex justify-center bg-orange-600 px-6 py-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-600"
              >
                Learn More
              </button>

              <a
                href="#services"
                className="inline-flex justify-center border border-gray-950 px-6 py-3 text-xs font-bold uppercase tracking-wide hover:bg-gray-950 hover:text-white"
              >
                View Services
              </a>

            </div>
          </div>

          {/* HERO IMAGE */}

          <img
            src="https://images.unsplash.com/photo-1607861716497-e65ab29fc7ac?auto=format&fit=crop&w=1000&q=80"
            alt="Sneaker cleaning and restoration workbench"
            className="aspect-[5/4] w-full object-cover shadow-xl"
          />

        </div>
      </section>

      {/* =====================================================
          SERVICES
      ===================================================== */}

      <section
        id="services"
        className="bg-white py-16 md:py-20"
      >
        <div className="mx-auto max-w-7xl px-6">

          {/* HEADER */}

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                Service Options
              </p>

              <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">
                Choose Your Sneaker Care
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
                Explore our services managed by our
                admin team. Every service below is loaded
                directly from our store database.
              </p>
            </div>

            {/* FILTERS */}

            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() =>
                    changeFilter(filter.key)
                  }
                  className={
                    activeFilter === filter.key
                      ? "bg-gray-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
                      : "border border-gray-300 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-700 hover:border-orange-600 hover:text-orange-600"
                  }
                >
                  {filter.label}
                </button>
              ))}
            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              <i className="fa-solid fa-circle-exclamation mr-2" />
              {error}
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center">

              <div className="text-center">

                <i className="fa-solid fa-spinner fa-spin text-3xl text-orange-600" />

                <p className="mt-4 text-sm text-gray-500">
                  Loading services...
                </p>

              </div>

            </div>
          ) : (
            <>

              {/* =============================================
                  PRODUCT GRID
              ============================================= */}

              {visible.length > 0 ? (
                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">

                  {visible.map((item) => (
                    <article
                      key={item.id}
                      className="group border border-gray-200 bg-[#f7f8fc] p-4 hover:border-orange-600"
                    >

                      {/* IMAGE */}

                      <div className="relative overflow-hidden bg-white">

                        <span
                          className={`absolute left-3 top-3 z-10 px-3 py-1 text-[10px] font-bold uppercase text-white ${getBadgeColor(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>

                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-56 w-full place-items-center bg-gray-100">

                            <div className="text-center">

                              <i className="fa-solid fa-image text-4xl text-gray-300" />

                              <p className="mt-2 text-xs text-gray-400">
                                No image
                              </p>

                            </div>

                          </div>
                        )}

                      </div>

                      {/* CONTENT */}

                      <div className="pt-5">

                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
                          {item.category}
                        </p>

                        <h3 className="mt-2 text-lg font-bold">
                          {item.title}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                          {item.description}
                        </p>

                        {/* PRICE + DETAIL */}

                        <div className="mt-5 flex items-center justify-between gap-3">

                          <p className="font-extrabold text-orange-600">
                            {formatPrice(item.price)}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              handleDetail(item.id)
                            }
                            className="inline-flex items-center gap-2 bg-gray-950 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-orange-600"
                          >
                            See Detail

                            <i className="fa-solid fa-arrow-right text-[10px]" />
                          </button>

                        </div>

                      </div>

                    </article>
                  ))}

                </div>
              ) : (

                /* =============================================
                   EMPTY
                ============================================= */

                <div className="mt-10 border border-gray-200 bg-[#f7f8fc] px-6 py-16 text-center">

                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gray-100">

                    <i className="fa-solid fa-box-open text-2xl text-gray-400" />

                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    No services found
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    There are currently no products in
                    this category.
                  </p>

                  {activeFilter !== "all" && (
                    <button
                      type="button"
                      onClick={() =>
                        changeFilter("all")
                      }
                      className="mt-6 bg-gray-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-orange-600"
                    >
                      View All Services
                    </button>
                  )}

                </div>
              )}

              {/* =================================================
                  SEE MORE
              ================================================= */}

              {hasMore && (
                <div className="mt-10 flex justify-center">

                  <button
                    type="button"
                    onClick={() =>
                      setShowAll(true)
                    }
                    className="inline-flex items-center gap-3 border border-gray-950 px-7 py-3 text-xs font-bold uppercase tracking-wide hover:bg-gray-950 hover:text-white"
                  >
                    See More

                    <i className="fa-solid fa-arrow-down" />
                  </button>

                </div>
              )}

              {/* =================================================
                  SHOW LESS
              ================================================= */}

              {showAll &&
                filtered.length > INITIAL_LIMIT && (
                  <div className="mt-10 flex justify-center">

                    <button
                      type="button"
                      onClick={() =>
                        setShowAll(false)
                      }
                      className="inline-flex items-center gap-3 border border-gray-950 px-7 py-3 text-xs font-bold uppercase tracking-wide hover:bg-gray-950 hover:text-white"
                    >
                      Show Less

                      <i className="fa-solid fa-arrow-up" />
                    </button>

                  </div>
                )}

            </>
          )}

        </div>
      </section>

      {/* =====================================================
          LOGIN REQUIRED MODAL
      ===================================================== */}

      {showLoginModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
          onClick={() =>
            setShowLoginModal(false)
          }
        >

          <div
            className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* ICON */}

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <i className="fa-solid fa-lock text-2xl text-orange-600" />
            </div>

            {/* TITLE */}

            <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-950">
              Login Required
            </h2>

            {/* MESSAGE */}

            <p className="mt-3 text-center text-sm leading-6 text-gray-600">
              Please login to your account before
              viewing the service details.
            </p>

            {/* BUTTONS */}

            <div className="mt-7 grid grid-cols-2 gap-3">

              {/* BACK */}

              <button
                type="button"
                onClick={() =>
                  setShowLoginModal(false)
                }
                className="border border-gray-300 px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-950 hover:bg-gray-950 hover:text-white"
              >
                Back
              </button>

              {/* LOGIN */}

              <button
                type="button"
                onClick={handleLogin}
                className="bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600"
              >
                Login
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}