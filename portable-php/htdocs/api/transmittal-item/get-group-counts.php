<?php
require_once __DIR__ . '/../helpers.php';

try {
  if (is_missing($_GET, 'transmittal_item_pk')) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing transmittal_item_pk'
    ]);
    exit;
  }

  $db = getDatabase();
  $transmittal_item_pk = (int)$_GET['transmittal_item_pk'];

  $stmt = $db->prepare("SELECT transmittal_fk from transmittal_item WHERE transmittal_item_pk = :transmittal_item_pk");
  $stmt->execute([':transmittal_item_pk' =>  $transmittal_item_pk]);
  $transmittal_fk = (int) $stmt->fetchColumn();


  $stmt = $db->prepare("SELECT COUNT(*) FROM transmittal_item WHERE transmittal_fk = :transmittal_fk");
  $stmt->bindValue(':transmittal_fk', $transmittal_fk);
  $stmt->execute();

  $count = (int) $stmt->fetchColumn();

  echo json_encode(['counts' => $count]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
