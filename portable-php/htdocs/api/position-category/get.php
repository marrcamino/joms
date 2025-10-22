<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();
  $stmt = $db->prepare("SELECT * FROM position_category");
  $stmt->execute();

  $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode($categories);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
