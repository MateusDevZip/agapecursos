<?php
// Configuração do Supabase
define('SUPABASE_URL', 'https://wqvwlyezekvahpfnspxz.supabase.co');
define('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxdndseWV6ZWt2YWhwZm5zcHh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ1ODU4NiwiZXhwIjoyMDgyMDM0NTg2fQ.vkdfOmeuexMgGm4zX1O2dugjsYgMpSIfk0eJ_i3H3Ho'); // Service Role Secret
// Asaas API Config
// Para Sandbox (Testes): https://sandbox.asaas.com/api/v3
// Para Produção: https://www.asaas.com/api/v3
define('ASAAS_API_URL', 'https://sandbox.asaas.com/api/v3'); // Altere para produção quando estiver pronto
define('ASAAS_API_KEY', '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjNmOTlmMGJmLTVjNjEtNGY2NC04MWVhLWVkMzliNjk5MTJkODo6JGFhY2hfOTcyNjg2YmEtYmUwYS00ZGQzLWFhNmYtMjZkNjMyOGMyODhk'); // TODO: Substitua pela sua chave de API do Asaas

// Função auxiliar para chamadas na API do Asaas
function asaasRequest($endpoint, $method = 'GET', $data = null)
{
    $url = ASAAS_API_URL . '/' . $endpoint;

    $headers = [
        'Content-Type: application/json',
        'access_token: ' . ASAAS_API_KEY
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'data' => json_decode($response, true)
    ];
}

function supabaseRequest($endpoint, $method = 'GET', $data = null)
{
    $url = SUPABASE_URL . '/rest/v1/' . $endpoint;

    $headers = [
        'apikey: ' . SUPABASE_KEY,
        'Authorization: Bearer ' . SUPABASE_KEY,
        'Content-Type: application/json',
        'Prefer: return=representation' // Retorna os dados inseridos/atualizados
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'data' => json_decode($response, true)
    ];
}
?>