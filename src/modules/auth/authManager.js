import { setSession, clearSession } from './sessionStorage.js';

const API_URL = '/api/auth';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.currentSession = null;
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      this.currentUser = data.user;
      this.currentSession = data.session;
      setSession(this.currentSession);

      return { user: this.currentUser, session: this.currentSession };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(email, password, userData) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...userData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      this.currentUser = data.user;
      this.currentSession = data.session;
      setSession(this.currentSession);

      return { user: this.currentUser, session: this.currentSession };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  logout() {
    this.currentUser = null;
    this.currentSession = null;
    clearSession();
  }

  async validateSession(session) {
    try {
      const response = await fetch(`${API_URL}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.valid ? data.user : null;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  setUser(user) {
    this.currentUser = user;
  }

  setSession(session) {
    this.currentSession = session;
  }
}

export const authManager = new AuthManager();