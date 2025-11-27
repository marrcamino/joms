<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  // Validate contract_pk
  if (!isset($_GET['employee_pk']) || empty($_GET['employee_pk'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing employee_pk']);
    exit;
  }

  $employeePk = (int)$_GET['employee_pk'];

  // Read JSON body
  $input = json_decode(file_get_contents('php://input'), true);
  if (!$input) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON body']);
    exit;
  }

  // Prepare update
  $stmt = $db->prepare("
    UPDATE employee
    SET
      lastname = :lname,
      firstname = :fname,
      middlename = :mname,
      extension = :extension,
      sex = :sex,
      birthday = :birthday,
      email = :email,
      address = :address
    WHERE employee_pk = :employee_pk
  ");


  $stmt->bindValue(':lname', $input['lname']);
  $stmt->bindValue(':fname', $input['fname']);
  $stmt->bindValue(':mname', $input['mname']);
  $stmt->bindValue(':extension', $input['extension']);
  $stmt->bindValue(':sex', $input['sex']);
  $stmt->bindValue(':birthday', $input['birthday']);
  $stmt->bindValue(':email', $input['email']);
  $stmt->bindValue(':address', $input['address']);
  $stmt->bindValue(':employee_pk', $employeePk, PDO::PARAM_INT);

  $stmt->execute();

  echo json_encode([
    'success' => true,
    'message' => 'Employee updated successfully',
  ]);
} catch (PDOException $e) {
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Failed to update employee: ' . $e->getMessage()]);
}
