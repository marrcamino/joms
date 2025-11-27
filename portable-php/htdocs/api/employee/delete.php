<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  // Validate employee_id
  if (!isset($_GET['employee_pk']) || empty($_GET['employee_pk'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing employee_pk']);
    exit;
  }

  $contractId = $_GET['employee_pk'];

  // Delete contract records for the employee
  $stmt = $db->prepare('DELETE FROM employee WHERE employee_pk = ?');
  $stmt->execute([$contractId]);

  http_response_code(200);
  echo json_encode(['status' => 'success', 'message' => 'Employee deleted successfully']);
} catch (PDOException $e) {
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Failed to delete employee: ' . $e->getMessage()]);
}
