import { endpoint } from "./main.js";
import authService from "./auth.js";

/**
 * Router Module
 * Handles application navigation, route protection, and URL management
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.protectedRoutes = new Set();
    this.adminRoutes = new Set();
    this.customerRoutes = new Set();
    this.init();
  }

  /**
   * Initialize router
   */
  init() {
    this.setupRoutes();
    this.setupEventListeners();
    this.handleInitialRoute();
  }

  /**
   * Setup application routes
   */
  setupRoutes() {
    // Public routes
    this.addRoute('/', '/index.html', false);
    this.addRoute('/login', '/src/views/login.html', false);
    this.addRoute('/register', '/src/views/register.html', false);

    // Protected routes
    this.addRoute('/dashboard', '/src/views/dashboard.html', true, 'admin');
    this.addRoute('/dashboard-customer', '/src/views/dashboardCustomer.html', true, 'customer');
    this.addRoute('/admin', '/src/views/dashboard.html', true, 'admin');
    this.addRoute('/customer', '/src/views/dashboardCustomer.html', true, 'customer');

    // API routes (for reference)
    this.addApiRoute('/api/users', `${endpoint}/users`);
    this.addApiRoute('/api/pets', `${endpoint}/pets`);
    this.addApiRoute('/api/appointments', `${endpoint}/appointments`);
  }

  /**
   * Add a route to the router
   */
  addRoute(path, filePath, isProtected = false, userType = null) {
    this.routes.set(path, {
      filePath,
      isProtected,
      userType,
      type: 'page'
    });

    if (isProtected) {
      this.protectedRoutes.add(path);
      
      if (userType === 'admin') {
        this.adminRoutes.add(path);
      } else if (userType === 'customer') {
        this.customerRoutes.add(path);
      }
    }
  }

  /**
   * Add an API route to the router
   */
  addApiRoute(path, apiUrl) {
    this.routes.set(path, {
      apiUrl,
      type: 'api'
    });
  }

  /**
   * Navigate to a route
   */
  async navigate(path, options = {}) {
    const route = this.routes.get(path);
    
    if (!route) {
      console.error(`Route not found: ${path}`);
      this.navigateTo404();
      return;
    }

    // Check if route is protected
    if (route.isProtected) {
      if (!authService.isUserAuthenticated()) {
        console.log('User not authenticated, redirecting to login');
        this.redirectToLogin();
        return;
      }

      // Check user type permissions
      if (route.userType) {
        const currentUserType = authService.getCurrentUser()?.userType;
        
        if (route.userType === 'admin' && currentUserType !== 'admin') {
          console.log('Access denied: Admin route for non-admin user');
          this.showAccessDenied();
          return;
        }
        
        if (route.userType === 'customer' && currentUserType !== 'customer') {
          console.log('Access denied: Customer route for non-customer user');
          this.showAccessDenied();
          return;
        }
      }
    }

    // Update current route
    this.currentRoute = path;

    // Navigate to the page
    if (route.type === 'page') {
      await this.loadPage(route.filePath, options);
    } else if (route.type === 'api') {
      return route.apiUrl;
    }
  }

  /**
   * Load a page
   */
  async loadPage(filePath, options = {}) {
    try {
      // Update browser history
      if (!options.replace) {
        window.history.pushState({ path: filePath }, '', filePath);
      } else {
        window.history.replaceState({ path: filePath }, '', filePath);
      }

      // Load the page content
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load page: ${response.status}`);
      }

      const html = await response.text();
      
      // Update the page content
      document.documentElement.innerHTML = html;
      
      // Re-initialize scripts
      this.reinitializeScripts();
      
      // Update page title
      this.updatePageTitle(filePath);
      
    } catch (error) {
      console.error('Error loading page:', error);
      this.navigateTo404();
    }
  }

  /**
   * Handle initial route when page loads
   */
  handleInitialRoute() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html') {
      // Check if user is already authenticated
      if (authService.isUserAuthenticated()) {
        const user = authService.getCurrentUser();
        if (user.userType === 'admin') {
          this.navigate('/dashboard', { replace: true });
        } else {
          this.navigate('/dashboard-customer', { replace: true });
        }
      }
    } else {
      // Navigate to the current path
      this.navigate(path, { replace: true });
    }
  }

  /**
   * Setup event listeners for navigation
   */
  setupEventListeners() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
      const path = window.location.pathname;
      this.navigate(path, { replace: true });
    });

    // Handle navigation links
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-route]');
      if (link) {
        event.preventDefault();
        const route = link.getAttribute('data-route');
        this.navigate(route);
      }
    });

    // Handle form submissions with route navigation
    document.addEventListener('submit', (event) => {
      const form = event.target;
      const route = form.getAttribute('data-route');
      
      if (route) {
        event.preventDefault();
        // Handle form submission and then navigate
        this.handleFormSubmission(form, route);
      }
    });
  }

  /**
   * Handle form submission with route navigation
   */
  async handleFormSubmission(form, route) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // You can add form validation here
    if (this.validateForm(form, data)) {
      // Navigate to the specified route
      await this.navigate(route);
    }
  }

  /**
   * Validate form data
   */
  validateForm(form, data) {
    // Basic form validation
    const requiredFields = form.querySelectorAll('[required]');
    
    for (const field of requiredFields) {
      if (!data[field.name]) {
        this.showNotification('Please fill in all required fields', 'error');
        return false;
      }
    }
    
    return true;
  }

  /**
   * Reinitialize scripts after page load
   */
  reinitializeScripts() {
    // Re-initialize authentication service
    if (typeof authService !== 'undefined') {
      authService.init();
    }

    // Re-initialize router
    this.setupEventListeners();
  }

  /**
   * Update page title based on route
   */
  updatePageTitle(filePath) {
    const titles = {
      '/src/views/login.html': 'Login - VetCare',
      '/src/views/register.html': 'Register - VetCare',
      '/src/views/dashboard.html': 'Admin Dashboard - VetCare',
      '/src/views/dashboardCustomer.html': 'Customer Dashboard - VetCare',
      '/index.html': 'VetCare - Veterinary Management System'
    };

    const title = titles[filePath] || 'VetCare';
    document.title = title;
  }

  /**
   * Redirect to login page
   */
  redirectToLogin() {
    window.location.href = '/src/views/login.html';
  }

  /**
   * Navigate to 404 page
   */
  navigateTo404() {
    window.location.href = '/index.html';
  }

  /**
   * Show access denied message
   */
  showAccessDenied() {
    authService.showNotification('Access denied. You do not have permission to view this page.', 'error');
    setTimeout(() => {
      if (authService.isAdmin()) {
        this.navigate('/dashboard');
      } else {
        this.navigate('/dashboard-customer');
      }
    }, 2000);
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'success') {
    authService.showNotification(message, type);
  }

  /**
   * Get current route
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Check if current route is protected
   */
  isCurrentRouteProtected() {
    return this.protectedRoutes.has(this.currentRoute);
  }

  /**
   * Get all routes
   */
  getRoutes() {
    return this.routes;
  }

  /**
   * Get protected routes
   */
  getProtectedRoutes() {
    return this.protectedRoutes;
  }

  /**
   * Get admin routes
   */
  getAdminRoutes() {
    return this.adminRoutes;
  }

  /**
   * Get customer routes
   */
  getCustomerRoutes() {
    return this.customerRoutes;
  }

  /**
   * Create navigation link
   */
  createNavLink(route, text, className = '') {
    return `<a href="#" data-route="${route}" class="${className}">${text}</a>`;
  }

  /**
   * Create protected navigation link
   */
  createProtectedNavLink(route, text, userType, className = '') {
    if (authService.isUserAuthenticated()) {
      const currentUserType = authService.getCurrentUser()?.userType;
      
      if (userType === 'admin' && currentUserType === 'admin') {
        return this.createNavLink(route, text, className);
      }
      
      if (userType === 'customer' && currentUserType === 'customer') {
        return this.createNavLink(route, text, className);
      }
    }
    
    return '';
  }

  /**
   * Update navigation menu based on user authentication
   */
  updateNavigation() {
    const navContainer = document.querySelector('[data-nav]');
    if (!navContainer) return;

    let navHTML = '';

    if (authService.isUserAuthenticated()) {
      const user = authService.getCurrentUser();
      
      if (user.userType === 'admin') {
        navHTML = `
          ${this.createNavLink('/dashboard', 'Dashboard', 'nav-link')}
          ${this.createNavLink('/logout', 'Logout', 'nav-link')}
        `;
      } else {
        navHTML = `
          ${this.createNavLink('/dashboard-customer', 'Dashboard', 'nav-link')}
          ${this.createNavLink('/logout', 'Logout', 'nav-link')}
        `;
      }
    } else {
      navHTML = `
        ${this.createNavLink('/login', 'Login', 'nav-link')}
        ${this.createNavLink('/register', 'Register', 'nav-link')}
      `;
    }

    navContainer.innerHTML = navHTML;
  }
}

// Create and export router instance
const router = new Router();
export default router; 