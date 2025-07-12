import authService from "./auth.js";
import router from "./router.js";

// Function to toggle password visibility - make it globally available
window.togglePassword = function() {
  authService.togglePasswordVisibility('password', '.toggle-password i');
}

// Function to toggle confirm password visibility - make it globally available
window.toggleConfirmPassword = function() {
  authService.togglePasswordVisibility('confirmPassword', '.toggle-password:last-of-type i');
}

// Handle registration form
document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const terms = document.getElementById('terms').checked;
      
      // Basic validations
      if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
        authService.showNotification('Please complete all fields', 'error');
        return;
      }
      
      if (password !== confirmPassword) {
        authService.showNotification('Passwords do not match', 'error');
        return;
      }
      
      if (!authService.validatePassword(password)) {
        authService.showNotification('Password must be at least 6 characters long', 'error');
        return;
      }
      
      if (!terms) {
        authService.showNotification('You must accept the terms and conditions', 'error');
        return;
      }
      
      // Validate email format
      if (!authService.validateEmail(email)) {
        authService.showNotification('Please enter a valid email', 'error');
        return;
      }
      
      try {
        // Create user data object
        const userData = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          password: password
        };
        
        // Register user using auth service
        const result = await authService.register(userData);
        
        if (result.success) {
          authService.showNotification(result.message, 'success');
          
          // Redirect to login after a brief delay
          setTimeout(() => {
            window.location.href = '/src/views/login.html';
          }, 2000);
          
        } else {
          authService.showNotification(result.message, 'error');
        }
        
      } catch (error) {
        console.error('Registration error:', error);
        authService.showNotification('Registration error. Please try again.', 'error');
      }
    });
  } else {
    console.error('Register form not found');
  }
});
