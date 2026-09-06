import { createContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export const AuthContext = createContext();

const SKIP_FIREBASE = !import.meta.env.VITE_FIREBASE_CONFIGURED;

const ADMIN_USER = {
  uid: "admin-local",
  email: "vozdigital@vozdigital.com",
  displayName: "Administrador",
};

const ADMIN_PROFILE = {
  displayName: "Administrador",
  email: "vozdigital@vozdigital.com",
  role: "admin",
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loginAdmin(email, password) {
    if (SKIP_FIREBASE) {
      if (email === "vozdigital" && password === "voz") {
        const user = { ...ADMIN_USER, email };
        setCurrentUser(user);
        setUserProfile({ ...ADMIN_PROFILE, email });
        localStorage.setItem("adminSession", "true");
        return user;
      }
      throw new Error("Credenciales incorrectas");
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function registerAdmin(email, password, displayName) {
    if (SKIP_FIREBASE) {
      throw new Error("Registro no disponible sin Firebase");
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await setDoc(doc(db, "users", cred.user.uid), {
      displayName,
      email,
      role: "admin",
      createdAt: new Date().toISOString(),
    });
    return cred;
  }

  async function loginAlumno(folio) {
    if (SKIP_FIREBASE) {
      const profile = {
        uid: `alumno-${folio}`,
        displayName: `Alumno ${folio}`,
        folio: folio,
        grade: "",
        group: "",
        role: "alumno",
      };
      setCurrentUser({ uid: profile.uid, displayName: profile.displayName });
      setUserProfile(profile);
      return profile;
    }

    const foliosRef = collection(db, "folios");
    const q = query(foliosRef, where("folio", "==", folio.trim()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error("Folio no registrado");
    }

    const folioDoc = snapshot.docs[0];
    const folioData = folioDoc.data();

    const userProfileData = {
      uid: folioDoc.id,
      displayName: folioData.name || `Alumno ${folio}`,
      folio: folioData.folio,
      grade: folioData.grade || "",
      group: folioData.group || "",
      role: "alumno",
    };

    setUserProfile(userProfileData);
    setCurrentUser({ uid: folioDoc.id, displayName: userProfileData.displayName });
    setLoading(false);
    return userProfileData;
  }

  async function logout() {
    setUserProfile(null);
    setCurrentUser(null);
    localStorage.removeItem("adminSession");
    if (!SKIP_FIREBASE && auth?.currentUser) {
      return signOut(auth);
    }
  }

  useEffect(() => {
    if (SKIP_FIREBASE) {
      if (localStorage.getItem("adminSession") === "true") {
        setCurrentUser(ADMIN_USER);
        setUserProfile(ADMIN_PROFILE);
      }
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            setUserProfile({
              displayName: user.displayName || "Administrador",
              email: user.email,
              role: "admin",
            });
          }
        } catch {
          setUserProfile({
            displayName: user.displayName || "Administrador",
            email: user.email,
            role: "admin",
          });
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loginAdmin,
    registerAdmin,
    loginAlumno,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
