import { useEffect, useMemo, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

import Sidebar from "../components/Sidebar";
import AdminCategories from "./AdminCategories";
import AdminOrder from "./AdminOrder";
import AdminProduct from "./AdminProduct";

/* =========================================================
   HELPERS
========================================================= */

const money = (value) => {
  const number = Number(value) || 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(number);
};

const numberFormat = (value) => {
  return new Intl.NumberFormat("en-US").format(
    Number(value) || 0
  );
};

const getOrderTotal = (order) => {
  return Number(
    order.total ??
      order.totalPrice ??
      order.grandTotal ??
      order.amount ??
      order.price ??
      0
  );
};

const getOrderCustomer = (order) => {
  return (
    order.customerName ||
    order.customer ||
    order.userName ||
    order.name ||
    order.email ||
    "Unknown Customer"
  );
};

const getOrderStatus = (order) => {
  const status = String(
    order.status || "Pending"
  );

  const normalized = status.toLowerCase();

  if (normalized === "completed") {
    return "Completed";
  }

  if (normalized === "processing") {
    return "Processing";
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return "Cancelled";
  }

  return "Pending";
};

const getOrderDate = (order) => {
  if (!order.createdAt) {
    return null;
  }

  if (
    typeof order.createdAt.toDate ===
    "function"
  ) {
    return order.createdAt.toDate();
  }

  if (order.createdAt instanceof Date) {
    return order.createdAt;
  }

  if (typeof order.createdAt === "string") {
    const date = new Date(
      order.createdAt
    );

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  if (typeof order.createdAt === "number") {
    return new Date(order.createdAt);
  }

  return null;
};

const formatDate = (order) => {
  const date = getOrderDate(order);

  if (!date) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
};

const formatDateTime = (order) => {
  const date = getOrderDate(order);

  if (!date) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  color,
  label,
  value,
  description,
}) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_5px_18px_rgba(15,23,42,.055)]">
      <div className="flex items-start gap-5">
        <span
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-2xl text-white shadow-sm ${color}`}
        >
          <i className={`fa-solid ${icon}`} />
        </span>

        <div className="min-w-0">
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>

          {description && (
            <p className="mt-2 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   SALES CHART
========================================================= */

function SalesChart({ salesData }) {
  const width = 700;
  const height = 280;

  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartWidth =
    width -
    paddingLeft -
    paddingRight;

  const chartHeight =
    height -
    paddingTop -
    paddingBottom;

  const maxValue = Math.max(
    ...salesData.map((item) =>
      Math.max(
        item.orders,
        item.revenue
      )
    ),
    10
  );

  const getX = (index) => {
    if (salesData.length <= 1) {
      return paddingLeft;
    }

    return (
      paddingLeft +
      (index /
        (salesData.length - 1)) *
        chartWidth
    );
  };

  const getY = (value) => {
    return (
      paddingTop +
      chartHeight -
      (value / maxValue) *
        chartHeight
    );
  };

  const ordersPoints = salesData
    .map(
      (item, index) =>
        `${getX(index)},${getY(
          item.orders
        )}`
    )
    .join(" ");

  const revenuePoints = salesData
    .map(
      (item, index) =>
        `${getX(index)},${getY(
          item.revenue
        )}`
    )
    .join(" ");

  const areaPath =
    salesData.length > 0
      ? `
        M ${getX(0)} ${
          height - paddingBottom
        }
        L ${salesData
          .map(
            (item, index) =>
              `${getX(index)} ${getY(
                item.orders
              )}`
          )
          .join(" L ")}
        L ${getX(
          salesData.length - 1
        )} ${height - paddingBottom}
        Z
      `
      : "";

  return (
    <div className="mt-4 overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[300px] min-w-[650px] w-full"
      >
        {/* GRID */}

        {[0, 1, 2, 3, 4].map(
          (index) => {
            const y =
              paddingTop +
              (index / 4) *
                chartHeight;

            return (
              <g key={index}>
                <line
                  x1={paddingLeft}
                  x2={
                    width -
                    paddingRight
                  }
                  y1={y}
                  y2={y}
                  stroke="#e8edf3"
                />

                <text
                  x="5"
                  y={y + 4}
                  fontSize="11"
                  fill="#64748b"
                >
                  {numberFormat(
                    Math.round(
                      maxValue -
                        (maxValue / 4) *
                          index
                    )
                  )}
                </text>
              </g>
            );
          }
        )}

        {/* ORDERS AREA */}

        {salesData.length > 0 && (
          <path
            d={areaPath}
            fill="#2563eb"
            fillOpacity="0.08"
          />
        )}

        {/* ORDERS LINE */}

        <polyline
          points={ordersPoints}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* REVENUE LINE */}

        <polyline
          points={revenuePoints}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* POINTS */}

        {salesData.map(
          (item, index) => (
            <g key={item.label}>
              <circle
                cx={getX(index)}
                cy={getY(
                  item.orders
                )}
                r="4"
                fill="white"
                stroke="#2563eb"
                strokeWidth="2"
              />

              <circle
                cx={getX(index)}
                cy={getY(
                  item.revenue
                )}
                r="4"
                fill="white"
                stroke="#10b981"
                strokeWidth="2"
              />

              <text
                x={getX(index)}
                y={height - 15}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {item.label}
              </text>
            </g>
          )
        )}
      </svg>
    </div>
  );
}

/* =========================================================
   STATUS TAG
========================================================= */

function StatusTag({ status }) {
  const colors = {
    Completed:
      "bg-emerald-50 text-emerald-600",

    Processing:
      "bg-blue-50 text-blue-600",

    Pending:
      "bg-amber-50 text-amber-600",

    Cancelled:
      "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
        colors[status] ||
        "bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   NOTIFICATION DRAWER
========================================================= */

function NotificationDrawer({
  open,
  orders,
  onClose,
  onOpenOrder,
}) {
  const alertOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const status =
          getOrderStatus(order);

        return (
          status === "Pending" ||
          status === "Processing"
        );
      })
      .sort((a, b) => {
        const dateA =
          getOrderDate(a)?.getTime() || 0;

        const dateB =
          getOrderDate(b)?.getTime() || 0;

        return dateB - dateA;
      });
  }, [orders]);

  return (
    <>
      {/* BACKDROP */}

      {open && (
        <button
          type="button"
          aria-label="Close notifications"
          onClick={onClose}
          className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-[1px]"
        />
      )}

      {/* DRAWER */}

      <aside
        className={`fixed right-0 top-0 z-[100] flex h-screen w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                Notifications
              </h2>

              {alertOrders.length > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {alertOrders.length}
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              New and active customer orders
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto">
          {alertOrders.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <i className="fa-solid fa-check text-2xl text-emerald-500" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-800">
                No new order alerts
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Everything is up to date.
                New pending or processing
                orders will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {alertOrders.map(
                (order) => {
                  const status =
                    getOrderStatus(
                      order
                    );

                  return (
                    <button
                      type="button"
                      key={order.id}
                      onClick={() =>
                        onOpenOrder(
                          order
                        )
                      }
                      className="block w-full px-5 py-5 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex gap-3">
                        {/* ICON */}

                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            status ===
                            "Pending"
                              ? "bg-amber-50 text-amber-500"
                              : "bg-blue-50 text-blue-500"
                          }`}
                        >
                          <i className="fa-solid fa-bag-shopping" />
                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              New customer
                              order
                            </p>

                            <StatusTag
                              status={
                                status
                              }
                            />
                          </div>

                          <p className="mt-1 text-sm text-slate-700">
                            {getOrderCustomer(
                              order
                            )}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span>
                              <i className="fa-solid fa-calendar mr-1" />
                              {formatDateTime(
                                order
                              )}
                            </span>

                            <span>
                              {money(
                                getOrderTotal(
                                  order
                                )
                              )}
                            </span>
                          </div>

                          <div className="mt-2 text-[11px] text-slate-400">
                            Order #
                            {order.id.slice(
                              0,
                              8
                            )}
                          </div>

                          <div className="mt-3 text-xs font-medium text-blue-600">
                            View order
                            <i className="fa-solid fa-arrow-right ml-1" />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   SEARCH RESULTS
========================================================= */

function SearchResults({
  search,
  orders,
  categories,
  products,
  onOpen,
}) {
  const results = useMemo(() => {
    const text = search
      .trim()
      .toLowerCase();

    if (!text) {
      return {
        orders: [],
        categories: [],
        products: [],
      };
    }

    const matchingOrders =
      orders
        .filter((order) => {
          const searchable = [
            order.id,
            getOrderCustomer(
              order
            ),
            order.email,
            order.status,
            getOrderTotal(order),
          ]
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            text
          );
        })
        .slice(0, 5);

    const matchingCategories =
      categories
        .filter((category) => {
          const searchable = [
            category.name,
            category.description,
          ]
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            text
          );
        })
        .slice(0, 5);

    const matchingProducts =
      products
        .filter((product) => {
          const searchable = [
            product.name,
            product.title,
            product.description,
            product.category,
            product.brand,
          ]
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            text
          );
        })
        .slice(0, 5);

    return {
      orders: matchingOrders,
      categories:
        matchingCategories,
      products:
        matchingProducts,
    };
  }, [
    search,
    orders,
    categories,
    products,
  ]);

  const total =
    results.orders.length +
    results.categories.length +
    results.products.length;

  if (!search.trim()) {
    return null;
  }

  return (
    <div className="absolute right-0 top-[calc(100%+10px)] z-[80] w-[390px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
      {/* RESULT HEADER */}

      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-xs font-medium text-slate-500">
          Search results for
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
          "{search}"
        </p>
      </div>

      {total === 0 ? (
        <div className="px-5 py-10 text-center">
          <i className="fa-solid fa-magnifying-glass text-2xl text-slate-300" />

          <p className="mt-3 text-sm font-medium text-slate-700">
            No results found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Try another order, category,
            or product name.
          </p>
        </div>
      ) : (
        <div className="max-h-[520px] overflow-y-auto">
          {/* ORDERS */}

          {results.orders.length >
            0 && (
            <div className="border-b border-slate-100">
              <div className="bg-slate-50 px-4 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Orders
                </p>
              </div>

              {results.orders.map(
                (order) => (
                  <button
                    type="button"
                    key={order.id}
                    onClick={() =>
                      onOpen(
                        "Order",
                        order
                      )
                    }
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <i className="fa-solid fa-bag-shopping" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {getOrderCustomer(
                          order
                        )}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatDate(
                          order
                        )}{" "}
                        •{" "}
                        {money(
                          getOrderTotal(
                            order
                          )
                        )}
                      </p>
                    </div>

                    <i className="fa-solid fa-chevron-right text-xs text-slate-300" />
                  </button>
                )
              )}
            </div>
          )}

          {/* CATEGORIES */}

          {results.categories
            .length > 0 && (
            <div className="border-b border-slate-100">
              <div className="bg-slate-50 px-4 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Categories
                </p>
              </div>

              {results.categories.map(
                (category) => (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() =>
                      onOpen(
                        "Category",
                        category
                      )
                    }
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                      {category.imageUrl ? (
                        <img
                          src={
                            category.imageUrl
                          }
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <i className="fa-solid fa-folder text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {category.name}
                      </p>

                      <p className="truncate text-xs text-slate-400">
                        Category
                      </p>
                    </div>

                    <i className="fa-solid fa-chevron-right text-xs text-slate-300" />
                  </button>
                )
              )}
            </div>
          )}

          {/* PRODUCTS */}

          {results.products
            .length > 0 && (
            <div>
              <div className="bg-slate-50 px-4 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Products
                </p>
              </div>

              {results.products.map(
                (product) => {
                  const image =
                    product.imageUrl ||
                    product.image ||
                    "";

                  return (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() =>
                        onOpen(
                          "Product",
                          product
                        )
                      }
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                        {image ? (
                          <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <i className="fa-solid fa-cube text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {product.name ||
                            product.title ||
                            "Unnamed Product"}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {product.category ||
                            "Product"}
                        </p>
                      </div>

                      <i className="fa-solid fa-chevron-right text-xs text-slate-300" />
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function AdminDashboard() {
  const { user } = useAuth();

  const [active, setActive] =
    useState("Home");

  const [queryText, setQueryText] =
    useState("");

  const [showSearchResults, setShowSearchResults] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [orders, setOrders] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const userName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Admin";

  /* =====================================================
     FIREBASE REAL-TIME DATA
  ===================================================== */

  useEffect(() => {
    setLoading(true);
    setError("");

    let loadedOrders = false;
    let loadedProducts = false;
    let loadedCategories = false;
    let loadedUsers = false;

    const checkLoading = () => {
      if (
        loadedOrders &&
        loadedProducts &&
        loadedCategories &&
        loadedUsers
      ) {
        setLoading(false);
      }
    };

    /* ================= ORDERS ================= */

    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeOrders =
      onSnapshot(
        ordersQuery,
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          setOrders(data);

          loadedOrders = true;
          checkLoading();
        },
        (firebaseError) => {
          console.error(
            "Orders Firebase error:",
            firebaseError
          );

          setError(
            "Cannot load orders. Please check Firestore rules."
          );

          loadedOrders = true;
          checkLoading();
        }
      );

    /* ================= PRODUCTS ================= */

    const unsubscribeProducts =
      onSnapshot(
        collection(db, "products"),
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          setProducts(data);

          loadedProducts = true;
          checkLoading();
        },
        (firebaseError) => {
          console.error(
            "Products Firebase error:",
            firebaseError
          );

          loadedProducts = true;
          checkLoading();
        }
      );

    /* ================= CATEGORIES ================= */

    const unsubscribeCategories =
      onSnapshot(
        collection(db, "categories"),
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          setCategories(data);

          loadedCategories = true;
          checkLoading();
        },
        (firebaseError) => {
          console.error(
            "Categories Firebase error:",
            firebaseError
          );

          loadedCategories = true;
          checkLoading();
        }
      );

    /* ================= USERS ================= */

    const unsubscribeUsers =
      onSnapshot(
        collection(db, "users"),
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          setUsers(data);

          loadedUsers = true;
          checkLoading();
        },
        (firebaseError) => {
          console.error(
            "Users Firebase error:",
            firebaseError
          );

          loadedUsers = true;
          checkLoading();
        }
      );

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeUsers();
    };
  }, []);

  /* =====================================================
     NOTIFICATION COUNT
  ===================================================== */

  const notificationCount =
    useMemo(() => {
      return orders.filter((order) => {
        const status =
          getOrderStatus(order);

        return (
          status === "Pending" ||
          status === "Processing"
        );
      }).length;
    }, [orders]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalOrders =
    orders.length;

  const totalRevenue =
    orders.reduce(
      (sum, order) =>
        sum + getOrderTotal(order),
      0
    );

  const totalProducts =
    products.length;

  const totalUsers =
    users.length;

  /* =====================================================
     FILTER ORDERS
  ===================================================== */

  const visibleOrders =
    useMemo(() => {
      const search =
        queryText
          .trim()
          .toLowerCase();

      if (!search) {
        return orders.slice(0, 5);
      }

      return orders
        .filter((order) => {
          const text = [
            order.id,
            getOrderCustomer(
              order
            ),
            getOrderStatus(order),
            getOrderTotal(order),
            order.email,
          ]
            .join(" ")
            .toLowerCase();

          return text.includes(
            search
          );
        })
        .slice(0, 10);
    }, [
      orders,
      queryText,
    ]);

  /* =====================================================
     ORDER STATUS
  ===================================================== */

  const statusCounts =
    useMemo(() => {
      const result = {
        Completed: 0,
        Processing: 0,
        Pending: 0,
        Cancelled: 0,
      };

      orders.forEach(
        (order) => {
          const status =
            getOrderStatus(
              order
            );

          if (
            result[status] !==
            undefined
          ) {
            result[status]++;
          }
        }
      );

      return result;
    }, [orders]);

  /* =====================================================
     STATUS PERCENTAGES
  ===================================================== */

  const getPercentage =
    (value) => {
      if (!totalOrders) {
        return 0;
      }

      return Math.round(
        (value /
          totalOrders) *
          100
      );
    };

  /* =====================================================
     SALES DATA - LAST 7 MONTHS
  ===================================================== */

  const salesData =
    useMemo(() => {
      const now =
        new Date();

      const months = [];

      for (
        let i = 6;
        i >= 0;
        i--
      ) {
        const date =
          new Date(
            now.getFullYear(),
            now.getMonth() -
              i,
            1
          );

        months.push({
          year:
            date.getFullYear(),
          month:
            date.getMonth(),
          label:
            date.toLocaleDateString(
              "en-US",
              {
                month:
                  "short",
              }
            ),
          orders: 0,
          revenue: 0,
        });
      }

      orders.forEach(
        (order) => {
          const date =
            getOrderDate(
              order
            );

          if (!date) {
            return;
          }

          const monthData =
            months.find(
              (item) =>
                item.year ===
                  date.getFullYear() &&
                item.month ===
                  date.getMonth()
            );

          if (!monthData) {
            return;
          }

          monthData.orders +=
            1;

          monthData.revenue +=
            getOrderTotal(
              order
            );
        }
      );

      const maxRevenue =
        Math.max(
          ...months.map(
            (item) =>
              item.revenue
          ),
          1
        );

      const maxOrders =
        Math.max(
          ...months.map(
            (item) =>
              item.orders
          ),
          1
        );

      return months.map(
        (item) => ({
          ...item,

          revenue:
            Math.round(
              (item.revenue /
                maxRevenue) *
                maxOrders
            ),
        })
      );
    }, [orders]);

  /* =====================================================
     TOP PRODUCTS
  ===================================================== */

  const topProducts =
    useMemo(() => {
      const productMap = {};

      orders.forEach(
        (order) => {
          let items =
            order.items;

          if (
            !Array.isArray(
              items
            )
          ) {
            if (
              Array.isArray(
                order.products
              )
            ) {
              items =
                order.products;
            } else if (
              Array.isArray(
                order.cartItems
              )
            ) {
              items =
                order.cartItems;
            } else {
              items = [];
            }
          }

          items.forEach(
            (item) => {
              const name =
                item.name ||
                item.productName ||
                item.title ||
                "Unknown Product";

              const quantity =
                Number(
                  item.quantity ||
                    item.qty ||
                    1
                ) || 1;

              const price =
                Number(
                  item.price ||
                    item.productPrice ||
                    0
                ) || 0;

              const image =
                item.image ||
                item.imageUrl ||
                "";

              if (
                !productMap[
                  name
                ]
              ) {
                productMap[
                  name
                ] = {
                  name,
                  quantity: 0,
                  revenue: 0,
                  image,
                };
              }

              productMap[
                name
              ].quantity +=
                quantity;

              productMap[
                name
              ].revenue +=
                quantity *
                price;
            }
          );
        }
      );

      return Object.values(
        productMap
      )
        .sort(
          (a, b) =>
            b.quantity -
            a.quantity
        )
        .slice(0, 5);
    }, [orders]);

  /* =====================================================
     SEARCH OPEN
  ===================================================== */

  const handleSearchChange =
    (event) => {
      const value =
        event.target.value;

      setQueryText(value);

      setShowSearchResults(
        value.trim().length > 0
      );
    };

  /* =====================================================
     SEARCH RESULT CLICK
  ===================================================== */

  const handleSearchOpen =
    (page, item) => {
      setActive(page);

      setQueryText("");

      setShowSearchResults(
        false
      );

      /*
        If you later add a search prop
        to AdminCategories,
        AdminProduct and AdminOrder,
        you can pass `item` here.
      */
      console.log(
        "Search selected:",
        page,
        item
      );
    };

  /* =====================================================
     NOTIFICATION ORDER CLICK
  ===================================================== */

  const handleNotificationOrder =
    (order) => {
      console.log(
        "Open notification order:",
        order
      );

      setShowNotifications(
        false
      );

      setQueryText("");

      setActive("Order");
    };

  /* =====================================================
     CLOSE SEARCH WHEN CLICKING OUTSIDE
  ===================================================== */

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          !event.target.closest(
            "[data-admin-search]"
          )
        ) {
          setShowSearchResults(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-800"
      style={{
        fontFamily:
          "Inter, Arial, sans-serif",
      }}
    >
      {/* SIDEBAR */}

      <Sidebar
        active={active}
        onActiveChange={(value) => {
          setActive(value);
          setQueryText("");
          setShowSearchResults(
            false
          );
        }}
      />

      <section className="lg:ml-60">
        {/* HEADER */}

        <header className="relative z-[70] flex min-h-24 items-center border-b border-slate-100 bg-white px-5 sm:px-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-[21px]">
              Welcome back,{" "}
              {userName}! 👋
            </h1>

            <p className="mt-1 text-[13px] text-slate-500">
              Here's what's happening
              with your store today.
            </p>
          </div>

          <div className="ml-auto flex items-center gap-5">
            {/* GLOBAL SEARCH */}

            <div
              data-admin-search
              className="relative hidden sm:block"
            >
              <label className="relative block">
                <span className="sr-only">
                  Search orders,
                  categories and
                  products
                </span>

                <input
                  value={queryText}
                  onChange={
                    handleSearchChange
                  }
                  onFocus={() => {
                    if (
                      queryText.trim()
                    ) {
                      setShowSearchResults(
                        true
                      );
                    }
                  }}
                  placeholder="Search orders, categories, products..."
                  className="h-12 w-[360px] rounded-xl border border-slate-200 py-3 pl-4 pr-11 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />

                <i className="fa-solid fa-magnifying-glass pointer-events-none absolute right-4 top-4 text-slate-500" />
              </label>

              {showSearchResults && (
                <SearchResults
                  search={queryText}
                  orders={orders}
                  categories={
                    categories
                  }
                  products={products}
                  onOpen={
                    handleSearchOpen
                  }
                />
              )}
            </div>

            {/* NOTIFICATION */}

            <button
              type="button"
              onClick={() =>
                setShowNotifications(
                  true
                )
              }
              aria-label="Open notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <i className="fa-regular fa-bell text-xl" />

              {notificationCount >
                0 && (
                <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
                  {notificationCount >
                  9
                    ? "9+"
                    : notificationCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* MOBILE SEARCH */}

        {active === "Home" && (
          <div className="p-5 sm:hidden">
            <div
              data-admin-search
              className="relative"
            >
              <label className="relative block">
                <input
                  value={queryText}
                  onChange={
                    handleSearchChange
                  }
                  onFocus={() => {
                    if (
                      queryText.trim()
                    ) {
                      setShowSearchResults(
                        true
                      );
                    }
                  }}
                  placeholder="Search orders, categories, products..."
                  className="h-11 w-full rounded-xl border border-slate-200 py-3 pl-4 pr-10 text-sm outline-none"
                />

                <i className="fa-solid fa-magnifying-glass pointer-events-none absolute right-4 top-3.5 text-slate-500" />
              </label>

              {showSearchResults && (
                <SearchResults
                  search={queryText}
                  orders={orders}
                  categories={
                    categories
                  }
                  products={products}
                  onOpen={
                    handleSearchOpen
                  }
                />
              )}
            </div>
          </div>
        )}

        {/* NOTIFICATION DRAWER */}

        <NotificationDrawer
          open={
            showNotifications
          }
          orders={orders}
          onClose={() =>
            setShowNotifications(
              false
            )
          }
          onOpenOrder={
            handleNotificationOrder
          }
        />

        {/* CATEGORY */}

        {active ===
          "Category" && (
          <AdminCategories />
        )}

        {/* PRODUCT */}

        {active ===
          "Product" && (
          <AdminProduct />
        )}

        {/* ORDER */}

        {active === "Order" && (
          <AdminOrder />
        )}

        {/* DASHBOARD */}

        {active === "Home" && (
          <div className="p-5 sm:p-8">
            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <i className="fa-solid fa-circle-exclamation mr-2" />

                {error}
              </div>
            )}

            {/* LOADING */}

            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <i className="fa-solid fa-spinner fa-spin text-3xl text-red-500" />

                  <p className="mt-3 text-sm text-slate-500">
                    Loading dashboard
                    data...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* STATISTICS */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    icon="fa-bag-shopping"
                    color="from-indigo-500 to-violet-500"
                    label="Total Orders"
                    value={numberFormat(
                      totalOrders
                    )}
                    description="Orders in Firebase"
                  />

                  <StatCard
                    icon="fa-dollar-sign"
                    color="from-emerald-500 to-green-500"
                    label="Total Revenue"
                    value={money(
                      totalRevenue
                    )}
                    description="Total order revenue"
                  />

                  <StatCard
                    icon="fa-cube"
                    color="from-violet-500 to-purple-500"
                    label="Total Products"
                    value={numberFormat(
                      totalProducts
                    )}
                    description="Products in store"
                  />

                  <StatCard
                    icon="fa-users"
                    color="from-orange-500 to-red-500"
                    label="Total Users"
                    value={numberFormat(
                      totalUsers
                    )}
                    description="Registered users"
                  />
                </div>

                {/* SALES OVERVIEW */}

                <div className="mt-5">
                  <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_5px_18px_rgba(15,23,42,.045)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-slate-900">
                          Sales Overview
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                          Real order data from
                          Firebase
                        </p>
                      </div>

                      <div className="flex gap-5 text-xs text-slate-500">
                        <span>
                          <b className="mr-2 inline-block h-1.5 w-3 rounded bg-blue-500" />
                          Orders
                        </span>

                        <span>
                          <b className="mr-2 inline-block h-1.5 w-3 rounded bg-emerald-500" />
                          Revenue
                        </span>
                      </div>
                    </div>

                    {orders.length ===
                    0 ? (
                      <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">
                        No order data yet.
                      </div>
                    ) : (
                      <SalesChart
                        salesData={
                          salesData
                        }
                      />
                    )}
                  </article>
                </div>

                {/* TOP PRODUCTS + STATUS */}

                <div className="mt-5 grid gap-5 xl:grid-cols-2">
                  {/* TOP PRODUCTS */}

                  <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_5px_18px_rgba(15,23,42,.045)] sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-slate-900">
                          Top Selling
                          Products
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                          Based on order items
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      {topProducts.length ===
                      0 ? (
                        <div className="py-10 text-center text-sm text-slate-400">
                          No product sales yet.
                        </div>
                      ) : (
                        topProducts.map(
                          (
                            product,
                            index
                          ) => (
                            <div
                              key={
                                product.name
                              }
                              className="grid grid-cols-[18px_52px_minmax(0,1fr)_90px] items-center gap-2 border-b border-slate-100 py-3 last:border-0"
                            >
                              <span className="text-sm">
                                {index +
                                  1}
                              </span>

                              {product.image ? (
                                <img
                                  src={
                                    product.image
                                  }
                                  alt={
                                    product.name
                                  }
                                  className="h-10 w-12 rounded-md object-cover"
                                />
                              ) : (
                                <div className="grid h-10 w-12 place-items-center rounded-md bg-slate-100">
                                  <i className="fa-solid fa-cube text-slate-400" />
                                </div>
                              )}

                              <div className="min-w-0">
                                <span className="block truncate text-[13px] font-medium text-slate-800">
                                  {
                                    product.name
                                  }
                                </span>

                                <span className="text-[11px] text-slate-400">
                                  {
                                    product.quantity
                                  }{" "}
                                  sold
                                </span>
                              </div>

                              <span className="text-right text-[13px] font-medium">
                                {money(
                                  product.revenue
                                )}
                              </span>
                            </div>
                          )
                        )
                      )}
                    </div>
                  </article>

                  {/* ORDER STATUS */}

                  <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_5px_18px_rgba(15,23,42,.045)] sm:p-6">
                    <h2 className="font-semibold text-slate-900">
                      Orders by Status
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Current order status
                      from Firebase
                    </p>

                    <div className="flex flex-col items-center gap-7 pt-6 sm:flex-row">
                      {/* DONUT */}

                      <div
                        className="relative grid h-56 w-56 shrink-0 place-items-center rounded-full"
                        style={{
                          background:
                            totalOrders >
                            0
                              ? `conic-gradient(
                                  #18b968 0 ${getPercentage(
                                    statusCounts.Completed
                                  )}%,
                                  #2d72e8 ${getPercentage(
                                    statusCounts.Completed
                                  )}% ${getPercentage(
                                    statusCounts.Completed
                                  ) +
                                    getPercentage(
                                      statusCounts.Processing
                                    )}%,
                                  #ffb30d ${getPercentage(
                                    statusCounts.Completed
                                  ) +
                                    getPercentage(
                                      statusCounts.Processing
                                    )}% ${getPercentage(
                                    statusCounts.Completed
                                  ) +
                                    getPercentage(
                                      statusCounts.Processing
                                    ) +
                                    getPercentage(
                                      statusCounts.Pending
                                    )}%,
                                  #ff4c44 ${getPercentage(
                                    statusCounts.Completed
                                  ) +
                                    getPercentage(
                                      statusCounts.Processing
                                    ) +
                                    getPercentage(
                                      statusCounts.Pending
                                    )}% 100%
                                )`
                              : "#e2e8f0",
                        }}
                      >
                        <div className="grid h-36 w-36 place-items-center rounded-full bg-white text-center">
                          <div>
                            <p className="text-2xl font-semibold text-slate-900">
                              {numberFormat(
                                totalOrders
                              )}
                            </p>

                            <p className="text-xs text-slate-500">
                              Total Orders
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* STATUS LIST */}

                      <div className="w-full space-y-5">
                        <StatusRow
                          name="Completed"
                          count={
                            statusCounts.Completed
                          }
                          percentage={getPercentage(
                            statusCounts.Completed
                          )}
                          color="bg-emerald-500"
                        />

                        <StatusRow
                          name="Processing"
                          count={
                            statusCounts.Processing
                          }
                          percentage={getPercentage(
                            statusCounts.Processing
                          )}
                          color="bg-blue-500"
                        />

                        <StatusRow
                          name="Pending"
                          count={
                            statusCounts.Pending
                          }
                          percentage={getPercentage(
                            statusCounts.Pending
                          )}
                          color="bg-amber-400"
                        />

                        <StatusRow
                          name="Cancelled"
                          count={
                            statusCounts.Cancelled
                          }
                          percentage={getPercentage(
                            statusCounts.Cancelled
                          )}
                          color="bg-red-500"
                        />
                      </div>
                    </div>
                  </article>
                </div>

                {/* RECENT ORDERS */}

                <div className="mt-5">
                  <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_5px_18px_rgba(15,23,42,.045)]">
                    <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
                      <div>
                        <h2 className="font-semibold text-slate-900">
                          Recent Orders
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                          Latest orders from
                          Firebase
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setActive(
                            "Order"
                          )
                        }
                        className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        View All
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px]">
                        <thead>
                          <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                            <th className="px-5 py-4 font-medium">
                              Order ID
                            </th>

                            <th className="px-5 py-4 font-medium">
                              Customer
                            </th>

                            <th className="px-5 py-4 font-medium">
                              Date
                            </th>

                            <th className="px-5 py-4 text-right font-medium">
                              Total
                            </th>

                            <th className="px-5 py-4 text-right font-medium">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {visibleOrders.length ===
                          0 ? (
                            <tr>
                              <td
                                colSpan="5"
                                className="px-5 py-12 text-center text-sm text-slate-400"
                              >
                                {queryText
                                  ? "No matching orders found."
                                  : "No orders yet."}
                              </td>
                            </tr>
                          ) : (
                            visibleOrders.map(
                              (
                                order
                              ) => {
                                const status =
                                  getOrderStatus(
                                    order
                                  );

                                return (
                                  <tr
                                    key={
                                      order.id
                                    }
                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                  >
                                    <td className="px-5 py-4 text-sm font-medium text-slate-800">
                                      #
                                      {order.id.slice(
                                        0,
                                        8
                                      )}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-700">
                                      {getOrderCustomer(
                                        order
                                      )}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-500">
                                      {formatDate(
                                        order
                                      )}
                                    </td>

                                    <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                                      {money(
                                        getOrderTotal(
                                          order
                                        )
                                      )}
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                      <StatusTag
                                        status={
                                          status
                                        }
                                      />
                                    </td>
                                  </tr>
                                );
                              }
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </article>
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   STATUS ROW
========================================================= */

function StatusRow({
  name,
  count,
  percentage,
  color,
}) {
  return (
    <div className="flex items-center text-sm">
      <span
        className={`mr-3 h-3 w-3 rounded-full ${color}`}
      />

      <span>{name}</span>

      <span className="ml-auto text-slate-500">
        {percentage}% ({count})
      </span>
    </div>
  );
}