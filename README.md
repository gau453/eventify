# Eventify – Campus Event Discovery & Management Platform

<p align="center">
  <a href="https://github.com/gau453/eventify">
    <strong>View Project on GitHub</strong>
  </a>
</p>

Eventify is a modern, responsive campus event discovery and management platform designed to connect students and event organisers through a unified digital experience.

Students can discover campus events, register for activities and access digital QR-based tickets, while organisers can create and manage events, monitor registrations, verify tickets and track attendance through a dedicated dashboard.

The platform provides separate student and organiser experiences, supported by role-based authentication and a shared event management system.

**GitHub Repository:** https://github.com/gau453/eventify

---

## 🚀 Key Features

### 1. Student Event Discovery & Registration

- **Interactive Discovery Homepage:** Explore campus events through a modern interface.
- **Event Search:** Find events using keywords.
- **Category-Based Browsing:** Discover events across Sports, Hackathons, Cultural, Workshops, Business, Design and Science.
- **Event Registration:** Register for available events.
- **Digital Ticket Generation:** Receive a unique digital ticket after successful registration.
- **QR-Based Entry Passes:** Access QR-enabled tickets for event entry.

### 2. Student Dashboard

A dedicated workspace for managing event participation.

- View registered events.
- Track upcoming events.
- Access digital event tickets.
- View registration information.
- Manage saved events.
- Discover recommended events.
- Manage personal profile information.

### 3. Authentication & Role-Based Access

A complete authentication system designed for students and organisers.

**Six Authentication Screens:**
- Student Login
- Student Signup
- Student Forgot Password
- Organiser Login
- Organiser Signup
- Organiser Forgot Password

**Role-Based Navigation:**
- Students are directed to the Student Dashboard.
- Organisers are directed to the Organiser Dashboard.

### 4. Organiser Studio & Event Management

A dedicated workspace for creating and managing events.

**Event Management**
- Create new events.
- Edit existing events.
- Publish events.
- Manage event information.
- Monitor registrations.
- View event details.

**Custom Event Banners**
- Upload images from a local device.
- Drag-and-drop image selection.
- Choose from curated event themes.
- Add custom image links.
- Preview event banners.
- Update existing event banners.

**Organiser Dashboard**
- Overview of hosted events.
- Registration statistics.
- Event management.
- Attendee information.
- Ticket management.
- Attendance monitoring.

### 5. Digital Ticket Generation & QR Verification

A digital ticketing workflow connecting student registrations with organiser attendance management.

**Student Ticketing**
- Unique ticket generation after successful registration.
- QR-based digital entry passes.
- Registration-linked ticket information.
- Access to tickets through the Student Dashboard.

**Organiser QR Scanner**
- Camera-based QR scanning.
- Desktop and mobile camera support.
- Image and screenshot-based QR scanning.
- Ticket validation.
- Registration verification.
- Duplicate check-in prevention.
- Attendance confirmation.

**Attendance Management**
- View registered participants.
- Monitor attendee check-ins.
- Track attendance status.
- Export registration records.
- Export attendee information through CSV files.

### 6. Event Analytics & Reporting

Organisers can monitor event performance through the management dashboard.

- Track event registrations.
- Monitor attendance.
- View participant information.
- Review event statistics.
- Export event-related reports.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Styling | Tailwind CSS, Custom CSS |
| Backend | Node.js |
| Server | Node.js HTTP Module |
| Database | JSON-based File Persistence |
| QR Generation | qrcode |
| QR Scanning | html5-qrcode |
| Security Utilities | Node.js crypto Module |

---

## 🔄 Application Workflow

Eventify connects students and organisers through a shared event management workflow.

**Student Workflow**

1. Visit the Eventify homepage.
2. Explore available events.
3. View event details.
4. Register for an event.
5. Receive a digital QR ticket.
6. Access the ticket through the Student Dashboard.
7. Present the ticket for verification at the event.

**Organiser Workflow**

1. Log into the Organiser Dashboard.
2. Create and publish an event.
3. Manage event information and banners.
4. Monitor student registrations.
5. Access attendee information.
6. Scan student QR tickets.
7. Verify tickets and record attendance.
8. Review event statistics and export reports.

---

## 📂 Project Structure

```text
eventify/
│
├── index.html
├── app.js
│
├── auth.html
├── auth.js
│
├── dashboard.html
├── dashboard.js
│
├── organiser-dashboard.html
├── organiser-dashboard.js
│
├── verify.html
│
├── server.js
├── styles.css
├── package.json
├── .gitignore
│
├── assets/
│   └── html5-qrcode.min.js
│
└── data/
    ├── events.json
    ├── users.json
    └── registrations.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/gau453/eventify.git
```

### 2. Navigate to the Project

```bash
cd eventify
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
node server.js
```

### 5. Access the Application

| Section | Local URL |
|---|---|
| Homepage | http://localhost:3000/ |
| Authentication | http://localhost:3000/auth |
| Student Dashboard | http://localhost:3000/student/dashboard |
| Organiser Dashboard | http://localhost:3000/organiser/dashboard |

Use registered accounts to access the respective dashboards.

---

## 🔐 Security & Access Control

Eventify incorporates role-based access and ticket verification functionality.

- Separate student and organiser access.
- Organiser-specific event management.
- Registration-linked digital tickets.
- Ticket verification.
- Duplicate attendance prevention.
- Server-side validation of ticket operations.

---

## 🚧 Future Improvements

Potential areas for further development:

- Migration to PostgreSQL or MySQL.
- Cloud-based image and banner storage.
- Email notifications and registration confirmations.
- Advanced event analytics.
- Improved organiser collaboration.
- Enhanced account recovery.
- Production deployment infrastructure.

---

**Built for campus communities, student engagement and better event management.**

### Eventify – Discover. Register. Experience.

**Project Repository:** https://github.com/gau453/eventify
