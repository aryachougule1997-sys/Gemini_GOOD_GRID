interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  userType: 'WORKER' | 'PROVIDER';
  characterData?: any;
  locationData?: any;
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      username: string;
      email: string;
      characterData?: any;
      locationData?: any;
      createdAt: string;
      updatedAt: string;
    };
    stats?: any;
    token: string;
  };
  error?: string;
  message?: string;
}

class AuthService {
  private baseUrl = 'http://localhost:3001/api';
  private tokenKey = 'goodgrid_token';

  // Register new user
  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();
      
      if (result.success && result.data?.token) {
        this.setToken(result.data.token);
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Network error during registration'
      };
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();
      
      if (result.success && result.data?.token) {
        this.setToken(result.data.token);
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error during login'
      };
    }
  }

  // Verify token and get user info
  async verifyToken(): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'No token found'
        };
      }

      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();
      
      if (!result.success) {
        this.removeToken();
      }
      
      return result;
    } catch (error) {
      console.error('Token verification error:', error);
      this.removeToken();
      return {
        success: false,
        error: 'Network error during token verification'
      };
    }
  }

  // Logout user
  logout(): void {
    this.removeToken();
  }

  // Token management
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get authorization header
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Make authenticated API request
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }
}

export default new AuthService();
export type { LoginCredentials, RegisterData, AuthResponse };