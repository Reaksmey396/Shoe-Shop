import React, { useEffect, useMemo, useState } from "react";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function AdminUser() {
    const { user, loading: authLoading } = useAuth();

    // =====================================================
    // STATE
    // =====================================================

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [deleting, setDeleting] = useState(false);

    const [search, setSearch] = useState("");

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (timestamp) => {
        if (!timestamp) {
            return "-";
        }

        try {
            let date;

            if (
                timestamp &&
                typeof timestamp.toDate === "function"
            ) {
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
    // LOAD USERS
    // =====================================================

    const fetchUsers = async () => {
        if (!user) {
            setUsers([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            console.log(
                "========== LOAD USERS =========="
            );

            const snapshot = await getDocs(
                collection(db, "users")
            );

            const userData = snapshot.docs.map(
                (item) => ({
                    id: item.id,
                    ...item.data(),
                })
            );

            // Newest first
            userData.sort((a, b) => {
                const dateA =
                    a.createdAt?.toMillis?.() || 0;

                const dateB =
                    b.createdAt?.toMillis?.() || 0;

                return dateB - dateA;
            });

            setUsers(userData);

            console.log(
                "Users loaded:",
                userData
            );
        } catch (error) {
            console.error(
                "FETCH USERS ERROR:",
                error
            );

            alert(
                `Cannot load users.\n\n${error.message}`
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LOAD USERS AFTER AUTH
    // =====================================================

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            setUsers([]);
            setLoading(false);
            return;
        }

        fetchUsers();
    }, [user, authLoading]);

    // =====================================================
    // SEARCH USERS
    // =====================================================

    const filteredUsers = useMemo(() => {
        const value = search
            .trim()
            .toLowerCase();

        if (!value) {
            return users;
        }

        return users.filter((item) => {
            const name = String(
                item.name ||
                    item.displayName ||
                    item.fullName ||
                    ""
            ).toLowerCase();

            const email = String(
                item.email || ""
            ).toLowerCase();

            const role = String(
                item.role || ""
            ).toLowerCase();

            const status = String(
                item.status || ""
            ).toLowerCase();

            return (
                name.includes(value) ||
                email.includes(value) ||
                role.includes(value) ||
                status.includes(value)
            );
        });
    }, [users, search]);

    // =====================================================
    // GET USER NAME
    // =====================================================

    const getUserName = (item) => {
        return (
            item.name ||
            item.displayName ||
            item.fullName ||
            "Unknown User"
        );
    };

    // =====================================================
    // GET USER EMAIL
    // =====================================================

    const getUserEmail = (item) => {
        return item.email || "-";
    };

    // =====================================================
    // GET USER ROLE
    // =====================================================

    const getUserRole = (item) => {
        return item.role || "user";
    };

    // =====================================================
    // GET USER STATUS
    // =====================================================

    const getUserStatus = (item) => {
        return item.status || "active";
    };

    // =====================================================
    // USER AVATAR
    // =====================================================

    const getInitial = (item) => {
        const name = getUserName(item);

        if (!name) {
            return "U";
        }

        return name
            .charAt(0)
            .toUpperCase();
    };

    // =====================================================
    // DELETE USER DOCUMENT
    // =====================================================

    const handleDeleteUser = async (selectedUser) => {
        if (deleting) {
            return;
        }

        if (!user) {
            alert("Please login first.");
            return;
        }

        // Prevent deleting yourself
        if (selectedUser.id === user.uid) {
            alert(
                "You cannot delete your own account from this page."
            );

            return;
        }

        const userName =
            getUserName(selectedUser);

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${userName}"?\n\nThis will delete the user's Firestore document.`
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);

            console.log(
                "========== DELETE USER =========="
            );

            await deleteDoc(
                doc(
                    db,
                    "users",
                    selectedUser.id
                )
            );

            setUsers((previous) =>
                previous.filter(
                    (item) =>
                        item.id !==
                        selectedUser.id
                )
            );

            alert(
                "User deleted successfully!"
            );
        } catch (error) {
            console.error(
                "DELETE USER ERROR:",
                error
            );

            alert(
                `Cannot delete user.\n\nCode: ${
                    error.code || "unknown"
                }\nMessage: ${
                    error.message
                }`
            );
        } finally {
            setDeleting(false);
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
                        Please login to manage users.
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

            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <h2 className="text-2xl font-semibold text-slate-900">
                        Users
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage users registered on your website.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={fetchUsers}
                    disabled={loading || deleting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >

                    <i
                        className={`fa-solid ${
                            loading
                                ? "fa-spinner fa-spin"
                                : "fa-rotate"
                        }`}
                    />

                    Refresh

                </button>

            </div>

            {/* =================================================
                SEARCH + TOTAL
            ================================================= */}

            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                {/* SEARCH */}

                <div className="relative w-full sm:max-w-sm">

                    <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search users..."
                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>
                    )}

                </div>

                {/* TOTAL */}

                <div className="text-sm text-slate-500">

                    Total Users:

                    <span className="ml-1 font-semibold text-slate-800">
                        {filteredUsers.length}
                    </span>

                </div>

            </div>

            {/* =================================================
                USERS TABLE
            ================================================= */}

            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">

                <table className="w-full min-w-[1000px] table-fixed text-left text-sm">

                    <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">

                        <tr>

                            <th className="w-[28%] px-6 py-4 font-medium">
                                User
                            </th>

                            <th className="w-[25%] px-6 py-4 font-medium">
                                Email
                            </th>

                            <th className="w-[12%] px-6 py-4 font-medium">
                                Role
                            </th>

                            <th className="w-[12%] px-6 py-4 font-medium">
                                Status
                            </th>

                            <th className="w-[17%] px-6 py-4 font-medium">
                                Created
                            </th>

                            <th className="w-[6%] px-6 py-4 text-right font-medium">
                                Action
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {/* LOADING */}

                        {loading && (
                            <tr>

                                <td
                                    colSpan="6"
                                    className="py-16 text-center"
                                >

                                    <i className="fa-solid fa-spinner fa-spin text-xl text-red-500" />

                                    <p className="mt-3 text-sm text-slate-500">
                                        Loading users...
                                    </p>

                                </td>

                            </tr>
                        )}

                        {/* EMPTY */}

                        {!loading &&
                            filteredUsers.length ===
                                0 && (
                                <tr>

                                    <td
                                        colSpan="6"
                                        className="py-16 text-center"
                                    >

                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">

                                            <i className="fa-solid fa-users text-2xl text-slate-400" />

                                        </div>

                                        <h3 className="mt-4 text-lg font-semibold text-slate-800">
                                            No Users Found
                                        </h3>

                                        <p className="mt-2 text-sm text-slate-500">
                                            {search
                                                ? "No users match your search."
                                                : "There are no users in the database."}
                                        </p>

                                    </td>

                                </tr>
                            )}

                        {/* USER LIST */}

                        {!loading &&
                            filteredUsers.map(
                                (item) => {

                                    const userName =
                                        getUserName(
                                            item
                                        );

                                    const userEmail =
                                        getUserEmail(
                                            item
                                        );

                                    const userRole =
                                        getUserRole(
                                            item
                                        );

                                    const userStatus =
                                        getUserStatus(
                                            item
                                        );

                                    const isCurrentUser =
                                        item.id ===
                                        user.uid;

                                    return (
                                        <tr
                                            key={
                                                item.id
                                            }
                                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                        >

                                            {/* USER */}

                                            <td className="px-6 py-4">

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-500">

                                                        {getInitial(
                                                            item
                                                        )}

                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="truncate font-semibold text-slate-900">

                                                            {
                                                                userName
                                                            }

                                                        </p>

                                                        {isCurrentUser && (
                                                            <p className="mt-0.5 text-xs text-red-500">
                                                                You
                                                            </p>
                                                        )}

                                                    </div>

                                                </div>

                                            </td>

                                            {/* EMAIL */}

                                            <td className="px-6 py-4">

                                                <p
                                                    className="truncate text-slate-600"
                                                    title={
                                                        userEmail
                                                    }
                                                >
                                                    {
                                                        userEmail
                                                    }
                                                </p>

                                            </td>

                                            {/* ROLE */}

                                            <td className="px-6 py-4">

                                                {userRole ===
                                                "admin" ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">

                                                        <i className="fa-solid fa-shield-halved text-[10px]" />

                                                        Admin

                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">

                                                        <i className="fa-solid fa-user text-[10px]" />

                                                        User

                                                    </span>
                                                )}

                                            </td>

                                            {/* STATUS */}

                                            <td className="px-6 py-4">

                                                {userStatus ===
                                                "active" ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-600">

                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                                        Active

                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-500">

                                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />

                                                        Inactive

                                                    </span>
                                                )}

                                            </td>

                                            {/* CREATED */}

                                            <td className="px-6 py-4">

                                                <div
                                                    className="whitespace-nowrap text-xs text-slate-500"
                                                    title={formatDate(
                                                        item.createdAt
                                                    )}
                                                >

                                                    {formatDate(
                                                        item.createdAt
                                                    )}

                                                </div>

                                            </td>

                                            {/* ACTION */}

                                            <td className="px-6 py-4">

                                                <div className="flex justify-end">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteUser(
                                                                item
                                                            )
                                                        }
                                                        disabled={
                                                            deleting ||
                                                            isCurrentUser
                                                        }
                                                        title={
                                                            isCurrentUser
                                                                ? "You cannot delete yourself"
                                                                : "Delete user"
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >

                                                        <i className="fa-solid fa-trash" />

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                }
                            )}

                    </tbody>

                </table>

            </div>

        </main>
    );
}