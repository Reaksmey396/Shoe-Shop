import React, { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

import fire from "../images/fire-solid.png";

export default function AdminCategories() {
  const { user, loading: authLoading } = useAuth();

  // =====================================================
  // STATE
  // =====================================================

  const [categories, setCategories] = useState([]);

  const [productCounts, setProductCounts] = useState({});

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [name, setName] = useState("");

  const [description, setDescription] =
    useState("");

  const [imageUrl, setImageUrl] = useState("");

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const snapshot = await getDocs(
        collection(db, "categories")
      );

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setCategories(data);

      await loadProductCounts(data);
    } catch (error) {
      console.error(
        "FETCH CATEGORIES ERROR:",
        error
      );

      alert(
        `Cannot load categories:\n${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD PRODUCT COUNTS
  // =====================================================

  const loadProductCounts = async (
    categoryData
  ) => {
    try {
      const snapshot = await getDocs(
        collection(db, "products")
      );

      const products = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      const counts = {};

      categoryData.forEach((category) => {
        counts[category.id] =
          products.filter(
            (product) =>
              product.category === category.name
          ).length;
      });

      setProductCounts(counts);
    } catch (error) {
      console.error(
        "PRODUCT COUNT ERROR:",
        error
      );
    }
  };

  // =====================================================
  // AUTH -> LOAD DATA
  // =====================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    fetchCategories();
  }, [user, authLoading]);

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingCategory(null);

    setName("");

    setDescription("");

    setImageUrl("");

    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (category) => {
    setEditingCategory(category);

    setName(category.name || "");

    setDescription(
      category.description || ""
    );

    setImageUrl(
      category.imageUrl || ""
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

    setEditingCategory(null);

    setName("");

    setDescription("");

    setImageUrl("");
  };

  // =====================================================
  // CHECK IMAGE URL
  // =====================================================

  const isValidImageUrl = (url) => {
    if (!url.trim()) {
      return true;
    }

    try {
      new URL(url);

      return true;
    } catch {
      return false;
    }
  };

  // =====================================================
  // ADD CATEGORY
  // =====================================================

  const handleAddCategory = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (!user) {
      alert("សូម Login ជាមុនសិន");
      return;
    }

    if (!db) {
      alert(
        "Firestore មិនបាន initialize ទេ"
      );
      return;
    }

    if (!name.trim()) {
      alert(
        "សូមបញ្ចូល Category Name"
      );
      return;
    }

    if (!description.trim()) {
      alert(
        "សូមបញ្ចូល Description"
      );
      return;
    }

    if (!isValidImageUrl(imageUrl)) {
      alert(
        "សូមបញ្ចូល Image URL ដែលត្រឹមត្រូវ។"
      );
      return;
    }

    try {
      setSaving(true);

      const categoryData = {
        name: name.trim(),

        description:
          description.trim(),

        imageUrl:
          imageUrl.trim(),

        createdBy:
          user.uid,

        createdByEmail:
          user.email || "",

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "categories"),
        categoryData
      );

      // =================================================
      // UPDATE UI
      // =================================================

      const newCategory = {
        id: docRef.id,

        name:
          name.trim(),

        description:
          description.trim(),

        imageUrl:
          imageUrl.trim(),

        createdBy:
          user.uid,

        createdByEmail:
          user.email || "",

        createdAt:
          new Date(),

        updatedAt:
          new Date(),
      };

      setCategories((previous) => [
        ...previous,
        newCategory,
      ]);

      setProductCounts((previous) => ({
        ...previous,
        [docRef.id]: 0,
      }));

      // =================================================
      // RESET
      // =================================================

      setShowModal(false);

      setEditingCategory(null);

      setName("");

      setDescription("");

      setImageUrl("");

      alert(
        "បានបន្ថែម Category ជោគជ័យ!"
      );
    } catch (error) {
      console.error(
        "ADD CATEGORY ERROR:",
        error
      );

      alert(
        `បន្ថែម Category មិនបាន\n\nCode: ${
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
  // EDIT CATEGORY
  // =====================================================

  const handleEditCategory = async (
    event
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (!user) {
      alert("សូម Login ជាមុនសិន");
      return;
    }

    if (!db) {
      alert(
        "Firestore មិនបាន initialize ទេ"
      );
      return;
    }

    if (!editingCategory) {
      alert(
        "មិនមាន Category សម្រាប់កែប្រែទេ"
      );
      return;
    }

    if (!name.trim()) {
      alert(
        "សូមបញ្ចូល Category Name"
      );
      return;
    }

    if (!description.trim()) {
      alert(
        "សូមបញ្ចូល Description"
      );
      return;
    }

    if (!isValidImageUrl(imageUrl)) {
      alert(
        "សូមបញ្ចូល Image URL ដែលត្រឹមត្រូវ។"
      );
      return;
    }

    try {
      setSaving(true);

      const categoryRef = doc(
        db,
        "categories",
        editingCategory.id
      );

      const updateData = {
        name:
          name.trim(),

        description:
          description.trim(),

        imageUrl:
          imageUrl.trim(),

        updatedAt:
          serverTimestamp(),
      };

      await updateDoc(
        categoryRef,
        updateData
      );

      // =================================================
      // UPDATE UI
      // =================================================

      setCategories((previous) =>
        previous.map((category) =>
          category.id ===
          editingCategory.id
            ? {
                ...category,

                name:
                  name.trim(),

                description:
                  description.trim(),

                imageUrl:
                  imageUrl.trim(),

                updatedAt:
                  new Date(),
              }
            : category
        )
      );

      // =================================================
      // RESET
      // =================================================

      setShowModal(false);

      setEditingCategory(null);

      setName("");

      setDescription("");

      setImageUrl("");

      alert(
        "បានកែប្រែ Category ជោគជ័យ!"
      );
    } catch (error) {
      console.error(
        "EDIT CATEGORY ERROR:",
        error
      );

      alert(
        `កែប្រែ Category មិនបាន\n\nCode: ${
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
  // DELETE CATEGORY
  // =====================================================

  const handleDeleteCategory = async (
    category
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
        `តើអ្នកប្រាកដថាចង់លុប "${category.name}" មែនទេ?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      // =================================================
      // DELETE FIRESTORE
      // =================================================

      await deleteDoc(
        doc(
          db,
          "categories",
          category.id
        )
      );

      // =================================================
      // REMOVE FROM UI
      // =================================================

      setCategories((previous) =>
        previous.filter(
          (item) =>
            item.id !== category.id
        )
      );

      setProductCounts((previous) => {
        const next = {
          ...previous,
        };

        delete next[category.id];

        return next;
      });

      alert(
        "បានលុប Category ជោគជ័យ!"
      );
    } catch (error) {
      console.error(
        "DELETE CATEGORY ERROR:",
        error
      );

      alert(
        `លុប Category មិនបាន:\n${error.message}`
      );
    } finally {
      setSaving(false);
    }
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
            Please login to manage categories.
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
            Categories
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your product categories.
          </p>

        </div>

        <button
          type="button"
          onClick={openAddModal}
          disabled={saving}
          className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >

          <i className="fa-solid fa-plus mr-2" />

          Add Category

        </button>

      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        {/* TABLE HEADER */}

        <div className="hidden grid-cols-[1.5fr_1.5fr_3fr_1fr_100px] gap-4 border-b border-slate-100 bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">

          <div>
            Name
          </div>

          <div>
            Image
          </div>

          <div>
            Description
          </div>

          <div>
            Product
          </div>

          <div className="text-right">
            Action
          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="py-16 text-center">

            <i className="fa-solid fa-spinner fa-spin text-xl text-red-500" />

            <p className="mt-3 text-sm text-slate-500">
              Loading categories...
            </p>

          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          categories.length === 0 && (
            <div className="py-16 text-center">

              <i className="fa-solid fa-folder-open text-4xl text-slate-300" />

              <h3 className="mt-4 text-lg font-semibold text-slate-800">
                No Categories
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create your first category.
              </p>

              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white"
              >
                + Add Category
              </button>

            </div>
          )}

        {/* =================================================
            LIST
        ================================================= */}

        {!loading &&
          categories.map((category) => (
            <div
              key={category.id}
              className="grid gap-4 border-b border-slate-100 px-6 py-5 last:border-b-0 md:grid-cols-[1.5fr_1.5fr_3fr_1fr_100px] md:items-center"
            >

              {/* NAME */}

              <div>

                <p className="text-sm font-semibold text-slate-900">
                  {category.name}
                </p>

              </div>

              {/* IMAGE */}

              <div>

                {category.imageUrl ? (

                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="h-14 w-14 rounded-xl border border-slate-100 object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />

                ) : (

                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">

                    <img
                      src={fire}
                      alt=""
                      className="h-8 w-8"
                    />

                  </div>

                )}

              </div>

              {/* DESCRIPTION */}

              <div>

                <p className="line-clamp-2 text-sm text-slate-500">
                  {category.description ||
                    "No description"}
                </p>

              </div>

              {/* PRODUCT */}

              <div>

                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">

                  {productCounts[
                    category.id
                  ] || 0}

                </span>

              </div>

              {/* ACTION */}

              <div className="flex items-center justify-end gap-2">

                {/* EDIT */}

                <button
                  type="button"
                  onClick={() =>
                    openEditModal(category)
                  }
                  disabled={saving}
                  title="Edit"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
                >

                  <i className="fa-solid fa-pen-to-square" />

                </button>

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteCategory(
                      category
                    )
                  }
                  disabled={saving}
                  title="Delete"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100 disabled:opacity-50"
                >

                  <i className="fa-solid fa-trash" />

                </button>

              </div>

            </div>
          ))}

      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-4 backdrop-blur-sm">

          {/* SMALL MODAL */}

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

              <div>

                <h3 className="text-base font-semibold text-slate-900">
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h3>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {editingCategory
                    ? "Update category information."
                    : "Create a new category."}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >

                <i className="fa-solid fa-xmark text-base" />

              </button>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={
                editingCategory
                  ? handleEditCategory
                  : handleAddCategory
              }
              className="px-4 py-3"
            >

              {/* =================================================
                  CATEGORY NAME
              ================================================= */}

              <div className="mb-2.5">

                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Category Name
                </label>

                <input
                  required
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Example: Running"
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />

              </div>

              {/* =================================================
                  IMAGE URL
              ================================================= */}

              <div className="mb-2.5">

                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Image URL
                </label>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(event) =>
                    setImageUrl(
                      event.target.value
                    )
                  }
                  placeholder="https://example.com/image.jpg"
                  disabled={saving}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />

                <p className="mt-1 text-[10px] text-slate-400">
                  Paste a direct image URL.
                </p>

              </div>

              {/* =================================================
                  IMAGE PREVIEW
              ================================================= */}

              <div className="mb-2.5">

                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Image Preview
                </label>

                <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">

                  {imageUrl.trim() ? (

                    <img
                      src={imageUrl}
                      alt="Category preview"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />

                  ) : (

                    <div className="text-center">

                      <i className="fa-solid fa-image text-xl text-slate-300" />

                      <p className="mt-1 text-[10px] text-slate-400">
                        Image preview
                      </p>

                    </div>

                  )}

                </div>

              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div className="mb-3">

                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  required
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe this category..."
                  rows={2}
                  disabled={saving}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />

              </div>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <div className="flex justify-end gap-2">

                {/* CANCEL */}

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>

                {/* SAVE */}

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-red-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving ? (

                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-1.5" />

                      Saving...
                    </>

                  ) : (

                    <>
                      <i
                        className={`fa-solid ${
                          editingCategory
                            ? "fa-check"
                            : "fa-plus"
                        } mr-1.5`}
                      />

                      {editingCategory
                        ? "Update Category"
                        : "Add Category"}
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