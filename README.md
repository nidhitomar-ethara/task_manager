# 🚀 Team Task Manager

A full-stack web application where users can create projects, assign tasks, and track progress with **role-based access control (Admin/Member)**.

## ✨ Features

- **Authentication** — Signup/Login with JWT
- **Project Management** — Create, edit, delete projects
- **Team Management** — Add/remove members with Admin/Member roles
- **Task Tracking** — Create, assign, and update task status (To Do → In Progress → Done)
- **Dashboard** — View task stats, overdue tasks, and progress overview
- **Role-Based Access** — Admins manage projects/tasks, Members update assigned tasks

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Database | MongoDB (Atlas) |
| Auth | JWT + bcrypt |
| Deployment | Railway |

## 📦 Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd team-task-manager

# Install all dependencies
npm run install-all

# Create server/.env file
cp server/.env.example server/.env
# Fill in your MongoDB URI and JWT secret

# Run in development
npm run dev
```

## 🔧 Environment Variables

Create a `server/.env` file:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/team-task-manager
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

## 📁 Project Structure

```
team-task-manager/
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── package.json     # Root scripts
└── README.md
```

## 🚀 Deployment Guide

Follow these steps to get your project live on **Railway**.

### 1. MongoDB Atlas Setup (Database)
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2.  Create a new **Project** and then a new **Cluster** (choose the Free 'M0' tier).
3.  In **Database Access**, create a user with a username and password.
4.  In **Network Access**, click "Add IP Address" and select **"Allow Access from Anywhere"** (0.0.0.0/0).
5.  Go to **Clusters** -> **Connect** -> **Connect your application**.
6.  Copy the **Connection String** (SRV). It looks like `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/team-task-manager`.

### 2. Prepare the Code
1.  Open `server/.env` and replace `MONGO_URI` with your connection string (replace `<password>` with your actual password).
2.  Ensure `NODE_ENV` is set to `production` for the final deployment.

### 3. Push to GitHub
1.  Create a new repository on [GitHub](https://github.com/new).
2.  In your local project folder:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

### 4. Deploy to Railway
1.  Login to [Railway.app](https://railway.app/).
2.  Click **"New Project"** -> **"Deploy from GitHub repo"**.
3.  Select your repository.
4.  Click **"Add Variables"** and add:
    *   `MONGO_URI`: (Your MongoDB string)
    *   `JWT_SECRET`: (A random long string)
    *   `NODE_ENV`: `production`
5.  Railway will automatically detect the root `package.json`, run `npm run build`, and then `npm start`.
6.  Once deployed, Railway will provide a **Public URL**. Update the `Live URL` in this README!

## 📄 License

MIT
