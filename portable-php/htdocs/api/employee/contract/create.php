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

  $stmt = $db->prepare("
      INSERT INTO contract (
        employee_fk, start_date, end_date, designation, rate, office_fk, position_category_fk, is_active
      ) VALUES (
        :employee_fk, :start_date, :end_date, :designation, :rate, :office_fk, :position_category_fk, :is_active
      )
  ");

  $input = json_decode(file_get_contents('php://input'), true);

  $stmt->bindValue(':employee_fk', $employeeId);
  $stmt->bindValue(':start_date', $input['startDate']);
  $stmt->bindValue(':end_date', $input['endDate']);
  $stmt->bindValue(':designation', $input['designation']);
  $stmt->bindValue(':rate', $input['rate']);
  $stmt->bindValue(':office_fk', $input['officePk']);
  $stmt->bindValue(':position_category_fk', $input['positionCategoryFk']);
  $stmt->bindValue(':is_active', $input['isActive']);

  $stmt->execute();

  $contractPk = (int)$db->lastInsertId();

  echo json_encode([
    'success' => true,
    'contract_pk' => $contractPk,
  ]);
} catch (PDOException $e) {
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Failed to insert contract: ' . $e->getMessage()]);
}
