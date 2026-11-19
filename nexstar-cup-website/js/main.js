import { firebaseReady, db } from "./firebase.js";
import { defaultMembers } from "./default-data.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const grid = document.getElementById("members-grid");
const fallbackImage = "https://placehold.co/600x700/351342/ffffff?text=NEXSTAR+MEMBER";

function safeText(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function renderMembers(members) {
  if (!members.length) {
    grid.innerHTML = '<div class="empty-member">Belum ada anggota yang ditampilkan.</div>';
    return;
  }
  grid.innerHTML = members.map((member, index) => {
    const image = member.imageUrl || fallbackImage;
    return `
      <article class="member-card">
        <img class="member-image" src="${safeText(image)}" alt="${safeText(member.name || "Anggota Nexstar")}" loading="lazy"
          onerror="this.onerror=null;this.src='${fallbackImage}'">
        <div class="member-info">
          <span class="member-number">MEMBER / ${String(index + 1).padStart(2, "0")}</span>
          <h3>${safeText(member.name || "Nama anggota")}</h3>
          <p>${safeText(member.description || "")}</p>
        </div>
      </article>`;
  }).join("");
}

async function loadMembers() {
  try {
    if (!firebaseReady) {
      renderMembers(defaultMembers);
      return;
    }
    const memberQuery = query(collection(db, "members"), orderBy("order", "asc"));
    const snapshot = await getDocs(memberQuery);
    const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderMembers(members.length ? members : defaultMembers);
  } catch (error) {
    console.error("Gagal memuat anggota:", error);
    renderMembers(defaultMembers);
  }
}

document.getElementById("year").textContent = new Date().getFullYear();
const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("main-nav");
menuToggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
}));
loadMembers();
