import { Link } from "react-router-dom";
import { useState } from "react";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

// =========================================================
// MONEY
// =========================================================

const formatMoney = (amount) => {
  const number = Number(amount || 0);

  return `$${number.toFixed(2)}`;
};

// =========================================================
// SERVICE PRICES
// =========================================================

const SERVICE_PRICES = {
  Free: 0,
  Plus: 5,
  Pro: 10,
};

// =========================================================
// COMPONENT
// =========================================================

export default function CartDrawer() {
  const {
    cart,
    totalItems,
    totalPrice,
    isCartOpen,
    setCartOpen,
    increment,
    decrement,
    removeItem,
  } = useCart();

  const { user } = useAuth();

  // =======================================================
  // MODALS
  // =======================================================

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // =======================================================
  // FORM
  // =======================================================

  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");

  const [servicePlan, setServicePlan] = useState("Free");

  // =======================================================
  // SUBMIT STATE
  // =======================================================

  const [placingOrder, setPlacingOrder] = useState(false);

  // =======================================================
  // COMPLETED ORDER
  // =======================================================

  const [completedOrder, setCompletedOrder] = useState(null);

  // =======================================================
  // PRODUCTS TOTAL
  //
  // Always calculate from the actual cart items.
  // Do not depend only on totalPrice from context.
  // =======================================================

  const productsTotal = cart.reduce((sum, item) => {
    const price = Number(
      item.unitPrice ??
        item.price ??
        0
    );

    const quantity = Number(
      item.quantity || 1
    );

    return sum + price * quantity;
  }, 0);

  // =======================================================
  // SERVICE EXTRA PRICE
  // =======================================================

  const serviceExtraPrice = Number(
    SERVICE_PRICES[servicePlan] || 0
  );

  // =======================================================
  // FINAL TOTAL
  //
  // THIS IS THE IMPORTANT CALCULATION.
  //
  // Products + service fee
  // =======================================================

  const finalTotal =
    productsTotal + serviceExtraPrice;

  // =======================================================
  // OPEN ORDER
  // =======================================================

  const handleOrder = () => {
    if (placingOrder) {
      return;
    }

    if (!cart || cart.length === 0) {
      return;
    }

    setShowOrderModal(true);
  };

  // =======================================================
  // SELECT SERVICE
  // =======================================================

  const selectService = (plan) => {
    if (placingOrder) {
      return;
    }

    if (!SERVICE_PRICES.hasOwnProperty(plan)) {
      return;
    }

    setServicePlan(plan);
  };

  // =======================================================
  // STEP 1
  //
  // USER CLICKS OKAY
  // =======================================================

  const handleContinueToConfirm = (event) => {
    event.preventDefault();

    if (placingOrder) {
      return;
    }

    if (!phone.trim()) {
      return;
    }

    if (!location.trim()) {
      return;
    }

    setShowOrderModal(false);
    setShowConfirmModal(true);
  };

  // =======================================================
  // BACK TO ORDER FORM
  // =======================================================

  const handleBackToOrder = () => {
    if (placingOrder) {
      return;
    }

    setShowConfirmModal(false);
    setShowOrderModal(true);
  };

  // =======================================================
  // SUBMIT ORDER TO FIREBASE
  // =======================================================

  const handleSubmitOrder = async () => {
    if (placingOrder) {
      return;
    }

    if (!user) {
      return;
    }

    if (!cart || cart.length === 0) {
      return;
    }

    try {
      setPlacingOrder(true);

      // ===================================================
      // CALCULATE EVERYTHING AGAIN BEFORE SAVING
      //
      // This prevents stale React values.
      // ===================================================

      const firebaseProductsTotal =
        cart.reduce((sum, item) => {
          const price = Number(
            item.unitPrice ??
              item.price ??
              0
          );

          const quantity = Number(
            item.quantity || 1
          );

          return (
            sum +
            price * quantity
          );
        }, 0);

      const firebaseServiceExtraPrice =
        Number(
          SERVICE_PRICES[servicePlan] || 0
        );

      const firebaseFinalTotal =
        firebaseProductsTotal +
        firebaseServiceExtraPrice;

      // ===================================================
      // PREPARE CART ITEMS
      //
      // Save a snapshot of the products at order time.
      // ===================================================

      const orderItems = cart.map(
        (item) => {
          const unitPrice = Number(
            item.unitPrice ??
              item.price ??
              0
          );

          const quantity = Number(
            item.quantity || 1
          );

          return {
            id: item.id || "",
            title:
              item.title ||
              item.name ||
              "Product",
            name:
              item.name ||
              item.title ||
              "Product",
            image: item.image || "",
            category:
              item.category || "",
            unitPrice,
            quantity,
            itemTotal:
              unitPrice * quantity,
          };
        }
      );

      // ===================================================
      // ORDER NUMBER
      // ===================================================

      const generatedOrderNumber =
        `#ORD-${Date.now()
          .toString()
          .slice(-8)}`;

      // ===================================================
      // FIREBASE ORDER DOCUMENT
      // ===================================================

      const orderData = {
        // -------------------------------------------------
        // ORDER IDENTIFICATION
        // -------------------------------------------------

        orderNumber:
          generatedOrderNumber,

        // -------------------------------------------------
        // USER
        // -------------------------------------------------

        userId: user.uid || "",

        uid: user.uid || "",

        customerId:
          user.uid || "",

        // -------------------------------------------------
        // CUSTOMER
        // -------------------------------------------------

        customerName:
          user.displayName ||
          user.email?.split("@")[0] ||
          "Customer",

        customerEmail:
          user.email || "",

        email:
          user.email || "",

        // -------------------------------------------------
        // CUSTOMER INPUT
        // -------------------------------------------------

        phone:
          phone.trim(),

        customerPhone:
          phone.trim(),

        phoneNumber:
          phone.trim(),

        location:
          location.trim(),

        address:
          location.trim(),

        note:
          note.trim(),

        // -------------------------------------------------
        // PRODUCTS
        // -------------------------------------------------

        items:
          orderItems,

        totalItems:
          orderItems.reduce(
            (sum, item) =>
              sum +
              Number(
                item.quantity || 0
              ),
            0
          ),

        // -------------------------------------------------
        // PRODUCT TOTAL
        // -------------------------------------------------

        productsTotal:
          Number(
            firebaseProductsTotal.toFixed(2)
          ),

        // -------------------------------------------------
        // SERVICE
        // -------------------------------------------------

        servicePlan:
          servicePlan,

        service:
          servicePlan,

        plan:
          servicePlan,

        // -------------------------------------------------
        // SERVICE PRICE
        // -------------------------------------------------

        serviceExtraPrice:
          Number(
            firebaseServiceExtraPrice.toFixed(
              2
            )
          ),

        serviceFee:
          Number(
            firebaseServiceExtraPrice.toFixed(
              2
            )
          ),

        // -------------------------------------------------
        // FINAL TOTAL
        //
        // IMPORTANT:
        // totalPrice is ALSO the final amount.
        // This makes AdminOrder compatible.
        // -------------------------------------------------

        finalTotal:
          Number(
            firebaseFinalTotal.toFixed(2)
          ),

        totalWithService:
          Number(
            firebaseFinalTotal.toFixed(2)
          ),

        total:
          Number(
            firebaseFinalTotal.toFixed(2)
          ),

        totalPrice:
          Number(
            firebaseFinalTotal.toFixed(2)
          ),

        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        status:
          "Received",

        // -------------------------------------------------
        // TIMESTAMP
        // -------------------------------------------------

        createdAt:
          serverTimestamp(),
      };

      // ===================================================
      // SAVE TO FIREBASE
      // ===================================================

      console.log(
        "Saving order to Firebase:",
        orderData
      );

      const orderRef = await addDoc(
        collection(db, "orders"),
        orderData
      );

      console.log(
        "Order saved successfully:",
        orderRef.id
      );

      // ===================================================
      // REMOVE PURCHASED PRODUCTS FROM CART
      // ===================================================

      for (const item of cart) {
        try {
          removeItem(item.id);
        } catch (removeError) {
          console.error(
            "Could not remove cart item:",
            removeError
          );
        }
      }

      // ===================================================
      // SAVE SUCCESS INFORMATION
      // ===================================================

      setCompletedOrder({
        id: orderRef.id,

        orderNumber:
          generatedOrderNumber,

        phone:
          phone.trim(),

        location:
          location.trim(),

        servicePlan:
          servicePlan,

        serviceExtraPrice:
          firebaseServiceExtraPrice,

        productsTotal:
          firebaseProductsTotal,

        totalItems:
          orderData.totalItems,

        totalPrice:
          firebaseFinalTotal,
      });

      // ===================================================
      // CLOSE CONFIRMATION
      // ===================================================

      setShowConfirmModal(false);

      // ===================================================
      // CLOSE CART
      // ===================================================

      setCartOpen(false);

      // ===================================================
      // RESET FORM
      // ===================================================

      setPhone("");
      setLocation("");
      setNote("");
      setServicePlan("Free");

      // ===================================================
      // SHOW SUCCESS MODAL
      // ===================================================

      setShowSuccessModal(true);
    } catch (error) {
      console.error(
        "Firebase order error:",
        error
      );

      // Keep modal open so user can try again.
      // No browser alert.
    } finally {
      setPlacingOrder(false);
    }
  };

  // =======================================================
  // CLOSE SUCCESS
  // =======================================================

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setCompletedOrder(null);
  };

  // =======================================================
  // SERVICE BUTTON CLASS
  // =======================================================

  const serviceButtonClass = (
    plan
  ) => {
    return `
      rounded-lg
      border
      p-3
      text-left
      transition
      ${
        servicePlan === plan
          ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }
    `;
  };

  // =======================================================
  // RETURN
  // =======================================================

  return (
    <>
      {/* ===================================================
          CART DRAWER
      =================================================== */}

      <div
        id="shop-category-bar"
        className={`
          fixed
          ${
            isCartOpen
              ? ""
              : "hidden"
          }
          top-0
          right-0
          z-[60]
          h-screen
          w-full
          overflow-y-auto
          bg-white
          shadow-lg
          sm:w-[92%]
          md:max-w-2xl
        `}
      >
        <div className="p-4 sm:p-6">

          {/* HEADER */}

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-2xl font-bold text-gray-950">
                My Products
              </h1>

              <p className="text-sm text-gray-500">
                Items added by user
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setCartOpen(false)
              }
              className="text-gray-700 hover:text-gray-500"
              aria-label="Close cart"
            >
              <i className="fa-solid fa-xmark text-2xl" />
            </button>

          </div>

          <hr className="my-4 border-red-200" />

          {/* TABLE HEADER */}

          <div className="hidden md:grid grid-cols-[70px_1fr_90px_90px_120px] gap-3 px-3 py-2 text-xs font-bold uppercase text-gray-500">
            <span>ID</span>
            <span>Product</span>
            <span>Amount</span>
            <span>Price</span>
            <span>Actions</span>
          </div>

          {/* EMPTY */}

          {cart.length === 0 ? (

            <div className="rounded-lg border border-dashed border-red-200 bg-red-50/40 p-6 text-center text-sm text-gray-500">
              Your cart is empty.
            </div>

          ) : (

            <div className="space-y-3">

              {cart.map(
                (item, index) => {

                  const itemPrice =
                    Number(
                      item.unitPrice ??
                        item.price ??
                        0
                    );

                  const itemQuantity =
                    Number(
                      item.quantity || 1
                    );

                  const itemTotal =
                    itemPrice *
                    itemQuantity;

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 gap-3 rounded-lg border border-red-100 p-3 md:grid-cols-[70px_1fr_90px_90px_120px] md:items-center"
                    >

                      {/* ID */}

                      <p className="text-sm font-bold text-gray-600">
                        #P
                        {String(
                          index + 1
                        ).padStart(
                          3,
                          "0"
                        )}
                      </p>

                      {/* PRODUCT */}

                      <div className="flex min-w-0 items-center gap-3">

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
                            className="h-16 w-16 rounded-md object-cover"
                          />
                        )}

                        <div className="min-w-0">

                          <h2 className="truncate font-bold text-gray-900">
                            {item.title ||
                              item.name ||
                              "Product"}
                          </h2>

                          <p className="text-xs text-gray-500">
                            {item.category ||
                              "Product"}
                          </p>

                        </div>

                      </div>

                      {/* QUANTITY */}

                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            decrement(
                              item.id
                            )
                          }
                          disabled={
                            itemQuantity <=
                            1
                          }
                          className={`
                            h-8
                            w-8
                            rounded
                            border
                            border-gray-200
                            hover:bg-red-50
                            ${
                              itemQuantity <=
                              1
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            }
                          `}
                        >
                          -
                        </button>

                        <span className="w-8 text-center font-bold">
                          {
                            itemQuantity
                          }
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increment(
                              item.id
                            )
                          }
                          className="h-8 w-8 rounded border border-gray-200 hover:bg-red-50"
                        >
                          +
                        </button>

                      </div>

                      {/* PRICE */}

                      <p className="font-bold text-orange-600">
                        {formatMoney(
                          itemTotal
                        )}
                      </p>

                      {/* ACTIONS */}

                      <div className="flex gap-2">

                        <Link
                          to={`/services/${item.id}`}
                          onClick={() =>
                            setCartOpen(
                              false
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <i className="fa-solid fa-eye" />
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.id
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

          {/* =================================================
              CART TOTAL
          ================================================= */}

          {cart.length > 0 && (

            <div className="mt-5 rounded-lg bg-gray-50 p-4">

              <div className="flex justify-between text-sm text-gray-600">

                <span>
                  Total items
                </span>

                <span className="font-bold text-gray-900">
                  {totalItems}
                </span>

              </div>

              <div className="mt-2 flex justify-between text-lg font-bold">

                <span>
                  Products Total
                </span>

                <span className="text-orange-600">
                  {formatMoney(
                    productsTotal
                  )}
                </span>

              </div>

              <button
                type="button"
                onClick={handleOrder}
                disabled={
                  placingOrder
                }
                className="mt-4 block w-full rounded-md bg-red-500 py-3 text-center font-bold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Order Now
              </button>

              <Link
                to="/services"
                onClick={() =>
                  setCartOpen(
                    false
                  )
                }
                className="mt-3 block w-full rounded-md border border-red-200 py-3 text-center font-bold text-red-600 hover:bg-red-50"
              >
                View More Products
              </Link>

            </div>
          )}

        </div>
      </div>

      {/* ===================================================
          STEP 1
          ORDER INFORMATION
      =================================================== */}

      {showOrderModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

              <div>
                <h2 className="text-lg font-extrabold text-gray-950">
                  Complete Your Order
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Enter your order information.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowOrderModal(
                    false
                  )
                }
                disabled={
                  placingOrder
                }
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <i className="fa-solid fa-xmark" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleContinueToConfirm
              }
              className="space-y-4 p-5"
            >

              {/* PHONE */}

              <div>

                <label className="text-sm font-bold text-gray-800">
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  placeholder="Enter phone number"
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                  required
                />

              </div>

              {/* LOCATION */}

              <div>

                <label className="text-sm font-bold text-gray-800">
                  Location
                </label>

                <textarea
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="Enter your location"
                  rows={2}
                  className="mt-1.5 w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                  required
                />

              </div>

              {/* NOTE */}

              <div>

                <label className="text-sm font-bold text-gray-800">
                  Note

                  <span className="ml-2 font-normal text-gray-400">
                    Optional
                  </span>
                </label>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(
                      event.target.value
                    )
                  }
                  placeholder="Any special instructions?"
                  rows={2}
                  className="mt-1.5 w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                />

              </div>

              {/* SERVICE */}

              <div>

                <label className="text-sm font-bold text-gray-800">
                  Service Plan
                </label>

                <div className="mt-2 grid grid-cols-3 gap-2">

                  {/* FREE */}

                  <button
                    type="button"
                    onClick={() =>
                      selectService(
                        "Free"
                      )
                    }
                    className={
                      serviceButtonClass(
                        "Free"
                      )
                    }
                  >
                    <p className="font-bold text-gray-900">
                      Free
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Included
                    </p>

                    <p className="mt-2 text-sm font-extrabold text-orange-600">
                      +$0
                    </p>
                  </button>

                  {/* PLUS */}

                  <button
                    type="button"
                    onClick={() =>
                      selectService(
                        "Plus"
                      )
                    }
                    className={
                      serviceButtonClass(
                        "Plus"
                      )
                    }
                  >
                    <p className="font-bold text-gray-900">
                      Plus
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Extra care
                    </p>

                    <p className="mt-2 text-sm font-extrabold text-orange-600">
                      +$5
                    </p>
                  </button>

                  {/* PRO */}

                  <button
                    type="button"
                    onClick={() =>
                      selectService(
                        "Pro"
                      )
                    }
                    className={
                      serviceButtonClass(
                        "Pro"
                      )
                    }
                  >
                    <p className="font-bold text-gray-900">
                      Pro
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Premium care
                    </p>

                    <p className="mt-2 text-sm font-extrabold text-orange-600">
                      +$10
                    </p>
                  </button>

                </div>

              </div>

              {/* =================================================
                  LIVE TOTAL
              ================================================= */}

              <div className="rounded-xl bg-gray-50 p-4">

                <div className="flex justify-between text-sm text-gray-600">

                  <span>
                    Products
                  </span>

                  <span className="font-medium text-gray-900">
                    {formatMoney(
                      productsTotal
                    )}
                  </span>

                </div>

                <div className="mt-2 flex justify-between text-sm text-gray-600">

                  <span>
                    {servicePlan} service
                  </span>

                  <span className="font-medium text-orange-600">
                    +
                    {formatMoney(
                      serviceExtraPrice
                    )}
                  </span>

                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">

                  <span className="font-extrabold text-gray-900">
                    Final Total
                  </span>

                  <span className="text-2xl font-extrabold text-orange-600">
                    {formatMoney(
                      finalTotal
                    )}
                  </span>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="grid grid-cols-2 gap-3 pt-1">

                <button
                  type="button"
                  onClick={() =>
                    setShowOrderModal(
                      false
                    )
                  }
                  disabled={
                    placingOrder
                  }
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    placingOrder
                  }
                  className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700"
                >
                  Okay
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* ===================================================
          STEP 2
          CONFIRM
      =================================================== */}

      {showConfirmModal && (

        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <i className="fa-solid fa-circle-question text-xl" />
            </div>

            <h2 className="mt-3 text-center text-lg font-extrabold text-gray-900">
              Are you sure?
            </h2>

            <p className="mt-1 text-center text-sm text-gray-500">
              Please check your order before submitting.
            </p>

            {/* SUMMARY */}

            <div className="mt-4 rounded-xl bg-gray-50 p-3">

              <div className="flex justify-between text-sm">

                <span className="text-gray-500">
                  Service
                </span>

                <span className="font-bold text-gray-900">
                  {servicePlan}
                </span>

              </div>

              <div className="mt-2 flex justify-between text-sm">

                <span className="text-gray-500">
                  Products
                </span>

                <span className="font-medium text-gray-900">
                  {formatMoney(
                    productsTotal
                  )}
                </span>

              </div>

              <div className="mt-2 flex justify-between text-sm">

                <span className="text-gray-500">
                  Service fee
                </span>

                <span className="font-medium text-orange-600">
                  +
                  {formatMoney(
                    serviceExtraPrice
                  )}
                </span>

              </div>

              <div className="mt-3 flex justify-between border-t border-gray-200 pt-3">

                <span className="font-extrabold text-gray-900">
                  Total
                </span>

                <span className="text-lg font-extrabold text-orange-600">
                  {formatMoney(
                    finalTotal
                  )}
                </span>

              </div>

            </div>

            {/* BUTTONS */}

            <div className="mt-4 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={
                  handleBackToOrder
                }
                disabled={
                  placingOrder
                }
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSubmitOrder
                }
                disabled={
                  placingOrder
                }
                className={`
                  rounded-lg
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  ${
                    placingOrder
                      ? "bg-gray-400"
                      : "bg-orange-600 hover:bg-orange-700"
                  }
                `}
              >
                {placingOrder ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Submit"
                )}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ===================================================
          STEP 3
          SUCCESS
      =================================================== */}

      {showSuccessModal &&
        completedOrder && (

          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">

              {/* ICON */}

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">

                <i className="fa-solid fa-check text-2xl" />

              </div>

              <h2 className="mt-3 text-center text-xl font-extrabold text-gray-900">
                You Ordered!
              </h2>

              <p className="mt-1 text-center text-sm text-gray-500">
                Your order has been submitted successfully.
              </p>

              {/* ORDER INFO */}

              <div className="mt-4 rounded-xl bg-gray-50 p-3">

                <div className="flex justify-between text-sm">

                  <span className="text-gray-500">
                    Order ID
                  </span>

                  <span className="font-bold text-gray-900">
                    #
                    {String(
                      completedOrder.id
                    )
                      .slice(
                        0,
                        8
                      )
                      .toUpperCase()}
                  </span>

                </div>

                <div className="mt-2 flex justify-between text-sm">

                  <span className="text-gray-500">
                    Service
                  </span>

                  <span className="font-bold text-gray-900">
                    {
                      completedOrder.servicePlan
                    }
                  </span>

                </div>

                <div className="mt-2 flex justify-between text-sm">

                  <span className="text-gray-500">
                    Products
                  </span>

                  <span className="font-medium text-gray-900">
                    {formatMoney(
                      completedOrder.productsTotal
                    )}
                  </span>

                </div>

                <div className="mt-2 flex justify-between text-sm">

                  <span className="text-gray-500">
                    Service fee
                  </span>

                  <span className="font-medium text-orange-600">
                    +
                    {formatMoney(
                      completedOrder.serviceExtraPrice
                    )}
                  </span>

                </div>

                <div className="mt-2 flex justify-between text-sm">

                  <span className="text-gray-500">
                    Items
                  </span>

                  <span className="font-bold text-gray-900">
                    {
                      completedOrder.totalItems
                    }
                  </span>

                </div>

                <div className="mt-3 flex justify-between border-t border-gray-200 pt-3">

                  <span className="font-bold text-gray-700">
                    Final Total
                  </span>

                  <span className="text-xl font-extrabold text-orange-600">
                    {formatMoney(
                      completedOrder.totalPrice
                    )}
                  </span>

                </div>

              </div>

              {/* OKAY */}

              <button
                type="button"
                onClick={
                  handleCloseSuccess
                }
                className="mt-4 w-full rounded-lg bg-orange-600 py-2.5 text-sm font-extrabold text-white hover:bg-orange-700"
              >
                Okay
              </button>

            </div>

          </div>
        )}

    </>
  );
}