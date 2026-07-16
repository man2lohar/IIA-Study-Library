import { firebaseConfig, COURSES, MATERIAL_TYPES } from './firebase-config.js';

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp, orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let currentUser = null;
let pendingAction = null;

// ---------------- icons ----------------
const ICONS = {
  home: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5"/><path d="M5 9.5V21h14V9.5"/></svg>`,
  building: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="9" height="18"/><rect x="14" y="8" width="6" height="13"/><line x1="7" y1="7" x2="10" y2="7"/><line x1="7" y1="11" x2="10" y2="11"/><line x1="7" y1="15" x2="10" y2="15"/></svg>`,
  layers: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 3 2 9 12 15 22 9 12 3"/><polyline points="2 15 12 21 22 15"/></svg>`,
  cap: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/></svg>`,
  file: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  book: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>`,
  papers: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`,
  play: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`,
  clipboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/></svg>`,
  monitor: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  search: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  folder: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2Z"/></svg>`,
  heart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`,
  chevron: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  arrowRight: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  megaphone: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2Z"/><path d="M11.6 16.8a3 3 0 0 1-5.8-1.6"/></svg>`,
  lock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
};

const TYPE_ICON = {
  "Notes": ICONS.file, "Books": ICONS.book, "Question Papers": ICONS.papers,
  "Videos": ICONS.play, "Syllabus": ICONS.clipboard, "Software": ICONS.monitor, "Other": ICONS.folder
};
const TYPE_COLOR = {
  "Notes": ["var(--red-soft)", "var(--red)"], "Books": ["var(--green-soft)", "var(--green)"],
  "Question Papers": ["var(--amber-soft)", "var(--amber)"], "Videos": ["var(--purple-soft)", "var(--purple)"],
  "Syllabus": ["var(--primary-soft)", "var(--primary)"], "Software": ["#E7EAFB", "#4F46E5"], "Other": ["var(--border-soft)", "var(--text-500)"]
};

let allMaterials = [];
let announcements = [];
let state = { view: "courses", courseId: null, partId: null, subject: null, searchTerm: "", searchType: "" };

const els = id => document.getElementById(id);
const app_ = {
  crumbs: els("crumbs"),
  main: els("mainContent"),
  authArea: els("authArea"),
  contributeBtn: els("contributeBtn"),
  modalBackdrop: els("modalBackdrop"),
  closeModal: els("closeModal"),
  contributeForm: els("contributeForm"),
  courseSelect: els("courseSelect"),
  partSelect: els("partSelect"),
  subjectSelect: els("subjectSelect"),
  typeSelect: els("typeSelect"),
  methodRadios: document.getElementsByName("method"),
  fileInputWrap: els("fileInputWrap"),
  linkInputWrap: els("linkInputWrap"),
  formError: els("formError"),
  formSuccess: els("formSuccess"),
  submitBtn: els("submitBtn"),
  loginBackdrop: els("loginBackdrop"),
  closeLoginModal: els("closeLoginModal"),
  googleSignInBtn: els("googleSignInBtn"),
  loginModalError: els("loginModalError"),
};

function courseById(id) { return COURSES.find(c => c.id === id); }
function partById(course, id) { return course.parts.find(p => p.id === id); }

function countMaterials(filter) {
  return allMaterials.filter(m =>
    (!filter.courseId || m.courseId === filter.courseId) &&
    (!filter.partId || m.partId === filter.partId) &&
    (!filter.subject || m.subject === filter.subject)
  ).length;
}

// ---------------- auth ----------------
function requireLogin(action) {
  if (currentUser) { action(); return; }
  pendingAction = action;
  openLoginModal();
}
function openLoginModal() {
  app_.loginModalError.classList.remove("show");
  app_.loginBackdrop.classList.add("open");
}
function closeLoginModal() { app_.loginBackdrop.classList.remove("open"); }

function renderAuthArea() {
  if (currentUser) {
    const initial = (currentUser.displayName || currentUser.email || "?").charAt(0).toUpperCase();
    app_.authArea.innerHTML = `
      <div class="user-chip" id="userChip" title="Sign out">
        <span class="avatar">${currentUser.photoURL ? `<img src="${currentUser.photoURL}" alt="">` : initial}</span>
        <span>${(currentUser.displayName || currentUser.email || "").split(" ")[0]}</span>
      </div>
    `;
    els("userChip").addEventListener("click", () => { if (confirm("Sign out?")) signOut(auth); });
  } else {
    app_.authArea.innerHTML = `<button class="btn btn-sm" id="signInHeaderBtn">Sign in</button>`;
    els("signInHeaderBtn").addEventListener("click", openLoginModal);
  }
}

app_.closeLoginModal.addEventListener("click", closeLoginModal);
app_.loginBackdrop.addEventListener("click", e => { if (e.target === app_.loginBackdrop) closeLoginModal(); });
app_.googleSignInBtn.addEventListener("click", async () => {
  app_.loginModalError.classList.remove("show");
  try {
    await signInWithPopup(auth, googleProvider);
    closeLoginModal();
  } catch (err) {
    console.error(err);
    app_.loginModalError.textContent = "Sign-in failed. Please try again.";
    app_.loginModalError.classList.add("show");
  }
});

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  renderAuthArea();
  await loadMaterials();
  if (user && pendingAction) {
    const fn = pendingAction;
    pendingAction = null;
    fn();
  }
});

// ---------------- breadcrumbs ----------------
function renderCrumbs() {
  const parts = [`<button data-nav="home">${ICONS.home}</button>`];
  if (state.courseId) {
    const c = courseById(state.courseId);
    parts.push(`<span class="sep">${ICONS.chevron}</span>`);
    parts.push(state.view === "parts"
      ? `<span class="current">${c.name}</span>`
      : `<button data-nav="parts" data-course="${c.id}">${c.name}</button>`);
  }
  if (state.partId) {
    const c = courseById(state.courseId);
    const p = partById(c, state.partId);
    parts.push(`<span class="sep">${ICONS.chevron}</span>`);
    parts.push(state.view === "subjects"
      ? `<span class="current">${p.label}</span>`
      : `<button data-nav="subjects" data-course="${c.id}" data-part="${p.id}">${p.label}</button>`);
  }
  if (state.subject) {
    parts.push(`<span class="sep">${ICONS.chevron}</span>`);
    parts.push(`<span class="current">${state.subject}</span>`);
  }
  if (state.view === "search") {
    parts.push(`<span class="sep">${ICONS.chevron}</span>`);
    parts.push(`<span class="current">Search results</span>`);
  }
  app_.crumbs.innerHTML = parts.join("");
  app_.crumbs.querySelectorAll("button[data-nav]").forEach(b => b.addEventListener("click", () => {
    const nav = b.dataset.nav;
    if (nav === "home") goHome();
    else if (nav === "parts") goParts(b.dataset.course);
    else if (nav === "subjects") goSubjects(b.dataset.course, b.dataset.part);
  }));
}

// ---------------- navigation ----------------
function goHome() {
  state = { view: "courses", courseId: null, partId: null, subject: null, searchTerm: "", searchType: "" };
  render();
}
function goParts(courseId) {
  state = { view: "parts", courseId, partId: null, subject: null, searchTerm: "", searchType: "" };
  render();
}
function goSubjects(courseId, partId) {
  state = { view: "subjects", courseId, partId, subject: null, searchTerm: "", searchType: "" };
  render();
}
function goMaterials(courseId, partId, subject) {
  state = { view: "materials", courseId, partId, subject, searchTerm: "", searchType: "" };
  render();
}
function goSearch(term, type, scopeCourseId) {
  state = { view: "search", courseId: scopeCourseId || null, partId: null, subject: null, searchTerm: term || "", searchType: type || "" };
  render();
}

// ---------------- render dispatch ----------------
function render() {
  renderCrumbs();
  if (state.view === "courses") return renderHome();
  if (state.view === "parts") return renderParts();
  if (state.view === "subjects") return renderSubjects();
  if (state.view === "materials") return renderMaterialsView();
  if (state.view === "search") return renderSearchView();
}

function quickAccessGrid(scopeCourseId) {
  return `
    <div class="quick-grid">
      ${MATERIAL_TYPES.filter(t => t !== "Other").map(t => `
        <div class="quick-card" data-type="${t}" ${scopeCourseId ? `data-scope="${scopeCourseId}"` : ""}>
          <div class="qi" style="background:${TYPE_COLOR[t][0]}; color:${TYPE_COLOR[t][1]}">${TYPE_ICON[t]}</div>
          <div><h4>${t}</h4><p>Browse all ${t.toLowerCase()}</p></div>
        </div>
      `).join("")}
    </div>
  `;
}
function bindQuickAccess(scopeCourseId) {
  document.querySelectorAll(".quick-card").forEach(q => q.addEventListener("click", () => {
    requireLogin(() => goSearch("", q.dataset.type, scopeCourseId || null));
  }));
}

function announceSection() {
  if (announcements.length === 0) return "";
  return `
    <section class="section">
      <div class="section-head">${ICONS.megaphone}<h2>Important Links, News &amp; Announcements</h2></div>
      <div class="announce-grid">
        ${announcements.map(a => {
          const dateStr = a.createdAt?.toDate ? a.createdAt.toDate().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "";
          return `
            <div class="announce-card">
              <div class="a-date">${dateStr}</div>
              <h4>${escapeHtml(a.title || "")}</h4>
              ${a.body ? `<p>${escapeHtml(a.body)}</p>` : ""}
              ${a.link ? `<a class="link" href="${a.link}" target="_blank" rel="noopener noreferrer">Open link →</a>` : ""}
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderHome() {
  const totalMaterials = allMaterials.length;
  const totalSubjects = COURSES.reduce((n, c) => n + c.parts.reduce((m, p) => m + p.subjects.length, 0), 0);

  app_.main.innerHTML = `
    <section class="hero">
      <p class="eyebrow"><span class="star">★</span> Free &nbsp;•&nbsp; Curated &nbsp;•&nbsp; Student Driven</p>
      <h1>Architecture Study Library</h1>
      <p class="lead">Your one-stop platform for architecture study resources. Notes, books, papers, videos & more — all in one place.</p>
      <div class="search-wrap">
        <div class="search-box">
          ${ICONS.search}
          <input type="text" id="heroSearch" placeholder="Search notes, subjects, books, papers..." autocomplete="off">
          <button id="heroSearchBtn">${ICONS.search}</button>
        </div>
        <div class="suggestions" id="suggestions"></div>
      </div>
      <div class="tag-row">
        <span class="label">Popular:</span>
        ${["Building Construction","History of Architecture","Structures","Climatology","Working Drawings"]
          .map(t => `<button class="pill" data-tag="${t}">${t}</button>`).join("")}
      </div>
    </section>

    ${announceSection()}

    <section class="section">
      <div class="section-head">${ICONS.cap}<h2>Choose Your Course</h2></div>
      <div class="course-grid">
        ${COURSES.map(c => `
          <div class="course-card accent-${c.accent}" data-course="${c.id}" tabindex="0" role="button">
            <div class="icon-circle">${ICONS.building}</div>
            <h3>${c.name}</h3>
            <div class="full-name">${c.fullName}</div>
            <p>${c.tagline}</p>
            <span class="explore">Explore ${c.parts[0].label.includes("Semester") ? "Semesters" : "Parts"} ${ICONS.arrowRight}</span>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head">${ICONS.folder}<h2>Quick Access</h2></div>
      ${quickAccessGrid(null)}
    </section>

    <div class="stats-bar">
      <div class="stat">${ICONS.users}<div><div class="num">500+</div><div class="lbl">Students</div></div></div>
      <div class="stat">${ICONS.folder}<div><div class="num">${totalMaterials}</div><div class="lbl">Resources</div></div></div>
      <div class="stat">${ICONS.cap}<div><div class="num">${COURSES.length}</div><div class="lbl">Courses</div></div></div>
      <div class="stat">${ICONS.book}<div><div class="num">${totalSubjects}</div><div class="lbl">Subjects</div></div></div>
      <div class="stat">${ICONS.heart}<div><div class="num">100%</div><div class="lbl">Free</div></div></div>
    </div>
  `;

  bindHeroSearch();
  bindQuickAccess(null);
  document.querySelectorAll(".course-card").forEach(card => {
    const open = () => goParts(card.dataset.course);
    card.addEventListener("click", open);
    card.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
  });
  document.querySelectorAll(".pill[data-tag]").forEach(p => p.addEventListener("click", () => requireLogin(() => goSearch(p.dataset.tag, ""))));
}

function renderParts() {
  const c = courseById(state.courseId);
  const isSemester = c.parts[0].label.includes("Semester");
  app_.main.innerHTML = `
    <section class="section" style="margin-top:32px;">
      <div class="section-head">${ICONS.layers}<h2>${c.fullName} — ${isSemester ? "Semesters" : "Parts"}</h2></div>
      <div class="tile-grid">
        ${c.parts.map(p => `
          <div class="tile" data-part="${p.id}" tabindex="0" role="button">
            <div class="tile-label">${p.label}</div>
            <div class="tile-meta">${p.subjects.length} subjects · ${countMaterials({courseId:c.id, partId:p.id})} resources</div>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head">${ICONS.folder}<h2>Quick Access — ${c.name}</h2></div>
      ${quickAccessGrid(c.id)}
    </section>
  `;
  document.querySelectorAll(".tile[data-part]").forEach(t => {
    const open = () => goSubjects(c.id, t.dataset.part);
    t.addEventListener("click", open);
    t.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
  });
  bindQuickAccess(c.id);
}

function renderSubjects() {
  const c = courseById(state.courseId);
  const p = partById(c, state.partId);
  app_.main.innerHTML = `
    <section class="section" style="margin-top:32px;">
      <div class="section-head">${ICONS.book}<h2>${c.name} — ${p.label} Subjects</h2></div>
      <div class="gate-note">${ICONS.lock} Sign in with Google to open a subject's notes, books, papers or videos.</div>
      <div class="tile-grid">
        ${p.subjects.map(s => `
          <div class="tile" data-subject="${encodeURIComponent(s)}" tabindex="0" role="button">
            <div class="tile-label">${s}</div>
            <div class="tile-meta">${countMaterials({courseId:c.id, partId:p.id, subject:s})} resources</div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
  document.querySelectorAll(".tile[data-subject]").forEach(t => {
    const subject = decodeURIComponent(t.dataset.subject);
    const open = () => requireLogin(() => goMaterials(c.id, p.id, subject));
    t.addEventListener("click", open);
    t.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
  });
}

function renderMaterialsView() {
  const c = courseById(state.courseId);
  const p = partById(c, state.partId);
  const items = allMaterials.filter(m => m.courseId === c.id && m.partId === p.id && m.subject === state.subject);
  app_.main.innerHTML = `
    <section class="section" style="margin-top:32px;">
      <div class="section-head">${ICONS.file}<h2>${state.subject}</h2>
        <button class="btn btn-primary btn-sm" style="margin-left:auto;" id="addHereBtn">+ Add material here</button>
      </div>
      <div class="material-grid">${materialCards(items)}</div>
    </section>
  `;
  els("addHereBtn").addEventListener("click", () => openModal({ courseId: c.id, partId: p.id, subject: state.subject }));
}

function renderSearchView() {
  let items = allMaterials;
  let title = "Search results";
  if (state.courseId) items = items.filter(m => m.courseId === state.courseId);
  if (state.searchType) {
    items = items.filter(m => m.type === state.searchType);
    title = state.courseId ? `${state.searchType} — ${courseById(state.courseId).name}` : state.searchType;
  }
  if (state.searchTerm) {
    const t = state.searchTerm.toLowerCase();
    items = items.filter(m =>
      (m.title || "").toLowerCase().includes(t) ||
      (m.subject || "").toLowerCase().includes(t) ||
      (m.description || "").toLowerCase().includes(t)
    );
    title = `Results for "${state.searchTerm}"`;
  }
  app_.main.innerHTML = `
    <section class="section" style="margin-top:32px;">
      <div class="section-head">${ICONS.search}<h2>${title}</h2></div>
      <div class="material-grid">${materialCards(items, true)}</div>
    </section>
  `;
}

function materialCards(items, showPath = false) {
  if (items.length === 0) return `<div class="empty-state">Nothing here yet — be the first to add one.</div>`;
  return items.map(m => {
    const href = m.fileURL || m.link || "#";
    const dateStr = m.createdAt?.toDate ? m.createdAt.toDate().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "—";
    const course = courseById(m.courseId);
    const part = course ? partById(course, m.partId) : null;
    return `
      <div class="material-card">
        <div class="body">
          <span class="type-tag">${m.type || "Other"}</span>
          <h4>${escapeHtml(m.title || "Untitled")}</h4>
          ${m.description ? `<p>${escapeHtml(m.description)}</p>` : ""}
          ${showPath && course ? `<div class="path">${course.name} · ${part ? part.label : ""} · ${escapeHtml(m.subject || "")}</div>` : ""}
        </div>
        <div class="meta-row"><span>${escapeHtml(m.uploaderName || "Anonymous")}</span><span>${dateStr}</span></div>
        <div class="actions"><a class="btn btn-primary btn-sm" href="${href}" target="_blank" rel="noopener noreferrer">Open</a></div>
      </div>
    `;
  }).join("");
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

// ---------------- live search suggestions ----------------
function allSubjectsFlat() {
  const out = [];
  COURSES.forEach(c => c.parts.forEach(p => p.subjects.forEach(s => {
    out.push({ courseId: c.id, courseName: c.name, partId: p.id, partLabel: p.label, subject: s });
  })));
  return out;
}

function renderSuggestions(term) {
  const box = els("suggestions");
  if (!box) return;
  const t = term.trim().toLowerCase();
  if (!t) { box.classList.remove("open"); box.innerHTML = ""; return; }

  const subjectMatches = allSubjectsFlat().filter(x => x.subject.toLowerCase().includes(t)).slice(0, 6);
  const materialMatches = allMaterials.filter(m => (m.title || "").toLowerCase().includes(t)).slice(0, 6);

  if (subjectMatches.length === 0 && materialMatches.length === 0) {
    box.innerHTML = `<div class="sug-empty">No matches for "${escapeHtml(term)}" yet.</div>`;
    box.classList.add("open");
    return;
  }

  let html = "";
  if (subjectMatches.length) {
    html += `<div class="sug-label">Subjects</div>`;
    html += subjectMatches.map((x, i) => `
      <div class="sug-item" data-kind="subject" data-i="${i}">
        <span class="sug-main">${escapeHtml(x.subject)}</span>
        <span class="sug-path">${x.courseName} · ${x.partLabel}</span>
      </div>
    `).join("");
  }
  if (materialMatches.length) {
    html += `<div class="sug-label">Materials${currentUser ? "" : " (sign in to open)"}</div>`;
    html += materialMatches.map((m, i) => `
      <div class="sug-item" data-kind="material" data-i="${i}">
        <span class="sug-main">${escapeHtml(m.title)}</span>
        <span class="sug-path">${m.type || ""}</span>
      </div>
    `).join("");
  }
  box.innerHTML = html;
  box.classList.add("open");

  box.querySelectorAll(".sug-item").forEach(el => {
    el.addEventListener("click", () => {
      const i = Number(el.dataset.i);
      box.classList.remove("open");
      if (el.dataset.kind === "subject") {
        const x = subjectMatches[i];
        requireLogin(() => goMaterials(x.courseId, x.partId, x.subject));
      } else {
        const m = materialMatches[i];
        requireLogin(() => goMaterials(m.courseId, m.partId, m.subject));
      }
    });
  });
}

function bindHeroSearch() {
  const input = els("heroSearch"), btn = els("heroSearchBtn"), box = els("suggestions");
  input.addEventListener("input", () => renderSuggestions(input.value));
  input.addEventListener("focus", () => { if (input.value.trim()) renderSuggestions(input.value); });
  document.addEventListener("click", (e) => {
    if (box && !box.contains(e.target) && e.target !== input) box.classList.remove("open");
  });
  const go = () => { box.classList.remove("open"); requireLogin(() => goSearch(input.value.trim(), "")); };
  btn.addEventListener("click", go);
  input.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
}

// ---------------- data load ----------------
async function loadMaterials() {
  try {
    const q = query(collection(db, "materials"), where("status", "==", "approved"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    allMaterials = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    allMaterials = []; // not signed in yet, or no permission — expected until login
  }
  render();
}

async function loadAnnouncements() {
  try {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(6));
    const snap = await getDocs(q);
    announcements = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Failed to load announcements:", err);
    announcements = [];
  }
  if (state.view === "courses") renderHome();
}

// ---------------- contribute modal ----------------
function populateCourseSelect() {
  app_.courseSelect.innerHTML = COURSES.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  app_.typeSelect.innerHTML = MATERIAL_TYPES.map(t => `<option value="${t}">${t}</option>`).join("");
  app_.courseSelect.addEventListener("change", () => populatePartSelect(app_.courseSelect.value));
  app_.partSelect.addEventListener("change", () => populateSubjectSelect(app_.courseSelect.value, app_.partSelect.value));
}
function populatePartSelect(courseId) {
  const c = courseById(courseId);
  app_.partSelect.innerHTML = c.parts.map(p => `<option value="${p.id}">${p.label}</option>`).join("");
  populateSubjectSelect(courseId, app_.partSelect.value);
}
function populateSubjectSelect(courseId, partId) {
  const c = courseById(courseId);
  const p = partById(c, partId);
  app_.subjectSelect.innerHTML = p.subjects.map(s => `<option value="${s}">${s}</option>`).join("");
}

function openModal(preset) {
  populateCourseSelect();
  if (preset?.courseId) {
    app_.courseSelect.value = preset.courseId;
    populatePartSelect(preset.courseId);
    if (preset.partId) app_.partSelect.value = preset.partId;
    populateSubjectSelect(preset.courseId, app_.partSelect.value);
    if (preset.subject) app_.subjectSelect.value = preset.subject;
  } else {
    populatePartSelect(app_.courseSelect.value);
  }
  app_.modalBackdrop.classList.add("open");
  app_.formError.classList.remove("show");
  app_.formSuccess.style.display = "none";
  app_.contributeForm.style.display = "block";
}
function closeModal() {
  app_.modalBackdrop.classList.remove("open");
  app_.contributeForm.reset();
  updateMethodVisibility();
}
function updateMethodVisibility() {
  const method = [...app_.methodRadios].find(r => r.checked)?.value || "link";
  app_.fileInputWrap.style.display = method === "file" ? "block" : "none";
  app_.linkInputWrap.style.display = method === "link" ? "block" : "none";
}

async function handleSubmit(e) {
  e.preventDefault();
  app_.formError.classList.remove("show");

  const title = els("titleInput").value.trim();
  const courseId = app_.courseSelect.value;
  const partId = app_.partSelect.value;
  const subject = app_.subjectSelect.value;
  const type = app_.typeSelect.value;
  const description = els("descInput").value.trim();
  const uploaderName = els("nameInput").value.trim() || "Anonymous";
  const method = [...app_.methodRadios].find(r => r.checked)?.value;
  const linkVal = els("linkInput").value.trim();
  const fileInput = els("fileInput");
  const file = fileInput.files[0];

  if (!title) return showError("Please add a title.");
  if (method === "link" && !linkVal) return showError("Please paste a link.");
  if (method === "file" && !file) return showError("Please choose a file.");
  if (file && file.size > 25 * 1024 * 1024) return showError("File is over 25MB — please share a link instead.");

  app_.submitBtn.disabled = true;
  app_.submitBtn.textContent = "Submitting...";

  try {
    let fileURL = null, fileName = null, fileSize = null;
    if (method === "file" && file) {
      const path = `materials/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      fileURL = await getDownloadURL(storageRef);
      fileName = file.name;
      fileSize = file.size;
    }

    await addDoc(collection(db, "materials"), {
      title, courseId, partId, subject, type, description, uploaderName,
      link: method === "link" ? linkVal : null,
      fileURL, fileName, fileSize,
      status: "pending",
      createdAt: serverTimestamp()
    });

    app_.contributeForm.style.display = "none";
    app_.formSuccess.style.display = "block";
    app_.formSuccess.textContent = "Submitted — an admin will review and publish it shortly.";
  } catch (err) {
    console.error(err);
    showError("Something went wrong submitting this. Please try again.");
  } finally {
    app_.submitBtn.disabled = false;
    app_.submitBtn.textContent = "Submit for review";
  }
}
function showError(msg) { app_.formError.textContent = msg; app_.formError.classList.add("show"); }

function bindEvents() {
  app_.contributeBtn.addEventListener("click", () => openModal());
  app_.closeModal.addEventListener("click", closeModal);
  app_.modalBackdrop.addEventListener("click", e => { if (e.target === app_.modalBackdrop) closeModal(); });
  app_.methodRadios.forEach(r => r.addEventListener("change", updateMethodVisibility));
  app_.contributeForm.addEventListener("submit", handleSubmit);
  els("logoBrand").addEventListener("click", goHome);
}

bindEvents();
renderAuthArea();
loadAnnouncements();
loadMaterials();
