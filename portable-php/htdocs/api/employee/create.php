<?php
// Database connection
require_once __DIR__ . '/../helpers.php';

header('Content-Type: application/json');

try {
  $db = getDatabase();
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
  exit;
}

// Get and decode JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate basic required fields for employee
if (
  !$input ||
  empty($input['fname']) ||
  empty($input['lname'])
) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing required employee fields']);
  exit;
}

// Check if contract data is present
$hasContract = !empty($input['startDate']);

// If startDate exists, other fields become required
if ($hasContract && (empty($input['endDate']) || empty($input['officePk']) || empty($input['designation']))) {
  http_response_code(400);
  echo json_encode(['error' => 'Contract fields are required when startDate is provided']);
  exit;
}

try {
  // Start transaction
  $db->beginTransaction();

  // Insert Employee
  $stmt = $db->prepare("
      INSERT INTO employee (
        firstname, lastname, middlename, extension,
        sex, birthday, address, email, is_active,
        office_fk, designation
      ) VALUES (
        :firstname, :lastname, :middlename, :extension,
        :sex, :birthday, :address, :email, :is_active,
        :office_fk, :designation
      )
  ");

  $isActive = (int)$input['isActive'];

  $stmt->bindValue(':firstname', $input['fname']);
  $stmt->bindValue(':lastname', $input['lname']);
  $stmt->bindValue(':middlename', $input['mname']);
  $stmt->bindValue(':extension', $input['extension']);
  $stmt->bindValue(':sex', $input['sex']);
  $stmt->bindValue(':birthday', $input['birthday']);
  $stmt->bindValue(':address', $input['address']);
  $stmt->bindValue(':email', $input['email']);
  $stmt->bindValue(':is_active', $isActive, PDO::PARAM_INT);
  $stmt->bindValue(':office_fk', $isActive ? (int)$input['officePk'] : null);
  $stmt->bindValue(':designation', $isActive ? $input['designation'] : null);

  $stmt->execute();

  $employeePk = (int)$db->lastInsertId();

  // Insert Contract if provided
  if ($hasContract) {
    $contractStmt = $db->prepare("
        INSERT INTO contract (
          employee_fk, start_date, end_date, designation, rate, office_fk, position_category_fk
        ) VALUES (
          :employee_fk, :start_date, :end_date, :designation, :rate, :office_fk, :position_category_fk
        )
    ");

    $contractStmt->bindValue(':employee_fk', $employeePk, PDO::PARAM_INT);
    $contractStmt->bindValue(':start_date', $input['startDate']);
    $contractStmt->bindValue(':end_date', $input['endDate']);
    $contractStmt->bindValue(':designation', $input['designation']);
    $contractStmt->bindValue(':rate', (int)$input['rate']);
    $contractStmt->bindValue(':office_fk', (int)$input['officePk'], PDO::PARAM_INT);
    $contractStmt->bindValue(':position_category_fk', $input['positionCategoryFk']);

    $contractStmt->execute();
  }

  // Commit both inserts
  $db->commit();

  $employeeStmt = $db->prepare("SELECT * FROM employee WHERE employee_pk = :pk");
  $employeeStmt->bindValue(':pk', $employeePk, PDO::PARAM_INT);
  $employeeStmt->execute();

  $employee = $employeeStmt->fetch(PDO::FETCH_ASSOC);

  echo json_encode([
    'success' => true,
    'hasContract' => $hasContract,
    'employee_pk' => $employeePk,
    'employee' => $employee
  ]);
} catch (PDOException $e) {
  // Rollback if anything failed
  if ($db->inTransaction()) $db->rollBack();
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Failed to insert employee or contract: ' . $e->getMessage()]);
}
