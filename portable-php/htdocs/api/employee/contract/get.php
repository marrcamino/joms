<?php
require_once __DIR__ . '/../../helpers.php';


try {
  $db = getDatabase();

  // Validate employee_id
  if (!isset($_GET['employee_id']) || empty($_GET['employee_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing employee_id']);
    exit;
  }

  $employeeId = $_GET['employee_id'];

  // Fetch contracts for the employee
  $stmt = $db->prepare("SELECT * FROM contract WHERE employee_fk = :employee_fk");
  $stmt->bindValue(':employee_fk', $employeeId, PDO::PARAM_INT);
  $stmt->execute();
  $contracts = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([
    'status' => 'success',
    'data' => $contracts
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
