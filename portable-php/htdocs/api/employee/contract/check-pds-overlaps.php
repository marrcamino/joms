<?php
require_once __DIR__ . '/../../helpers.php';

// THIS ROUTE USES GET METHOD
// IT ONLY USE FOR CHECKING WHEN THE END DATE IS NULL
try {
  $db = getDatabase();

  if (is_missing($_GET, 'employee_pk')) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing employee_pk']);
    exit;
  }

  if (is_missing($_GET, 'start_date')) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing start_date']);
    exit;
  }

  $employeeId = $_GET['employee_pk'];

  $stmt = $db->prepare("SELECT * FROM contract WHERE employee_fk = :employee_fk AND source_type = 'pds' AND end_date IS NULL");
  $stmt->execute(["employee_fk" => $employeeId]);
  $present = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($present) {

    echo json_encode([
      "type" => 'present',
      "data" =>   $present
    ]);
    exit;
  }

  $stmt = $db->prepare(
    "SELECT * 
    FROM contract
    WHERE employee_fk = :employee_fk
      AND source_type = 'pds'
      AND end_date IS NOT NULL
      AND end_date >= :start_date"
  );

  $stmt->execute(["employee_fk" => $employeeId, "start_date" => $_GET['start_date']]);

  echo json_encode([
    "type" => 'overlaps',
    "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
  ]);
} catch (PDOException $e) {
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
