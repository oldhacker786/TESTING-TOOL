// Sample products data
const products = [
    {
        id: 1,
        name: "Premium Digital Service",
        price: 29.99,
        image: "https://via.placeholder.com/300x200/333/fff?text=Digital+Service",
        description: "High-quality digital service for your needs"
    },
    {
        id: 2,
        name: "Software License",
        price: 49.99,
        image: "https://via.placeholder.com/300x200/444/fff?text=Software+License",
        description: "Professional software license"
    },
    {
        id: 3,
        name: "Digital Tool",
        price: 19.99,
        image: "https://via.placeholder.com/300x200/555/fff?text=Digital+Tool",
        description: "Essential digital tool for productivity"
    },
    {
        id: 4,
        name: "Premium Account",
        price: 39.99,
        image: "https://via.placeholder.com/300x200/666/fff?text=Premium+Account",
        description: "Premium account access"
    },
    {
        id: 5,
        name: "Digital Course",
        price: 59.99,
        image: "https://via.placeholder.com/300x200/777/fff?text=Digital+Course",
        description: "Comprehensive digital course"
    },
    {
        id: 6,
        name: "Consultation Service",
        price: 79.99,
        image: "https://via.placeholder.com/300x200/888/fff?text=Consultation",
        description: "Professional consultation service"
    }
];

// Cart functionality
let cart = [];
let currentSection = 'home';

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartCount();
    setupNavigation();
    setupCheckoutForm();
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
                <div class="product-price">$${product.price.toFixed(2)}</div>
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
        document.getElementById('cart-total').textContent = '0.00';
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} each</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" class="quantity-btn">-</button>
                <span class="quantity">${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" class="quantity-btn">+</button>
            </div>
            <div class="cart-item-total">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
            <button onclick="removeFromCart(${item.id})" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').textContent = total.toFixed(2);
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
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        checkoutItems.appendChild(checkoutItem);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('checkout-total').textContent = total.toFixed(2);
}

// Setup checkout form
function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(checkoutForm);
        const orderData = {
            customerName: formData.get('customerName'),
            whatsappNumber: formData.get('whatsappNumber'),
            orderDescription: formData.get('orderDescription'),
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            orderDate: new Date().toLocaleString(),
            orderId: 'ORD-' + Date.now()
        };

        // Store order data (in real app, this would be sent to server)
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        
        // Show order confirmation
        showOrderConfirmation(orderData);
        
        // Clear cart
        cart = [];
        updateCartCount();
    });
}

// Show order confirmation
function showOrderConfirmation(orderData) {
    showSection('order-confirmation');
    
    const orderDetails = document.getElementById('order-details');
    orderDetails.innerHTML = `
        <div class="order-info">
            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
            <p><strong>Customer:</strong> ${orderData.customerName}</p>
            <p><strong>WhatsApp:</strong> ${orderData.whatsappNumber}</p>
            <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
            <p><strong>Total Amount:</strong> $${orderData.total.toFixed(2)}</p>
        </div>
        <div class="order-items">
            <h4>Items Ordered:</h4>
            ${orderData.items.map(item => `
                <div class="order-item">
                    ${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}
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
    const sections = ['home', 'products', 'cart', 'checkout', 'order-confirmation', 'contact'];
    
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
            document.body.removeChild(notification);
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

