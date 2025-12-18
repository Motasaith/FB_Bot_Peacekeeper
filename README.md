# Facebook Peacekeeper Dashboard 🛡️

A full-stack application for managing and moderating Facebook comments using AI, N8n, and Human-in-the-Loop approval.

## 🚀 Project Overview

The **FB Peacekeeper** system automates the moderation of Facebook comments.
1.  **N8n Workflow A** detects negative comments and saves them to **MongoDB**.
2.  **This Dashboard** (React + Express) allows a human to review the AI's suggested reply.
3.  **Human Approval** triggers **N8n Workflow B** (via Webhook) to post the actual reply on Facebook.

## 📂 Project Structure

This workspace contains two main components:

-   **`/fb-peacekeeper-dashboard`**: The Frontend. Built with **React**, **Vite**, **Tailwind CSS**.
-   **`/fb-peacekeeper-backend`**: The Backend. Built with **Node.js**, **Express**, **MongoDB (Mongoose)**.

---

## 🛠️ Setup & Installation

### 1. Backend Setup (API Server)

The backend connects the Dashboard to your MongoDB database.

1.  Navigate to the backend folder:
    ```bash
    cd fb-peacekeeper-backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Configuration**:
    *   Open `.env` in the backend folder.
    *   Add your **MongoDB Connection String** (`MONGO_URI`).
    *   Add your **N8n Webhook URL** (`N8N_WEBHOOK_URL`) for handling replies.
4.  Start the server:
    ```bash
    npm run dev
    ```
    *   Server runs on: `http://localhost:5000`

### 2. Frontend Setup (Dashboard UI)

The frontend provides the interface for approving/rejecting comments.

1.  Navigate to the dashboard folder:
    ```bash
    cd fb-peacekeeper-dashboard
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    *   Dashboard runs on: `http://localhost:5173`

---

## ✨ Features Implemented

*   **Pending Queue**: Fetches comments with `status: 'pending_approval'` from MongoDB.
*   **AI Reply Review**: Displays the User, Original Comment, and AI's Suggested Reply.
*   **Edit & Approve**: Allows editing the AI's reply before approving.
    *   On Approve: Updates DB status to `'posted'`, saves final text, and **triggers N8n Webhook**.
*   **Reject**: Updates DB status to `'rejected'`.
*   **Live Status**: Real-time feedback on API operations with toast notifications.
*   **Responsive UI**: Modern, clean interface using Tailwind CSS and Lucide icons.

## 🔌 API Endpoints (`localhost:5000`)

*   `GET /api/comments/pending`: List all pending comments.
*   `POST /api/comments/:id/approve`: Approve a comment (triggers webhook).
    *   Body: `{ text: "final reply text", url: "post_url" }`
*   `POST /api/comments/:id/reject`: Mark a comment as rejected.

## ⚠️ Troubleshooting

*   **Network Error / CORS**: Ensure the Backend Server is running on Port 5000.
*   **Comments Not Loading**: Check your `MONGO_URI` in `.env` and ensure your database has data in the `comments_queue` collection.
