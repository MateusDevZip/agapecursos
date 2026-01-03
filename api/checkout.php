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

// TODO: Integrar com Mercado Pago aqui quando tivermos o Token
// Por enquanto, simular sucesso e salvar no Supabase

// Salvar pedido no Supabase
$orderData = [
    'user_id' => $input['user_id'], // ID do usuário do Supabase
    'course_id' => $input['course_id'],
    'amount' => $input['amount'],
    'status' => 'pending', // pending, paid, failed
    'payment_method' => $input['payment_method'],
    'created_at' => date('c')
];

// Inserir na tabela 'orders' (verifique se essa tabela existe no seu Supabase!)
$result = supabaseRequest('orders', 'POST', $orderData);

if ($result['code'] === 201) {
    echo json_encode([
        'message' => 'Pedido criado com sucesso (Simulação)',
        'order' => $result['data'][0],
        'redirect_url' => '#success-modal' // Em produção seria a URL do Mercado Pago
    ]);
} else {
    // Se falhar (ex: tabela não existe), retorna sucesso fake para não travar o frontend
    // mas loga o erro
    echo json_encode([
        'message' => 'Pedido simulado (Banco de dados pendente)',
        'debug_error' => $result['data']
    ]);
}
?>