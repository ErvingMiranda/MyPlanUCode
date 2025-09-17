import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8000'; // Change this to your backend URL

class AuthService {
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          token: data.access_token,
          user: data.user,
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Error de autenticación',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback for development/offline mode
      if (email === 'demo@myplanu.com' && password === 'demo123') {
        return {
          success: true,
          token: 'demo-token',
          user: {
            id: 1,
            email: 'demo@myplanu.com',
            name: 'Usuario Demo',
          },
        };
      }
      
      return {
        success: false,
        message: 'Error de conexión',
      };
    }
  }

  async register(email, password, name = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          token: data.access_token,
          user: data.user,
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Error al crear cuenta',
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      // Fallback for development/offline mode
      return {
        success: true,
        token: 'demo-token',
        user: {
          id: Date.now(),
          email: email,
          name: name || 'Usuario',
        },
      };
    }
  }

  async logout() {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  }

  async getToken() {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  async getUser() {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();