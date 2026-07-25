# SIA Dymka — Company Website

Official website for **SIA Dymka** hosted on GitHub Pages for [dymka.org](https://dymka.org).

## Local Preview

To preview the website locally on your computer before pushing to GitHub:

### Option 1: Start a Local Web Server (Recommended)

Run the following command in terminal from this folder:

```bash
python3 -m http.server 8000
```

Then open your browser and navigate to:
👉 **[http://localhost:8000](http://localhost:8000)**

_(Press `Ctrl + C` in the terminal to stop the server)._

### Option 2: Open HTML File Directly

You can also open `index.html` directly in your browser:

```bash
open index.html
```

## Code Linting & Formatting

You can run linting and code formatting checks locally using `npx`:

### 1. Lint HTML Files

Checks for HTML syntax errors, unclosed tags, and missing attributes:

```bash
npx htmlhint "**/*.html"
```

### 2. Check Code Formatting

Verifies code formatting across HTML, CSS, JS, and Markdown:

```bash
npx prettier --check "**/*.{html,css,js,md,json,yml}"
```

### 3. Automatically Fix & Format Code

Formats all files to match project style guidelines:

```bash
npx prettier --write "**/*.{html,css,js,md,json,yml}"
```
