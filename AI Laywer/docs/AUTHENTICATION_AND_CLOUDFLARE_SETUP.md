# Authentication & Cloudflare D1 Setup Guide

## ✅ What Has Been Implemented

### 1. Dynamic Authentication System

#### New Authentication Features:
- **Persistent Login**: Users stay logged in across page refreshes
- **Global Auth State**: Authentication state managed via React Context
- **Protected Routes**: Dashboard automatically redirects to login if not authenticated
- **Dynamic Navigation**: Header shows different options based on auth status
- **Centralized Auth Logic**: All auth functions in `frontend/lib/auth.ts`

#### Files Created/Updated:

**Frontend:**
- `frontend/lib/auth.ts` - Authentication utilities (getToken, setToken, removeToken, etc.)
- `frontend/components/AuthProvider.tsx` - React Context for global auth state
- `frontend/components/Header.tsx` - Dynamic header component
- `frontend/app/layout.tsx` - Updated to include AuthProvider
- `frontend/app/page.tsx` - Updated to use dynamic Header
- `frontend/app/login/page.tsx` - Updated to use new auth system
- `frontend/app/register/page.tsx` - Updated to use new auth system
- `frontend/app/dashboard/page.tsx` - Updated with auth protection

**Backend:**
- `backend/app/core/config.py` - Added Cloudflare D1 configuration
- `backend/app/db/cloudflare_d1.py` - Cloudflare D1 HTTP API client
- `backend/.env` - Updated with Cloudflare D1 placeholders
- `backend/setup_cloudflare_d1.md` - Complete setup guide

### 2. How Authentication Works Now

```
User Flow:
1. User visits any page → AuthProvider checks localStorage for token
2. If token exists → User is authenticated, sees Dashboard link
3. If no token → User sees Login/Register buttons
4. After login/register → Token saved, user redirected to dashboard
5. On logout → Token removed, redirected to login page
6. Protected routes (dashboard) → Auto-redirect to login if not authenticated
```

### 3. Navigation Behavior

**When NOT Logged In:**
- Header shows: Features | How It Works | Pricing | Login | Get Started

**When Logged In:**
- Header shows: Features | How It Works | Pricing | Dashboard | [email] | Logout

### 4. Cloudflare D1 Database Setup

## 📋 Steps to Complete Cloudflare D1 Setup

### Option 1: Using Cloudflare Dashboard (Easiest)

1. **Login to Cloudflare**
   - Go to: https://dash.cloudflare.com/
   - Login with your credentials

2. **Create D1 Database**
   - Click **Workers & Pages** in left sidebar
   - Click **D1**
   - Click **Create database**
   - Name it: `contract-copilot-db`
   - Click **Create**

3. **Get Database ID**
   - Click on your database name
   - Copy the **Database ID** from the overview page

4. **Get Account ID**
   - Look at the URL: `https://dash.cloudflare.com/[ACCOUNT_ID]/...`
   - Or go to **Workers & Pages** → **Overview** → Account ID shown

5. **Create API Token**
   - Click your profile (top right) → **My Profile**
   - Click **API Tokens** tab
   - Click **Create Token**
   - Use template: **Edit Cloudflare Workers**
   - Or create custom with permissions:
     - Account > D1 > Edit
     - Account > Workers Scripts > Edit
   - Click **Continue to summary** → **Create Token**
   - **COPY THE TOKEN** (you'll only see it once!)

6. **Initialize Database Schema**
   - In D1 database page, click **Console** tab
   - Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    stripe_customer_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id TEXT NOT NULL,
    status TEXT DEFAULT 'processing',
    risk_score INTEGER,
    risk_level TEXT,
    summary TEXT,
    issues TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
);

CREATE TABLE IF NOT EXISTS issue_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    analysis_id INTEGER NOT NULL,
    issue_index INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (analysis_id) REFERENCES analyses(id)
);
```

7. **Update .env File**
   - Open `backend/.env`
   - Add your credentials:

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_D1_DATABASE_ID=your_database_id_here
CLOUDFLARE_D1_API_TOKEN=your_api_token_here
```

### Option 2: Using Wrangler CLI (Advanced)

1. **Install Wrangler**
```bash
npm install -g wrangler
```

2. **Login**
```bash
wrangler login
```

3. **Create Database**
```bash
wrangler d1 create contract-copilot-db
```

4. **Get Account ID**
```bash
wrangler whoami
```

5. **Initialize Schema**
```bash
wrangler d1 execute contract-copilot-db --remote --file=backend/schema.sql
```

## 🔧 Testing the Setup

### Test Authentication:
1. Go to http://localhost:3000
2. Click "Get Started" or "Login"
3. Register a new account
4. You should be redirected to dashboard
5. Refresh the page - you should stay logged in
6. Navigate to home page - header should show "Dashboard" and "Logout"
7. Click "Logout" - you should be redirected to login

### Test Cloudflare D1 (After Setup):
```python
# In Python console or test file
from app.db.cloudflare_d1 import d1_client
import asyncio

async def test_d1():
    result = await d1_client.query("SELECT 1 as test")
    print(result)

asyncio.run(test_d1())
```

## 📊 Current Status

✅ **Authentication System**: Fully implemented and working
✅ **Dynamic Navigation**: Working based on auth state
✅ **Protected Routes**: Dashboard requires authentication
✅ **Persistent Sessions**: Users stay logged in
✅ **Cloudflare D1 Client**: Ready to use (needs credentials)
⏳ **Cloudflare D1 Setup**: Waiting for your credentials

## 🔐 Security Notes

1. **Secret Key**: Update `SECRET_KEY` in `.env` with a secure random string (min 32 characters)
2. **API Tokens**: Never commit API tokens to git
3. **HTTPS**: Use HTTPS in production
4. **Token Expiry**: Tokens expire after 7 days (configurable in settings)

## 📝 Next Steps

1. **Complete Cloudflare D1 Setup**:
   - Follow the steps above to get your credentials
   - Update `backend/.env` with the credentials
   - Test the connection

2. **Optional: Switch to D1 in Production**:
   - Currently using SQLite (works fine for development)
   - For production, you can switch to D1 for better scalability
   - Update database queries to use D1 client

3. **Test Everything**:
   - Register a new user
   - Upload a contract
   - Verify analysis works
   - Test logout/login flow

## 🆘 Troubleshooting

**Issue**: "Not authenticated" error
- **Solution**: Clear browser localStorage and login again

**Issue**: Cloudflare D1 connection fails
- **Solution**: Verify Account ID, Database ID, and API Token are correct

**Issue**: Token expired
- **Solution**: Login again (tokens expire after 7 days)

**Issue**: Can't create D1 database
- **Solution**: Ensure you have Workers plan enabled (free tier works)

## 📚 Additional Resources

- Cloudflare D1 Docs: https://developers.cloudflare.com/d1/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/
- API Token Guide: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/

---

**Need Help?** Check the `backend/setup_cloudflare_d1.md` file for more detailed instructions.
