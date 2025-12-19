# BizReply Bot 🚀🤖

> **Your 24/7 AI Sales & Support Assistant for Facebook.**
> *Automate replies, capture leads, and engage customers instantly.*

## 🌟 Overview

**BizReply Bot** is a powerful automation suite designed for businesses to maximize engagement on Facebook. Instead of manually replying to hundreds of comments, let BizReply handle it.

It uses **Visual AI Automation** (DrissionPage) to operate stealthily like a human social media manager, ensuring your page stays safe while you scale.

### Why BizReply?
-   **📈 Boost Sales:** Instantly detects leads asking for prices/details and replies with your offer.
-   **💬 24/7 Support:** Answers general queries immediately, keeping your response time low.
-   **🛡️ Spam Shield:** Automatically filters out trolls and spam comments.

---

## ✨ Key Features

-   **⚡ Auto-Pilot Workflow:** One-click automation: `Fetch` → `Analyze` → `Reply`.
-   **🧠 Smart AI Engine:** Powered by **Gemini 2.0**, it understands context (Urdu/English) and drafts human-like responses.
-   **🎨 Modern Dashboard:** A beautiful, easy-to-use control center to manage your page.
-   **💾 Local Data Ownership:** All your customer data and comments are stored securely on your own machine (MongoDB).
-   **🕵️ Undetectable:** Uses advanced browser emulation to avoid "Bot" detection.

---

## 🛠️ Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS | The Command Center UI. |
| **Backend** | Node.js, Express | API & Automation Orchestrator. |
| **Database** | MongoDB | Stores leads and conversation history. |
| **AI** | Google Gemini 2.0 (via OpenRouter) | The "Brain" behind the replies. |
| **Engine** | Python + DrissionPage | The "Hands" that browse Facebook. |

---

## 🚀 Quick Start

### Prerequisites
-   **Node.js** (v18+)
-   **Python** (v3.10+)
-   **Google Chrome**

### 1. Installation
```bash
git clone https://github.com/Motasaith/FB_Bot_Peacekeeper.git
cd FB_Bot_Peacekeeper
```

### 2. Setup Backend
```bash
cd fb-peacekeeper-backend
npm install
pip install DrissionPage playwright nest_asyncio
```
*Create a `.env` file with `OPENROUTER_API_KEY` and `MONGO_URI`.*

### 3. Setup Frontend
```bash
cd fb-peacekeeper-dashboard
npm install
```

### 4. Launch
**Terminal 1 (Backend):**
```bash
cd fb-peacekeeper-backend
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd fb-peacekeeper-dashboard
npm run dev
```

---

## 📖 How to Use

1.  **Connect Account:** use the profile icon on the Fetch page to log in securely.
2.  **Auto-Pilot:** Click **⚡ Run Auto-Pilot** on the Dashboard.
    -   Paste your Post URL.
    -   Sit back as it extracts comments, analyzes intent, and drafts replies.
3.  **Review & Post:** Go to the **Replies** page to approve the AI drafts and publish them.

---

## ⚠️ Disclaimer
**BizReply Bot** is an automation tool. While we use advanced stealth techniques to mimic human behavior, automating Facebook interactions is at your own risk. We recommend using reasonable delays (built-in) to keep your account safe.
