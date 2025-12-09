<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  $input = json_decode(file_get_contents('php://input'), true);

  // Validate required fields
  if (
    !isset($input['office_abbr']) || empty($input['office_abbr']) ||
    !isset($input['office_title']) || empty($input['office_title'])
  ) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing required fields'
    ]);
    exit;
  }

  $stmt = $db->prepare("
    INSERT INTO office (
      office_abbr,
      office_title
    ) VALUES (
      :office_abbr,
      :office_title
    )
  ");

  $stmt->bindValue(':office_abbr', $input['office_abbr']);
  $stmt->bindValue(':office_title', $input['office_title']);

  $stmt->execute();

  $officePk = (int)$db->lastInsertId();

  echo json_encode([
    'success' => true,
    'office_pk' => $officePk,
  ]);
} catch (PDOException $e) {
  error_log('PDO ERROR: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'error' => 'Failed to insert office: ' . $e->getMessage()
  ]);
}
