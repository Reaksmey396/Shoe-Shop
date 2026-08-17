import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db, isFirebaseConfigured } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // GET CURRENT USER
  // ==========================================

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (!firebaseUser) {
            setUser(null);
            setLoading(false);
            return;
          }

          // Get user information from Firestore
          const userRef = doc(
            db,
            "users",
            firebaseUser.uid
          );

          const snapshot = await getDoc(userRef);

          let role = "user";

          if (snapshot.exists()) {
            role = snapshot.data().role || "user";
          }

          // Add role to current user
          const currentUser = {
            ...firebaseUser,
            role,
          };

          setUser(currentUser);
        } catch (error) {
          console.error(
            "Error loading user:",
            error
          );

          // If Firestore document does not exist,
          // treat the account as a normal user.
          setUser({
            ...firebaseUser,
            role: "user",
          });
        } finally {
          setLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  // ==========================================
  // CHECK FIREBASE
  // ==========================================

  const requireFirebase = () => {
    if (!auth) {
      throw new Error(
        "Firebase Authentication is not configured."
      );
    }

    if (!db) {
      throw new Error(
        "Firebase Firestore is not configured."
      );
    }
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (
    username,
    email,
    password
  ) => {
    requireFirebase();

    // Create Firebase Authentication account
    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    // Save username in Firebase Auth
    await updateProfile(
      credential.user,
      {
        displayName: username,
      }
    );

    // Create Firestore user document
    await setDoc(
      doc(
        db,
        "users",
        credential.user.uid
      ),
      {
        name: username,
        email: email,

        // EVERY NEW REGISTER USER = USER
        role: "user",

        createdAt: serverTimestamp(),
      }
    );

    console.log(
      "Register successful:",
      email
    );

    console.log(
      "Role: user"
    );

    return credential;
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (
    email,
    password
  ) => {
    requireFirebase();

    // Login Firebase Authentication
    const credential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    // Find Firestore user
    const userRef = doc(
      db,
      "users",
      credential.user.uid
    );

    const snapshot =
      await getDoc(userRef);

    let role = "user";

    if (snapshot.exists()) {
      role =
        snapshot.data().role || "user";
    }

    console.log(
      "Login:",
      credential.user.email
    );

    console.log(
      "Role:",
      role
    );

    return {
      ...credential,

      user: {
        ...credential.user,
        role,
      },
    };
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = async () => {
    requireFirebase();

    await signOut(auth);

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// useAuth
// ==========================================

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}