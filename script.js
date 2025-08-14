// Global variables
let currentSection = 'verification';

// API endpoints
const API_ENDPOINTS = {
    VERIFY_NUMBER: 'https://oopk.online/2025/',
    ACTIVATE_PACKAGE: 'https://oopk.online/2025/activex.php'
};

// Utility functions
function showLoading() {
    document.getElementById('loading-overlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('show');
}

function showMessage(message, type = 'success') {
    const container = document.getElementById('message-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    container.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

function validateMobileNumber(number) {
    // Pakistani mobile number validation (11 digits starting with 03)
    const regex = /^03[0-9]{9}$/;
    return regex.test(number);
}

function validateMSISDN(number) {
    // MSISDN validation (11 digits starting with 0300)
    const regex = /^0300[0-9]{7}$/;
    return regex.test(number);
}

// Section navigation functions
function showVerificationSection() {
    document.getElementById('verification-section').classList.add('active');
    document.getElementById('offer-section').classList.remove('active');
    currentSection = 'verification';
    
    // Update header title
    document.querySelector('.site-title').textContent = 'Chaval System';
}

function showOfferSection() {
    document.getElementById('verification-section').classList.remove('active');
    document.getElementById('offer-section').classList.add('active');
    currentSection = 'offer';
    
    // Update header title
    document.querySelector('.site-title').textContent = 'Jazz Offer Activation';
}

function goBack() {
    if (currentSection === 'offer') {
        showVerificationSection();
    } else {
        // Could implement browser back or close functionality
        window.history.back();
    }
}

function refreshPage() {
    location.reload();
}

// API functions
async function generateOTP() {
    const mobileInput = document.getElementById('mobile-number');
    const mobileNumber = mobileInput.value.trim();
    
    // Validate input
    if (!mobileNumber) {
        showMessage('Please enter a mobile number', 'error');
        mobileInput.focus();
        return;
    }
    
    if (!validateMobileNumber(mobileNumber)) {
        showMessage('Please enter a valid Pakistani mobile number (03XXXXXXXXX)', 'error');
        mobileInput.focus();
        return;
    }
    
    showLoading();
    
    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('mobile_number', mobileNumber);
        formData.append('action', 'generate_otp');
        
        const response = await fetch(API_ENDPOINTS.VERIFY_NUMBER, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showMessage('OTP sent successfully to ' + mobileNumber, 'success');
            
            // Optionally show OTP input field or redirect
            setTimeout(() => {
                showOfferSection();
            }, 2000);
        } else {
            showMessage(data.message || 'Failed to generate OTP. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error generating OTP:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function activateOffer() {
    const msisdnInput = document.getElementById('msisdn');
    const msisdn = msisdnInput.value.trim();
    const selectedOffer = document.querySelector('input[name="offer"]:checked');
    
    // Validate inputs
    if (!msisdn) {
        showMessage('Please enter MSISDN', 'error');
        msisdnInput.focus();
        return;
    }
    
    if (!validateMSISDN(msisdn)) {
        showMessage('Please enter a valid MSISDN (0300XXXXXXX)', 'error');
        msisdnInput.focus();
        return;
    }
    
    if (!selectedOffer) {
        showMessage('Please select an offer', 'error');
        return;
    }
    
    showLoading();
    
    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('msisdn', msisdn);
        formData.append('offer_type', selectedOffer.value);
        formData.append('action', 'activate_offer');
        
        const response = await fetch(API_ENDPOINTS.ACTIVATE_PACKAGE, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showMessage(`${selectedOffer.value.replace('-', ' ')} activated successfully for ${msisdn}`, 'success');
            
            // Reset form
            msisdnInput.value = '';
            document.querySelector('input[name="offer"][value="100-day-call"]').checked = true;
        } else {
            showMessage(data.message || 'Failed to activate offer. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error activating offer:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Input formatting and validation
function formatMobileNumber(input) {
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    input.value = value;
}

function formatMSISDN(input) {
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    input.value = value;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Mobile number input formatting
    const mobileInput = document.getElementById('mobile-number');
    if (mobileInput) {
        mobileInput.addEventListener('input', function() {
            formatMobileNumber(this);
        });
        
        mobileInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                generateOTP();
            }
        });
    }
    
    // MSISDN input formatting
    const msisdnInput = document.getElementById('msisdn');
    if (msisdnInput) {
        msisdnInput.addEventListener('input', function() {
            formatMSISDN(this);
        });
        
        msisdnInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                activateOffer();
            }
        });
    }
    
    // Radio button change events
    const radioButtons = document.querySelectorAll('input[name="offer"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            // Add any specific logic for offer selection if needed
            console.log('Selected offer:', this.value);
        });
    });
    
    // Prevent form submission on Enter key in inputs
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            e.preventDefault();
        }
    });
    
    // Close messages when clicked
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('message')) {
            e.target.remove();
        }
    });
});

// Handle browser back button
window.addEventListener('popstate', function(e) {
    if (currentSection === 'offer') {
        showVerificationSection();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC key to go back
    if (e.key === 'Escape') {
        goBack();
    }
    
    // F5 or Ctrl+R to refresh
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        refreshPage();
    }
});

// Touch and gesture support for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
    if (!touchStartX || !touchStartY) {
        return;
    }
    
    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;
    
    let diffX = touchStartX - touchEndX;
    let diffY = touchStartY - touchEndY;
    
    // Swipe right to go back (only if horizontal swipe is dominant)
    if (Math.abs(diffX) > Math.abs(diffY) && diffX < -50 && currentSection === 'offer') {
        showVerificationSection();
    }
    
    // Reset values
    touchStartX = 0;
    touchStartY = 0;
});

// Export functions for global access
window.generateOTP = generateOTP;
window.activateOffer = activateOffer;
window.showVerificationSection = showVerificationSection;
window.showOfferSection = showOfferSection;
window.goBack = goBack;
window.refreshPage = refreshPage;

