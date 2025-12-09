<?php
require_once __DIR__ . '/../../helpers.php';


try {
  $db = getDatabase();

  if (is_missing($_GET, 'office_fk')) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing or office_fk'
    ]);
    exit;
  }

  $stmt = $db->prepare("SELECT * FROM transmittal WHERE office_fk = :office_fk");
  $stmt->execute([
    ":office_fk" =>  $_GET['office_fk'],
  ]);

  $transmittals = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode($transmittals);
} catch (Exception $e) {
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
