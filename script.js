document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phoneNumber');
    const checkButton = document.getElementById('checkDatabase');
    const resultSection = document.getElementById('resultSection');
    const loading = document.getElementById('loading');
    const resultContent = document.getElementById('resultContent');
    const errorContent = document.getElementById('errorContent');

    // Input validation and formatting
    phoneInput.addEventListener('input', function(e) {
        // Remove non-numeric characters
        let value = e.target.value.replace(/\D/g, '');
        
        // Limit to 15 digits (international phone number standard)
        if (value.length > 15) {
            value = value.substring(0, 15);
        }
        
        e.target.value = value;
    });

    // Handle Enter key press
    phoneInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkDatabase();
        }
    });

    // Button click handler
    checkButton.addEventListener('click', checkDatabase);

    function checkDatabase() {
        const phoneNumber = phoneInput.value.trim();
        
        // Validation
        if (!phoneNumber) {
            showError('Please enter a phone number.');
            return;
        }
        
        if (phoneNumber.length < 10) {
            showError('Please enter a valid phone number (at least 10 digits).');
            return;
        }

        // Show loading state
        showLoading();
        
        // Disable button during request
        checkButton.disabled = true;
        checkButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SEARCHING...';

        // Make API request
        fetch(`https://legendxdata.site/Api/simdata.php?phone=${phoneNumber}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                displayResults(data);
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Failed to fetch data. Please check your internet connection and try again.');
            })
            .finally(() => {
                // Re-enable button
                checkButton.disabled = false;
                checkButton.innerHTML = '<i class="fas fa-search"></i> CHECK DATABASE';
            });
    }

    function showLoading() {
        resultSection.style.display = 'block';
        loading.style.display = 'block';
        resultContent.style.display = 'none';
        errorContent.style.display = 'none';
    }

    function displayResults(data) {
        loading.style.display = 'none';
        
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            // Display successful results
            document.getElementById('mobile').textContent = data.Mobile || 'N/A';
            document.getElementById('name').textContent = data.Name || 'N/A';
            document.getElementById('cnic').textContent = data.CNIC || 'N/A';
            document.getElementById('address').textContent = data.Address || 'N/A';
            document.getElementById('operator').textContent = data.Operator || 'N/A';
            
            resultContent.style.display = 'block';
            errorContent.style.display = 'none';
        } else {
            showError('No data found for this phone number.');
        }
    }

    function showError(message) {
        resultSection.style.display = 'block';
        loading.style.display = 'none';
        resultContent.style.display = 'none';
        errorContent.style.display = 'block';
        document.getElementById('errorMessage').textContent = message;
    }

    // Add some visual feedback for button interactions
    checkButton.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(1px)';
    });

    checkButton.addEventListener('mouseup', function() {
        this.style.transform = 'translateY(-2px)';
    });

    checkButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(-2px)';
    });
});

