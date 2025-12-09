<?php
require_once __DIR__ . '/../helpers.php';

try {
  if (is_missing($_GET, 'transmittal_pk')) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing transmittal_pk'
    ]);
    exit;
  }

  $db = getDatabase();
  $transmittalPk = (int)$_GET['transmittal_pk'];
  $stmt = $db->prepare("DELETE FROM transmittal WHERE transmittal_pk = :transmittal_pk");
  $stmt->bindValue(':transmittal_pk', $transmittalPk);
  $stmt->execute();

  if ($stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode([
      'success' => false,
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
    'error' => 'Failed to delete transmittal: ' . $e->getMessage()
  ]);
}
