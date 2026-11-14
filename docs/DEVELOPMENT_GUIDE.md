# 💻 Beginner's Guide: Setting Up on a Windows Laptop

Welcome to Team Rocket! Follow these simple, numbered steps to get the entire project running on your Windows laptop.

---

## Step 1: Install the Required Software

If you don't already have them, download and install these three tools:

1. **Node.js (v20 or v24)**:
   - Download the **LTS (Long Term Support)** installer from [https://nodejs.org/](https://nodejs.org/).
   - Run the installer and click **Next** through all default options.
2. **Git for Windows**:
   - Download from [https://git-scm.com/download/win](https://git-scm.com/download/win).
   - Install with default recommended settings.
3. **Ollama**:
   - Download from [https://ollama.com/download/windows](https://ollama.com/download/windows).
   - Run the installer. Once installed, Ollama will automatically start in your Windows taskbar.

---

## Step 2: Download the AI Model in Ollama

Open **PowerShell** (Press `Win + X` and select **Terminal** or **PowerShell**) and type:

```powershell
ollama pull qwen2.5:7b
```

Wait for the download to finish. You can verify it is installed by running:

```powershell
ollama list
```
You should see `qwen2.5:7b` listed.

---

## Step 3: Clone the Team Repository

In PowerShell, choose a folder where you want to keep projects (for example, `C:\Projects`):

```powershell
# Create and move to your project folder
mkdir C:\Projects -ErrorAction SilentlyContinue
cd C:\Projects

# Clone the repository
git clone https://github.com/akshitvudutha/team-rocket-dashboard.git

# Enter the project directory
cd team-rocket-dashboard
```

---

## Step 4: Install Dependencies

We have two parts to install: the **Frontend** and the **Backend**.

```powershell
# 1. Install frontend packages (in root folder)
npm install

# 2. Install backend packages
cd backend
npm install
cd ..
```

---

## Step 5: Start the Project!

You will need **two separate PowerShell windows** running side-by-side:

### Window 1: Start the Backend Service
```powershell
cd C:\Projects\team-rocket-dashboard\backend
npm run dev
```
You should see:
```
[Team Rocket Backend] Operational on http://localhost:5000
[Team Rocket Backend] Ollama connected (v0.40.16)
[Team Rocket Backend] Active fallback/selected model: qwen2.5:7b
```

### Window 2: Start the Frontend Dashboard
```powershell
cd C:\Projects\team-rocket-dashboard
npm run dev
```
You should see:
```
  VITE v8.3.8  ready in 670 ms

  ➜  Local:   http://localhost:5173/
```

---

## Step 6: Open the Dashboard in Your Browser

Open Chrome, Edge, or Brave and navigate to:
👉 **`http://localhost:5173`**

You should see the dark-themed **Team Rocket AI Incident Commander** dashboard with all 12 services and active incidents!

---

## Step 7: Run the Automated Tests

To make sure everything is working properly on your computer:

```powershell
cd C:\Projects\team-rocket-dashboard\backend
npm test
```
All 18 tests should pass (`pass 18 | fail 0`).

---

## ❓ Frequently Asked Questions & Troubleshooting

- **Error: `Cannot find module`**: Run `npm install` inside both the root folder and `backend/`.
- **Error: `Ollama connection refused`**: Make sure Ollama is running in your taskbar. Open Start Menu and search for "Ollama".
- **Port 5000 or 5173 already in use**: Close any existing terminal tabs running the project.
