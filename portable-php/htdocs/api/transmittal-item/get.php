<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  if (is_missing($_GET, 'transmittal_item_pk')) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing or transmittal_item_pk'
    ]);
    exit;
  }
  $stmt = $db->prepare('SELECT * FROM transmittal_item WHERE transmittal_item_pk = :transmittal_item_pk LIMIT 1');
  $stmt->execute([
    ":transmittal_item_pk" =>  $_GET['transmittal_item_pk'],
  ]);
  $transmittal = $stmt->fetch(PDO::FETCH_ASSOC);

  echo json_encode($transmittal ?? null);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
