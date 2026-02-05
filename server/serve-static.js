// Add static file serving to the existing Express app
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function setupStaticFileServing(app, express) {
  // Serve static files from the dist directory
  app.use(express.static(path.join(__dirname, '../dist')));

  // For any other routes, serve the index.html file
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  console.log('📂 Static file serving enabled');
}
