# Deploying Your Habit Tracker App

This guide will help you deploy your Habit Tracker app to Vercel for free, making it live forever on the internet.

## Prerequisites

1. A GitHub account with your code pushed to a repository (which you already have)
2. A Vercel account (free, can sign up with GitHub)

## Deploy to Vercel

### Step 1: Sign up for Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub account

### Step 2: Import your project
1. Click "Add New Project"
2. Find and select your "Habit-Flow" repository
3. Click "Import"

### Step 3: Configure the deployment
1. Vercel should automatically detect this is a Vite/React project
2. Make sure the settings are:
   - Framework Preset: `Vite`
   - Root Directory: `/` (root of your repository)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Development Command: `npm run dev`
3. Click "Deploy"

### Step 4: Wait for deployment
- Vercel will install dependencies and build your project
- Once complete, you'll get a unique URL for your live app
- You can customize the domain name in your project settings

## Alternative: Deploy to Netlify

If you prefer Netlify:

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site"
4. Choose "Import an existing project"
5. Select your GitHub repository
6. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Deploy site

## GitHub Pages (Alternative)

If you want to use GitHub Pages (free hosting through GitHub):

1. In your GitHub repository, go to Settings > Pages
2. Under "Source", select "GitHub Actions"
3. Create a `.github/workflows/deploy.yml` file in your project:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install and Build
        run: |
          npm ci
          npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          publish_branch: gh-pages
```

4. After the workflow runs, your site will be available at:
   `https://your-username.github.io/repository-name`

## Important Notes

- Your app uses local storage for data persistence, which means data is stored only in the user's browser
- Each user will have their own separate data when using the deployed app
- If you want shared data across users, you'll need to implement a backend server with a database

Your app should be accessible from anywhere in the world after deployment!