const fs = require('fs');
const path = require('path');
const { Liquid } = require('liquidjs');
const fm = require('front-matter');
const yaml = require('js-yaml');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT_DIR, '_site');

// 1. Load _config.yml
let siteConfig = {};
try {
  const configStr = fs.readFileSync(path.join(ROOT_DIR, '_config.yml'), 'utf8');
  siteConfig = yaml.load(configStr) || {};
} catch (e) {
  console.warn('Warning: Could not load _config.yml', e.message);
}

// 2. Configure LiquidJS Engine with Jekyll filters
const engine = new Liquid({
  root: [path.join(ROOT_DIR, '_includes'), path.join(ROOT_DIR, '_layouts')],
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

async function buildSite() {
  console.log('⚡ Building static site with LiquidJS...');

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  // List of HTML pages to process
  const pages = ['index.html', 'company.html', 'privacy.html', 'terms.html'];

  for (const pageName of pages) {
    const pagePath = path.join(ROOT_DIR, pageName);
    if (!fs.existsSync(pagePath)) continue;

    const rawContent = fs.readFileSync(pagePath, 'utf8');
    const parsed = fm(rawContent);
    const pageAttr = parsed.attributes || {};
    pageAttr.url = '/' + pageName;
    if (pageName === 'index.html') pageAttr.url = '/';

    const context = {
      site: siteConfig,
      page: pageAttr,
      content: parsed.body,
    };

    // Render body through liquid
    const renderedBody = await engine.parseAndRender(parsed.body, context);
    context.content = renderedBody;

    // Render inside default layout if specified
    let finalHtml = renderedBody;
    const layoutName = pageAttr.layout || 'default';
    const layoutPath = path.join(ROOT_DIR, '_layouts', `${layoutName}.html`);

    if (fs.existsSync(layoutPath)) {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');
      finalHtml = await engine.parseAndRender(layoutContent, context);
    }

    const outPath = path.join(OUT_DIR, pageName);
    fs.writeFileSync(outPath, finalHtml, 'utf8');
    console.log(`  ✓ Rendered ${pageName}`);
  }

  // Copy assets, css, js, robots.txt, sitemap.xml, CNAME to _site/
  const staticItems = ['assets', 'css', 'js', 'robots.txt', 'sitemap.xml', 'CNAME'];
  for (const item of staticItems) {
    const srcPath = path.join(ROOT_DIR, item);
    const destPath = path.join(OUT_DIR, item);
    copyRecursive(srcPath, destPath);
  }

  console.log('✨ Build complete! Output folder: _site/\n');
}

buildSite().catch((err) => {
  console.error('Error building site:', err);
  process.exit(1);
});
