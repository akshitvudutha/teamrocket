# 🤝 Team Rocket — Contribution Guide

Welcome to the team! If you are new to Git and GitHub, do not worry—this guide covers everything step by step.

---

## 🧭 Golden Rules for Team Harmony

1. **Never commit directly to `main`**: All work is done on feature branches.
2. **Never commit secrets**: No API keys, passwords, or personal tokens.
3. **Pull before you push**: Keep your local copy updated with `main`.
4. **Communicate in chat**: Let teammates know before modifying shared files.

---

## 🚀 Step 1: Getting the Code on Your Laptop

Open PowerShell or your terminal and run:

```bash
# Clone the repository
git clone https://github.com/akshitvudutha/team-rocket-dashboard.git

# Move into the project
cd team-rocket-dashboard

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

---

## 🌿 Step 2: Creating Your Personal Branch

Always create a new branch for your task named `feature/<your-name>-<short-description>`:

```bash
# Ensure you are on main and up to date
git checkout main
git pull origin main

# Create and switch to your new branch
git checkout -b feature/vikrant-frontend-filters
```

---

## 💻 Step 3: Making Changes & Checking Status

Work on your assigned files. Check what files you have changed at any time:

```bash
git status
```

---

## 💾 Step 4: Staging and Committing Your Work

Only add the files you intended to edit. Write a short, descriptive commit message:

```bash
# Stage your modified files
git add src/components/ServiceGrid.tsx

# Or stage all tracked changes (be careful not to stage node_modules or .env!)
git add -A

# Commit with a clear message
git commit -m "feat(ui): add category filters to service grid"
```

---

## ⬆️ Step 5: Pushing Your Branch to GitHub

Push your branch to GitHub:

```bash
git push -u origin feature/vikrant-frontend-filters
```

---

## 🔀 Step 6: Creating a Pull Request (PR)

1. Open the repository on GitHub: `https://github.com/akshitvudutha/team-rocket-dashboard`
2. You will see a banner: **"feature/your-branch had recent pushes — Compare & pull request"**.
3. Click **"Compare & pull request"**.
4. Add a short summary of what you built.
5. Request a review from Akshit or another teammate.
6. Once approved and checks pass, merge into `main`!

---

## 🛡️ Step 7: How to Avoid Stepping on Teammate's Work

| Teammate | Primary Directory | Files to Avoid Touching Without Asking |
| :--- | :--- | :--- |
| **Vikrant** | `src/` | Avoid modifying `backend/src/` |
| **Akshit** | `backend/src/` | Core backend, normalizers, Ollama client |
| **Revanth** | `backend/src/adapters/` | Organizer API specifications |
| **Ritesh** | `backend/tests/` & test data | Synthetic incident test datasets |
| **Nanda** | `backend/src/analysis/` & docs | Dependency topologies & metric analysis |

If two people edit the same file at the same line, Git will trigger a **merge conflict**. If this happens:
1. Don't panic! Git simply marks the conflict with `<<<<<<< HEAD` and `>>>>>>>`.
2. Open the file, pick the correct lines, save, and commit.
3. Ask your teammate to look at it together with you.
