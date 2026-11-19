# Eventify — Campus Event Discovery & Organiser SaaS Platform

Eventify is a full-featured, responsive SaaS platform designed for collegiate communities, students, and event organizers. It includes an interactive event discovery homepage, a student portal with digital QR tickets, a complete 6-screen authentication system, and an Organiser Studio with custom banner liberty and a real-time QR camera pass scanner gate.

---

## 🚀 Key Features

### 1. Student Event Discovery & Registration
* **Modern Discovery Homepage**: Search by keyword, browse by category (Sports, Hackathons, Cultural, Workshops, Business, Design, Science).
* **Instant Digital Pass Issuance**: Every confirmed registration receives a unique cryptographically bound QR entry token.
* **Student Dashboard**: Live dashboard tracking registered events, digital QR passes, upcoming events, and category recommendations.

### 2. Complete Authentication Module
* **Separate Portals**: Dedicated authentication flows for **Students** and **Organisers**.
* **6 Auth Views**: Student Login/Signup/Forgot Password & Organiser Login/Signup/Forgot Password.
* **Role-Based Routing**: Organisers automatically land on `/organiser/dashboard`, students on `/student/dashboard`.

### 3. Organiser Studio & Business Dashboard
* **Data Isolation**: Organisers strictly see only their own hosted events, registrations, and metrics.
* **Banner Customization Liberty**:
  * **Device Upload**: Drag & drop or browse any local image file (PNG, JPG, WEBP).
  * **Curated Themes**: Clickable presets for Athletics, Basketball, Football, Hackathons, Fests, and Business.
  * **Smart Image Links**: Auto-extracts direct image links from Bing or Google Image searches.
  * **Edit Existing Banners**: Change banners on existing events at any time with live previews.
* **Live QR Ticket Scanner & Gate Validator**:
  * **📷 Camera Scanner**: Webcam/mobile camera scanning with an animated laser reticle.
  * **📁 Screenshot/Image Scanner**: Decode and verify passes from ticket images or screenshots.
  * **⚡ Auto-Admit Mode**: One-scan entry with instant check-in confirmation and sound feedback.
  * **Anti-Fraud Duplicate Prevention**: Blocks duplicate admissions in real time (HTTP 409).
  * **CSV Exports**: One-click download of registrations and attendee admission rosters.

---

## 🛠️ Tech Stack

* **Frontend**: HTML5, CSS3, Tailwind CSS (CDN), Vanilla JavaScript (ES6+)
* **Backend**: Node.js (`http`, `fs`, `crypto`, `path`)
* **Libraries**: `qrcode` (SVG generator), `html5-qrcode` (camera QR scanner engine)
* **Database**: Lightweight JSON persistence (`data/users.json`, `data/events.json`, `data/registrations.json`)

---

## 🏃 Getting Started Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)

### Installation & Run

1. Clone or download the repository:
   ```bash
   git clone https://github.com/<your-username>/eventify.git
   cd eventify
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node server.js
   ```

4. Open in browser:
   * **Homepage**: `http://localhost:3000/`
   * **Organiser Studio**: `http://localhost:3000/organiser/dashboard`
   * **Student Dashboard**: `http://localhost:3000/student/dashboard`

---

## 🔑 Demo Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Organiser** | Gautam (DSU) | `gautam453m@gmail.com` | `c8cbfcc...` *(or register a new organiser)* |
| **Organiser** | Sarah Chen (TechNova) | `organiser@campus.edu` | `Admin@12345` |
| **Student** | Alex Johnson | `student@campus.edu` | `Password123` |

---

## 📂 Project Structure

```
eventify/
├── index.html              # Discovery Homepage
├── app.js                  # Homepage interactions
├── auth.html               # 6-screen Authentication portal
├── auth.js                 # Authentication logic & session management
├── dashboard.html          # Student Dashboard
├── dashboard.js            # Student passes & QR token loader
├── organiser-dashboard.html# Organiser Studio & Scanner UI
├── organiser-dashboard.js  # Organiser controller, banner uploader, camera scanner
├── verify.html             # Gate security verification portal
├── server.js               # Node.js HTTP server & REST APIs
├── styles.css              # Custom styling & animations
├── package.json            # Project dependencies
├── .gitignore              # Ignored files (node_modules, logs)
├── assets/                 # Local libraries & images
│   └── html5-qrcode.min.js # Offline camera QR scanner engine
└── data/                   # Database files
    ├── events.json         # Events list
    ├── users.json          # Registered accounts & password hashes
    └── registrations.json  # Student registrations & pass tokens
```

---

## 📄 License
MIT License. Made for campus and student communities.
