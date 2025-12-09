<?php
require_once __DIR__ . '/../helpers.php';


try {
  $db = getDatabase();

  if (is_missing($_GET, 'transmittal_pk')) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing or transmittal_pk'
    ]);
    exit;
  }

  $stmt = $db->prepare("SELECT * FROM v_transmittal_contract_items WHERE transmittal_pk = :transmittal_pk ORDER BY lastname");
  $stmt->execute([
    ":transmittal_pk" =>  $_GET['transmittal_pk'],
  ]);

  $transmittals = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode($transmittals);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
