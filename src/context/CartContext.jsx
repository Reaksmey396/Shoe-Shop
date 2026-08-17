import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const CART_KEY = "solestyleCart";

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();

  const [cart, setCart] = useState(loadCart);
  const [isCartOpen, setCartOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  /* =========================================================
     SAVE CART
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  /* =========================================================
     SYNC CART BETWEEN TABS
  ========================================================= */

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === CART_KEY) {
        setCart(loadCart());
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  /* =========================================================
     ADD ITEM
  ========================================================= */

  const addItem = (service, serviceId) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === serviceId
      );

      if (existing) {
        return prev.map((item) =>
          item.id === serviceId
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id: serviceId,
          title: service.title,
          category: service.category,
          image: service.image,

          unitPrice:
            Number(
              String(service.price).replace(
                /[^0-9.]/g,
                ""
              )
            ) || 0,

          quantity: 1,
        },
      ];
    });

    setCartOpen(true);
  };

  /* =========================================================
     INCREMENT
  ========================================================= */

  const increment = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  /* =========================================================
     DECREMENT
  ========================================================= */

  const decrement = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                item.quantity - 1
              ),
            }
          : item
      )
    );
  };

  /* =========================================================
     REMOVE
  ========================================================= */

  const removeItem = (id) => {
    setCart((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  /* =========================================================
     PLACE ORDER
     
     IMPORTANT:
     This creates a REAL Firebase order.
  ========================================================= */

  const placeOrder = async () => {
    if (cart.length === 0) {
      return null;
    }

    if (placingOrder) {
      return null;
    }

    setPlacingOrder(true);

    try {
      const totalItems = cart.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0
      );

      const totalPrice = cart.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0) *
            Number(item.unitPrice || 0),
        0
      );

      /* =====================================================
         CUSTOMER INFORMATION
      ===================================================== */

      const customerName =
        user?.displayName ||
        user?.email?.split("@")[0] ||
        "Guest Customer";

      const customerEmail =
        user?.email || "";

      /* =====================================================
         ORDER DATA
      ===================================================== */

      const orderData = {
        customerName,
        customerEmail,

        userId: user?.uid || null,

        items: cart.map((item) => ({
          id: item.id,
          title: item.title,
          name: item.title,
          category: item.category || "",
          image: item.image || "",

          quantity: Number(
            item.quantity || 1
          ),

          price: Number(
            item.unitPrice || 0
          ),
        })),

        totalItems,
        totalPrice,

        /* Admin uses this */
        total: totalPrice,

        /* New customer order */
        status: "Pending",

        /* Notification information */
        isNew: true,
        adminNotified: false,

        createdAt: serverTimestamp(),
      };

      /* =====================================================
         SAVE TO FIREBASE
      ===================================================== */

      const orderRef = await addDoc(
        collection(db, "orders"),
        orderData
      );

      /* =====================================================
         CLEAR CART ONLY AFTER FIREBASE SUCCESS
      ===================================================== */

      setCart([]);

      setCartOpen(false);

      return {
        id: orderRef.id,
        totalItems,
        totalPrice,
        customerName,
      };
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      throw error;
    } finally {
      setPlacingOrder(false);
    }
  };

  /* =========================================================
     TOTALS
  ========================================================= */

  const totals = useMemo(() => {
    const totalItems = cart.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );

    const totalPrice = cart.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0) *
          Number(item.unitPrice || 0),
      0
    );

    return {
      totalItems,
      totalPrice,
    };
  }, [cart]);

  /* =========================================================
     CONTEXT
  ========================================================= */

  const value = {
    cart,

    ...totals,

    isCartOpen,
    setCartOpen,

    placingOrder,

    addItem,
    increment,
    decrement,
    removeItem,

    placeOrder,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error(
      "useCart must be used inside a <CartProvider>"
    );
  }

  return ctx;
}