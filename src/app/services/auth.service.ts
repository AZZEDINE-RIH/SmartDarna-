import { Injectable } from '@angular/core';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'vendeur' | 'admin';
}

export interface LoggedInUser {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'vendeur' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'currentUser';

  // Hardcoded users database
  private users: User[] = [
    {
      id: 1,
      email: 'user@example.com',
      password: 'password123',
      name: 'John User',
      role: 'user'
    },
    {
      id: 2,
      email: 'vendeur@example.com',
      password: 'password123',
      name: 'Alice Vendeur',
      role: 'vendeur'
    },
    {
      id: 3,
      email: 'admin@example.com',
      password: 'password123',
      name: 'Admin Smith',
      role: 'admin'
    }
  ];

  constructor() {
    // Restore user from localStorage on service initialization (browser only)
    if (this.isBrowser()) {
      this.restoreUser();
    }
  }

  /**
   * Check if code is running in browser environment
   */
  private isBrowser(): boolean {
    return typeof localStorage !== 'undefined' && typeof window !== 'undefined';
  }

  /**
   * Login with email and password
   * @param email User email
   * @param password User password
   * @returns LoggedInUser object if successful, null if failed
   */
  login(email: string, password: string): LoggedInUser | null {
    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const loggedInUser: LoggedInUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
      
      // Store user in localStorage (browser only)
      if (this.isBrowser()) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(loggedInUser));
      }
      return loggedInUser;
    }
    
    return null;
  }

  /**
   * Register a new user
   * @param name User name
   * @param email User email
   * @param password User password
   * @returns LoggedInUser object if successful
   */
  register(name: string, email: string, password: string): LoggedInUser {
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: this.users.length + 1,
      email,
      password,
      name,
      role: 'user' // Default role for new users
    };

    // Add to users array
    this.users.push(newUser);

    // Auto-login the new user
    const loggedInUser: LoggedInUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    };

    // Store user in localStorage (browser only)
    if (this.isBrowser()) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(loggedInUser));
    }

    return loggedInUser;
  }

  /**
   * Logout the current user
   */
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Check if user is logged in
   * @returns true if user is logged in, false otherwise
   */
  isLoggedIn(): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    const user = localStorage.getItem(this.STORAGE_KEY);
    return user !== null;
  }

  /**
   * Get the current logged-in user
   * @returns LoggedInUser object or null if not logged in
   */
  getUser(): LoggedInUser | null {
    if (!this.isBrowser()) {
      return null;
    }
    const user = localStorage.getItem(this.STORAGE_KEY);
    
    if (user) {
      try {
        return JSON.parse(user) as LoggedInUser;
      } catch (e) {
        console.error('Error parsing stored user', e);
        localStorage.removeItem(this.STORAGE_KEY);
        return null;
      }
    }
    
    return null;
  }

  /**
   * Get the role of the current logged-in user
   * @returns User role or null if not logged in
   */
  getUserRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  /**
   * Check if user has specific role
   * @param role Role to check
   * @returns true if user has the role, false otherwise
   */
  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  /**
   * Check if user has any of the specified roles
   * @param roles Array of roles to check
   * @returns true if user has any of the roles, false otherwise
   */
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Restore user from localStorage (called on service initialization)
   */
  private restoreUser(): void {
    if (!this.isBrowser()) {
      return;
    }
    const user = localStorage.getItem(this.STORAGE_KEY);
    if (user) {
      try {
        JSON.parse(user);
      } catch (e) {
        console.error('Error restoring user from localStorage', e);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }
}
