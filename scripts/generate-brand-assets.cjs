const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Ensure directories exist
const imagesDir = path.join(process.cwd(), 'public', 'images');
const publicDir = path.join(process.cwd(), 'public');
fs.mkdirSync(imagesDir, { recursive: true });

// The 3-leaf emblem + typography SVG matching the official uploaded logo
// Color palette from uploaded asset:
// Dark forest green: #164627
// Vibrant leaf green: #477D2C
// White background: #FFFFFF

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&amp;family=Plus+Jakarta+Sans:wght@600&amp;display=swap');
      .serif-brand {
        font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
        font-weight: 700;
        fill: #144424;
      }
      .sans-sub {
        font-family: 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif;
        font-weight: 600;
        fill: #467C29;
        letter-spacing: 7px;
      }
      .rule-line {
        stroke: #467C29;
        stroke-width: 6;
        stroke-linecap: round;
      }
      .leaf {
        fill: #174828;
      }
    </style>
  </defs>

  <!-- Clean crisp background -->
  <rect width="1200" height="800" fill="#FFFFFF" />

  <!-- 3 LEAVES EMBLEM -->
  <g transform="translate(600, 270)">
    <!-- Leaf 1 (Left - tilted up-left ~45 deg) -->
    <path class="leaf" d="M -15, -15 
      C -85, -25 -145, -75 -180, -145 
      C -185, -155 -182, -162 -170, -165 
      C -110, -175 -45, -135 -5, -45 
      C 5, -25 0, -10 -15, -15 Z" />

    <!-- Leaf 2 (Center-Top - taller, tilted right ~25 deg) -->
    <path class="leaf" d="M 5, -35 
      C -15, -115 15, -195 85, -245 
      C 95, -252 105, -248 112, -238 
      C 142, -170 125, -95 45, -25 
      C 25, -10 10, -15 5, -35 Z" />

    <!-- Leaf 3 (Bottom-Right - tilted down-right ~65 deg) -->
    <path class="leaf" d="M 12, 10 
      C 15, -50 75, -95 145, -85 
      C 158, -82 165, -72 162, -60 
      C 150, 20 85, 80 15, 65 
      C 2, 62 8, 30 12, 10 Z" />
  </g>

  <!-- BRAND NAME: Sri Laxmi Narasimha -->
  <text x="600" y="535" text-anchor="middle" font-size="78" class="serif-brand">Sri Laxmi Narasimha</text>

  <!-- DIVIDER LINES & SUBTITLE: Nutrition Centre -->
  <g transform="translate(600, 605)">
    <!-- Left Line -->
    <line x1="-480" y1="-10" x2="-330" y2="-10" class="rule-line" />
    
    <!-- Text: Nutrition Centre -->
    <text x="0" y="2" text-anchor="middle" font-size="44" class="sans-sub">Nutrition Centre</text>
    
    <!-- Right Line -->
    <line x1="330" y1="-10" x2="480" y2="-10" class="rule-line" />
  </g>
</svg>`;

// Dedicated square icon SVG for Favicon and App Icon
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <style>
      .leaf {
        fill: #164627;
      }
    </style>
  </defs>
  <rect width="512" height="512" rx="100" fill="#FFFFFF" />
  <g transform="translate(256, 275) scale(1.15)">
    <!-- Leaf 1 (Left) -->
    <path class="leaf" d="M -15, -15 
      C -85, -25 -145, -75 -180, -145 
      C -185, -155 -182, -162 -170, -165 
      C -110, -175 -45, -135 -5, -45 
      C 5, -25 0, -10 -15, -15 Z" />

    <!-- Leaf 2 (Center-Top) -->
    <path class="leaf" d="M 5, -35 
      C -15, -115 15, -195 85, -245 
      C 95, -252 105, -248 112, -238 
      C 142, -170 125, -95 45, -25 
      C 25, -10 10, -15 5, -35 Z" />

    <!-- Leaf 3 (Bottom-Right) -->
    <path class="leaf" d="M 12, 10 
      C 15, -50 75, -95 145, -85 
      C 158, -82 165, -72 162, -60 
      C 150, 20 85, 80 15, 65 
      C 2, 62 8, 30 12, 10 Z" />
  </g>
</svg>`;

async function generate() {
  console.log('Generating official brand assets...');

  // 1. Write SVG files
  const svgPath = path.join(imagesDir, 'sri-laxmi-narasimha-logo.svg');
  const iconSvgPath = path.join(imagesDir, 'sri-laxmi-narasimha-icon.svg');
  fs.writeFileSync(svgPath, logoSvg);
  fs.writeFileSync(iconSvgPath, iconSvg);
  console.log('Saved SVGs to public/images/');

  // 2. Render Full Logo PNG (1200x800)
  const fullPngPath = path.join(imagesDir, 'sri-laxmi-narasimha-logo.png');
  await sharp(Buffer.from(logoSvg))
    .png({ quality: 100, compressionLevel: 8 })
    .toFile(fullPngPath);
  console.log('Generated full logo PNG at:', fullPngPath);

  // 3. Render Square Brand Icon PNG (512x512)
  const iconPngPath = path.join(imagesDir, 'sri-laxmi-narasimha-icon.png');
  await sharp(Buffer.from(iconSvg))
    .png({ quality: 100 })
    .toFile(iconPngPath);
  console.log('Generated icon PNG at:', iconPngPath);

  // 4. Render Favicon PNG (64x64 & 192x192)
  const faviconPath = path.join(publicDir, 'favicon.png');
  await sharp(Buffer.from(iconSvg))
    .resize(64, 64)
    .png()
    .toFile(faviconPath);
  console.log('Generated favicon.png at:', faviconPath);

  const faviconIcoPath = path.join(publicDir, 'favicon.ico');
  await sharp(Buffer.from(iconSvg))
    .resize(48, 48)
    .png()
    .toFile(faviconIcoPath);
  console.log('Generated favicon.ico at:', faviconIcoPath);
}

generate().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
