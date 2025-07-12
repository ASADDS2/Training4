import { endpoint } from "./main.js";

/**
 * Authentication Module
 * Handles user authentication, session management, and user validation
 */

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.init();
  }

  /**
   * Initialize authentication service
   */
  init() {
    this.checkSession();
    this.setupEventListeners();
  }

  /**
   * Check if user has an active session
   */
  checkSession() {
    const userData = localStorage.getItem('vetcare_user');
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
        this.isAuthenticated = true;
        return true;
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.logout();
        return false;
      }
    }
    return false;
  }

  /**
   * Get current user data
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  /**
   * Check if current user is admin
   */
  isAdmin() {
    return this.currentUser && this.currentUser.userType === 'admin';
  }

  /**
   * Check if current user is customer
   */
  isCustomer() {
    return this.currentUser && this.currentUser.userType === 'customer';
  }

  /**
   * Validate user credentials against database
   */
  async validateCredentials(email, password) {
    try {
      const response = await fetch(`${endpoint}/users?email=${email}`);
      const users = await response.json();
      
      if (users.length === 0) {
        return null;
      }
      
      const user = users[0];
      
      if (user.password === password) {
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Error validating credentials:', error);
      return null;
    }
  }

  /**
   * Check if user is admin (hardcoded for demo)
   */
  isAdminUser(email, password) {
    const adminCredentials = [
      { email: 'admin@vetcare.com', password: 'admin123' },
      { email: 'administrador@vetcare.com', password: 'admin123' },
      { email: 'vet@vetcare.com', password: 'vet123' }
    ];
    
    return adminCredentials.some(admin => 
      admin.email.toLowerCase() === email.toLowerCase() && 
      admin.password === password
    );
  }

  /**
   * Login user
   */
  async login(email, password, rememberMe = false) {
    try {
      // Check if it's a hardcoded admin
      const isAdminUser = this.isAdminUser(email, password);
      
      if (isAdminUser) {
        const userData = {
          email: email,
          firstName: 'Administrator',
          lastName: 'VetCare',
          phone: '',
          userType: 'admin',
          loginTime: new Date().toISOString()
        };
        
        this.setSession(userData, rememberMe);
        return { success: true, user: userData, message: 'Welcome Administrator!' };
      }

      // Check database for regular users
      const user = await this.validateCredentials(email, password);
      
      if (user) {
        const userData = {
          ...user,
          loginTime: new Date().toISOString()
        };
        
        this.setSession(userData, rememberMe);
        return { success: true, user: userData, message: 'Welcome to VetCare!' };
      }
      
      return { success: false, message: 'Invalid credentials. Please check your email and password.' };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login error. Please try again.' };
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      // Check if email already exists
      const emailExists = await this.checkEmailExists(userData.email);
      if (emailExists) {
        return { success: false, message: 'This email is already registered.' };
      }

      // Add registration date
      const newUser = {
        ...userData,
        userType: 'customer',
        registrationDate: new Date().toISOString()
      };

      // Save to database
      const response = await fetch(`${endpoint}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        const savedUser = await response.json();
        this.setSession(savedUser, false);
        return { success: true, user: savedUser, message: 'Registration successful!' };
      } else {
        throw new Error('Error saving user');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration error. Please try again.' };
    }
  }

  /**
   * Check if email exists in database
   */
  async checkEmailExists(email) {
    try {
      const response = await fetch(`${endpoint}/users?email=${email}`);
      const users = await response.json();
      return users.length > 0;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  /**
   * Set user session
   */
  setSession(userData, rememberMe = false) {
    this.currentUser = userData;
    this.isAuthenticated = true;
    
    localStorage.setItem('vetcare_user', JSON.stringify(userData));
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userName', userData.firstName);
    localStorage.setItem('userType', userData.userType);
    
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    
    localStorage.removeItem('vetcare_user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userType');
    localStorage.removeItem('rememberMe');
  }

  /**
   * Redirect user to appropriate dashboard
   */
  redirectToDashboard() {
    if (this.isAdmin()) {
      window.location.href = '/src/views/dashboard.html';
    } else {
      window.location.href = '/src/views/dashboardCustomer.html';
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
      notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
      notification.style.backgroundColor = '#dc3545';
    } else {
      notification.style.backgroundColor = '#007bff';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Setup event listeners for authentication
   */
  setupEventListeners() {
    // Logout button event listener
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
          this.logout();
          this.showNotification('Session closed successfully', 'success');
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 1000);
        }
      });
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  validatePassword(password) {
    return password.length >= 6;
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(inputId, toggleBtnSelector) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = document.querySelector(toggleBtnSelector);
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleBtn.className = 'fas fa-eye-slash';
    } else {
      passwordInput.type = 'password';
      toggleBtn.className = 'fas fa-eye';
    }
  }
}

// Create and export auth service instance
const authService = new AuthService();
export default authService; 