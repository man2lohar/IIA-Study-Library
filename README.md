# Architecture Study Library

A shared, community-contributed study library. Students submit notes/books/links,
an admin approves before anything goes public. Browsing is organized as
**Course → Part/Semester → Subject → Materials** (Diploma has "Parts", B.Arch and
M.Arch have "Semesters").

## Files

| File | Purpose |
|---|---|
| `index.html` | Public library — browse, search, contribute |
| `admin.html` | Admin review panel (Google sign-in required) |
| `app.js` | Public page logic |
| `admin.js` | Admin panel logic |
| `style.css` | Shared design system |
| `firebase-config.js` | **Edit this** — your Firebase keys, admin emails, course list |
| `firestore.rules` | Firestore security rules |
| `storage.rules` | Storage security rules |

## Setup (15–20 minutes)

### 1. Create a new Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. Name it something like `arch-study-library`.

### 2. Enable the services you need
In the left sidebar:
- **Build → Firestore Database** → Create database → Start in **production mode**.
- **Build → Storage** → Get started → **production mode**.
- **Build → Authentication** → Sign-in method → enable **Google**. (Any Google
  account can sign in as a student — access isn't restricted to `ADMIN_EMAILS`,
  that list only controls who can use `admin.html`.)

### 3. Register a web app
- Project Overview → click the **`</>`** (web) icon → register an app (no Hosting needed).
- Copy the `firebaseConfig` object it gives you.

### 4. Edit `firebase-config.js`
Paste your config into the `firebaseConfig` object. Then:
- Add your Google account email(s) to `ADMIN_EMAILS` — these are the only accounts
  that can sign into `admin.html`.
- Edit the `COURSES` array to match your real curriculum — each course has a list
  of `parts` (Diploma) or semesters (B.Arch/M.Arch), and each part has a `subjects`
  array. Add, rename, or remove any of these freely.

### 5. Update the security rules to match
Both `firestore.rules` and the `isAdmin()` email list must match `ADMIN_EMAILS`
exactly (Firestore/Storage rules can't read your JS file, so the email list is
duplicated there). Edit the email in `firestore.rules`.

Deploy rules — easiest way if you don't have the Firebase CLI set up:
- Firestore Database → **Rules** tab → paste in `firestore.rules` → Publish.
- Storage → **Rules** tab → paste in `storage.rules` → Publish.

(If you do have the Firebase CLI: `firebase deploy --only firestore:rules,storage:rules`.)

### 6. Host it
Any static host works — same as your other CyManSquare pages:
- **GitHub Pages**: push these files to a repo, enable Pages on the `main` branch.
- **Netlify / Cloudflare Pages**: drag-and-drop the folder or connect the repo.

No build step needed — it's plain HTML/JS/CSS.

### 7. Share the link
Post the `index.html` link in the WhatsApp group. Anyone can browse and contribute;
share the `admin.html` link only with yourself/trusted admins.

## Login gating

Browsing courses, parts/semesters, and subject names is open to everyone —
no login needed to see the structure. But opening a subject (to see its notes,
books, question papers, videos) requires signing in with Google. This is enforced
in two places:
- The UI shows a "Sign in to continue" prompt whenever someone tries to open a
  subject, run a search, or use Quick Access.
- `firestore.rules` also blocks reads of the `materials` collection for anyone
  who isn't signed in — so this isn't just a UI nicety, it's enforced server-side.

Any Google account works for students (it's not restricted to `ADMIN_EMAILS`).
Submitting new material via "+ Contribute" still works without signing in, to
keep that friction-free for the WhatsApp group.

## How moderation works

1. A student fills the "Contribute material" form on the public page.
2. It's saved to Firestore with `status: "pending"` — **not visible to anyone
   (including signed-in students) until approved**.
3. You open `admin.html`, sign in with Google, and see it under **Pending**.
4. **Approve** → it appears instantly on the public site.
   **Reject** → it's deleted.
5. Anything already published can be removed later from the **Published** tab.
6. Use the **Announcements** tab to post news/important links to the homepage
   "Important Links, News & Announcements" section — this is public, no login
   needed to read it.

## Adding/renaming courses, semesters, or subjects later

Edit the `COURSES` array in `firebase-config.js` and redeploy the file — no database
migration needed. Materials are tagged with `courseId`, `partId`, and the subject
name string, so:
- Renaming a subject's text is safe (existing material's `subject` field just won't
  match anymore — safest to only add new subjects, or edit the label consistently).
- Renaming a course/part `label` or `name` is always safe (only `id` matters for matching).
- Don't change an existing `id` on a course or part once material has been tagged
  with it, or that material will become "orphaned" (still in the database, just
  not reachable through browsing).

## Notes on scale

- Firestore and Anonymous/Google Auth are free at this scale (500 members, a few
  hundred documents) — you won't hit billing.
- Storage free tier is 5GB/1GB-per-day-download. If students upload a lot of large
  PDFs/videos, encourage pasting a Google Drive link instead (the form supports both).
- The 25MB upload cap is enforced both client-side and in `storage.rules`.
