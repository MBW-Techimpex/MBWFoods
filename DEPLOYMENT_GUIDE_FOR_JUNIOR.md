# STEP-BY-STEP DEPLOYMENT GUIDE (SIMPLE)

Follow these 5 steps to take the website live on Hostinger.

### STEP 1: Build the website locally
- Open your terminal in the project folder.
- Type `npm run build` and wait for it to finish.
- This creates the `dist` folder which contains the actual website.

### STEP 2: Create the Zip file
Select these 4 items in your folder:
1. `dist` folder
2. `backend` folder
3. `package.json`
4. `package-lock.json`
- Right-click and **Zip** them together.

### STEP 3: Upload to Hostinger
- Go to Hostinger -> Node.js Web App -> **Deployments**.
- Click **Settings and redeploy**.
- Click **Upload** and pick your Zip file.

### STEP 4: Check these Settings
Make sure these boxes are correct:
- **Node version:** 22.x
- **Build command:** `npm run build`
- **Entry file:** `backend/index.js`

### STEP 5: Redeploy
- Click **Save and redeploy**.
- Wait for the Green light.
- Done!

---
**Website URL:** https://deepskyblue-otter-203407.hostingersite.com/
