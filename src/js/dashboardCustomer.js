// Import the endpoint constant from main.js and auth service
import { endpoint } from './main.js';
import authService from './auth.js';
import router from './router.js';

// DOM variables
const btnLogout = document.getElementById('btnLogout');
const productsGrid = document.getElementById('productsGrid');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const subtotal = document.getElementById('subtotal');
const total = document.getElementById('total');
const searchProducts = document.getElementById('searchProducts');
const categoryFilter = document.getElementById('categoryFilter');

let products = [];
let cart = [];

// Initialize the store
document.addEventListener('DOMContentLoaded', function() {
  loadProducts();
  loadCart();
  updateUserInfo();
});

// Load products from API
async function loadProducts() {
  try {
    const response = await fetch(`${endpoint}/products`);
    if (!response.ok) throw new Error('Error loading products');
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error('Error loading products:', error);
    authService.showNotification('Error loading products', 'error');
  }
}

// Render products in the grid
function renderProducts() {
  if (!productsGrid) return;
  
  productsGrid.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <div class="product-info">
        <h4>${product.name}</h4>
        <p>${product.description}</p>
        <div class="product-price">
          <span class="price">$${product.price}</span>
          <span class="stock">Stock: ${product.stock}</span>
        </div>
        <button class="btn btn-primary" onclick="openProductModal(${product.id})">
          <i class="fas fa-eye"></i>
          View Details
        </button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// Filter products
function filterProducts() {
  const searchTerm = searchProducts.value.toLowerCase();
  const selectedCategory = categoryFilter.value;
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                         product.description.toLowerCase().includes(searchTerm);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  renderFilteredProducts(filteredProducts);
}

// Render filtered products
function renderFilteredProducts(filteredProducts) {
  if (!productsGrid) return;
  
  productsGrid.innerHTML = '';
  filteredProducts.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <div class="product-info">
        <h4>${product.name}</h4>
        <p>${product.description}</p>
        <div class="product-price">
          <span class="price">$${product.price}</span>
          <span class="stock">Stock: ${product.stock}</span>
        </div>
        <button class="btn btn-primary" onclick="openProductModal(${product.id})">
          <i class="fas fa-eye"></i>
          View Details
        </button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// Open product modal
function openProductModal(productId) {
  const product = products.find(p => p.id == productId);
  if (!product) return;
  
  document.getElementById('modalProductName').textContent = product.name;
  document.getElementById('modalProductImage').src = product.image;
  document.getElementById('modalProductDescription').textContent = product.description;
  document.getElementById('modalProductPrice').textContent = `$${product.price}`;
  document.getElementById('productQuantity').value = 1;
  
  // Store current product for add to cart
  window.currentProduct = product;
  
  document.getElementById('productModal').style.display = 'block';
}

// Close product modal
function closeProductModal() {
  document.getElementById('productModal').style.display = 'none';
  window.currentProduct = null;
}

// Add to cart
function addToCart() {
  if (!window.currentProduct) return;
  
  const quantity = parseInt(document.getElementById('productQuantity').value);
  const product = window.currentProduct;
  
  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: quantity,
    image: product.image
  };
  
  // Check if item already in cart
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push(cartItem);
  }
  
  saveCart();
  updateCartDisplay();
  closeProductModal();
  
  authService.showNotification('Product added to cart', 'success');
}

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem('vetcare_cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  updateCartDisplay();
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('vetcare_cart', JSON.stringify(cart));
}

// Update cart display
function updateCartDisplay() {
  if (cartCount) {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  }
  
  if (cartItems) {
    renderCartItems();
  }
  
  updateCartSummary();
}

// Render cart items
function renderCartItems() {
  cartItems.innerHTML = '';
  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-info">
        <h5>${item.name}</h5>
        <p>$${item.price} x ${item.quantity}</p>
      </div>
      <div class="cart-item-actions">
        <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
        <button onclick="removeFromCart(${item.id})" class="btn-remove">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    cartItems.appendChild(cartItem);
  });
}

// Update cart item quantity
function updateCartItemQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity = newQuantity;
    saveCart();
    updateCartDisplay();
  }
}

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartDisplay();
  authService.showNotification('Item removed from cart', 'success');
}

// Update cart summary
function updateCartSummary() {
  const subtotalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotalAmount > 0 ? 5.00 : 0;
  const totalAmount = subtotalAmount + shipping;
  
  if (subtotal) subtotal.textContent = `$${subtotalAmount.toFixed(2)}`;
  if (total) total.textContent = `$${totalAmount.toFixed(2)}`;
}

// Show tab content
function showTab(tabName) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(tab => tab.classList.remove('active'));
  
  // Remove active class from all tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  
  // Show selected tab content
  const selectedTab = document.getElementById(tabName + 'Tab');
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Add active class to clicked button
  event.target.classList.add('active');
}

// Toggle cart
function toggleCart() {
  showTab('cart');
}

// Checkout function
function checkout() {
  if (cart.length === 0) {
    authService.showNotification('Your cart is empty', 'error');
    return;
  }
  
  document.getElementById('checkoutModal').style.display = 'block';
}

// Close checkout modal
function closeCheckoutModal() {
  document.getElementById('checkoutModal').style.display = 'none';
}

// Complete order
function completeOrder() {
  // Here you would typically send the order to the server
  // For now, we'll just clear the cart and show a success message
  
  cart = [];
  saveCart();
  updateCartDisplay();
  closeCheckoutModal();
  
  authService.showNotification('Order completed successfully!', 'success');
}

// Update user information
function updateUserInfo() {
  const user = authService.getCurrentUser();
  if (user) {
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
      userNameElement.textContent = user.firstName || 'Customer';
    }
    
    const profileNameElement = document.getElementById('profileName');
    if (profileNameElement) {
      profileNameElement.textContent = `${user.firstName} ${user.lastName}`;
    }
    
    const profileEmailElement = document.getElementById('profileEmail');
    if (profileEmailElement) {
      profileEmailElement.textContent = user.email;
    }
    
    const profilePhoneElement = document.getElementById('profilePhone');
    if (profilePhoneElement) {
      profilePhoneElement.textContent = user.phone || 'No phone';
    }
  }
}

// Quantity controls
function increaseQuantity() {
  const quantityInput = document.getElementById('productQuantity');
  quantityInput.value = parseInt(quantityInput.value) + 1;
}

function decreaseQuantity() {
  const quantityInput = document.getElementById('productQuantity');
  const newValue = parseInt(quantityInput.value) - 1;
  if (newValue >= 1) {
    quantityInput.value = newValue;
  }
}

// Make functions globally available
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.addToCart = addToCart;
window.showTab = showTab;
window.toggleCart = toggleCart;
window.checkout = checkout;
window.closeCheckoutModal = closeCheckoutModal;
window.completeOrder = completeOrder;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.filterProducts = filterProducts;

// Close modals when clicking outside
window.addEventListener('click', (e) => {
  const productModal = document.getElementById('productModal');
  const checkoutModal = document.getElementById('checkoutModal');
  
  if (e.target === productModal) {
    closeProductModal();
  }
  if (e.target === checkoutModal) {
    closeCheckoutModal();
  }
}); 