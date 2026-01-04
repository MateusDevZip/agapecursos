<?php
header('Content-Type: application/json');
require_once 'config.php';

// Receber dados do pagamento
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados inválidos']);
    exit;
}

// 1. Validar User ID
$userId = $input['user_id'] ?? null;
if (!$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID is required']);
    exit;
}

// 2. Buscar dados do cliente no Supabase (Opcional: se o frontend não mandar tudo)
// Para simplificar, vamos assumir que o frontend manda o necessário ou que buscamos apenas o básico se precisar
// Mas o ideal é criar o cliente no Asaas com dados completos (CPF, Nome, Email)

$customerData = [
    'name' => $input['customer']['name'],
    'cpfCnpj' => $input['customer']['cpf'],
    'email' => $input['customer']['email'],
    'mobilePhone' => $input['customer']['phone']
];

// 3. Verificar se cliente já existe no Asaas (por CPF ou Email)
// GET /customers?cpfCnpj=...
$existingCustomer = asaasRequest('customers?cpfCnpj=' . $customerData['cpfCnpj']);

if (isset($existingCustomer['data']['data'][0]['id'])) {
    $customerId = $existingCustomer['data']['data'][0]['id'];
    // Opcional: Atualizar dados do cliente se mudou
} else {
    // Criar novo cliente
    $newCustomer = asaasRequest('customers', 'POST', $customerData);
    if (!isset($newCustomer['data']['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Erro ao criar cliente no Asaas', 'details' => $newCustomer['data']]);
        exit;
    }
    $customerId = $newCustomer['data']['id'];
}

// 4. Configurar Pagamento
$billingType = 'UNDEFINED';
switch ($input['payment_method']) {
    case 'pay_pix':
        $billingType = 'PIX';
        break;
    case 'pay_boleto':
        $billingType = 'BOLETO';
        break;
    case 'pay_cc':
        $billingType = 'CREDIT_CARD';
        break;
}

$paymentData = [
    'customer' => $customerId,
    'billingType' => $billingType,
    'value' => $input['amount'],
    'dueDate' => date('Y-m-d', strtotime('+3 days')), // Vencimento em 3 dias
    'description' => 'Pedido Curso - ' . ($input['course_id'] == 'combo' ? 'Combo Completo' : 'Curso Individual'),
    'externalReference' => $userId . '_' . time() // Referência para conciliação
];

// Adicionar dados específicos de cartão de crédito se for o caso
if ($billingType === 'CREDIT_CARD') {
    $paymentData['creditCard'] = [
        'holderName' => $input['card']['holder_name'],
        'number' => $input['card']['number'],
        'expiryMonth' => $input['card']['expiry_month'],
        'expiryYear' => $input['card']['expiry_year'],
        'ccv' => $input['card']['ccv']
    ];
    $paymentData['creditCardHolderInfo'] = $customerData;
}

// 5. Criar Cobrança no Asaas
$paymentResponse = asaasRequest('payments', 'POST', $paymentData);

if (!isset($paymentResponse['data']['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Erro ao processar pagamento', 'details' => $paymentResponse['data']]);
    exit;
}

$asaasPayment = $paymentResponse['data'];

// 6. Salvar pedido no Supabase
$orderData = [
    'user_id' => $userId,
    'course_id' => $input['course_id'],
    'amount' => $input['amount'],
    'status' => 'pending', // pending
    'payment_method' => $input['payment_method'],
    'asaas_id' => $asaasPayment['id'],
    'invoice_url' => $asaasPayment['bankSlipUrl'] ?? $asaasPayment['invoiceUrl'] ?? null,
    'created_at' => date('c')
];

// Opcional: Se for PIX, pegar o QR Code Payload
if ($billingType === 'PIX') {
    $pixQrCode = asaasRequest('payments/' . $asaasPayment['id'] . '/pixQrCode');
    if (isset($pixQrCode['data']['payload'])) {
        $orderData['pix_code'] = $pixQrCode['data']['payload']; // Salva o copia e cola se tiver campo no banco
        $asaasPayment['pix_qrcode'] = $pixQrCode['data']; // Manda pro frontend
    }
}

// Inserir na tabela 'orders'
$result = supabaseRequest('orders', 'POST', $orderData);

// Retornar sucesso para o frontend
echo json_encode([
    'message' => 'Pagamento criado com sucesso',
    'payment' => $asaasPayment,
    'order_id' => $result['data'][0]['id'] ?? 'unknown'
]);
?>