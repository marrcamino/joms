<?php
require_once __DIR__ . '/../../helpers.php';

// THIS ROUTE USES GET METHOD
try {
  $db = getDatabase();

  if (is_missing($_GET, 'employee_pk')) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing employee_pk']);
    exit;
  }

  $employeeId = $_GET['employee_pk'];

  $stmt = $db->prepare("SELECT * FROM contract WHERE employee_fk = :employee_fk AND end_date IS NULL");
  $stmt->execute(["employee_fk" =>   $employeeId]);

  echo json_encode([
    "message" => null,
    "data" => $stmt->fetch(PDO::FETCH_ASSOC)
  ]);
} catch (PDOException $e) {
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
