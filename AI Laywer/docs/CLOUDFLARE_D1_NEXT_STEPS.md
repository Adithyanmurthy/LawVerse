# 🚀 Cloudflare D1 - Next Steps

## ✅ What's Already Done

Your Cloudflare D1 credentials have been partially configured:
- ✅ Account ID: `36fe9568-52c1-44fd-92bd-086dfdd4e484`
- ✅ Database ID: `cBoylETjXFEoOn0B_qivEtaNoiuyTyg3yaQYqwXo`
- ⏳ API Token: **You need to create this**

## 🔑 Step 1: Create Your API Token

1. **Go to**: https://dash.cloudflare.com/profile/api-tokens

2. **Click**: "Create Token" button

3. **Choose**: "Edit Cloudflare Workers" template
   - Or create a custom token with these permissions:
     - Account → D1 → Edit
     - Account → Workers Scripts → Edit

4. **Create and Copy**: 
   - Click "Continue to summary"
   - Click "Create Token"
   - **COPY THE TOKEN** (shown only once!)

5. **Update .env**:
   - Open `backend/.env`
   - Replace `your_api_token_here` with your actual token:
   ```env
   CLOUDFLARE_D1_API_TOKEN=your_actual_token_here
   ```

## 🧪 Step 2: Test Your Connection

After adding the API token, test the connection:

```bash
cd backend
python test_d1_connection.py
```

You should see:
```
✅ Connection successful!
✅ Found X table(s)
✨ All tests passed! Your D1 database is ready.
```

## 🗄️ Step 3: Initialize Database Tables

If no tables exist, run:

```bash
cd backend
python init_d1_database.py
```

This will create:
- `users` table (for authentication)
- `contracts` table (for uploaded contracts)
- `analyses` table (for analysis results)
- `issue_feedback` table (for user feedback)

## 🔄 Step 4: Restart Backend Server

After configuration, restart the backend:

```bash
# Stop the current backend (Ctrl+C in the terminal)
# Then restart:
cd backend
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8001
```

## ✅ Verification Checklist

- [ ] Created Cloudflare API Token
- [ ] Updated `backend/.env` with API token
- [ ] Ran `test_d1_connection.py` successfully
- [ ] Ran `init_d1_database.py` to create tables
- [ ] Restarted backend server
- [ ] Tested login/register on frontend

## 🎯 What This Enables

Once configured, your app will:
- ✅ Store user data in Cloudflare D1 (scalable, global)
- ✅ Store contract data in Cloudflare D1
- ✅ Store analysis results in Cloudflare D1
- ✅ Benefit from Cloudflare's global network
- ✅ Get automatic backups
- ✅ Scale to millions of requests

## 📊 Cloudflare D1 Free Tier Limits

- 5 GB storage
- 5 million reads per day
- 100,000 writes per day
- Perfect for development and small-medium production apps!

## 🆘 Troubleshooting

### Error: "Missing credentials"
- **Solution**: Make sure all three values are set in `.env`

### Error: "Authentication failed"
- **Solution**: Verify your API token has D1 permissions

### Error: "Database not found"
- **Solution**: Check that the Database ID is correct in Cloudflare Dashboard

### Error: "Permission denied"
- **Solution**: Recreate API token with correct permissions

## 📚 Additional Resources

- **Cloudflare D1 Docs**: https://developers.cloudflare.com/d1/
- **API Token Guide**: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
- **D1 Console**: https://dash.cloudflare.com/[your-account-id]/workers/d1

## 🎉 After Setup

Once everything is configured, you can:
1. Register new users (stored in D1)
2. Upload contracts (metadata in D1)
3. Run analyses (results in D1)
4. Scale globally with Cloudflare's network

---

**Current Status**: ⏳ Waiting for API Token

**Next Action**: Create API token and update `.env` file
