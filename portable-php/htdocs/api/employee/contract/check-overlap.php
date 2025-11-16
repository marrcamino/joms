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
  $input = json_decode(file_get_contents('php://input'), true);

  $startDate =  $input['startDate'];
  $endDate = $input['endDate'];

  $overlaps = getOverlappingContracts($db, $employeeId, $startDate, $endDate);

  if (count($overlaps) > 0) {
    echo json_encode([
      "error" => true,
      "message" => "This contract overlaps with existing contracts.",
      "overlaps" => $overlaps
    ]);
    exit;
  }

  echo json_encode([
    "error" => false,
    "message" => null,
    "overlaps" => $overlaps
  ]);
} catch (PDOException $e) {
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
