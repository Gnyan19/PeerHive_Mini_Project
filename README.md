# 🐝 PeerHive - Mini Project

> **AI-Powered Anonymous Peer Support & Mental Wellness Platform for Students**

PeerHive is a full-stack web application that combines **Natural Language Processing (NLP)** with a **community-driven peer support** system to detect and classify student burnout & emotional distress in real time. The platform provides an anonymous, Reddit-style forum where students can express their feelings freely, while a fine-tuned **DistilBERT** model classifies each post into one of three emotional wellness "zones" — **Calm 🟢**, **Stressed 🟡**, or **Overwhelmed 🔴**. An admin dashboard surfaces real-time analytics and negative keyword trends to help counselors and faculty intervene early.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Directory Structure](#-directory-structure)
- [Core Terminology & Concepts](#-core-terminology--concepts)
- [How the System Works — Logic & Data Flow](#-how-the-system-works--logic--data-flow)
- [Setup & Installation](#-setup--installation)
- [Running the Application](#-running-the-application)
- [SDG Alignment](#-sdg-alignment)
- [Abstract](#-abstract)
- [Author](#-author)
- [License](#-license)

---

## 🚀 Features

| Feature | Description |
|---|---|
| **Anonymous Posting** | Students can post without logging in (Firebase anonymous auth) or sign in with Google for identity. |
| **Real-Time Sentiment Classification** | Every post is classified into one of three wellness zones using a keyword-based client-side model and an optional DistilBERT Flask API. |
| **Reddit-Style Voting** | Upvote & downvote system on posts to organically surface the most relatable content. |
| **Live Community Feed** | Real-time Firestore-powered feed ordered by newest posts first, updating across all connected clients instantly. |
| **Admin Dashboard** | Password-protected admin view featuring KPI cards, a 7-day activity line chart, and a negative keyword frequency bar chart. |
| **Google & Anonymous Auth** | Firebase Authentication supporting Google OAuth, email/password login, and anonymous sign-in. |
| **Visual Analytics** | Interactive charts (Line, Bar, Pie) built with Recharts for data-driven insights. |
| **Firebase Hosting Ready** | Configured with `firebase.json` for one-command deployment to Firebase Hosting. |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.1.1 | UI component library |
| **Vite** | 7.1.7 | Lightning-fast build tool & dev server |
| **Tailwind CSS** | 4.1.13 | Utility-first CSS framework |
| **Recharts** | 3.2.1 | Composable charting library for React |
| **Firebase JS SDK** | 12.3.0 | Firestore database, Authentication, Analytics |

### Backend (ML API)
| Technology | Purpose |
|---|---|
| **Python (Flask)** | Lightweight REST API server |
| **Flask-CORS** | Cross-Origin Resource Sharing for frontend requests |
| **PyTorch** | Deep learning framework for model inference |
| **Hugging Face Transformers** | DistilBERT tokenizer and sequence classification model |
| **SentencePiece** | Tokenization library used by transformer models |

### Machine Learning
| Component | Detail |
|---|---|
| **Base Model** | `distilbert-base-uncased` (66M parameters) |
| **Dataset** | GoEmotions (Google) — fine-tuned into 3 classes |
| **Architecture** | `DistilBertForSequenceClassification` |
| **Labels** | `LABEL_0` = Calm, `LABEL_1` = Stressed, `LABEL_2` = Overwhelmed |
| **Max Sequence Length** | 512 tokens (128 used at inference) |
| **Dropout** | 0.2 (sequence classification head) |

### Infrastructure & Deployment
| Service | Purpose |
|---|---|
| **Firebase Firestore** | NoSQL cloud database for storing posts |
| **Firebase Authentication** | User identity (Google, anonymous, email/password) |
| **Firebase Hosting** | Static site hosting for the React SPA |
| **Firebase Analytics** | Usage tracking and event logging |

---

## 🏗 Project Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React 19 + Vite + Tailwind CSS                          │   │
│  │  ┌─────────────────┐  ┌─────────────────┐               │   │
│  │  │  Student View    │  │  Admin Dashboard │               │   │
│  │  │  - Post Feed     │  │  - KPI Cards     │               │   │
│  │  │  - Live Analyzer │  │  - Line Chart    │               │   │
│  │  │  - Voting System │  │  - Bar Chart     │               │   │
│  │  └────────┬─────────┘  └────────┬─────────┘               │   │
│  │           │  simulateModel()    │  useMemo analytics       │   │
│  │           │  (keyword-based)    │                          │   │
│  └───────────┼─────────────────────┼──────────────────────────┘   │
│              │                     │                              │
│   ┌──────────▼─────────────────────▼────────────────┐            │
│   │           Firebase JS SDK                        │            │
│   │  Firestore (posts) │ Auth (users) │ Analytics    │            │
│   └──────────┬──────────────────────────────────────┘            │
└──────────────┼───────────────────────────────────────────────────┘
               │  Real-time sync (onSnapshot)
               ▼
┌──────────────────────────────────────┐
│     Firebase Cloud (Google)          │
│  Firestore DB │ Auth │ Hosting       │
└──────────────────────────────────────┘

               ▲  Optional REST API call (POST /predict)
               │
┌──────────────┴───────────────────────┐
│     Flask Backend (Python)           │
│  DistilBERT Model (PyTorch)          │
│  3-class sentiment classification    │
│  Returns: zone + probabilities       │
└──────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
PeerHive-V2.Gold-Standard-Redemption-main/
│
├── .gitignore                        # Git ignore rules
├── package.json                      # Root-level Firebase dependency
├── README.md                         # This file
├── Abstract.docx                     # Project abstract document
├── SDG PeerHive Project Report.docx  # SDG alignment report
│
├── Backend/                          # Python Flask ML API
│   ├── api.py                        # Flask REST API — /predict endpoint
│   ├── requirements.txt              # Python dependencies
│   └── models/
│       └── distilbert_goemotions/    # Fine-tuned DistilBERT model files
│           ├── config.json           # Model architecture configuration
│           ├── special_tokens_map.json
│           ├── tokenizer_config.json
│           └── vocab.txt             # WordPiece vocabulary (30,522 tokens)
│
├── PeerHive_demo/                    # React Frontend Application
│   ├── index.html                    # HTML entry point
│   ├── package.json                  # NPM dependencies & scripts
│   ├── vite.config.js                # Vite build configuration
│   ├── postcss.config.mjs            # PostCSS config for Tailwind CSS 4
│   ├── firebase.json                 # Firebase Hosting configuration
│   ├── eslint.config.js              # ESLint configuration
│   ├── public/
│   │   └── vite.svg                  # Favicon
│   ├── PeerHive/
│   │   └── index.html                # Alternative entry point
│   └── src/
│       ├── main.jsx                  # React DOM root + StrictMode
│       ├── App.jsx                   # 🔑 Main application component (all logic)
│       ├── index.css                 # Tailwind CSS import
│       ├── assets/
│       │   └── react.svg             # React logo asset
│       └── firebase/
│           └── localFirebaseConfig.js # Firebase project credentials
│
└── notebooks/                        # ML Training & Data
    ├── PeerHive V2 GoEmotions.ipynb  # Jupyter notebook — model fine-tuning
    ├── PeerHive-135.csv              # Annotated dataset (135 samples)
    ├── reddit_burnout_anonymized_for_annotation.csv  # Raw Reddit burnout data
    └── models/                       # Trained model checkpoints
```

---

## 📖 Core Terminology & Concepts

### 🟢🟡🔴 Wellness Zones (3-Class Classification)

The heart of PeerHive's classification system. Every student post is classified into one of three zones:

| Zone | Label | Description | Example Triggers |
|---|---|---|---|
| **Calm** 🟢 | `LABEL_0` | The student appears to be in a stable, neutral, or positive emotional state. | General conversation, positive updates, gratitude |
| **Stressed** 🟡 | `LABEL_1` | The student shows signs of frustration, irritation, or moderate distress. | Keyword triggers: *frustrating, angry, hate, stupid, bug, useless, deadline* |
| **Overwhelmed** 🔴 | `LABEL_2` | The student expresses severe emotional distress, hopelessness, or burnout. | Keyword triggers: *sad, crying, hopeless, failed, anxious, exhausted, lonely* |

### 🧠 DistilBERT (Distilled BERT)

A **lighter, faster version of BERT** developed by Hugging Face. It retains 97% of BERT's language understanding capabilities while being 60% faster and 40% smaller (66M vs 110M parameters). PeerHive uses `distilbert-base-uncased` fine-tuned for sequence classification.

**Key specifications used in PeerHive:**
- **Hidden Dimension:** 768
- **Attention Heads:** 12
- **Transformer Layers:** 6
- **Activation Function:** GELU
- **Vocabulary Size:** 30,522 (WordPiece tokenizer)

### 🎯 GoEmotions Dataset

A benchmark dataset by Google Research containing **58,000 Reddit comments** labeled with 27 emotion categories. PeerHive re-maps these fine-grained emotions into 3 broader wellness zones (Calm, Stressed, Overwhelmed) suitable for student mental health monitoring.

### 🔥 Firebase Services

| Service | Role in PeerHive |
|---|---|
| **Firestore** | Stores all posts as documents under `artifacts/{projectId}/public/data/posts`. Each document contains `author`, `text`, `zone`, `timestamp`, and `votes`. |
| **Authentication** | Handles 3 auth modes: **Anonymous** (default for all visitors), **Google OAuth** (for identified students), and **Email/Password** (for admin access). |
| **Hosting** | Deploys the built React SPA (`dist/` folder) with SPA routing rewrites. |
| **Analytics** | Tracks user engagement metrics via Google Analytics 4 integration. |

### 📊 Recharts

A composable React charting library used in the Admin Dashboard to render:
- **LineChart** — 7-day trends of Calm, Stressed, and Overwhelmed post counts
- **BarChart** — Frequency of top negative keywords across all posts

### 🗳 Reddit-Style Voting

Posts feature an upvote/downvote system using Firestore `increment()` atomic operations. Only authenticated (non-anonymous) users can vote. This community moderation helps surface the most resonant content.

### 🔑 Admin vs. Student Roles

| Role | Access | Auth Method |
|---|---|---|
| **Student** | Post, vote, view community feed | Anonymous or Google sign-in |
| **Admin** | Dashboard with analytics, KPIs, charts | Email/password (`admin@peerhive.io`) |

### 📈 KPIs (Key Performance Indicators)

The admin dashboard tracks three real-time KPIs:
1. **Total Posts** — Lifetime count of all community posts
2. **At-Risk Posts (1hr)** — Number of Stressed + Overwhelmed posts in the last hour, with delta comparison to the previous hour
3. **Active Users** — Count of unique post authors

---

## ⚙ How the System Works — Logic & Data Flow

### 1. User Authentication Flow
```
User visits app
    │
    ├── No existing session → Firebase Anonymous Sign-In (automatic)
    │
    ├── "Sign in with Google" → Firebase Google OAuth popup
    │
    └── "Admin Login" → Email/Password modal → Checks against ADMIN_EMAIL
                            │
                            ├── Match → Renders AdminDashboard
                            └── No match → Renders StudentView
```

### 2. Post Creation & Classification
```
Student types a message in the LiveAnalyzer
    │
    ▼
simulateModel(text) — Client-Side Keyword Analysis
    │
    ├── Scans for "stressed" keywords (frustrating, angry, hate, etc.)
    ├── Scans for "overwhelmed" keywords (sad, crying, hopeless, etc.)
    ├── Assigns weighted scores (overwhelmed words get 1.5x weight)
    └── Returns zone with highest score (default: Calm)
    │
    ▼
Post object created: { author, text, zone, timestamp, votes: 1 }
    │
    ▼
addDoc() → Firebase Firestore (real-time)
    │
    ▼
onSnapshot() fires → All connected clients update instantly
```

### 3. Optional Deep Learning Inference (Backend API)
```
POST /predict  →  Flask API (api.py)
    │
    ├── Tokenize input text (DistilBertTokenizer, max_length=128)
    ├── Forward pass through DistilBertForSequenceClassification
    ├── Apply softmax to logits → probability distribution
    └── Return JSON:
        {
          "predicted_zone": "Stressed",
          "probabilities": {
            "Calm": 0.12,
            "Stressed": 0.75,
            "Overwhelmed": 0.13
          }
        }
```

### 4. Admin Analytics Pipeline
```
All posts loaded via Firestore onSnapshot
    │
    ▼
useMemo() computes analytics on every post change:
    │
    ├── KPIs
    │   ├── Count total posts
    │   ├── Filter posts from last hour → count non-Calm = at-risk
    │   └── Compare with previous hour → calculate delta
    │
    ├── Activity Data (7-day trend)
    │   ├── Create buckets for last 7 calendar days
    │   └── Increment Calm/Stressed/Overwhelmed counters per day
    │
    └── Negative Keywords
        ├── Scan all post texts against keyword dictionaries
        ├── Count frequency of each keyword
        └── Sort descending, take top 7 → render BarChart
```

---

## 🧰 Setup & Installation

### Prerequisites

- **Node.js** ≥ 18.x & **npm** ≥ 9.x
- **Python** ≥ 3.8 (for backend ML API)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/PeerHive-V2.Gold-Standard-Redemption.git
cd PeerHive-V2.Gold-Standard-Redemption
```

### 2. Frontend Setup
```bash
cd PeerHive_demo
npm install
```

### 3. Backend Setup
```bash
cd Backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Firebase Configuration

The Firebase config is located in `PeerHive_demo/src/firebase/localFirebaseConfig.js`. To use your own Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Firestore Database**, **Authentication** (Anonymous, Google, Email/Password), and **Hosting**
4. Copy your config object and replace the values in `localFirebaseConfig.js`

---

## 🏃 Running the Application

### Start the Frontend (Development)
```bash
cd PeerHive_demo
npm run dev
```
The app will be available at `http://localhost:5173`

### Start the Backend API (Optional)
```bash
cd Backend
python api.py
```
The API will be available at `http://localhost:5000`

> **Note:** The frontend currently uses a client-side `simulateModel()` function for classification. The Flask backend provides an optional, more accurate DistilBERT-based prediction via the `/predict` endpoint.

### Build for Production
```bash
cd PeerHive_demo
npm run build
```

### Deploy to Firebase Hosting
```bash
cd PeerHive_demo
firebase deploy
```

---

## 🌍 SDG Alignment

PeerHive aligns with the following **United Nations Sustainable Development Goals**:

| SDG | Goal | How PeerHive Contributes |
|---|---|---|
| **SDG 3** | Good Health & Well-Being | Detects student burnout and mental distress through NLP-powered sentiment analysis |
| **SDG 4** | Quality Education | Creates a supportive peer community that improves student retention and well-being |

---

## ⚠️ Limitations & Future Work

### Current Limitations

| Limitation | Description |
|---|---|
| **Client-Side Classification** | The default `simulateModel()` uses simple keyword matching, which lacks contextual understanding (e.g., sarcasm, negation like "I'm not sad"). |
| **Small Training Dataset** | The annotated dataset (`PeerHive-135.csv`) contains only 135 samples, which limits the fine-tuned model's generalization ability. |
| **No Model Weights in Repo** | The DistilBERT model config and tokenizer are included, but the trained `.bin` / `.safetensors` weights file must be generated by running the notebook. |
| **Single Language Support** | Currently supports English-only text classification. |
| **No Content Moderation** | There is no profanity filter or harmful content flagging beyond zone classification. |
| **Anonymous Abuse Risk** | Anonymous posting may be exploited for spam or harassment without additional moderation tools. |
| **No Persistent User Profiles** | Anonymous users have no post history or continuity across sessions. |

### Future Work

- 🔗 **Backend Integration** — Connect the React frontend to the Flask `/predict` API for real-time deep learning inference instead of keyword-based classification.
- 📊 **Larger Dataset** — Expand the training corpus beyond 135 samples using the full GoEmotions dataset or collected campus-specific data.
- 🧠 **Advanced NLP Models** — Experiment with larger models (BERT-base, RoBERTa) or multi-task learning for improved accuracy.
- 🌐 **Multilingual Support** — Add support for regional languages using multilingual transformer models (e.g., `xlm-roberta`).
- 🛡️ **Content Moderation** — Implement toxicity detection and automated flagging using models like Perspective API.
- 💬 **Peer-to-Peer Messaging** — Enable private, anonymous conversations between students for deeper peer support.
- 📱 **Mobile App** — Build a React Native or Flutter mobile companion for on-the-go access.
- 🔔 **Alert System** — Notify counselors automatically when a surge of Overwhelmed posts is detected.
- 📈 **Enhanced Analytics** — Add sentiment trend forecasting, cohort analysis, and exportable reports for the admin dashboard.
- 🔐 **Role-Based Access Control** — Implement proper RBAC with Firebase custom claims for scalable multi-admin support.

---

## 👨‍💻 Author

**Gnyanprakhash M**

Built with Generative AI 🚀

If you found this project helpful, feel free to ⭐ star the repository.

📧 Email: gnyanprakhash2005@gmail.com  
💼 LinkedIn: [linkedin.com/in/gnyanprakhash-m-46104b361](https://linkedin.com/in/gnyanprakhash-m-46104b361)

---

## 📄 License

MIT License © 2026 Gnyanprakhash M
