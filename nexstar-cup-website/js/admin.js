import { firebaseReady, auth, db } from "./firebase.js";
import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// CLOUDINARY CONFIGURATION
const CLOUDINARY_CLOUD_NAME = "myji5lgf";
const CLOUDINARY_UPLOAD_PRESET = "nexstar_members";

const CLOUDINARY_UPLOAD_URL =
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const $ = id => document.getElementById(id);
const list = $("admin-members");
const notice = $("setup-notice");
const form = $("member-form");
const preview = $("image-preview");
const previewPlaceholder = $("preview-placeholder");
let members = [];
let selectedFile = null;
let currentImageUrl = "";

$("year").textContent = new Date().getFullYear();

function setMessage(text, type = "info") {
  $("editor-message").textContent = text;
  $("editor-message").style.color = type === "error" ? "#ff9b9b" : "#ef9de8";
}
function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}
function previewImage(url) {
  if (url) {
    preview.src = url;
    preview.hidden = false;
    previewPlaceholder.hidden = true;
  } else {
    preview.removeAttribute("src");
    preview.hidden = true;
    previewPlaceholder.hidden = false;
  }
}
function resetForm() {
  form.reset();
  $("member-id").value = "";
  $("editor-title").textContent = "Tambah Anggota";
  $("save-member-button").textContent = "Simpan Anggota";
  selectedFile = null;
  currentImageUrl = "";
  previewImage("");
  setMessage("");
}
function showEditor(member = null) {
  resetForm();
  if (member) {
    $("editor-title").textContent = "Edit Anggota";
    $("save-member-button").textContent = "Simpan Perubahan";
    $("member-id").value = member.id;
    $("member-name").value = member.name || "";
    $("member-description").value = member.description || "";
    $("member-image-url").value = member.imageUrl || "";
    currentImageUrl = member.imageUrl || "";
    previewImage(currentImageUrl);
  }
  $("editor-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  $("member-name").focus();
}
function renderList() {
  if (!members.length) {
    list.innerHTML = '<p class="loading-state">Belum ada data anggota. Klik "Tambah Anggota" untuk memulai.</p>';
    return;
  }
  list.innerHTML = members.map((member, index) => `
    <div class="admin-member-row">
      <img src="${escapeHtml(member.imageUrl || "https://placehold.co/120x120/351342/ffffff?text=N")}" alt="" onerror="this.src='https://placehold.co/120x120/351342/ffffff?text=N'">
      <div><div class="admin-member-name">${escapeHtml(member.name || "Tanpa nama")}</div><div class="admin-member-desc">${escapeHtml(member.description || "Tidak ada deskripsi")}</div></div>
      <div class="row-actions">
        <button type="button" data-action="up" data-id="${member.id}" aria-label="Naik" ${index === 0 ? "disabled" : ""}>↑</button>
        <button type="button" data-action="down" data-id="${member.id}" aria-label="Turun" ${index === members.length - 1 ? "disabled" : ""}>↓</button>
        <button type="button" data-action="edit" data-id="${member.id}">Edit</button>
        <button type="button" class="delete-button" data-action="delete" data-id="${member.id}">×</button>
      </div>
    </div>`).join("");
}
async function loadMembers() {
  let snapshot = await getDocs(query(collection(db, "members"), orderBy("order", "asc")));
  // Saat pertama kali dashboard dibuka, siapkan 10 slot anggota kosong.
  if (snapshot.empty) {
    for (let index = 0; index < 10; index++) {
      await addDoc(collection(db, "members"), {
        name: `Nama Anggota ${String(index + 1).padStart(2, "0")}`,
        description: "",
        imageUrl: "",
        order: index,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    snapshot = await getDocs(query(collection(db, "members"), orderBy("order", "asc")));
  }
  members = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
  renderList();
}

async function uploadSelectedImage(memberId) {
  // Jika tidak memilih foto baru, gunakan foto sebelumnya
  if (!selectedFile) {
    return $("member-image-url").value.trim() || currentImageUrl;
  }

  // Validasi ukuran maksimal 500 KB
  if (selectedFile.size > 500 * 1024) {
    throw new Error("Ukuran foto maksimal 500 KB.");
  }

  // Validasi format foto
  if (!["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)) {
    throw new Error("Gunakan format JPG, PNG, atau WEBP.");
  }

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "nextstar-member");
  formData.append("public_id", memberId);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", CLOUDINARY_UPLOAD_URL);

    xhr.upload.addEventListener("progress", event => {
      if (event.lengthComputable) {
        const progress = Math.round(
          (event.loaded / event.total) * 100
        );

        setMessage(`Mengunggah foto... ${progress}%`);
      }
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText);

        setMessage("Foto berhasil diunggah. Menyimpan data...");
        resolve(result.secure_url);
      } else {
        const error = JSON.parse(xhr.responseText);
        reject(new Error(error.error?.message || "Upload Cloudinary gagal."));
      }
    };

    xhr.onerror = () => reject(new Error("Koneksi upload gagal."));
    xhr.send(formData);
  });
}

async function saveMember(event) {
  event.preventDefault();
  const id = $("member-id").value;
  const name = $("member-name").value.trim();
  const description = $("member-description").value.trim();
  if (!name) return setMessage("Nama anggota wajib diisi.", "error");
  const saveButton = $("save-member-button");
  saveButton.disabled = true;
  saveButton.textContent = "Menyimpan...";
  try {
    const memberId = id || `member-${Date.now()}`;
    const imageUrl = await uploadSelectedImage(memberId);
    const data = {
      name, description, imageUrl,
      updatedAt: serverTimestamp()
    };
    if (id) {
      await updateDoc(doc(db, "members", id), data);
    } else {
      data.order = members.length;
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, "members"), data);
    }
    await loadMembers();
    resetForm();
    setMessage("Data anggota berhasil disimpan.");
  } catch (error) {
    console.error(error);
    setMessage(error.message || "Gagal menyimpan data.", "error");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = id ? "Simpan Perubahan" : "Simpan Anggota";
  }
}
async function moveMember(id, direction) {
  const index = members.findIndex(member => member.id === id);
  const otherIndex = index + direction;
  if (index < 0 || otherIndex < 0 || otherIndex >= members.length) return;
  const current = members[index], other = members[otherIndex];
  try {
    await Promise.all([
      updateDoc(doc(db, "members", current.id), { order: other.order ?? index }),
      updateDoc(doc(db, "members", other.id), { order: current.order ?? otherIndex })
    ]);
    await loadMembers();
  } catch (error) {
    console.error(error);
    notice.textContent = "Gagal mengubah urutan. Periksa Firestore Rules.";
  }
}
async function handleListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  const member = members.find(item => item.id === id);
  if (!member) return;
  if (action === "edit") showEditor(member);
  if (action === "up") await moveMember(id, -1);
  if (action === "down") await moveMember(id, 1);
  if (action === "delete") {
    if (!confirm(`Hapus anggota "${member.name}"?`)) return;
    try {
      await deleteDoc(doc(db, "members", id));
      await loadMembers();
    } catch (error) {
      console.error(error);
      notice.textContent = "Gagal menghapus anggota. Periksa Firestore Rules.";
    }
  }
}
$("member-image-file").addEventListener("change", event => {
  selectedFile = event.target.files[0] || null;
  if (selectedFile) previewImage(URL.createObjectURL(selectedFile));
});
$("member-image-url").addEventListener("input", event => {
  if (!selectedFile) previewImage(event.target.value.trim());
});
$("add-member-button").addEventListener("click", () => showEditor());
$("cancel-edit-button").addEventListener("click", resetForm);
form.addEventListener("submit", saveMember);
list.addEventListener("click", handleListClick);
$("logout-button").addEventListener("click", async () => {
  await signOut(auth);
  location.href = "login.html";
});

if (!firebaseReady) {
  notice.textContent = "Firebase belum dikonfigurasi. Isi konfigurasi di js/firebase.js untuk mengaktifkan dashboard.";
  list.innerHTML = "";
} else {
  onAuthStateChanged(auth, async user => {
    if (!user) {
      location.replace("login.html");
      return;
    }
    try {
      const adminSnapshot = await getDoc(doc(db, "admins", user.uid));
      if (!adminSnapshot.exists() || adminSnapshot.data().role !== "admin") {
        await signOut(auth);
        location.replace("login.html");
        return;
      }
      $("admin-email").textContent = user.email || "Admin";
      notice.textContent = "Akses admin terverifikasi. Perubahan yang disimpan akan tampil di halaman utama.";
      await loadMembers();
    } catch (error) {
      console.error(error);
      notice.textContent = "Gagal memverifikasi admin atau memuat data. Periksa konfigurasi dan Security Rules.";
    }
  });
}
