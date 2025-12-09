<?php
require_once __DIR__ . '/../../helpers.php';


try {
  $db = getDatabase();

  // Validate employee_id
  if (!isset($_GET['employee_fk']) || empty($_GET['employee_fk'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing employee_fk']);
    exit;
  }

  $employeeId = $_GET['employee_fk'];

  // Fetch contracts for the employee
  $stmt = $db->prepare("SELECT * FROM contract WHERE employee_fk = :employee_fk ORDER BY created_at DESC");
  $stmt->bindValue(':employee_fk', $employeeId, PDO::PARAM_INT);
  $stmt->execute();
  $contract = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;

  echo json_encode([
    'status' => 'success',
    'data' => $contract
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
