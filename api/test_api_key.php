<?php
/**
 * Simple diagnostic script to check API key format
 */

// Test the API key format
$apiKey = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjQ1Y2Q4OGUzLTdjNmUtNGRiOS1hMTA2LTFkMmNhZjI0ZDMwYzo6JGFhY2hfYzc1MjJhYTgtYTYyZS00MTdjLTk4MzYtNjJkMGI4MjE1N2Zl';

echo "API Key: " . $apiKey . "\n\n";

// Test API call with correct header format
$url = 'https://sandbox.asaas.com/api/v3/myAccount';

$headers = [
    'Content-Type: application/json',
    'access_token: ' . $apiKey
];

echo "Testing with headers:\n";
print_r($headers);
echo "\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "HTTP Code: " . $httpCode . "\n";
echo "Response: " . $response . "\n";
if ($curlError) {
    echo "cURL Error: " . $curlError . "\n";
}
?>