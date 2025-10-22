<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();
  $stmt = $db->prepare("SELECT * FROM office");
  $stmt->execute();

  $offices = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode($offices);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
