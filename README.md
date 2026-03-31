# 🌉 TalentBridge — Intelligent Job Portal

A full-stack job portal web application combining social networking with AI-powered job matching. Built with **React (Vite)**, **Flask**, and **SQLite**.

---

## 🏗️ Architecture

```
jobportal/
├── backend/                 # Flask REST API
│   ├── app.py               # App factory & entry point
│   ├── extensions.py        # SQLAlchemy instance
│   ├── models.py            # DB models (User, Job, Post, Application)
│   ├── requirements.txt     # Python dependencies
│   ├── routes/
│   │   ├── auth.py          # Register, Login, /me
│   │   ├── jobs.py          # CRUD jobs, apply, applications
│   │   ├── posts.py         # Social feed CRUD
│   │   ├── profile.py       # Profile update, pic/resume upload
│   │   └── ml.py            # AI match score endpoints
│   ├── utils/
│   │   └── ml_matcher.py    # ML matching logic (TF-IDF + skill overlap)
│   └── uploads/             # Uploaded files (auto-created)
│
└── frontend/                # React + Vite SPA
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx          # Entry point
        ├── App.jsx           # Router + auth guards
        ├── index.css         # Global design system
        ├── context/
        │   └── AuthContext.jsx
        ├── utils/
        │   └── api.js        # Axios instance with JWT interceptors
        ├── components/
        │   ├── Navbar.jsx
        │   ├── AvatarImg.jsx
        │   ├── JobCard.jsx
        │   ├── PostCard.jsx
        │   └── ScoreRing.jsx  # Animated SVG score ring
        └── pages/
            ├── Landing.jsx    # Role-selection landing page
            ├── Login.jsx
            ├── Register.jsx
            ├── Home.jsx       # Dashboard with stats
            ├── Jobs.jsx       # Job listings with search/filter
            ├── JobDetail.jsx  # Job detail + apply modal
            ├── CreateJob.jsx  # HR: create/edit job postings
            ├── MyJobs.jsx     # HR: manage own jobs
            ├── Applications.jsx  # Seeker: my apps | HR: applicants list
            ├── Feed.jsx       # Social feed with image posts
            ├── Profile.jsx    # Own profile editing
            └── SeekerProfile.jsx  # Public profile view + HR ML tool
```

---

## ⚡ Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Start the Backend

```bash
cd backend
chmod +x run.sh
./run.sh
```

Or manually:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
mkdir -p uploads/profiles uploads/resumes uploads/posts
python app.py
```

Backend runs at: **http://localhost:5000**

---

### 2. Start the Frontend

```bash
cd frontend
chmod +x run.sh
./run.sh
```

Or manually:
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔐 Authentication

- JWT-based authentication via `flask-jwt-extended`
- Tokens stored in `localStorage`, auto-attached via Axios interceptor
- Auto-redirect to `/login` on 401
- Two roles: **seeker** (Job Seeker) and **hr** (Recruiter)

---

## 🤖 Machine Learning — Job Matching

The ML system in `backend/utils/ml_matcher.py` uses a **multi-signal scoring approach**:

### Signals
| Signal | Weight | Description |
|--------|--------|-------------|
| Exact Skill Overlap | 40% | Jaccard-like coverage of required skills |
| Fuzzy Skill Match | 20% | Partial string matching (e.g., "react" ↔ "reactjs") |
| TF-IDF Cosine Similarity | 40% | Resume text vs. job skill keywords |

### Score Interpretation
| Score | Label | Color |
|-------|-------|-------|
| 70–100% | Highly Suitable | 🟢 Green |
| 45–69% | Moderately Suitable | 🟡 Yellow |
| 0–44% | Low Suitability | 🔴 Red |

### Libraries Used
- `scikit-learn` — TF-IDF vectorization and cosine similarity
- `PyPDF2` — Resume text extraction from PDF
- `numpy` — Array operations

### How it Works
1. When a seeker applies, `compute_match_score()` is called with their skills, job's required skills, and their resume path
2. The score is stored in the `Application.ml_score` field
3. HR sees applicants sorted by match score
4. HR can also run the analysis live from a seeker's profile page

---

## 📋 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/` | List all active jobs |
| POST | `/api/jobs/` | Create job (HR only) |
| GET | `/api/jobs/:id` | Get job details |
| PUT | `/api/jobs/:id` | Update job (HR owner) |
| DELETE | `/api/jobs/:id` | Delete job |
| POST | `/api/jobs/:id/apply` | Apply to job (Seeker) |
| GET | `/api/jobs/:id/applications` | Get applicants (HR) |
| GET | `/api/jobs/my-jobs` | HR's own jobs |
| GET | `/api/jobs/my-applications` | Seeker's applications |
| PUT | `/api/jobs/applications/:id/status` | Update status (HR) |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/` | Get all posts (feed) |
| POST | `/api/posts/` | Create post (with optional image) |
| DELETE | `/api/posts/:id` | Delete own post |
| POST | `/api/posts/:id/like` | Like a post |
| GET | `/api/posts/user/:id` | Get posts by user |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/:id` | Get user profile |
| PUT | `/api/profile/update` | Update profile |
| POST | `/api/profile/upload-pic` | Upload profile picture |
| POST | `/api/profile/upload-resume` | Upload resume (PDF/DOC) |
| GET | `/api/profile/seekers` | List all job seekers |

### ML
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ml/match` | Match current user vs job |
| POST | `/api/ml/analyze-applicant` | HR: analyze specific applicant |

---

## 🎨 Design System

- **Fonts**: Syne (display) + DM Sans (body)
- **Theme**: Dark mode with purple accent (`#6c63ff`)
- **Components**: Cards, badges, skill tags, animated score rings
- **Responsive**: Works on mobile, tablet, desktop

---

## 🗄️ Database Schema

```
User         — id, email, password_hash, role, full_name, bio, skills,
               profile_pic, resume_path, company, location, created_at

Job          — id, title, company, location, description, requirements,
               skills_required, salary_range, job_type, hr_id, is_active, created_at

Post         — id, content, image_path, user_id, likes, created_at

Application  — id, job_id, user_id, cover_letter, ml_score, status, applied_at
```

---

## 🚀 Features at a Glance

### Job Seeker
- ✅ Register/Login with seeker role
- ✅ Build profile: bio, skills, profile picture, resume
- ✅ Browse and search/filter job listings
- ✅ View AI match score before applying
- ✅ Apply with optional cover letter
- ✅ Track application status
- ✅ Post to community feed (text + images)
- ✅ Like posts from others

### HR / Recruiter
- ✅ Register/Login with HR role
- ✅ Create and manage job postings
- ✅ View applicants sorted by AI match score
- ✅ See matched/missing skill breakdown per applicant
- ✅ Update application status (pending → reviewed → accepted/rejected)
- ✅ View full seeker profiles including posts and resume
- ✅ Run live AI match analysis from any seeker's profile
- ✅ Community feed access

---

## 🔧 Configuration

The backend uses `app.config` in `app.py`. Key settings:
```python
SECRET_KEY = 'jobportal-secret-key-2024'       # Change in production!
JWT_SECRET_KEY = 'jwt-secret-key-2024'          # Change in production!
SQLALCHEMY_DATABASE_URI = 'sqlite:///jobportal.db'
MAX_CONTENT_LENGTH = 16 * 1024 * 1024           # 16MB upload limit
```

For production, use environment variables and replace SQLite with PostgreSQL.

---

## 📦 Dependencies

### Backend
- `flask` — Web framework
- `flask-cors` — Cross-origin resource sharing
- `flask-sqlalchemy` — ORM
- `flask-jwt-extended` — JWT authentication
- `scikit-learn` — TF-IDF and cosine similarity
- `PyPDF2` — Resume PDF text extraction
- `Pillow` — Image handling
- `werkzeug` — Password hashing, file utilities

### Frontend
- `react` + `react-dom` — UI library
- `react-router-dom` — Client-side routing
- `axios` — HTTP client with interceptors
- `react-hot-toast` — Notifications
- `lucide-react` — Icon library
- `date-fns` — Date formatting
- `vite` — Build tool

---

## 💡 Extending the App

Some ideas to add next:
- **Real-time notifications** with WebSockets (Flask-SocketIO)
- **Email notifications** (Flask-Mail) when application status changes
- **LinkedIn-style connections** between users
- **Advanced ML** using sentence transformers for semantic matching
- **Job recommendations** based on seeker skills
- **PostgreSQL** for production database
- **Redis** for caching
- **Celery** for background ML processing
