// GANTI nilai di bawah dengan konfigurasi aplikasi Web Firebase milikmu.
// Firebase Console > Project settings > General > Your apps > SDK setup and configuration.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
// import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyANdv1pmNMGLj_h9JqLCbxBUphQ83ZhxEs",
    authDomain: "nexstarcup.firebaseapp.com",
    projectId: "nexstarcup",
    storageBucket: "nexstarcup.firebasestorage.app",
    messagingSenderId: "382152776938",
    appId: "1:382152776938:web:3ae96983c898048c448b93",
    measurementId: "G-8NY1V0MYVB"
  };

export const firebaseReady = !Object.values(firebaseConfig).some(value =>
  String(value).startsWith("ISI_")
);

let app, auth, db;
if (firebaseReady) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}
export { auth, db };


