# Dymka — Company Website

Official website for **Dymka** hosted on GitHub Pages for [dymka.org](https://dymka.org).

## 📁 Project Structure

- **`src/`**: Source files and templates (`_includes/`, `_layouts/`, `css/`, `js/`, and HTML pages).
- **`public/`**: Raw static assets copied verbatim to the build output (`CNAME`, `robots.txt`,
  `sitemap.xml`, `assets/`, sub-apps like `biomass/app/`).
- **`scripts/`**: Node.js build scripts.
- **`_site/`**: Generated static output ready for production deployment (git-ignored).

## 👁️ Local Preview

You can preview the website locally using Node.js:

### 1. Install dependencies (first time only):

```bash
npm install
```

### 2. Build & Preview:

Run the preview command to compile templates and launch a local web server:

```bash
npm run preview
```

Then open your browser and navigate to:
👉 **[http://localhost:8000](http://localhost:8000)**

_(Or simply run `npm run build` to compile pages into `_site/`)._

## 🔍 Code Linting & Formatting

Run linting and code formatting checks locally:

```bash
npm run lint
```

Auto-format all code files:

```bash
npm run format
```

## 🚀 Deployment

The site is automatically built and deployed to GitHub Pages on every push to `master` via GitHub Actions (`.github/workflows/deploy.yml`). Only the compiled static output in `_site/` is published.
