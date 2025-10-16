<?php
// Database connection
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
  exit;
}

// Get the raw input and decode JSON
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!$input || empty($input['fname']) || empty($input['lname']) || empty($input['sex']) || empty($input['birthday'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing required fields']);
  exit;
}

try {
  // Prepare insert statement
  $stmt = $db->prepare("
        INSERT INTO employee (
            firstname, lastname, middlename, extension,
            sex, birthday, address, email
        ) VALUES (
            :firstname, :lastname, :middlename, :extension,
            :sex, :birthday, :address, :email
        )
    ");

  // Bind parameters
  $stmt->bindValue(':firstname', trim($input['fname']));
  $stmt->bindValue(':lastname', trim($input['lname']));
  $stmt->bindValue(':middlename', nullable($input['mname']));
  $stmt->bindValue(':extension', nullable($input['extension']));
  $stmt->bindValue(':sex', (int)$input['sex']);
  $stmt->bindValue(':birthday', trim($input['birthday']));
  $stmt->bindValue(':address',  nullable($input['address']));
  $stmt->bindValue(':email', nullable($input['email']));

  $stmt->execute();

  echo json_encode([
    'success' => true,
    'message' => 'Employee added successfully',
    'employee_pk' => $db->lastInsertId()
  ]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Failed to insert employee: ' . $e->getMessage()]);
}
