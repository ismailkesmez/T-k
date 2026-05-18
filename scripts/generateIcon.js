/**
 * Generates assets/icon.png and assets/splash.png from SVG using pngjs.
 * Run with: node scripts/generateIcon.js
 *
 * For a production-quality icon, convert assets/icon.svg using:
 *   - Inkscape CLI: inkscape icon.svg -w 1024 -h 1024 -o icon.png
 *   - Online: https://svgtopng.com
 *   - Figma / Illustrator
 */

const fs = require('fs');
const path = require('path');

// Generate a programmatic PNG icon without external SVG dependency
// Uses pngjs for raw pixel manipulation
let PNG;
try {
  PNG = require('pngjs').PNG;
} catch (e) {
  console.error('pngjs not found. Run: npm install --save-dev pngjs');
  process.exit(1);
}

const SIZE = 1024;

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function setPixel(data, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
  const idx = (y * SIZE + x) * 4;
  data[idx] = r;
  data[idx + 1] = g;
  data[idx + 2] = b;
  data[idx + 3] = a;
}

function getPixel(data, x, y) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return [0, 0, 0, 0];
  const idx = (y * SIZE + x) * 4;
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
}

function fillRect(data, x1, y1, x2, y2, r, g, b, a = 255) {
  for (let y = Math.floor(y1); y <= Math.ceil(y2); y++) {
    for (let x = Math.floor(x1); x <= Math.ceil(x2); x++) {
      setPixel(data, x, y, r, g, b, a);
    }
  }
}

function drawCircle(data, cx, cy, radius, r, g, b, a = 255, filled = false) {
  const r2 = radius * radius;
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const d2 = x * x + y * y;
      if (filled) {
        if (d2 <= r2) setPixel(data, cx + x, cy + y, r, g, b, a);
      } else {
        if (d2 >= (radius - 2) * (radius - 2) && d2 <= r2) {
          setPixel(data, cx + x, cy + y, r, g, b, a);
        }
      }
    }
  }
}

function drawRoundRect(data, x1, y1, x2, y2, cornerR, r, g, b, a = 255) {
  const w = x2 - x1;
  const h = y2 - y1;
  for (let py = y1; py <= y2; py++) {
    for (let px = x1; px <= x2; px++) {
      const lx = px - x1;
      const ly = py - y1;
      let inside = true;
      // Check corners
      if (lx < cornerR && ly < cornerR) {
        const dx = cornerR - lx, dy = cornerR - ly;
        inside = dx * dx + dy * dy <= cornerR * cornerR;
      } else if (lx > w - cornerR && ly < cornerR) {
        const dx = lx - (w - cornerR), dy = cornerR - ly;
        inside = dx * dx + dy * dy <= cornerR * cornerR;
      } else if (lx < cornerR && ly > h - cornerR) {
        const dx = cornerR - lx, dy = ly - (h - cornerR);
        inside = dx * dx + dy * dy <= cornerR * cornerR;
      } else if (lx > w - cornerR && ly > h - cornerR) {
        const dx = lx - (w - cornerR), dy = ly - (h - cornerR);
        inside = dx * dx + dy * dy <= cornerR * cornerR;
      }
      if (inside) setPixel(data, px, py, r, g, b, a);
    }
  }
}

function generate() {
  const png = new PNG({ width: SIZE, height: SIZE, filterType: -1 });
  const data = png.data;

  // Fill with transparent
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i + 1] = data[i + 2] = 0;
    data[i + 3] = 0;
  }

  // Background gradient: #1a0533 -> #2D1B69 -> #0d1b69
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const t = (x + y) / (SIZE * 2);
      const r = Math.floor(lerp(lerp(0x1a, 0x2D, t), 0x0d, t));
      const g = Math.floor(lerp(lerp(0x05, 0x1B, t), 0x1b, t));
      const b = Math.floor(lerp(lerp(0x33, 0x69, t), 0x69, t));
      setPixel(data, x, y, r, g, b, 255);
    }
  }

  // Apply rounded corners (make corners transparent)
  const cr = 200;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let outside = false;
      if (x < cr && y < cr) {
        const dx = cr - x, dy = cr - y;
        outside = dx * dx + dy * dy > cr * cr;
      } else if (x > SIZE - cr && y < cr) {
        const dx = x - (SIZE - cr), dy = cr - y;
        outside = dx * dx + dy * dy > cr * cr;
      } else if (x < cr && y > SIZE - cr) {
        const dx = cr - x, dy = y - (SIZE - cr);
        outside = dx * dx + dy * dy > cr * cr;
      } else if (x > SIZE - cr && y > SIZE - cr) {
        const dx = x - (SIZE - cr), dy = y - (SIZE - cr);
        outside = dx * dx + dy * dy > cr * cr;
      }
      if (outside) setPixel(data, x, y, 0, 0, 0, 0);
    }
  }

  // Center glow
  const cx = 512, cy = 400;
  for (let r = 220; r >= 0; r--) {
    const alpha = Math.floor((1 - r / 220) * 60);
    drawCircle(data, cx, cy, r, 255, 71, 87, alpha, false);
  }

  // Concentric rings (gold)
  drawCircle(data, cx, cy, 290, 255, 215, 0, 35, false);
  drawCircle(data, cx, cy, 240, 255, 215, 0, 50, false);
  drawCircle(data, cx, cy, 185, 255, 215, 0, 70, false);

  // Finger shape (simplified: rounded rectangle pointing down)
  // Body
  for (let py = cy - 130; py <= cy + 130; py++) {
    for (let px = cx - 55; px <= cx + 55; px++) {
      const lx = px - (cx - 55);
      const ly = py - (cy - 130);
      const w = 110, h = 260, r2 = 40;
      let inside = true;
      if (lx < r2 && ly < r2) {
        const dx = r2 - lx, dy = r2 - ly;
        inside = dx * dx + dy * dy <= r2 * r2;
      } else if (lx > w - r2 && ly < r2) {
        const dx = lx - (w - r2), dy = r2 - ly;
        inside = dx * dx + dy * dy <= r2 * r2;
      } else if (lx < r2 && ly > h - r2) {
        const dx = r2 - lx, dy = ly - (h - r2);
        inside = dx * dx + dy * dy <= r2 * r2;
      } else if (lx > w - r2 && ly > h - r2) {
        const dx = lx - (w - r2), dy = ly - (h - r2);
        inside = dx * dx + dy * dy <= r2 * r2;
      }
      if (inside) {
        // Color: gradient from pink (#FF6B9D) at top to red (#FF4757) at bottom
        const t = ly / h;
        const fr = Math.floor(lerp(0xFF, 0xFF, t));
        const fg = Math.floor(lerp(0x6B, 0x47, t));
        const fb = Math.floor(lerp(0x9D, 0x57, t));
        setPixel(data, px, py, fr, fg, fb, 240);
      }
    }
  }

  // Fingernail highlight
  drawCircle(data, cx, cy - 108, 28, 255, 255, 255, 70, true);

  // "TıkTık" text area (simplified block letters for T-T)
  // Draw "TT" as stylized blocks since we can't embed fonts
  const textY = 680;
  // T1
  fillRect(data, 250, textY, 440, textY + 20, 255, 255, 255, 230); // top bar
  fillRect(data, 330, textY, 360, textY + 110, 255, 255, 255, 220); // stem
  // i (dot + stem)
  fillRect(data, 460, textY + 20, 475, textY + 110, 255, 255, 255, 200);
  fillRect(data, 460, textY + 2, 475, textY + 14, 255, 215, 0, 240); // dot gold
  // k
  fillRect(data, 490, textY, 505, textY + 110, 255, 255, 255, 200);
  // diagonal up
  for (let i = 0; i < 55; i++) {
    fillRect(data, 505 + i, textY + i, 520 + i, textY + i + 4, 255, 255, 255, 180);
  }
  // diagonal down
  for (let i = 0; i < 55; i++) {
    fillRect(data, 505 + i, textY + 55 + i, 520 + i, textY + 59 + i, 255, 255, 255, 180);
  }

  // Accent line under text
  fillRect(data, 240, textY + 125, 784, textY + 130, 255, 71, 87, 200);

  // Version badge background
  const badgeX1 = 400, badgeY1 = 800, badgeX2 = 624, badgeY2 = 850;
  drawRoundRect(data, badgeX1, badgeY1, badgeX2, badgeY2, 25, 255, 71, 87, 210);

  // Save PNG
  const outDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const iconPath = path.join(outDir, 'icon.png');
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(iconPath, buffer);
  console.log(`✓ Icon generated: ${iconPath} (${SIZE}x${SIZE})`);

  // Also create a smaller splash (same design, bigger)
  const splashPath = path.join(outDir, 'splash.png');
  fs.writeFileSync(splashPath, buffer);
  console.log(`✓ Splash generated: ${splashPath}`);

  // Adaptive icon (same as icon for simplicity)
  const adaptivePath = path.join(outDir, 'adaptive-icon.png');
  fs.writeFileSync(adaptivePath, buffer);
  console.log(`✓ Adaptive icon generated: ${adaptivePath}`);

  // Favicon (tiny copy)
  const faviconPath = path.join(outDir, 'favicon.png');
  fs.writeFileSync(faviconPath, buffer);
  console.log(`✓ Favicon generated: ${faviconPath}`);

  console.log('\nAll assets generated! Run: npx expo start');
}

generate();
