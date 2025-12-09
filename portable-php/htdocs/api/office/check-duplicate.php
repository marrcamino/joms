<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  $input = json_decode(file_get_contents('php://input'), true);

  $abbr = strtolower(trim($input['office_abbr'] ?? ''));

  if (!$abbr) {
    echo json_encode([
      'duplicate' => false,
      'message' => 'Missing required field: office_abbr'
    ]);
    exit;
  }

  // Step 1: Narrow query (direct exact match on abbrev)
  $stmt = $db->prepare("
    SELECT * 
    FROM office 
    WHERE LOWER(office_abbr) = LOWER(:abbr)
    LIMIT 1
  ");
  $stmt->bindValue(':abbr', $abbr);
  $stmt->execute();

  $office = $stmt->fetch(PDO::FETCH_ASSOC);

  // Step 2: Determine result
  $duplicate = $office ? true : false;

  echo json_encode([
    'duplicate' => $duplicate,
    'office' => $office,
    'message' => $duplicate
      ? 'Office abbreviation already exists.'
      : 'No duplicate found.'
  ]);
} catch (Exception $e) {
  echo json_encode(['error' => $e->getMessage()]);
}
