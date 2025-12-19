# FB Peacekeeper Bot 🛡️🤖

> **A Stealthy, Automated Facebook Comment Monitoring & Moderation System.**
> *Now featuring Multi-Page Workflow, Auto-Pilot Mode, and Advanced AI Analysis.*

## 🌟 Overview

FB Peacekeeper is a full-stack automated system designed to help Facebook Page admins engage with customers and filter spam without manual effort. It uses a **local browser automation engine** (DrissionPage) to log in and scrape comments stealthily, mimicking real human behavior.

The system has been upgraded to a **Multi-Page Application (MPA)** architecture for better scalability and user experience.

### Key Components:
1.  **Dashboard (Frontend):** A modern React (Vite) UI with Dark/Light mode, "Auto-Pilot" orchestration, and dedicated workflow pages.
2.  **Server (Backend):** A Node.js/Express API that manages the scraper and AI services.
3.  **Watcher Engine (Core):** A Python script (`fb_watcher.py`) that controls the browser to fetch comments using advanced DOM parsing.

---

## ✨ Features

-   **⚡ Auto-Pilot Mode:** Run the entire Fetch → Analyze → Review workflow with a single click.
-   **🕵️ Stealth Mode Scraping:** Uses `DrissionPage` to bypass modern anti-bot detections.
-   **🧠 AI Sentiment Analysis:** Classifies comments (Lead, Support, Question, Spam) and drafts intelligent replies using **Gemini 2.0 Flash Lite**.
-   **🎨 Modern UI:** Glassmorphism design, fully responsive Dark/Light themes, and animated interactions.
-   **💾 Persistent Results:** Scanned comments are saved locally (MongoDB), surviving page refreshes.
-   **🧹 Artifact Scrubbing:** Automatically cleans footer artifacts (like "1h Like") from comment text.

---

## 🛠️ Architecture

| Component | Tech Stack | Description |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS | Multi-page UI with specialized views for each step. |
| **Backend** | Node.js, Express, MongoDB | API layer to trigger Python scripts and manage data. |
| **Scraper** | Python, DrissionPage | The "Hands" that browse Facebook. |
| **AI Engine** | OpenAI SDK (OpenRouter) | Powered by Google Gemini 2.0 Flash Lite. |

---

## 🚀 Installation & Setup

### Prerequisites
-   **Node.js** (v18+)
-   **Python** (v3.10+)
-   **Google Chrome** installed on the machine.

### 1. Clone the Repository
```bash
git clone https://github.com/Motasaith/FB_Bot_Peacekeeper.git
cd FB_Bot_Peacekeeper
```

### 2. Backend Setup
```bash
cd fb-peacekeeper-backend
npm install
# Install Python dependencies
pip install DrissionPage playwright nest_asyncio
```
*Create a `.env` file in backend with `OPENROUTER_API_KEY` and `MONGO_URI`.*

### 3. Frontend Setup
```bash
cd fb-peacekeeper-dashboard
npm install
```

---

## 🏃‍♂️ Usage

### 1. Start the System
Backend:
```bash
cd fb-peacekeeper-backend
node server.js
```
Frontend:
```bash
cd fb-peacekeeper-dashboard
npm run dev
```

### 2. Connect Account
1.  Navigate to **Fetch Comments** page.
2.  Click the user icon to Connect a new account.
3.  Log in manually in the browser window that appears.

### 3. Run the Workflow
You can run the workflow manually step-by-step or use Auto-Pilot.

**Option A: Auto-Pilot (Recommended)**
1.  On the Dashboard, click **"⚡ Run Auto-Pilot"**.
2.  Enter the URL.
3.  Watch the logs as it fetches, analyzes, and prepares results automatically.

**Option B: Manual Flow**
1.  **Fetch Page:** Enter URL and scrape comments.
2.  **Sentiment Page:** Run AI analysis on fetched comments.
3.  **Replies Page:** Review AI drafts, edit if needed, and post replies.

---

## ⚠️ Disclaimer
This tool is for educational and administrative purposes only. Automating Facebook actions may violate their Terms of Service. Use responsibly and at your own risk. The "Stealth Mode" attempts to be safe, but no automation is 100% risk-free.
