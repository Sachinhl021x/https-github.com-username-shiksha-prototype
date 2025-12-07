# GenAI4Code - Complete Deployment Guide

This guide provides step-by-step instructions to deploy the GenAI4Code website to Vercel and link it to your Namecheap domain.

---

## 📁 Project Overview

### Project Details
- **Project Name:** GenAI4Code
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Build System:** Turbopack
- **Repository Location:** `/Users/sachinlokesh/Documents/genai4codev2/genai4code`
- **Website Directory:** `/Users/sachinlokesh/Documents/genai4codev2/genai4code/website`

### Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS with custom design system
- **Icons:** Lucide React
- **Fonts:** Google Fonts (Inter)
- **Deployment Target:** Vercel (free tier)

### Directory Structure
```
genai4code/
├── website/                    # Main Next.js application
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── latest/        # News page
│   │   │   ├── engineering/   # Engineering topics
│   │   │   ├── research/      # Research insights
│   │   │   ├── products/      # AI Products
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── globals.css    # Global styles
│   │   ├── components/        # React components
│   │   │   ├── layout/        # Layout components (Navbar, Footer)
│   │   │   ├── ui/            # UI components (Card, Hero, etc.)
│   │   │   └── news/          # News-specific components
│   │   ├── styles/            # Additional styles
│   │   └── mockData.ts        # Mock data for content
│   ├── public/                # Static assets
│   ├── package.json           # Dependencies
│   ├── next.config.ts         # Next.js configuration
│   ├── tailwind.config.ts     # Tailwind configuration
│   └── tsconfig.json          # TypeScript configuration
└── DEPLOYMENT_GUIDE.md        # This file
```

### Key Features
- **Mobile-First Design:** Responsive navigation with drawer menu
- **Dynamic Content:** News, Engineering topics, Research insights, AI Products
- **Optimized Build:** Static generation for most pages
- **Modern UI:** Neomorphic design with animations

---

## ✅ Build Verification

The project has been successfully built and verified:

**Build Output:**
```
Route (app)                                      Size     First Load JS
┌ ○ /                                            4.17 kB         107 kB
├ ○ /engineering                                 2.23 kB        96.1 kB
├ ● /engineering/[slug]                          1.38 kB        95.3 kB
├ ○ /latest                                      4.18 kB         107 kB
├ ○ /products                                    3.21 kB         106 kB
├ ● /products/[slug]                             183 B          94.1 kB
├ ○ /research                                    182 B          94.1 kB
└ ● /research/[slug]                             182 B          94.1 kB
```

**Status:** ✅ All routes built successfully with no errors.

---

## 🚀 Deployment Steps

### Step 1: Set Up Git Repository

#### 1.1 Initialize Git (if not already done)
```bash
cd /Users/sachinlokesh/Documents/genai4codev2/genai4code
git init
```

#### 1.2 Create `.gitignore` (if not present)
Create a `.gitignore` file in the project root:
```
# dependencies
node_modules/
.pnp
.pnp.js

# testing
coverage/

# next.js
website/.next/
website/out/
website/build/
website/dist/

# production
build/

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

#### 1.3 Stage and Commit All Changes
```bash
cd /Users/sachinlokesh/Documents/genai4codev2/genai4code
git add .
git commit -m "Initial commit: GenAI4Code website ready for deployment"
```

#### 1.4 Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., `genai4code`)
3. **DO NOT** initialize with README (we already have local files)
4. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/genai4code.git`)

#### 1.5 Push to GitHub
```bash
cd /Users/sachinlokesh/Documents/genai4codev2/genai4code
git remote add origin https://github.com/YOUR_USERNAME/genai4code.git
git branch -M main
git push -u origin main
```

> **Note:** Replace `YOUR_USERNAME` with your actual GitHub username.

---

### Step 2: Deploy to Vercel

#### 2.1 Sign Up/Sign In to Vercel
1. Go to https://vercel.com/signup
2. Sign up with your GitHub account (easiest option)
3. Authorize Vercel to access your GitHub repositories

#### 2.2 Import Project
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Find your `genai4code` repository and click **"Import"**

#### 2.3 Configure Project Settings
Vercel will auto-detect Next.js. Use these settings:

**Project Settings:**
- **Framework Preset:** Next.js
- **Root Directory:** `website`  **(IMPORTANT: This is the subdirectory containing your Next.js app)**
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

**Environment Variables:**
- None required for basic deployment

#### 2.4 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. You'll receive a URL like: `https://genai4code-YOUR_PROJECT.vercel.app`

**Verify Deployment:**
Visit your Vercel URL and confirm:
- ✅ Home page loads
- ✅ Navigation works
- ✅ Mobile menu appears on small screens
- ✅ All pages (Latest, Engineering, Research, Products) are accessible

---

### Step 3: Link Namecheap Domain

#### 3.1 Add Domain to Vercel
1. In your Vercel project dashboard, go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Click **"Add"**

Vercel will show you the DNS records you need to configure.

#### 3.2 Configure DNS in Namecheap

**Option A: Use Vercel Nameservers (Recommended - Easiest)**

This is the simplest method. Vercel will manage all DNS for you.

1. In Vercel, after adding your domain, click **"Use Vercel DNS"**
2. Vercel will show you nameservers like:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. Go to Namecheap.com → **Domain List** → **Manage** (for your domain)
4. Go to **"Nameservers"** section
5. Select **"Custom DNS"**
6. Enter the Vercel nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
7. Click **"Save"**

**DNS Propagation:** Wait 10-60 minutes for DNS to propagate globally.

---

**Option B: Keep Namecheap DNS (More Control)**

If you want to keep using Namecheap's DNS (e.g., for email or other services):

1. In Vercel, Vercel will show you an A record and/or CNAME record to add
2. Go to Namecheap.com → **Domain List** → **Manage** → **Advanced DNS**
3. Add the following records:

**For Root Domain (yourdomain.com):**
- **Type:** A Record
- **Host:** @
- **Value:** `76.76.21.21` (Vercel's IP - verify in Vercel dashboard)
- **TTL:** Automatic

**For WWW Subdomain (www.yourdomain.com):**
- **Type:** CNAME Record
- **Host:** www
- **Value:** `cname.vercel-dns.com` (verify in Vercel dashboard)
- **TTL:** Automatic

4. **Delete any conflicting records** (e.g., old A records or CNAME records for @ or www)
5. Click **"Save All Changes"**

**DNS Propagation:** Wait 10-60 minutes for DNS to propagate.

---

#### 3.3 Verify Domain Connection
1. Wait 10-60 minutes for DNS propagation
2. Visit your domain (e.g., `https://yourdomain.com`)
3. Your site should now be live!

**Check SSL:**
Vercel automatically provisions an SSL certificate. You'll see a 🔒 icon in the browser.

---

## 🔄 Future Updates

### To Update Your Deployed Site:
1. Make changes to your local code
2. Commit and push to GitHub:
   ```bash
   cd /Users/sachinlokesh/Documents/genai4codev2/genai4code
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
3. Vercel will **automatically** rebuild and deploy your site (usually takes 2-3 minutes)

---

## 🛠️ Troubleshooting

### Build Fails on Vercel
- **Check Root Directory:** Ensure it's set to `website` in project settings
- **Check for Errors:** View build logs in Vercel dashboard
- **Test Locally:** Run `npm run build` in the `website` directory to catch errors

### Domain Not Working
- **Wait for DNS:** DNS can take up to 48 hours (usually 10-60 minutes)
- **Check DNS Records:** Use https://dnschecker.org to verify propagation
- **Clear Browser Cache:** Try incognito mode or a different browser

### Mobile Menu Not Showing
- **Hard Refresh:** Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- **Check Build:** Ensure the latest code is deployed

---

## 📞 Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Namecheap Support:** https://www.namecheap.com/support/

---

## ✅ Deployment Checklist

- [ ] Git repository initialized and committed
- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported to Vercel with `website` as root directory
- [ ] First deployment successful
- [ ] Domain added to Vercel
- [ ] DNS records configured in Namecheap
- [ ] Domain verified and SSL active
- [ ] All pages tested on live domain

---

**🎉 Congratulations! Your GenAI4Code website is now live!**
