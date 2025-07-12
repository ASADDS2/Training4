import authService from "./auth.js";
import router from "./router.js";

// Function to toggle password visibility - make it globally available
window.togglePassword = function() {
  authService.togglePasswordVisibility('password', '.toggle-password i');
}

// Handle login form
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('remember').checked;
      
      // Basic validations
      if (!email || !password) {
        authService.showNotification('Please complete all fields', 'error');
        return;
      }
      
      // Validate email format
      if (!authService.validateEmail(email)) {
        authService.showNotification('Please enter a valid email', 'error');
        return;
      }
      
      try {
        // Attempt login using auth service
        const result = await authService.login(email, password, rememberMe);
        
        if (result.success) {
          authService.showNotification(result.message, 'success');
          
          // Redirect to appropriate dashboard after a brief delay
          setTimeout(() => {
            authService.redirectToDashboard();
          }, 1000);
          
        } else {
          authService.showNotification(result.message, 'error');
        }
        
      } catch (error) {
        console.error('Login error:', error);
        authService.showNotification('Login error. Please try again.', 'error');
      }
    });
  } else {
    console.error('Login form not found');
  }
});
