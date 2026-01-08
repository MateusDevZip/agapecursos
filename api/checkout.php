<?php
require_once 'config.php';

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$userId = $input['user_id'] ?? null;
$courseId = $input['course_id'] ?? null;
$amount = $input['amount'] ?? null;
$paymentMethod = $input['payment_method'] ?? 'PIX'; // PIX or CREDIT_CARD

if (!$userId || !$courseId || !$amount) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// 1. Get User from Supabase to create Customer in Asaas
// We need email and name
$userData = supabaseRequest("users?id=eq.$userId&select=email,raw_user_meta_data");

if (empty($userData['data'])) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

$user = $userData['data'][0];
$email = $user['email'];
$meta = $user['raw_user_meta_data'] ?? [];
$name = $meta['full_name'] ?? 'Aluno Ágape';
$cpf = $meta['cpf'] ?? '11144477735'; // CPF válido para testes (substitua por validação real em produção)
$phone = $meta['phone'] ?? null;

// 2. Customer Management in Asaas
// First, search if customer exists by email
$customerSearch = asaasRequest("customers?email=" . urlencode($email));
$customerId = null;

if (!empty($customerSearch['data']['data'])) {
    $customerId = $customerSearch['data']['data'][0]['id'];
} else {
    // Create new customer
    $customerData = [
        'name' => $name,
        'email' => $email,
        'cpfCnpj' => $cpf
    ];
    if ($phone)
        $customerData['mobilePhone'] = $phone;

    $newCustomer = asaasRequest("customers", "POST", $customerData);

    if (isset($newCustomer['data']['id'])) {
        $customerId = $newCustomer['data']['id'];
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create customer in Asaas', 'details' => $newCustomer]);
        exit;
    }
}

// 3. Create Payment (Cobrança)
$billingType = ($paymentMethod === 'credit_card') ? 'CREDIT_CARD' : 'PIX';

$paymentPayload = [
    'customer' => $customerId,
    'billingType' => $billingType,
    'value' => (float) $amount,
    'dueDate' => date('Y-m-d', strtotime('+2 days')),
    'description' => "Curso Ágape: $courseId",
    'externalReference' => "$userId|$courseId"
];

$payment = asaasRequest("payments", "POST", $paymentPayload);

if (isset($payment['data']['id'])) {
    $paymentId = $payment['data']['id'];
    $response = [
        'payment_id' => $paymentId,
        'invoiceUrl' => $payment['data']['invoiceUrl'],
        'status' => $payment['data']['status']
    ];

    // If PIX, fetch the Payload/QRCode
    if ($billingType === 'PIX') {
        $pixInfo = asaasRequest("payments/$paymentId/pixQrCode");
        if (isset($pixInfo['data']['payload'])) {
            $response['pix_payload'] = $pixInfo['data']['payload'];
            $response['pix_encoded_image'] = $pixInfo['data']['encodedImage'];
        }
    }

    // Save "pending" order in Supabase
    // Table: orders (id, user_id, course_id, payment_id, status, amount, created_at)
    $orderData = [
        'user_id' => $userId,
        // 'course_id' => $courseId, // Assuming you have a column for course_id or details
        'payment_id' => $paymentId,
        'status' => 'pending',
        'amount' => $amount
    ];
    // Note: You need to ensure the 'orders' table exists in Supabase or adjust this part
    // For now, we proceed to return the payment info so the user can pay

    echo json_encode($response);

} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to process payment with Asaas', 'details' => $payment]);
}
?>