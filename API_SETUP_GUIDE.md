# API Configuration Setup Guide

This guide will help you configure the API URL for your Car Sale application.

## 🔧 Current Configuration

The API is configured to use environment variables with a fallback to production URL.

**Default Production URL**: `https://carsale-backend-1.onrender.com/api`

## 📝 Setup Instructions

### Option 1: Local Development (localhost:5000)

1. **Create `.env.local` file** in the project root:
   ```bash
   REACT_APP_API_URL=http://localhost:5000/api
   ```

2. **Restart your development server**:
   ```bash
   npm start
   ```

3. **Verify the API URL**:
   - Open browser console
   - Look for: `API Base URL: http://localhost:5000/api`
   - If you see this, the environment variable is loaded correctly

### Option 2: Production (Render/Heroku/etc)

1. **For Vercel Deployment**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `REACT_APP_API_URL` = `https://carsale-backend-1.onrender.com/api`
   - Redeploy your application

2. **For Other Hosting**:
   - Set environment variable `REACT_APP_API_URL` in your hosting platform
   - Use your production backend URL

## 🔍 Debugging Connection Issues

### Check 1: Verify Backend is Running

**For Local Development:**
```bash
# Check if backend is running on port 5000
curl http://localhost:5000/api/health
# or
curl http://localhost:5000/api/auth/users
```

**For Production:**
```bash
# Check if backend is accessible
curl https://carsale-backend-1.onrender.com/api/health
```

### Check 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for:
   - `API Base URL: <your-url>` - Shows which URL is being used
   - `API Call: GET/POST <url>` - Shows each API call
   - Error messages with detailed information

### Check 3: Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Check the request:
   - **URL**: Should match your configured API URL
   - **Status**: 200 (success), 401 (unauthorized), 404 (not found), 500 (server error)
   - **Response**: Check the response body for error messages

## 🐛 Common Issues

### Issue 1: "Unable to connect to backend server"

**Symptoms:**
- Network error in console
- `TypeError: Failed to fetch`
- Connection refused

**Solutions:**
1. **Check if backend is running**:
   - For local: Ensure backend server is running on port 5000
   - For production: Check if backend URL is correct and accessible

2. **Check CORS settings**:
   - Backend must allow requests from your frontend domain
   - For local: Backend should allow `http://localhost:3000`
   - For production: Backend should allow your Vercel domain

3. **Check firewall/network**:
   - Ensure port 5000 is not blocked (for local)
   - Check if VPN/proxy is interfering

### Issue 2: "404 Not Found"

**Symptoms:**
- API calls return 404
- Endpoint not found errors

**Solutions:**
1. **Check API URL**:
   - Verify the backend URL is correct
   - Ensure `/api` is included in the URL
   - Check if backend routes match frontend expectations

2. **Check backend routes**:
   - Verify backend has `/api/auth/login` endpoint
   - Check backend API documentation

### Issue 3: "401 Unauthorized"

**Symptoms:**
- Login fails with 401
- "Invalid username or password"

**Solutions:**
1. **Check credentials**:
   - Verify username and password are correct
   - Check if user exists in backend database

2. **Check backend authentication**:
   - Verify backend authentication is working
   - Check backend logs for authentication errors

### Issue 4: "CORS Error"

**Symptoms:**
- `Access to fetch at '...' has been blocked by CORS policy`
- Cross-origin request blocked

**Solutions:**
1. **Backend CORS configuration**:
   - Backend must allow your frontend origin
   - Add frontend URL to CORS whitelist
   - For local: Allow `http://localhost:3000`
   - For production: Allow your Vercel domain

2. **Check backend CORS settings**:
   ```javascript
   // Backend should have something like:
   app.use(cors({
     origin: ['http://localhost:3000', 'https://your-app.vercel.app'],
     credentials: true
   }));
   ```

## 📊 Environment Variables

### Available Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REACT_APP_API_URL` | Backend API URL | `https://carsale-backend-1.onrender.com/api` | No |

### Setting Environment Variables

**Local Development:**
- Create `.env.local` file (gitignored)
- Add: `REACT_APP_API_URL=http://localhost:5000/api`
- Restart dev server

**Production (Vercel):**
- Vercel Dashboard → Settings → Environment Variables
- Add: `REACT_APP_API_URL` = `https://carsale-backend-1.onrender.com/api`
- Redeploy

**Production (Other):**
- Set in hosting platform's environment variables
- Use production backend URL

## 🧪 Testing the Connection

### Test 1: Check API URL
```javascript
// Open browser console and check:
console.log('API Base URL:', process.env.REACT_APP_API_URL);
// Should show your configured URL
```

### Test 2: Test Backend Connection
```bash
# Test if backend is accessible
curl http://localhost:5000/api/health
# or
curl https://carsale-backend-1.onrender.com/api/health
```

### Test 3: Test Login Endpoint
```bash
# Test login endpoint (replace with actual credentials)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

## 🔄 Switching Between Environments

### Local Development
1. Create `.env.local` with: `REACT_APP_API_URL=http://localhost:5000/api`
2. Restart dev server: `npm start`

### Production
1. Remove `.env.local` or set: `REACT_APP_API_URL=https://carsale-backend-1.onrender.com/api`
2. Build: `npm run build`
3. Deploy to Vercel

## 📝 Quick Checklist

- [ ] Backend is running and accessible
- [ ] API URL is correctly configured
- [ ] Environment variable is set (if using local)
- [ ] CORS is configured on backend
- [ ] Browser console shows correct API URL
- [ ] Network requests are being made
- [ ] Backend responds with expected data

## 🆘 Still Having Issues?

1. **Check Backend Logs**:
   - Look at backend server logs
   - Check for errors or warnings
   - Verify backend is receiving requests

2. **Check Frontend Logs**:
   - Open browser console
   - Look for error messages
   - Check network tab for failed requests

3. **Verify Backend URL**:
   - Test backend URL directly in browser
   - Use curl or Postman to test endpoints
   - Ensure backend is accessible

4. **Check Environment Variables**:
   - Verify `.env.local` file exists (for local)
   - Check Vercel environment variables (for production)
   - Ensure variable name is correct: `REACT_APP_API_URL`

## 📞 Need Help?

If you're still experiencing issues:
1. Check the error message in browser console
2. Check backend logs
3. Verify backend URL is correct
4. Test backend endpoints directly
5. Check CORS configuration

---

**Note**: Remember to restart your development server after changing environment variables!

