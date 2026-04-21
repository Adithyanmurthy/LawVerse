# 🚀 Quick Cloudflare D1 Setup

You already have Wrangler installed and databases created! Let's complete the setup.

## Step 1: Get Your Account ID

```powershell
wrangler whoami
```

Look for the line that says `Account ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

## Step 2: Choose Your Database

From your list, you have these databases:
- `cBoylETjXFEoOn0B_qivEtaNoiuyTyg3yaQYqwXo` (already in .env)
- `965bd2cb-8199-45c9-929b-af5c4c89cf38` (aix-sync-db)
- `1b88f5e0-0c51-4cc6-97f1-81430712ecf2` (keliva-db)

**Recommended**: Use the first one (already configured) or create a new one:

```powershell
wrangler d1 create contract-copilot-db
```

## Step 3: Initialize Database Schema

Run these commands to create the tables:

```powershell
# Replace DATABASE_ID with your actual database ID
$DB_ID = "cBoylETjXFEoOn0B_qivEtaNoiuyTyg3yaQYqwXo"

# Create users table
wrangler d1 execute $DB_ID --remote --command "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, hashed_password TEXT NOT NULL, plan TEXT DEFAULT 'free', stripe_customer_id TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"

# Create contracts table
wrangler d1 execute $DB_ID --remote --command "CREATE TABLE IF NOT EXISTS contracts (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL, filename TEXT NOT NULL, file_path TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id));"

# Create analyses table
wrangler d1 execute $DB_ID --remote --command "CREATE TABLE IF NOT EXISTS analyses (id INTEGER PRIMARY KEY AUTOINCREMENT, contract_id TEXT NOT NULL, status TEXT DEFAULT 'processing', risk_score INTEGER, risk_level TEXT, summary TEXT, issues TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (contract_id) REFERENCES contracts(id));"

# Create issue_feedback table
wrangler d1 execute $DB_ID --remote --command "CREATE TABLE IF NOT EXISTS issue_feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, analysis_id INTEGER NOT NULL, issue_index INTEGER NOT NULL, feedback TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (analysis_id) REFERENCES analyses(id));"

# Verify tables were created
wrangler d1 execute $DB_ID --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

## Step 4: Create API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use **"Edit Cloudflare Workers"** template
4. Click **"Continue to summary"** → **"Create Token"**
5. **COPY THE TOKEN** (shown only once!)

## Step 5: Update .env File

Open `backend/.env` and update:

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id_from_step_1
CLOUDFLARE_D1_DATABASE_ID=cBoylETjXFEoOn0B_qivEtaNoiuyTyg3yaQYqwXo
CLOUDFLARE_D1_API_TOKEN=your_api_token_from_step_4
```

## Step 6: Test Connection

```powershell
cd backend
python test_d1_connection.py
```

You should see:
```
✅ Connection successful!
✅ Found 4 table(s)
✨ All tests passed!
```

## Step 7: Restart Backend

Stop the current backend (Ctrl+C) and restart:

```powershell
cd backend
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8001
```

## ✅ Done!

Your app is now using Cloudflare D1 database!

---

## 🎯 Alternative: Use the Automated Script

Or simply run:

```powershell
.\setup_cloudflare.ps1
```

This script will:
- Get your Account ID automatically
- Let you choose or create a database
- Initialize the schema
- Guide you through API token creation
- Update your .env file automatically

---

## 🆘 Troubleshooting

**Error: "wrangler: command not found"**
```powershell
npm install -g wrangler
wrangler login
```

**Error: "Not logged in"**
```powershell
wrangler login
```

**Error: "Database not found"**
- Check the Database ID is correct
- Verify it exists: `wrangler d1 list`

**Error: "Permission denied"**
- Recreate API token with D1 permissions
