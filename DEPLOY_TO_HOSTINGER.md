# 🚀 OFFICIAL DEPLOYMENT GUIDE: TECHBRAND.IN

Follow these steps every time you want to update your website.

---

### STEP 1: Build the Website
Open your terminal in the project folder and run:
```bash
npm run build
```

---

### STEP 2: Create the Deployment Zip
Copy and paste this **ENTIRE** command into your terminal and press Enter. 
It will create a file called **`deploy.zip`** in your folder.

```powershell
powershell -Command "if (Test-Path deploy.zip) { Remove-Item deploy.zip }; if (Test-Path backend/dist) { Remove-Item -Path backend/dist -Recurse -Force }; Copy-Item -Path dist -Destination backend/dist -Recurse; Get-ChildItem -Path backend/* -Exclude node_modules | Compress-Archive -DestinationPath deploy.zip -Force"
```

---

### STEP 3: Upload to Hostinger
1. Log in to **Hostinger hPanel**.
2. Go to **Websites** -> **techbrand.in** -> **Node.js Web App**.
3. Click on **Deployments** on the left menu.
4. Click **Settings and redeploy**.
5. **Upload** the new `deploy.zip` file.

---

### STEP 4: Confirm Settings
Make sure these boxes look exactly like this:
- **Root directory:** `/` (or leave it blank)
- **Entry file:** `index.cjs`
- **Node version:** 22.x
- **Package manager:** `npm`

---

### STEP 5: Finalize
1. Click **Save and redeploy**.
2. Once finished, go to your Node.js Dashboard and click **Restart**.
3. Your updates are now live at **https://techbrand.in**!

---

### ⚠️ IMPORTANT TIPS:
- **Never upload `node_modules`:** My Zip command automatically excludes it to keep the upload fast and prevent errors.
- **Environment Variables:** If you ever change your database password, you must update it in the **Environment Variables** tab in Hostinger.
