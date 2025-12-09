<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  // Validate search query
  if (!isset($_GET['q']) || trim($_GET['q']) === '') {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing search query'
    ]);
    exit;
  }

  $query = '%' . trim($_GET['q']) . '%';

  $stmt = $db->prepare("
    SELECT *
    FROM employee
    WHERE firstname LIKE :q
       OR lastname LIKE :q
       OR middlename LIKE :q
       OR extension LIKE :q
    ORDER BY lastname, firstname
  ");

  $stmt->execute(['q' => $query]);
  $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

  http_response_code(200);
  echo json_encode([
    'status' => 'success',
    'data' => $employees
  ]);
} catch (PDOException $e) {
  error_log('PDO ERROR: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => 'Failed to search employees'
  ]);
}
