import React, { useEffect, useState } from "react";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function AdminProduct() {
    const { user, loading: authLoading } = useAuth();

    // =====================================================
    // STATE
    // =====================================================

    const [products, setProducts] = useState([]);

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const [editingProduct, setEditingProduct] = useState(null);

    // =====================================================
    // FORM STATE
    // =====================================================

    const [name, setName] = useState("");

    const [imageUrl, setImageUrl] = useState("");

    const [price, setPrice] = useState("");

    const [category, setCategory] = useState("");

    const [turnaround, setTurnaround] = useState("");

    const [status, setStatus] = useState("active");

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (timestamp) => {
        if (!timestamp) {
            return "-";
        }

        try {
            let date;

            if (typeof timestamp.toDate === "function") {
                date = timestamp.toDate();
            } else if (timestamp instanceof Date) {
                date = timestamp;
            } else {
                date = new Date(timestamp);
            }

            if (Number.isNaN(date.getTime())) {
                return "-";
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
                "DATE FORMAT ERROR:",
                error
            );

            return "-";
        }
    };

    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    const fetchProducts = async () => {
        if (!user) {
            setProducts([]);
            return;
        }

        try {
            console.log(
                "========== LOAD PRODUCTS =========="
            );

            const snapshot = await getDocs(
                collection(db, "products")
            );

            const productData =
                snapshot.docs.map((item) => ({
                    id: item.id,
                    ...item.data(),
                }));

            // Newest first
            productData.sort((a, b) => {
                const dateA =
                    a.createdAt?.toMillis?.() || 0;

                const dateB =
                    b.createdAt?.toMillis?.() || 0;

                return dateB - dateA;
            });

            setProducts(productData);

            console.log(
                "Products loaded:",
                productData
            );
        } catch (error) {
            console.error(
                "FETCH PRODUCTS ERROR:",
                error
            );

            alert(
                `Cannot load products.\n\n${error.message}`
            );
        }
    };

    // =====================================================
    // LOAD CATEGORIES
    // =====================================================

    const fetchCategories = async () => {
        if (!user) {
            setCategories([]);
            return;
        }

        try {
            console.log(
                "========== LOAD CATEGORIES =========="
            );

            const snapshot = await getDocs(
                collection(db, "categories")
            );

            const categoryData =
                snapshot.docs.map((item) => ({
                    id: item.id,
                    ...item.data(),
                }));

            categoryData.sort((a, b) =>
                String(a.name || "").localeCompare(
                    String(b.name || "")
                )
            );

            setCategories(categoryData);

            console.log(
                "Categories loaded:",
                categoryData
            );
        } catch (error) {
            console.error(
                "FETCH CATEGORIES ERROR:",
                error
            );

            alert(
                `Cannot load categories.\n\n${error.message}`
            );
        }
    };

    // =====================================================
    // LOAD DATA
    // =====================================================

    const fetchData = async () => {
        if (!user) {
            setProducts([]);
            setCategories([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            await Promise.all([
                fetchProducts(),
                fetchCategories(),
            ]);
        } catch (error) {
            console.error(
                "FETCH DATA ERROR:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // AUTH -> LOAD
    // =====================================================

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            setProducts([]);
            setCategories([]);
            setLoading(false);
            return;
        }

        fetchData();
    }, [user, authLoading]);

    // =====================================================
    // OPEN ADD MODAL
    // =====================================================

    const openAddModal = () => {
        setEditingProduct(null);

        setName("");

        setImageUrl("");

        setPrice("");

        setCategory(
            categories.length > 0
                ? categories[0].name
                : ""
        );

        setTurnaround("");

        setStatus("active");

        setShowModal(true);
    };

    // =====================================================
    // OPEN EDIT MODAL
    // =====================================================

    const openEditModal = (product) => {
        setEditingProduct(product);

        setName(product.name || "");

        setImageUrl(
            product.imageUrl || ""
        );

        setPrice(
            product.price !== undefined &&
            product.price !== null
                ? String(product.price)
                : ""
        );

        setCategory(
            product.category || ""
        );

        setTurnaround(
            product.turnaround !== undefined &&
            product.turnaround !== null
                ? String(product.turnaround)
                : ""
        );

        setStatus(
            product.status || "active"
        );

        setShowModal(true);
    };

    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);

        setEditingProduct(null);

        setName("");

        setImageUrl("");

        setPrice("");

        setCategory("");

        setTurnaround("");

        setStatus("active");
    };

    // =====================================================
    // ADD PRODUCT
    // =====================================================

    const handleAddProduct = async (event) => {
        event.preventDefault();

        if (saving) {
            return;
        }

        if (!user) {
            alert("Please login first.");
            return;
        }

        if (!name.trim()) {
            alert("Please enter product name.");
            return;
        }

        if (!price.trim()) {
            alert("Please enter price.");
            return;
        }

        if (!category.trim()) {
            alert("Please select a category.");
            return;
        }

        if (!turnaround.trim()) {
            alert("Please enter turnaround.");
            return;
        }

        try {
            setSaving(true);

            console.log(
                "========== ADD PRODUCT =========="
            );

            const productData = {
                name: name.trim(),

                imageUrl: imageUrl.trim(),

                price: Number(price),

                category: category.trim(),

                turnaround: Number(turnaround),

                status: status,

                createdBy: user.uid,

                createdByEmail:
                    user.email || "",

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp(),
            };

            console.log(
                "Product data:",
                productData
            );

            // =================================================
            // CREATE FIRESTORE DOCUMENT
            // =================================================

            const docRef =
                await addDoc(
                    collection(
                        db,
                        "products"
                    ),
                    productData
                );

            console.log(
                "Product created:",
                docRef.id
            );

            // =================================================
            // UPDATE UI
            // =================================================

            const newProduct = {
                id: docRef.id,

                name: name.trim(),

                imageUrl: imageUrl.trim(),

                price: Number(price),

                category: category.trim(),

                turnaround:
                    Number(turnaround),

                status: status,

                createdBy: user.uid,

                createdByEmail:
                    user.email || "",

                createdAt: new Date(),

                updatedAt: new Date(),
            };

            setProducts(
                (previous) => [
                    newProduct,
                    ...previous,
                ]
            );

            // =================================================
            // RESET
            // =================================================

            setShowModal(false);

            setEditingProduct(null);

            setName("");

            setImageUrl("");

            setPrice("");

            setCategory("");

            setTurnaround("");

            setStatus("active");

            alert(
                "Product added successfully!"
            );
        } catch (error) {
            console.error(
                "ADD PRODUCT ERROR:",
                error
            );

            alert(
                `Cannot add product.\n\nCode: ${
                    error.code || "unknown"
                }\nMessage: ${
                    error.message
                }`
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // EDIT PRODUCT
    // =====================================================

    const handleEditProduct = async (event) => {
        event.preventDefault();

        if (saving) {
            return;
        }

        if (!user) {
            alert("Please login first.");
            return;
        }

        if (!editingProduct) {
            alert("No product selected.");
            return;
        }

        if (!name.trim()) {
            alert("Please enter product name.");
            return;
        }

        if (!price.trim()) {
            alert("Please enter price.");
            return;
        }

        if (!category.trim()) {
            alert("Please select a category.");
            return;
        }

        if (!turnaround.trim()) {
            alert("Please enter turnaround.");
            return;
        }

        try {
            setSaving(true);

            console.log(
                "========== EDIT PRODUCT =========="
            );

            const productRef = doc(
                db,
                "products",
                editingProduct.id
            );

            const updateData = {
                name: name.trim(),

                imageUrl: imageUrl.trim(),

                price: Number(price),

                category: category.trim(),

                turnaround:
                    Number(turnaround),

                status: status,

                updatedAt:
                    serverTimestamp(),
            };

            await updateDoc(
                productRef,
                updateData
            );

            // =================================================
            // UPDATE UI
            // =================================================

            setProducts(
                (previous) =>
                    previous.map(
                        (product) =>
                            product.id ===
                            editingProduct.id
                                ? {
                                      ...product,

                                      name:
                                          name.trim(),

                                      imageUrl:
                                          imageUrl.trim(),

                                      price:
                                          Number(
                                              price
                                          ),

                                      category:
                                          category.trim(),

                                      turnaround:
                                          Number(
                                              turnaround
                                          ),

                                      status:
                                          status,

                                      updatedAt:
                                          new Date(),
                                  }
                                : product
                    )
            );

            // =================================================
            // CLOSE
            // =================================================

            setShowModal(false);

            setEditingProduct(null);

            setName("");

            setImageUrl("");

            setPrice("");

            setCategory("");

            setTurnaround("");

            setStatus("active");

            alert(
                "Product updated successfully!"
            );
        } catch (error) {
            console.error(
                "EDIT PRODUCT ERROR:",
                error
            );

            alert(
                `Cannot update product.\n\nCode: ${
                    error.code || "unknown"
                }\nMessage: ${
                    error.message
                }`
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    const handleDeleteProduct = async (
        product
    ) => {
        if (saving) {
            return;
        }

        if (!user) {
            alert("Please login first.");
            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {
            setSaving(true);

            await deleteDoc(
                doc(
                    db,
                    "products",
                    product.id
                )
            );

            setProducts(
                (previous) =>
                    previous.filter(
                        (item) =>
                            item.id !==
                            product.id
                    )
            );

            alert(
                "Product deleted successfully!"
            );
        } catch (error) {
            console.error(
                "DELETE PRODUCT ERROR:",
                error
            );

            alert(
                `Cannot delete product.\n\n${error.message}`
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // IMAGE ERROR
    // =====================================================

    const handleImageError = (event) => {
        event.currentTarget.style.display =
            "none";
    };

    // =====================================================
    // AUTH LOADING
    // =====================================================

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

    // =====================================================
    // NOT LOGIN
    // =====================================================

    if (!user) {
        return (
            <main className="p-5 sm:p-8">

                <div className="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">

                    <i className="fa-solid fa-lock text-3xl text-red-400" />

                    <h2 className="mt-4 text-xl font-semibold text-slate-900">
                        Login Required
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Please login to manage products.
                    </p>

                </div>

            </main>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <main className="p-5 sm:p-8">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-7 flex items-center justify-between">

                <div>

                    <h2 className="text-2xl font-semibold text-slate-900">
                        Products & Services
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage the services available to your customers.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    disabled={saving}
                    className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >

                    <i className="fa-solid fa-plus mr-2" />

                    Add Product

                </button>

            </div>

            {/* =================================================
                PRODUCT TABLE
            ================================================= */}

            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">

                <table className="w-full min-w-[1100px] text-left text-sm">

                    <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">

                        <tr>

                            <th className="px-6 py-4 font-medium">
                                Image
                            </th>

                            <th className="px-6 py-4 font-medium">
                                Product
                            </th>

                            <th className="px-6 py-4 font-medium">
                                Category
                            </th>

                            <th className="px-6 py-4 font-medium">
                                Price
                            </th>

                            <th className="px-6 py-4 font-medium">
                                Turnaround
                            </th>

                            <th className="px-6 py-4 font-medium">
                                Status
                            </th>

                            <th className="px-6 py-4 font-medium">
                                Created
                            </th>

                            <th className="px-6 py-4 font-medium">
                                Updated
                            </th>

                            <th className="px-6 py-4 text-right font-medium">
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {/* LOADING */}

                        {loading && (
                            <tr>

                                <td
                                    colSpan="9"
                                    className="py-16 text-center"
                                >

                                    <i className="fa-solid fa-spinner fa-spin text-xl text-red-500" />

                                    <p className="mt-3 text-sm text-slate-500">
                                        Loading products...
                                    </p>

                                </td>

                            </tr>
                        )}

                        {/* EMPTY */}

                        {!loading &&
                            products.length ===
                                0 && (
                                <tr>

                                    <td
                                        colSpan="9"
                                        className="py-16 text-center"
                                    >

                                        <i className="fa-solid fa-box-open text-4xl text-slate-300" />

                                        <h3 className="mt-4 text-lg font-semibold text-slate-800">
                                            No Products
                                        </h3>

                                        <p className="mt-2 text-sm text-slate-500">
                                            Create your first product.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={
                                                openAddModal
                                            }
                                            className="mt-5 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white"
                                        >

                                            <i className="fa-solid fa-plus mr-2" />

                                            Add Product

                                        </button>

                                    </td>

                                </tr>
                            )}

                        {/* PRODUCT LIST */}

                        {!loading &&
                            products.map(
                                (product) => (
                                    <tr
                                        key={
                                            product.id
                                        }
                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                    >

                                        {/* IMAGE */}

                                        <td className="px-6 py-4">

                                            {product.imageUrl ? (
                                                <img
                                                    src={
                                                        product.imageUrl
                                                    }
                                                    alt={
                                                        product.name
                                                    }
                                                    onError={
                                                        handleImageError
                                                    }
                                                    className="h-14 w-16 rounded-lg border border-slate-100 object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-14 w-16 items-center justify-center rounded-lg bg-slate-100">

                                                    <i className="fa-solid fa-image text-xl text-slate-300" />

                                                </div>
                                            )}

                                        </td>

                                        {/* NAME */}

                                        <td className="px-6 py-4">

                                            <p className="font-medium text-slate-900">
                                                {
                                                    product.name
                                                }
                                            </p>

                                        </td>

                                        {/* CATEGORY */}

                                        <td className="px-6 py-4">

                                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600">
                                                {
                                                    product.category ||
                                                    "-"
                                                }
                                            </span>

                                        </td>

                                        {/* PRICE */}

                                        <td className="px-6 py-4 font-medium text-slate-700">

                                            $
                                            {Number(
                                                product.price ||
                                                    0
                                            ).toFixed(
                                                2
                                            )}

                                        </td>

                                        {/* TURNAROUND */}

                                        <td className="px-6 py-4 text-slate-600">

                                            {
                                                product.turnaround
                                            }{" "}
                                            hrs

                                        </td>

                                        {/* STATUS */}

                                        <td className="px-6 py-4">

                                            {product.status ===
                                            "active" ? (
                                                <span className="inline-flex rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                                    Inactive
                                                </span>
                                            )}

                                        </td>

                                        {/* CREATED */}

                                        <td className="px-6 py-4 text-xs text-slate-500">

                                            {formatDate(
                                                product.createdAt
                                            )}

                                        </td>

                                        {/* UPDATED */}

                                        <td className="px-6 py-4 text-xs text-slate-500">

                                            {formatDate(
                                                product.updatedAt
                                            )}

                                        </td>

                                        {/* ACTIONS */}

                                        <td className="px-6 py-4">

                                            <div className="flex justify-end gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            product
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                    title="Edit"
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
                                                >

                                                    <i className="fa-solid fa-pen-to-square" />

                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteProduct(
                                                            product
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                    title="Delete"
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100 disabled:opacity-50"
                                                >

                                                    <i className="fa-solid fa-trash" />

                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                )
                            )}

                    </tbody>

                </table>

            </div>

            {/* =================================================
                ADD / EDIT MODAL
            ================================================= */}

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        {/* HEADER */}

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">

                            <div>

                                <h3 className="text-lg font-semibold text-slate-900">

                                    {editingProduct
                                        ? "Edit Product"
                                        : "Add Product"}

                                </h3>

                                <p className="mt-0.5 text-xs text-slate-500">

                                    {editingProduct
                                        ? "Update product information."
                                        : "Create a new product."}

                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                            >

                                <i className="fa-solid fa-xmark text-lg" />

                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={
                                editingProduct
                                    ? handleEditProduct
                                    : handleAddProduct
                            }
                            className="px-5 py-5"
                        >

                            {/* =================================================
                                PRODUCT NAME
                            ================================================= */}

                            <div className="mb-4">

                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Product Name
                                </label>

                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Example: Premium Shoe Cleaning"
                                    disabled={saving}
                                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />

                            </div>

                            {/* =================================================
                                IMAGE
                            ================================================= */}

                            <div className="mb-4">

                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Product Image
                                </label>

                                <div className="flex gap-3">

                                    {/* PREVIEW */}

                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">

                                        {imageUrl ? (
                                            <img
                                                src={
                                                    imageUrl
                                                }
                                                alt="Preview"
                                                onError={
                                                    handleImageError
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <i className="fa-solid fa-image text-2xl text-slate-300" />
                                        )}

                                    </div>

                                    {/* URL INPUT */}

                                    <div className="flex-1">

                                        <input
                                            type="url"
                                            value={
                                                imageUrl
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setImageUrl(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="https://example.com/product.jpg"
                                            disabled={
                                                saving
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                        />

                                        <p className="mt-1.5 text-xs text-slate-400">
                                            Enter an image URL. Firebase Storage is not used.
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                PRICE + TURNAROUND
                            ================================================= */}

                            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                                {/* PRICE */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Price
                                    </label>

                                    <div className="relative">

                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                            $
                                        </span>

                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                price
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setPrice(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="45"
                                            disabled={
                                                saving
                                            }
                                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-7 pr-3.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                        />

                                    </div>

                                </div>

                                {/* TURNAROUND */}

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Turnaround
                                    </label>

                                    <div className="relative">

                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            value={
                                                turnaround
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setTurnaround(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="48"
                                            disabled={
                                                saving
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-12 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                        />

                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                            hrs
                                        </span>

                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                CATEGORY
                            ================================================= */}

                            <div className="mb-4">

                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Category
                                </label>

                                <select
                                    required
                                    value={category}
                                    onChange={(event) =>
                                        setCategory(
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={
                                        saving ||
                                        categories.length ===
                                            0
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-slate-50"
                                >

                                    {categories.length ===
                                    0 ? (
                                        <option value="">
                                            No categories available
                                        </option>
                                    ) : (
                                        <>
                                            <option value="">
                                                Select category
                                            </option>

                                            {categories.map(
                                                (
                                                    item
                                                ) => (
                                                    <option
                                                        key={
                                                            item.id
                                                        }
                                                        value={
                                                            item.name
                                                        }
                                                    >
                                                        {
                                                            item.name
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </>
                                    )}

                                </select>

                                {categories.length ===
                                    0 && (
                                    <p className="mt-1.5 text-xs text-red-500">
                                        Please create a category first.
                                    </p>
                                )}

                            </div>

                            {/* =================================================
                                STATUS
                            ================================================= */}

                            <div className="mb-5">

                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Status
                                </label>

                                <select
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={saving}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                >

                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>

                                </select>

                            </div>

                            {/* BUTTONS */}

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        categories.length ===
                                            0
                                    }
                                    className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {saving ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin mr-2" />

                                            {editingProduct
                                                ? "Updating..."
                                                : "Saving..."}
                                        </>
                                    ) : (
                                        <>
                                            <i
                                                className={`fa-solid ${
                                                    editingProduct
                                                        ? "fa-check"
                                                        : "fa-plus"
                                                } mr-2`}
                                            />

                                            {editingProduct
                                                ? "Update Product"
                                                : "Add Product"}
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </main>
    );
}