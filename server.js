import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import os from 'os';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
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

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing: serve index.html for any requested route
app.get('*', (req, res) => {
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
