<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  $input = json_decode(file_get_contents('php://input'), true);

  // Validate required fields
  if (
    is_missing($input['office_pk']) || is_missing($input['office_abbr']) || is_missing($input['office_title'])
  ) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing required fields'
    ]);
    exit;
  }

  $stmt = $db->prepare("
    UPDATE office
    SET
      office_abbr = :office_abbr,
      office_title = :office_title
    WHERE office_pk = :office_pk
  ");

  $stmt->bindValue(':office_abbr', $input['office_abbr']);
  $stmt->bindValue(':office_title', $input['office_title']);
  $stmt->bindValue(':office_pk', (int)$input['office_pk']);

  $stmt->execute();

  // Check if any row was updated
  if ($stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode([
      'status' => 'error',
      'message' => 'Office not found or no changes made'
    ]);
    exit;
  }

  echo json_encode([
    'success' => true,
    'updated_office_pk' => (int)$input['office_pk']
  ]);
} catch (PDOException $e) {
  error_log('PDO ERROR: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'error' => 'Failed to update office: ' . $e->getMessage()
  ]);
}
