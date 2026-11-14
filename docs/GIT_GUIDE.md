# 📖 Git & GitHub: The Beginner's Illustrated Guide

If you've never used Git before, this guide will give you a clear, visual mental model of how it works.

---

## 💡 What is the Difference Between Git and GitHub?

- **Git** is a tool that runs **locally on your computer**. It is like a super-smart video game save system that tracks every change you make to your code over time.
- **GitHub** is a **website on the internet** where the team stores the shared copy of the code so everyone can collaborate without emailing zip files.

---

## 🎮 The Mental Model: The 4 Zones of Git

Imagine working on a document:

```
[ Your Workspace ]   --->   [ The Staging Area ]   --->   [ Local Repository ]   --->   [ GitHub Cloud ]
(Working Directory)             (git add)                     (git commit)                 (git push)
```

1. **Working Directory**: The actual files you see and edit in your code editor.
2. **Staging Area (`git add`)**: The "box" where you place files you want to include in your next save checkpoint.
3. **Local Repository (`git commit`)**: The permanent checkpoint saved on your laptop's hard drive.
4. **Remote Repository (`git push`)**: The checkpoint uploaded to the GitHub cloud for your teammates to see.

---

## 🌳 What is a Branch?

Imagine writing a story with friends. If everyone writes in the exact same book at the exact same second, people will erase each other's sentences.

Instead, Git lets each person take a **photocopy** of the story (called a **Branch**).
- You write your new chapter on your branch.
- When you are done and happy, you show it to your team in a **Pull Request**.
- If everyone agrees, your chapter is merged cleanly into the **Main** book!

---

## 🛠️ The 6 Git Commands You Will Use 95% of the Time

### 1. `git status` — "What is happening right now?"
Run this whenever you are unsure:
```bash
git status
```
It tells you what files you edited, what branch you are on, and what is ready to save.

### 2. `git pull origin main` — "Get the latest work from my teammates"
Run this before starting work each day:
```bash
git checkout main
git pull origin main
```

### 3. `git checkout -b <name>` — "Create my own private workspace branch"
```bash
git checkout -b feature/nanda-metrics-chart
```

### 4. `git add <files>` — "Put these files in the save box"
```bash
# Add one specific file
git add src/components/ServiceGrid.tsx

# Or add all files you edited
git add -A
```

### 5. `git commit -m "<message>"` — "Seal the save box with a description"
```bash
git commit -m "feat: add cpu utilization progress bar to service card"
```

### 6. `git push -u origin <branch>` — "Send my save box to GitHub"
```bash
git push -u origin feature/nanda-metrics-chart
```

---

## 🚀 What is a Pull Request (PR)?

A **Pull Request** is simply saying to your teammates on GitHub:
> *"Hey team! I finished the feature on my branch `feature/nanda-metrics-chart`. Please review my code. If it looks good, let's merge it into the main project!"*

Your teammates can view the exact line-by-line diff, leave comments, and hit **Merge**.

---

## 🚨 How to Undo Common Mistakes

- **"I edited a file and I want to discard my changes back to how it was:"**
  ```bash
  git restore filename.txt
  ```
- **"I don't know what branch I am on:"**
  ```bash
  git branch
  ```
- **"I made changes on main by mistake before creating a branch:"**
  ```bash
  # Just create and switch to your branch now! Your uncommitted work moves with you:
  git checkout -b feature/my-feature
  ```
