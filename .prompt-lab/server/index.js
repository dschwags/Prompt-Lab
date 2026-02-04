// Load environment FIRST before any other imports
import { config } from 'dotenv';
config();

// Now load the rest
const { default: express } = await import('express');
const { default: cors } = await import('cors');
const { default: cookieParser } = await import('cookie-parser');
const { default: rateLimit } = await import('express-rate-limit');
import path from 'path';
import { fileURLToPath } from 'url';
import { setupAuthRoutes, authMiddleware } from './auth.js';
import { setupProjectRoutes } from './project-files.js';
import { setupThreadRoutes } from './thread-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/home/runner/workspace';
const PROMPT_LAB_PASSWORD = process.env.PROMPT_LAB_PASSWORD || 'promptlab2024';

const app = express();

// Security middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please slow down' }
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    workspace: WORKSPACE_DIR,
    timestamp: new Date().toISOString()
  });
});

// Setup auth with password from env
setupAuthRoutes(app, PROMPT_LAB_PASSWORD);

// Apply auth middleware to protected routes
app.use('/api/', authMiddleware);

// Setup workspace routes
setupProjectRoutes(app, WORKSPACE_DIR);
setupThreadRoutes(app, WORKSPACE_DIR);

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Prompt Lab API Server running on port ${PORT}`);
  console.log(`📁 Workspace: ${WORKSPACE_DIR}`);
  console.log(`🔐 Password: ${PROMPT_LAB_PASSWORD}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
});

export default app;
