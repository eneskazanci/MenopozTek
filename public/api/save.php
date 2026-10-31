<?php
/**
 * Dr. Abdullah Kesgin - Menopoz Landing Page
 * Hostinger Cross-Device Settings Persistence API
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/data.json';
$rootSettingsFile = dirname(__DIR__) . '/settings.json';

// GET request: return current settings
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($dataFile)) {
        header('Cache-Control: no-cache, no-store, must-revalidate');
        readfile($dataFile);
        exit;
    } elseif (file_exists($rootSettingsFile)) {
        header('Cache-Control: no-cache, no-store, must-revalidate');
        readfile($rootSettingsFile);
        exit;
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Ayar dosyası henüz oluşturulmadı.']);
        exit;
    }
}

// POST request: save updated settings
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    if (!$rawInput) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Boş veri gönderildi']);
        exit;
    }

    $payload = json_decode($rawInput, true);
    if (!$payload || !isset($payload['settings'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Geçersiz JSON formatı']);
        exit;
    }

    $settings = $payload['settings'];
    $settings['updatedAt'] = date('c');

    $jsonData = json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($jsonData === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'JSON kodlama hatası']);
        exit;
    }

    // Try writing to data.json
    $written = @file_put_contents($dataFile, $jsonData, LOCK_EX);
    
    // Also try writing to root settings.json if accessible
    @file_put_contents($rootSettingsFile, $jsonData, LOCK_EX);

    if ($written === false) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Dosya kaydedilemedi. Lütfen sunucunuzda api/ klasörüne yazma izni (chmod 755 veya 775) verildiğinden emin olun.'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Ayarlar başarıyla kaydedildi ve tüm cihazlar için güncellendi.',
        'updatedAt' => $settings['updatedAt']
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
