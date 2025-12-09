<?php
require_once __DIR__ . '/../../helpers.php';


try {
  $db = getDatabase();

  if (is_missing($_GET, 'transmittal_fk')) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing or transmittal_fk'
    ]);
    exit;
  }

  $stmt = $db->prepare("SELECT * FROM  transmittal_item WHERE transmittal_fk = :transmittal_fk");
  $stmt->execute([
    ":transmittal_fk" =>  $_GET['transmittal_fk'],
  ]);

  $transmittalItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode($transmittalItems);
} catch (Exception $e) {
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
