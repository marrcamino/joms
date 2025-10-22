<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  // Validate employee_id
  if (!isset($_GET['contract_pk']) || empty($_GET['contract_pk'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing contract_pk']);
    exit;
  }

  $contractId = $_GET['contract_pk'];

  // Delete contract records for the employee
  $stmt = $db->prepare('DELETE FROM contract WHERE contract_pk = ?');
  $stmt->execute([$contractId]);

  http_response_code(200);
  echo json_encode(['status' => 'success', 'message' => 'Contract deleted successfully']);
} catch (PDOException $e) {
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Failed to delete contract: ' . $e->getMessage()]);
}
