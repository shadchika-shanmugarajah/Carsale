# Vercel Deployment Guide

This guide will help you deploy the Moder Car Sale application to Vercel.

## ✅ Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)
3. **Backend API**: Ensure your backend is running at `https://carsale-backend-1.onrender.com/api`

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository
   - Vercel will auto-detect Create React App

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add the following variable:
     - **Name**: `REACT_APP_API_URL`
     - **Value**: `https://carsale-backend-1.onrender.com/api`
     - **Environment**: Production, Preview, Development (select all)

3. **Configure Build Settings**
   - **Framework Preset**: Create React App (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add REACT_APP_API_URL
   # Enter: https://carsale-backend-1.onrender.com/api
   # Select: Production, Preview, Development
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## ⚙️ Configuration Files

### vercel.json
The project includes a `vercel.json` configuration file that:
- Configures routing for React Router (SPA)
- Sets up cache headers for static assets
- Optimizes performance with proper caching

### API Configuration
The API URL is configured via environment variable `REACT_APP_API_URL`:
- Default: `https://carsale-backend-1.onrender.com/api`
- Can be overridden in Vercel dashboard
- Works in all environments (Production, Preview, Development)

## 🔍 Verifying Deployment

After deployment, verify:

1. **Homepage loads correctly**
   - Visit your Vercel URL
   - Check if the login page appears

2. **API connectivity**
   - Try logging in
   - Verify API calls are working
   - Check browser console for errors

3. **Routes work correctly**
   - Navigate to different pages
   - Ensure React Router works (no 404 errors)
   - Check that all routes redirect to `/index.html`

## 🐛 Troubleshooting

### Build Fails
- **Memory Issues**: Vercel has sufficient memory, but if issues persist:
  - Check if all dependencies are in `package.json`
  - Verify Node.js version compatibility
  - Check build logs in Vercel dashboard

### API Calls Fail
- **CORS Issues**: Ensure backend allows requests from your Vercel domain
- **Environment Variables**: Verify `REACT_APP_API_URL` is set correctly
- **Backend Status**: Check if backend is running and accessible

### Routes Return 404
- **SPA Routing**: Verify `vercel.json` includes the rewrite rule
- **React Router**: Ensure all routes are handled by React Router
- **Build Output**: Check that `build/index.html` exists

### Assets Not Loading
- **Cache Headers**: Verify cache headers in `vercel.json`
- **Public Folder**: Ensure assets in `public/` are included in build
- **Build Output**: Check `build/static/` directory exists

## 📝 Environment Variables

Required environment variables:
- `REACT_APP_API_URL`: Backend API URL (default: `https://carsale-backend-1.onrender.com/api`)

Optional environment variables:
- `REACT_APP_ENV`: Environment name (development, production)

## 🔄 Continuous Deployment

Vercel automatically deploys on:
- **Push to main/master**: Production deployment
- **Push to other branches**: Preview deployment
- **Pull Requests**: Preview deployment with unique URL

## 📊 Monitoring

- **Deployment Logs**: Available in Vercel dashboard
- **Analytics**: Enable in Vercel dashboard (Analytics tab)
- **Error Tracking**: Integrate with error tracking service (e.g., Sentry)

## 🔒 Security

- **Environment Variables**: Never commit `.env` files
- **API Keys**: Store in Vercel environment variables
- **HTTPS**: Automatically enabled by Vercel
- **CORS**: Configure backend to allow Vercel domain

## 🎯 Best Practices

1. **Use Environment Variables**: Never hardcode API URLs
2. **Test Before Deploy**: Run `npm run build` locally first
3. **Monitor Deployments**: Check deployment logs regularly
4. **Use Preview Deployments**: Test changes before production
5. **Optimize Build**: Minimize bundle size for faster loads

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API connectivity
4. Check browser console for errors
5. Review Vercel documentation: [vercel.com/docs](https://vercel.com/docs)

## ✨ Next Steps

After successful deployment:
1. Configure custom domain (optional)
2. Set up monitoring and analytics
3. Configure environment-specific API URLs
4. Set up automated testing
5. Configure CDN settings (if needed)

---

**Note**: The local build may fail due to memory limitations, but Vercel has sufficient resources to build the project successfully.

