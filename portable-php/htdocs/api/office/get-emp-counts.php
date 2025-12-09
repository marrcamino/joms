<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  if (!isset($_GET['office_pk']) || empty($_GET['office_pk'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing office_pk']);
    exit;
  }

  $officePk = $_GET['office_pk'];

  $stmt = $db->prepare("SELECT * FROM employee WHERE is_active = 1 AND office_fk = :office_pk");
  $stmt->bindValue(':office_pk', $officePk, PDO::PARAM_INT);
  $stmt->execute();

  $offices = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([
    'status' => 'success',
    'data' => $offices
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
