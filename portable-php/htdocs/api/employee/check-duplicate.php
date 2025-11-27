<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  $input = json_decode(file_get_contents('php://input'), true);

  $lname = strtolower(trim($input['lastname'] ?? ''));
  $fname = strtolower(trim($input['firstname'] ?? ''));
  $mname = strtolower(trim($input['middlename'] ?? ''));
  $extension = strtolower(trim($input['extension'] ?? ''));

  if (!$lname || !$fname) {
    echo json_encode(['duplicate' => false, 'message' => 'Missing required fields']);
    exit;
  }

  // Step 1: Get all employees with same last name (narrow query)
  $stmt = $db->prepare("SELECT * FROM employee WHERE LOWER(lastname) = LOWER(:lname)");
  $stmt->bindValue(':lname', $lname);
  $stmt->execute();
  $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Step 2: Check for full duplicate in PHP
  $duplicate = false;
  $duplicateEmployee = null;
  foreach ($employees as $e) {
    $sameFirst = strtolower(trim($e['firstname'])) === $fname;
    $sameMiddle = strtolower(trim($e['middlename'] ?? '')) === $mname;
    $sameExt = strtolower(trim($e['extension'] ?? '')) === $extension;

    if ($sameFirst && $sameMiddle && $sameExt) {
      $duplicate = true;
      $duplicateEmployee = $e;
      break;
    }
  }

  echo json_encode([
    'duplicate' => $duplicate,
    'employee' => $duplicateEmployee,
    'message' => $duplicate
      ? 'Employee already exists.'
      : 'No duplicate found.'
  ]);
} catch (Exception $e) {
  echo json_encode(['error' => $e->getMessage()]);
}
