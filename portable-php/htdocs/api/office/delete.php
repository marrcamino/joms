<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  // Get office_pk from query string
  if (!isset($_GET['office_pk']) || empty($_GET['office_pk'])) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing office_pk'
    ]);
    exit;
  }

  $officePk = (int)$_GET['office_pk'];
  $stmt1 = $db->prepare("SELECT * FROM contract WHERE office_fk = :office_fk");
  $stmt1->bindValue(':office_fk', $officePk);
  $stmt1->execute();
  $contracts = $stmt1->fetchAll();

  $stmt2 = $db->prepare("DELETE FROM office WHERE office_pk = :office_pk");
  $stmt2->bindValue(':office_pk', $officePk);
  $stmt2->execute();

  // Check if any row was deleted
  if ($stmt2->rowCount() === 0) {
    http_response_code(404);
    echo json_encode([
      'success' => false,
      'contracts' => [],
      'message' => 'Office not found'
    ]);
    exit;
  }

  echo json_encode([
    'success' => true,
    'contracts' => [],
    'deleted_office_pk' => $officePk
  ]);
} catch (PDOException $e) {
  error_log('PDO ERROR: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'error' => 'Failed to delete office: ' . $e->getMessage()
  ]);
}
