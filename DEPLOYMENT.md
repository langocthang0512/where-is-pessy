# Deployment Guide

This guide takes the project from your computer to a public Vercel URL.

## 1. Install Required Tools

Install Node.js:

1. Go to https://nodejs.org
2. Download the LTS version.
3. Install it with the default options.
4. Open a new terminal and check:

```bash
node --version
npm --version
```

Install Git:

1. Go to https://git-scm.com/downloads
2. Download Git for your operating system.
3. Install it with the default options.
4. Open a new terminal and check:

```bash
git --version
```

## 2. Create The GitHub Repository

1. Go to https://github.com
2. Sign in as `langocthang0512`.
3. Click the `+` button in the top-right corner.
4. Click `New repository`.
5. Repository name: `where-is-pessy`
6. Visibility: `Public`
7. Do not add a README, license, or gitignore on GitHub because this project already has them.
8. Click `Create repository`.

## 3. Upload The Project To GitHub

Open a terminal in the project folder:

```bash
cd "C:\Users\admin\Documents\Final Vibe\where-is-pessy"
```

Run these commands:

```bash
git init
git add .
git commit -m "Initial playable build"
git branch -M main
git remote add origin https://github.com/langocthang0512/where-is-pessy.git
git push -u origin main
```

If Git asks you to sign in, follow the browser login prompt.

## 4. Deploy With Vercel

1. Go to https://vercel.com
2. Sign in with GitHub.
3. Click `Add New`.
4. Click `Project`.
5. Find `langocthang0512/where-is-pessy`.
6. Click `Import`.
7. Keep these settings:

```text
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

8. Click `Deploy`.

## 5. Public URL

After deployment, Vercel will show a public URL like:

```text
https://where-is-pessy.vercel.app
```

Vercel may also create a URL with the username:

```text
https://where-is-pessy-langocthang0512.vercel.app
```

## 6. Updating The Game Later

After making changes, run:

```bash
npm install
npm run build
git add .
git commit -m "Update game"
git push
```

Vercel will automatically deploy the new version after the push.

## 7. Local Checks Before Deployment

Run these before pushing:

```bash
npm install
npm run dev
npm run build
```

The build must finish successfully and create the `dist/` folder.
