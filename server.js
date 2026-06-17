import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import os from 'os';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(compression());
const PORT = 3000;
const HOST = '0.0.0.0'; // Listen on all interfaces for LAN access

// Function to get all local IPv4 addresses
function getLocalIps() {
  const ips = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips.length > 0 ? ips : ['localhost'];
}

// Serve static files from the 'dist' directory with custom cache control for HTML
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Handle SPA routing: serve index.html for any requested route with cache-control headers
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, HOST, () => {
  const localIps = getLocalIps();
  console.log(`\n🚀 LAN Deployment Active!`);
  console.log(`🏠 Local:   http://localhost:${PORT}/ (Static)`);
  localIps.forEach(ip => {
    console.log(`🌐 Network: http://${ip}:${PORT}/`);
  });
  console.log(`\n💡 Info: This is a static deployment. Run 'npm run sync' to push local changes to LAN.`);
  console.log(`Press Ctrl+C to stop the server.\n`);
});
