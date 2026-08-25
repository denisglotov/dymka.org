const fs = require('fs');
const path = require('path');
const { Liquid } = require('liquidjs');
const fm = require('front-matter');
const yaml = require('js-yaml');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const OUT_DIR = path.join(ROOT_DIR, '_site');

// 1. Load _config.yml
let siteConfig = {};
try {
  const configPath = fs.existsSync(path.join(SRC_DIR, '_config.yml'))
    ? path.join(SRC_DIR, '_config.yml')
    : path.join(ROOT_DIR, '_config.yml');
  const configStr = fs.readFileSync(configPath, 'utf8');
  siteConfig = yaml.load(configStr) || {};
} catch (e) {
  console.warn('Warning: Could not load _config.yml', e.message);
}

// 2. Configure LiquidJS Engine with Jekyll filters
const engine = new Liquid({
  root: [path.join(SRC_DIR, '_includes'), path.join(SRC_DIR, '_layouts')],
  extname: '.html',
  dynamicPartials: false,
});

// Register Jekyll filters
engine.registerFilter('relative_url', (input) => {
  if (!input) return '';
  return input.startsWith('/') ? input : '/' + input;
});

engine.registerFilter('absolute_url', (input) => {
  if (!input) return siteConfig.url || '';
  const baseUrl = siteConfig.url || '';
  const cleanInput = input.startsWith('/') ? input : '/' + input;
  return baseUrl + cleanInput;
});

// Helper to recursively copy directories/files
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Helper to recursively find all HTML template files in src/
function findHtmlPages(dir, baseDir = dir) {
  const pages = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === '_includes' ||
        entry.name === '_layouts' ||
        entry.name === 'node_modules'
      ) {
        continue;
      }
      pages.push(...findHtmlPages(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const relPath = path.relative(baseDir, fullPath);
      pages.push(relPath);
    }
  }

  return pages;
}

async function buildSite() {
  console.log('⚡ Building static site with LiquidJS...');

  // Reset output directory
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 3. Copy all raw static files from public/ into _site/
  if (fs.existsSync(PUBLIC_DIR)) {
    for (const item of fs.readdirSync(PUBLIC_DIR)) {
      const srcPath = path.join(PUBLIC_DIR, item);
      const destPath = path.join(OUT_DIR, item);
      copyRecursive(srcPath, destPath);
    }
  }

  // 4. Copy CSS and JS from src/ into _site/
  const srcAssets = ['css', 'js'];
  for (const item of srcAssets) {
    const srcPath = path.join(SRC_DIR, item);
    const destPath = path.join(OUT_DIR, item);
    copyRecursive(srcPath, destPath);
  }

  // 5. Discover and render HTML pages in src/
  const pages = findHtmlPages(SRC_DIR);

  for (const pageRelPath of pages) {
    const pagePath = path.join(SRC_DIR, pageRelPath);
    const rawContent = fs.readFileSync(pagePath, 'utf8');
    const parsed = fm(rawContent);
    const pageAttr = parsed.attributes || {};

    if (pageRelPath === 'index.html') {
      pageAttr.url = '/';
    } else if (pageRelPath.endsWith('/index.html') || pageRelPath.endsWith('\\index.html')) {
      pageAttr.url = '/' + pageRelPath.replace(/\\/g, '/').replace(/index\.html$/, '');
    } else {
      pageAttr.url = '/' + pageRelPath.replace(/\\/g, '/');
    }

    const context = {
      site: siteConfig,
      page: pageAttr,
      content: parsed.body,
    };

    // Render body through Liquid
    const renderedBody = await engine.parseAndRender(parsed.body, context);
    context.content = renderedBody;

    // Render inside layout if specified
    let finalHtml = renderedBody;
    const layoutName = pageAttr.layout || 'default';
    const layoutPath = path.join(SRC_DIR, '_layouts', `${layoutName}.html`);

    if (fs.existsSync(layoutPath)) {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');
      finalHtml = await engine.parseAndRender(layoutContent, context);
    }

    const outPath = path.join(OUT_DIR, pageRelPath);
    const outDirName = path.dirname(outPath);
    if (!fs.existsSync(outDirName)) {
      fs.mkdirSync(outDirName, { recursive: true });
    }
    fs.writeFileSync(outPath, finalHtml, 'utf8');
    console.log(`  ✓ Rendered ${pageRelPath}`);
  }

  console.log('✨ Build complete! Output folder: _site/\n');
}

buildSite().catch((err) => {
  console.error('Error building site:', err);
  process.exit(1);
});
