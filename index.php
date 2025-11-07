<?php
// Free Web Hosting - HTML, CSS, JS Only
session_start();

// Handle file upload with custom URL
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Single file upload
    if (isset($_FILES['html_file']) && !empty($_FILES['html_file']['name'])) {
        $file = $_FILES['html_file'];
        $custom_url = trim($_POST['custom_url']) ?: generateCustomUrl($file['name']);
        
        if ($file['error'] === UPLOAD_ERR_OK) {
            $file_name = $file['name'];
            $file_tmp = $file['tmp_name'];
            $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            
            // Allowed file types - ONLY HTML, CSS, JS, ZIP
            $allowed_types = ['html', 'htm', 'css', 'js', 'zip'];
            
            if (in_array($file_ext, $allowed_types)) {
                if (!is_dir('sites')) {
                    mkdir('sites', 0777, true);
                }
                
                // Clean custom URL
                $custom_url = cleanCustomUrl($custom_url);
                
                if ($file_ext === 'zip') {
                    // Handle ZIP file upload
                    $result = handleZipUpload($file_tmp, $custom_url);
                    if ($result['success']) {
                        $website_url = getWebsiteUrl($custom_url);
                        $_SESSION['success'] = "ZIP file extracted successfully! " . $result['message'];
                        $_SESSION['file_url'] = $website_url;
                        $_SESSION['file_name'] = $file_name;
                    } else {
                        $_SESSION['error'] = $result['message'];
                    }
                } else {
                    // Handle single file upload
                    $file_path = 'sites/' . $custom_url . '.' . $file_ext;
                    
                    // Check if URL already exists
                    if (file_exists($file_path)) {
                        $_SESSION['error'] = "This URL is already taken. Please choose a different one.";
                    } else {
                        if (move_uploaded_file($file_tmp, $file_path)) {
                            $website_url = getWebsiteUrl($custom_url);
                            $_SESSION['success'] = "File uploaded successfully!";
                            $_SESSION['file_url'] = $website_url;
                            $_SESSION['file_name'] = $file_name;
                        } else {
                            $_SESSION['error'] = "Error uploading file. Check folder permissions.";
                        }
                    }
                }
            } else {
                $_SESSION['error'] = "Only HTML, CSS, JavaScript, and ZIP files are allowed.";
            }
        } else {
            $_SESSION['error'] = "File upload error. Please try again. Error code: " . $file['error'];
        }
    }
    
    // Code editor upload
    elseif (isset($_POST['html_code'])) {
        $html_code = $_POST['html_code'];
        $custom_url = trim($_POST['code_custom_url']) ?: generateCustomUrl('my-website');
        
        if (!empty($html_code)) {
            if (!is_dir('sites')) {
                mkdir('sites', 0777, true);
            }
            
            $custom_url = cleanCustomUrl($custom_url);
            $file_path = 'sites/' . $custom_url . '.html';
            
            // Check if URL already exists
            if (file_exists($file_path)) {
                $_SESSION['error'] = "This URL is already taken. Please choose a different one.";
            } else {
                if (file_put_contents($file_path, $html_code)) {
                    $website_url = getWebsiteUrl($custom_url);
                    $_SESSION['success'] = "Website created successfully!";
                    $_SESSION['file_url'] = $website_url;
                    $_SESSION['file_name'] = $custom_url . '.html';
                } else {
                    $_SESSION['error'] = "Error creating file. Check folder permissions.";
                }
            }
        } else {
            $_SESSION['error'] = "Please enter HTML code.";
        }
    }
    
    header("Location: index.php");
    exit;
}

// Handle ZIP file upload and extraction
function handleZipUpload($zip_tmp, $custom_url) {
    if (!class_exists('ZipArchive')) {
        return ['success' => false, 'message' => 'ZIP extraction not supported on this server.'];
    }
    
    $zip = new ZipArchive();
    $result = ['success' => false, 'message' => ''];
    
    if ($zip->open($zip_tmp) === TRUE) {
        $extract_path = 'sites/' . $custom_url;
        
        // Create directory for extracted files
        if (!is_dir($extract_path)) {
            mkdir($extract_path, 0777, true);
        }
        
        $allowed_extensions = ['html', 'htm', 'css', 'js', 'txt'];
        $has_html = false;
        $extracted_files = [];
        
        // Extract allowed files only
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $filename = $zip->getNameIndex($i);
            $file_ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            
            // Skip directories and non-allowed files
            if (substr($filename, -1) === '/' || !in_array($file_ext, $allowed_extensions)) {
                continue;
            }
            
            // Extract file
            $file_content = $zip->getFromIndex($i);
            $safe_filename = basename($filename);
            
            if ($file_content !== false) {
                file_put_contents($extract_path . '/' . $safe_filename, $file_content);
                $extracted_files[] = $safe_filename;
                
                if ($file_ext === 'html' || $file_ext === 'htm') {
                    $has_html = true;
                }
            }
        }
        
        $zip->close();
        
        if ($has_html) {
            $result['success'] = true;
            $result['message'] = count($extracted_files) . " files extracted successfully.";
        } else {
            // Clean up if no HTML file found
            array_map('unlink', glob("$extract_path/*"));
            rmdir($extract_path);
            $result['message'] = "ZIP file must contain at least one HTML file.";
        }
    } else {
        $result['message'] = "Failed to open ZIP file.";
    }
    
    return $result;
}

// Generate custom URL from filename
function generateCustomUrl($filename) {
    $name = pathinfo($filename, PATHINFO_FILENAME);
    $name = preg_replace('/[^a-z0-9]/', '-', strtolower($name));
    $name = preg_replace('/-+/', '-', $name);
    $name = trim($name, '-');
    return $name ?: 'my-site';
}

// Clean custom URL
function cleanCustomUrl($url) {
    $url = preg_replace('/[^a-z0-9-]/', '', strtolower($url));
    $url = preg_replace('/-+/', '-', $url);
    $url = trim($url, '-');
    return $url ?: 'my-site';
}

// Get website full URL
function getWebsiteUrl($path) {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $base_url = $protocol . '://' . $host . dirname($_SERVER['PHP_SELF']);
    return rtrim($base_url, '/') . '/view.php?site=' . $path;
}

// Get list of uploaded sites
$uploaded_sites = [];
$total_size = 0;

if (is_dir('sites')) {
    $files = scandir('sites');
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            $file_path = 'sites/' . $file;
            
            if (is_dir($file_path)) {
                // Handle directory (ZIP extracted sites)
                $html_files = glob($file_path . '/*.{html,htm}', GLOB_BRACE);
                if (!empty($html_files)) {
                    $main_file = basename($html_files[0]);
                    $site_name = $file;
                    
                    $uploaded_sites[] = [
                        'name' => $site_name,
                        'filename' => $file,
                        'url' => getWebsiteUrl($site_name),
                        'time' => filemtime($file_path),
                        'size' => getDirectorySize($file_path),
                        'type' => 'zip',
                        'is_dir' => true
                    ];
                    
                    $total_size += getDirectorySize($file_path);
                }
            } else {
                // Handle single files
                $file_ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                
                // Only show allowed file types
                if (in_array($file_ext, ['html', 'htm', 'css', 'js'])) {
                    $site_name = pathinfo($file, PATHINFO_FILENAME);
                    
                    $uploaded_sites[] = [
                        'name' => $site_name,
                        'filename' => $file,
                        'url' => getWebsiteUrl($site_name),
                        'time' => filemtime($file_path),
                        'size' => filesize($file_path),
                        'type' => $file_ext,
                        'is_dir' => false
                    ];
                    
                    $total_size += filesize($file_path);
                }
            }
        }
    }
    
    // Sort by newest first
    usort($uploaded_sites, function($a, $b) {
        return $b['time'] - $a['time'];
    });
}

// Get directory size recursively
function getDirectorySize($path) {
    $total_size = 0;
    $files = scandir($path);
    
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            $file_path = $path . '/' . $file;
            if (is_file($file_path)) {
                $total_size += filesize($file_path);
            } elseif (is_dir($file_path)) {
                $total_size += getDirectorySize($file_path);
            }
        }
    }
    
    return $total_size;
}

// Convert bytes to human readable format
function formatSize($bytes) {
    if ($bytes == 0) return '0 B';
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    return round($bytes, 2) . ' ' . $units[$pow];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FREE WEB HOSTING</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 15px;
        }
        
        .container {
            max-width: 1100px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            color: #4361ee;
            font-size: 2rem;
            margin-bottom: 8px;
        }
        
        .header p {
            color: #666;
            font-size: 1rem;
        }
        
        .domain-example {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 6px;
            margin: 10px 0;
            font-family: monospace;
            color: #4361ee;
            font-weight: bold;
            font-size: 0.9rem;
        }
        
        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
            }
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .card-title {
            font-size: 1.2rem;
            color: #4361ee;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 6px;
            font-weight: bold;
            color: #333;
            font-size: 0.9rem;
        }
        
        input, textarea, select {
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 0.9rem;
        }
        
        input:focus, textarea:focus {
            outline: none;
            border-color: #4361ee;
        }
        
                textarea {
            min-height: 200px;
            font-family: monospace;
            resize: vertical;
            font-size: 0.85rem;
        }
        
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 10px 16px;
            background: #4361ee;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
        }
        
        .btn:hover {
            background: #3a0ca3;
        }
        
        .btn-block {
            width: 100%;
            padding: 12px;
        }
        
        .btn-success {
            background: #4ade80;
        }
        
        .btn-success:hover {
            background: #22c55e;
        }
        
        .btn-warning {
            background: #f59e0b;
        }
        
        .btn-warning:hover {
            background: #d97706;
        }
        
        .url-preview {
            background: #f8f9fa;
            border: 2px dashed #4361ee;
            border-radius: 6px;
            padding: 8px;
            margin: 8px 0;
            font-family: monospace;
            color: #4361ee;
            font-weight: bold;
            text-align: center;
            font-size: 0.8rem;
        }
        
        .site-list {
            max-height: 400px;
            overflow-y: auto;
        }
        
        .site-item {
            display: flex;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid #eee;
        }
        
        .site-item:hover {
            background: #f8f9ff;
        }
        
        .site-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1rem;
            margin-right: 12px;
        }
        
        .html-file { background: #e34c26; }
        .css-file { background: #264de4; }
        .js-file { background: #f7df1e; color: #000; }
        .zip-file { background: #6c757d; }
        
        .site-details {
            flex: 1;
            min-width: 0;
        }
        
        .site-name {
            font-weight: bold;
            color: #333;
            margin-bottom: 4px;
            word-break: break-all;
            font-size: 0.9rem;
        }
        
        .site-url {
            color: #666;
            font-size: 0.75rem;
            word-break: break-all;
            margin-bottom: 4px;
        }
        
        .site-meta {
            color: #888;
            font-size: 0.75rem;
            display: flex;
            gap: 12px;
        }
        
        .site-actions {
            display: flex;
            gap: 6px;
        }
        
        .message {
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        footer {
            text-align: center;
            color: white;
            margin-top: 30px;
            padding: 15px;
        }
        
        .tabs {
            display: flex;
            margin-bottom: 15px;
            border-bottom: 2px solid #eee;
        }
        
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            transition: all 0.2s;
            color: #666;
            font-size: 0.9rem;
        }
        
        .tab.active {
            border-bottom: 3px solid #4361ee;
            color: #4361ee;
            font-weight: bold;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .file-input {
            padding: 20px;
            border: 2px dashed #ddd;
            border-radius: 6px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 12px;
        }
        
        .file-input:hover {
            border-color: #4361ee;
            background: #f8f9ff;
        }
        
        .file-input i {
            font-size: 2.5rem;
            color: #666;
            margin-bottom: 8px;
        }
        
        .url-box {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 6px;
            padding: 12px;
            margin: 12px 0;
            word-break: break-all;
        }
        
        .url-box a {
            color: #4361ee;
            text-decoration: none;
            font-weight: bold;
        }
        
        .url-box a:hover {
            text-decoration: underline;
        }
        
        .copy-btn {
            background: #6c757d;
        }
        
        .copy-btn:hover {
            background: #5a6268;
        }
        
        .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 15px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #4361ee, #3a0ca3);
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 4px;
        }
        
        .stat-label {
            font-size: 0.8rem;
            opacity: 0.9;
        }
        
        .notification {
            position: fixed;
            top: 15px;
            right: 15px;
            background: #4ade80;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            transform: translateX(150%);
            transition: transform 0.3s ease;
            z-index: 1000;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .file-type-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.65rem;
            font-weight: bold;
            color: white;
            margin-right: 6px;
        }
        
        .supported-files {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin: 8px 0;
            flex-wrap: wrap;
        }
        
        .file-type {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            background: #f8f9fa;
            border-radius: 15px;
            font-size: 0.75rem;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="notification" id="notification">✅ URL COPIED TO CLIPBOARD!</div>

    <div class="container">
        <div class="header">
            <h1>🌐 FREE WEB HOSTING</h1>
            <p>HOST YOUR HTML, CSS, and JAVASCRIPT FILES WITH CUSTOM URLS!</p>
            
            <div class="supported-files">
                <div class="file-type">
                    <i class="fas fa-file-code" style="color: #e34c26;"></i>
                    HTML
                </div>
                <div class="file-type">
                    <i class="fab fa-css3-alt" style="color: #264de4;"></i>
                    CSS
                </div>
                <div class="file-type">
                    <i class="fab fa-js-square" style="color: #f7df1e;"></i>
                    JAVASCRIPT 
                </div>
                <div class="file-type">
                    <i class="fas fa-file-archive" style="color: #6c757d;"></i>
                    ZIP
                </div>
            </div>
            
            <div class="domain-example" id="domain-example">
                https://<?php echo $_SERVER['HTTP_HOST']; ?>/view.php?site=your-site-name
            </div>
        </div>

        <?php if (isset($_SESSION['success'])): ?>
            <div class="message success">
                <div style="margin-bottom: 12px;">
                    ✅ <?php echo $_SESSION['success']; ?>
                </div>
                <?php if (isset($_SESSION['file_url'])): ?>
                    <div class="url-box">
                        <strong>YOUR WEBSITE URL:</strong><br>
                        <a href="<?php echo $_SESSION['file_url']; ?>" target="_blank" id="success-url">
                            <?php echo $_SESSION['file_url']; ?>
                        </a>
                        <button onclick="copyToClipboard('<?php echo $_SESSION['file_url']; ?>')" class="btn copy-btn" style="width: 100%; margin-top: 8px;">
                            <i class="fas fa-copy"></i> COPY URL
                        </button>
                    </div>
                <?php endif; ?>
                <?php 
                unset($_SESSION['success']); 
                unset($_SESSION['file_url']);
                unset($_SESSION['file_name']);
                unset($_SESSION['error']);
                ?>
            </div>
        <?php endif; ?>

        <?php if (isset($_SESSION['error'])): ?>
            <div class="message error">
                ❌ <?php echo $_SESSION['error']; ?>
                <?php 
                unset($_SESSION['error']);
                unset($_SESSION['success']);
                unset($_SESSION['file_url']);
                ?>
            </div>
        <?php endif; ?>

        <div class="main-content">
            <!-- Left Column - Upload -->
            <div>
                <div class="card">
                    <h2 class="card-title"><i class="fas fa-upload"></i> Upload Files</h2>
                    
                    <div class="tabs">
                        <div class="tab active" onclick="switchTab('single-tab')">📄 UPLOAD FILE</div>
                        <div class="tab" onclick="switchTab('code-tab')">📝 CODE EDITOR</div>
                    </div>
                    
                    <!-- Single File Upload Tab -->
                    <div class="tab-content active" id="single-tab">
                        <form method="POST" enctype="multipart/form-data" id="upload-form">
                            <div class="form-group">
                                <label>WEBSITE NAME</label>
                                <input type="text" name="custom_url" placeholder="my-awesome-site" id="single-url" required>
                                <div class="url-preview" id="single-preview">
                                    https://<?php echo $_SERVER['HTTP_HOST']; ?>/view.php?site=<span id="single-preview-url">my-awesome-site</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>UPLOAD FILE</label>
                                <div class="file-input" onclick="document.getElementById('html_file').click()">
                                    <i class="fas fa-file-upload"></i>
                                    <p>CLICK TO UPLOAD FILE</p>
                                    <small>. HTML, . CSS, .JS, . ZIP FILES ALLOWED</small>
                                </div>
                                <input type="file" id="html_file" name="html_file" accept=".html,.htm,.css,.js,.zip" style="display: none;" required>
                                <div id="file-name" style="margin-top: 8px; color: #666; font-size: 0.8rem;"></div>
                            </div>
                            <button type="submit" class="btn btn-block">
                                <i class="fas fa-cloud-upload-alt"></i> Upload & Host
                            </button>
                        </form>
                    </div>
                    
                    <!-- Code Editor Tab -->
                    <div class="tab-content" id="code-tab">
                        <form method="POST">
                            <div class="form-group">
                                <label>WEBSITE NAME</label>
                                <input type="text" name="code_custom_url" placeholder="my-website" id="code-url" required>
                                <div class="url-preview" id="code-preview">
                                    https://<?php echo $_SERVER['HTTP_HOST']; ?>/view.php?site=<span id="code-preview-url">my-website</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>HTML CODE</label>
                                <textarea name="html_code" placeholder="Paste your HTML code here..." required><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-align: center;
        }
        .container {
            max-width: 800px;
            margin: 50px auto;
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 15px;
        }
        h1 {
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Welcome to My Website!</h1>
        <p>This website is hosted for free!</p>
    </div>
</body>
</html></textarea>
                            </div>
                            <button type="submit" class="btn btn-block">
                                <i class="fas fa-code"></i> CREATE WEBSITE 
                            </button>
                        </form>
                    </div>
                </div>

                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-number"><?php echo count($uploaded_sites); ?></div>
                        <div class="stat-label">SITES HOSTED</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number"><?php echo formatSize($total_size); ?></div>
                        <div class="stat-label">TOTAL SIZE</div>
                    </div>
                </div>
            </div>

            <!-- Right Column - Sites List -->
            <div>
                <div class="card">
                    <h2 class="card-title"><i class="fas fa-globe"></i> YOUR SITES</h2>
                    
                    <div class="site-list">
                        <?php if (!empty($uploaded_sites)): ?>
                            <?php foreach($uploaded_sites as $site): ?>
                                <?php 
                                $file_type = $site['type'];
                                $icon_class = 'html-file';
                                if ($file_type === 'css') $icon_class = 'css-file';
                                elseif ($file_type === 'js') $icon_class = 'js-file';
                                elseif ($file_type === 'zip') $icon_class = 'zip-file';
                                ?>
                                <div class="site-item">
                                    <div class="site-icon <?php echo $icon_class; ?>">
                                        <i class="fas fa-file-<?php 
                                            echo $file_type === 'html' || $file_type === 'htm' ? 'code' : 
                                                 ($file_type === 'css' ? 'css3-alt' : 
                                                 ($file_type === 'js' ? 'js' : 'archive')); ?>">
                                        </i>
                                    </div>
                                    <div class="site-details">
                                        <div class="site-name">
                                            <span class="file-type-badge <?php echo $icon_class; ?>">
                                                <?php echo strtoupper($file_type); ?>
                                            </span>
                                            <?php echo $site['name']; ?>
                                            <?php if ($site['is_dir']): ?>
                                                <span style="color: #6c757d; font-size: 0.7rem;">(MULTIPLE FILES)</span>
                                            <?php endif; ?>
                                        </div>
                                        <div class="site-url"><?php echo $site['url']; ?></div>
                                        <div class="site-meta">
                                            <span><?php echo formatSize($site['size']); ?></span>
                                            <span><?php echo date('M j, Y', $site['time']); ?></span>
                                        </div>
                                    </div>
                                    <div class="site-actions">
                                        <a href="<?php echo $site['url']; ?>" target="_blank" class="btn btn-success">
                                            <i class="fas fa-eye"></i> View
                                        </a>
                                        <button onclick="copyToClipboard('<?php echo $site['url']; ?>')" class="btn copy-btn">
                                            <i class="fas fa-copy"></i> Copy
                                        </button>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <div style="text-align: center; padding: 30px; color: #666;">
                                <i class="fas fa-inbox" style="font-size: 2.5rem; margin-bottom: 10px; opacity: 0.5;"></i>
                                <h3>NO SITES HOSTED YET</h3>
                                <p>UPLOAD YOUR FIRST FILE TO GET STARTED!</p>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>

        <footer>
            <p style="font-size: 0.9rem;">DEVELOPED BY <strong style="color: #4cc9f0;">OLD-STUDIO</strong></p>
        </footer>
    </div>

    <script>
        // Tab switching
        function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');
        }

        // URL preview update
        function updateUrlPreview(inputId, previewId) {
            const input = document.getElementById(inputId);
            const preview = document.getElementById(previewId);
            
            input.addEventListener('input', function() {
                let url = this.value.trim().toLowerCase();
                url = url.replace(/[^a-z0-9-]/g, '-');
                url = url.replace(/-+/g, '-');
                url = url.replace(/^-|-$/g, '');
                
                if (url === '') {
                    url = 'my-site';
                }
                
                preview.textContent = url;
            });
        }

        // Initialize URL previews
        updateUrlPreview('single-url', 'single-preview-url');
        updateUrlPreview('code-url', 'code-preview-url');

        // File input display
        document.getElementById('html_file').addEventListener('change', function(e) {
            const fileName = document.getElementById('file-name');
            if (this.files.length > 0) {
                const file = this.files[0];
                const fileExt = file.name.split('.').pop().toLowerCase();
                const allowedExt = ['html', 'htm', 'css', 'js', 'zip'];
                
                if (!allowedExt.includes(fileExt)) {
                    fileName.innerHTML = '<span style="color: #dc2626;">❌ ONLY HTML, CSS, JS, ZIP FILES ALLOWED</span>';
                    this.value = '';
                    return;
                }
                
                fileName.innerHTML = '<i class="fas fa-file"></i> Selected: ' + file.name;
                fileName.style.color = '#4361ee';
                
                // Auto-fill URL from filename
                const filename = file.name.replace(/\.[^/.]+$/, "");
                document.getElementById('single-url').value = filename.toLowerCase().replace(/[^a-z0-9]/g, '-');
                document.getElementById('single-preview-url').textContent = filename.toLowerCase().replace(/[^a-z0-9]/g, '-');
            } else {
                fileName.innerHTML = '';
            }
        });

        // Copy to clipboard function
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('✅ URL COPIED TO CLIPBOARD!');
            }).catch(err => {
                showNotification('❌ FAILED TO COPY URL');
            });
        }

        // Show notification
        function showNotification(message) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 2000);
        }

        // Form validation
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                const urlInput = this.querySelector('input[type="text"]');
                if (urlInput) {
                    let url = urlInput.value.trim().toLowerCase();
                    url = url.replace(/[^a-z0-9-]/g, '-');
                    url = url.replace(/-+/g, '-');
                    url = url.replace(/^-|-$/g, '');
                    urlInput.value = url || 'my-site';
                }
            });
        });
    </script>
</body>
</html>
