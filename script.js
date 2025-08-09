document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('codeGeneratorForm');
    const apiInput = document.getElementById('apiInput');
    const dissertationInput = document.getElementById('dissertationInput');
    const codeButtons = document.querySelectorAll('.code-btn');
    const outputSection = document.getElementById('outputSection');
    const generatedCode = document.getElementById('generatedCode');
    const codeType = document.getElementById('codeType');
    const copyBtn = document.getElementById('copyBtn');
    const loading = document.getElementById('loading');

    // Handle code type selection
    codeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            generateCode(type);
        });
    });

    // Generate code function
    async function generateCode(type) {
        const api = apiInput.value.trim();
        const dissertation = dissertationInput.value.trim();

        // Validation
        if (!api) {
            showError('Please enter your API information');
            apiInput.focus();
            return;
        }

        if (!dissertation) {
            showError('Please enter your dissertation');
            dissertationInput.focus();
            return;
        }

        // Show loading
        loading.style.display = 'block';
        outputSection.style.display = 'none';

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api: api,
                    dissertation: dissertation,
                    type: type
                })
            });

            const data = await response.json();

            if (data.success) {
                displayGeneratedCode(data.code, data.type);
                showSuccess('Code generated successfully!');
            } else {
                showError(data.error || 'Failed to generate code');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Network error. Please try again.');
        } finally {
            loading.style.display = 'none';
        }
    }

    // Display generated code
    function displayGeneratedCode(code, type) {
        generatedCode.textContent = code;
        
        // Set code type display
        const typeNames = {
            'telegram': 'Telegram Bot Code',
            'html': 'HTML Website Code',
            'termux': 'Termux Based Code'
        };
        
        codeType.textContent = typeNames[type] || 'Generated Code';
        
        // Show output section with animation
        outputSection.style.display = 'block';
        outputSection.scrollIntoView({ behavior: 'smooth' });
        
        // Add success animation
        outputSection.classList.add('success-animation');
        setTimeout(() => {
            outputSection.classList.remove('success-animation');
        }, 600);
    }

    // Copy code functionality
    copyBtn.addEventListener('click', function() {
        const code = generatedCode.textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(code).then(() => {
                showCopySuccess();
            }).catch(() => {
                fallbackCopyTextToClipboard(code);
            });
        } else {
            fallbackCopyTextToClipboard(code);
        }
    });

    // Fallback copy function
    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopySuccess();
            } else {
                showError('Failed to copy code');
            }
        } catch (err) {
            showError('Failed to copy code');
        }
        
        document.body.removeChild(textArea);
    }

    // Show copy success
    function showCopySuccess() {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '#667eea';
        }, 2000);
    }

    // Show error message
    function showError(message) {
        const errorDiv = createNotification(message, 'error');
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Show success message
    function showSuccess(message) {
        const successDiv = createNotification(message, 'success');
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    // Create notification element
    function createNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        if (type === 'error') {
            notification.style.background = '#dc3545';
            notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        } else if (type === 'success') {
            notification.style.background = '#28a745';
            notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        }
        
        return notification;
    }

    // Add CSS animation for notifications
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
    `;
    document.head.appendChild(style);

    // Add hover effects to buttons
    codeButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Auto-resize textareas
    function autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    apiInput.addEventListener('input', function() {
        autoResize(this);
    });

    dissertationInput.addEventListener('input', function() {
        autoResize(this);
    });

    // Add typing effect to placeholder
    const placeholders = [
        "Describe what you want your code to do...",
        "Example: Create a bot that sends daily weather updates",
        "Example: Build a website for my business portfolio",
        "Example: Make a script that monitors server status"
    ];

    let placeholderIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typePlaceholder() {
        const currentPlaceholder = placeholders[placeholderIndex];
        
        if (isDeleting) {
            dissertationInput.placeholder = currentPlaceholder.substring(0, charIndex - 1);
            charIndex--;
        } else {
            dissertationInput.placeholder = currentPlaceholder.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === currentPlaceholder.length) {
            setTimeout(() => {
                isDeleting = true;
            }, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            placeholderIndex = (placeholderIndex + 1) % placeholders.length;
        }

        const speed = isDeleting ? 50 : 100;
        setTimeout(typePlaceholder, speed);
    }

    // Start typing effect after a delay
    setTimeout(typePlaceholder, 1000);

    // Add smooth scroll for better UX
    function smoothScrollTo(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    // Console welcome message
    console.log('%c🚀 OLD-STUDIO Code Generator', 'color: #667eea; font-size: 20px; font-weight: bold;');
    console.log('%cPowered by OLD-STUDIO Technology', 'color: #764ba2; font-size: 14px;');
    console.log('%cFollow us: https://whatsapp.com/channel/0029VavHzv259PwTIz1XxJ09', 'color: #25d366; font-size: 12px;');
});

