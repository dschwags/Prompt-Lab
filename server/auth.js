import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In-memory session store
const sessions = new Map();

// Configuration
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomUUID();
const SESSION_DAYS = parseInt(process.env.SESSION_DAYS || '7', 10);

// Check if auth is disabled (at runtime)
function isAuthDisabled() {
  return process.env.DISABLE_AUTH === 'true' || process.env.DISABLE_AUTH === '1';
}

// Get password dynamically (after dotenv loads)
function getPassword() {
  return process.env.PROMPT_LAB_PASSWORD || 'promptlab2024';
}

// Check if session is valid
function isValidSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return false;
  }
  return true;
}

// Create a new session
function createSession() {
  const sessionId = crypto.randomUUID();
  const now = Date.now();
  
  sessions.set(sessionId, {
    id: sessionId,
    createdAt: now,
    expiresAt: now + (SESSION_DAYS * 24 * 60 * 60 * 1000)
  });
  
  return sessionId;
}

// Validate password dynamically
function validatePassword(inputPassword) {
  // If auth is disabled, always return true
  if (isAuthDisabled()) return true;
  return inputPassword === getPassword();
}

export function setupAuthRoutes(app) {
  // Login endpoint
  app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }
    
    if (!validatePassword(password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const sessionId = createSession();
    
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });
    
    res.json({ 
      success: true, 
      expiresAt: sessions.get(sessionId)?.expiresAt 
    });
  });
  
  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.clearCookie('sessionId');
    res.json({ success: true });
  });
  
  // Verify session / Auth status
  app.get('/api/auth/status', (req, res) => {
    // If auth is disabled, return authenticated immediately
    if (isAuthDisabled()) {
      return res.json({ 
        authenticated: true, 
        disabled: true 
      });
    }
    
    const sessionId = req.cookies?.sessionId;
    
    if (sessionId && isValidSession(sessionId)) {
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });
}

// Auth middleware for protected routes
export function authMiddleware(req, res, next) {
  // If auth is disabled, skip all checks
  if (isAuthDisabled()) {
    return next();
  }
  
  // Allow auth endpoints
  if (req.path.startsWith('/auth/login') || req.path.startsWith('/auth/logout') || req.path.startsWith('/auth/status')) {
    return next();
  }
  
  // Check session
  const sessionId = req.cookies?.sessionId;
  
  if (!sessionId || !isValidSession(sessionId)) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Please log in to access this resource'
    });
  }
  
  next();
}

// Export for checking auth status
export function isAuthenticated(req) {
  // If auth is disabled, always return true
  if (isAuthDisabled()) return true;
  
  const sessionId = req.cookies?.sessionId;
  return sessionId ? isValidSession(sessionId) : false;
}
