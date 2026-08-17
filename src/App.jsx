import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Services from "./pages/Services";
import DetailCard from "./pages/DetailCard";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import AdminCategories from "./pages/AdminCategories";
import AdminOrder from "./pages/AdminOrder";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter basename="/Shoe-Shop">

          <Routes>

            {/* ==============================
                PUBLIC WEBSITE
            ============================== */}

            <Route element={<Layout />}>

              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/services"
                element={<Services />}
              />

              <Route
                path="/services/:serviceId"
                element={<DetailCard />}
              />

              <Route
                path="/about"
                element={<About />}
              />

              <Route
                path="/contact"
                element={<Contact />}
              />

            </Route>


            {/* ==============================
                LOGIN / REGISTER
            ============================== */}

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />


            {/* ==============================
                ADMIN ONLY
            ============================== */}

            <Route element={<ProtectedRoute />}>

              <Route
                path="/admin"
                element={<AdminDashboard />}
              />

              <Route
                path="/admin/category"
                element={<AdminCategories />}
              />

              <Route
                path="/admin/orders"
                element={<AdminOrder />}
              />

            </Route>

          </Routes>

        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}