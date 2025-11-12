# Backend URL Debugging Guide

## 🔍 Issue: 404 Error on Login

The error shows:
```
POST https://carsale-backend-1.onrender.com/auth/login 404 (Not Found)
```

But the code expects:
```
POST https://carsale-backend-1.onrender.com/api/auth/login
```

## 🔧 Possible Issues

### Issue 1: Backend URL Structure
The backend might not use `/api` prefix. Check your backend code to see:
- Does the backend use `/api` prefix?
- Or does it use routes directly like `/auth/login`?

### Issue 2: Cached Build
If you're running a production build, it might be using cached code.

### Issue 3: Environment Variable Not Set
If `REACT_APP_API_URL` is set incorrectly, it might be overriding the default.

## ✅ Solutions

### Solution 1: Check Backend URL Structure

**Option A: Backend uses `/api` prefix**
- Keep: `https://carsale-backend-1.onrender.com/api`
- Full URL: `https://carsale-backend-1.onrender.com/api/auth/login`

**Option B: Backend doesn't use `/api` prefix**
- Change to: `https://carsale-backend-1.onrender.com`
- Full URL: `https://carsale-backend-1.onrender.com/auth/login`

### Solution 2: Test Backend Endpoints

Try these URLs in your browser or Postman:

1. **Test with `/api` prefix:**
   ```
   https://carsale-backend-1.onrender.com/api/auth/login
   ```

2. **Test without `/api` prefix:**
   ```
   https://carsale-backend-1.onrender.com/auth/login
   ```

3. **Test backend root:**
   ```
   https://carsale-backend-1.onrender.com/
   ```

### Solution 3: Update API Configuration

**If backend doesn't use `/api` prefix:**

Update `src/utils/api.ts`:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://carsale-backend-1.onrender.com';
```

**If backend uses `/api` prefix (current):**

Keep as is:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://carsale-backend-1.onrender.com/api';
```

### Solution 4: Clear Cache and Restart

1. **Clear browser cache:**
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
   - Or use Incognito mode

2. **Stop and restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm start
   ```

3. **Clear build cache:**
   ```bash
   rm -rf node_modules/.cache
   npm start
   ```

### Solution 5: Check Environment Variables

1. **Check if `.env.local` exists:**
   ```bash
   # If it exists, check the content
   cat .env.local
   ```

2. **Remove if incorrect:**
   ```bash
   # Delete if it has wrong URL
   rm .env.local
   ```

3. **Create correct one:**
   ```bash
   # For local development
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local
   
   # Or for production (without /api if backend doesn't use it)
   echo "REACT_APP_API_URL=https://carsale-backend-1.onrender.com" > .env.local
   ```

## 🔍 Debug Steps

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for: `🔗 API Base URL: <url>`
   - This shows what URL is being used

2. **Check Network Tab:**
   - Open DevTools → Network tab
   - Try to login
   - Check the request URL
   - See if it has `/api` or not

3. **Check Backend Logs:**
   - Check your backend server logs
   - See what URL it's receiving
   - This will tell you the correct structure

4. **Test with curl:**
   ```bash
   # Test with /api
   curl -X POST https://carsale-backend-1.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test"}'
   
   # Test without /api
   curl -X POST https://carsale-backend-1.onrender.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test"}'
   ```

## 📝 Quick Fix

**If backend doesn't use `/api` prefix:**

1. Update `src/utils/api.ts`:
   ```typescript
   const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://carsale-backend-1.onrender.com';
   ```

2. Restart dev server:
   ```bash
   npm start
   ```

3. Clear browser cache and test again

## 🆘 Still Not Working?

1. **Check backend documentation** - See what the correct endpoint structure is
2. **Contact backend developer** - Ask what the correct URL structure is
3. **Check backend code** - Look at backend routes to see the structure
4. **Test in Postman** - Test the backend directly to see what works

---

**Note**: The most likely issue is that your backend doesn't use `/api` prefix, or the cached build is using old code. Try removing `/api` from the URL and restarting the server.

