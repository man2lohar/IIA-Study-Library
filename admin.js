import { firebaseConfig, ADMIN_EMAILS, COURSES } from './firebase-config.js';

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy, addDoc, serverTimestamp, limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const els = {
  loginScreen: document.getElementById("loginScreen"),
  adminScreen: document.getElementById("adminScreen"),
  loginBtn: document.getElementById("loginBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  adminEmail: document.getElementById("adminEmail"),
  loginError: document.getElementById("loginError"),
  pendingList: document.getElementById("pendingList"),
  approvedList: document.getElementById("approvedList"),
  pendingCount: document.getElementById("pendingCount"),
  approvedCount: document.getElementById("approvedCount"),
  tabPending: document.getElementById("tabPending"),
  tabApproved: document.getElementById("tabApproved"),
  tabAnnouncements: document.getElementById("tabAnnouncements"),
  announcementsPanel: document.getElementById("announcementsPanel"),
  annTitle: document.getElementById("annTitle"),
  annBody: document.getElementById("annBody"),
  annLink: document.getElementById("annLink"),
  postAnnBtn: document.getElementById("postAnnBtn"),
  annError: document.getElementById("annError"),
  annList: document.getElementById("annList"),
};

let activeTab = "pending";

els.loginBtn.addEventListener("click", async () => {
  els.loginError.classList.remove("show");
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error(err);
    els.loginError.textContent = "Sign-in failed. Please try again.";
    els.loginError.classList.add("show");
  }
});

els.logoutBtn.addEventListener("click", () => signOut(auth));

els.tabPending.addEventListener("click", () => switchTab("pending"));
els.tabApproved.addEventListener("click", () => switchTab("approved"));
els.tabAnnouncements.addEventListener("click", () => switchTab("announcements"));

function switchTab(tab) {
  activeTab = tab;
  els.tabPending.classList.toggle("active", tab === "pending");
  els.tabApproved.classList.toggle("active", tab === "approved");
  els.tabAnnouncements.classList.toggle("active", tab === "announcements");
  els.pendingList.style.display = tab === "pending" ? "grid" : "none";
  els.approvedList.style.display = tab === "approved" ? "grid" : "none";
  els.announcementsPanel.style.display = tab === "announcements" ? "block" : "none";
  if (tab === "announcements") loadAnnouncements();
}

els.postAnnBtn.addEventListener("click", async () => {
  els.annError.classList.remove("show");
  const title = els.annTitle.value.trim();
  const body = els.annBody.value.trim();
  const link = els.annLink.value.trim();
  if (!title) {
    els.annError.textContent = "Please add a title.";
    els.annError.classList.add("show");
    return;
  }
  els.postAnnBtn.disabled = true;
  try {
    await addDoc(collection(db, "announcements"), {
      title, body: body || null, link: link || null, createdAt: serverTimestamp()
    });
    els.annTitle.value = ""; els.annBody.value = ""; els.annLink.value = "";
    await loadAnnouncements();
  } catch (err) {
    console.error(err);
    els.annError.textContent = "Failed to post. Please try again.";
    els.annError.classList.add("show");
  } finally {
    els.postAnnBtn.disabled = false;
  }
});

async function loadAnnouncements() {
  const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(20));
  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (items.length === 0) {
    els.annList.innerHTML = `<div class="empty-state">No announcements yet.</div>`;
    return;
  }
  els.annList.innerHTML = items.map(a => {
    const dateStr = a.createdAt?.toDate ? a.createdAt.toDate().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "";
    return `
      <div class="announce-card">
        <div class="a-date">${dateStr}</div>
        <h4>${escapeHtml(a.title || "")}</h4>
        ${a.body ? `<p>${escapeHtml(a.body)}</p>` : ""}
        ${a.link ? `<a class="link" href="${a.link}" target="_blank" rel="noopener noreferrer">Open link →</a>` : ""}
        <div style="margin-top:10px;"><button class="btn btn-danger btn-sm" data-ann-id="${a.id}">Remove</button></div>
      </div>
    `;
  }).join("");
  els.annList.querySelectorAll("button[data-ann-id]").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Remove this announcement?")) return;
      await deleteDoc(doc(db, "announcements", btn.dataset.annId));
      await loadAnnouncements();
    });
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user && ADMIN_EMAILS.includes(user.email)) {
    els.loginScreen.style.display = "none";
    els.adminScreen.style.display = "block";
    els.adminEmail.textContent = user.email;
    els.logoutBtn.style.display = "inline-flex";
    await loadAll();
  } else if (user) {
    els.loginError.textContent = `${user.email} isn't on the admin list. Add it to ADMIN_EMAILS in firebase-config.js.`;
    els.loginError.classList.add("show");
    await signOut(auth);
  } else {
    els.loginScreen.style.display = "flex";
    els.adminScreen.style.display = "none";
    els.logoutBtn.style.display = "none";
  }
});

function pathLabel(m) {
  const course = COURSES.find(c => c.id === m.courseId);
  if (!course) return m.subject || "—";
  const part = course.parts.find(p => p.id === m.partId);
  return `${course.name} · ${part ? part.label : "—"} · ${m.subject || "—"}`;
}

async function loadAll() {
  await Promise.all([loadPending(), loadApproved()]);
}

async function loadPending() {
  const q = query(collection(db, "materials"), where("status", "==", "pending"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  els.pendingCount.textContent = items.length;
  renderList(els.pendingList, items, true);
}

async function loadApproved() {
  const q = query(collection(db, "materials"), where("status", "==", "approved"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  els.approvedCount.textContent = items.length;
  renderList(els.approvedList, items, false);
}

function renderList(container, items, isPending) {
  if (items.length === 0) {
    container.innerHTML = `<div class="empty-state">Nothing here.</div>`;
    return;
  }
  container.innerHTML = items.map(m => {
    const href = m.fileURL || m.link || "#";
    const dateStr = m.createdAt?.toDate ? m.createdAt.toDate().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "—";
    return `
      <div class="material-card">
        <div class="body">
          <span class="type-tag">${m.type || "Other"}</span>
          <h4>${escapeHtml(m.title || "Untitled")}</h4>
          ${m.description ? `<p>${escapeHtml(m.description)}</p>` : ""}
          <div class="path">${pathLabel(m)}</div>
        </div>
        <div class="meta-row"><span>${escapeHtml(m.uploaderName || "Anonymous")}</span><span>${dateStr}</span></div>
        <div class="actions">
          <a class="btn btn-sm" href="${href}" target="_blank" rel="noopener noreferrer">Preview</a>
          ${isPending
            ? `<button class="btn btn-ok btn-sm" data-action="approve" data-id="${m.id}">Approve</button>
               <button class="btn btn-danger btn-sm" data-action="reject" data-id="${m.id}">Reject</button>`
            : `<button class="btn btn-danger btn-sm" data-action="delete" data-id="${m.id}">Remove</button>`
          }
        </div>
      </div>
    `;
  }).join("");

  container.querySelectorAll("button[data-action]").forEach(btn => {
    btn.addEventListener("click", () => handleAction(btn.dataset.action, btn.dataset.id));
  });
}

async function handleAction(action, id) {
  const ref = doc(db, "materials", id);
  if (action === "approve") {
    await updateDoc(ref, { status: "approved" });
  } else if (action === "reject" || action === "delete") {
    if (!confirm("Are you sure? This can't be undone.")) return;
    await deleteDoc(ref);
  }
  await loadAll();
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}
