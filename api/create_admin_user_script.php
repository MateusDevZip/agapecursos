<?php
require_once 'config.php';

function createAdminUser($email, $password)
{
    $url = SUPABASE_URL . '/auth/v1/admin/users';

    $data = [
        'email' => $email,
        'password' => $password,
        'email_confirm' => true,
        'user_metadata' => [
            'role' => 'admin'
        ]
    ];

    $headers = [
        'apikey: ' . SUPABASE_KEY,
        'Authorization: Bearer ' . SUPABASE_KEY,
        'Content-Type: application/json'
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if (curl_errno($ch)) {
        return ['error' => curl_error($ch)];
    }

    curl_close($ch);

    return [
        'code' => $httpCode,
        'response' => json_decode($response, true)
    ];
}

echo "Criando usuario admin...\n";
$email = 'admin@agape.com';
$password = 'AgapeAdmin2024!'; // Senha forte

$result = createAdminUser($email, $password);

if ($result['code'] === 200 || $result['code'] === 201) {
    echo "SUCESSO: Usuario criado!\n";
    echo "Email: " . $email . "\n";
    echo "Senha: " . $password . "\n";
    echo "ID: " . $result['response']['id'] . "\n";
} else {
    echo "ERRO ao criar usuario:\n";
    print_r($result);
}
?>