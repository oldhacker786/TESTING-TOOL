<?php
// view.php - Serve hosted HTML, CSS, JS files
session_start();

// Get requested site name
$site_name = isset($_GET['site']) ? trim($_GET['site']) : '';

if (empty($site_name)) {
    header("Location: index.php");
    exit;
}

// Security check - prevent directory traversal
if (strpos($site_name, '..') !== false || strpos($site_name, '/') !== false || strpos($site_name, '\\') !== false) {
    http_response_code(403);
    showError("Access forbidden - Invalid site name");
    exit;
}

// Look for the site file with different extensions
$extensions = ['html', 'htm', 'css', 'js'];
$file_path = null;
$is_zip_site = false;

// First check if it's a directory (ZIP extracted site)
$dir_path = 'sites/' . $site_name;
if (is_dir($dir_path)) {
    // Look for HTML files in the directory
    $html_files = glob($dir_path . '/*.{html,htm}', GLOB_BRACE);
    if (!empty($html_files)) {
        $file_path = $html_files[0]; // Use the first HTML file found
        $is_zip_site = true;
    }
} else {
    // Look for single files with different extensions
    foreach ($extensions as $ext) {
        $possible_path = 'sites/' . $site_name . '.' . $ext;
        if (file_exists($possible_path)) {
            $file_path = $possible_path;
            break;
        }
    }
}

// Check if file exists
if (!$file_path || !file_exists($file_path)) {
    http_response_code(404);
    showError("Site not found - '$site_name' doesn't exist or has been removed");
    exit;
}

// Get file extension and set content type
$file_ext = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));
$content_types = [
    'html' => 'text/html; charset=UTF-8',
    'htm' => 'text/html; charset=UTF-8',
    'css' => 'text/css; charset=UTF-8',
    'js' => 'application/javascript; charset=UTF-8'
];

if (isset($content_types[$file_ext])) {
    header('Content-Type: ' . $content_types[$file_ext]);
} else {
    header('Content-Type: text/plain; charset=UTF-8');
}

// Output file content
readfile($file_path);
exit;

function showError($message) {
    echo "<!DOCTYPE html>
    <html>
    <head>
        <title>Error - Old Studio Hosting</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 0;
                padding: 40px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                text-align: center;
            }
            .error-container {
                max-width: 600px;
                margin: 50px auto;
                background: rgba(255,255,255,0.1);
                padding: 40px;
                border-radius: 15px;
                backdrop-filter: blur(10px);
            }
            h1 { 
                color: #ff6b6b;
                margin-bottom: 20px;
            }
            .btn {
                display: inline-block;
                background: #4361ee;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                margin-top: 20px;
                transition: background 0.3s;
            }
            .btn:hover {
                background: #3a0ca3;
            }
        </style>
    </head>
    <body>
        <div class='error-container'>
            <h1>❌ Error</h1>
            <p style='font-size: 1.2rem; line-height: 1.6;'>$message</p>
            <a href='index.php' class='btn'>← Back to Hosting</a>
        </div>
    </body>
    </html>";
}
?>