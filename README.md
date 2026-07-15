# The Popular Company (TPC) – Agency Website & Automated Production Platform

Welcome to the official repository for **The Popular Company (TPC)**. 

This project is a dual-purpose application:
1. **A Premium Public-Facing Website:** Designed to attract high-end clients with cinema-grade aesthetics, smooth animations, and a rich portfolio.
2. **A Custom Automated Production Pipeline:** A powerful internal CMS and Operations Dashboard that acts as the "operating system" for the agency, fully automating the video production lifecycle from script to final edit.

---

## 🚀 The Tech Stack

- **Framework:** [Next.js 14 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Rich Text Editing:** [React Quill](https://github.com/zenoamaro/react-quill)
- **Backend / Database:** Headless Google Sheets via **Google Apps Script (GAS)** REST API
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🌟 Key Features (Public Website)

* **Premium UI/UX:** A bespoke dark-theme design featuring glassmorphism, precise typography, and custom loading animations (the TPC "Heartbeat").
* **Dynamic Portfolio:** Filterable video galleries showcasing high-end reels and ad campaigns.
* **Integrated Blog:** A dynamic `/blog/[slug]` routing system that natively renders rich HTML articles directly from the backend.
* **SEO Optimized:** Semantic HTML, fast Core Web Vitals, and expanding FAQ sections designed for both traditional Google search and Generative Engine Optimization (GEO).
* **Fully Responsive:** Flawless layout scaling from mobile screens to ultra-wide desktop monitors.

---

## ⚙️ Key Features (Internal Production Platform)

Instead of relying on clunky third-party tools (like Asana or Monday.com), TPC runs on a bespoke internal platform located at `/admin` and `/employee`.

### 1. The Headless "Sheets" Database
The entire platform reads and writes directly to a Google Sheet via a custom Apps Script API. This provides the agency with a 100% free, instantly accessible, and infinitely backed-up database that non-technical staff can understand.

### 2. The Automated State Machine
Workflows are fully automated. The system moves tasks through a strict production pipeline: `Scripting` ➔ `Shooting` ➔ `Editing` ➔ `Completed`.
* **Auto-Assignment:** When a task enters a new stage, the system dynamically scans the employee roster and assigns the task directly to the specific Content Writers, Videographers, or Editors required.
* **The Review Cycle:** Employees submit work on their dashboards, triggering a "Reviewing" state. Admins can then securely *Approve & Advance* the task to the next department, or *Reject* it (sending it back with a "Fixes Required" tag).

### 3. Role-Based Dashboards
* **Admin Command Center (`/admin`):** Global metrics, live pipeline tracking, bulk-action editing, and the ability to manage the Employee Roster and System Settings.
* **Employee Portal (`/employee`):** A noise-free, targeted dashboard. Employees only see tasks actively assigned to them, automatically sorted by urgency.
* **Website CMS (`/cms`):** A beautiful WYSIWYG editor (powered by React Quill) that allows Admins and Content Writers to write and format blog posts that instantly push to the live frontend.

---

## 🛠️ Local Development Setup

To run this project locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/tpc-website.git
   cd tpc-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add the Google Apps Script Web App URL:
   ```env
   NEXT_PUBLIC_GOOGLE_SCRIPT_URL="YOUR_GAS_MACRO_URL_HERE"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the App:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the public site.
   Navigate to `/admin` to access the Admin Console.

---

## 👨‍💻 Architecture & Code Flow
- `/app/(public)/`: Contains all public-facing routes (Home, About, Services, Blog).
- `/app/admin/`: Contains the Admin Command Center, Live Workbook, Roster Management, and Settings.
- `/app/employee/`: Contains the targeted Employee Dashboard.
- `/app/cms/`: Contains the Blog Content Management System.
- `/app/components/`: Shared UI elements (Navigation, Footers, Modals, Loaders).
- `Google Apps Script`: The external `Code.gs` script handles `doGet` and `doPost` requests, acting as the secure REST API layer between the Next.js frontend and the Google Sheets database.

---
*Designed and engineered specifically for The Popular Company (TPC) to dominate the high-end media market.*
