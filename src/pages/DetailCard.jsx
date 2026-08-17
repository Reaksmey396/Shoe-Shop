import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { useCart } from "../context/CartContext";

export default function DetailCard() {
  const { serviceId } = useParams();
  const { addItem } = useCart();

  const [service, setService] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * First try to get the product/service directly
         * using its Firebase document ID.
         */
        const productRef = doc(db, "products", serviceId);
        const productSnap = await getDoc(productRef);

        let currentService = null;

        if (productSnap.exists()) {
          currentService = {
            id: productSnap.id,
            ...productSnap.data(),
          };
        }

        /*
         * If document ID was not found, search by
         * serviceId / productId / slug.
         */
        if (!currentService) {
          const productsSnap = await getDocs(
            collection(db, "products")
          );

          const found = productsSnap.docs.find((item) => {
            const data = item.data();

            return (
              data.serviceId === serviceId ||
              data.productId === serviceId ||
              data.slug === serviceId ||
              data.id === serviceId
            );
          });

          if (found) {
            currentService = {
              id: found.id,
              ...found.data(),
            };
          }
        }

        /*
         * If nothing is found.
         */
        if (!currentService) {
          setError("Service not found.");
          setService(null);
          setRelated([]);
          return;
        }

        /*
         * Normalize Firebase data so the DetailCard
         * can work even if Admin Product uses slightly
         * different field names.
         */
        const normalized = {
          id: currentService.id,

          title:
            currentService.title ||
            currentService.name ||
            currentService.productName ||
            "Untitled Service",

          description:
            currentService.description ||
            currentService.details ||
            currentService.shortDescription ||
            "No description available.",

          price:
            currentService.price ??
            currentService.unitPrice ??
            currentService.amount ??
            0,

          image:
            currentService.image ||
            currentService.imageUrl ||
            currentService.photoURL ||
            "",

          category:
            currentService.category ||
            currentService.categoryName ||
            "General",

          time:
            currentService.time ||
            currentService.duration ||
            currentService.turnaround ||
            "3-5 Days",

          features:
            Array.isArray(currentService.features)
              ? currentService.features
              : [
                  "Professional cleaning",
                  "Detailed restoration",
                  "Quality inspection",
                ],

          ...currentService,
        };

        setService(normalized);

        /*
         * Load other products from Admin Product.
         */
        const productsSnap = await getDocs(
          collection(db, "products")
        );

        const otherProducts = productsSnap.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .filter((item) => item.id !== currentService.id)
          .slice(0, 3)
          .map((item) => ({
            id: item.id,

            title:
              item.title ||
              item.name ||
              item.productName ||
              "Untitled Service",

            description:
              item.description ||
              item.details ||
              "No description available.",

            price:
              item.price ??
              item.unitPrice ??
              item.amount ??
              0,

            image:
              item.image ||
              item.imageUrl ||
              item.photoURL ||
              "",

            category:
              item.category ||
              item.categoryName ||
              "General",

            time:
              item.time ||
              item.duration ||
              item.turnaround ||
              "3-5 Days",

            features: Array.isArray(item.features)
              ? item.features
              : [],
          }));

        setRelated(otherProducts);
      } catch (firebaseError) {
        console.error(
          "DetailCard Firebase error:",
          firebaseError
        );

        setError(
          "Unable to load service information."
        );
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen pt-[72px] bg-[#f7f8fc] text-gray-950">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-orange-600" />

            <p className="mt-4 text-sm text-gray-500">
              Loading service...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (!service) {
    return (
      <main className="min-h-screen pt-[72px] bg-[#f7f8fc] text-gray-950">
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-red-50">
              <i className="fa-solid fa-circle-exclamation text-3xl text-red-500" />
            </div>

            <h1 className="mt-6 text-3xl font-extrabold">
              Service Not Found
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              {error || "This service does not exist."}
            </p>

            <Link
              to="/services"
              className="mt-8 inline-flex bg-orange-600 px-7 py-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-600"
            >
              Back to Services
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /* =========================================================
     PRICE
  ========================================================= */

  const numericPrice =
    Number(
      String(service.price).replace(
        /[^0-9.]/g,
        ""
      )
    ) || 0;

  const displayPrice =
    typeof service.price === "string" &&
    service.price.includes("$")
      ? service.price
      : `$${numericPrice.toFixed(2)}`;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="pt-[72px] bg-[#f7f8fc] text-gray-950">
      {/* =====================================================
          BACK
      ===================================================== */}

      <section className="py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <Link
            to="/services"
            className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-red-700 hover:text-orange-600"
          >
            <i className="fa-solid fa-arrow-left" />
            Back to Services
          </Link>
        </div>
      </section>

      {/* =====================================================
          DETAIL
      ===================================================== */}

      <section className="pb-16 md:pb-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-6 lg:grid-cols-2 lg:gap-16">
          {/* IMAGE */}

          <div className="bg-white p-4 shadow-sm">
            <div className="relative overflow-hidden bg-gray-100">
              <span className="absolute left-4 top-4 z-10 bg-gray-950 px-4 py-2 text-xs font-bold uppercase text-white">
                {service.category}
              </span>

              {service.image ? (
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-[360px] w-full object-cover md:h-[560px]"
                />
              ) : (
                <div className="flex h-[360px] items-center justify-center bg-gray-100 md:h-[560px]">
                  <div className="text-center">
                    <i className="fa-solid fa-image text-5xl text-gray-300" />

                    <p className="mt-3 text-sm text-gray-400">
                      No image available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* INFORMATION */}

          <div className="lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
              Service Detail
            </p>

            <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-6xl">
              {service.title}
            </h1>

            <p className="mt-6 text-sm leading-7 text-gray-600 md:text-base">
              {service.description}
            </p>

            {/* PRICE / TIME */}

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="border border-orange-100 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Starting Price
                </p>

                <p className="mt-2 text-3xl font-extrabold text-orange-600">
                  {displayPrice}
                </p>
              </div>

              <div className="border border-orange-100 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Turnaround
                </p>

                <p className="mt-2 text-2xl font-extrabold">
                  {service.time}h
                </p>
              </div>
            </div>

            {/* FEATURES */}

            <div className="mt-8 border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold">
                What is included
              </h2>

              {service.features.length > 0 ? (
                <ul className="mt-5 space-y-4 text-sm text-gray-700">
                  {service.features.map(
                    (feature, index) => (
                      <li
                        key={`${feature}-${index}`}
                        className="flex gap-3"
                      >
                        <i className="fa-regular fa-circle-check mt-1 text-orange-600" />

                        <span>{feature}</span>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="mt-5 text-sm text-gray-500">
                  Service details will be provided by
                  our team.
                </p>
              )}
            </div>

            {/* ACTIONS */}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  addItem(service, service.id)
                }
                className="inline-flex justify-center bg-orange-600 px-8 py-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-600"
              >
                <i className="fa-solid fa-cart-plus mr-2" />
                Add To Cart
              </button>

              <Link
                to="/services"
                className="inline-flex justify-center border border-gray-950 px-8 py-3 text-xs font-bold uppercase tracking-wide hover:bg-gray-950 hover:text-white"
              >
                Compare Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          RELATED PRODUCTS
      ===================================================== */}

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                Recommended
              </p>

              <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">
                More Service Cards
              </h2>
            </div>

            <Link
              to="/services"
              className="text-sm font-bold uppercase tracking-wide text-red-700 hover:text-orange-600"
            >
              View All
            </Link>
          </div>

          {related.length === 0 ? (
            <div className="mt-10 border border-gray-200 bg-[#f7f8fc] p-10 text-center">
              <i className="fa-solid fa-box-open text-3xl text-gray-300" />

              <p className="mt-3 text-sm text-gray-500">
                No other services available.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((item) => (
                <article
                  key={item.id}
                  className="group border border-gray-200 bg-[#f7f8fc] p-4 hover:border-orange-600"
                >
                  <Link
                    to={`/services/${item.id}`}
                  >
                    <div className="relative overflow-hidden bg-white">
                      <span className="absolute left-3 top-3 z-10 bg-gray-950 px-3 py-1 text-[10px] font-bold uppercase text-white">
                        {item.category}
                      </span>

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-52 items-center justify-center bg-gray-100">
                          <i className="fa-solid fa-image text-3xl text-gray-300" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="pt-5">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-orange-600">
                      {item.category}
                    </p>

                    <h3 className="mt-2 text-lg font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {item.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="font-extrabold text-orange-600">
                        {typeof item.price ===
                          "string" &&
                        item.price.includes("$")
                          ? item.price
                          : `$${(
                              Number(item.price) ||
                              0
                            ).toFixed(2)}`}
                      </p>

                      <Link
                        to={`/services/${item.id}`}
                        className="text-xs font-bold uppercase text-gray-950 hover:text-orange-600"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}