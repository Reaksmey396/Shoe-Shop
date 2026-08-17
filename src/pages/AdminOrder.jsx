import React, { useEffect, useState } from "react";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function AdminOrder() {
  const { user, loading: authLoading } = useAuth();

  // =========================================================
  // STATE
  // =========================================================

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [deleting, setDeleting] = useState(false);

  // Status updating
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // =========================================================
  // SERVICE PRICES
  // =========================================================

  const SERVICE_PRICES = {
    Free: 0,
    Plus: 5,
    Pro: 10,
  };

  // =========================================================
  // REAL-TIME ORDERS
  // =========================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setOrders([]);
      setSelectedOrder(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const ordersRef = collection(db, "orders");

    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const orderData = snapshot.docs.map((item) => {
          const data = item.data();

          return {
            id: item.id,
            ...data,
          };
        });

        // =====================================================
        // NEWEST FIRST
        // =====================================================

        orderData.sort((a, b) => {
          return (
            getTimestampMilliseconds(b.createdAt) -
            getTimestampMilliseconds(a.createdAt)
          );
        });

        setOrders(orderData);

        // =====================================================
        // KEEP SIDEBAR REAL-TIME
        // =====================================================

        setSelectedOrder((currentOrder) => {
          if (!currentOrder) {
            return null;
          }

          const updatedOrder = orderData.find(
            (item) => item.id === currentOrder.id
          );

          if (!updatedOrder) {
            return null;
          }

          return updatedOrder;
        });

        setLoading(false);
      },
      (firebaseError) => {
        console.error(
          "ORDERS LISTENER ERROR:",
          firebaseError
        );

        setError(
          firebaseError.message ||
            "Cannot load orders."
        );

        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, authLoading]);

  // =========================================================
  // TIMESTAMP HELPER
  // =========================================================

  const getTimestampMilliseconds = (timestamp) => {
    if (!timestamp) {
      return 0;
    }

    if (
      typeof timestamp.toMillis === "function"
    ) {
      return timestamp.toMillis();
    }

    if (
      typeof timestamp.toDate === "function"
    ) {
      return timestamp.toDate().getTime();
    }

    if (
      timestamp?.seconds !== undefined
    ) {
      return Number(timestamp.seconds) * 1000;
    }

    if (timestamp instanceof Date) {
      return timestamp.getTime();
    }

    const date = new Date(timestamp);

    if (!Number.isNaN(date.getTime())) {
      return date.getTime();
    }

    return 0;
  };

  // =========================================================
  // OPEN ORDER
  // =========================================================

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
  };

  // =========================================================
  // CLOSE ORDER
  // =========================================================

  const closeOrderDetail = () => {
    if (deleting || updatingStatus) {
      return;
    }

    setSelectedOrder(null);
  };

  // =========================================================
  // UPDATE ORDER STATUS
  //
  // This updates the REAL Firestore document.
  //
  // Receive   -> Received
  // Is Coming -> Is Coming
  // =========================================================

  const updateOrderStatus = async (newStatus) => {
    if (!selectedOrder) {
      return;
    }

    if (updatingStatus) {
      return;
    }

    if (deleting) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");

      const orderRef = doc(
        db,
        "orders",
        selectedOrder.id
      );

      await updateDoc(orderRef, {
        status: newStatus,
      });

      // onSnapshot will automatically update:
      // - selectedOrder
      // - table
      // - status badge
      // - counters
    } catch (statusError) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        statusError
      );

      setError(
        statusError.message ||
          "Cannot update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // =========================================================
  // RECEIVE ORDER
  // =========================================================

  const handleReceiveOrder = async () => {
    await updateOrderStatus("Received");
  };

  // =========================================================
  // IS COMING
  // =========================================================

  const handleIsComing = async () => {
    await updateOrderStatus("Is Coming");
  };

  // =========================================================
  // OPEN DELETE MODAL
  // =========================================================

  const handleDeleteClick = () => {
    if (!selectedOrder) {
      return;
    }

    if (deleting || updatingStatus) {
      return;
    }

    setShowDeleteModal(true);
  };

  // =========================================================
  // CANCEL DELETE
  // =========================================================

  const cancelDelete = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
  };

  // =========================================================
  // DELETE ORDER
  // =========================================================

  const handleDeleteOrder = async () => {
    if (!selectedOrder) {
      return;
    }

    if (deleting) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteDoc(
        doc(
          db,
          "orders",
          selectedOrder.id
        )
      );

      setShowDeleteModal(false);
      setSelectedOrder(null);
    } catch (deleteError) {
      console.error(
        "DELETE ORDER ERROR:",
        deleteError
      );

      setError(
        deleteError.message ||
          "Cannot delete this order."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // GET ORDER NUMBER
  // =========================================================

  const getOrderNumber = (order) => {
    if (!order) {
      return "";
    }

    return (
      order.orderNumber ||
      order.orderId ||
      `#${String(order.id || "")
        .slice(0, 8)
        .toUpperCase()}`
    );
  };

  // =========================================================
  // GET CUSTOMER NAME
  // =========================================================

  const getCustomerName = (order) => {
    if (!order) {
      return "Unknown Customer";
    }

    return (
      order.customerName ||
      order.customer ||
      order.name ||
      order.fullName ||
      "Unknown Customer"
    );
  };

  // =========================================================
  // GET PHONE
  // =========================================================

  const getCustomerPhone = (order) => {
    if (!order) {
      return "—";
    }

    return (
      order.phone ||
      order.customerPhone ||
      order.phoneNumber ||
      order.mobile ||
      order.telephone ||
      "—"
    );
  };

  // =========================================================
  // GET EMAIL
  // =========================================================

  const getCustomerEmail = (order) => {
    if (!order) {
      return "—";
    }

    return (
      order.email ||
      order.customerEmail ||
      "—"
    );
  };

  // =========================================================
  // GET LOCATION
  // =========================================================

  const getLocation = (order) => {
    if (!order) {
      return "—";
    }

    return (
      order.location ||
      order.address ||
      order.deliveryAddress ||
      order.customerAddress ||
      order.place ||
      "—"
    );
  };

  // =========================================================
  // GET PRODUCT
  // =========================================================

  const getProductName = (order) => {
    if (!order) {
      return "—";
    }

    // One product directly
    if (
      order.productName ||
      order.product ||
      order.productTitle ||
      order.title ||
      order.itemName
    ) {
      return (
        order.productName ||
        order.product ||
        order.productTitle ||
        order.title ||
        order.itemName
      );
    }

    // Multiple items
    if (
      Array.isArray(order.items) &&
      order.items.length > 0
    ) {
      const names = order.items
        .map(
          (item) =>
            item.title ||
            item.name ||
            item.productName ||
            "Product"
        )
        .filter(Boolean);

      if (names.length > 0) {
        return names.join(", ");
      }
    }

    return "—";
  };

  // =========================================================
  // GET SERVICE PLAN
  // =========================================================

  const getServiceName = (order) => {
    if (!order) {
      return "Free";
    }

    const rawService =
      order.servicePlan ??
      order.service ??
      order.plan ??
      order.package ??
      order.selectedServicePlan ??
      order.selectedPlan;

    if (
      rawService === null ||
      rawService === undefined ||
      String(rawService).trim() === ""
    ) {
      return "Free";
    }

    const value = String(rawService).trim();

    const normalized = value.toLowerCase();

    if (normalized === "free") {
      return "Free";
    }

    if (normalized === "plus") {
      return "Plus";
    }

    if (normalized === "pro") {
      return "Pro";
    }

    return value;
  };

  // =========================================================
  // GET SERVICE PRICE
  // =========================================================

  const getServiceExtraPrice = (order) => {
    if (!order) {
      return 0;
    }

    const storedServicePrice =
      order.serviceExtraPrice ??
      order.servicePrice ??
      order.extraServicePrice ??
      order.serviceFee ??
      order.planPrice;

    if (
      storedServicePrice !== undefined &&
      storedServicePrice !== null &&
      storedServicePrice !== ""
    ) {
      const numericPrice = Number(
        storedServicePrice
      );

      if (!Number.isNaN(numericPrice)) {
        return numericPrice;
      }
    }

    const serviceName =
      getServiceName(order);

    const normalizedService =
      String(serviceName)
        .trim()
        .toLowerCase();

    if (
      normalizedService === "plus"
    ) {
      return SERVICE_PRICES.Plus;
    }

    if (
      normalizedService === "pro"
    ) {
      return SERVICE_PRICES.Pro;
    }

    return SERVICE_PRICES.Free;
  };

  // =========================================================
  // GET PRODUCT TOTAL
  // =========================================================

  const getProductsTotal = (order) => {
    if (!order) {
      return 0;
    }

    if (
      Array.isArray(order.items) &&
      order.items.length > 0
    ) {
      const calculatedItemsTotal =
        order.items.reduce(
          (sum, item) => {
            const price = Number(
              item.unitPrice ??
                item.price ??
                item.amount ??
                0
            );

            const quantity = Number(
              item.quantity ?? 1
            );

            return (
              sum +
              price * quantity
            );
          },
          0
        );

      return calculatedItemsTotal;
    }

    const productTotal =
      order.productsTotal ??
      order.productTotal ??
      order.subtotal ??
      order.itemsTotal ??
      order.totalPrice ??
      order.price ??
      order.amount ??
      0;

    const numericTotal = Number(
      productTotal
    );

    if (!Number.isNaN(numericTotal)) {
      return numericTotal;
    }

    return 0;
  };

  // =========================================================
  // GET FINAL TOTAL
  // =========================================================

  const getOrderTotal = (order) => {
    if (!order) {
      return 0;
    }

    const productsTotal =
      getProductsTotal(order);

    const serviceExtraPrice =
      getServiceExtraPrice(order);

    return (
      productsTotal +
      serviceExtraPrice
    );
  };

  // =========================================================
  // GET QUANTITY
  // =========================================================

  const getQuantity = (order) => {
    if (!order) {
      return 0;
    }

    if (
      Array.isArray(order.items) &&
      order.items.length > 0
    ) {
      return order.items.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity ?? 1),
        0
      );
    }

    if (
      order.quantity !== undefined &&
      order.quantity !== null
    ) {
      return Number(order.quantity);
    }

    return 1;
  };

  // =========================================================
  // GET CATEGORY
  // =========================================================

  const getCategory = (order) => {
    if (!order) {
      return "—";
    }

    return (
      order.category ||
      order.serviceCategory ||
      "—"
    );
  };

  // =========================================================
  // GET NOTE
  // =========================================================

  const getOrderNote = (order) => {
    if (!order) {
      return "No note provided.";
    }

    return (
      order.note ||
      order.notes ||
      order.message ||
      order.customerNote ||
      "No note provided."
    );
  };

  // =========================================================
  // GET STATUS
  //
  // IMPORTANT:
  // Default is now Pending.
  // =========================================================

  const getOrderStatus = (order) => {
    if (!order) {
      return "Pending";
    }

    return (
      order.status ||
      "Pending"
    );
  };

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "$0.00";
    }

    const numericValue = Number(
      value
    );

    if (
      !Number.isNaN(numericValue)
    ) {
      return `$${numericValue.toFixed(2)}`;
    }

    return String(value);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "—";
    }

    let date;

    if (
      typeof timestamp.toDate ===
      "function"
    ) {
      date = timestamp.toDate();
    } else if (
      timestamp?.seconds !== undefined
    ) {
      date = new Date(
        Number(timestamp.seconds) * 1000
      );
    } else if (
      timestamp instanceof Date
    ) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (
    status
  ) => {
    const value = String(
      status || "Pending"
    ).toLowerCase();

    if (
      value === "ready" ||
      value === "completed" ||
      value === "complete"
    ) {
      return "bg-emerald-50 text-emerald-600";
    }

    if (
      value === "in progress" ||
      value === "processing"
    ) {
      return "bg-amber-50 text-amber-600";
    }

    if (
      value === "is coming"
    ) {
      return "bg-purple-50 text-purple-600";
    }

    if (
      value === "received"
    ) {
      return "bg-blue-50 text-blue-600";
    }

    if (
      value === "cancelled" ||
      value === "canceled"
    ) {
      return "bg-red-50 text-red-600";
    }

    // Pending / New
    return "bg-yellow-50 text-yellow-600";
  };

  // =========================================================
  // SERVICE CLASS
  // =========================================================

  const getServiceClass = (
    service
  ) => {
    const value = String(
      service || "Free"
    ).toLowerCase();

    if (
      value.includes("pro")
    ) {
      return "bg-purple-50 text-purple-600";
    }

    if (
      value.includes("plus")
    ) {
      return "bg-orange-50 text-orange-600";
    }

    return "bg-emerald-50 text-emerald-600";
  };

  // =========================================================
  // COUNTS
  // =========================================================

  const newOrders =
    orders.filter(
      (order) => {
        const status =
          String(
            order.status || "Pending"
          ).toLowerCase();

        return (
          status === "new" ||
          status === "pending"
        );
      }
    ).length;

  const receivedOrders =
    orders.filter(
      (order) => {
        const status =
          String(
            order.status || ""
          ).toLowerCase();

        return (
          status === "received"
        );
      }
    ).length;

  const inProgressOrders =
    orders.filter(
      (order) => {
        const status =
          String(
            order.status || ""
          ).toLowerCase();

        return (
          status === "in progress" ||
          status === "processing" ||
          status === "is coming"
        );
      }
    ).length;

  const readyOrders =
    orders.filter(
      (order) => {
        const status =
          String(
            order.status || ""
          ).toLowerCase();

        return (
          status === "ready" ||
          status === "completed" ||
          status === "complete"
        );
      }
    ).length;

  // =========================================================
  // AUTH LOADING
  // =========================================================

  if (authLoading) {
    return (
      <main className="p-5 sm:p-8">
        <div className="py-20 text-center">
          <i className="fa-solid fa-spinner fa-spin text-xl text-red-500" />

          <p className="mt-3 text-sm text-slate-500">
            Checking authentication...
          </p>
        </div>
      </main>
    );
  }

  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!user) {
    return (
      <main className="p-5 sm:p-8">
        <div className="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
          <i className="fa-solid fa-lock text-3xl text-red-400" />

          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            Login Required
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please login to manage orders.
          </p>
        </div>
      </main>
    );
  }

  // =========================================================
  // SELECTED ORDER DATA
  // =========================================================

  const selectedOrderNumber =
    getOrderNumber(
      selectedOrder
    );

  const selectedCustomerName =
    getCustomerName(
      selectedOrder
    );

  const selectedPhone =
    getCustomerPhone(
      selectedOrder
    );

  const selectedEmail =
    getCustomerEmail(
      selectedOrder
    );

  const selectedLocation =
    getLocation(
      selectedOrder
    );

  const selectedProduct =
    getProductName(
      selectedOrder
    );

  const selectedService =
    getServiceName(
      selectedOrder
    );

  const selectedServicePrice =
    getServiceExtraPrice(
      selectedOrder
    );

  const selectedProductsTotal =
    getProductsTotal(
      selectedOrder
    );

  const selectedTotal =
    getOrderTotal(
      selectedOrder
    );

  const selectedCategory =
    getCategory(
      selectedOrder
    );

  const selectedQuantity =
    getQuantity(
      selectedOrder
    );

  const selectedStatus =
    getOrderStatus(
      selectedOrder
    );

  const selectedNote =
    getOrderNote(
      selectedOrder
    );

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="relative min-h-screen p-5 sm:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-7">
        <h2 className="text-2xl font-semibold text-slate-900">
          Orders
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Track incoming customer service requests.
        </p>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-4">

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Pending orders
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {newOrders}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Received
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {receivedOrders}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Is Coming
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {inProgressOrders}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Ready for pickup
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {readyOrders}
          </p>
        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <i className="fa-solid fa-triangle-exclamation mr-2" />
          {error}
        </div>
      )}

      {/* =====================================================
          ORDERS TABLE
      ===================================================== */}

      <div
        className={`mt-5 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm ${
          selectedOrder
            ? "lg:mr-[430px]"
            : ""
        }`}
      >

        <table className="w-full min-w-[950px] text-left text-sm">

          <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">

            <tr>

              {[
                "Order",
                "Customer",
                "Product",
                "Service",
                "Total",
                "Status",
                "Date",
              ].map(
                (title) => (
                  <th
                    key={title}
                    className="px-6 py-4 font-medium"
                  >
                    {title}
                  </th>
                )
              )}

            </tr>

          </thead>

          <tbody>

            {/* LOADING */}

            {loading && (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-16 text-center"
                >
                  <i className="fa-solid fa-spinner fa-spin text-xl text-red-500" />

                  <p className="mt-3 text-sm text-slate-500">
                    Loading orders...
                  </p>
                </td>
              </tr>
            )}

            {/* EMPTY */}

            {!loading &&
              orders.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-16 text-center"
                  >
                    <i className="fa-solid fa-box-open text-4xl text-slate-300" />

                    <p className="mt-4 text-sm text-slate-500">
                      No orders yet.
                    </p>
                  </td>
                </tr>
              )}

            {/* ORDERS */}

            {!loading &&
              orders.map(
                (order) => {
                  const orderNumber =
                    getOrderNumber(
                      order
                    );

                  const customerName =
                    getCustomerName(
                      order
                    );

                  const product =
                    getProductName(
                      order
                    );

                  const service =
                    getServiceName(
                      order
                    );

                  const total =
                    getOrderTotal(
                      order
                    );

                  const status =
                    getOrderStatus(
                      order
                    );

                  const isSelected =
                    selectedOrder?.id ===
                    order.id;

                  return (
                    <tr
                      key={order.id}
                      onClick={() =>
                        openOrderDetail(
                          order
                        )
                      }
                      className={`cursor-pointer border-b border-slate-100 last:border-0 transition ${
                        isSelected
                          ? "bg-red-50"
                          : "hover:bg-slate-50"
                      }`}
                    >

                      {/* ORDER */}

                      <td className="px-6 py-4 font-medium text-slate-900">
                        {orderNumber}
                      </td>

                      {/* CUSTOMER */}

                      <td className="px-6 py-4 text-slate-700">
                        {customerName}
                      </td>

                      {/* PRODUCT */}

                      <td className="max-w-[220px] truncate px-6 py-4 text-slate-600">
                        {product}
                      </td>

                      {/* SERVICE */}

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${getServiceClass(
                            service
                          )}`}
                        >
                          {service}
                        </span>

                      </td>

                      {/* TOTAL */}

                      <td className="px-6 py-4 font-semibold text-orange-600">
                        {formatMoney(
                          total
                        )}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                      </td>

                      {/* DATE */}

                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(
                          order.createdAt
                        )}
                      </td>

                    </tr>
                  );
                }
              )}

          </tbody>

        </table>

      </div>

      {/* =====================================================
          RIGHT FIXED ORDER DETAIL SIDEBAR
      ===================================================== */}

      {selectedOrder && (
        <>

          {/* MOBILE OVERLAY */}

          <div
            onClick={
              closeOrderDetail
            }
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />

          {/* SIDEBAR */}

          <aside
            className="
              fixed
              right-0
              top-[80px]
              z-50
              h-[calc(100vh-80px)]
              w-full
              overflow-y-auto
              border-l
              border-slate-200
              bg-white
              shadow-2xl
              sm:w-[430px]
            "
          >

            {/* =================================================
                SIDEBAR HEADER
            ================================================= */}

            <div className="sticky top-0 z-20 border-b border-slate-100 bg-white px-5 py-4">

              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                  <p className="text-xs font-semibold uppercase tracking-widest text-red-500">
                    Order Detail
                  </p>

                  <h2 className="mt-1 truncate text-xl font-semibold text-slate-900">
                    {selectedOrderNumber}
                  </h2>

                  <p className="mt-1 break-all text-xs text-slate-400">
                    Firestore ID:{" "}
                    {selectedOrder.id}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeOrderDetail
                  }
                  disabled={
                    deleting ||
                    updatingStatus
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="fa-solid fa-xmark" />
                </button>

              </div>

            </div>

            {/* =================================================
                SIDEBAR CONTENT
            ================================================= */}

            <div className="space-y-4 p-5">

              {/* =================================================
                  STATUS ACTIONS
              ================================================= */}

              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between gap-3">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Order Status
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      Current status
                    </p>

                  </div>

                  <span
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                      selectedStatus
                    )}`}
                  >
                    {selectedStatus}
                  </span>

                </div>

                {/* ACTION BUTTONS */}

                <div className="mt-4 grid grid-cols-2 gap-3">

                  {/* RECEIVE */}

                  <button
                    type="button"
                    onClick={
                      handleReceiveOrder
                    }
                    disabled={
                      updatingStatus ||
                      deleting ||
                      String(
                        selectedStatus
                      ).toLowerCase() ===
                        "received"
                    }
                    className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >

                    {updatingStatus &&
                    String(
                      selectedStatus
                    ).toLowerCase() !==
                      "received" ? (
                      <i className="fa-solid fa-spinner fa-spin mr-2" />
                    ) : (
                      <i className="fa-solid fa-inbox mr-2" />
                    )}

                    Receive

                  </button>

                  {/* IS COMING */}

                  <button
                    type="button"
                    onClick={
                      handleIsComing
                    }
                    disabled={
                      updatingStatus ||
                      deleting ||
                      String(
                        selectedStatus
                      ).toLowerCase() ===
                        "is coming"
                    }
                    className="flex items-center justify-center rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
                  >

                    <i className="fa-solid fa-person-walking mr-2" />

                    Is Coming

                  </button>

                </div>

              </div>

              {/* =================================================
                  CUSTOMER INFORMATION
              ================================================= */}

              <div className="rounded-xl border border-slate-100 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <i className="fa-solid fa-user" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Customer Information
                    </h3>

                    <p className="text-xs text-slate-400">
                      Customer details
                    </p>
                  </div>

                </div>

                <div className="mt-5 space-y-3">

                  {/* NAME */}

                  <div className="rounded-lg bg-slate-50 p-3">

                    <p className="text-xs text-slate-400">
                      Customer Name
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedCustomerName}
                    </p>

                  </div>

                  {/* PHONE */}

                  <div className="rounded-lg bg-slate-50 p-3">

                    <p className="text-xs text-slate-400">
                      Phone Number
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {selectedPhone}
                    </p>

                  </div>

                  {/* EMAIL */}

                  <div className="rounded-lg bg-slate-50 p-3">

                    <p className="text-xs text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-slate-800">
                      {selectedEmail}
                    </p>

                  </div>

                  {/* LOCATION */}

                  <div className="rounded-lg bg-slate-50 p-3">

                    <p className="text-xs text-slate-400">
                      Location
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-800">
                      {selectedLocation}
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  PRODUCT & SERVICE
              ================================================= */}

              <div className="rounded-xl border border-slate-100 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                    <i className="fa-solid fa-box" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Product & Service
                    </h3>

                    <p className="text-xs text-slate-400">
                      What the customer ordered
                    </p>
                  </div>

                </div>

                <div className="mt-5 space-y-3">

                  {/* PRODUCT */}

                  <div className="rounded-lg bg-slate-50 p-3">

                    <p className="text-xs text-slate-400">
                      Product
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedProduct}
                    </p>

                  </div>

                  {/* SERVICE PLAN */}

                  <div className="rounded-lg bg-slate-50 p-3">

                    <div className="flex items-center justify-between gap-3">

                      <div>

                        <p className="text-xs text-slate-400">
                          Service Plan
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          {selectedService}
                        </p>

                      </div>

                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${getServiceClass(
                          selectedService
                        )}`}
                      >
                        {selectedService}
                      </span>

                    </div>

                  </div>

                  {/* SERVICE PRICE */}

                  <div className="rounded-lg bg-orange-50 p-3">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-xs text-slate-400">
                          Service Fee
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {selectedService}
                        </p>

                      </div>

                      <p className="font-bold text-orange-600">
                        +
                        {formatMoney(
                          selectedServicePrice
                        )}
                      </p>

                    </div>

                  </div>

                  {/* CATEGORY */}

                  <div className="rounded-lg bg-slate-50 p-3">

                    <p className="text-xs text-slate-400">
                      Category
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {selectedCategory}
                    </p>

                  </div>

                  {/* QUANTITY */}

                  <div className="rounded-lg bg-slate-50 p-3">

                    <p className="text-xs text-slate-400">
                      Quantity
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedQuantity}
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  PRICE SUMMARY
              ================================================= */}

              <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Price Summary
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Complete order calculation
                    </p>

                  </div>

                  <i className="fa-solid fa-receipt text-orange-300" />

                </div>

                <div className="mt-4 space-y-3">

                  {/* PRODUCTS */}

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-600">
                      Products
                    </span>

                    <span className="font-semibold text-slate-800">
                      {formatMoney(
                        selectedProductsTotal
                      )}
                    </span>

                  </div>

                  {/* SERVICE */}

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-600">
                      {selectedService} Service
                    </span>

                    <span className="font-semibold text-orange-600">
                      +
                      {formatMoney(
                        selectedServicePrice
                      )}
                    </span>

                  </div>

                  <div className="border-t border-orange-200" />

                  {/* FINAL TOTAL */}

                  <div className="flex items-center justify-between">

                    <span className="text-base font-bold text-slate-900">
                      Final Total
                    </span>

                    <span className="text-2xl font-bold text-orange-600">
                      {formatMoney(
                        selectedTotal
                      )}
                    </span>

                  </div>

                </div>

              </div>

              {/* =================================================
                  ORDER INFORMATION
              ================================================= */}

              <div className="rounded-xl border border-slate-100 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                    <i className="fa-solid fa-receipt" />
                  </div>

                  <h3 className="font-semibold text-slate-900">
                    Order Information
                  </h3>

                </div>

                <div className="mt-5 space-y-4">

                  {/* FIRESTORE ID */}

                  <div>

                    <p className="text-xs text-slate-400">
                      Firestore ID
                    </p>

                    <p className="mt-1 break-all rounded-lg bg-slate-50 p-3 text-xs font-medium text-slate-700">
                      {selectedOrder.id}
                    </p>

                  </div>

                  {/* ORDER NUMBER */}

                  <div>

                    <p className="text-xs text-slate-400">
                      Order Number
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedOrderNumber}
                    </p>

                  </div>

                  {/* USER ID */}

                  <div>

                    <p className="text-xs text-slate-400">
                      Customer ID
                    </p>

                    <p className="mt-1 break-all text-xs text-slate-700">
                      {selectedOrder.userId ||
                        selectedOrder.uid ||
                        selectedOrder.customerId ||
                        "—"}
                    </p>

                  </div>

                  {/* CREATED */}

                  <div>

                    <p className="text-xs text-slate-400">
                      Order Date
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {formatDate(
                        selectedOrder.createdAt
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  NOTE
              ================================================= */}

              <div className="rounded-xl border border-slate-100 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
                    <i className="fa-solid fa-note-sticky" />
                  </div>

                  <h3 className="font-semibold text-slate-900">
                    Customer Note
                  </h3>

                </div>

                <div className="mt-4 rounded-lg bg-slate-50 p-4">

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {selectedNote}
                  </p>

                </div>

              </div>

              {/* =================================================
                  ORDERED ITEMS
              ================================================= */}

              {Array.isArray(
                selectedOrder.items
              ) &&
                selectedOrder.items.length > 0 && (

                  <div className="rounded-xl border border-slate-100 p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-500">
                        <i className="fa-solid fa-cart-shopping" />
                      </div>

                      <h3 className="font-semibold text-slate-900">
                        Ordered Items
                      </h3>

                    </div>

                    <div className="mt-4 space-y-3">

                      {selectedOrder.items.map(
                        (
                          item,
                          index
                        ) => {

                          const itemPrice =
                            Number(
                              item.unitPrice ??
                                item.price ??
                                0
                            );

                          const itemQuantity =
                            Number(
                              item.quantity ??
                                1
                            );

                          return (
                            <div
                              key={
                                item.id ||
                                index
                              }
                              className="rounded-lg bg-slate-50 p-3"
                            >

                              <div className="flex items-center gap-3">

                                {item.image && (
                                  <img
                                    src={
                                      item.image
                                    }
                                    alt={
                                      item.title ||
                                      item.name ||
                                      "Product"
                                    }
                                    className="h-14 w-14 rounded-lg object-cover"
                                  />
                                )}

                                <div className="min-w-0 flex-1">

                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {item.title ||
                                      item.name ||
                                      item.productName ||
                                      "Product"}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-500">
                                    Qty:{" "}
                                    {
                                      itemQuantity
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    Unit price:{" "}
                                    {formatMoney(
                                      itemPrice
                                    )}
                                  </p>

                                </div>

                                <p className="text-sm font-bold text-orange-600">
                                  {formatMoney(
                                    itemPrice *
                                      itemQuantity
                                  )}
                                </p>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>

                )}

              {/* =================================================
                  DELETE ORDER
              ================================================= */}

              <div className="rounded-xl border border-red-100 bg-red-50 p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <i className="fa-solid fa-trash" />
                  </div>

                  <div className="min-w-0">

                    <h3 className="font-semibold text-red-700">
                      Delete Order
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-red-500">
                      Permanently remove this order from the database.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    handleDeleteClick
                  }
                  disabled={
                    deleting ||
                    updatingStatus
                  }
                  className="mt-4 flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  <i className="fa-solid fa-trash mr-2" />

                  Delete This Order
                </button>

              </div>

              <div className="h-5" />

            </div>

          </aside>

        </>
      )}

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {showDeleteModal &&
        selectedOrder && (

          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

              {/* HEADER */}

              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">

                  <i className="fa-solid fa-trash" />

                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Delete Order?
                  </h2>

                  <p className="text-xs text-slate-400">
                    This action cannot be undone.
                  </p>

                </div>

              </div>

              {/* CONTENT */}

              <div className="px-5 py-5">

                <p className="text-sm leading-6 text-slate-600">

                  Are you sure you want to permanently
                  delete order{" "}

                  <span className="font-bold text-slate-900">
                    {selectedOrderNumber}
                  </span>

                  ?

                </p>

                <div className="mt-4 rounded-lg bg-red-50 p-3">

                  <p className="text-xs text-red-500">
                    Customer
                  </p>

                  <p className="mt-1 text-sm font-semibold text-red-700">
                    {selectedCustomerName}
                  </p>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 px-5 py-4">

                <button
                  type="button"
                  onClick={
                    cancelDelete
                  }
                  disabled={
                    deleting
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleDeleteOrder
                  }
                  disabled={
                    deleting
                  }
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >

                  {deleting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2" />

                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-trash mr-2" />

                      Delete
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        )}

    </main>
  );
}