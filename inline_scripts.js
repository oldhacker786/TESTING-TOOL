
        // Comprehensive color palette
        const colors = [
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#800000', '#008000',
            '#000080', '#808000', '#800080', '#008080', '#C0C0C0', '#808080', '#FFA500', '#FFC0CB',
            '#FFD700', '#4B0082', '#EE82EE', '#A52A2A', '#B22222', '#DC143C', '#FF4500', '#FF6347',
            '#FF7F50', '#228B22', '#32CD32', '#00FF7F', '#20B2AA', '#00CED1', '#1E90FF', '#4169E1',
            '#6A5ACD', '#7B68EE', '#9932CC', '#9400D3', '#BA55D3', '#FF69B4', '#FFB6C1', '#FFE4E1',
            '#F0E68C', '#E6E6FA', '#FFF0F5', '#F5F5DC', '#D3D3D3', '#ADD8E6', '#B0E0E6', '#87CEEB',
            '#4682B4', '#191970', '#6c5ce7', '#2d3436', '#F5F5F5', '#FFE4C4', '#DEB887', '#D2B48C',
            '#BC8F8F', '#F4A460', '#DAA520', '#B8860B', '#CD853F', '#D2691E', '#8B4513', '#A0522D',
            '#A9A9A9', '#708090', '#2F4F4F', '#556B2F', '#6B8E23', '#9ACD32', '#90EE90', '#98FB98',
            '#3CB371', '#2E8B57', '#66CDAA', '#5F9EA0', '#7FFFD4', '#40E0D0', '#00FA9A', '#48D1CC',
            '#20B2AA', '#87CEFA', '#B0C4DE', '#6495ED', '#483D8B', '#6A5ACD', '#7B68EE', '#9370DB',
            '#8A2BE2', '#4B0082', '#9400D3', '#9932CC', '#BA55D3', '#C71585', '#DB7093', '#FF1493'
        ];

        // Populate color palettes
        function populateColorPalette(paletteId, inputId, previewId) {
            const palette = document.getElementById(paletteId);
            const input = document.getElementById(inputId);
            const preview = document.getElementById(previewId);
            colors.forEach(color => {
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = color;
                swatch.addEventListener('click', () => {
                    input.value = color;
                    preview.style.backgroundColor = color;
                    palette.classList.remove('show');
                });
                palette.appendChild(swatch);
            });
            // Update preview on input change
            if (input.value) {
                preview.style.backgroundColor = input.value;
            }
        }

        // Initialize palettes
        populateColorPalette('toolbarColorPalette', 'toolbarColor', 'toolbarColorPreview');
        populateColorPalette('toolbarTitleColorPalette', 'toolbarTitleColor', 'toolbarTitleColorPreview');

        // Toggle color palette visibility on input click
        document.querySelectorAll('.color-input input').forEach(input => {
            input.addEventListener('click', () => {
                const paletteId = input.id + 'Palette';
                const palette = document.getElementById(paletteId);
                document.querySelectorAll('.color-palette').forEach(p => {
                    if (p !== palette) p.classList.remove('show');
                });
                palette.classList.toggle('show');
            });
        });

        // Handle image uploads to ImgBB
        async function uploadImage(fileInput, urlInput, previewImg) {
            const file = fileInput.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('image', file);
            formData.append('key', '274910e7dcf1794b3cdcce6956bc00b3');

            try {
                document.getElementById('loader').style.display = 'block';
                const response = await fetch('https://api.imgbb.com/1/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    urlInput.value = data.data.url;
                    previewImg.src = data.data.url;
                    previewImg.style.display = 'block';
                } else {
                    alert('Image upload failed: ' + (data.error.message || 'Unknown error'));
                }
            } catch (error) {
                alert('Error uploading image: ' + error.message);
            } finally {
                document.getElementById('loader').style.display = 'none';
            }
        }

        // Attach event listeners for image uploads
        document.getElementById('appIconFile').addEventListener('change', () => {
            uploadImage(
                document.getElementById('appIconFile'),
                document.getElementById('appIcon'),
                document.getElementById('appIconPreview')
            );
        });

        document.getElementById('splashIconFile').addEventListener('change', () => {
            uploadImage(
                document.getElementById('splashIconFile'),
                document.getElementById('splashIcon'),
                document.getElementById('splashIconPreview')
            );
        });

        // Handle form submission to show loader
        document.getElementById('apkForm').addEventListener('submit', function() {
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('loader').style.display = 'block';
            document.querySelector('.result-section')?.classList.remove('show');
            document.querySelector('.error-section')?.classList.remove('show');
        });

        // If loading is true (postback with long API call), keep loader active
            