<?php
// api/webhook.php
// Recebe notificações do Asaas e atualiza o pedido no Supabase
header('Content-Type: application/json');
require_once 'config.php';

// Pegar o Token de acesso do Webhook que você define no painel do Asaas (opcional para segurança)
// $webhookToken = $_SERVER['HTTP_ASAAS_ACCESS_TOKEN'] ?? '';
// if ($webhookToken !== 'SEU_TOKEN_DE_WEBHOOK_AQUI') { ... }

$inputCB = json_decode(file_get_contents('php://input'), true);

if (!$inputCB || !isset($inputCB['event'])) {
    http_response_code(400);
    exit;
}

$event = $inputCB['event'];
$payment = $inputCB['payment'];

// Mapear status do Asaas para seu status interno
$status = null;

switch ($event) {
    case 'PAYMENT_RECEIVED':
    case 'PAYMENT_CONFIRMED':
        $status = 'paid';
        break;
    case 'PAYMENT_OVERDUE':
        $status = 'failed'; // ou expired
        break;
    case 'PAYMENT_REFUNDED':
        $status = 'refunded';
        break;
}

if ($status) {
    // Atualizar no Supabase
    // Precisamos buscar o pedido pelo asaas_id
    // GET /orders?asaas_id=eq.PAY_ID
    $search = supabaseRequest('orders?asaas_id=eq.' . $payment['id']);

    if (isset($search['data'][0]['id'])) {
        $orderId = $search['data'][0]['id'];

        // Atualizar
        supabaseRequest('orders?id=eq.' . $orderId, 'PATCH', [
            'status' => $status,
            'updated_at' => date('c')
        ]);
    }
}

echo json_encode(['received' => true]);
?>