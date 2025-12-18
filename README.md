# FB Peacekeeper Bot 🛡️🤖

> **A Stealthy, Automated Facebook Comment Monitoring & Moderation System.**
> *Uses "Visual AI" Logic & DrissionPage for Undetectable Scraping.*

## 🌟 Overview

FB Peacekeeper is a full-stack automated system designed to help Facebook Page admins monitor comments without manual scrolling. It uses a **local browser automation engine** (DrissionPage) to log in and scrape comments stealthily, mimicking real human behavior to avoid detection.

The system consists of three parts:
1.  **Dashboard (Frontend):** A modern React (Vite) UI for managing accounts and viewing results.
2.  **Server (Backend):** A Node.js/Express API that orchestrates the automation.
3.  **Watcher Engine (Core):** A Python script (`fb_watcher.py`) that controls the browser to fetch comments using advanced DOM parsing.

---

## ✨ Features

-   **🕵️ Stealth Mode Scraping:** Uses `DrissionPage` to bypass modern anti-bot detections.
-   **🧠 Smart Structural Filtering:** Rejects junk text (like "307 16" stats or "Most Relevant" prompts) by enforcing strict "Human Comment" structure rules (e.g., must have "Like" + "Reply").
-   **🧹 Artifact Scrubbing:** Automatically cleans footer artifacts (like "1h Like") from comment text.
-   **💾 Persistent Results:** Scanned comments are saved locally, so they survive page refreshes.
-   **⚡ Live Browser Interaction:** Opens a real Chrome window for login and scraping, ensuring cookies and sessions are valid.

---

## 🛠️ Architecture

| Component | Tech Stack | Description |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS | User Interface for controls and Review. |
| **Backend** | Node.js, Express | API layer to trigger Python scripts. |
| **Scraper** | Python, DrissionPage | The "Hands" that browse Facebook. |

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

### 3. Frontend Setup
```bash
cd fb-peacekeeper-dashboard
npm install
```

---

## 🏃‍♂️ Usage

### 1. Start the Backend Server
Open a terminal in `fb-peacekeeper-backend`:
```bash
node server.js
```
*Server runs on `http://localhost:5000`*

### 2. Start the Dashboard
Open another terminal in `fb-peacekeeper-dashboard`:
```bash
npm run dev
```
*UI opens at `http://localhost:5173`*

### 3. Connect an Account
1.  Go to the **Safe Watcher** tab in the Dashboard.
2.  Click **"Connect New Account"**.
3.  Enter a name (e.g., "MyPersonalProfile").
4.  A browser window will open. **Log in to Facebook manually.**
5.  Wait for the window to close automatically. Your session is now saved!

### 4. Scan a Page
1.  Select your connected account.
2.  Enter the **Page URL** (e.g., `https://www.facebook.com/Nike`) to monitor the latest post, OR a specific **Post URL**.
3.  Click **"Start Watcher Scan"**.
4.  The bot will navigate to the page, find the latest post, and scrape the comments.
5.  Watch the comments appear in the Dashboard!

---

## ⚠️ Disclaimer
This tool is for educational and administrative purposes only. Automating Facebook actions may violate their Terms of Service. Use responsibly and at your own risk. The "Stealth Mode" attempts to be safe, but no automation is 100% risk-free.
