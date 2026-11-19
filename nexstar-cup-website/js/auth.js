
import { firebaseReady, auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const form = document.getElementById("login-form");
const message = document.getElementById("login-message");
const button = document.getElementById("login-button");
const emailInput = document.getElementById("email");

document.getElementById("year").textContent =
  new Date().getFullYear();

// Fungsi memeriksa hak akses admin
async function isAdmin(user) {
  const adminDoc = await getDoc(doc(db, "admins", user.uid));

  return adminDoc.exists() &&
    adminDoc.data().role === "admin";
}

// Periksa konfigurasi Firebase
if (!firebaseReady) {
  message.textContent = "Firebase belum dikonfigurasi.";
  button.disabled = true;
}

// Tambahkan tombol lupa password
const resetButton = document.createElement("button");

resetButton.type = "button";
resetButton.textContent = "Lupa Password?";
resetButton.style.marginTop = "12px";
resetButton.style.background = "transparent";
resetButton.style.border = "none";
resetButton.style.color = "inherit";
resetButton.style.cursor = "pointer";

form.appendChild(resetButton);

// Fungsi reset password
resetButton.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  if (!email) {
    message.textContent = "Masukkan email admin terlebih dahulu.";
    emailInput.focus();
    return;
  }

  try {
    resetButton.disabled = true;

    await sendPasswordResetEmail(auth, email);

    message.textContent =
      "Link reset password sudah dikirim. Periksa email kamu.";

  } catch (error) {
    console.error("Reset Password Error:", error);
    message.textContent = "Gagal mengirim reset: " + error.code;

  } finally {
    resetButton.disabled = false;
  }
});

// Periksa status login
if (firebaseReady) {
  onAuthStateChanged(auth, async user => {
    if (!user) return;

    try {
      if (await isAdmin(user)) {
        location.replace("admin.html");
      } else {
        await signOut(auth);
        message.textContent =
          "Akun ini belum memiliki izin admin.";
      }
    } catch (error) {
      console.error(error);
      message.textContent =
        "Gagal memeriksa hak akses admin.";
    }
  });
}

// Proses login
form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!firebaseReady) return;

  button.disabled = true;
  button.textContent = "Memproses...";
  message.textContent = "";

  try {
    const email = emailInput.value.trim();
    const password =
      document.getElementById("password").value;

    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (!(await isAdmin(credential.user))) {
      await signOut(auth);
      throw new Error("Akun ini belum terdaftar sebagai admin.");
    }

    location.href = "admin.html";

  } catch (error) {
    console.error("Firebase Login Error:", error);

    message.textContent =
      error.code || error.message || "Login gagal.";

  } finally {
    button.disabled = false;
    button.textContent = "Masuk ke Dashboard ↗";
  }
});
