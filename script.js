// Sample products data - All items priced at Rs. 100
const products = [
    {
        id: 1,
        name: "Premium Digital Service",
        price: 100,
        image: "https://via.placeholder.com/300x200/333/fff?text=Digital+Service",
        description: "High-quality digital service for your needs"
    },
    {
        id: 2,
        name: "Software License",
        price: 100,
        image: "https://via.placeholder.com/300x200/444/fff?text=Software+License",
        description: "Professional software license"
    },
    {
        id: 3,
        name: "Digital Tool",
        price: 100,
        image: "https://via.placeholder.com/300x200/555/fff?text=Digital+Tool",
        description: "Essential digital tool for productivity"
    },
    {
        id: 4,
        name: "Premium Account",
        price: 100,
        image: "https://via.placeholder.com/300x200/666/fff?text=Premium+Account",
        description: "Premium account access"
    },
    {
        id: 5,
        name: "Digital Course",
        price: 100,
        image: "https://via.placeholder.com/300x200/777/fff?text=Digital+Course",
        description: "Comprehensive digital course"
    },
    {
        id: 6,
        name: "Consultation Service",
        price: 100,
        image: "https://via.placeholder.com/300x200/888/fff?text=Consultation",
        description: "Professional consultation service"
    }
];

// Cart functionality
let cart = [];
let currentSection = 'home';
let allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartCount();
    setupNavigation();
    setupCheckoutForm();
    updateOrderNotifications();
});

// Load products into the grid
function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">Rs. ${product.price}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({...product, quantity: 1});
        }
        updateCartCount();
        showNotification('Product added to cart!');
    }
}

// Remove product from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    loadCartItems();
}

// Update cart item quantity
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCartCount();
            loadCartItems();
        }
    }
}

// Update cart count in navigation
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Load cart items
function loadCartItems() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        document.getElementById('cart-total').textContent = '0';
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Rs. ${item.price} each</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" class="quantity-btn">-</button>
                <span class="quantity">${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" class="quantity-btn">+</button>
            </div>
            <div class="cart-item-total">
                Rs. ${(item.price * item.quantity)}
            </div>
            <button onclick="removeFromCart(${item.id})" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').textContent = total;
}

// Show checkout
function showCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }

    showSection('checkout');
    loadCheckoutItems();
}

// Load checkout items
function loadCheckoutItems() {
    const checkoutItems = document.getElementById('checkout-items');
    checkoutItems.innerHTML = '';

    cart.forEach(item => {
        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        checkoutItem.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>Rs. ${(item.price * item.quantity)}</span>
        `;
        checkoutItems.appendChild(checkoutItem);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkout-total').textContent = total;
    document.getElementById('checkout-price').textContent = total;
}

// Setup checkout form
function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(checkoutForm);
        const orderData = {
            transactionId: formData.get('transactionId'),
            customerName: formData.get('customerName'),
            whatsappNumber: formData.get('whatsappNumber'),
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            orderDate: new Date().toLocaleString(),
            orderId: 'ORD-' + Date.now(),
            status: 'Pending'
        };

        // Store order data
        allOrders.push(orderData);
        localStorage.setItem('allOrders', JSON.stringify(allOrders));
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        
        // Show order confirmation
        showOrderConfirmation(orderData);
        
        // Clear cart
        cart = [];
        updateCartCount();
        
        // Update admin notifications
        updateOrderNotifications();
        
        // Show admin notification
        showAdminNotification(`New order received! Order ID: ${orderData.orderId}`);
    });
}

// Show order confirmation
function showOrderConfirmation(orderData) {
    showSection('order-confirmation');
    
    const orderDetails = document.getElementById('order-details');
    orderDetails.innerHTML = `
        <div class="order-info">
            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
            <p><strong>Transaction ID:</strong> ${orderData.transactionId}</p>
            <p><strong>Customer:</strong> ${orderData.customerName}</p>
            <p><strong>WhatsApp:</strong> ${orderData.whatsappNumber}</p>
            <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
            <p><strong>Total Amount:</strong> Rs. ${orderData.total}</p>
        </div>
        <div class="order-items">
            <h4>Items Ordered:</h4>
            ${orderData.items.map(item => `
                <div class="order-item">
                    ${item.name} x ${item.quantity} - Rs. ${(item.price * item.quantity)}
                </div>
            `).join('')}
        </div>
    `;
}

// Navigation functionality
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            
            if (targetSection === 'cart') {
                loadCartItems();
            } else if (targetSection === 'admin-panel') {
                loadAdminPanel();
            }
            
            showSection(targetSection);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Show specific section
function showSection(sectionName) {
    const sections = ['home', 'products', 'cart', 'checkout', 'order-confirmation', 'contact', 'admin-panel'];
    
    sections.forEach(section => {
        const element = document.getElementById(section) || document.querySelector(`.${section}-section`);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    const targetElement = document.getElementById(sectionName) || document.querySelector(`.${sectionName}-section`);
    if (targetElement) {
        targetElement.style.display = 'block';
    }
    
    currentSection = sectionName;
}

// Admin Panel Functions
function loadAdminPanel() {
    showAllOrders();
}

function showAllOrders() {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '';
    
    if (allOrders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">No orders found</p>';
        return;
    }
    
    allOrders.reverse().forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <h4>Order ID: ${order.orderId}</h4>
                <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
            </div>
            <div class="order-details-admin">
                <p><strong>Customer:</strong> ${order.customerName}</p>
                <p><strong>WhatsApp:</strong> ${order.whatsappNumber}</p>
                <p><strong>Transaction ID:</strong> ${order.transactionId}</p>
                <p><strong>Date:</strong> ${order.orderDate}</p>
                <p><strong>Total:</strong> Rs. ${order.total}</p>
            </div>
            <div class="order-items-admin">
                <h5>Items:</h5>
                ${order.items.map(item => `
                    <div class="item-detail">
                        ${item.name} x ${item.quantity} = Rs. ${item.price * item.quantity}
                    </div>
                `).join('')}
            </div>
            <div class="order-actions">
                <button onclick="updateOrderStatus('${order.orderId}', 'Completed')" class="status-btn complete">Mark Complete</button>
                <button onclick="updateOrderStatus('${order.orderId}', 'Cancelled')" class="status-btn cancel">Cancel Order</button>
                <a href="https://wa.me/${order.whatsappNumber.replace(/[^0-9]/g, '')}" target="_blank" class="whatsapp-btn">
                    <i class="fab fa-whatsapp"></i> Contact Customer
                </a>
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

function updateOrderStatus(orderId, newStatus) {
    const orderIndex = allOrders.findIndex(order => order.orderId === orderId);
    if (orderIndex !== -1) {
        allOrders[orderIndex].status = newStatus;
        localStorage.setItem('allOrders', JSON.stringify(allOrders));
        showAllOrders();
        showNotification(`Order ${orderId} status updated to ${newStatus}`);
    }
}

function clearAllOrders() {
    if (confirm('Are you sure you want to clear all orders? This action cannot be undone.')) {
        allOrders = [];
        localStorage.setItem('allOrders', JSON.stringify(allOrders));
        showAllOrders();
        updateOrderNotifications();
        showNotification('All orders cleared');
    }
}

function updateOrderNotifications() {
    const pendingOrders = allOrders.filter(order => order.status === 'Pending').length;
    const adminLink = document.querySelector('.admin-link');
    
    if (pendingOrders > 0) {
        adminLink.innerHTML = `Admin <span class="notification-badge">${pendingOrders}</span>`;
    } else {
        adminLink.innerHTML = 'Admin';
    }
}

function showAdminNotification(message) {
    // Create admin notification
    const notification = document.createElement('div');
    notification.className = 'admin-notification';
    notification.innerHTML = `
        <i class="fas fa-bell"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="close-notification">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto hide after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 10000);
}

// Go back to home
function goHome() {
    showSection('home');
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector('a[href="#home"]').classList.add('active');
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Admin functions (for future use)
function addProduct(productData) {
    const newId = Math.max(...products.map(p => p.id)) + 1;
    products.push({...productData, id: newId});
    loadProducts();
}

function editProduct(productId, newData) {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        products[productIndex] = {...products[productIndex], ...newData};
        loadProducts();
    }
}

function deleteProduct(productId) {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        products.splice(productIndex, 1);
        loadProducts();
    }
}

