# The Popular Company (TPC) – Agency Website & Custom Notion-Style Production Platform

Welcome to the official repository for **The Popular Company (TPC)**. 

This project is a dual-purpose web application designed to serve both as a high-end public portfolio and a robust internal ERP/Operations platform. It was built to solve a critical business problem: replacing expensive, fragmented SaaS tools (like Asana, Monday.com, and Notion) with a unified, custom-built internal operating system powered by a Google Sheets backend.

---

## 🚀 The Tech Stack

- **Frontend Framework:** [Next.js 14 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons & UI:** [Lucide React](https://lucide.dev/)
- **Backend / Database:** Headless Google Sheets via **Google Apps Script (GAS)** REST API
- **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`) with Debounced Auto-Save
- **Drag & Drop:** Native HTML5 Drag and Drop API

---

## 🌟 Key Features (Public Website)

* **Premium UI/UX:** A bespoke dark-theme design featuring glassmorphism, cinematic typography, and custom global cursor tracking.
* **Performance Optimized:** Advanced component architecture to prevent unnecessary re-renders, ensuring a butter-smooth 60fps experience even with heavy Framer Motion animations.
* **Dynamic Portfolio:** Filterable video galleries showcasing high-end reels and ad campaigns.
* **Integrated Blog:** A dynamic `/blog/[slug]` routing system that natively renders rich HTML articles directly from the backend.

---

## 💻 The Notion-Style Admin Console (Core Project Engineering)

The crown jewel of this project is the **Custom Admin Console & Workbook (`/admin/workbook`)**. 
Building a complex, interactive table interface that syncs reliably with an external Google Sheet API presented significant engineering challenges. We solved these by engineering a fully custom, Notion-inspired UI with Optimistic Updates and a robust Queueing Architecture.

### 1. Debounced Auto-Save Engine
Manual "Save" buttons are obsolete. The platform features an intelligent auto-save engine. When a user edits a task, the system debounces the input and accumulates changes into a `Map` of unsaved updates. After the user stops typing, it automatically synchronizes the localized changes with the backend, providing visual feedback via a real-time status indicator ("Saving..." ➔ "Saved").

### 2. The Sequential API Queuing System (Concurrency Management)
**The Problem:** Google Sheets APIs are notoriously restrictive. If multiple API calls (e.g., adding 10 rows quickly) are dispatched concurrently, Google Sheets will rate-limit the requests or throw concurrency locks (Error 429), resulting in data loss.
**The Solution:** We engineered a custom sequential Task Queue in the Next.js API route (`/api/admin/data/route.ts`). All incoming write requests (Updates, Inserts, Deletions) are intercepted by a global queue mechanism. The queue executes each asynchronous Promise sequentially, awaiting full resolution before processing the next item. This completely eliminates Google Sheets concurrency locks and guarantees 100% data integrity.

### 3. Optimistic UI & "Ghost Rows"
To provide a seamless, instantaneous user experience, the frontend utilizes **Optimistic UI updates**.
* **Ghost Rows:** Instead of waiting 3-4 seconds for the server to acknowledge a new task creation, the user simply clicks the bottom of the table. A "Ghost Row" is instantly injected into the local React state, allowing the user to begin typing immediately. The backend synchronization happens silently in the background via the Queuing System.
* **Instant State Reflection:** Edits are reflected instantly in the local UI, abstracting network latency away from the user.

### 4. Side-Peek Slide-Out Architecture
Editing complex task descriptions within a small table cell is bad UX. Inspired by Notion, we built a **Side-Peek Slide-Out Modal**. Clicking a task slides a sleek panel out from the right side of the screen. This allows the user to edit rich details, assignees, and tags while maintaining full visual context of the overall workbook timeline.

### 5. Native HTML5 Drag-and-Drop Reordering
We implemented native HTML5 Drag and Drop logic to allow users to visually reorder tasks and priorities. The system tracks the `dragStart` and `dragOver` events, visually swaps the elements in the local React state, and then dispatches the batch reordering payload to the backend queue to persist the new indexing.

### 6. Interactive Slash (`/`) Commands
Within the side-peek modal, users can utilize Slash Commands. Typing `/` instantly brings up a context menu allowing users to rapidly update task statuses, shift deadlines, or assign team members without their hands leaving the keyboard.

---

## 📚 The Engineering Documentation Hub
For a complete breakdown of the system architecture, state-management logic, and queuing mechanisms, please refer to our deep-dive engineering manuals:

1. **[System Architecture & Database Routing](./docs/ARCHITECTURE.md)**: Explore the high-level Next.js to Google Apps Script pipeline.
2. **[State Management: Optimistic UI & Ghost Rows](./docs/STATE_MANAGEMENT.md)**: How we cheat network latency to provide an instantaneous user experience.
3. **[The Sequential Promise Queue](./docs/API_QUEUE.md)**: A deep dive into how we solved Google Sheets API Concurrency limits using a singleton Next.js API interceptor.
4. **[Workflow Manual: The Notion-Style UI](./docs/WORKFLOW_MANUAL.md)**: Detailed breakdown of the Side-Peek Modal, HTML5 Drag & Drop, and Slash commands.

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
*Developed as a comprehensive full-stack engineering project demonstrating advanced state management, API concurrency handling, and modern UI/UX design patterns.*
