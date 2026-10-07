# 🚀 Deploy `apps/server` to Azure App Service

> **Stack**: Express.js monorepo (`apps/server`) → Azure App Service (Linux) → GitHub Actions CI/CD

---

## ✅ Prerequisites Checklist

- [x] Azure App Service created (`jptl-api`, Southeast Asia, Node 24 LTS)
- [x] GitHub repo pushed with `apps/server` code on branch `kpi`
- [x] Workflow file at `.github/workflows/azure-deploy.yml`

---

## STEP 1 — Enable Basic Auth on Azure

> Without this, the publish profile download is disabled.

1. Go to **Azure Portal** → `jptl-api` → **Settings** → **Configuration**
2. Click the **"General settings"** tab
3. Check **both** boxes:
   - ☑ **SCM Basic Auth Publishing Credentials**
   - ☑ **FTP Basic Auth Publishing Credentials**
4. Click **Apply** → **Confirm**

---

## STEP 2 — Set the Startup Command

1. Still in **Configuration** → click **"Stack settings"** tab
2. Find **Startup Command** field
3. Enter: `node server.js`
4. Click **Apply**

> **Why `node server.js`?** Our workflow zips only the contents of `apps/server`,
> so `server.js` lands at the root of the deployed folder on Azure.

---

## STEP 3 — Download Publish Profile

1. Go to `jptl-api` → **Overview**
2. Click **"Download publish profile"** in the top action bar
3. A `.PublishSettings` file downloads — **open it with any text editor**
4. Copy the **entire XML content** (Ctrl+A → Ctrl+C)

---

## STEP 4 — Add Publish Profile as GitHub Secret

1. Go to: `github.com/gamothalaman090-jpg/JPTL`
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Fill in:
   - **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value**: paste the full XML from Step 3
5. Click **Add secret**

---

## STEP 5 — Add Environment Variables to Azure

1. Go to `jptl-api` → **Settings** → **Environment variables**
2. Click **"Advanced edit"**
3. Paste your `.env` values as JSON (see format below)
4. Click **OK** → **Apply**

### JSON Format for Advanced Edit
```json
[
  { "name": "PORT",                  "value": "8000",        "slotSetting": false },
  { "name": "NODE_ENV",              "value": "production",  "slotSetting": false },
  { "name": "ENABLE_CLUSTER",        "value": "false",       "slotSetting": false },
  { "name": "CLIENT_URL",            "value": "https://jptl-client.vercel.app,https://jptl-superadmin.vercel.app", "slotSetting": false },
  { "name": "MONGO_URI",             "value": "<your-mongodb-atlas-uri>", "slotSetting": false },
  { "name": "JWT_SECRET",            "value": "<your-jwt-secret>",        "slotSetting": false },
  { "name": "JWT_EXPIRES_IN",        "value": "7d",          "slotSetting": false },
  { "name": "CLOUDINARY_CLOUD_NAME", "value": "<name>",      "slotSetting": false },
  { "name": "CLOUDINARY_API_KEY",    "value": "<key>",       "slotSetting": false },
  { "name": "CLOUDINARY_API_SECRET", "value": "<secret>",    "slotSetting": false },
  { "name": "SMTP_HOST",             "value": "smtp.gmail.com", "slotSetting": false },
  { "name": "SMTP_PORT",             "value": "465",         "slotSetting": false },
  { "name": "SMTP_SECURE",           "value": "true",        "slotSetting": false },
  { "name": "SMTP_USER",             "value": "<email>",     "slotSetting": false },
  { "name": "SMTP_PASS",             "value": "<app-password>", "slotSetting": false },
  { "name": "SMTP_FROM",             "value": "JPTL Property Management <email>", "slotSetting": false },
  { "name": "VAPID_PUBLIC_KEY",      "value": "<key>",       "slotSetting": false },
  { "name": "VAPID_PRIVATE_KEY",     "value": "<key>",       "slotSetting": false },
  { "name": "VAPID_SUBJECT",         "value": "mailto:<email>", "slotSetting": false }
]
```

> ⚠️ Azure ignores `.env` files — all vars must be set here manually.

---

## STEP 6 — Push the Workflow & Trigger Deployment

```bash
# From repo root
git add .github/workflows/azure-deploy.yml
git commit -m "ci: deploy apps/server to Azure via publish profile"
git push origin kpi
```

Then trigger manually:
1. Go to GitHub → **Actions** tab
2. Find **"Build and deploy Node.js app to Azure Web App - jptl-api"**
3. Click **"Run workflow"** → select branch `kpi` → **Run workflow**

---

## STEP 7 — Verify Deployment

Visit your Azure URL:
```
https://jptl-api-dxh0eqc9e4f8ftgk.southeastasia-01.azurewebsites.net/api/health
```

Expected response:
```json
{ "status": "ok" }
```

If it fails, check logs:
- **Azure Portal** → `jptl-api` → **Monitoring** → **Log stream**
- **GitHub** → **Actions** tab → click the failed workflow run

---

## STEP 8 — Update Vercel (Frontend)

Once the Azure backend is live, update your Vercel environment variables:

1. Go to **Vercel** → your client project → **Settings** → **Environment Variables**
2. Update or add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://jptl-api-dxh0eqc9e4f8ftgk.southeastasia-01.azurewebsites.net`
3. **Redeploy** the client on Vercel

---

## 🔁 How Auto-Deploy Works After Setup

Any `git push` to `kpi` branch that touches `apps/server/**` will:
1. Install dependencies (`npm install --omit=dev`)
2. Zip `apps/server` (excluding `.env` files)
3. Upload & deploy to `jptl-api` on Azure automatically

---

## 🛟 Troubleshooting

| Problem | Fix |
|---|---|
| `Application Error` / 503 on Azure URL | Check **Log stream** for startup errors |
| `Cannot find package 'dotenv'` | Ensure `dotenv` is in `dependencies` (not `devDependencies`) in `package.json` |
| `Cannot connect to MongoDB` | Whitelist Azure outbound IPs in MongoDB Atlas Network Access |
| Workflow fails at deploy step | Verify `AZURE_WEBAPP_PUBLISH_PROFILE` secret is correct |
| `node server.js` not found | Check startup command is set in **Stack settings** tab |
| Workflow not visible in GitHub Actions | Push workflow file to the default (`prod`) branch |
