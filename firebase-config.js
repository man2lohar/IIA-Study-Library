// ============================================================
// FIREBASE CONFIG
// Replace with the config from YOUR new Firebase project:
// Firebase Console → Project Settings → General → Your apps → SDK setup
// ============================================================
export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

// Add the email address(es) that should have admin access.
// These must match the Google account(s) used to sign in on admin.html.
export const ADMIN_EMAILS = [
  "your-email@gmail.com"
];

// Material types shown as "Quick Access" and in the contribute form.
export const MATERIAL_TYPES = ["Notes", "Books", "Question Papers", "Videos", "Syllabus", "Software", "Other"];

// ============================================================
// CURRICULUM
// Three courses, each with parts/semesters, each with subjects.
// Edit freely — add/rename/remove subjects, semesters, or whole courses.
// `id` values are stored on every material, so avoid changing an `id`
// once material has been tagged with it (renaming `label`/`name` is fine).
// ============================================================
export const COURSES = [
  {
    id: "diploma",
    name: "Diploma",
    fullName: "Diploma in Architecture",
    tagline: "Study material for all parts of the Diploma course.",
    accent: "blue",
    parts: [
      { id: "p1", label: "Part 1", subjects: [
        "Building Construction I", "History of Architecture I", "Architectural Design I",
        "Building Materials", "Free Hand & Geometrical Drawing", "Mathematics"
      ]},
      { id: "p2", label: "Part 2", subjects: [
        "Building Construction II", "History of Architecture II", "Architectural Design II",
        "Surveying", "Estimating & Costing", "Building Services I"
      ]},
      { id: "p3", label: "Part 3", subjects: [
        "Building Construction III", "Theory of Structures I", "Architectural Design III",
        "Working Drawings & Detailing", "Computer Applications", "Building Bye-Laws"
      ]}
    ]
  },
  {
    id: "barch",
    name: "B.Arch",
    fullName: "Bachelor of Architecture",
    tagline: "Subject-wise notes, books, papers and more for all semesters.",
    accent: "green",
    parts: [
      { id: "s1", label: "Semester 1", subjects: ["Architectural Design I", "Building Construction I", "History of Architecture I", "Visual Arts", "Mathematics"] },
      { id: "s2", label: "Semester 2", subjects: ["Architectural Design II", "Building Construction II", "History of Architecture II", "Building Materials", "Surveying"] },
      { id: "s3", label: "Semester 3", subjects: ["Architectural Design III", "Theory of Structures I", "Building Construction III", "Climatology", "Computer Applications I"] },
      { id: "s4", label: "Semester 4", subjects: ["Architectural Design IV", "Theory of Structures II", "Building Services I (Water Supply & Sanitation)", "History of Architecture III", "Working Drawings I"] },
      { id: "s5", label: "Semester 5", subjects: ["Architectural Design V", "Structures III (RCC Design)", "Building Services II (Electrical)", "Urban Design Studio", "Estimating & Costing"] },
      { id: "s6", label: "Semester 6", subjects: ["Architectural Design VI", "Structures IV (Steel Design)", "Building Services III (HVAC)", "Landscape Architecture", "Working Drawings II"] },
      { id: "s7", label: "Semester 7", subjects: ["Architectural Design VII", "Advanced Building Construction", "Professional Practice I", "Building Bye-Laws & NBC", "Interior Design"] },
      { id: "s8", label: "Semester 8", subjects: ["Architectural Design VIII (Urban)", "Sustainable/Green Architecture", "Professional Practice II", "Elective I", "Industrial Training"] },
      { id: "s9", label: "Semester 9", subjects: ["Thesis — Research & Programming", "Advanced Structures", "Conservation & Heritage", "Elective II"] },
      { id: "s10", label: "Semester 10", subjects: ["Thesis — Final Design", "Viva Voce Preparation"] }
    ]
  },
  {
    id: "march",
    name: "M.Arch",
    fullName: "Master of Architecture",
    tagline: "Advanced resources for all specializations and semesters.",
    accent: "purple",
    parts: [
      { id: "s1", label: "Semester 1", subjects: ["Advanced Design Studio I", "Research Methodology", "Theories in Architecture", "Specialization Elective I"] },
      { id: "s2", label: "Semester 2", subjects: ["Advanced Design Studio II", "Advanced Building Technology", "Specialization Elective II", "Seminar"] },
      { id: "s3", label: "Semester 3", subjects: ["Dissertation — Proposal", "Specialization Studio", "Specialization Elective III"] },
      { id: "s4", label: "Semester 4", subjects: ["Thesis — Final Submission", "Viva Voce"] }
    ]
  },
  {
    id: "iia",
    name: "IIA",
    fullName: "Indian Institute of Architects — Associateship Exam",
    tagline: "Resources for IIA's Associateship (AIIA) examination, part-wise.",
    accent: "amber",
    parts: [
      { id: "p1", label: "Part I", subjects: [
        "Architectural Design I", "Building Construction I", "History of Architecture I",
        "Materials & Methods of Construction", "Building Drawing"
      ]},
      { id: "p2", label: "Part II", subjects: [
        "Architectural Design II", "Building Construction II", "Theory of Structures I",
        "History of Architecture II", "Surveying & Levelling"
      ]},
      { id: "p3", label: "Part III", subjects: [
        "Architectural Design III", "Theory of Structures II", "Building Services",
        "Estimating & Costing", "Working Drawings"
      ]},
      { id: "p4", label: "Part IV", subjects: [
        "Architectural Design IV (Thesis)", "Professional Practice", "Town Planning",
        "Specifications & Valuation"
      ]}
    ]
  }
];
