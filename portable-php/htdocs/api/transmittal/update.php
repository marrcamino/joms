<?php
require_once __DIR__ . '/../helpers.php';

$fields  = ["office_fk", "start_date", 'end_date', 'funding_charge', 'remarks'];


try {
  $db = getDatabase();

  $input = json_decode(file_get_contents('php://input'), true);

  if (is_missing($_GET, 'transmittal_pk')) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing transmittal_pk'
    ]);
    exit;
  }

  $stmt = buildPatchStatement($db, 'transmittal', $input, $_GET['transmittal_pk']);
  $stmt->execute();

  if ($stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode([
      'status' => 'error',
      'message' => 'Transmittal not found or no changes made'
    ]);
    exit;
  }

  echo json_encode([
    'success' => true,
  ]);
} catch (PDOException $e) {
  error_log('PDO ERROR: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'error' => 'Failed to update office: ' . $e->getMessage()
  ]);
}
