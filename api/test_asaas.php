<?php
/**
 * Script de Teste da API Asaas
 * Este arquivo testa a conexão com a API do Asaas e verifica se consegue gerar um QR Code Pix
 */

require_once 'config.php';

header('Content-Type: application/json');

echo "=== TESTE DA API ASAAS ===\n\n";

// 1. Testar conexão básica com a API
echo "1. Testando conexão com a API...\n";
$accountInfo = asaasRequest('myAccount');
echo "Status Code: " . $accountInfo['code'] . "\n";
echo "Resposta: " . json_encode($accountInfo['data'], JSON_PRETTY_PRINT) . "\n";

// Show raw response and errors for debugging
if (isset($accountInfo['raw_response'])) {
    echo "Raw Response: " . $accountInfo['raw_response'] . "\n";
}
if (isset($accountInfo['curl_error'])) {
    echo "cURL Error: " . $accountInfo['curl_error'] . "\n";
}
echo "\n";

if ($accountInfo['code'] !== 200) {
    echo "❌ ERRO: Não foi possível conectar à API do Asaas!\n";
    echo "Verifique se a API Key está correta em config.php\n";

    // Additional debugging info
    if (isset($accountInfo['data']['errors'])) {
        echo "\nDetalhes do erro:\n";
        print_r($accountInfo['data']['errors']);
    }
    exit;
}

echo "✅ Conexão com a API estabelecida!\n\n";

// 2. Verificar se há chave Pix cadastrada
echo "2. Verificando chaves Pix cadastradas...\n";
$pixKeys = asaasRequest('pix/addressKeys');
echo "Status Code: " . $pixKeys['code'] . "\n";
echo "Chaves Pix: " . json_encode($pixKeys['data'], JSON_PRETTY_PRINT) . "\n\n";

if (empty($pixKeys['data']['data'])) {
    echo "⚠️ AVISO: Nenhuma chave Pix cadastrada!\n";
    echo "Para gerar QR Codes Pix, você precisa cadastrar uma chave Pix no painel do Asaas.\n";
    echo "Acesse: https://sandbox.asaas.com/pix/addressKeys\n\n";
} else {
    echo "✅ Chave(s) Pix encontrada(s)!\n\n";
}

// 3. Criar um cliente de teste
echo "3. Criando cliente de teste...\n";
$customerData = [
    'name' => 'Cliente Teste',
    'email' => 'teste@agapecursos.com',
    'cpfCnpj' => '11144477735', // CPF válido para testes
    'mobilePhone' => '11987654321'
];

$customer = asaasRequest('customers', 'POST', $customerData);
echo "Status Code: " . $customer['code'] . "\n";
echo "Cliente: " . json_encode($customer['data'], JSON_PRETTY_PRINT) . "\n\n";

if (!isset($customer['data']['id'])) {
    echo "❌ ERRO: Não foi possível criar cliente!\n";
    echo "Detalhes: " . json_encode($customer['data'], JSON_PRETTY_PRINT) . "\n";
    exit;
}

$customerId = $customer['data']['id'];
echo "✅ Cliente criado com ID: $customerId\n\n";

// 4. Criar uma cobrança Pix
echo "4. Criando cobrança Pix...\n";
$paymentData = [
    'customer' => $customerId,
    'billingType' => 'PIX',
    'value' => 10.00,
    'dueDate' => date('Y-m-d', strtotime('+2 days')),
    'description' => 'Teste de cobrança Pix'
];

$payment = asaasRequest('payments', 'POST', $paymentData);
echo "Status Code: " . $payment['code'] . "\n";
echo "Cobrança: " . json_encode($payment['data'], JSON_PRETTY_PRINT) . "\n\n";

if (!isset($payment['data']['id'])) {
    echo "❌ ERRO: Não foi possível criar cobrança!\n";
    echo "Detalhes: " . json_encode($payment['data'], JSON_PRETTY_PRINT) . "\n";
    exit;
}

$paymentId = $payment['data']['id'];
echo "✅ Cobrança criada com ID: $paymentId\n\n";

// 5. Obter QR Code Pix
echo "5. Obtendo QR Code Pix...\n";
$pixQrCode = asaasRequest("payments/$paymentId/pixQrCode");
echo "Status Code: " . $pixQrCode['code'] . "\n";
echo "QR Code: " . json_encode($pixQrCode['data'], JSON_PRETTY_PRINT) . "\n\n";

if (isset($pixQrCode['data']['payload'])) {
    echo "✅ QR Code gerado com sucesso!\n";
    echo "Payload (Pix Copia e Cola): " . $pixQrCode['data']['payload'] . "\n";
    echo "Imagem Base64 disponível: " . (isset($pixQrCode['data']['encodedImage']) ? 'Sim' : 'Não') . "\n\n";

    // Salvar imagem do QR Code para teste
    if (isset($pixQrCode['data']['encodedImage'])) {
        echo "Para visualizar o QR Code, copie o código abaixo e cole em um visualizador Base64:\n";
        echo "data:image/png;base64," . $pixQrCode['data']['encodedImage'] . "\n\n";
    }
} else {
    echo "❌ ERRO: Não foi possível gerar QR Code!\n";
    echo "Possíveis causas:\n";
    echo "- Chave Pix não cadastrada no Asaas\n";
    echo "- Problema com a cobrança criada\n";
    echo "Detalhes: " . json_encode($pixQrCode['data'], JSON_PRETTY_PRINT) . "\n";
}

echo "\n=== FIM DO TESTE ===\n";
?>